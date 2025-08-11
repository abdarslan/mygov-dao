import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-network-helpers";
import "@nomicfoundation/hardhat-verify";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-diamond-abi";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200 // Standard setting for contracts
      },
      viaIR: true, // Enable via-ir for better optimization
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
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
    alwaysGenerateOverloads: false,
    externalArtifacts: [
      "artifacts/contracts/**/!(*dbg).json",
      "!artifacts/build-info/**/*",
      "!artifacts/hardhat-diamond-abi/**/*"
    ],
  },
  diamondAbi: {
    // This will generate a combined ABI for your diamond
    name: "MyGovDiamond",
    include: ["contracts/facets"],
    exclude: ["test", "mock"],
    strict: false, // Set to false initially to avoid strict validation
    filter: (abiElement: any) => {
      // Filter out constructor, fallback and receive functions
      return abiElement.type === "function" && abiElement.name !== "init";
    },
  },
};

export default config;
