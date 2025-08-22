import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UsersIcon,
  MapIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CalendarIcon,
  MapPinIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface DashboardData {
  overview: {
    totalUsers: number;
    totalFarms: number;
    totalCarbonCredits: number;
    totalTransactions: number;
    totalRevenue: number;
    activeListings: number;
    pendingVerifications: number;
  };
  systemHealth: {
    status: string;
    database: string;
    timestamp: string;
    uptime: number;
    memory: any;
    version: string;
  };
  recentActivity: {
    recentUsers: any[];
    recentCredits: any[];
    recentTransactions: any[];
  };
  userGrowth: Array<{ date: string; count: number }>;
  creditTrends: Array<{ date: string; status: string; count: number; quantity: number }>;
}

interface User {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  profile?: {
    firstName: string;
    lastName: string;
    village: string;
    district: string;
  };
  _count: {
    farms: number;
    carbonCredits: number;
    purchases: number;
    sales: number;
  };
}

interface Farm {
  id: string;
  name: string;
  location: string;
  area: number;
  areaUnit: string;
  cropType: string;
  isActive: boolean;
  createdAt: string;
  farmer: {
    profile: {
      firstName: string;
      lastName: string;
      village: string;
      district: string;
    };
  };
  _count: {
    carbonCredits: number;
  };
}

