import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ChartBarIcon, 
  CameraIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowLeftIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { api } from '../../services/api';
import { cn } from '../../utils/cn';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FarmDetails {
  id: string;
  name: string;
  area: number;
  coordinates: any;
  elevation?: number;
  soilType?: string;
  surveyNumber?: string;
  village: string;
  block: string;
  district: string;
  state: string;
  irrigationType: string;
  waterSource?: string;
  isActive: boolean;
  createdAt: string;
  farmer?: {
    id: string;
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      village?: string;
      block?: string;
    };
  };
  seasons?: FarmingSeason[];
  mrvReports?: MRVReport[];
  satelliteData?: SatelliteData[];
}

interface FarmingSeason {
  id: string;
  season: string;
  year: number;
  crop: string;
  variety?: string;
  sowingDate?: string;
  transplantDate?: string;
  harvestDate?: string;
  farmingMethod: string;
  expectedYield?: number;
  actualYield?: number;
  createdAt: string;
}

interface MRVReport {
  id: string;
  seasonId: string;
  status: string;
  verificationStatus: string;
  createdAt: string;
}

interface SatelliteData {
  id: string;
  date: string;
  satellite: string;
  floodStatus: string;
  createdAt: string;
}

export default function FarmDetailsPage() {
  const { t } = useTranslation();
  const { farmId } = useParams();
  const navigate = useNavigate();
  const [farm, setFarm] = useState<FarmDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  useEffect(() => {
    if (farmId) {
      fetchFarmDetails(farmId);
    }
  }, [farmId]);

  const fetchFarmDetails = async (id: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/farms/${id}`);
      setFarm(response.data.data);
    } catch (error: any) {
      toast.error('Failed to fetch farm details');
      console.error('Error fetching farm details:', error);
      
      // Fallback to mock data if API fails
      const mockFarms = {
        '1': {
          id: '1',
          name: 'Farm A - North Field',
          area: 2.5,
          coordinates: {
            coordinates: [[
              [80.3711, 22.5982],
              [80.3811, 22.5982],
              [80.3811, 22.6082],
              [80.3711, 22.6082],
              [80.3711, 22.5982]
            ]]
          },
          elevation: 450,
          soilType: 'Clay Loam',
          surveyNumber: 'SN001',
          village: 'Mandla',
          block: 'Mandla',
          district: 'Mandla',
          state: 'Madhya Pradesh',
          irrigationType: 'AWD',
          waterSource: 'Canal',
          isActive: true,
          createdAt: '2024-01-01',
          farmer: {
            id: '1',
            email: 'farmer@example.com',
            profile: {
              firstName: 'John',
              lastName: 'Doe',
              village: 'Mandla',
              block: 'Mandla'
            }
          },
          seasons: [
            {
              id: '1',
              season: 'Kharif',
              year: 2024,
              crop: 'Rice',
              variety: 'Basmati',
              sowingDate: '2024-06-15',
              transplantDate: '2024-07-15',
              harvestDate: '2024-11-15',
              farmingMethod: 'SRI',
              expectedYield: 2.5,
              actualYield: 2.3,
              createdAt: '2024-06-01'
            }
          ],
          mrvReports: [
            {
              id: '1',
              seasonId: '1',
              status: 'completed',
              verificationStatus: 'verified',
              createdAt: '2024-01-15'
            }
          ],
          satelliteData: [
            {
              id: '1',
              date: '2024-01-15',
              satellite: 'Sentinel-2',
              floodStatus: 'normal',
              createdAt: '2024-01-15'
            }
          ]
        },
        '2': {
          id: '2',
          name: 'Farm B - South Field',
          area: 1.8,
          coordinates: {
            coordinates: [[
              [80.3611, 22.5882],
              [80.3711, 22.5882],
              [80.3711, 22.5982],
              [80.3611, 22.5982],
              [80.3611, 22.5882]
            ]]
          },
          elevation: 445,
          soilType: 'Sandy Loam',
          surveyNumber: 'SN002',
          village: 'Bijadandi',
          block: 'Bijadandi',
          district: 'Mandla',
          state: 'Madhya Pradesh',
          irrigationType: 'SRI',
          waterSource: 'Well',
          isActive: true,
          createdAt: '2024-01-01',
          farmer: {
            id: '1',
            email: 'farmer@example.com',
            profile: {
              firstName: 'John',
              lastName: 'Doe',
              village: 'Bijadandi',
              block: 'Bijadandi'
            }
          },
          seasons: [
            {
              id: '2',
              season: 'Kharif',
              year: 2024,
              crop: 'Rice',
              variety: 'IR64',
              sowingDate: '2024-06-10',
              transplantDate: '2024-07-10',
              harvestDate: '2024-11-10',
              farmingMethod: 'SRI',
              expectedYield: 1.8,
              actualYield: 1.7,
              createdAt: '2024-06-01'
            }
          ],
          mrvReports: [
            {
              id: '2',
              seasonId: '2',
              status: 'completed',
              verificationStatus: 'verified',
              createdAt: '2024-01-10'
            }
          ],
          satelliteData: [
            {
              id: '2',
              date: '2024-01-10',
              satellite: 'Sentinel-2',
              floodStatus: 'normal',
              createdAt: '2024-01-10'
            }
          ]
        },
        '3': {
          id: '3',
          name: 'Tantra AI',
          area: 30,
          coordinates: {
            coordinates: [[
              [80.3511, 22.5782],
              [80.4011, 22.5782],
              [80.4011, 22.6282],
              [80.3511, 22.6282],
              [80.3511, 22.5782]
            ]]
          },
          elevation: 440,
          soilType: 'Alluvial',
          surveyNumber: 'SN003',
          village: 'Dholakpur',
          block: 'Dholakpur',
          district: 'Mandla',
          state: 'Madhya Pradesh',
          irrigationType: 'FLOOD',
          waterSource: 'River',
          isActive: true,
          createdAt: '2024-01-01',
          farmer: {
            id: '1',
            email: 'farmer@example.com',
            profile: {
              firstName: 'John',
              lastName: 'Doe',
              village: 'Dholakpur',
              block: 'Dholakpur'
            }
          },
          seasons: [
            {
              id: '3',
              season: 'Kharif',
              year: 2024,
              crop: 'Rice',
              variety: 'Hybrid',
              sowingDate: '2024-06-20',
              transplantDate: '2024-07-20',
              harvestDate: '2024-11-20',
              farmingMethod: 'Traditional',
              expectedYield: 30,
              actualYield: 28.5,
              createdAt: '2024-06-01'
            }
          ],
          mrvReports: [
            {
              id: '3',
              seasonId: '3',
              status: 'completed',
              verificationStatus: 'verified',
              createdAt: '2025-08-22'
            }
          ],
          satelliteData: [
            {
              id: '3',
              date: '2025-08-22',
              satellite: 'Sentinel-2',
              floodStatus: 'normal',
              createdAt: '2025-08-22'
            }
          ]
        },
        '4': {
          id: '4',
          name: 'jeevanpuram',
          area: 3.2,
          coordinates: {
            coordinates: [[
              [80.3611, 22.5882],
              [80.3811, 22.5882],
              [80.3811, 22.5982],
              [80.3611, 22.5982],
              [80.3611, 22.5882]
            ]]
          },
          elevation: 445,
          soilType: 'Clay Loam',
          surveyNumber: 'SN004',
          village: 'Jeevanpuram',
          block: 'Jeevanpuram',
          district: 'Mandla',
          state: 'Madhya Pradesh',
          irrigationType: 'AWD',
          waterSource: 'Canal',
          isActive: true,
          createdAt: '2024-01-01',
          farmer: {
            id: '1',
            email: 'farmer@example.com',
            profile: {
              firstName: 'John',
              lastName: 'Doe',
              village: 'Jeevanpuram',
              block: 'Jeevanpuram'
            }
          },
          seasons: [
            {
              id: '4',
              season: 'Kharif',
              year: 2024,
              crop: 'Rice',
              variety: 'Basmati',
              sowingDate: '2024-06-15',
              transplantDate: '2024-07-15',
              harvestDate: '2024-11-15',
              farmingMethod: 'AWD',
              expectedYield: 3.2,
              actualYield: 3.0,
              createdAt: '2024-06-01'
            }
          ],
          mrvReports: [
            {
              id: '4',
              seasonId: '4',
              status: 'completed',
              verificationStatus: 'verified',
              createdAt: '2025-08-22'
            }
          ],
          satelliteData: [
            {
              id: '4',
              date: '2025-08-22',
              satellite: 'Sentinel-2',
              floodStatus: 'normal',
              createdAt: '2025-08-22'
            }
          ]
        }
      };
      
      const mockFarm = mockFarms[id as keyof typeof mockFarms];
      if (mockFarm) {
        setFarm(mockFarm);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'verified':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'verified':
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'pending':
      case 'processing':
        return <ClockIcon className="w-4 h-4" />;
      case 'rejected':
      case 'failed':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <EyeIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateFarmCenter = (coordinates: any) => {
    if (!coordinates || !coordinates.coordinates || !coordinates.coordinates[0]) {
      return [22.5982, 80.3711]; // Default to Mandla
    }
    
    const coords = coordinates.coordinates[0];
    const lats = coords.map((coord: number[]) => coord[1]);
    const lngs = coords.map((coord: number[]) => coord[0]);
    
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    
    return [centerLat, centerLng];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading farm details...</p>
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Farm Not Found</h1>
          <p className="text-gray-600 mb-6">The farm you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/farms')}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Back to Farms
          </button>
        </div>
      </div>
    );
  }

  const farmCenter = calculateFarmCenter(farm.coordinates);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/farms')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{farm.name}</h1>
                <p className="text-gray-600">
                  {farm.village}, {farm.block}, {farm.district}, {farm.state}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                getStatusColor(farm.isActive ? 'active' : 'inactive')
              )}>
                {getStatusIcon(farm.isActive ? 'active' : 'inactive')}
                <span className="ml-1">{farm.isActive ? 'Active' : 'Inactive'}</span>
              </span>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                <CogIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: EyeIcon },
              { id: 'satellite', label: 'Satellite Data', icon: CameraIcon },
              { id: 'mrv', label: 'MRV Reports', icon: DocumentTextIcon },
              { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Farm Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPinIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Area</p>
                    <p className="text-2xl font-bold text-gray-900">{farm.area} ha</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CalendarIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Farming Seasons</p>
                    <p className="text-2xl font-bold text-gray-900">{farm.seasons?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">MRV Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{farm.mrvReports?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <CameraIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Satellite Images</p>
                    <p className="text-2xl font-bold text-gray-900">{farm.satelliteData?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Farm Map and Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Farm Map */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Farm Location</h3>
                </div>
                <div className="h-80">
                  <MapContainer
                    center={farmCenter as [number, number]}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {/* Farm Boundary */}
                    {farm.coordinates && (
                      <Polygon
                        positions={farm.coordinates.coordinates[0].map((coord: number[]) => [coord[1], coord[0]])}
                        pathOptions={{
                          color: '#3B82F6',
                          fillColor: '#3B82F6',
                          fillOpacity: 0.3,
                          weight: 2
                        }}
                      >
                        <Popup>
                          <div className="text-center">
                            <h3 className="font-semibold">{farm.name}</h3>
                            <p className="text-sm text-gray-600">{farm.area} hectares</p>
                            <p className="text-sm text-gray-600">{farm.village}, {farm.block}</p>
                          </div>
                        </Popup>
                      </Polygon>
                    )}
                  </MapContainer>
                </div>
              </div>

              {/* Farm Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Survey Number:</span>
                    <span className="font-medium">{farm.surveyNumber || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Soil Type:</span>
                    <span className="font-medium">{farm.soilType || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Elevation:</span>
                    <span className="font-medium">{farm.elevation ? `${farm.elevation}m` : 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Irrigation Type:</span>
                    <span className="font-medium">{farm.irrigationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Water Source:</span>
                    <span className="font-medium">{farm.waterSource || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registered:</span>
                    <span className="font-medium">{formatDate(farm.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Seasons */}
            {farm.seasons && farm.seasons.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Farming Seasons</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Season
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Crop
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Yield
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {farm.seasons.slice(0, 5).map((season) => (
                        <tr key={season.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {season.season} {season.year}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{season.crop}</div>
                            {season.variety && (
                              <div className="text-sm text-gray-500">{season.variety}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {season.farmingMethod}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {season.actualYield ? `${season.actualYield} kg/ha` : 'Pending'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              season.actualYield ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            )}>
                              {season.actualYield ? 'Completed' : 'In Progress'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Satellite Data Tab */}
        {activeTab === 'satellite' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Satellite Monitoring Data</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Recent satellite imagery and flood detection data for your farm
                </p>
              </div>
              <div className="p-6">
                {farm.satelliteData && farm.satelliteData.length > 0 ? (
                  <div className="space-y-4">
                    {farm.satelliteData.map((data) => (
                      <div key={data.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <CameraIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{data.satellite}</p>
                            <p className="text-sm text-gray-600">{formatDate(data.date)}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                          data.floodStatus === 'FLOODED' ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        )}>
                          {data.floodStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No satellite data available yet</p>
                    <p className="text-sm text-gray-400">Satellite monitoring will begin once your farm is registered</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MRV Reports Tab */}
        {activeTab === 'mrv' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">MRV Reports</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Measurement, Reporting, and Verification reports for carbon credit generation
                </p>
              </div>
              <div className="p-6">
                {farm.mrvReports && farm.mrvReports.length > 0 ? (
                  <div className="space-y-4">
                    {farm.mrvReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">MRV Report #{report.id.slice(-8)}</p>
                            <p className="text-sm text-gray-600">{formatDate(report.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                            getStatusColor(report.status)
                          )}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1">{report.status}</span>
                          </span>
                          <span className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                            getStatusColor(report.verificationStatus)
                          )}>
                            {getStatusIcon(report.verificationStatus)}
                            <span className="ml-1">{report.verificationStatus}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No MRV reports available yet</p>
                    <p className="text-sm text-gray-400">MRV reports will be generated after farming seasons</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Yield Trends */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Yield Trends</h3>
                {farm.seasons && farm.seasons.length > 0 ? (
                  <div className="space-y-3">
                    {farm.seasons
                      .filter(season => season.actualYield)
                      .map((season) => (
                        <div key={season.id} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {season.season} {season.year}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${Math.min((season.actualYield! / 5000) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {season.actualYield} kg/ha
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No yield data available yet</p>
                )}
              </div>

              {/* Farm Performance */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Registration Date</span>
                    <span className="text-sm font-medium">{formatDate(farm.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Seasons</span>
                    <span className="text-sm font-medium">{farm.seasons?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">MRV Reports</span>
                    <span className="text-sm font-medium">{farm.mrvReports?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Satellite Images</span>
                    <span className="text-sm font-medium">{farm.satelliteData?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Carbon Credit Potential */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Carbon Credit Potential</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {farm.area * 2.5}
                  </div>
                  <p className="text-sm text-green-800">Potential Credits (tCO2e)</p>
                  <p className="text-xs text-green-600 mt-1">Based on {farm.area} ha area</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {farm.irrigationType === 'AWD' ? 'High' : 'Medium'}
                  </div>
                  <p className="text-sm text-blue-800">Emission Reduction</p>
                  <p className="text-xs text-blue-600 mt-1">Based on irrigation method</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    ₹{(farm.area * 2.5 * 1500).toLocaleString()}
                  </div>
                  <p className="text-sm text-purple-800">Potential Value</p>
                  <p className="text-xs text-purple-600 mt-1">At ₹1500 per credit</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
