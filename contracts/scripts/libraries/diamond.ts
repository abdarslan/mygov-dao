import { Contract, FunctionFragment} from "ethers";

export enum FacetCutAction {
  Add = 0,
  Replace = 1,
  Remove = 2
}

interface SelectorsWithMethods extends Array<string> {
  contract: Contract;
  remove: typeof remove;
  get: typeof get;
}

// get function selectors from ABI
export function getSelectors(contract: Contract): SelectorsWithMethods {
  const fragments = contract.interface.fragments.filter(
    (fragment): fragment is FunctionFragment => fragment.type === 'function'
  );
  const selectors = fragments.reduce((acc: string[], fragment) => {
    if (fragment.name !== 'init') {
      acc.push(contract.interface.getFunction(fragment.name)!.selector);
    }
    return acc;
  }, []) as SelectorsWithMethods;
  
  selectors.contract = contract;
  selectors.remove = remove;
  selectors.get = get;
  return selectors;
}

// get function selector from function signature
export function getSelector(func: string): string {
  const abiInterface = new ethers.Interface([func]);
  return abiInterface.getFunction(func)!.selector;
}

// used with getSelectors to remove selectors from an array of selectors
// functionNames argument is an array of function signatures
function remove(this: SelectorsWithMethods, functionNames: string[]): SelectorsWithMethods {
  const selectors = this.filter((v: string) => {
    for (const functionName of functionNames) {
      if (v === this.contract.interface.getFunction(functionName)!.selector) {
        return false;
      }
    }
    return true;
  }) as SelectorsWithMethods;
  
  selectors.contract = this.contract;
  selectors.remove = this.remove;
  selectors.get = this.get;
  return selectors;
}

// used with getSelectors to get selectors from an array of selectors
// functionNames argument is an array of function signatures
function get(this: SelectorsWithMethods, functionNames: string[]): SelectorsWithMethods {
  const selectors = this.filter((v: string) => {
    for (const functionName of functionNames) {
      if (v === this.contract.interface.getFunction(functionName)!.selector) {
        return true;
      }
    }
    return false;
  }) as SelectorsWithMethods;
  
  selectors.contract = this.contract;
  selectors.remove = this.remove;
  selectors.get = this.get;
  return selectors;
}

// remove selectors using an array of signatures
export function removeSelectors(selectors: string[], signatures: string[]): string[] {
  const iface = new ethers.Interface(signatures.map((v: string) => 'function ' + v));
  const removeSelectorsArray = signatures.map((v: string) => iface.getFunction(v)!.selector);
  return selectors.filter((v: string) => !removeSelectorsArray.includes(v));
}

interface Facet {
  facetAddress: string;
  functionSelectors: string[];
}

// find a particular address position in the return value of diamondLoupeFacet.facets()
export function findAddressPositionInFacets(facetAddress: string, facets: Facet[]): number | undefined {
  for (let i = 0; i < facets.length; i++) {
    if (facets[i].facetAddress === facetAddress) {
      return i;
    }
  }
  return undefined;
}


