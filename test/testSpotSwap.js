const { BN, constants, balance, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const assert = require('assert');
const SolidityEvent = require("web3");
const LogParser = require(__dirname + "/logParser.js");
const protobuf = require(__dirname + "/../protobuf-js-messages");

const InstrumentManagerFactory = artifacts.require('./instrument/InstrumentManagerFactory.sol');
const InstrumentManagerInterface = artifacts.require('./instrument/InstrumentManagerInterface.sol');
const SpotSwap = artifacts.require('./instrument/swap/SpotSwap.sol');
const PriceOracle = artifacts.require('./mock/PriceOracleMock.sol');
const InstrumentEscrowInterface = artifacts.require('./escrow/InstrumentEscrowInterface.sol');
const IssuanceEscrowInterface = artifacts.require('./escrow/IssuanceEscrowInterface.sol');
const InstrumentRegistry = artifacts.require('./InstrumentRegistry.sol');
const ParametersUtil =artifacts.require('./lib/util/ParametersUtil.sol');
const TokenMock = artifacts.require('./mock/TokenMock.sol');
const NUTSToken = artifacts.require('./token/NUTSToken.sol');
const EscrowFactory = artifacts.require('./escrow/EscrowFactory.sol');
const IssuanceEscrow = artifacts.require('./escrow/IssuanceEscrow.sol');
const custodianAddress = "0xDbE7A2544eeFfec81A7D898Ac08075e0D56FEac6";

let parametersUtil;
let swap;
let instrumentManagerAddress;
let instrumentManager;
let instrumentEscrowAddress;
let instrumentEscrow;
let inputToken;
let outputToken;

contract('SpotSwap', ([owner, proxyAdmin, timerOracle, fsp, maker1, taker1, maker2, taker2, maker3, taker3]) => {
  beforeEach(async () => {
    // Deploy Instrument Managers
    let instrumentManagerFactory = await InstrumentManagerFactory.new();

    // Deploy NUTS token
    let nutsToken = await NUTSToken.new();

    // Deploy Price Oracle
    let priceOracle = await PriceOracle.new();

    // Deploy Escrow Factory
    let escrowFactory = await EscrowFactory.new();

    // Deploy Instrument Registry
    let instrumentRegistry = await InstrumentRegistry.new(instrumentManagerFactory.address,
        0, 0, nutsToken.address, priceOracle.address, escrowFactory.address);

    parametersUtil = await ParametersUtil.new();
    swap = await SpotSwap.new({from: fsp});
    let swapInstrumentParameters = await parametersUtil.getInstrumentParameters(0, fsp, false, false);
    // Activate Spot Swap Instrument
    await instrumentRegistry.activateInstrument(swap.address, swapInstrumentParameters, {from: fsp});
    instrumentManagerAddress = await instrumentRegistry.lookupInstrumentManager(swap.address, {from: fsp});
    console.log('Spot swap instrument manager address: ' + instrumentManagerAddress);
    instrumentManager = await InstrumentManagerInterface.at(instrumentManagerAddress);
    instrumentEscrowAddress = await instrumentManager.getInstrumentEscrowAddress({from: fsp});
    console.log('Spot swap instrument escrow address: ' + instrumentEscrowAddress);

    // Deploy ERC20 tokens
    inputToken = await TokenMock.new();
    outputToken = await TokenMock.new();
    console.log("inputToken address: " + inputToken.address);
    console.log("outputToken address: " + outputToken.address);
    instrumentEscrow = await InstrumentEscrowInterface.at(instrumentEscrowAddress);
  }),
  it('invalid parameters', async () => {
    let spotSwapMakerParameters = await parametersUtil.getSpotSwapMakerParameters('0x0000000000000000000000000000000000000000', outputToken.address, 2000000, 40000, 20);
    await expectRevert(instrumentManager.createIssuance(spotSwapMakerParameters, {from: maker1}), 'Input token not set');

    spotSwapMakerParameters = await parametersUtil.getSpotSwapMakerParameters(inputToken.address, '0x0000000000000000000000000000000000000000', 2000000, 40000, 20);
    await expectRevert(instrumentManager.createIssuance(spotSwapMakerParameters, {from: maker1}), 'Output token not set');

    spotSwapMakerParameters = await parametersUtil.getSpotSwapMakerParameters(inputToken.address, outputToken.address, 0, 40000, 20);
    await expectRevert(instrumentManager.createIssuance(spotSwapMakerParameters, {from: maker1}), 'Input amount not set');

    spotSwapMakerParameters = await parametersUtil.getSpotSwapMakerParameters(inputToken.address, outputToken.address, 2000000, 0, 20);
    await expectRevert(instrumentManager.createIssuance(spotSwapMakerParameters, {from: maker1}), 'Output amount not set');

    spotSwapMakerParameters = await parametersUtil.getSpotSwapMakerParameters(inputToken.address, outputToken.address, 2000000, 40000, 0);
    await expectRevert(instrumentManager.createIssuance(spotSwapMakerParameters, {from: maker1}), 'Invalid duration');

    spotSwapMakerParameters = await parametersUtil.getSpotSwapMakerParameters(inputToken.address, outputToken.address, 2000000, 40000, 91);
    await expectRevert(instrumentManager.createIssuance(spotSwapMakerParameters, {from: maker1}), 'Invalid duration');
  }),
  it('valid parameters but insufficient fund', async () => {
    await inputToken.transfer(maker1, 1500000);
    await inputToken.approve(instrumentEscrowAddress, 1500000, {from: maker1});
    await instrumentEscrow.depositToken(inputToken.address, 1500000, {from: maker1});

    let spotSwapMakerParameters = await parametersUtil.getSpotSwapMakerParameters(inputToken.address, outputToken.address, 2000000, 40000, 20);
    await expectRevert(instrumentManager.createIssuance(spotSwapMakerParameters, {from: maker1}), 'Insufficient input balance');
  }),
  it('valid parameters', async () => {
    await inputToken.transfer(maker1, 2000000);
    await inputToken.approve(instrumentEscrowAddress, 2000000, {from: maker1});
    await instrumentEscrow.depositToken(inputToken.address, 2000000, {from: maker1});
    assert.equal(2000000, await instrumentEscrow.getTokenBalance(maker1, inputToken.address));

    let spotSwapMakerParameters = await parametersUtil.getSpotSwapMakerParameters(inputToken.address, outputToken.address, 2000000, 40000, 20);
    let createdIssuance = await instrumentManager.createIssuance(spotSwapMakerParameters, {from: maker1});
    let customData = await instrumentManager.getCustomData(1, web3.utils.fromAscii("swap_data"));
    let properties = protobuf.SwapData.SpotSwapCompleteProperties.deserializeBinary(Uint8Array.from(Buffer.from(customData.substring(2), 'hex')));
    assert.equal(2, properties.getIssuanceproperties().getState());
    let dueTimestamp = properties.getIssuanceproperties().getEngagementduetimestamp().toNumber();
    let lineItems = properties.getIssuanceproperties().getSupplementallineitemsList();
    let lineItem = lineItems[0];
    assert.equal(1, lineItems.length);
    assert.equal(1, lineItem.getLineitemtype());
    assert.equal(1, lineItem.getState());
    assert.equal(custodianAddress.toLowerCase(), lineItem.getObligatoraddress().toAddress().toLowerCase());
    assert.equal(maker1.toLowerCase(), lineItem.getClaimoraddress().toAddress().toLowerCase());
    assert.equal(inputToken.address.toLowerCase(), lineItem.getTokenaddress().toAddress().toLowerCase());
    assert.equal(2000000, lineItem.getAmount().toNumber());
    assert.equal(dueTimestamp, lineItem.getDuetimestamp().toNumber());
    assert.equal(0, await instrumentEscrow.getTokenBalance(maker1, inputToken.address));

    let abis = [].concat(SpotSwap.abi, TokenMock.abi, IssuanceEscrow.abi);

    let events = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);
    let receipt = {logs: events};

    let issuanceEscrowAddress = events.find((event) => event.event === 'SwapCreated').args.escrowAddress;
    let issuanceEscrow = await IssuanceEscrowInterface.at(issuanceEscrowAddress);

    assert.equal(2000000, await issuanceEscrow.getTokenBalance(custodianAddress, inputToken.address));
    expectEvent(receipt, 'SwapCreated', {
      issuanceId: new BN(1),
      makerAddress: maker1,
      inputTokenAddress: inputToken.address,
      outputTokenAddress: outputToken.address,
      inputAmount: '2000000',
      outputAmount: '40000',
    });
    expectEvent(receipt, 'BalanceDecreased', {
      account: maker1,
      token: inputToken.address,
      amount: '2000000'
    });
    expectEvent(receipt, 'BalanceIncreased', {
      account: maker1,
      token: inputToken.address,
      amount: '2000000'
    });
    expectEvent(receipt, 'BalanceIncreased', {
      account: custodianAddress,
      token: inputToken.address,
      amount: '2000000'
    });
    expectEvent(receipt, 'Transfer', {
      from: instrumentEscrowAddress,
      to: instrumentManagerAddress,
      value: '2000000'
    });
    expectEvent(receipt, 'Transfer', {
      to: issuanceEscrowAddress,
      from: instrumentManagerAddress,
      value: '2000000'
    });
  }),
  it('engage spot swap', async () => {
    await inputToken.transfer(maker1, 2000000);
    await inputToken.approve(instrumentEscrowAddress, 2000000, {from: maker1});
    await instrumentEscrow.depositToken(inputToken.address, 2000000, {from: maker1});
    let abis = [].concat(SpotSwap.abi, TokenMock.abi, IssuanceEscrow.abi);
    let spotSwapMakerParameters = await parametersUtil.getSpotSwapMakerParameters(inputToken.address, outputToken.address, 2000000, 40000, 20);
    let createdIssuance = await instrumentManager.createIssuance(spotSwapMakerParameters, {from: maker1});

    let events = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);
    let issuanceEscrowAddress = events.find((event) => event.event === 'SwapCreated').args.escrowAddress;
    let issuanceEscrow = await IssuanceEscrowInterface.at(issuanceEscrowAddress);

    await outputToken.transfer(taker1, 40000);
    await outputToken.approve(instrumentEscrowAddress, 40000, {from: taker1});
    await instrumentEscrow.depositToken(outputToken.address, 40000, {from: taker1});
    assert.equal(40000, await instrumentEscrow.getTokenBalance(taker1, outputToken.address));

    // Engage spot swap issuance
    let engageIssuance = await instrumentManager.engageIssuance(1, '0x0', {from: taker1});
    let customData = await instrumentManager.getCustomData(1, web3.utils.fromAscii("swap_data"));
    let properties = protobuf.SwapData.SpotSwapCompleteProperties.deserializeBinary(Uint8Array.from(Buffer.from(customData.substring(2), 'hex')));
    let dueTimestamp = properties.getIssuanceproperties().getEngagementduetimestamp().toNumber();
    let lineItems = properties.getIssuanceproperties().getSupplementallineitemsList();
    let lineItem = lineItems[0];
    assert.equal(1, lineItems.length);
    assert.equal(1, lineItem.getLineitemtype());
    assert.equal(2, lineItem.getState());
    assert.equal(custodianAddress.toLowerCase(), lineItem.getObligatoraddress().toAddress().toLowerCase());
    assert.equal(maker1.toLowerCase(), lineItem.getClaimoraddress().toAddress().toLowerCase());
    assert.equal(inputToken.address.toLowerCase(), lineItem.getTokenaddress().toAddress().toLowerCase());
    assert.equal(2000000, lineItem.getAmount().toNumber());
    assert.equal(dueTimestamp, lineItem.getDuetimestamp().toNumber());
    assert.equal(7, properties.getIssuanceproperties().getState());
    assert.equal(0, await instrumentEscrow.getTokenBalance(taker1, outputToken.address));
    assert.equal(2000000, await instrumentEscrow.getTokenBalance(taker1, inputToken.address));
    assert.equal(40000, await instrumentEscrow.getTokenBalance(maker1, outputToken.address));

    let engageIssuanceEvents = LogParser.logParser(engageIssuance.receipt.rawLogs, abis);
    let receipt = {logs: engageIssuanceEvents};
    expectEvent(receipt, 'SwapEngaged', {
      issuanceId: new BN(1),
      takerAddress: taker1
    });
    expectEvent(receipt, 'BalanceDecreased', {
      account: custodianAddress,
      token: inputToken.address,
      amount: '2000000'
    });
    expectEvent(receipt, 'BalanceIncreased', {
      account: taker1,
      token: inputToken.address,
      amount: '2000000'
    });
    expectEvent(receipt, 'BalanceDecreased', {
      account: maker1,
      token: inputToken.address,
      amount: '2000000'
    });
    expectEvent(receipt, 'Transfer', {
      from: issuanceEscrowAddress,
      to: instrumentManagerAddress,
      value: '2000000'
    });
    expectEvent(receipt, 'Transfer', {
      from: instrumentManagerAddress,
      to: instrumentEscrowAddress,
      value: '2000000'
    });

    expectEvent(receipt, 'BalanceIncreased', {
      account: maker1,
      token: outputToken.address,
      amount: '40000'
    });
    expectEvent(receipt, 'BalanceDecreased', {
      account: taker1,
      token: outputToken.address,
      amount: '40000'
    });
    expectEvent(receipt, 'Transfer', {
      from: issuanceEscrowAddress,
      to: instrumentManagerAddress,
      value: '40000'
    });
    expectEvent(receipt, 'Transfer', {
      from: instrumentManagerAddress,
      to: instrumentEscrowAddress,
      value: '40000'
    });
    expectEvent(receipt, 'Transfer', {
      from: instrumentEscrowAddress,
      to: instrumentManagerAddress,
      value: '40000'
    });
    expectEvent(receipt, 'Transfer', {
      from: instrumentManagerAddress,
      to: issuanceEscrowAddress,
      value: '40000'
    });
  }),
  it('engage spot swap insufficient output balance', async () => {
    await inputToken.transfer(maker1, 2000000);
    await inputToken.approve(instrumentEscrowAddress, 2000000, {from: maker1});
    await instrumentEscrow.depositToken(inputToken.address, 2000000, {from: maker1});
    let abis = [].concat(SpotSwap.abi, TokenMock.abi, IssuanceEscrow.abi);
    let spotSwapMakerParameters = await parametersUtil.getSpotSwapMakerParameters(inputToken.address, outputToken.address, 2000000, 40000, 20);
    let createdIssuance = await instrumentManager.createIssuance(spotSwapMakerParameters, {from: maker1});

    let events = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);
    let issuanceEscrowAddress = events.find((event) => event.event === 'SwapCreated').args.escrowAddress;

    await outputToken.transfer(taker1, 39999);
    await outputToken.approve(instrumentEscrowAddress, 39999, {from: taker1});
    await instrumentEscrow.depositToken(outputToken.address, 39999, {from: taker1});

    // Engage spot swap issuance
    await expectRevert(instrumentManager.engageIssuance(1, '0x0', {from: taker1}), 'Insufficient output balance');
  }),
  it('cancel spot swap not engageable', async () => {
    await inputToken.transfer(maker1, 2000000);
    await inputToken.approve(instrumentEscrowAddress, 2000000, {from: maker1});
    await instrumentEscrow.depositToken(inputToken.address, 2000000, {from: maker1});
    let abis = [].concat(SpotSwap.abi, TokenMock.abi, IssuanceEscrow.abi);
    let spotSwapMakerParameters = await parametersUtil.getSpotSwapMakerParameters(inputToken.address, outputToken.address, 2000000, 40000, 20);
    let createdIssuance = await instrumentManager.createIssuance(spotSwapMakerParameters, {from: maker1});

    let events = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);
    let issuanceEscrowAddress = events.find((event) => event.event === 'SwapCreated').args.escrowAddress;

    await outputToken.transfer(taker1, 40000);
    await outputToken.approve(instrumentEscrowAddress, 40000, {from: taker1});
    await instrumentEscrow.depositToken(outputToken.address, 40000, {from: taker1});

    // Engage spot swap issuance
    await instrumentManager.engageIssuance(1, '0x0', {from: taker1});
    await expectRevert(instrumentManager.notifyCustomEvent(1, web3.utils.fromAscii("cancel_issuance"), web3.utils.fromAscii(""), {from: maker1}), 'Cancel issuance not in engageable state');
  }),
  it('cancel spot swap not maker', async () => {
    await inputToken.transfer(maker1, 2000000);
    await inputToken.approve(instrumentEscrowAddress, 2000000, {from: maker1});
    await instrumentEscrow.depositToken(inputToken.address, 2000000, {from: maker1});
    let abis = [].concat(SpotSwap.abi, TokenMock.abi, IssuanceEscrow.abi);
    let spotSwapMakerParameters = await parametersUtil.getSpotSwapMakerParameters(inputToken.address, outputToken.address, 2000000, 40000, 20);
    let createdIssuance = await instrumentManager.createIssuance(spotSwapMakerParameters, {from: maker1});

    let events = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);
    let issuanceEscrowAddress = events.find((event) => event.event === 'SwapCreated').args.escrowAddress;
    await expectRevert(instrumentManager.notifyCustomEvent(1, web3.utils.fromAscii("cancel_issuance"), web3.utils.fromAscii(""), {from: maker2}), 'Only maker can cancel issuance');
  }),
  it('cancel spot swap', async () => {
    await inputToken.transfer(maker1, 2000000);
    await inputToken.approve(instrumentEscrowAddress, 2000000, {from: maker1});
    await instrumentEscrow.depositToken(inputToken.address, 2000000, {from: maker1});
    let abis = [].concat(SpotSwap.abi, TokenMock.abi, IssuanceEscrow.abi);
    let spotSwapMakerParameters = await parametersUtil.getSpotSwapMakerParameters(inputToken.address, outputToken.address, 2000000, 40000, 20);
    let createdIssuance = await instrumentManager.createIssuance(spotSwapMakerParameters, {from: maker1});

    let events = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);
    let issuanceEscrowAddress = events.find((event) => event.event === 'SwapCreated').args.escrowAddress;
    let issuanceEscrow = await IssuanceEscrowInterface.at(issuanceEscrowAddress);

    let cancelIssuance = await instrumentManager.notifyCustomEvent(1, web3.utils.fromAscii("cancel_issuance"), web3.utils.fromAscii(""), {from: maker1});
    let customData = await instrumentManager.getCustomData(1, web3.utils.fromAscii("swap_data"));
    let properties = protobuf.SwapData.SpotSwapCompleteProperties.deserializeBinary(Uint8Array.from(Buffer.from(customData.substring(2), 'hex')));
    assert.equal(5, properties.getIssuanceproperties().getState());

    let cancelIssuanceEvents = LogParser.logParser(cancelIssuance.receipt.rawLogs, abis);
    let receipt = {logs: cancelIssuanceEvents};

    assert.equal(2000000, await instrumentEscrow.getTokenBalance(maker1, inputToken.address));
    assert.equal(0, await issuanceEscrow.getTokenBalance(maker1, inputToken.address));
    expectEvent(receipt, 'SwapCancelled', {
      issuanceId: new BN(1)
    });
    expectEvent(receipt, 'BalanceIncreased', {
      account: maker1,
      token: inputToken.address,
      amount: '2000000'
    });
    expectEvent(receipt, 'BalanceDecreased', {
      account: maker1,
      token: inputToken.address,
      amount: '2000000'
    });
    expectEvent(receipt, 'Transfer', {
      from: instrumentManagerAddress,
      to: instrumentEscrowAddress,
      value: '2000000'
    });
    expectEvent(receipt, 'Transfer', {
      from: issuanceEscrowAddress,
      to: instrumentManagerAddress,
      value: '2000000'
    });
  }),
  it('notify due after due', async () => {
    await inputToken.transfer(maker1, 2000000);
    await inputToken.approve(instrumentEscrowAddress, 2000000, {from: maker1});
    await instrumentEscrow.depositToken(inputToken.address, 2000000, {from: maker1});
    let abis = [].concat(SpotSwap.abi, TokenMock.abi, IssuanceEscrow.abi);
    let spotSwapMakerParameters = await parametersUtil.getSpotSwapMakerParameters(inputToken.address, outputToken.address, 2000000, 40000, 20);
    let createdIssuance = await instrumentManager.createIssuance(spotSwapMakerParameters, {from: maker1});

    let events = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);
    let issuanceEscrowAddress = events.find((event) => event.event === 'SwapCreated').args.escrowAddress;
    let issuanceEscrow = await IssuanceEscrowInterface.at(issuanceEscrowAddress);
    await web3.currentProvider.send({jsonrpc: 2.0, method: 'evm_increaseTime', params: [8640000], id: 0}, (err, result) => { console.log(err, result)});
    let notifyDue = await instrumentManager.notifyCustomEvent(1, web3.utils.fromAscii("issuance_due"), web3.utils.fromAscii(""), {from: maker1});
    let notifyDueEvents = LogParser.logParser(notifyDue.receipt.rawLogs, abis);
    let receipt = {logs: notifyDueEvents};

    let customData = await instrumentManager.getCustomData(1, web3.utils.fromAscii("swap_data"));
    let properties = protobuf.SwapData.SpotSwapCompleteProperties.deserializeBinary(Uint8Array.from(Buffer.from(customData.substring(2), 'hex')));
    assert.equal(6, properties.getIssuanceproperties().getState());
    expectEvent(receipt, 'SwapCompleteNotEngaged', {
      issuanceId: new BN(1)
    });
    assert.equal(2000000, await instrumentEscrow.getTokenBalance(maker1, inputToken.address));
    assert.equal(0, await issuanceEscrow.getTokenBalance(maker1, inputToken.address));
  }),
  it('notify due before due', async () => {
    await inputToken.transfer(maker1, 2000000);
    await inputToken.approve(instrumentEscrowAddress, 2000000, {from: maker1});
    await instrumentEscrow.depositToken(inputToken.address, 2000000, {from: maker1});
    let abis = [].concat(SpotSwap.abi, TokenMock.abi, IssuanceEscrow.abi);
    let spotSwapMakerParameters = await parametersUtil.getSpotSwapMakerParameters(inputToken.address, outputToken.address, 2000000, 40000, 20);
    let createdIssuance = await instrumentManager.createIssuance(spotSwapMakerParameters, {from: maker1});

    let events = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);
    let issuanceEscrowAddress = events.find((event) => event.event === 'SwapCreated').args.escrowAddress;

    let notifyDue = await instrumentManager.notifyCustomEvent(1, web3.utils.fromAscii("issuance_due"), web3.utils.fromAscii(""), {from: maker1});
    let customData = await instrumentManager.getCustomData(1, web3.utils.fromAscii("swap_data"));
    let properties = protobuf.SwapData.SpotSwapCompleteProperties.deserializeBinary(Uint8Array.from(Buffer.from(customData.substring(2), 'hex')));
    assert.equal(2, properties.getIssuanceproperties().getState());
  })
});