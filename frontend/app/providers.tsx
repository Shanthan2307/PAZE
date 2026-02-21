'use client';

import { useEffect, useState } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
import '@rainbow-me/rainbowkit/styles.css';

// Define ADI Testnet
export const adiTestnet = defineChain({
  id: 99999,
  name: 'ADI Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ADI',
    symbol: 'ADI',
  },
  rpcUrls: {
    default: { http: ['https://rpc.ab.testnet.adifoundation.ai/'] },
  },
  blockExplorers: {
    default: { name: 'ADI Explorer', url: 'https://explorer.ab.testnet.adifoundation.ai/' },
  },
  testnet: true,
});

const config = getDefaultConfig({
  appName: 'PAZE DAO',
  projectId: 'YOUR_PROJECT_ID',
  chains: [adiTestnet],
  transports: {
    [adiTestnet.id]: http(),
  },
  ssr: false,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {mounted ? (
          <RainbowKitProvider modalSize="compact">
            {children}
          </RainbowKitProvider>
        ) : (
          children
        )}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
