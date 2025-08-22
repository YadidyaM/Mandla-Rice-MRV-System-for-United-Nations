import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  GlobeAltIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,
  HomeIcon,
  PlusIcon,
  EyeIcon,
  ShoppingCartIcon,
  TagIcon,
  ClockIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { api } from '../../services/api';

interface CarbonCredit {
  id: string;
  title: string;
  quantity: number;
  pricePerCredit: number;
  totalValue: number;
  status: 'ACTIVE' | 'PENDING' | 'VERIFIED' | 'SOLD' | 'LISTED';
  farmId: string;
  farmName: string;
  methodology: string;
  vintage: number;
  createdAt: string;
  // New fields for marketplace
  description?: string;
  location?: string;
  projectType?: string;
  verificationLevel?: string;
  availableQuantity?: number;
  sellerId?: string;
  sellerName?: string;
  marketplaceId?: string;
}

interface CarbonCreditsSummary {
  totalCredits: number;
  totalValue: number;
  activeCredits: number;
  pendingCredits: number;
  verifiedCredits: number;
  soldCredits: number;
  listedCredits: number;
  averagePrice: number;
  totalEmissionReduction: number;
}

export default function CarbonCreditsPage() {
  const { t } = useTranslation();
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [summary, setSummary] = useState<CarbonCreditsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
  const [sellPrice, setSellPrice] = useState(500);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [showCreditDetails, setShowCreditDetails] = useState(false);

  useEffect(() => {
    fetchCarbonCredits();
    
    // Set up real-time data synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'farmsData' || e.key === 'mrvData') {
        fetchCarbonCredits();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const fetchCarbonCredits = async () => {
    try {
      setLoading(true);
      
      // Get farms data from localStorage (from MRV system)
      const farmsData = JSON.parse(localStorage.getItem('farmsData') || '[]');
      const mrvData = JSON.parse(localStorage.getItem('mrvData') || '[]');
      
      // Create dynamic carbon credits based on actual farm and MRV data
      const dynamicCredits: CarbonCredit[] = [];
      
      farmsData.forEach((farm: any, index: number) => {
        // Calculate emissions based on actual farm data
        const baselineEmissions = farm.area * 1.3; // kg CH4 per hectare
        let projectEmissions = baselineEmissions;
        
        // Apply reduction factors based on farming method
        if (farm.irrigationType === 'AWD') {
          projectEmissions = baselineEmissions * 0.52; // 48% reduction
        } else if (farm.irrigationType === 'SRI') {
          projectEmissions = baselineEmissions * 0.68; // 32% reduction
        } else if (farm.irrigationType === 'FLOOD') {
          projectEmissions = baselineEmissions * 0.85; // 15% reduction
        }
        
        const emissionReduction = baselineEmissions - projectEmissions;
        const co2eReduction = emissionReduction * 25 / 1000; // Convert to tCO2e
        
        // Create credit based on actual farm data
        const credit: CarbonCredit = {
          id: `credit_${farm.id}_${Date.now()}`,
          title: `Sustainable Rice Farming - ${farm.irrigationType}`,
          quantity: co2eReduction * 1000, // Convert to kg
          pricePerCredit: 500, // Base price in INR
          totalValue: (co2eReduction * 1000) * 500,
          status: index === 0 ? 'VERIFIED' : index === 1 ? 'PENDING' : 'ACTIVE',
          farmId: farm.id,
          farmName: farm.name,
          methodology: 'IPCC 2019 Refinement Tier 2',
          vintage: 2024,
          createdAt: new Date().toISOString(),
          // Marketplace fields
          description: `Carbon credits generated from ${farm.name} using ${farm.irrigationType} farming method. Located in ${farm.village}, ${farm.area} hectares.`,
          location: farm.village,
          projectType: 'RICE_FARMING',
          verificationLevel: index === 0 ? 'GOLD' : index === 1 ? 'STANDARD' : 'BASIC',
          availableQuantity: co2eReduction * 1000,
          sellerId: 'current-user',
          sellerName: 'Your Farm'
        };
        
        dynamicCredits.push(credit);
      });
      
      // Add any existing credits from localStorage
      const existingCredits = JSON.parse(localStorage.getItem('carbonCredits') || '[]');
      const allCredits = [...dynamicCredits, ...existingCredits];
      
      setCredits(allCredits);
      
      // Store updated credits
      localStorage.setItem('carbonCredits', JSON.stringify(allCredits));

      // Calculate summary dynamically
      const summaryData: CarbonCreditsSummary = {
        totalCredits: allCredits.reduce((sum, credit) => sum + credit.quantity, 0),
        totalValue: allCredits.reduce((sum, credit) => sum + credit.totalValue, 0),
        activeCredits: allCredits.filter(c => c.status === 'ACTIVE').reduce((sum, credit) => sum + credit.quantity, 0),
        pendingCredits: allCredits.filter(c => c.status === 'PENDING').reduce((sum, credit) => sum + credit.quantity, 0),
        verifiedCredits: allCredits.filter(c => c.status === 'VERIFIED').reduce((sum, credit) => sum + credit.quantity, 0),
        soldCredits: allCredits.filter(c => c.status === 'SOLD').reduce((sum, credit) => sum + credit.quantity, 0),
        listedCredits: allCredits.filter(c => c.status === 'LISTED').reduce((sum, credit) => sum + credit.quantity, 0),
        averagePrice: allCredits.length > 0 ? allCredits.reduce((sum, credit) => sum + credit.pricePerCredit, 0) / allCredits.length : 0,
        totalEmissionReduction: farmsData.reduce((sum: number, farm: any) => {
          const baselineEmissions = farm.area * 1.3;
          let projectEmissions = baselineEmissions;
          if (farm.irrigationType === 'AWD') projectEmissions = baselineEmissions * 0.52;
          else if (farm.irrigationType === 'SRI') projectEmissions = baselineEmissions * 0.68;
          else if (farm.irrigationType === 'FLOOD') projectEmissions = baselineEmissions * 0.85;
          return sum + (baselineEmissions - projectEmissions);
        }, 0)
      };

      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching carbon credits:', error);
      toast.error('Failed to fetch carbon credits');
    } finally {
      setLoading(false);
    }
  };

  const generateNewCredits = async () => {
    try {
      // Get latest farm data
      const farmsData = JSON.parse(localStorage.getItem('farmsData') || '[]');
      
      if (farmsData.length === 0) {
        toast.error('No farms found. Please add farms first.');
        return;
      }
      
      // Generate credits for all farms
      const newCredits: CarbonCredit[] = [];
      
      farmsData.forEach((farm: any) => {
        const baselineEmissions = farm.area * 1.3;
        let projectEmissions = baselineEmissions;
        
        if (farm.irrigationType === 'AWD') {
          projectEmissions = baselineEmissions * 0.52;
        } else if (farm.irrigationType === 'SRI') {
          projectEmissions = baselineEmissions * 0.68;
        } else if (farm.irrigationType === 'FLOOD') {
          projectEmissions = baselineEmissions * 0.85;
        }
        
        const emissionReduction = baselineEmissions - projectEmissions;
        const co2eReduction = emissionReduction * 25 / 1000;
        
        const newCredit: CarbonCredit = {
          id: `credit_new_${Date.now()}_${farm.id}`,
          title: `New Credits - ${farm.name}`,
          quantity: co2eReduction * 1000,
          pricePerCredit: 500,
          totalValue: (co2eReduction * 1000) * 500,
          status: 'PENDING',
          farmId: farm.id,
          farmName: farm.name,
          methodology: 'IPCC 2019 Refinement Tier 2',
          vintage: 2024,
          createdAt: new Date().toISOString(),
          description: `Fresh carbon credits from ${farm.name}`,
          location: farm.village,
          projectType: 'RICE_FARMING',
          verificationLevel: 'BASIC',
          availableQuantity: co2eReduction * 1000,
          sellerId: 'current-user',
          sellerName: 'Your Farm'
        };
        
        newCredits.push(newCredit);
      });
      
      // Add to existing credits
      const updatedCredits = [...credits, ...newCredits];
      setCredits(updatedCredits);
      localStorage.setItem('carbonCredits', JSON.stringify(updatedCredits));
      
      // Refresh summary
      fetchCarbonCredits();
      
      toast.success(`Generated ${newCredits.length} new carbon credit batches`);
      setShowGenerateModal(false);
    } catch (error) {
      console.error('Error generating credits:', error);
      toast.error('Failed to generate new credits');
    }
  };

  const sellCredits = async (credit: CarbonCredit, price: number, quantity: number) => {
    try {
      if (quantity > credit.availableQuantity) {
        toast.error('Cannot sell more than available quantity');
        return;
      }
      
      // Create marketplace listing
      const marketplaceListing = {
        id: `listing_${Date.now()}`,
        creditId: credit.id,
        title: credit.title,
        description: credit.description,
        quantity: quantity,
        availableQuantity: quantity,
        pricePerCredit: price,
        totalPrice: price * quantity,
        currency: 'INR',
        status: 'LISTED',
        verificationLevel: credit.verificationLevel,
        farmId: credit.farmId,
        farmName: credit.farmName,
        sellerId: credit.sellerId,
        sellerName: credit.sellerName,
        location: credit.location,
        projectType: credit.projectType,
        methodology: credit.methodology,
        vintage: credit.vintage,
        createdAt: new Date().toISOString(),
        marketplaceId: `MP_${Date.now()}`
      };
      
      // Store in marketplace
      const existingListings = JSON.parse(localStorage.getItem('marketplaceListings') || '[]');
      const updatedListings = [...existingListings, marketplaceListing];
      localStorage.setItem('marketplaceListings', JSON.stringify(updatedListings));
      
      // Update credit status
      const updatedCredits = credits.map(c => {
        if (c.id === credit.id) {
          return {
            ...c,
            status: 'LISTED' as const,
            availableQuantity: c.availableQuantity! - quantity,
            marketplaceId: marketplaceListing.id
          };
        }
        return c;
      });
      
      setCredits(updatedCredits);
      localStorage.setItem('carbonCredits', JSON.stringify(updatedCredits));
      
      // Refresh summary
      fetchCarbonCredits();
      
      toast.success(`Successfully listed ${quantity} credits for sale at ₹${price} each`);
      setShowSellModal(false);
      setSelectedCredit(null);
    } catch (error) {
      console.error('Error selling credits:', error);
      toast.error('Failed to list credits for sale');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading carbon credits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Carbon Credits Portfolio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your carbon credits and environmental impact
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <GlobeAltIcon className="h-8 w-8 text-green-600" />
            <span className="text-sm text-gray-500">UN Climate Challenge 2024</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HomeIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Credits</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.totalCredits.toLocaleString()} kg CO2e
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{summary.totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Verified Credits</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.verifiedCredits.toLocaleString()} kg CO2e
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Emission Reduction</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.totalEmissionReduction.toFixed(1)} kg CH4
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'credits', name: 'My Credits', icon: HomeIcon },
              { id: 'marketplace', name: 'Marketplace', icon: BuildingOfficeIcon },
              { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 inline mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Credit Status Distribution
                  </h3>
                  <div className="space-y-3">
                    {summary && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Verified</span>
                          <span className="font-medium">{summary.verifiedCredits.toLocaleString()} kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Pending</span>
                          <span className="font-medium">{summary.pendingCredits.toLocaleString()} kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Listed for Sale</span>
                          <span className="font-medium">{summary.listedCredits.toLocaleString()} kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Sold</span>
                          <span className="font-medium">{summary.soldCredits.toLocaleString()} kg</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Financial Summary
                  </h3>
                  <div className="space-y-3">
                    {summary && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Portfolio Value</span>
                          <span className="font-medium">₹{summary.totalValue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Average Price per Credit</span>
                          <span className="font-medium">₹{summary.averagePrice.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Active Credits</span>
                          <span className="font-medium">{summary.activeCredits.toLocaleString()} kg</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Credits Tab */}
          {activeTab === 'credits' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  My Carbon Credits
                </h3>
                <button 
                  onClick={() => setShowGenerateModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Generate New Credits
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {credits.map((credit) => (
                      <tr key={credit.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {credit.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {credit.farmName} • {credit.methodology}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {credit.availableQuantity ? credit.availableQuantity.toLocaleString() : credit.quantity.toLocaleString()} kg CO2e
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ₹{credit.pricePerCredit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ₹{credit.totalValue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            credit.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                            credit.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            credit.status === 'LISTED' ? 'bg-blue-100 text-blue-800' :
                            credit.status === 'SOLD' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {credit.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => {
                              setSelectedCredit(credit);
                              setShowCreditDetails(true);
                            }}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                          >
                            <EyeIcon className="h-4 w-4 inline mr-1" />
                            View
                          </button>
                          {credit.status === 'VERIFIED' && credit.availableQuantity! > 0 && (
                            <button 
                              onClick={() => {
                                setSelectedCredit(credit);
                                setSellQuantity(Math.min(credit.availableQuantity!, 100));
                                setShowSellModal(true);
                              }}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <TagIcon className="h-4 w-4 inline mr-1" />
                              Sell
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Marketplace Tab */}
          {activeTab === 'marketplace' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex">
                  <BuildingOfficeIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Carbon Credits Marketplace
                    </h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                      <p>
                        List your carbon credits for sale or browse available credits from other farmers. 
                        All transactions are protected by blockchain escrow and verified by our MRV system.
                      </p>
                    </div>
                    <div className="mt-4">
                      <button 
                        onClick={() => window.location.href = '/app/marketplace'}
                        className="btn btn-primary btn-sm mr-3"
                      >
                        Browse Marketplace
                      </button>
                      <button 
                        onClick={() => window.location.href = '/app/marketplace?tab=my-listings'}
                        className="btn btn-secondary btn-sm"
                      >
                        My Listings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Listings */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Marketplace Activity
                </h3>
                <div className="text-center py-8">
                  <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Visit the marketplace to see all available carbon credits and trading activity.
                  </p>
                  <button 
                    onClick={() => window.location.href = '/app/marketplace'}
                    className="mt-4 btn btn-primary"
                  >
                    Go to Marketplace
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Carbon Credits Analytics
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Detailed analytics and reporting features coming soon. This will include:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Historical credit generation trends</li>
                  <li>• Price performance analysis</li>
                  <li>• Environmental impact metrics</li>
                  <li>• Comparison with regional benchmarks</li>
                  <li>• Marketplace trading volume</li>
                  <li>• Credit verification success rates</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Credits Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Generate New Carbon Credits</h2>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Generate new carbon credits based on your current farm data and MRV reports. 
                  This will create credits for all your farms using the latest emission calculations.
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <InformationCircleIcon className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Credits will be generated based on your farm area, irrigation type, and verified MRV data.
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateNewCredits}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                  >
                    Generate Credits
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sell Credits Modal */}
      {showSellModal && selectedCredit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sell Carbon Credits</h2>
                <button
                  onClick={() => setShowSellModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{selectedCredit.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCredit.farmName}</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Available:</span>
                    <span className="font-semibold">{selectedCredit.availableQuantity?.toLocaleString()} kg CO2e</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Current Price:</span>
                    <span className="font-semibold">₹{selectedCredit.pricePerCredit}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity to sell (kg CO2e)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedCredit.availableQuantity}
                    value={sellQuantity}
                    onChange={(e) => setSellQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price per credit (₹)
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(parseInt(e.target.value) || 500)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-green-800 dark:text-green-300 font-medium">Total Value:</span>
                    <span className="text-xl font-bold text-green-900 dark:text-green-100">
                      ₹{(sellPrice * sellQuantity).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowSellModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => sellCredits(selectedCredit, sellPrice, sellQuantity)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                  >
                    List for Sale
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credit Details Modal */}
      {showCreditDetails && selectedCredit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Carbon Credit Details: {selectedCredit.title}
                </h2>
                <button
                  onClick={() => setShowCreditDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Credit Information</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Title:</span>
                        <span className="font-medium">{selectedCredit.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Farm:</span>
                        <span className="font-medium">{selectedCredit.farmName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Methodology:</span>
                        <span className="font-medium">{selectedCredit.methodology}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Vintage:</span>
                        <span className="font-medium">{selectedCredit.vintage}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quantity & Value</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Quantity:</span>
                        <span className="font-medium">{selectedCredit.quantity.toLocaleString()} kg CO2e</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Available:</span>
                        <span className="font-medium">{selectedCredit.availableQuantity?.toLocaleString() || selectedCredit.quantity.toLocaleString()} kg CO2e</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Price per Credit:</span>
                        <span className="font-medium">₹{selectedCredit.pricePerCredit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Value:</span>
                        <span className="font-medium text-green-600">₹{selectedCredit.totalValue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Status & Actions</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedCredit.status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                          selectedCredit.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          selectedCredit.status === 'LISTED' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedCredit.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Created:</span>
                        <span className="font-medium">{new Date(selectedCredit.createdAt).toLocaleDateString()}</span>
                      </div>
                      {selectedCredit.marketplaceId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Marketplace ID:</span>
                          <span className="font-medium">{selectedCredit.marketplaceId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Actions</h3>
                    <div className="space-y-2">
                      {selectedCredit.status === 'VERIFIED' && selectedCredit.availableQuantity! > 0 && (
                        <button
                          onClick={() => {
                            setShowCreditDetails(false);
                            setSellQuantity(Math.min(selectedCredit.availableQuantity!, 100));
                            setShowSellModal(true);
                          }}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                        >
                          <TagIcon className="h-4 w-4" />
                          <span>Sell Credits</span>
                        </button>
                      )}
                      
                      {selectedCredit.status === 'LISTED' && (
                        <button
                          onClick={() => window.location.href = `/app/marketplace?tab=my-listings`}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>View Marketplace Listing</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
