/**
 * Web3 Provider for blockchain integration
 */

import React, { ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'fallback-project-id';

// Create custom Polygon Amoy chain
const polygonAmoy = {
  ...polygon,
  id: 80002,
  name: 'Polygon Amoy',
  network: 'polygon-amoy',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_RPC_URL || 'https://polygon-amoy.g.alchemy.com/v2/KqKzBuL8_IJaDsZBYYVmR'],
    },
    public: {
      http: [import.meta.env.VITE_RPC_URL || 'https://polygon-amoy.g.alchemy.com/v2/KqKzBuL8_IJaDsZBYYVmR'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan Amoy',
      url: 'https://amoy.polygonscan.com',
    },
  },
  testnet: true,
};

// Create wagmi config
const config = createConfig({
  chains: [polygonAmoy],
  transports: {
    [polygonAmoy.id]: http(import.meta.env.VITE_RPC_URL || 'https://polygon-amoy.g.alchemy.com/v2/KqKzBuL8_IJaDsZBYYVmR'),
  },
});

// Create web3 modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  enableOnramp: false,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#0ea5e9',
    '--w3m-border-radius-master': '8px',
  },
});

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};
