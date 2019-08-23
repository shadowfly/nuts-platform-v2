pragma solidity ^0.5.0;

import "./InstrumentManagerInterface.sol";
import "./v1/InstrumentV1Manager.sol";
import "./v2/InstrumentV2Manager.sol";
import "./v3/InstrumentV3Manager.sol";
import "../escrow/InstrumentEscrow.sol";
import "../lib/proxy/OwnerOnlyUpgradeabilityProxy.sol";
import "../lib/util/StringUtil.sol";

contract InstrumentManagerFactory {
    /**
     * @dev Create a new instrument manager instance
     * @param instrumentAddress The deployed address of the instrument.
     * @param fspAddress The address of the FSP who deploy the instrument.
     * @param version The instrument manager version.
     * @param instrumentParameters Custom parameters about this instrument.
     */
    function createInstrumentManager(address instrumentAddress, address fspAddress, string memory version, bytes memory instrumentParameters)
        public returns (InstrumentManagerInterface) {
        if (StringUtil.equals(version, "v1")) {
            // Create new InstrumentEscrow instance
            InstrumentEscrow escrow = new InstrumentEscrow();
            // Create new Proxy for the InstrumentEscrow instance
            OwnerOnlyUpgradeabilityProxy proxy = new OwnerOnlyUpgradeabilityProxy();
            proxy.upgradeTo(address(escrow));
            // Transfer proxy ownership
            proxy.transferProxyOwnership(msg.sender);

            InstrumentManagerInterface manager = new InstrumentV1Manager(InstrumentV1(instrumentAddress),
                escrow, fspAddress, instrumentParameters);
            return manager;
        } else if (StringUtil.equals(version, "v2")) {

        } else if (StringUtil.equals(version, "v3")) {

        } else {
            revert("Unknown instrument version.");
        }
    }
}