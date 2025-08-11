import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200 // Standard setting for contracts
      }
    }
  },
  networks: {
    hardhat: {
      accounts: {
        count: 200
      }
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/Es26w6AtzixRqXask99ILF3qBmA1lQ19",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    token: "ETH",
  },
};

export default config;
