'use client';

import { ReactNode, useEffect } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { sdk } from '@farcaster/miniapp-sdk';

// Wagmi config with Farcaster Mini App connector
const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  connectors: [
    farcasterMiniApp()
  ],
});

const queryClient = new QueryClient();

function MiniAppReady({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Signal to Farcaster that the app is ready
    sdk.actions.ready().catch(console.error);
  }, []);

  return <>{children}</>;
}

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MiniAppReady>
          {children}
        </MiniAppReady>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
