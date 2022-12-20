require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.7",
  paths: {
    sources: './contracts',
    artifacts: './frontend/src/artifacts'
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat:{
      chainId: 1337
    },
    goerli: {
      url: process.env.GOERLI_RPC_INFURA,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
