import { ethers } from "hardhat";
import { Contract } from "ethers";
import { getSelectors, FacetCutAction } from './libraries/diamond';
import * as fs from 'fs';
import * as path from 'path';

interface DeployedData {
  addresses: Record<string, string>;
  abis: Record<string, string>;
}

interface Cut {
  facetAddress: string;
  action: number;
  functionSelectors: string[];
}

export async function deployDiamond(): Promise<string> {
  const accounts = await ethers.getSigners();
  const contractOwner = accounts[0];

  const deployedData: DeployedData = {
    addresses: {},
    abis: {}
  };

  // 1. Deploy TLToken
  const TLToken = await ethers.getContractFactory('TLToken');
  const tlToken = await TLToken.deploy();
  await tlToken.waitForDeployment();
  const tlTokenAddress = await tlToken.getAddress();
  console.log('TLToken deployed:', tlTokenAddress);
  deployedData.addresses.tlToken = tlTokenAddress;
  deployedData.abis.TLToken = JSON.stringify(tlToken.interface.format());

  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
  const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.waitForDeployment();
  const diamondCutFacetAddress = await diamondCutFacet.getAddress();
  console.log('DiamondCutFacet deployed:', diamondCutFacetAddress);
  deployedData.addresses.diamondCutFacet = diamondCutFacetAddress;
  deployedData.abis.DiamondCutFacet = JSON.stringify(diamondCutFacet.interface.format());

  // deploy Diamond
  const Diamond = await ethers.getContractFactory('MyGov');
  const diamond = await Diamond.deploy(contractOwner.address, diamondCutFacetAddress);
  await diamond.waitForDeployment();
  const diamondAddress = await diamond.getAddress();
  console.log('MyGov (Diamond) deployed:', diamondAddress);
  deployedData.addresses.diamond = diamondAddress;

  // deploy DiamondInit
  // DiamondInit provides a function that is called when the diamond is upgraded to initialize state variables
  // Read about how the diamondCut function works here: https://eips.ethereum.org/EIPS/eip-2535#addingreplacingremoving-functions
  const DiamondInit = await ethers.getContractFactory('DiamondInit');
  const diamondInit = await DiamondInit.deploy();
  await diamondInit.waitForDeployment();
  const diamondInitAddress = await diamondInit.getAddress();
  console.log('DiamondInit deployed:', diamondInitAddress);

  // deploy facets
  console.log('');
  console.log('Deploying facets');
  const FacetNames = [
    'DiamondLoupeFacet',
    'OwnershipFacet',
    'GovFacet',
    'ERC20Facet',
    'GetterFacet',
    'SurveyFacet',
    'DonationFacet'
  ];
  const cut: Cut[] = [];
  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractFactory(FacetName);
    const facet = await Facet.deploy();
    await facet.waitForDeployment();
    const facetAddress = await facet.getAddress();
    console.log(`${FacetName} deployed: ${facetAddress}`);

    deployedData.addresses[FacetName] = facetAddress;
    deployedData.abis[FacetName] = JSON.stringify(facet.interface.format());
    cut.push({
      facetAddress: facetAddress,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet as Contract)
    });
  }

  // upgrade diamond with facets
  console.log('');
  console.log('Diamond Cut:', cut);
  const diamondCut = await ethers.getContractAt('IDiamondCut', diamondAddress);
  let tx;
  let receipt;
  // call to init function
  const functionCall = diamondInit.interface.encodeFunctionData("initAll", [
    "My Governance",        // _name
    "MYGOV",              // _symbol
    18,                 // _decimals
    ethers.parseUnits("10000000", 18), // _initialSupply (e.g. 10 millions of tokens)
    contractOwner.address,      // _owner (your test deployer or owner address)
    tlTokenAddress     // _tlToken (address of your TLToken contract, or zero address if none)
  ]);
  tx = await diamondCut.diamondCut(cut, diamondInitAddress, functionCall);
  console.log('Diamond cut tx: ', tx.hash);
  receipt = await tx.wait();
  if (!receipt || !receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
  console.log('Completed diamond cut');
  const frontendDir = path.resolve(__dirname, '..', 'frontend'); // Adjust 'frontend' if your React app is not directly in the parent folder
  const exportDir = path.join(frontendDir, 'src', 'contract-data'); // A dedicated folder for contract data
  const addressesFile = path.join(exportDir, 'addresses.json');
  const abisDir = path.join(exportDir, 'abis');

  // Create directories if they don't exist
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  if (!fs.existsSync(abisDir)) {
    fs.mkdirSync(abisDir, { recursive: true });
  }

  // Write addresses.json
  fs.writeFileSync(addressesFile, JSON.stringify(deployedData.addresses, null, 2));
  console.log(`Deployed addresses exported to: ${addressesFile}`);

  // Write individual ABI files
  for (const facetName in deployedData.abis) {
    const abiFilePath = path.join(abisDir, `${facetName}.json`);
    fs.writeFileSync(abiFilePath, JSON.stringify(JSON.parse(deployedData.abis[facetName]), null, 2));
    console.log(`ABI for ${facetName} exported to: ${abiFilePath}`);
  }
  return diamondAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
async function main() {
  try {
    const diamondAddress = await deployDiamond();
    console.log("Deployment completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

// Only run main if this script is executed directly
if (require.main === module) {
  main();
}
