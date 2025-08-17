import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import addresses from "../contract-data/addresses.json";
import GetterFacetABI from "../contract-data/abis/GetterFacet.json";
import GovFacetABI from "../contract-data/abis/GovFacet.json";
import SurveyFacetABI from "../contract-data/abis/SurveyFacet.json";
import DonationFacetABI from "../contract-data/abis/DonationFacet.json";
import ERC20FacetABI from "../contract-data/abis/ERC20Facet.json";
import TLTokenABI from "../contract-data/abis/TLToken.json";

// Available contract facets
export type ContractFacet = 'getter' | 'gov' | 'survey' | 'donation' | 'erc20' | 'tltoken';

// ABI mapping
const ABI_MAP = {
  getter: GetterFacetABI,
  gov: GovFacetABI,
  survey: SurveyFacetABI,
  donation: DonationFacetABI,
  erc20: ERC20FacetABI,
  tltoken: TLTokenABI,
} as const;

// Get contract address based on facet type
const getContractAddress = (facet: ContractFacet): `0x${string}` => {
  switch (facet) {
    case 'tltoken':
      return addresses.tlToken as `0x${string}`;
    default:
      return addresses.diamond as `0x${string}`;
  }
};

/**
 * Base hook for reading from any contract facet
 * This handles all the common contract connection logic
 */
export const useContractRead = <T = any>(
  facet: ContractFacet,
  functionName: string,
  args?: any[],
  options?: {
    enabled?: boolean;
    watch?: boolean;
  }
) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: getContractAddress(facet),
    abi: ABI_MAP[facet],
    functionName,
    args: args || [],
    query: {
      enabled: options?.enabled ?? true,
    },
  });

  return {
    data: data as T,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Base hook for writing to any contract facet
 * This handles all the common transaction logic
 */
export const useContractWrite = (facet: ContractFacet) => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const write = (functionName: string, args?: any[], value?: bigint) => {
    writeContract({
      address: getContractAddress(facet),
      abi: ABI_MAP[facet],
      functionName,
      args: args || [],
      ...(value && { value }),
    });
  };

  return {
    write,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
};

/**
 * Hook for common contract utility functions
 */
export const useContractUtils = () => {
  const formatDate = (timestamp: bigint | number) => {
    const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
    return new Date(ts * 1000).toLocaleDateString();
  };

  const formatEther = (value: bigint) => {
    // Simple ether formatting - you can use ethers.js for more precise formatting
    return (Number(value) / 1e18).toFixed(4);
  };

  const truncateAddress = (address: string, startChars: number = 6, endChars: number = 4) => {
    if (address.length <= startChars + endChars) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'Active': 'text-green-600',
      'Active Voting': 'text-blue-600',
      'Funded': 'text-green-600',
      'Voting Ended': 'text-orange-600',
      'Completed': 'text-gray-600',
      'Expired': 'text-red-600',
      'Pending': 'text-yellow-600',
    };
    return colorMap[status] || 'text-gray-600';
  };

  return {
    formatDate,
    formatEther,
    truncateAddress,
    truncateText,
    getStatusColor,
  };
};

/**
 * Multi-call hook for fetching multiple contract values at once
 */
export const useMultiContractRead = (
  calls: Array<{
    facet: ContractFacet;
    functionName: string;
    args?: any[];
  }>
) => {
  const results = calls.map(({ facet, functionName, args }) =>
    useContractRead(facet, functionName, args)
  );

  const isLoading = results.some(result => result.isLoading);
  const hasError = results.some(result => result.error);
  const data = results.map(result => result.data);

  return {
    data,
    isLoading,
    hasError,
    results,
  };
};
