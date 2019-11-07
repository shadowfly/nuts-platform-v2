const { BN, constants, balance, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const assert = require('assert');
const SolidityEvent = require("web3");
const LogParser = require(__dirname + "/logParser.js");

const InstrumentManagerInterface = artifacts.require('./instruments/InstrumentManagerInterface.sol');
const PriceOracle = artifacts.require('./mock/PriceOracleMock.sol');
const InstrumentEscrowInterface = artifacts.require('./escrow/InstrumentEscrowInterface.sol');
const IssuanceEscrowInterface = artifacts.require('./escrow/IssuanceEscrowInterface.sol');
const InstrumentRegistry = artifacts.require('./InstrumentRegistry.sol');
const Lending = artifacts.require('./instruments/lending/LendingV1.sol');
const ParametersUtil =artifacts.require('./lib/util/ParametersUtil.sol');
const TokenMock = artifacts.require('./mock/TokenMock.sol');
const InstrumentV1ManagerFactory = artifacts.require('./instrument/v1/InstrumentV1ManagerFactory.sol');
const InstrumentV2ManagerFactory = artifacts.require('./instrument/v2/InstrumentV2ManagerFactory.sol');
const InstrumentV3ManagerFactory = artifacts.require('./instrument/v3/InstrumentV3ManagerFactory.sol');
const NUTSToken = artifacts.require('./token/NUTSToken.sol');
const EscrowFactory = artifacts.require('./escrow/EscrowFactory.sol');
const IssuanceEscrow = artifacts.require('./escrow/IssuanceEscrow.sol');
const StorageFactory = artifacts.require('./storage/StorageFactory.sol');

let parametersUtil;
let instrumentManager;
let collateralToken;
let lendingToken;
let instrumentEscrow;
let instrumentEscrowAddress;
let lendingInstrumentManagerAddress;
let lendingInstrumentEscrowAddress;
let lending;



contract('Lending', ([owner, proxyAdmin, timerOracle, fsp, maker1, taker1, maker2, taker2, maker3, taker3]) => {
  beforeEach(async () => {
    // Deploy Storage Factory
    let storageFactory = await StorageFactory.new();

    // Deploy Instrument Managers
    let instrumentV1ManagerFactory = await InstrumentV1ManagerFactory.new();
    let instrumentV2ManagerFactory = await InstrumentV2ManagerFactory.new(storageFactory.address);
    let instrumentV3ManagerFactory = await InstrumentV3ManagerFactory.new();

    // Deploy NUTS token
    let nutsToken = await NUTSToken.new();

    // Deploy Price Oracle
    let priceOracle = await PriceOracle.new();

    // Deploy Escrow Factory
    let escrowFactory = await EscrowFactory.new();

    // Deploy Instrument Registry
    let instrumentRegistry = await InstrumentRegistry.new(0, 0, nutsToken.address, priceOracle.address, escrowFactory.address);

    // Registry Instrument Manager Factories
    await instrumentRegistry.setInstrumentManagerFactory('version1', instrumentV1ManagerFactory.address);
    await instrumentRegistry.setInstrumentManagerFactory('version2', instrumentV2ManagerFactory.address);
    await instrumentRegistry.setInstrumentManagerFactory('version3', instrumentV3ManagerFactory.address);

    parametersUtil = await ParametersUtil.new();

    console.log('Deploying lending instrument.');
    lending = await Lending.new({from: fsp});
    let lendingInstrumentParameters = await parametersUtil.getInstrumentParameters(0, fsp, false, false);
    // Activate Lending Instrument
    await instrumentRegistry.activateInstrument(lending.address, 'version1', lendingInstrumentParameters, {from: fsp});
    lendingInstrumentManagerAddress = await instrumentRegistry.lookupInstrumentManager(lending.address, {from: fsp});
    console.log('Lending instrument manager address: ' + lendingInstrumentManagerAddress);
    const lendingInstrumentManager = await InstrumentManagerInterface.at(lendingInstrumentManagerAddress);
    lendingInstrumentEscrowAddress = await lendingInstrumentManager.getInstrumentEscrowAddress({from: fsp});
    console.log('Lending instrument escrow address: ' + lendingInstrumentEscrowAddress);

    // Deploy ERC20 tokens
    lendingToken = await TokenMock.new();
    collateralToken = await TokenMock.new();
    await priceOracle.setRate(lendingToken.address, collateralToken.address, 1, 100);
    await priceOracle.setRate(collateralToken.address, lendingToken.address, 100, 1);

    let instrumentManagerAddress = await instrumentRegistry.lookupInstrumentManager(lending.address, {from: fsp});
    console.log('Instrument manager address: ' + instrumentManagerAddress);
    instrumentManager = await InstrumentManagerInterface.at(instrumentManagerAddress);
    instrumentEscrowAddress = await instrumentManager.getInstrumentEscrowAddress({from: fsp});
    console.log('Instrument escrow address: ' + instrumentEscrowAddress);
    instrumentEscrow = await InstrumentEscrowInterface.at(instrumentEscrowAddress);
  }),
  it('invalid parameters', async () => {
    await lendingToken.transfer(maker1, 20000);
    await lendingToken.approve(instrumentEscrowAddress, 20000, {from: maker1});
    await instrumentEscrow.depositToken(lendingToken.address, 20000, {from: maker1});

    let lendingMakerParameters = await parametersUtil.getLendingMakerParameters('0x0000000000000000000000000000000000000000',
        lendingToken.address, 0, 15000, 20, 10000);
    await expectRevert(instrumentManager.createIssuance(lendingMakerParameters, {from: maker1}), 'Collateral token not set');

    lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address,
        '0x0000000000000000000000000000000000000000', 20000, 15000, 1, 10000);
    await expectRevert(instrumentManager.createIssuance(lendingMakerParameters, {from: maker1}), 'Lending token not set');

    lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address,
        lendingToken.address, 0, 15000, 20, 10000);
    await expectRevert(instrumentManager.createIssuance(lendingMakerParameters, {from: maker1}), 'Lending amount not set');

    lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address,
        lendingToken.address, 20000, 15000, 1, 10000);
    await expectRevert(instrumentManager.createIssuance(lendingMakerParameters, {from: maker1}), 'Invalid tenor days');

    lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address,
        lendingToken.address, 20000, 15000, 91, 10000);
    await expectRevert(instrumentManager.createIssuance(lendingMakerParameters, {from: maker1}), 'Invalid tenor days');

    lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address,
        lendingToken.address, 20000, 4999, 20, 10000);
    await expectRevert(instrumentManager.createIssuance(lendingMakerParameters, {from: maker1}), 'Invalid collateral ratio');

    lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address,
        lendingToken.address, 20000, 20001, 20, 10000);
    await expectRevert(instrumentManager.createIssuance(lendingMakerParameters, {from: maker1}), 'Invalid collateral ratio');

    lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address,
        lendingToken.address, 20000, 15000, 20, 9);
    await expectRevert(instrumentManager.createIssuance(lendingMakerParameters, {from: maker1}), 'Invalid interest rate');

    lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address,
        lendingToken.address, 20000, 15000, 20, 50001);
    await expectRevert(instrumentManager.createIssuance(lendingMakerParameters, {from: maker1}), 'Invalid interest rate');
  }),
  it('valid parameters but insufficient fund', async () => {
    await lendingToken.transfer(maker1, 20000);
    await lendingToken.approve(instrumentEscrowAddress, 20000, {from: maker1});
    await instrumentEscrow.depositToken(lendingToken.address, 20000, {from: maker1});

    let lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address,
        lendingToken.address, 25000, 15000, 20, 10000);
    await expectRevert(instrumentManager.createIssuance(lendingMakerParameters, {from: maker1}), 'Insufficient principal balance');
  }),
  it('valid parameters', async () => {
    await lendingToken.transfer(maker1, 20000);
    await lendingToken.approve(instrumentEscrowAddress, 20000, {from: maker1});
    await instrumentEscrow.depositToken(lendingToken.address, 20000, {from: maker1});
    assert.equal(20000, await instrumentEscrow.getTokenBalance(maker1, lendingToken.address));

    let lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address,
        lendingToken.address, 20000, 15000, 20, 10000);
    let createdIssuance = await instrumentManager.createIssuance(lendingMakerParameters, {from: maker1});

    assert.equal(0, await instrumentEscrow.getTokenBalance(maker1, lendingToken.address));
    assert.equal(1, await instrumentManager.getIssuanceState(1));

    let abis = [].concat(Lending.abi, TokenMock.abi, IssuanceEscrow.abi);

    let events = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);
    let receipt = {logs: events};

    let issuanceEscrowAddress = events.find((event) => event.event === 'LendingCreated').args.escrowAddress;
    let issuanceEscrow = await IssuanceEscrowInterface.at(issuanceEscrowAddress);

    assert.equal(20000, await issuanceEscrow.getTokenBalance(maker1, lendingToken.address));
    expectEvent(receipt, 'LendingCreated', {
      issuanceId: new BN(1),
      makerAddress: maker1,
      collateralTokenAddress: collateralToken.address,
      lendingTokenAddress: lendingToken.address,
      lendingAmount: '20000',
      collateralRatio: '15000',
    });
    expectEvent(receipt, 'BalanceDecreased', {
      account: maker1,
      token: lendingToken.address,
      amount: '20000'
    });
    expectEvent(receipt, 'BalanceIncreased', {
      account: maker1,
      token: lendingToken.address,
      amount: '20000'
    });
    expectEvent(receipt, 'Transfer', {
      from: lendingInstrumentEscrowAddress,
      to: lendingInstrumentManagerAddress,
      value: '20000'
    });
    expectEvent(receipt, 'Transfer', {
      to: issuanceEscrowAddress,
      from: lendingInstrumentManagerAddress,
      value: '20000'
    });
  }),
  it('cancel lending', async () => {
    await lendingToken.transfer(maker1, 20000);
    await lendingToken.approve(instrumentEscrowAddress, 20000, {from: maker1});
    await instrumentEscrow.depositToken(lendingToken.address, 20000, {from: maker1});
    let abis = [].concat(Lending.abi, TokenMock.abi, IssuanceEscrow.abi);

    let lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address, lendingToken.address, 20000, 15000, 20, 10000);
    let createdIssuance = await instrumentManager.createIssuance(lendingMakerParameters, {from: maker1});
    let createdIssuanceEvents = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);
    let issuanceEscrowAddress = createdIssuanceEvents.find((event) => event.event === 'LendingCreated').args.escrowAddress;
    let issuanceEscrow = await IssuanceEscrowInterface.at(issuanceEscrowAddress);

    let cancelIssuance = await instrumentManager.notifyCustomEvent(1, web3.utils.fromAscii("cancel_issuance"), web3.utils.fromAscii(""), {from: maker1});

    assert.equal(4, await instrumentManager.getIssuanceState(1));

    let cancelIssuanceEvents = LogParser.logParser(cancelIssuance.receipt.rawLogs, abis);
    let receipt = {logs: cancelIssuanceEvents};

    assert.equal(20000, await instrumentEscrow.getTokenBalance(maker1, lendingToken.address));
    assert.equal(0, await issuanceEscrow.getTokenBalance(maker1, lendingToken.address));
    expectEvent(receipt, 'LendingCancelled', {
      issuanceId: new BN(1)
    });
    expectEvent(receipt, 'BalanceIncreased', {
      account: maker1,
      token: lendingToken.address,
      amount: '20000'
    });
    expectEvent(receipt, 'BalanceDecreased', {
      account: maker1,
      token: lendingToken.address,
      amount: '20000'
    });
    expectEvent(receipt, 'Transfer', {
      from: lendingInstrumentManagerAddress,
      to: lendingInstrumentEscrowAddress,
      value: '20000'
    });
    expectEvent(receipt, 'Transfer', {
      from: issuanceEscrowAddress,
      to: lendingInstrumentManagerAddress,
      value: '20000'
    });
  }),
  it('cancel lending not engageable', async () => {
    await lendingToken.transfer(maker1, 20000);
    await lendingToken.approve(instrumentEscrowAddress, 20000, {from: maker1});
    await instrumentEscrow.depositToken(lendingToken.address, 20000, {from: maker1});
    let abis = [].concat(Lending.abi, TokenMock.abi, IssuanceEscrow.abi);

    let lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address, lendingToken.address, 20000, 15000, 20, 10000);
    let createdIssuance = await instrumentManager.createIssuance(lendingMakerParameters, {from: maker1});
    let createdIssuanceEvents = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);
    let issuanceEscrowAddress = createdIssuanceEvents.find((event) => event.event === 'LendingCreated').args.escrowAddress;

    // Deposit collateral tokens to Lending Instrument Escrow
    await collateralToken.transfer(taker1, 4000000);
    await collateralToken.approve(instrumentEscrowAddress, 4000000, {from: taker1});
    await instrumentEscrow.depositToken(collateralToken.address, 4000000, {from: taker1});
    await instrumentManager.engageIssuance(1, '0x0', {from: taker1});
    await expectRevert(instrumentManager.notifyCustomEvent(1, web3.utils.fromAscii("cancel_issuance"), web3.utils.fromAscii(""), {from: maker1}), 'Cancel issuance not in engageable state');
  }),
  it('cancel lending not from maker', async () => {
    await lendingToken.transfer(maker1, 20000);
    await lendingToken.approve(instrumentEscrowAddress, 20000, {from: maker1});
    await instrumentEscrow.depositToken(lendingToken.address, 20000, {from: maker1});
    let abis = [].concat(Lending.abi, TokenMock.abi, IssuanceEscrow.abi);

    let lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address, lendingToken.address, 20000, 15000, 20, 10000);
    let createdIssuance = await instrumentManager.createIssuance(lendingMakerParameters, {from: maker1});
    let createdIssuanceEvents = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);
    let issuanceEscrowAddress = createdIssuanceEvents.find((event) => event.event === 'LendingCreated').args.escrowAddress;
    await expectRevert(instrumentManager.notifyCustomEvent(1, web3.utils.fromAscii("cancel_issuance"), web3.utils.fromAscii(""), {from: maker2}), 'Only maker can cancel issuance');
  }),
  it('repaid successful', async () => {
    await lendingToken.transfer(maker1, 20000);
    await lendingToken.approve(instrumentEscrowAddress, 20000, {from: maker1});
    await instrumentEscrow.depositToken(lendingToken.address, 20000, {from: maker1});
    let abis = [].concat(Lending.abi, TokenMock.abi, IssuanceEscrow.abi);

    let lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address, lendingToken.address, 20000, 15000, 20, 10000);
    let createdIssuance = await instrumentManager.createIssuance(lendingMakerParameters, {from: maker1});
    let createdIssuanceEvents = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);
    let issuanceEscrowAddress = createdIssuanceEvents.find((event) => event.event === 'LendingCreated').args.escrowAddress;
    let issuanceEscrow = await IssuanceEscrowInterface.at(issuanceEscrowAddress);

    // Deposit collateral tokens to Lending Instrument Escrow
    await collateralToken.transfer(taker1, 4000000);
    await collateralToken.approve(instrumentEscrowAddress, 4000000, {from: taker1});
    await instrumentEscrow.depositToken(collateralToken.address, 4000000, {from: taker1});
    assert.equal(4000000, await instrumentEscrow.getTokenBalance(taker1, collateralToken.address));

    await instrumentManager.engageIssuance(1, '0x0', {from: taker1});
    assert.equal(1000000, await instrumentEscrow.getTokenBalance(taker1, collateralToken.address));
    assert.equal(20000, await instrumentEscrow.getTokenBalance(taker1, lendingToken.address));
    assert.equal(0, await issuanceEscrow.getTokenBalance(maker1, lendingToken.address));
    assert.equal(3000000, await issuanceEscrow.getTokenBalance(taker1, collateralToken.address));

    await lendingToken.transfer(taker1, 24000);
    await lendingToken.approve(instrumentEscrowAddress, 24000, {from: taker1});
    await instrumentEscrow.depositToken(lendingToken.address, 24000, {from: taker1});
    assert.equal(44000, await instrumentEscrow.getTokenBalance(taker1, lendingToken.address));

    let depositToIssuance = await instrumentManager.depositToIssuance(1, lendingToken.address, 24000, {from: taker1});
    let depositToIssuanceEvents = LogParser.logParser(depositToIssuance.receipt.rawLogs, abis);
    let receipt = {logs: depositToIssuanceEvents};

    assert.equal(6, await instrumentManager.getIssuanceState(1));
    assert.equal(20000, await instrumentEscrow.getTokenBalance(taker1, lendingToken.address));
    assert.equal(24000, await instrumentEscrow.getTokenBalance(maker1, lendingToken.address));
    assert.equal(4000000, await instrumentEscrow.getTokenBalance(taker1, collateralToken.address));
    assert.equal(0, await instrumentEscrow.getTokenBalance(maker1, collateralToken.address));
    assert.equal(0, await issuanceEscrow.getTokenBalance(taker1, lendingToken.address));
    assert.equal(0, await issuanceEscrow.getTokenBalance(maker1, lendingToken.address));
    assert.equal(0, await issuanceEscrow.getTokenBalance(taker1, collateralToken.address));
    assert.equal(0, await issuanceEscrow.getTokenBalance(maker1, collateralToken.address));
    expectEvent(receipt, 'LendingRepaid', {
      issuanceId: new BN(1)
    });
    expectEvent(receipt, 'BalanceDecreased', {
      account: taker1,
      token: lendingToken.address,
      amount: '24000'
    });
    expectEvent(receipt, 'Transfer', {
      from: lendingInstrumentEscrowAddress,
      to: lendingInstrumentManagerAddress,
      value: '24000'
    });
    expectEvent(receipt, 'BalanceIncreased', {
      account: taker1,
      token: lendingToken.address,
      amount: '24000'
    });

    expectEvent(receipt, 'Transfer', {
      from: lendingInstrumentManagerAddress,
      to: issuanceEscrowAddress,
      value: '24000'
    });

    expectEvent(receipt, 'BalanceDecreased', {
      account: taker1,
      token: collateralToken.address,
      amount: '3000000'
    });

    expectEvent(receipt, 'Transfer', {
      from: issuanceEscrowAddress,
      to: lendingInstrumentManagerAddress,
      value: '3000000'
    });

    expectEvent(receipt, 'BalanceIncreased', {
      account: taker1,
      token: collateralToken.address,
      amount: '3000000'
    });

    expectEvent(receipt, 'Transfer', {
      from: lendingInstrumentManagerAddress,
      to: instrumentEscrowAddress,
      value: '3000000'
    });
  }),
  it('repaid not engaged', async () => {
    await lendingToken.transfer(maker1, 40000);
    await lendingToken.approve(instrumentEscrowAddress, 40000, {from: maker1});
    await instrumentEscrow.depositToken(lendingToken.address, 40000, {from: maker1});
    let abis = [].concat(Lending.abi, TokenMock.abi, IssuanceEscrow.abi);

    let lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address, lendingToken.address, 20000, 15000, 20, 10000);
    let createdIssuance = await instrumentManager.createIssuance(lendingMakerParameters, {from: maker1});
    let createdIssuanceEvents = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);
    let issuanceEscrowAddress = createdIssuanceEvents.find((event) => event.event === 'LendingCreated').args.escrowAddress;
    await expectRevert(instrumentManager.depositToIssuance(1, lendingToken.address, 20000, {from: maker1}), "Must repay in engaged state");
  }),
  it('repaid not taker', async () => {
    await lendingToken.transfer(maker1, 40000);
    await lendingToken.approve(instrumentEscrowAddress, 40000, {from: maker1});
    await instrumentEscrow.depositToken(lendingToken.address, 40000, {from: maker1});
    let abis = [].concat(Lending.abi, TokenMock.abi, IssuanceEscrow.abi);

    let lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address, lendingToken.address, 20000, 15000, 20, 10000);
    let createdIssuance = await instrumentManager.createIssuance(lendingMakerParameters, {from: maker1});
    let createdIssuanceEvents = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);
    let issuanceEscrowAddress = createdIssuanceEvents.find((event) => event.event === 'LendingCreated').args.escrowAddress;

    // Deposit collateral tokens to Lending Instrument Escrow
    await collateralToken.transfer(taker1, 4000000);
    await collateralToken.approve(instrumentEscrowAddress, 4000000, {from: taker1});
    await instrumentEscrow.depositToken(collateralToken.address, 4000000, {from: taker1});
    await instrumentManager.engageIssuance(1, '0x0', {from: taker1});
    await lendingToken.approve(instrumentEscrowAddress, 20000, {from: taker2});
    await expectRevert(instrumentManager.depositToIssuance(1, lendingToken.address, 20000, {from: maker1}), "Only taker can repay");
  }),
  it('repaid not lending token', async () => {
    await lendingToken.transfer(maker1, 20000);
    await lendingToken.approve(instrumentEscrowAddress, 20000, {from: maker1});
    await instrumentEscrow.depositToken(lendingToken.address, 20000, {from: maker1});
    let abis = [].concat(Lending.abi, TokenMock.abi, IssuanceEscrow.abi);

    let lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address, lendingToken.address, 20000, 15000, 20, 10000);
    let createdIssuance = await instrumentManager.createIssuance(lendingMakerParameters, {from: maker1});
    let createdIssuanceEvents = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);
    let issuanceEscrowAddress = createdIssuanceEvents.find((event) => event.event === 'LendingCreated').args.escrowAddress;

    // Deposit collateral tokens to Lending Instrument Escrow
    await collateralToken.transfer(taker1, 4000000);
    await collateralToken.approve(instrumentEscrowAddress, 4000000, {from: taker1});
    await instrumentEscrow.depositToken(collateralToken.address, 4000000, {from: taker1});
    await instrumentManager.engageIssuance(1, '0x0', {from: taker1});
    await expectRevert(instrumentManager.depositToIssuance(1, collateralToken.address, 20000, {from: taker1}), "Must repay with lending token");
  }),
  it('repaid not full amount', async () => {
    await lendingToken.transfer(maker1, 20000);
    await lendingToken.approve(instrumentEscrowAddress, 20000, {from: maker1});
    await instrumentEscrow.depositToken(lendingToken.address, 20000, {from: maker1});
    let abis = [].concat(Lending.abi, TokenMock.abi, IssuanceEscrow.abi);

    let lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address, lendingToken.address, 20000, 15000, 20, 10000);
    let createdIssuance = await instrumentManager.createIssuance(lendingMakerParameters, {from: maker1});
    let createdIssuanceEvents = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);
    let issuanceEscrowAddress = createdIssuanceEvents.find((event) => event.event === 'LendingCreated').args.escrowAddress;

    // Deposit collateral tokens to Lending Instrument Escrow
    await collateralToken.transfer(taker1, 4000000);
    await collateralToken.approve(instrumentEscrowAddress, 4000000, {from: taker1});
    await instrumentEscrow.depositToken(collateralToken.address, 4000000, {from: taker1});
    await instrumentManager.engageIssuance(1, '0x0', {from: taker1});
    await expectRevert(instrumentManager.depositToIssuance(1, lendingToken.address, 20000, {from: taker1}), "Must repay in full");
  }),
  it('engagement due after due date', async () => {
    await lendingToken.transfer(maker1, 20000);
    await lendingToken.approve(instrumentEscrowAddress, 20000, {from: maker1});
    await instrumentEscrow.depositToken(lendingToken.address, 20000, {from: maker1});

    let lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address,
        lendingToken.address, 20000, 15000, 20, 10000);
    let createdIssuance = await instrumentManager.createIssuance(lendingMakerParameters, {from: maker1});

    let abis = [].concat(Lending.abi, TokenMock.abi, IssuanceEscrow.abi);

    let events = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);

    let issuanceEscrowAddress = events.find((event) => event.event === 'LendingCreated').args.escrowAddress;
    let issuanceEscrow = await IssuanceEscrowInterface.at(issuanceEscrowAddress);
    await web3.currentProvider.send({jsonrpc: 2.0, method: 'evm_increaseTime', params: [8640000], id: 0}, (err, result) => { console.log(err, result)});
    let notifyEngagementDue = await instrumentManager.notifyCustomEvent(1, web3.utils.fromAscii("engagement_due"), web3.utils.fromAscii(""), {from: maker1});

    assert.equal(5, await instrumentManager.getIssuanceState(1));

    let notifyEngagementDueEvents = LogParser.logParser(notifyEngagementDue.receipt.rawLogs, abis);
    let receipt = {logs: notifyEngagementDueEvents};

    expectEvent(receipt, 'LendingCompleteNotEngaged', {
      issuanceId: new BN(1)
    });
    expectEvent(receipt, 'BalanceDecreased', {
      account: maker1,
      token: lendingToken.address,
      amount: '20000'
    });
    expectEvent(receipt, 'BalanceIncreased', {
      account: maker1,
      token: lendingToken.address,
      amount: '20000'
    });
    expectEvent(receipt, 'Transfer', {
      from: issuanceEscrowAddress,
      to: lendingInstrumentManagerAddress,
      value: '20000'
    });
    expectEvent(receipt, 'Transfer', {
      from: lendingInstrumentManagerAddress,
      to: lendingInstrumentEscrowAddress,
      value: '20000'
    });
    assert.equal(20000, await instrumentEscrow.getTokenBalance(maker1, lendingToken.address));
    assert.equal(0, await issuanceEscrow.getTokenBalance(maker1, lendingToken.address));
  }),
  it('engagement due after engaged', async () => {
    await lendingToken.transfer(maker1, 20000);
    await lendingToken.approve(instrumentEscrowAddress, 20000, {from: maker1});
    await instrumentEscrow.depositToken(lendingToken.address, 20000, {from: maker1});

    let lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address,
        lendingToken.address, 20000, 15000, 20, 10000);
    let createdIssuance = await instrumentManager.createIssuance(lendingMakerParameters, {from: maker1});
    await collateralToken.transfer(taker1, 4000000);
    await collateralToken.approve(instrumentEscrowAddress, 4000000, {from: taker1});
    await instrumentEscrow.depositToken(collateralToken.address, 4000000, {from: taker1});
    await instrumentManager.engageIssuance(1, '0x0', {from: taker1});
    let notifyEngagementDue = await instrumentManager.notifyCustomEvent(1, web3.utils.fromAscii("engagement_due"), web3.utils.fromAscii(""), {from: maker1});
    assert.equal(2, await instrumentManager.getIssuanceState(1));
  }),
  it('engagement due before due date', async () => {
    await lendingToken.transfer(maker1, 20000);
    await lendingToken.approve(instrumentEscrowAddress, 20000, {from: maker1});
    await instrumentEscrow.depositToken(lendingToken.address, 20000, {from: maker1});

    let lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address,
        lendingToken.address, 20000, 15000, 20, 10000);
    let createdIssuance = await instrumentManager.createIssuance(lendingMakerParameters, {from: maker1});
    let notifyEngagementDue = await instrumentManager.notifyCustomEvent(1, web3.utils.fromAscii("engagement_due"), web3.utils.fromAscii(""), {from: maker1});
    assert.equal(1, await instrumentManager.getIssuanceState(1));
  }),
  it('lending due after engaged', async () => {
    await lendingToken.transfer(maker1, 20000);
    await lendingToken.approve(instrumentEscrowAddress, 20000, {from: maker1});
    await instrumentEscrow.depositToken(lendingToken.address, 20000, {from: maker1});
    let abis = [].concat(Lending.abi, TokenMock.abi, IssuanceEscrow.abi);

    let lendingMakerParameters = await parametersUtil.getLendingMakerParameters(collateralToken.address,
        lendingToken.address, 20000, 15000, 20, 10000);
    let createdIssuance = await instrumentManager.createIssuance(lendingMakerParameters, {from: maker1});
    let createdIssuanceEvents = LogParser.logParser(createdIssuance.receipt.rawLogs, abis);
    let issuanceEscrowAddress = createdIssuanceEvents.find((event) => event.event === 'LendingCreated').args.escrowAddress;
    let issuanceEscrow = await IssuanceEscrowInterface.at(issuanceEscrowAddress);

    await collateralToken.transfer(taker1, 4000000);
    await collateralToken.approve(instrumentEscrowAddress, 4000000, {from: taker1});
    await instrumentEscrow.depositToken(collateralToken.address, 4000000, {from: taker1});
    await instrumentManager.engageIssuance(1, '0x0', {from: taker1});
    await web3.currentProvider.send({jsonrpc: 2.0, method: 'evm_increaseTime', params: [8640000], id: 0}, (err, result) => { console.log(err, result)});
    let notifyLendingDue = await instrumentManager.notifyCustomEvent(1, web3.utils.fromAscii("lending_due"), web3.utils.fromAscii(""), {from: maker1});
    assert.equal(7, await instrumentManager.getIssuanceState(1));

    let notifyLendingDueEvents = LogParser.logParser(notifyLendingDue.receipt.rawLogs, abis);
    let receipt = {logs: notifyLendingDueEvents};

    assert.equal(3000000, await instrumentEscrow.getTokenBalance(maker1, collateralToken.address));
    assert.equal(1000000, await instrumentEscrow.getTokenBalance(taker1, collateralToken.address));
    assert.equal(0, await issuanceEscrow.getTokenBalance(maker1, collateralToken.address));
    assert.equal(0, await issuanceEscrow.getTokenBalance(taker1, collateralToken.address));
    expectEvent(receipt, 'LendingDelinquent', {
      issuanceId: new BN(1)
    });
    expectEvent(receipt, 'BalanceDecreased', {
      account: taker1,
      token: collateralToken.address,
      amount: '3000000'
    });
    expectEvent(receipt, 'BalanceIncreased', {
      account: maker1,
      token: collateralToken.address,
      amount: '3000000'
    });
    expectEvent(receipt, 'Transfer', {
      from: issuanceEscrowAddress,
      to: lendingInstrumentManagerAddress,
      value: '3000000'
    });
    expectEvent(receipt, 'Transfer', {
      from: lendingInstrumentManagerAddress,
      to: lendingInstrumentEscrowAddress,
      value: '3000000'
    });
  })
});
