/**
 * Header Component
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bars3Icon,
  SunIcon,
  MoonIcon,
  GlobeAltIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { WalletConnect } from '@/components/ui/WalletConnect';
import { BlockchainStatus } from '@/components/ui/BlockchainStatus';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { cn } from '@/utils/cn';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <div className="lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Page title - will be updated by individual pages */}
        <div className="flex-1 lg:flex-none">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {/* This will be set by individual page components */}
          </h1>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          {/* Blockchain Status */}
          <BlockchainStatus />
          
          {/* Wallet Connection */}
          <WalletConnect />
          
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>



          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            title={t('nav.logout')}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