interface CarbonCredit {
  id: string;
  title: string;
  quantity: number;
  pricePerCredit: number;
  status: string;
  verificationLevel: string;
  projectType: string;
  createdAt: string;
  farm: {
    name: string;
    farmer: {
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  };
}

interface Transaction {
  id: string;
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  carbonCredit: {
    title: string;
  };
  seller: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  buyer: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [carbonCredits, setCarbonCredits] = useState<CarbonCredit[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'users', name: 'User Management', icon: UsersIcon },
    { id: 'farms', name: 'Farm Management', icon: MapIcon },
    { id: 'credits', name: 'Carbon Credits', icon: CreditCardIcon },
    { id: 'transactions', name: 'Transactions', icon: CurrencyDollarIcon },
    { id: 'system', name: 'System Health', icon: CogIcon },
    { id: 'audit', name: 'Audit Logs', icon: ShieldCheckIcon }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/admin/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/v1/admin/users');
      setUsers(response.data.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const fetchFarms = async () => {
    try {
      const response = await axios.get('/api/v1/admin/farms');
      setFarms(response.data.data.farms);
    } catch (error) {
      console.error('Error fetching farms:', error);
      toast.error('Failed to fetch farms');
    }
  };

  const fetchCarbonCredits = async () => {
    try {
      const response = await axios.get('/api/v1/admin/carbon-credits');
      setCarbonCredits(response.data.data.credits);
    } catch (error) {
      console.error('Error fetching carbon credits:', error);
      toast.error('Failed to fetch carbon credits');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/v1/admin/transactions');
      setTransactions(response.data.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions');
    }
  };

  const updateUser = async (userId: string, updates: any) => {
    try {
      await axios.put(`/api/v1/admin/users/${userId}`, updates);
      toast.success('User updated successfully');
      fetchUsers();
      setShowUserModal(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const exportData = async (type: string, format: string = 'json') => {
    try {
      const response = await axios.get(`/api/v1/admin/export/${type}?format=${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`${type} data exported successfully`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'verified':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'inactive':
      case 'cancelled':
      case 'unverified':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'verified':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'pending':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'inactive':
      case 'cancelled':
      case 'unverified':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <EyeIcon className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Comprehensive system administration for UNDP and government officials
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchDashboardData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 inline mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && dashboardData && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UsersIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{dashboardData.overview.totalUsers}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <MapIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Farms</dt>
                        <dd className="text-lg font-medium text-gray-900">{dashboardData.overview.totalFarms}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CreditCardIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Carbon Credits</dt>
                        <dd className="text-lg font-medium text-gray-900">{dashboardData.overview.totalCarbonCredits}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                        <dd className="text-lg font-medium text-gray-900">{formatCurrency(dashboardData.overview.totalRevenue)}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">System Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      dashboardData.systemHealth.status === 'healthy' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-sm text-gray-600">Status: {dashboardData.systemHealth.status}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Database: {dashboardData.systemHealth.database}
                  </div>
                  <div className="text-sm text-gray-600">
                    Uptime: {Math.floor(dashboardData.systemHealth.uptime / 3600)}h {Math.floor((dashboardData.systemHealth.uptime % 3600) / 60)}m
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Users */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Users</h3>
                  <div className="space-y-3">
                    {dashboardData.recentActivity.recentUsers.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.profile?.firstName?.[0] || user.email[0].toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.profile?.firstName} {user.profile?.lastName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Carbon Credits */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Carbon Credits</h3>
                  <div className="space-y-3">
                    {dashboardData.recentActivity.recentCredits.slice(0, 5).map((credit) => (
                      <div key={credit.id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <CreditCardIcon className="w-6 h-6 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{credit.title}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {credit.quantity} credits • {formatCurrency(credit.pricePerCredit)}/credit
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusColor(credit.status)
                          }`}>
                            {credit.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Transactions</h3>
                  <div className="space-y-3">
                    {dashboardData.recentActivity.recentTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <CurrencyDollarIcon className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transaction.carbonCredit.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {transaction.quantity} credits • {formatCurrency(transaction.totalAmount)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusColor(transaction.status)
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <button
                onClick={fetchUsers}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {users.map((user) => (
                  <li key={user.id}>
                    <div className="px-4 py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.profile?.firstName?.[0] || user.email[0].toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.profile?.firstName} {user.profile?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-sm text-gray-500">
                            {user.profile?.village}, {user.profile?.district}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500">
                          <div>Farms: {user._count.farms}</div>
                          <div>Credits: {user._count.carbonCredits}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                            {user.role}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'farms' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Farm Management</h2>
              <button
                onClick={fetchFarms}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {farms.map((farm) => (
                  <li key={farm.id}>
                    <div className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MapIcon className="w-8 h-8 text-green-500 mr-4" />
                          <div>
                            <div className="text-lg font-medium text-gray-900">{farm.name}</div>
                            <div className="text-sm text-gray-500">{farm.location}</div>
                            <div className="text-sm text-gray-500">
                              {farm.area} {farm.areaUnit} • {farm.cropType}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-500">
                            <div>Carbon Credits: {farm._count.carbonCredits}</div>
                            <div>Farmer: {farm.farmer.profile.firstName} {farm.farmer.profile.lastName}</div>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            farm.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {farm.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'credits' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Carbon Credit Management</h2>
              <button
                onClick={fetchCarbonCredits}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {carbonCredits.map((credit) => (
                  <li key={credit.id}>
                    <div className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCardIcon className="w-8 h-8 text-green-500 mr-4" />
                          <div>
                            <div className="text-lg font-medium text-gray-900">{credit.title}</div>
                            <div className="text-sm text-gray-500">
                              {credit.quantity} credits • {formatCurrency(credit.pricePerCredit)}/credit
                            </div>
                            <div className="text-sm text-gray-500">
                              Farm: {credit.farm.name} • Farmer: {credit.farm.farmer.profile.firstName} {credit.farm.farmer.profile.lastName}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-500">
                            <div>Project: {credit.projectType}</div>
                            <div>Created: {formatDate(credit.createdAt)}</div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              getStatusColor(credit.status)
                            }`}>
                              {credit.status}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                              {credit.verificationLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Transaction Management</h2>
              <button
                onClick={fetchTransactions}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <li key={transaction.id}>
                    <div className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="w-8 h-8 text-blue-500 mr-4" />
                          <div>
                            <div className="text-lg font-medium text-gray-900">{transaction.carbonCredit.title}</div>
                            <div className="text-sm text-gray-500">
                              {transaction.quantity} credits • {formatCurrency(transaction.totalAmount)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Seller: {transaction.seller.profile.firstName} {transaction.seller.profile.lastName} • 
                              Buyer: {transaction.buyer.profile.firstName} {transaction.buyer.profile.lastName}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-500">
                            <div>Date: {formatDate(transaction.createdAt)}</div>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusColor(transaction.status)
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">System Health & Monitoring</h2>
            
            {dashboardData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Health */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">System Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Overall Status</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          dashboardData.systemHealth.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {dashboardData.systemHealth.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Database</span>
                        <span className="text-sm text-gray-900">{dashboardData.systemHealth.database}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Uptime</span>
                        <span className="text-sm text-gray-900">
                          {Math.floor(dashboardData.systemHealth.uptime / 3600)}h {Math.floor((dashboardData.systemHealth.uptime % 3600) / 60)}m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Node Version</span>
                        <span className="text-sm text-gray-900">{dashboardData.systemHealth.version}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Export */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Data Export</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => exportData('users', 'csv')}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                        Export Users (CSV)
                      </button>
                      <button
                        onClick={() => exportData('farms', 'csv')}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                        Export Farms (CSV)
                      </button>
                      <button
                        onClick={() => exportData('carbon-credits', 'csv')}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                        Export Carbon Credits (CSV)
                      </button>
                      <button
                        onClick={() => exportData('transactions', 'csv')}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                        Export Transactions (CSV)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Audit Logs & Compliance</h2>
            
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Audit Events</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">User Login</div>
                      <div className="text-sm text-gray-500">Admin user logged in from IP 192.168.1.1</div>
                      <div className="text-xs text-gray-400">2 minutes ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <CreditCardIcon className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Carbon Credit Created</div>
                      <div className="text-sm text-gray-500">New carbon credit "Rice Farm Project 2024" created</div>
                      <div className="text-xs text-gray-400">15 minutes ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <UsersIcon className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">User Role Updated</div>
                      <div className="text-sm text-gray-500">User role changed from FARMER to MRV_AGENT</div>
                      <div className="text-xs text-gray-400">1 hour ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Edit Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {selectedUser.profile?.firstName} {selectedUser.profile?.lastName}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedUser.email}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  >
                    <option value="FARMER">Farmer</option>
                    <option value="BUYER">Buyer</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MRV_AGENT">MRV Agent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={selectedUser.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setSelectedUser({ ...selectedUser, isActive: e.target.value === 'active' })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateUser(selectedUser.id, {
                    role: selectedUser.role,
                    isActive: selectedUser.isActive
                  })}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
