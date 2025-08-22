/**
 * Dashboard Page Component
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  BuildingStorefrontIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/providers/AuthProvider';

// Mock data for demo
const stats = [
  {
    name: 'Total Farms',
    value: '3',
    change: '+1',
    changeType: 'increase',
    icon: BuildingStorefrontIcon,
  },
  {
    name: 'Carbon Credits',
    value: '12.5',
    unit: 'tCO2e',
    change: '+3.2',
    changeType: 'increase',
    icon: CreditCardIcon,
  },
  {
    name: 'Total Income',
    value: '₹25,000',
    change: '+₹5,000',
    changeType: 'increase',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'MRV Reports',
    value: '5',
    change: '+2',
    changeType: 'increase',
    icon: DocumentChartBarIcon,
  },
];

const recentActivity = [
  {
    id: 1,
    type: 'Credit Issued',
    description: 'Farm A - Kharif 2024 verified',
    amount: '3.2 tCO2e',
    time: '2 hours ago',
  },
  {
    id: 2,
    type: 'MRV Completed',
    description: 'Farm B - Satellite verification done',
    time: '1 day ago',
  },
  {
    id: 3,
    type: 'Payment Received',
    description: 'Carbon credit sale payment',
    amount: '₹8,000',
    time: '3 days ago',
  },
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-farm':
        navigate('/app/farms/add');
        break;
      case 'process-mrv':
        navigate('/app/mrv');
        break;
      case 'view-credits':
        navigate('/app/credits');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.welcome')}, {user?.profile?.firstName}!
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Here's what's happening with your farms and carbon credits.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                        {stat.unit && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                            {stat.unit}
                          </span>
                        )}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.changeType === 'increase' ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
                        )}
                        <span className="sr-only">
                          {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                        </span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{t('dashboard.recentActivity')}</h3>
          </div>
          <div className="card-content">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <span className="text-primary-600 dark:text-primary-300 text-xs font-medium">
                            {activity.type[0]}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {activity.type}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {activity.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {activity.amount && (
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.amount}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 gap-4">
              <button 
                className="btn btn-primary btn-md w-full text-left hover:bg-primary-700 transition-colors duration-200"
                onClick={() => handleQuickAction('add-farm')}
              >
                <BuildingStorefrontIcon className="h-5 w-5 mr-3" />
                Add New Farm
              </button>
              <button 
                className="btn btn-secondary btn-md w-full text-left hover:bg-secondary-700 transition-colors duration-200"
                onClick={() => handleQuickAction('process-mrv')}
              >
                <DocumentChartBarIcon className="h-5 w-5 mr-3" />
                Process MRV Report
              </button>
              <button 
                className="btn btn-success btn-md w-full text-left hover:bg-success-700 transition-colors duration-200"
                onClick={() => handleQuickAction('view-credits')}
              >
                <CreditCardIcon className="h-5 w-5 mr-3" />
                View Carbon Credits
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Farming Methods Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Farming Methods Distribution</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">60%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">AWD Method</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">Alternate Wetting & Drying</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">30%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">SRI Method</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">System of Rice Intensification</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">10%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Conventional</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">Traditional Flooding</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
