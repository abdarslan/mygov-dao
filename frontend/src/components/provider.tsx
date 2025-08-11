// src/providers.tsx or src/wagmi.ts

import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// 1. Get a WalletConnect Project ID from https://cloud.walletconnect.com
// This is required to enable WalletConnect and is free to get.
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'your_project_id_here';

// 2. Configure chains and create a wagmi config
const config = getDefaultConfig({
  appName: 'MyGov DAO',
  projectId,
  chains: [mainnet, sepolia],
  transports: {
    // This is the new way to configure RPC providers in Wagmi v2
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  // The 'ssr' flag is important for frameworks like Next.js, but good to have.
  ssr: true,
});

// 3. Create a TanStack Query client. This is a required peer dependency for wagmi v2.
const queryClient = new QueryClient();

// 4. This component wraps your app to provide blockchain connection context
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}