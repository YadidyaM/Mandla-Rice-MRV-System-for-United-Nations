/**
 * Farms Page Component
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PlusIcon, MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Farm {
  id: string;
  name: string;
  area: number;
  village: string;
  irrigationType: string;
  status: string;
  lastMRV: string;
  coordinates?: any;
  soilType?: string;
  waterSource?: string;
}

export default function FarmsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const farmsData = await api.get('/farms');
      // The API service returns the full response, so we need to access farmsData.data
      const farmsArray = farmsData.data || farmsData;
      setFarms(farmsArray);
      
      // Store farms data in localStorage for MRV page to access dynamically
      localStorage.setItem('farmsData', JSON.stringify(farmsArray));
    } catch (error: any) {
      console.error('Error fetching farms:', error);
      toast.error('Failed to fetch farms');
      // Fallback to mock data if API fails
      const fallbackFarms = [
        {
          id: '1',
          name: 'Farm A - North Field',
          area: 2.5,
          village: 'Mandla',
          irrigationType: 'AWD',
          status: 'Active',
          lastMRV: '2024-01-15',
        },
        {
          id: '2',
          name: 'Farm B - South Field',
          area: 1.8,
          village: 'Mandla',
          irrigationType: 'SRI',
          status: 'Active',
          lastMRV: '2024-01-20',
        },
        {
          id: '3',
          name: 'Tantra AI',
          area: 30,
          village: 'Dholakpur',
          irrigationType: 'FLOOD',
          status: 'Active',
          lastMRV: '2025-08-22',
        },
        {
          id: '4',
          name: 'jeevanpuram',
          area: 3.2,
          village: 'Jeevanpuram',
          irrigationType: 'AWD',
          status: 'Active',
          lastMRV: '2025-08-22',
        }
      ];
      setFarms(fallbackFarms);
      
      // Store fallback data in localStorage as well
      localStorage.setItem('farmsData', JSON.stringify(fallbackFarms));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (farmId: string) => {
    console.log('Navigating to farm details:', farmId);
    navigate(`/app/farms/${farmId}`);
  };

  const handleProcessMRV = (farmId: string, farmName: string) => {
    console.log('Processing MRV for farm:', farmId, farmName);
    // Navigate to MRV page with farm context
    navigate('/app/mrv', { 
      state: { 
        selectedFarm: farmId,
        farmName: farmName,
        action: 'process-mrv'
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading farms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('farms.myFarms')}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your registered farms and their farming practices
          </p>
        </div>
        <Link
          to="/app/farms/add"
          className="btn btn-primary btn-md"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('farms.addFarm')}
        </Link>
      </div>

      {/* Farms Grid */}
      {farms.length === 0 ? (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No farms found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by adding your first farm.
          </p>
          <div className="mt-6">
            <Link
              to="/app/farms/add"
              className="btn btn-primary btn-md"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New Farm
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {farms.map((farm) => (
            <div key={farm.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {farm.name}
                  </h3>
                  <span className={`badge ${
                    farm.status === 'Active' ? 'badge-success' : 'badge-default'
                  }`}>
                    {farm.status}
                  </span>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {farm.village}, Mandla
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Area: {farm.area} hectares
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Irrigation: {farm.irrigationType}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Last MRV: {farm.lastMRV}
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => handleViewDetails(farm.id)}
                    className="btn btn-secondary btn-sm flex-1 hover:bg-secondary-700 transition-colors"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleProcessMRV(farm.id, farm.name)}
                    className="btn btn-primary btn-sm flex-1 hover:bg-primary-700 transition-colors"
                  >
                    Process MRV
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
