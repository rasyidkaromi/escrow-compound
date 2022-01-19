const path = require("path");

module.exports = {
  contracts_build_directory: path.join(__dirname, "src/abi"),
  networks: {
    develop: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "9999",
    },
  },
  compilers: {
    solc: {
      version: "0.8.11",
    }
  }
};
