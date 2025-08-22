/**
 * Enhanced Wallet Connection Component
 * Supports Phantom, MetaMask, and Custom wallets
 */

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  WalletIcon, 
  CurrencyDollarIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface WalletInfo {
  address: string;
  type: 'phantom' | 'metamask' | 'custom';
  connected: boolean;
  balance?: number;
  currency?: string;
}

export const WalletConnect: React.FC = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);

  const connectWallet = async (walletType: 'phantom' | 'metamask' | 'custom') => {
    try {
      setWalletConnecting(true);
      
      switch (walletType) {
        case 'phantom':
          await connectPhantomWallet();
          break;
        case 'metamask':
          await connectMetamaskWallet();
          break;
        case 'custom':
          await connectCustomWallet();
          break;
        default:
          throw new Error('Unsupported wallet type');
      }
    } catch (error: any) {
      // Don't show error toast for user cancellations
      if (!error.message?.includes('cancelled') && !error.message?.includes('rejected')) {
        toast.error(`Failed to connect ${walletType} wallet: ${error.message}`);
      }
      console.error('Wallet connection error:', error);
    } finally {
      setWalletConnecting(false);
    }
  };

  const connectPhantomWallet = async () => {
    // Check if Phantom is installed
    if (!(window as any).solana || !(window as any).solana.isPhantom) {
      const installConfirmed = window.confirm(
        'Phantom wallet is not installed. Would you like to install it now?\n\n' +
        'Click OK to open the Phantom installation page, or Cancel to try a different wallet.'
      );
      
      if (installConfirmed) {
        window.open('https://phantom.app/', '_blank');
      }
      throw new Error('Phantom wallet not installed. Please install it first or try a different wallet.');
    }

    try {
      const response = await (window as any).solana.connect();
      const publicKey = response.publicKey.toString();
      
      setWalletInfo({
        address: publicKey,
        type: 'phantom',
        connected: true,
        balance: 0, // You can fetch actual SOL balance here
        currency: 'SOL'
      });
      
      toast.success('Phantom wallet connected successfully!');
      setShowWalletModal(false);
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Connection cancelled by user');
      } else if (error.message?.includes('User rejected')) {
        throw new Error('Connection rejected by user');
      } else {
        throw new Error('Failed to connect Phantom wallet. Please try again.');
      }
    }
  };

  const connectMetamaskWallet = async () => {
    if (!(window as any).ethereum) {
      const installConfirmed = window.confirm(
        'MetaMask is not installed. Would you like to install it now?\n\n' +
        'Click OK to open the MetaMask installation page, or Cancel to try a different wallet.'
      );
      
      if (installConfirmed) {
        window.open('https://metamask.io/', '_blank');
      }
      throw new Error('MetaMask not installed. Please install it first or try a different wallet.');
    }

    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      
      if (!account) {
        throw new Error('No accounts found. Please unlock MetaMask and try again.');
      }
      
      setWalletInfo({
        address: account,
        type: 'metamask',
        connected: true,
        balance: 0, // You can fetch actual ETH balance here
        currency: 'ETH'
      });
      
      toast.success('MetaMask wallet connected successfully!');
      setShowWalletModal(false);
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Connection cancelled by user');
      } else if (error.message?.includes('User rejected')) {
        throw new Error('Connection rejected by user');
      } else if (error.message?.includes('No accounts found')) {
        throw new Error('No accounts found. Please unlock MetaMask and try again.');
      } else {
        throw new Error('Failed to connect MetaMask wallet. Please try again.');
      }
    }
  };

  const connectCustomWallet = async () => {
    // For custom wallet integration, you can implement your own logic
    // This could be a custom modal for wallet address input
    const customAddress = prompt('Please enter your wallet address (e.g., 0x1234... or 5H...):');
    
    if (customAddress && customAddress.trim() && customAddress.trim().length >= 10) {
      setWalletInfo({
        address: customAddress.trim(),
        type: 'custom',
        connected: true,
        balance: 0,
        currency: 'CUSTOM'
      });
      
      toast.success('Custom wallet connected successfully!');
      setShowWalletModal(false);
    } else if (customAddress === null) {
      // User cancelled the prompt
      return;
    } else {
      throw new Error('Please enter a valid wallet address (minimum 10 characters)');
    }
  };

  const disconnectWallet = () => {
    setWalletInfo(null);
    toast.success('Wallet disconnected');
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!walletInfo?.connected) {
    return (
      <>
      <button
          onClick={() => setShowWalletModal(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <WalletIcon className="h-4 w-4 mr-2" />
        Connect Wallet
      </button>

        {/* Wallet Connection Modal */}
        {showWalletModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Connect Wallet</h2>
                  <button
                    onClick={() => setShowWalletModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Choose your preferred wallet to connect:
                  </p>
                  
                  {/* Helpful Tips */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Wallet Connection Tips:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• <strong>Phantom:</strong> Best for Solana blockchain</li>
                          <li>• <strong>MetaMask:</strong> Best for Ethereum/Polygon</li>
                          <li>• <strong>Custom:</strong> Enter any wallet address manually</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Phantom Wallet */}
                  <button
                    onClick={() => connectWallet('phantom')}
                    disabled={walletConnecting}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg font-bold">P</span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Phantom</div>
                        <div className="text-sm text-gray-500">Solana blockchain</div>
                      </div>
                    </div>
                    {walletConnecting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>

                  {/* MetaMask Wallet */}
                  <button
                    onClick={() => connectWallet('metamask')}
                    disabled={walletConnecting}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg font-bold">M</span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">MetaMask</div>
                        <div className="text-sm text-gray-500">Ethereum blockchain</div>
                      </div>
                    </div>
                    {walletConnecting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>

                  {/* Custom Wallet */}
                  <button
                    onClick={() => connectWallet('custom')}
                    disabled={walletConnecting}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg font-bold">C</span>
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Custom Wallet</div>
                        <div className="text-sm text-gray-500">Enter wallet address</div>
                      </div>
                    </div>
                    {walletConnecting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      By connecting your wallet, you agree to our terms of service and privacy policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Balance Display */}
      <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <CurrencyDollarIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
        <span className="text-sm font-medium text-green-700 dark:text-green-300">
          {walletInfo.balance || 0} {walletInfo.currency}
        </span>
      </div>

      {/* Wallet Address */}
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <WalletIcon className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {formatAddress(walletInfo.address)}
        </span>
      </div>

      {/* Disconnect Button */}
      <button
        onClick={disconnectWallet}
        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Disconnect
      </button>
    </div>
  );
};

// Declare global types for wallet interfaces
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
    };
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (params: any) => void) => void;
      removeListener: (event: string, callback: (params: any) => void) => void;
    };
  }
}
