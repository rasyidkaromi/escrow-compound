const EscrowCompound = artifacts.require("EscrowCompound");
const { ethers } = require('ethers')

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(EscrowCompound);
  let escr = await EscrowCompound.deployed()

  // add CETH Address
  await escr.addCEthAddress(
    '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
    { gas: 200000 }
  );

  await escr.addSingleAgent(
    accounts[1],
    { gas: 200000 }
  );
  await escr.addSingleAgent(
    accounts[2],
    { gas: 200000 }
  );

  await escr.init(
    'refId_' + new Date().getTime(), // _referenceId
    accounts[4], // _receiver
    accounts[1], // _agent
    { from: accounts[3], value: ethers.utils.parseEther('5.0') }
  );

  await escr.init(
    'refId_' + new Date().getTime(), // _referenceId
    accounts[3], // _receiver
    accounts[1], // _agent
    { from: accounts[4], value: ethers.utils.parseEther('5.0') }
  );


  await escr.init(
    'refId_' + new Date().getTime(), // _referenceId
    accounts[4], // _receiver
    accounts[2], // _agent
    { from: accounts[3], value: ethers.utils.parseEther('5.0') }
  );

  await escr.init(
    'refId_' + new Date().getTime(), // _referenceId
    accounts[3], // _receiver
    accounts[2], // _agent
    { from: accounts[4], value: ethers.utils.parseEther('5.0') }
  );
};
