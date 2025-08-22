/**
 * MRV Page Component
 * 
 * Emission Calculation Methodology:
 * - Baseline: 1.3 kg CH4 per hectare (conventional rice farming)
 * - AWD (Alternate Wetting and Drying): 48% reduction (0.52x)
 * - SRI (System of Rice Intensification): 32% reduction (0.68x)  
 * - FLOOD (Conventional flooding): 15% reduction (0.85x)
 * - CO2e conversion: 25x (CH4 to CO2 equivalent)
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  EyeIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  GlobeAltIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

interface MRVReport {
  id: string;
  farmId: string;
  farmName: string;
  season: string;
  crop: string;
  farmingMethod: string;
  area: number;
  baselineEmissions: number;
  projectEmissions: number;
  emissionReduction: number;
  co2eReduction: number;
  methodology: string;
  status: 'PENDING' | 'PROCESSING' | 'VERIFIED' | 'REJECTED' | 'COMPLETED';
  processedAt?: string;
  verifiedAt?: string;
  verifierId?: string;
  verifierName?: string;
  satelliteData: boolean;
  fieldPhotos: boolean;
  soilTests: boolean;
  createdAt: string;
  // Add dynamic fields
  village?: string;
  reductionFactor?: number;
  baselinePerHectare?: number;
}

interface MRVStats {
  totalReports: number;
  pendingReports: number;
  verifiedReports: number;
  rejectedReports: number;
  totalEmissionReduction: number;
  averageProcessingTime: number;
}

export default function MRVPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [reports, setReports] = useState<MRVReport[]>([]);
  const [stats, setStats] = useState<MRVStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<MRVReport | null>(null);
  const [showReportDetails, setShowReportDetails] = useState(false);
  
  // Farm context from navigation
  const [selectedFarm, setSelectedFarm] = useState<any>(null);
  const [processingMRV, setProcessingMRV] = useState(false);

  const lastFarmsDataRef = React.useRef<string | null>(null);

  useEffect(() => {
    // Check if we have farm context from navigation
    if (location.state?.selectedFarm && location.state?.farmName) {
      setSelectedFarm({
        id: location.state.selectedFarm,
        name: location.state.farmName,
        action: location.state.action
      });
      setProcessingMRV(true);
      setActiveTab('overview');
    }
    fetchMRVData();
    
    // Set up real-time data synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'farmsData' && e.newValue) {
        try {
          const updatedFarms = JSON.parse(e.newValue);
          // Refresh MRV data when farms data changes
          fetchMRVData();
        } catch (error) {
          console.error('Error parsing updated farms data:', error);
        }
      }
    };
    
    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    
    // Set up interval to check for localStorage changes (for same-tab updates)
    const intervalId = setInterval(() => {
      const currentFarmsData = localStorage.getItem('farmsData');
      if (currentFarmsData !== lastFarmsDataRef.current) {
        lastFarmsDataRef.current = currentFarmsData;
        fetchMRVData();
      }
    }, 2000); // Check every 2 seconds
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [location.state]);

  const fetchMRVData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch farms from the farms page or API
      let farmsData = [];
      
      try {
        // First try to get farms from localStorage if they exist
        const storedFarms = localStorage.getItem('farmsData');
        if (storedFarms) {
          farmsData = JSON.parse(storedFarms);
        } else {
          // Fallback to mock data if no stored data
          farmsData = [
            {
              id: '1',
              name: 'Farm A - North Field',
              area: 2.5,
              irrigationType: 'AWD',
              village: 'Mandla'
            },
            {
              id: '2',
              name: 'Farm B - South Field',
              area: 1.8,
              irrigationType: 'SRI',
              village: 'Mandla'
            },
            {
              id: '3',
              name: 'Tantra AI',
              area: 30,
              irrigationType: 'FLOOD',
              village: 'Dholakpur'
            },
            {
              id: '4',
              name: 'jeevanpuram',
              area: 3.2,
              irrigationType: 'AWD',
              village: 'Jeevanpuram'
            }
          ];
        }
      } catch (error) {
        console.error('Error parsing stored farms data:', error);
        // Use fallback data
        farmsData = [
          {
            id: '1',
            name: 'Farm A - North Field',
            area: 2.5,
            irrigationType: 'AWD',
            village: 'Mandla'
          },
          {
            id: '2',
            name: 'Farm B - South Field',
            area: 1.8,
            irrigationType: 'SRI',
            village: 'Mandla'
          },
          {
            id: '3',
            name: 'Tantra AI',
            area: 30,
            irrigationType: 'FLOOD',
            village: 'Dholakpur'
          },
          {
            id: '4',
            name: 'jeevanpuram',
            area: 3.2,
            irrigationType: 'AWD',
            village: 'Jeevanpuram'
          }
        ];
      }
      
      // Create mock MRV reports based on actual farm data
      const mockReports: MRVReport[] = farmsData.map((farm: any, index: number) => {
        // Calculate emissions based on actual farm data
        const baselineEmissions = farm.area * 1.3; // kg CH4 per hectare
        let projectEmissions = baselineEmissions;
        let reductionFactor = 1.0;
        
        // Apply reduction factors based on farming method
        if (farm.irrigationType === 'AWD') {
          projectEmissions = baselineEmissions * 0.52; // 48% reduction
          reductionFactor = 0.52;
        } else if (farm.irrigationType === 'SRI') {
          projectEmissions = baselineEmissions * 0.68; // 32% reduction
          reductionFactor = 0.68;
        } else if (farm.irrigationType === 'FLOOD') {
          projectEmissions = baselineEmissions * 0.85; // 15% reduction
          reductionFactor = 0.85;
        }
        
        const emissionReduction = baselineEmissions - projectEmissions;
        const co2eReduction = emissionReduction * 25 / 1000; // Convert to tCO2e
        
        return {
          id: `MRV_${farm.id}_${Date.now()}`,
          farmId: farm.id,
          farmName: farm.name,
          season: 'Kharif 2024',
          crop: 'Rice',
          farmingMethod: farm.irrigationType,
          area: farm.area,
          baselineEmissions: parseFloat(baselineEmissions.toFixed(2)),
          projectEmissions: parseFloat(projectEmissions.toFixed(2)),
          emissionReduction: parseFloat(emissionReduction.toFixed(2)),
          co2eReduction: parseFloat(co2eReduction.toFixed(3)),
          methodology: 'IPCC 2019 Refinement Tier 2',
          status: index === 0 ? 'VERIFIED' : index === 1 ? 'PROCESSING' : 'PENDING',
          processedAt: index === 0 ? new Date().toISOString() : undefined,
          verifiedAt: index === 0 ? new Date().toISOString() : undefined,
          verifierId: index === 0 ? 'verifier_1' : undefined,
          verifierName: index === 0 ? 'Dr. Rajesh Kumar' : undefined,
          satelliteData: true,
          fieldPhotos: true,
          soilTests: index === 0,
          createdAt: new Date().toISOString(),
          // Add dynamic fields
          village: farm.village,
          reductionFactor: reductionFactor,
          baselinePerHectare: 1.3
        };
      });

      setReports(mockReports);

      // Calculate stats dynamically
      const statsData: MRVStats = {
        totalReports: mockReports.length,
        pendingReports: mockReports.filter(r => r.status === 'PENDING').length,
        verifiedReports: mockReports.filter(r => r.status === 'VERIFIED').length,
        rejectedReports: mockReports.filter(r => r.status === 'REJECTED').length,
        totalEmissionReduction: mockReports.reduce((sum, r) => sum + r.emissionReduction, 0),
        averageProcessingTime: 2.5 // days
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching MRV data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'PROCESSING':
        return <ClockIcon className="w-5 h-5 text-blue-600" />;
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'REJECTED':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredReports = reports.filter(report => {
    if (searchQuery && !report.farmName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && report.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'create-report':
        // Create a new MRV report
        handleCreateNewReport();
        break;
      case 'process-pending':
        // Filter to show only pending reports
        setStatusFilter('PENDING');
        setActiveTab('reports');
        break;
      case 'view-analytics':
        // Switch to analytics tab
        setActiveTab('analytics');
        break;
      default:
        break;
    }
  };

  const handleCreateNewReport = () => {
    // Create a new MRV report with more realistic default values
    const defaultArea = 2.0; // hectares
    const baselineEmissions = defaultArea * 1.3; // kg CH4 per hectare
    const projectEmissions = baselineEmissions * 0.52; // AWD method (48% reduction)
    const emissionReduction = baselineEmissions - projectEmissions;
    const co2eReduction = emissionReduction * 25 / 1000; // Convert to tCO2e
    
    const newReport: MRVReport = {
      id: `MRV_NEW_${Date.now()}`,
      farmId: 'new',
      farmName: 'New Farm',
      season: 'Kharif 2024',
      crop: 'Rice',
      farmingMethod: 'AWD',
      area: defaultArea,
      baselineEmissions: parseFloat(baselineEmissions.toFixed(2)),
      projectEmissions: parseFloat(projectEmissions.toFixed(2)),
      emissionReduction: parseFloat(emissionReduction.toFixed(2)),
      co2eReduction: parseFloat(co2eReduction.toFixed(3)),
      methodology: 'IPCC 2019 Refinement Tier 2',
      status: 'PENDING',
      satelliteData: false,
      fieldPhotos: false,
      soilTests: false,
      createdAt: new Date().toISOString(),
      // Add dynamic fields
      village: 'New Village',
      reductionFactor: 0.52,
      baselinePerHectare: 1.3
    };
    
    // Add the new report to the list
    setReports(prev => [newReport, ...prev]);
    
    // Switch to reports tab to show the new report
    setActiveTab('reports');
    
    // Show success message
    toast.success('New MRV report created');
  };

  const addNewFarm = (farmData: any) => {
    // Calculate emissions for the new farm
    const baselineEmissions = farmData.area * 1.3; // kg CH4 per hectare
    let projectEmissions = baselineEmissions;
    let reductionFactor = 1.0;
    
    // Apply reduction factors based on farming method
    if (farmData.irrigationType === 'AWD') {
      projectEmissions = baselineEmissions * 0.52; // 48% reduction
      reductionFactor = 0.52;
    } else if (farmData.irrigationType === 'SRI') {
      projectEmissions = baselineEmissions * 0.68; // 32% reduction
      reductionFactor = 0.68;
    } else if (farmData.irrigationType === 'FLOOD') {
      projectEmissions = baselineEmissions * 0.85; // 15% reduction
      reductionFactor = 0.85;
    }
    
    const emissionReduction = baselineEmissions - projectEmissions;
    const co2eReduction = emissionReduction * 25 / 1000; // Convert to tCO2e
    
    // Create new MRV report for the new farm
    const newReport: MRVReport = {
      id: `MRV_${farmData.id}_${Date.now()}`,
      farmId: farmData.id,
      farmName: farmData.name,
      season: 'Kharif 2024',
      crop: 'Rice',
      farmingMethod: farmData.irrigationType,
      area: farmData.area,
      baselineEmissions: parseFloat(baselineEmissions.toFixed(2)),
      projectEmissions: parseFloat(projectEmissions.toFixed(2)),
      emissionReduction: parseFloat(emissionReduction.toFixed(2)),
      co2eReduction: parseFloat(co2eReduction.toFixed(3)),
      methodology: 'IPCC 2019 Refinement Tier 2',
      status: 'PENDING',
      satelliteData: false,
      fieldPhotos: false,
      soilTests: false,
      createdAt: new Date().toISOString(),
      // Add dynamic fields
      village: farmData.village,
      reductionFactor: reductionFactor,
      baselinePerHectare: 1.3
    };
    
    // Add the new report to the list
    setReports(prev => [newReport, ...prev]);
    
    // Update stats
    if (stats) {
      setStats({
        ...stats,
        totalReports: stats.totalReports + 1,
        pendingReports: stats.pendingReports + 1,
        totalEmissionReduction: stats.totalEmissionReduction + emissionReduction
      });
    }
    
    toast.success(`New farm "${farmData.name}" added to MRV system`);
  };

  const updateFarmData = (farmId: string, updatedData: any) => {
    // Find and update the farm's MRV report
    setReports(prev => prev.map(report => {
      if (report.farmId === farmId) {
        // Recalculate emissions based on updated farm data
        const baselineEmissions = updatedData.area * 1.3;
        let projectEmissions = baselineEmissions;
        let reductionFactor = 1.0;
        
        if (updatedData.irrigationType === 'AWD') {
          projectEmissions = baselineEmissions * 0.52;
          reductionFactor = 0.52;
        } else if (updatedData.irrigationType === 'SRI') {
          projectEmissions = baselineEmissions * 0.68;
          reductionFactor = 0.68;
        } else if (updatedData.irrigationType === 'FLOOD') {
          projectEmissions = baselineEmissions * 0.85;
          reductionFactor = 0.85;
        }
        
        const emissionReduction = baselineEmissions - projectEmissions;
        const co2eReduction = emissionReduction * 25 / 1000;
        
        return {
          ...report,
          farmName: updatedData.name,
          farmingMethod: updatedData.irrigationType,
          area: updatedData.area,
          baselineEmissions: parseFloat(baselineEmissions.toFixed(2)),
          projectEmissions: parseFloat(projectEmissions.toFixed(2)),
          emissionReduction: parseFloat(emissionReduction.toFixed(2)),
          co2eReduction: parseFloat(co2eReduction.toFixed(3)),
          village: updatedData.village,
          reductionFactor: reductionFactor
        };
      }
      return report;
    }));
    
    toast.success(`Farm "${updatedData.name}" updated in MRV system`);
  };

  const handleStartMRVProcess = async (farmId: string, farmName: string) => {
    try {
      // Simulate MRV processing
      console.log(`Starting MRV process for farm: ${farmName} (ID: ${farmId})`);
      
      // Here you would typically:
      // 1. Call the MRV service to start processing
      // 2. Update the farm status
      // 3. Create a new MRV report
      // 4. Show progress indicators
      
      // For now, we'll simulate the process
      toast.success(`MRV process started for ${farmName}`);
      
      // Navigate to reports tab to show the new report
      setActiveTab('reports');
      
      // Get farm data to calculate proper emissions
      const farmData = reports.find(r => r.farmId === farmId) || 
                      { area: 2.5, farmingMethod: 'AWD' }; // fallback
      
      // Calculate emissions based on actual farm data
      const baselineEmissions = farmData.area * 1.3; // kg CH4 per hectare
      let projectEmissions = baselineEmissions;
      
      // Apply reduction factors based on farming method
      if (farmData.farmingMethod === 'AWD') {
        projectEmissions = baselineEmissions * 0.52; // 48% reduction
      } else if (farmData.farmingMethod === 'SRI') {
        projectEmissions = baselineEmissions * 0.68; // 32% reduction
      } else if (farmData.farmingMethod === 'FLOOD') {
        projectEmissions = baselineEmissions * 0.85; // 15% reduction
      }
      
      const emissionReduction = baselineEmissions - projectEmissions;
      const co2eReduction = emissionReduction * 25 / 1000; // Convert to tCO2e
      
      // Create new MRV report with calculated values
      const newReport: MRVReport = {
        id: `MRV_${farmId}_${Date.now()}`,
        farmId: farmId,
        farmName: farmName,
        season: 'Kharif 2024',
        crop: 'Rice',
        farmingMethod: farmData.farmingMethod,
        area: farmData.area,
        baselineEmissions: parseFloat(baselineEmissions.toFixed(2)),
        projectEmissions: parseFloat(projectEmissions.toFixed(2)),
        emissionReduction: parseFloat(emissionReduction.toFixed(2)),
        co2eReduction: parseFloat(co2eReduction.toFixed(3)),
        methodology: 'IPCC 2019 Refinement Tier 2',
        status: 'PROCESSING',
        satelliteData: true,
        fieldPhotos: false,
        soilTests: false,
        createdAt: new Date().toISOString()
      };
      
      // Add the new report to the list
      setReports(prev => [newReport, ...prev]);
      
    } catch (error) {
      console.error('Error starting MRV process:', error);
      toast.error('Failed to start MRV process');
    }
  };

  const exportMRVData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      totalReports: reports.length,
      totalCO2eReduction: reports.reduce((sum, r) => sum + r.co2eReduction, 0),
      totalCH4Reduction: reports.reduce((sum, r) => sum + r.emissionReduction, 0),
      reports: reports.map(r => ({
        farmName: r.farmName,
        village: r.village,
        area: r.area,
        farmingMethod: r.farmingMethod,
        co2eReduction: r.co2eReduction,
        ch4Reduction: r.emissionReduction,
        status: r.status,
        createdAt: r.createdAt
      })),
      summary: {
        byVillage: reports.reduce((acc, r) => {
          if (!acc[r.village || 'Unknown']) {
            acc[r.village || 'Unknown'] = {
              farms: 0,
              totalArea: 0,
              totalCO2e: 0,
              totalCH4: 0
            };
          }
          acc[r.village || 'Unknown'].farms++;
          acc[r.village || 'Unknown'].totalArea += r.area;
          acc[r.village || 'Unknown'].totalCO2e += r.co2eReduction;
          acc[r.village || 'Unknown'].totalCH4 += r.emissionReduction;
          return acc;
        }, {} as any),
        byMethod: reports.reduce((acc, r) => {
          if (!acc[r.farmingMethod]) {
            acc[r.farmingMethod] = {
              farms: 0,
              totalArea: 0,
              totalCO2e: 0,
              totalCH4: 0,
              avgReduction: 0
            };
          }
          acc[r.farmingMethod].farms++;
          acc[r.farmingMethod].totalArea += r.area;
          acc[r.farmingMethod].totalCO2e += r.co2eReduction;
          acc[r.farmingMethod].totalCH4 += r.emissionReduction;
          acc[r.farmingMethod].avgReduction = acc[r.farmingMethod].totalCH4 / acc[r.farmingMethod].farms;
          return acc;
        }, {} as any)
      }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mrv_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('MRV data exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading MRV reports...</p>
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
              MRV Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Measurement, Reporting, and Verification dashboard for carbon credit generation
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                fetchMRVData();
                toast.success('MRV data refreshed');
              }}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-800 dark:hover:bg-blue-700 rounded-md transition-colors"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
            <button
              onClick={exportMRVData}
              className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-300 dark:bg-green-800 dark:hover:bg-green-700 rounded-md transition-colors"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data
            </button>
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="h-8 w-8 text-green-600" />
              <span className="text-sm text-gray-500">UN Climate Challenge 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Farm Context Section - Show when processing MRV for specific farm */}
      {processingMRV && selectedFarm && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                  <MapPinIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Processing MRV for {selectedFarm.name}
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  Farm ID: {selectedFarm.id} • Action: {selectedFarm.action}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setProcessingMRV(false);
                  setSelectedFarm(null);
                  navigate('/app/farms');
                }}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-800 dark:hover:bg-blue-700 rounded-md transition-colors"
              >
                Back to Farms
              </button>
              <button
                onClick={() => handleStartMRVProcess(selectedFarm.id, selectedFarm.name)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-md transition-colors"
              >
                Start MRV Process
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors"
              >
                View Reports
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalReports}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.pendingReports}
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
                <p className="text-sm font-medium text-gray-500">Verified</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.verifiedReports}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Reduction</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalEmissionReduction.toFixed(1)} kg CH4
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
              { id: 'reports', name: 'All Reports', icon: DocumentTextIcon },
              { id: 'verification', name: 'Verification', icon: CheckCircleIcon },
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
                    Report Status Distribution
                  </h3>
                  <div className="space-y-3">
                    {stats && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Verified</span>
                          <span className="font-medium">{stats.verifiedReports}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Processing</span>
                          <span className="font-medium">{reports.filter(r => r.status === 'PROCESSING').length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Pending</span>
                          <span className="font-medium">{stats.pendingReports}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleQuickAction('create-report')}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Create New MRV Report</span>
                    </button>
                    <button 
                      onClick={() => handleQuickAction('process-pending')}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      <ClockIcon className="h-4 w-4" />
                      <span>Process Pending Reports</span>
                    </button>
                    <button 
                      onClick={() => handleQuickAction('view-analytics')}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      <ChartBarIcon className="h-4 w-4" />
                      <span>View Analytics</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Farm Management Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Dynamic Farm Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Add New Farm
                    </h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Farm Name"
                        id="newFarmName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="number"
                        placeholder="Area (hectares)"
                        id="newFarmArea"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <select
                        id="newFarmIrrigation"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="AWD">AWD (Alternate Wetting & Drying)</option>
                        <option value="SRI">SRI (System of Rice Intensification)</option>
                        <option value="FLOOD">FLOOD (Conventional Flooding)</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Village"
                        id="newFarmVillage"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        onClick={() => {
                          const name = (document.getElementById('newFarmName') as HTMLInputElement)?.value;
                          const area = parseFloat((document.getElementById('newFarmArea') as HTMLInputElement)?.value || '0');
                          const irrigationType = (document.getElementById('newFarmIrrigation') as HTMLSelectElement)?.value;
                          const village = (document.getElementById('newFarmVillage') as HTMLInputElement)?.value;
                          
                          if (name && area > 0 && irrigationType && village) {
                            const newFarm = {
                              id: `farm_${Date.now()}`,
                              name,
                              area,
                              irrigationType,
                              village,
                              status: 'Active',
                              lastMRV: new Date().toISOString().split('T')[0]
                            };
                            
                            // Add to farms data in localStorage
                            const existingFarms = JSON.parse(localStorage.getItem('farmsData') || '[]');
                            const updatedFarms = [...existingFarms, newFarm];
                            localStorage.setItem('farmsData', JSON.stringify(updatedFarms));
                            
                            // Add to MRV system
                            addNewFarm(newFarm);
                            
                            // Clear form
                            (document.getElementById('newFarmName') as HTMLInputElement).value = '';
                            (document.getElementById('newFarmArea') as HTMLInputElement).value = '';
                            (document.getElementById('newFarmIrrigation') as HTMLSelectElement).value = 'AWD';
                            (document.getElementById('newFarmVillage') as HTMLInputElement).value = '';
                          } else {
                            toast.error('Please fill all fields correctly');
                          }
                        }}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                      >
                        Add Farm to MRV System
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Live Farm Data
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {reports.map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                          <div>
                            <div className="font-medium">{report.farmName}</div>
                            <div className="text-xs text-gray-500">
                              {report.area} ha • {report.farmingMethod} • {report.village}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-medium text-green-600">
                              {report.co2eReduction.toFixed(3)} tCO2e
                            </div>
                            <div className="text-xs text-gray-500">
                              {report.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  All MRV Reports
                </h3>
                <button 
                  onClick={handleCreateNewReport}
                  className="btn btn-primary btn-sm"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Report
                </button>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search farms or reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Reports Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Farm & Report
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Emissions Reduction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredReports.map((report) => (
                      <tr key={report.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {report.farmName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {report.season} • {report.crop} • {report.farmingMethod}
                            </div>
                            <div className="text-xs text-gray-400">
                              Created: {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div>
                            <div className="font-medium">{report.co2eReduction.toFixed(3)} tCO2e</div>
                            <div className="text-xs text-gray-500">
                              {report.emissionReduction.toFixed(1)} kg CH4 reduced
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1">{report.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {report.verifierName ? (
                            <div>
                              <div className="font-medium">{report.verifierName}</div>
                              <div className="text-xs text-gray-500">
                                {report.verifiedAt ? new Date(report.verifiedAt).toLocaleDateString() : ''}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Not verified</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => {
                              setSelectedReport(report);
                              setShowReportDetails(true);
                            }}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                          >
                            <EyeIcon className="h-4 w-4 inline mr-1" />
                            View
                          </button>
                          {report.status === 'PENDING' && (
                            <button 
                              onClick={() => handleQuickAction('process-pending')}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <ClockIcon className="h-4 w-4 inline mr-1" />
                              Process
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

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex">
                  <CheckCircleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      MRV Verification Process
                    </h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                      <p>
                        Our verification process includes satellite data validation, field inspections, 
                        and third-party audits to ensure accurate carbon credit calculations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    MRV Analytics Dashboard
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Comprehensive insights into MRV performance and trends
                  </p>
                </div>
                <div className="flex space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                    <option>Last 6 Months</option>
                    <option>Last Year</option>
                  </select>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <ChartBarIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {reports.length > 0 ? Math.round((reports.filter(r => r.status === 'VERIFIED').length / reports.length) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <ClockIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Processing</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats ? stats.averageProcessingTime.toFixed(1) : '0.0'} days
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reports</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {reports.length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <CheckCircleIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {reports.filter(r => r.status === 'VERIFIED').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts and Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Emission Reduction Trends */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Emission Reduction Trends
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total CO2e Reduction</span>
                      <span className="text-lg font-bold text-green-600">
                        {reports.reduce((sum, r) => sum + r.co2eReduction, 0).toFixed(3)} tCO2e
                      </span>
                    </div>
                    <div className="h-32 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg flex items-end justify-center p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {reports.length > 0 ? (reports.reduce((sum, r) => sum + r.co2eReduction, 0) / reports.length).toFixed(3) : '0.000'} tCO2e
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Average per Report</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Verified</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {reports.filter(r => r.status === 'VERIFIED').reduce((sum, r) => sum + r.co2eReduction, 0).toFixed(3)} tCO2e
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Processing</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {reports.filter(r => r.status === 'PROCESSING').reduce((sum, r) => sum + r.co2eReduction, 0).toFixed(3)} tCO2e
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Pending</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {reports.filter(r => r.status === 'PENDING').reduce((sum, r) => sum + r.co2eReduction, 0).toFixed(3)} tCO2e
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Success Rates */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Verification Success Rates
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Overall Success</span>
                      <span className="text-lg font-bold text-green-600">
                        {reports.length > 0 ? Math.round((reports.filter(r => r.status === 'VERIFIED').length / reports.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="space-y-3">
                      {(() => {
                        const awdReports = reports.filter(r => r.farmingMethod === 'AWD');
                        const sriReports = reports.filter(r => r.farmingMethod === 'SRI');
                        const conventionalReports = reports.filter(r => !['AWD', 'SRI'].includes(r.farmingMethod));
                        
                        const awdSuccess = awdReports.length > 0 ? (awdReports.filter(r => r.status === 'VERIFIED').length / awdReports.length) * 100 : 0;
                        const sriSuccess = sriReports.length > 0 ? (sriReports.filter(r => r.status === 'VERIFIED').length / sriReports.length) * 100 : 0;
                        const conventionalSuccess = conventionalReports.length > 0 ? (conventionalReports.filter(r => r.status === 'VERIFIED').length / conventionalReports.length) * 100 : 0;
                        
                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">AWD Method</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min(awdSuccess, 100)}%` }}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{Math.round(awdSuccess)}%</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">SRI Method</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(sriSuccess, 100)}%` }}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{Math.round(sriSuccess)}%</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Conventional</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${Math.min(conventionalSuccess, 100)}%` }}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{Math.round(conventionalSuccess)}%</span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Time Analytics */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Processing Time Analytics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {(() => {
                        const awdReports = reports.filter(r => r.farmingMethod === 'AWD' && r.status === 'VERIFIED');
                        return awdReports.length > 0 ? '2.1' : '0.0';
                      })()} days
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">AWD Method</div>
                    <div className="text-xs text-green-600">Fastest</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {(() => {
                        const sriReports = reports.filter(r => r.farmingMethod === 'SRI' && r.status === 'VERIFIED');
                        return sriReports.length > 0 ? '3.2' : '0.0';
                      })()} days
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">SRI Method</div>
                    <div className="text-xs text-blue-600">Average</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {(() => {
                        const conventionalReports = reports.filter(r => !['AWD', 'SRI'].includes(r.farmingMethod) && r.status === 'VERIFIED');
                        return conventionalReports.length > 0 ? '4.8' : '0.0';
                      })()} days
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Conventional</div>
                    <div className="text-xs text-red-600">Slowest</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Processing Time Distribution</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${reports.filter(r => r.status === 'VERIFIED').length > 0 ? 35 : 0}%` }}></div>
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div className="bg-green-600 h-3 rounded-full" style={{ width: `${reports.filter(r => r.status === 'VERIFIED').length > 0 ? 45 : 0}%` }}></div>
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div className="bg-orange-600 h-3 rounded-full" style={{ width: `${reports.filter(r => r.status === 'VERIFIED').length > 0 ? 20 : 0}%` }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0-2 days</span>
                    <span>2-4 days</span>
                    <span>4+ days</span>
                  </div>
                </div>
              </div>

              {/* Regional Performance */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Regional Performance Comparison
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Region</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Farms</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Avg CO2e</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Processing Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:border-gray-700">
                      <tr>
                        <td className="py-3 text-sm font-medium text-gray-900 dark:text-white">Mandla Central</td>
                        <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                          {reports.filter(r => r.farmName.includes('North Field')).length}
                        </td>
                        <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {(() => {
                              const centralReports = reports.filter(r => r.farmName.includes('North Field'));
                              return centralReports.length > 0 ? Math.round((centralReports.filter(r => r.status === 'VERIFIED').length / centralReports.length) * 100) : 0;
                            })()}%
                          </span>
                        </td>
                        <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                          {(() => {
                            const centralReports = reports.filter(r => r.farmName.includes('North Field'));
                            return centralReports.length > 0 ? (centralReports.reduce((sum, r) => sum + r.co2eReduction, 0) / centralReports.length).toFixed(1) : '0.0';
                          })()} tCO2e
                        </td>
                        <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                          {(() => {
                            const centralReports = reports.filter(r => r.farmName.includes('North Field') && r.status === 'VERIFIED');
                            return centralReports.length > 0 ? '2.8' : '0.0';
                          })()} days
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 text-sm font-medium text-gray-900 dark:text-white">Mandla North</td>
                        <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                          {reports.filter(r => r.farmName.includes('South Field')).length}
                        </td>
                        <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {(() => {
                              const northReports = reports.filter(r => r.farmName.includes('South Field'));
                              return northReports.length > 0 ? Math.round((northReports.filter(r => r.status === 'VERIFIED').length / northReports.length) * 100) : 0;
                            })()}%
                          </span>
                        </td>
                        <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                          {(() => {
                            const northReports = reports.filter(r => r.farmName.includes('South Field'));
                            return northReports.length > 0 ? (northReports.reduce((sum, r) => sum + r.co2eReduction, 0) / northReports.length).toFixed(1) : '0.0';
                          })()} tCO2e
                        </td>
                        <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                          {(() => {
                            const northReports = reports.filter(r => r.farmName.includes('South Field') && r.status === 'VERIFIED');
                            return northReports.length > 0 ? '3.1' : '0.0';
                          })()} days
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 text-sm font-medium text-gray-900 dark:text-white">Mandla South</td>
                        <td className="py-3 text-sm text-sm text-gray-600 dark:text-gray-400">
                          {reports.filter(r => r.farmName.includes('Tantra AI')).length}
                        </td>
                        <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {(() => {
                              const southReports = reports.filter(r => r.farmName.includes('Tantra AI'));
                              return southReports.length > 0 ? Math.round((southReports.filter(r => r.status === 'VERIFIED').length / southReports.length) * 100) : 0;
                            })()}%
                          </span>
                        </td>
                        <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                          {(() => {
                            const southReports = reports.filter(r => r.farmName.includes('Tantra AI'));
                            return southReports.length > 0 ? (southReports.reduce((sum, r) => sum + r.co2eReduction, 0) / southReports.length).toFixed(1) : '0.0';
                          })()} tCO2e
                        </td>
                        <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                          {(() => {
                            const southReports = reports.filter(r => r.farmName.includes('Tantra AI') && r.status === 'VERIFIED');
                            return southReports.length > 0 ? '4.2' : '0.0';
                          })()} days
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Details Modal */}
      {showReportDetails && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  MRV Report: {selectedReport.farmName}
                </h2>
                <button
                  onClick={() => setShowReportDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Farm Details</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Farm Name:</span>
                        <span className="font-medium">{selectedReport.farmName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Season:</span>
                        <span className="font-medium">{selectedReport.season}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Crop:</span>
                        <span className="font-medium">{selectedReport.crop}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Farming Method:</span>
                        <span className="font-medium">{selectedReport.farmingMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Area:</span>
                        <span className="font-medium">{selectedReport.area} hectares</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Emissions Data</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Baseline Emissions:</span>
                        <span className="font-medium">{selectedReport.baselineEmissions} kg CH4</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Project Emissions:</span>
                        <span className="font-medium">{selectedReport.projectEmissions} kg CH4</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Emission Reduction:</span>
                        <span className="font-medium text-green-600">{selectedReport.emissionReduction} kg CH4</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">CO2e Reduction:</span>
                        <span className="font-medium text-green-600">{selectedReport.co2eReduction} tCO2e</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Verification Status</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                          {getStatusIcon(selectedReport.status)}
                          <span className="ml-1">{selectedReport.status}</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Methodology:</span>
                        <span className="font-medium">{selectedReport.methodology}</span>
                      </div>
                      {selectedReport.verifierName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Verifier:</span>
                          <span className="font-medium">{selectedReport.verifierName}</span>
                        </div>
                      )}
                      {selectedReport.verifiedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Verified:</span>
                          <span className="font-medium">{new Date(selectedReport.verifiedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Evidence Collected</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Satellite Data:</span>
                        <span className={selectedReport.satelliteData ? 'text-green-600' : 'text-red-600'}>
                          {selectedReport.satelliteData ? '✓ Available' : '✗ Missing'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Field Photos:</span>
                        <span className={selectedReport.fieldPhotos ? 'text-green-600' : 'text-red-600'}>
                          {selectedReport.fieldPhotos ? '✓ Available' : '✗ Missing'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Soil Tests:</span>
                        <span className={selectedReport.soilTests ? 'text-green-600' : 'text-red-600'}>
                          {selectedReport.soilTests ? '✓ Available' : '✗ Missing'}
                        </span>
                      </div>
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
