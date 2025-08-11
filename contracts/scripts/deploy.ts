/**
 * Modern Diamond Deployment Script - 2025 Edition
 * 
 * Features:
 * - TypeScript strict mode compliance
 * - Better error handling and validation
 * - Comprehensive logging
 * - Gas optimization tracking
 * - Automatic ABI and address export
 * - Modern async/await patterns
 * - Transaction confirmation with retries
 */

import hre from "hardhat";
import { Contract } from "ethers";
import { FacetCutAction, getSelectors, Facet } from './libraries/diamond';
import * as fs from 'fs';
import * as path from 'path';

// Use require for hardhat ethers to match working pattern
const { ethers } = require("hardhat");

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DeployedData {
  addresses: Record<string, string>;
  abis: Record<string, any>;
  deploymentInfo: {
    network: string;
    chainId: number;
    deployer: string;
    timestamp: string;
    gasUsed: Record<string, string>;
  };
}

interface FacetCut {
  facetAddress: string;
  action: FacetCutAction;
  functionSelectors: string[];
}

interface DeploymentResult {
  diamondAddress: string;
  gasUsed: bigint;
  txHash: string;
}

interface FacetDeploymentConfig {
  name: string;
  constructorArgs?: any[];
  gasLimit?: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const FACET_CONFIGS: FacetDeploymentConfig[] = [
  { name: 'DiamondLoupeFacet' },
  { name: 'OwnershipFacet' },
  { name: 'GovFacet' },
  { name: 'ERC20Facet' },
  { name: 'GetterFacet' },
  { name: 'SurveyFacet' },
  { name: 'DonationFacet' }
];

const DEPLOYMENT_CONFIG = {
  // Token configuration
  TOKEN_NAME: "My Governance",
  TOKEN_SYMBOL: "MYGOV",
  TOKEN_DECIMALS: 18,
  INITIAL_SUPPLY: ethers.parseUnits("10000000", 18), // 10 million tokens
  
  // Deployment settings
  MAX_RETRIES: 3,
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Enhanced logging with timestamps and context
 */
function log(message: string, level: 'info' | 'success' | 'error' | 'warn' = 'info'): void {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warn: '⚠️'
  }[level];
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

/**
 * Wait for transaction confirmation with retries - Hardhat compatible
 */
async function waitForConfirmation(deployTx: any, maxRetries: number = DEPLOYMENT_CONFIG.MAX_RETRIES) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // For Hardhat, we wait for the deployment transaction directly
      const receipt = await deployTx.wait();
      if (receipt && receipt.status === 1) {
        return receipt;
      }
      throw new Error(`Transaction failed: ${deployTx.hash}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      log(`Retry ${i + 1}/${maxRetries} for transaction ${deployTx.hash}`, 'warn');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
    }
  }
}

/**
 * Deploy a single contract with enhanced error handling
 */
async function deployContract(
  contractName: string, 
  args: any[] = [], 
  gasLimit?: number
): Promise<{ contract: any; gasUsed: bigint; txHash: string }> {
  try {
    log(`Deploying ${contractName}...`);
    
    const ContractFactory = await ethers.getContractFactory(contractName);
    const deployOptions: any = {};
    
    if (gasLimit) {
      deployOptions.gasLimit = gasLimit;
    }
    
    const contract = await ContractFactory.deploy(...args, deployOptions);
    const deployTx = contract.deploymentTransaction();
    
    if (!deployTx) {
      throw new Error(`Failed to get deployment transaction for ${contractName}`);
    }
    
    log(`Waiting for ${contractName} deployment confirmation...`);
    const receipt = await waitForConfirmation(deployTx);
    
    if (!receipt) {
      throw new Error(`Failed to get receipt for ${contractName}`);
    }
    
    const address = await contract.getAddress();
    log(`${contractName} deployed at: ${address}`, 'success');
    
    return {
      contract,
      gasUsed: receipt.gasUsed,
      txHash: deployTx.hash
    };
  } catch (error) {
    log(`Failed to deploy ${contractName}: ${error instanceof Error ? error.message : String(error)}`, 'error');
    throw error;
  }
}

export async function deployDiamond(): Promise<DeploymentResult> {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  log('🚀 Starting Diamond Deployment', 'info');
  log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  log(`Deployer: ${deployer.address}`);
  log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  
  let totalGasUsed = BigInt(0);
  const gasTracker: Record<string, string> = {};
  
  const deployedData: DeployedData = {
    addresses: {},
    abis: {},
    deploymentInfo: {
      network: network.name,
      chainId: Number(network.chainId),
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      gasUsed: {}
    }
  };

  try {
    // 1. Deploy TLToken
    log('📋 Step 1: Deploying TLToken');
    const tlTokenResult = await deployContract('TLToken');
    const tlTokenAddress = await tlTokenResult.contract.getAddress();
    
    deployedData.addresses.tlToken = tlTokenAddress;
    deployedData.abis.TLToken = tlTokenResult.contract.interface.formatJson();
    gasTracker.TLToken = ethers.formatUnits(tlTokenResult.gasUsed, 'gwei');
    totalGasUsed += tlTokenResult.gasUsed;

    // 2. Deploy DiamondCutFacet
    log('📋 Step 2: Deploying DiamondCutFacet');
    const diamondCutResult = await deployContract('DiamondCutFacet');
    const diamondCutFacetAddress = await diamondCutResult.contract.getAddress();
    
    deployedData.addresses.diamondCutFacet = diamondCutFacetAddress;
    deployedData.abis.DiamondCutFacet = diamondCutResult.contract.interface.formatJson();
    gasTracker.DiamondCutFacet = ethers.formatUnits(diamondCutResult.gasUsed, 'gwei');
    totalGasUsed += diamondCutResult.gasUsed;

    // 3. Deploy Diamond (MyGov)
    log('📋 Step 3: Deploying MyGov Diamond');
    const diamondResult = await deployContract('MyGov', [deployer.address, diamondCutFacetAddress]);
    const diamondAddress = await diamondResult.contract.getAddress();
    
    deployedData.addresses.diamond = diamondAddress;
    gasTracker.MyGov = ethers.formatUnits(diamondResult.gasUsed, 'gwei');
    totalGasUsed += diamondResult.gasUsed;

    // 4. Deploy DiamondInit
    log('📋 Step 4: Deploying DiamondInit');
    const diamondInitResult = await deployContract('DiamondInit');
    const diamondInitAddress = await diamondInitResult.contract.getAddress();
    
    deployedData.addresses.diamondInit = diamondInitAddress;
    deployedData.abis.DiamondInit = diamondInitResult.contract.interface.formatJson();
    gasTracker.DiamondInit = ethers.formatUnits(diamondInitResult.gasUsed, 'gwei');
    totalGasUsed += diamondInitResult.gasUsed;

    // 5. Deploy Facets
    log('📋 Step 5: Deploying Facets');
    const facetCuts: FacetCut[] = [];
    
    for (const facetConfig of FACET_CONFIGS) {
      const facetResult = await deployContract(
        facetConfig.name, 
        facetConfig.constructorArgs || [], 
        facetConfig.gasLimit
      );
      
      const facetAddress = await facetResult.contract.getAddress();
      deployedData.addresses[facetConfig.name] = facetAddress;
      deployedData.abis[facetConfig.name] = facetResult.contract.interface.formatJson();
      gasTracker[facetConfig.name] = ethers.formatUnits(facetResult.gasUsed, 'gwei');
      totalGasUsed += facetResult.gasUsed;

      // Extract selectors from the deployed facet contract
      const selectors = getSelectors(facetResult.contract);

      facetCuts.push({
        facetAddress,
        action: FacetCutAction.Add,
        functionSelectors: selectors
      });
    }

    // 6. Perform Diamond Cut
    log('📋 Step 6: Performing Diamond Cut');
    log(`Cutting ${facetCuts.length} facets into diamond`);
    
    const diamondCut = await ethers.getContractAt('IDiamondCut', diamondAddress);
    
    // Prepare initialization call
    const functionCall = diamondInitResult.contract.interface.encodeFunctionData("initAll", [
      DEPLOYMENT_CONFIG.TOKEN_NAME,
      DEPLOYMENT_CONFIG.TOKEN_SYMBOL,
      DEPLOYMENT_CONFIG.TOKEN_DECIMALS,
      DEPLOYMENT_CONFIG.INITIAL_SUPPLY,
      deployer.address,
      tlTokenAddress
    ]);

    // Execute diamond cut
    log('Executing diamond cut transaction...');
    const cutTx = await diamondCut.diamondCut(facetCuts, diamondInitAddress, functionCall);
    log(`Diamond cut transaction hash: ${cutTx.hash}`);
    
    const cutReceipt = await waitForConfirmation(cutTx);
    if (!cutReceipt || cutReceipt.status !== 1) {
      throw new Error(`Diamond cut failed: ${cutTx.hash}`);
    }
    
    gasTracker.DiamondCut = ethers.formatUnits(cutReceipt.gasUsed, 'gwei');
    totalGasUsed += cutReceipt.gasUsed;
    
    log('✅ Diamond cut completed successfully!', 'success');

    // 7. Export deployment data
    await exportDeploymentData(deployedData, gasTracker);
    
    log(`🎉 Deployment completed! Total gas used: ${ethers.formatUnits(totalGasUsed, 'gwei')} Gwei`, 'success');
    
    return {
      diamondAddress,
      gasUsed: totalGasUsed,
      txHash: cutTx.hash
    };
    
  } catch (error) {
    log(`Deployment failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
    throw error;
  }
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export deployment data to frontend
 */
async function exportDeploymentData(deployedData: DeployedData, gasTracker: Record<string, string>): Promise<void> {
  try {
    // Update gas usage in deployment info
    deployedData.deploymentInfo.gasUsed = gasTracker;
    
    const frontendDir = path.resolve(__dirname, '..', '..', 'frontend');
    const exportDir = path.join(frontendDir, 'src', 'contract-data');
    const addressesFile = path.join(exportDir, 'addresses.json');
    const abisDir = path.join(exportDir, 'abis');
    const deploymentInfoFile = path.join(exportDir, 'deployment-info.json');

    // Create directories if they don't exist
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    if (!fs.existsSync(abisDir)) {
      fs.mkdirSync(abisDir, { recursive: true });
    }

    // Write addresses.json
    fs.writeFileSync(addressesFile, JSON.stringify(deployedData.addresses, null, 2));
    log(`📁 Addresses exported to: ${addressesFile}`, 'success');

    // Write deployment info
    fs.writeFileSync(deploymentInfoFile, JSON.stringify(deployedData.deploymentInfo, null, 2));
    log(`📁 Deployment info exported to: ${deploymentInfoFile}`, 'success');

    // Write individual ABI files
    for (const contractName in deployedData.abis) {
      const abiFilePath = path.join(abisDir, `${contractName}.json`);
      const abiData = typeof deployedData.abis[contractName] === 'string' 
        ? JSON.parse(deployedData.abis[contractName])
        : deployedData.abis[contractName];
      
      fs.writeFileSync(abiFilePath, JSON.stringify(abiData, null, 2));
      log(`📁 ABI for ${contractName} exported to: ${abiFilePath}`, 'success');
    }

    // Create a combined diamond ABI for easy frontend usage
    const diamondAbiPath = path.join(abisDir, 'DiamondCombined.json');
    const combinedAbi = Object.values(deployedData.abis)
      .map(abi => typeof abi === 'string' ? JSON.parse(abi) : abi)
      .flat();
    
    fs.writeFileSync(diamondAbiPath, JSON.stringify(combinedAbi, null, 2));
    log(`📁 Combined Diamond ABI exported to: ${diamondAbiPath}`, 'success');

  } catch (error) {
    log(`Failed to export deployment data: ${error instanceof Error ? error.message : String(error)}`, 'error');
    throw error;
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Main deployment function with enhanced error handling
 */
async function main(): Promise<void> {
  try {
    log('🚀 Starting MyGov Diamond Deployment Process', 'info');
    
    const result = await deployDiamond();
    
    log('🎉 Deployment Summary:', 'success');
    log(`   Diamond Address: ${result.diamondAddress}`);
    log(`   Total Gas Used: ${ethers.formatUnits(result.gasUsed, 'gwei')} Gwei`);
    log(`   Final Transaction: ${result.txHash}`);
    log('📋 All contract addresses and ABIs have been exported to frontend/src/contract-data/');
    
    process.exit(0);
  } catch (error) {
    log(`💥 Deployment failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
    
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

// Only run main if this script is executed directly
if (require.main === module) {
  main();
}
