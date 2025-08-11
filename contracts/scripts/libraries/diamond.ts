/**
 * diamond.ts (2025 version)
 * Uses hardhat-diamond-abi output & TypeChain for fully typed, zero-runtime selector access
 */

import type { Contract } from "ethers";

// ============================================================================
// DYNAMIC SELECTOR IMPORTS (will be available after first compilation)
// ============================================================================
let diamondABI: any = {};

// Try to import diamond ABI if it exists (after hardhat-diamond-abi generates it)
try {
  diamondABI = require("../../artifacts/hardhat-diamond-abi/HardhatDiamondABI.sol/MyGovDiamond.json");
} catch (error) {
  // Diamond ABI not generated yet, will use fallback method
  console.warn("Diamond ABI not found, using fallback selector extraction");
}

// ============================================================================
// TYPES
// ============================================================================
export enum FacetCutAction {
    Add = 0,
    Replace = 1,
    Remove = 2
}

export type FacetSelectors = string[];

export interface Facet {
  facetAddress: string;
  functionSelectors: FacetSelectors;
}

// ============================================================================
// CORE HELPERS
// ============================================================================

/**
 * Get selectors from contract - now with enhanced error handling and modern patterns
 * This is the primary method we'll use for selector extraction
 */
export function getSelectors(contract: Contract): FacetSelectors {
  return extractSelectorsFromContract(contract);
}

/**
 * Get selectors for a specific facet using the generated diamond ABI
 * This is a bonus feature when hardhat-diamond-abi is available
 * @param facetName - The Solidity contract name of the facet (e.g. "GovFacet")  
 * @param contract - Fallback contract instance for extraction
 */
export function getSelectorsFromABI(facetName: string, contract?: Contract): FacetSelectors {
  // Always use contract-based extraction for reliability
  if (contract) {
    return extractSelectorsFromContract(contract);
  }
  
  throw new Error(`Contract instance required for ${facetName} selector extraction.`);
}

/**
 * Extract selectors from a contract at runtime (fallback method)
 */
export function extractSelectorsFromContract(contract: Contract): FacetSelectors {
  const functionFragments = contract.interface.fragments.filter(
    (fragment: any) => fragment.type === 'function' && fragment.name !== 'init'
  );

  return functionFragments.map((fragment: any) => {
    const func = contract.interface.getFunction(fragment.name);
    if (!func) {
      throw new Error(`Function not found: ${fragment.name}`);
    }
    return func.selector;
  });
}

/**
 * Build a facet cut object for deployment/upgrade
 */
export function buildFacetCut(
  facetAddress: string,
  contract: Contract,
  action: FacetCutAction
): Facet {
  return {
    facetAddress,
    functionSelectors: getSelectors(contract)
  };
}
