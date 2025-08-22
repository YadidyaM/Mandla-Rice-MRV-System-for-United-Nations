/**
 * Simplified Blockchain Status Component
 * Shows basic blockchain status without Web3 dependencies
 */

import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export const BlockchainStatus: React.FC = () => {
  const [networkStatus, setNetworkStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [currentNetwork, setCurrentNetwork] = useState<string>('Unknown');

  useEffect(() => {
    // Check if MetaMask is available
    if ((window as any).ethereum) {
      setNetworkStatus('connected');
      
      // Try to get current network
      (window as any).ethereum.request({ method: 'eth_chainId' })
        .then((chainId: string) => {
          switch (chainId) {
            case '0x1':
              setCurrentNetwork('Ethereum Mainnet');
              break;
            case '0x89':
              setCurrentNetwork('Polygon');
              break;
            case '0x13881':
              setCurrentNetwork('Mumbai Testnet');
              break;
            case '0x13882':
              setCurrentNetwork('Polygon Amoy');
              break;
            default:
              setCurrentNetwork(`Chain ID: ${parseInt(chainId, 16)}`);
          }
        })
        .catch(() => {
          setCurrentNetwork('Ethereum Compatible');
        });
    } else {
      setNetworkStatus('disconnected');
      setCurrentNetwork('No Wallet');
    }
  }, []);

  if (networkStatus === 'checking') {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Checking...
        </span>
      </div>
    );
  }

  if (networkStatus === 'disconnected') {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <InformationCircleIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
          No Wallet
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
      <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
      <span className="text-sm font-medium text-green-700 dark:text-green-300">
        {currentNetwork}
      </span>
    </div>
  );
};

// Declare global types for ethereum interface
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (params: any) => void) => void;
      removeListener: (event: string, callback: (params: any) => void) => void;
    };
  }
}
