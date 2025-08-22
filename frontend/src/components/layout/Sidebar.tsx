/**
 * Sidebar Navigation Component
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  DocumentChartBarIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  UserIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/utils/cn';

const navigation = [
  { name: 'nav.dashboard', href: '/app/dashboard', icon: HomeIcon },
  { name: 'nav.farms', href: '/app/farms', icon: BuildingStorefrontIcon },
  { name: 'nav.mrv', href: '/app/mrv', icon: DocumentChartBarIcon },
  { name: 'nav.credits', href: '/app/credits', icon: CreditCardIcon },
  { name: 'nav.marketplace', href: '/app/marketplace', icon: ShoppingBagIcon },
];

const secondaryNavigation = [
  { name: 'nav.profile', href: '/app/profile', icon: UserIcon },
  { name: 'nav.help', href: '/app/help', icon: QuestionMarkCircleIcon },
];

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg lg:block hidden">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="text-center">
            <h1 className="text-lg font-bold text-primary-600">
              Mandla MRV
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Climate Solution
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                              location.pathname.startsWith(item.href + '/');
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    isActive
                      ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700',
                    'group flex items-center px-3 py-2 text-sm font-medium border-l-4 rounded-r-md'
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive
                        ? 'text-primary-500 dark:text-primary-300'
                        : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300',
                      'mr-3 h-5 w-5'
                    )}
                    aria-hidden="true"
                  />
                  {t(item.name)}
                </NavLink>
              );
            })}
          </div>

          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Account
            </h3>
            <div className="mt-2 space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={cn(
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700',
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md'
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive
                          ? 'text-primary-500 dark:text-primary-300'
                          : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300',
                        'mr-3 h-5 w-5'
                      )}
                      aria-hidden="true"
                    />
                    {t(item.name)}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>

        {/* User info */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <span className="text-primary-600 dark:text-primary-300 text-sm font-medium">
                {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.profile?.village}, {user?.profile?.district}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
