require("dotenv").config();

const config = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    amoy: {
      url: process.env.WEB3_PROVIDER_URL || "https://polygon-amoy.g.alchemy.com/v2/KqKzBuL8_IJaDsZBYYVmR",
      accounts: process.env.WEB3_PRIVATE_KEY ? [process.env.WEB3_PRIVATE_KEY] : [],
      chainId: 80002,
      gasPrice: 35000000000, // 35 Gwei
    },
  },
  mocha: {
    timeout: 60000,
  },
};

module.exports = config;
