require("@nomiclabs/hardhat-waffle");
// require("@nomiclabs/hardhat-ganache");

module.exports = {
  defaultNetwork: "localhost",
  solidity: {
    compilers: [
      {
        version: "0.8.11",
        settings: {
          optimizer: {
            runs: 200,
            enabled: true
          }
        }
      },
      {
        version: "0.5.2",
        settings: {
          optimizer: {
            runs: 200,
            enabled: true
          }
        }
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 9999,
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
      timeout: 1800000
    },
  }
};
