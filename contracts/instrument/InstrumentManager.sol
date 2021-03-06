pragma solidity 0.5.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

import "./InstrumentManagerInterface.sol";
import "./InstrumentInterface.sol";
import "../InstrumentConfig.sol";
import "../escrow/InstrumentEscrowInterface.sol";
import "../escrow/IssuanceEscrowInterface.sol";
import "../escrow/EscrowFactoryInterface.sol";
import "../lib/access/WhitelistAccess.sol";
import "../lib/token/IBurnable.sol";
import "../lib/protobuf/InstrumentData.sol";
import "../lib/protobuf/TokenTransfer.sol";
import "../lib/proxy/AdminOnlyUpgradeabilityProxy.sol";
import "../lib/util/Constants.sol";

/**
 * Base instrument manager for instrument v1, v2 and v3.
 */
contract InstrumentManager is InstrumentManagerInterface {
    using SafeERC20 for IERC20;
    using WhitelistAccess for WhitelistAccess.Whitelist;

    /**
     * @dev Common property of issuance.
     */
    struct IssuanceProperty {
        // Address of issuance creator
        address makerAddress;
        // Address of issuance taker
        address takerAddress;
        // Amount of NUTS token deposited in creating this issuance
        uint256 deposit;
        // Address of instrument proxy
        address proxyAddress;
        // Address of Issuance Escrow
        address escrowAddress;
        // Whether the issuance is terminated
        bool terminated;
    }

    // Instrument expiration
    bool internal _active;
    uint256 internal _instrumentTerminationTimestamp;
    uint256 internal _instrumentOverrideTimestamp;

    // Maker whitelist
    WhitelistAccess.Whitelist internal _makerWhitelist;

    // Taker whitelist
    WhitelistAccess.Whitelist internal _takerWhitelist;

    uint256 internal _instrumentId;
    address internal _fspAddress;
    address internal _brokerAddress;
    address internal _instrumentAddress;
    uint256 internal _lastIssuanceId;
    // Amount of NUTS token deposited in creating this Instrument Manager.
    // As instrument deposit might change over time, Instrument Manager should remember the amount
    // of NUTS token deposited.
    uint256 internal _depositAmount;
    InstrumentConfig internal _instrumentConfig;
    // Instrument Escrow is singleton per each Instrument Manager.
    InstrumentEscrowInterface internal _instrumentEscrow;
    // We can derive the list of issuance id as [1, 2, 3, ..., _lastIssuanceId - 1]
    // so we don't need a separate array to store the issuance id list.
    mapping(uint256 => IssuanceProperty) internal _issuanceProperties;

    /**
     * @dev The instrument is deactivated.
     */
    event InstrumentDeactivated(uint256 indexed instrumentId);

    /**
     * @dev A new issuance is created.
     */
    event IssuanceCreated(
        uint256 indexed issuanceId,
        address indexed makerAddress,
        address issuanceProxyAddress,
        address issuanceEscrowAddress
    );

    /**
     * @dev An issuance is terminated.
     */
    event IssuanceTerminated(uint256 indexed issuanceId);

    /**
     * @dev Token is transferred.
     */
    event TokenTransferred(
        uint256 indexed issuanceId,
        Transfer.Type transferType,
        address fromAddress,
        address toAddress,
        address tokenAddress,
        uint256 amount,
        bytes32 action
    );

    /**
     * @param instrumentId ID of the instrument.
     * @param fspAddress Address of FSP that activates this financial instrument.
     * @param instrumentAddress Address of the financial instrument contract.
     * @param instrumentConfigAddress Address of the Instrument Config contract.
     * @param instrumentParameters Custom parameters for the Instrument Manager.
     */
    constructor(
        uint256 instrumentId,
        address fspAddress,
        address instrumentAddress,
        address instrumentConfigAddress,
        bytes memory instrumentParameters
    ) public {
        require(_instrumentAddress == address(0x0), "Already initialized");
        require(fspAddress != address(0x0), "FSP not set");
        require(instrumentAddress != address(0x0), "Instrument not set");
        require(
            instrumentConfigAddress != address(0x0),
            "Instrument config not set"
        );
        require(
            instrumentParameters.length > 0,
            "Instrument parameters not set"
        );

        InstrumentParameters.Data memory parameters = InstrumentParameters
            .decode(instrumentParameters);
        // Termination must be set, otherwise the instrument is auto-terminated.
        require(
            parameters.instrumentTerminationTimestamp != 0,
            "Termination not set"
        );
        // Override can be optional, if not provided the instrument can be deactivated any time.

        _active = true;
        _instrumentTerminationTimestamp = parameters
            .instrumentTerminationTimestamp;
        _instrumentOverrideTimestamp = parameters.instrumentOverrideTimestamp;
        _makerWhitelist.enabled = parameters.supportMakerWhitelist;
        _takerWhitelist.enabled = parameters.supportTakerWhitelist;
        _instrumentConfig = InstrumentConfig(instrumentConfigAddress);

        _instrumentId = instrumentId;
        _fspAddress = fspAddress;
        // If broker address is not provided, default to fsp address.
        _brokerAddress = parameters.brokerAddress == address(0x0)
            ? fspAddress
            : parameters.brokerAddress;
        _instrumentAddress = instrumentAddress;
        // Deposit amount for Instrument activation might change. Need to record the amount deposited.
        _depositAmount = _instrumentConfig.instrumentDeposit();

        // Create Instrument Escrow
        _instrumentEscrow = EscrowFactoryInterface(
            _instrumentConfig.escrowFactoryAddress()
        )
            .createInstrumentEscrow();
    }

    /**
     * @dev Get the Instrument Escrow.
     */
    function getInstrumentEscrowAddress() public view returns (address) {
        return address(_instrumentEscrow);
    }

    /**
     * @dev Get the ID of the last created issuance.
     */
    function getLastIssuanceId() public view returns (uint256) {
        return _lastIssuanceId;
    }

    /**
     * @dev Deactivates the instrument.
     */
    function deactivate() public {
        require(_active, "Instrument deactivated");
        require(
            (now >= _instrumentOverrideTimestamp &&
                msg.sender == _fspAddress) ||
                now >= _instrumentTerminationTimestamp,
            "Cannot deactivate"
        );

        // Return the deposited NUTS token
        if (_depositAmount > 0) {
            // Burn NUTS token from Deposit Escrow
            IBurnable(_instrumentConfig.depositTokenAddress()).burn(
                _depositAmount
            );
        }

        _active = false;
        emit InstrumentDeactivated(_instrumentId);
    }

    /**
     * @dev Updates the maker whitelist. The maker whitelist only affects new issuances.
     * @param makerAddress The maker address to update in whitelist
     * @param allowed Whether this maker is allowed to create new issuance.
     */
    function setMakerWhitelist(address makerAddress, bool allowed) public {
        require(msg.sender == _fspAddress, "Only FSP can whitelist");
        _makerWhitelist.setAllowed(makerAddress, allowed);
    }

    /**
     * @dev Updates the taker whitelist. The taker whitelist only affects new engagement.
     * @param takerAddress The taker address to update in whitelist
     * @param allowed Whether this taker is allowed to engage issuance.
     */
    function setTakerWhitelist(address takerAddress, bool allowed) public {
        require(msg.sender == _fspAddress, "Only FSP can whitelist");
        _takerWhitelist.setAllowed(takerAddress, allowed);
    }

    /**
     * @dev Create a new issuance of the financial instrument
     * @param makerParameters The custom parameters to the newly created issuance
     * @return The id of the newly created issuance.
     */
    function createIssuance(bytes memory makerParameters)
        public
        returns (uint256)
    {
        // Makers can create new issuance if:
        // 1. The instrument is active, i.e. is not deactivated by FSP,
        // 2. And the instrument has not reached its termination timestamp.
        require(
            _active && (now <= _instrumentTerminationTimestamp),
            "Instrument deactivated"
        );
        // Maker is allowed if:
        // 1. Maker whitelist is not enabled;
        // 2. Or maker whitelist is enabled, and this maker is allowed.
        require(_makerWhitelist.isAllowed(msg.sender), "Maker not allowed");

        // Deposit NUTS token
        if (_instrumentConfig.issuanceDeposit() > 0) {
            // Transfers NUTS token from Instrument Escrow to Instrument Manager.
            _instrumentEscrow.withdrawTokenByAdmin(
                msg.sender,
                _instrumentConfig.depositTokenAddress(),
                _instrumentConfig.issuanceDeposit()
            );
        }

        // Get issuance Id
        _lastIssuanceId++;

        // Create Issuance Escrow.
        IssuanceEscrowInterface issuanceEscrow = EscrowFactoryInterface(
            _instrumentConfig.escrowFactoryAddress()
        )
            .createIssuanceEscrow();

        // Create an AdminOnlyUpgradeabilityProxy for the new issuance
        // Current Instrument Manager is the proxy admin for this proxy, and only the current
        // Instrument Manager can call fallback on the proxy.
        AdminOnlyUpgradeabilityProxy issuanceProxy = new AdminOnlyUpgradeabilityProxy(
            _instrumentAddress,
            address(this)
        );

        // Create Issuance Property
        _issuanceProperties[_lastIssuanceId] = IssuanceProperty({
            makerAddress: msg.sender,
            takerAddress: address(0x0),
            deposit: _instrumentConfig.issuanceDeposit(),
            escrowAddress: address(issuanceEscrow),
            proxyAddress: address(issuanceProxy),
            terminated: false
        });

        // Invoke Instrument
        InstrumentInterface instrument = InstrumentInterface(
            address(issuanceProxy)
        );
        instrument.initialize(
            _lastIssuanceId,
            _fspAddress,
            _brokerAddress,
            address(_instrumentEscrow),
            address(issuanceEscrow),
            _instrumentConfig.priceOracleAddress()
        );
        bytes memory transfersData = instrument.createIssuance(
            msg.sender,
            makerParameters
        );
        _postProcessing(
            _lastIssuanceId,
            instrument.isTerminated(),
            transfersData
        );

        emit IssuanceCreated(
            _lastIssuanceId,
            msg.sender,
            address(issuanceProxy),
            address(issuanceEscrow)
        );
    }

    /**
     * @dev A taker engages to the issuance
     * @param issuanceId The id of the issuance
     * @param takerParameters The custom parameters to the new engagement
     */
    function engageIssuance(uint256 issuanceId, bytes memory takerParameters)
        public
    {
        // Taker is allowed if:
        // 1. Taker whitelist is not enabled;
        // 2. Or taker whitelist is enabled, and this taker is allowed.
        require(_takerWhitelist.isAllowed(msg.sender), "Taker not allowed");
        IssuanceProperty storage issuanceProperty = _issuanceProperties[issuanceId];
        require(!issuanceProperty.terminated, "Issuance terminated");
        require(
            issuanceProperty.makerAddress != address(0x0),
            "Issuance not exist"
        );

        issuanceProperty.takerAddress = msg.sender;

        // Invoke Instrument
        InstrumentInterface instrument = InstrumentInterface(
            issuanceProperty.proxyAddress
        );
        bytes memory transfersData = instrument.engageIssuance(
            msg.sender,
            takerParameters
        );
        _postProcessing(issuanceId, instrument.isTerminated(), transfersData);
    }

    /**
     * @dev The caller deposits token from Instrument Escrow into issuance.
     * @param issuanceId The id of the issuance
     * @param tokenAddress The address of the token. The address for ETH is Contants.getEthAddress().
     * @param amount The amount of ERC20 token transfered
     */
    function depositToIssuance(
        uint256 issuanceId,
        address tokenAddress,
        uint256 amount
    ) public {
        IssuanceProperty storage issuanceProperty = _issuanceProperties[issuanceId];
        require(amount > 0, "Amount not set");
        require(
            issuanceProperty.makerAddress != address(0x0),
            "Issuance not exist"
        );
        require(!issuanceProperty.terminated, "Issuance terminated");

        Transfer.Data memory transfer = Transfer.Data({
            transferType: Transfer.Type.Inbound,
            fromAddress: msg.sender,
            toAddress: msg.sender,
            tokenAddress: tokenAddress,
            amount: amount,
            action: 'Deposit to Issuance'
        });
        _processTransfer(issuanceId, transfer);

        // Invoke Instrument
        InstrumentInterface instrument = InstrumentInterface(
            issuanceProperty.proxyAddress
        );
        bytes memory transfersData = instrument.processTokenDeposit(
            msg.sender,
            tokenAddress,
            amount
        );

        _postProcessing(issuanceId, instrument.isTerminated(), transfersData);
    }

    /**
     * @dev The caller withdraws tokens from Issuance Escrow to Instrument Escrow.
     * @param issuanceId The id of the issuance
     * @param tokenAddress The address of the token. The address for ETH is Contants.getEthAddress().
     * @param amount The amount of ERC20 token transfered
     */
    function withdrawFromIssuance(
        uint256 issuanceId,
        address tokenAddress,
        uint256 amount
    ) public {
        IssuanceProperty storage issuanceProperty = _issuanceProperties[issuanceId];
        require(amount > 0, "Amount not set");
        require(
            issuanceProperty.makerAddress != address(0x0),
            "Issuance not exist"
        );
        require(!issuanceProperty.terminated, "Issuance terminated");

        Transfer.Data memory transfer = Transfer.Data({
            transferType: Transfer.Type.Outbound,
            fromAddress: msg.sender,
            toAddress: msg.sender,
            tokenAddress: tokenAddress,
            amount: amount,
            action: "Withdraw from Issuance"
        });
        _processTransfer(issuanceId, transfer);

        // Invoke Instrument
        InstrumentInterface instrument = InstrumentInterface(
            issuanceProperty.proxyAddress
        );
        bytes memory transfersData = instrument.processTokenWithdraw(
            msg.sender,
            tokenAddress,
            amount
        );
        _postProcessing(issuanceId, instrument.isTerminated(), transfersData);
    }

    /**
     * @dev Notify custom events to issuance. This could be invoked by any caller.
     * @param issuanceId The id of the issuance
     * @param eventName Name of the custom event
     * @param eventPayload Payload of the custom event
     */
    function notifyCustomEvent(
        uint256 issuanceId,
        bytes32 eventName,
        bytes memory eventPayload
    ) public {
        IssuanceProperty storage issuanceProperty = _issuanceProperties[issuanceId];
        require(
            issuanceProperty.makerAddress != address(0x0),
            "Issuance not exist"
        );
        require(!issuanceProperty.terminated, "Issuance terminated");

        // Invoke Instrument
        InstrumentInterface instrument = InstrumentInterface(
            issuanceProperty.proxyAddress
        );
        bytes memory transfersData = instrument.processCustomEvent(
            msg.sender,
            eventName,
            eventPayload
        );
        _postProcessing(issuanceId, instrument.isTerminated(), transfersData);
    }

    /**
     * @dev Get custom datas from issuance. This could be invoked by any caller.
     * @param issuanceId The id of the issuance
     * @param dataName Name of the custom data
     */
    function getCustomData(uint256 issuanceId, bytes32 dataName)
        public
        view
        returns (bytes memory)
    {
        IssuanceProperty storage issuanceProperty = _issuanceProperties[issuanceId];
        require(
            issuanceProperty.makerAddress != address(0x0),
            "Issuance not exist"
        );

        // Invoke Instrument
        InstrumentInterface instrument = InstrumentInterface(
            issuanceProperty.proxyAddress
        );
        return instrument.getCustomData(msg.sender, dataName);
    }

    /**
     * @dev Determines whether the target address can take part in a transfer action.
     * For one issuance, only the issuance maker, issuance taker and instrument broker can
     * deposit to or withdraw from the issuance.
     */
    function _isTransferAllowed(uint256 issuanceId, address account)
        internal
        view
        returns (bool)
    {
        IssuanceProperty storage property = _issuanceProperties[issuanceId];
        return
            property.makerAddress == account ||
            property.takerAddress == account ||
            _brokerAddress == account ||
            Constants.getCustodianAddress() == account;
    }

    /**
     * @dev Process updated state and transfers after instrument invocation.
     */
    function _postProcessing(
        uint256 issuanceId,
        bool terminated,
        bytes memory transfersData
    ) internal {
        IssuanceProperty storage property = _issuanceProperties[issuanceId];
        if (!property.terminated && terminated) {
            property.terminated = true;
            emit IssuanceTerminated(issuanceId);
            if (property.deposit > 0) {
                // Burns NUTS token
                IBurnable(_instrumentConfig.depositTokenAddress()).burn(
                    property.deposit
                );
            }
        }

        // Processes transfers.
        Transfers.Data memory transfers = Transfers.decode(transfersData);
        for (uint256 i = 0; i < transfers.actions.length; i++) {
            _processTransfer(issuanceId, transfers.actions[i]);
        }
    }

    /**
     * @dev Process a single token transfer action.
     */
    function _processTransfer(uint256 issuanceId, Transfer.Data memory transfer)
        private
    {
        // The transfer can only come from issuance maker, issuance taker and instrument broker.
        require(
            _isTransferAllowed(issuanceId, transfer.fromAddress) &&
                _isTransferAllowed(issuanceId, transfer.toAddress),
            "Transfer not allowed"
        );
        emit TokenTransferred(
            issuanceId,
            transfer.transferType,
            transfer.fromAddress,
            transfer.toAddress,
            transfer.tokenAddress,
            transfer.amount,
            transfer.action
        );
        IssuanceProperty storage property = _issuanceProperties[issuanceId];
        IssuanceEscrowInterface issuanceEscrow = IssuanceEscrowInterface(
            property.escrowAddress
        );
        // Check whether it's outbound, inbound, or transfer within the escrow.
        if (transfer.transferType == Transfer.Type.Outbound) {
            // IMPORTANT: transfer.toAddress is not valid in outbound transfer.
            if (transfer.tokenAddress == Constants.getEthAddress()) {
                // First withdraw ETH from Issuance Escrow to owner
                issuanceEscrow.withdrawByAdmin(
                    transfer.fromAddress,
                    transfer.amount
                );
                // Then deposit the ETH from owner to Instrument Escrow
                _instrumentEscrow.depositByAdmin.value(transfer.amount)(
                    transfer.fromAddress
                );
            } else {
                // First withdraw ERC20 token from Issuance Escrow to owner
                issuanceEscrow.withdrawTokenByAdmin(
                    transfer.fromAddress,
                    transfer.tokenAddress,
                    transfer.amount
                );
                // (Important!!!)Then set allowance for Instrument Escrow
                IERC20(transfer.tokenAddress).safeApprove(
                    address(_instrumentEscrow),
                    transfer.amount
                );
                // Then deposit the ERC20 token from owner to Instrument Escrow
                _instrumentEscrow.depositTokenByAdmin(
                    transfer.fromAddress,
                    transfer.tokenAddress,
                    transfer.amount
                );
            }
        } else if (transfer.transferType == Transfer.Type.Inbound) {
            // IMPORTANT: transfer.toAddress is not valid in inbound transfer.
            if (transfer.tokenAddress == Constants.getEthAddress()) {
                // First withdraw ETH from Instrument Escrow
                _instrumentEscrow.withdrawByAdmin(
                    transfer.fromAddress,
                    transfer.amount
                );
                // Then deposit ETH to Issuance Escrow
                issuanceEscrow.depositByAdmin.value(transfer.amount)(
                    transfer.fromAddress
                );
            } else {
                // Withdraw ERC20 token from Instrument Escrow
                _instrumentEscrow.withdrawTokenByAdmin(
                    transfer.fromAddress,
                    transfer.tokenAddress,
                    transfer.amount
                );
                // IMPORTANT: Set allowance before deposit
                IERC20(transfer.tokenAddress).safeApprove(
                    property.escrowAddress,
                    transfer.amount
                );
                // Deposit ERC20 token to Issuance Escrow
                issuanceEscrow.depositTokenByAdmin(
                    transfer.fromAddress,
                    transfer.tokenAddress,
                    transfer.amount
                );
            }
        } else {
            // It's a transfer inside the issuance escrow
            issuanceEscrow.transferToken(
                transfer.fromAddress,
                transfer.toAddress,
                transfer.tokenAddress,
                transfer.amount
            );
        }
    }

    function() external payable {}
}
