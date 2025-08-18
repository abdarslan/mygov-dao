import { useState, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContractRead, useContractWrite } from './useContract';
import { formatUnits, parseUnits } from 'viem';

/**
 * Hook for managing MyGov token operations
 * Includes balance, faucet, transfer, and admin operations
 */
export const useToken = () => {
  const { address: account } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [lastActionMessage, setLastActionMessage] = useState<string>('');

  // Contract write hooks for both ERC20 and TLToken operations
  const { write: writeMyGov, isPending: pendingMyGov, isConfirming: confirmingMyGov, isSuccess: successMyGov, error: errorMyGov } = useContractWrite('erc20');
  const { write: writeTL, isPending: pendingTL, isConfirming: confirmingTL, isSuccess: successTL, error: errorTL } = useContractWrite('tltoken');
  const { write: writeDonation, isPending: pendingDonation, isConfirming: confirmingDonation, isSuccess: successDonation, error: errorDonation } = useContractWrite('donation');

  // Read MyGov token data
  const { 
    data: myGovBalance, 
    isLoading: myGovBalanceLoading, 
    refetch: refetchMyGovBalance 
  } = useContractRead<bigint>('erc20', 'balanceOf', [account], {
    enabled: !!account,
    watch: true,
  });

  const { data: myGovName } = useContractRead<string>('erc20', 'name');
  const { data: myGovSymbol } = useContractRead<string>('erc20', 'symbol');
  const { data: myGovTotalSupply } = useContractRead<bigint>('erc20', 'totalSupply');

  // Read TLToken data
  const { 
    data: tlTokenBalance, 
    isLoading: tlTokenBalanceLoading, 
    refetch: refetchTLTokenBalance 
  } = useContractRead<bigint>('tltoken', 'balanceOf', [account], {
    enabled: !!account,
    watch: true,
  });

  const { data: tlTokenName } = useContractRead<string>('tltoken', 'name');
  const { data: tlTokenSymbol } = useContractRead<string>('tltoken', 'symbol');
  const { data: tlTokenTotalSupply } = useContractRead<bigint>('tltoken', 'totalSupply');
  const { data: tlTokenDecimals } = useContractRead<number>('tltoken', 'decimals');

  // Format balances for display (MyGov has 0 decimals, TLToken has 18)
  const formattedMyGovBalance = myGovBalance;
  const formattedTLTokenBalance = tlTokenBalance ? formatUnits(tlTokenBalance, 18) : '0';

  // Reset messages and errors
  const resetMessages = useCallback(() => {
    setError('');
    setLastActionMessage('');
  }, []);

  // MyGov Token Faucet function
  const faucet = useCallback(async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    resetMessages();
    setIsLoading(true);

    try {
      writeMyGov('faucet', []);
    } catch (err: any) {
      console.error('Faucet error:', err);
      setError(`Failed to execute faucet transaction: ${err.message || err.reason || 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [account, writeMyGov, resetMessages]);

  // MyGov Token Send function (owner only)
  const sendMyGovToken = useCallback(async (toAddress: string, amount: string) => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!toAddress || !amount) {
      setError('Please provide recipient address and amount');
      return;
    }

    resetMessages();
    setIsLoading(true);

    try {
      // MyGov tokens have 0 decimals
      const amountInWei = BigInt(amount);
      writeMyGov('sendTokens', [toAddress, amountInWei]);
    } catch (err: any) {
      console.error('Send MyGov token error:', err);
      setError(`Failed to send MyGov tokens: ${err.message || err.reason || 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [account, writeMyGov, resetMessages]);

  // TLToken Mint function (owner only)
  const mintTlToken = useCallback(async (address: string, amount: string) => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!address || !amount) {
      setError('Please provide recipient address and amount');
      return;
    }

    resetMessages();
    setIsLoading(true);

    try {
      // TLToken has 18 decimals
      const amountInWei = parseUnits(amount, tlTokenDecimals || 0);
      writeTL('mint', [address, amountInWei]);
    } catch (err: any) {
      console.error('Mint TL token error:', err);
      setError(`Failed to mint TL tokens: ${err.message || err.reason || 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [account, writeTL, resetMessages, tlTokenDecimals]);

  // Regular transfer function for MyGov tokens
  const transfer = useCallback(async (to: string, amount: string) => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!to || !amount) {
      setError('Please provide recipient address and amount');
      return;
    }

    resetMessages();
    setIsLoading(true);

    try {
      // Convert amount to wei (MyGov tokens have 0 decimals)
      const amountInWei = BigInt(amount);
      writeMyGov('transfer', [to, amountInWei]);
    } catch (err: any) {
      console.error('Transfer error:', err);
      setError(`Failed to transfer tokens: ${err.message || err.reason || 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [account, writeMyGov, resetMessages]);

  // Approve function for MyGov allowances
  const approve = useCallback(async (spender: string, amount: string) => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    resetMessages();
    setIsLoading(true);

    try {
      const amountInWei = BigInt(amount);
      writeMyGov('approve', [spender, amountInWei]);
    } catch (err: any) {
      console.error('MyGov Approve error:', err);
      setError(`Failed to approve MyGov tokens: ${err.message || err.reason || 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [account, writeMyGov, resetMessages]);

  // Approve function for TLToken allowances
  const approveTLToken = useCallback(async (spender: string, amount: string) => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    resetMessages();
    setIsLoading(true);

    try {
      // TLToken has 18 decimals
      const amountInWei = parseUnits(amount, tlTokenDecimals || 0);
      writeTL('approve', [spender, amountInWei]);
    } catch (err: any) {
      console.error('TLToken Approve error:', err);
      setError(`Failed to approve TLToken: ${err.message || err.reason || 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [account, writeTL, resetMessages, tlTokenDecimals]);

  // Handle transaction status changes for MyGov operations
  useEffect(() => {
    if (successMyGov) {
      setLastActionMessage('MyGov transaction successful!');
      setIsLoading(false);
      // Refetch balance after successful transaction
      refetchMyGovBalance();
    }
  }, [successMyGov, refetchMyGovBalance]);

  // Handle transaction status changes for TLToken operations
  useEffect(() => {
    if (successTL) {
      setLastActionMessage('TL Token transaction successful!');
      setIsLoading(false);
      // Refetch both balances after successful transaction
      refetchTLTokenBalance();
      refetchMyGovBalance();
    }
  }, [successTL, refetchTLTokenBalance, refetchMyGovBalance]);

  // Handle errors
  useEffect(() => {
    if (errorMyGov) {
      setError(`MyGov transaction failed: ${errorMyGov.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [errorMyGov]);

  useEffect(() => {
    if (errorTL) {
      setError(`TL Token transaction failed: ${errorTL.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [errorTL]);

  useEffect(() => {
    if (errorDonation) {
      setError(`Donation transaction failed: ${errorDonation.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [errorDonation]);

  useEffect(() => {
    if (successDonation) {
      setLastActionMessage('Donation successful! Thank you for your contribution.');
      setIsLoading(false);
      // Refetch balances after successful donation
      refetchMyGovBalance();
      refetchTLTokenBalance();
    }
  }, [successDonation, refetchMyGovBalance, refetchTLTokenBalance]);

  // Update loading state based on transaction status
  useEffect(() => {
    setIsLoading(pendingMyGov || confirmingMyGov || pendingTL || confirmingTL || pendingDonation || confirmingDonation);
  }, [pendingMyGov, confirmingMyGov, pendingTL, confirmingTL, pendingDonation, confirmingDonation]);

  // Donation functions
  const donateMyGovToken = useCallback(async (amount: string) => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount) {
      setError('Please provide donation amount');
      return;
    }

    resetMessages();
    setIsLoading(true);

    try {
      // MyGov tokens have 0 decimals
      const amountInWei = BigInt(amount);
      writeDonation('donateMyGovToken', [amountInWei]);
    } catch (err: any) {
      console.error('Donate MyGov token error:', err);
      setError(`Failed to donate MyGov tokens: ${err.message || err.reason || 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [account, writeDonation, resetMessages]);

  const donateTLToken = useCallback(async (amount: string) => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount) {
      setError('Please provide donation amount');
      return;
    }

    resetMessages();
    setIsLoading(true);

    try {
      // TLToken has 18 decimals
      const amountInWei = parseUnits(amount, tlTokenDecimals || 18);
      writeDonation('donateTLToken', [amountInWei]);
    } catch (err: any) {
      console.error('Donate TL token error:', err);
      setError(`Failed to donate TL tokens: ${err.message || err.reason || 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [account, writeDonation, resetMessages, tlTokenDecimals]);

  return {
    // MyGov Token data
    myGovBalance: formattedMyGovBalance,
    myGovTokenName: myGovName || 'MyGov Token',
    myGovTokenSymbol: myGovSymbol || 'MYGOV',
    myGovTotalSupply: myGovTotalSupply ? formatUnits(myGovTotalSupply, 0) : '0',
    
    // TL Token data
    tlTokenBalance: formattedTLTokenBalance,
    tlTokenName: tlTokenName || 'TL Token',
    tlTokenSymbol: tlTokenSymbol || 'TL',
    tlTokenTotalSupply: tlTokenTotalSupply ? formatUnits(tlTokenTotalSupply, tlTokenDecimals || 0) : '0',
    tlTokenDecimals: tlTokenDecimals || 0,
    
    // Loading states
    isLoading: isLoading || myGovBalanceLoading || tlTokenBalanceLoading,
    isPending: pendingMyGov || pendingTL || pendingDonation,
    isConfirming: confirmingMyGov || confirmingTL || confirmingDonation,
    
    // Messages and errors
    error,
    lastActionMessage,
    
    // MyGov Token Actions
    faucet,
    transfer,
    approve,
    sendMyGovToken,
    donateMyGovToken,
    
    // TL Token Actions
    mintTlToken,
    approveTLToken,
    donateTLToken,
    
    // Utility functions
    resetMessages,
    refetchMyGovBalance,
    refetchTLTokenBalance,
    
    // Transaction status
    isSuccess: successMyGov || successTL || successDonation,
    
    // Formatting utilities
    formatTLAmount: (amount: bigint) => formatUnits(amount, 18),
    formatMyGovAmount: (amount: bigint) => formatUnits(amount, 0),
  };
};

/**
 * Hook for reading token allowances
 */
export const useTokenAllowance = (owner?: string, spender?: string) => {
  const { data: allowance, isLoading, refetch } = useContractRead<bigint>(
    'erc20', 
    'allowance', 
    [owner, spender],
    {
      enabled: !!(owner && spender),
    }
  );

  return {
    allowance: allowance ? formatUnits(allowance, 0) : '0',
    isLoading,
    refetch,
  };
};
