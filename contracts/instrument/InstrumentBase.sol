pragma solidity ^0.5.0;

import "../lib/protobuf/IssuanceData.sol";
import "../lib/protobuf/StandardizedNonTokenLineItem.sol";
import "./InstrumentInterface.sol";

/**
 * @title Base contract for instruments.
 */
contract InstrumentBase is InstrumentInterface {
    /**
     * @dev The event used to schedule contract events after specific time.
     * @param issuanceId The id of the issuance
     * @param timestamp After when the issuance should be notified
     * @param eventName The name of the custom event
     * @param eventPayload The payload the custom event
     */
    event EventTimeScheduled(uint256 indexed issuanceId, uint256 timestamp, bytes32 eventName, bytes eventPayload);

    /**
     * @dev The event used to schedule contract events after specific block.
     * @param issuanceId The id of the issuance
     * @param blockNumber After which block the issuance should be notified
     * @param eventName The name of the custom event
     * @param eventPayload The payload the custom event
     */
    event EventBlockScheduled(uint256 indexed issuanceId, uint256 blockNumber, bytes32 eventName, bytes eventPayload);

    // Scheduled custom events
    bytes32 constant internal ENGAGEMENT_DUE_EVENT = "engagement_due";
    bytes32 constant internal ISSUANCE_DUE_EVENT = "issuance_due";

    // Custom events
    bytes32 constant internal CANCEL_ISSUANCE_EVENT = "cancel_issuance";

    // Common properties shared by all issuances
    uint256 internal _issuanceId;
    address internal _fspAddress;
    address internal _brokerAddress;
    address internal _instrumentEscrowAddress;
    address internal _issuanceEscrowAddress;
    address internal _priceOracleAddress;
    address internal _makerAddress;
    address internal _takerAddress;
    uint256 internal _creationTimestamp;
    uint256 internal _engagementTimestamp;
    uint256 internal _engagementDueTimestamp;
    uint256 internal _issuanceDueTimestamp;
    uint256 internal _settlementTimestamp;
    IssuanceProperties.State internal _state;
    StandardizedNonTokenLineItem.Data[] internal _standardizedNonTokenLineItems;

    /**
     * @dev Initializes an issuance with common parameters.
     * @param issuanceId ID of the issuance.
     * @param fspAddress Address of the FSP who creates the issuance.
     * @param brokerAddress Address of the instrument broker.
     * @param instrumentEscrowAddress Address of the instrument escrow.
     * @param issuanceEscrowAddress Address of the issuance escrow.
     * @param priceOracleAddress Address of the price oracle.
     */
    function initialize(uint256 issuanceId, address fspAddress, address brokerAddress, address instrumentEscrowAddress,
        address issuanceEscrowAddress, address priceOracleAddress) public {
        require(_issuanceId == 0, 'Already initialized');
        _issuanceId = issuanceId;
        _fspAddress = fspAddress;
        _brokerAddress = brokerAddress;
        _instrumentEscrowAddress = instrumentEscrowAddress;
        _issuanceEscrowAddress = issuanceEscrowAddress;
        _priceOracleAddress = priceOracleAddress;
        _state = IssuanceProperties.State.Initiated;
    }

    /**
     * @dev Checks whether the issuance is terminated. No futher action is taken on a terminated issuance.
     */
    function isTerminated() public view returns (bool) {
        return _state == IssuanceProperties.State.Unfunded ||
            _state == IssuanceProperties.State.Cancelled ||
            _state == IssuanceProperties.State.CompleteNotEngaged ||
            _state == IssuanceProperties.State.CompleteEngaged ||
            _state == IssuanceProperties.State.Delinquent;
    }

    /**
     * @dev Create a new issuance of the financial instrument
     */
    function createIssuance(address /** callerAddress */, bytes memory /** makerParametersData */) public returns (bytes memory) {
        revert('Unsupported operation');
    }

    /**
     * @dev A taker engages to the issuance
     */
    function engageIssuance(address /** callerAddress */, bytes memory /** takerParameters */) public returns (bytes memory) {
        revert('Unsupported operation');
    }

    /**
     * @dev An account has made an ERC20 token deposit to the issuance
     */
    function processTokenDeposit(address /** callerAddress */, address /** tokenAddress */, uint256 /** amount */)
        public returns (bytes memory)  {
        revert('Unsupported operation');
    }


    /**
     * @dev An account has made an ERC20 token withdraw from the issuance
     */
    function processTokenWithdraw(address /** callerAddress */, address /** tokenAddress */, uint256 /** amount */)
        public returns (bytes memory)  {
        revert('Unsupported operation');
    }

    /**
     * @dev A custom event is triggered.
     */
    function processCustomEvent(address /** callerAddress */, bytes32 /** eventName */, bytes memory /** eventPayload */)
        public returns (bytes memory) {
        revert('Unsupported operation');
    }

    /**
     * @dev Read custom data.
     */
    function readCustomData(address /** callerAddress */, bytes32 /** dataName */) public view returns (bytes memory) {
        revert('Unsupported operation');
    }
}