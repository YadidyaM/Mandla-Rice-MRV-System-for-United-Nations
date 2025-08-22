import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapContainer, TileLayer, Marker, useMapEvents, Polygon } from 'react-leaflet';
import { Icon } from 'leaflet';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { farmSchema, type FarmFormData } from '../../types/forms';
import { api } from '../../services/api';
import { cn } from '../../utils/cn';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
  farmBoundary: [number, number][];
}

function MapClickHandler({ onMapClick, farmBoundary }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });
  return null;
}

export default function AddFarmPage() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [farmBoundary, setFarmBoundary] = useState<[number, number][]>([]);
  const [mapCenter] = useState<[number, number]>([22.5982, 80.3711]); // Mandla, MP
  const mapRef = useRef<any>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset
  } = useForm<FarmFormData>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      name: '',
      area: '',
      village: '',
      block: '',
      district: 'Mandla',
      state: 'Madhya Pradesh',
      surveyNumber: '',
      soilType: '',
      elevation: '',
      irrigationType: 'FLOOD',
      waterSource: 'TUBE_WELL',
      coordinates: undefined
    },
    mode: 'onChange'
  });

  const watchedArea = watch('area');



  const handleMapClick = (lat: number, lng: number) => {
    const newBoundary: [number, number] = [lng, lat];
    setFarmBoundary([...farmBoundary, newBoundary]);
    
    // Update form coordinates
    setValue('coordinates', {
      type: 'Polygon',
      coordinates: [[...farmBoundary, newBoundary]]
    });
  };

  const clearBoundary = () => {
    setFarmBoundary([]);
    setValue('coordinates', {
      type: 'Polygon',
      coordinates: [[]]
    });
  };

  const calculateArea = () => {
    if (farmBoundary.length < 3) return 0;
    
    // Proper polygon area calculation using Shoelace formula
    let area = 0;
    for (let i = 0; i < farmBoundary.length; i++) {
      const j = (i + 1) % farmBoundary.length;
      area += farmBoundary[i][0] * farmBoundary[j][1];
      area -= farmBoundary[j][0] * farmBoundary[i][1];
    }
    area = Math.abs(area) / 2;
    
    // Convert to hectares (approximate)
    // 1 degree of longitude ≈ 111.32 km at equator
    // 1 degree of latitude ≈ 111.32 km
    // Adjust for latitude (longitude degrees get smaller as you move away from equator)
    const latRad = mapCenter[0] * Math.PI / 180;
    const lonDegreeKm = 111.32 * Math.cos(latRad);
    const latDegreeKm = 111.32;
    
    // Convert to hectares (1 km² = 100 hectares)
    const areaInHectares = (area * lonDegreeKm * latDegreeKm) / 100;
    setValue('area', (Math.round(areaInHectares * 100) / 100).toString());
    
    // Show success message
    toast.success(`Area calculated: ${Math.round(areaInHectares * 100) / 100} hectares`);
  };

  const onSubmit = async (data: FarmFormData) => {
    if (farmBoundary.length < 3) {
      toast.error('Please draw farm boundary by clicking on the map (minimum 3 points)');
      return;
    }

    setIsSubmitting(true);
    try {
      // The schema now handles string-to-number transformation automatically
      const submitData = {
        ...data,
        // No need to manually convert area and elevation - schema handles it
      };

      console.log('Submitting farm data:', submitData);

      const response = await api.post('/farms', submitData);
      toast.success('Farm registered successfully!');
      reset();
      setFarmBoundary([]);
    } catch (error: any) {
      console.error('Farm registration error:', error);
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || 'Failed to register farm';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Register New Farm</h1>
          <p className="mt-2 text-gray-600">
            Add your farm details and draw the boundary on the map to get started with carbon credit generation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Farm Details Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Farm Information</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Farm Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farm Name *
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={cn(
                        "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                        errors.name ? "border-red-300" : "border-gray-300"
                      )}
                      placeholder="Enter farm name"
                    />
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Village and Block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Village *
                  </label>
                  <Controller
                    name="village"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={cn(
                          "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                          errors.village ? "border-red-300" : "border-gray-300"
                        )}
                        placeholder="Village name"
                      />
                    )}
                  />
                  {errors.village && (
                    <p className="mt-1 text-sm text-red-600">{errors.village.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Block *
                  </label>
                  <Controller
                    name="block"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={cn(
                          "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                          errors.block ? "border-red-300" : "border-gray-300"
                        )}
                        placeholder="Block name"
                      />
                    )}
                  />
                  {errors.block && (
                    <p className="mt-1 text-sm text-red-600">{errors.block.message}</p>
                  )}
                </div>
              </div>

              {/* Survey Number and Soil Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Survey Number
                  </label>
                  <Controller
                    name="surveyNumber"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Survey number"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soil Type
                  </label>
                  <Controller
                    name="soilType"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select soil type</option>
                        <option value="CLAY">Clay</option>
                        <option value="LOAMY">Loamy</option>
                        <option value="SANDY">Sandy</option>
                        <option value="BLACK">Black</option>
                        <option value="RED">Red</option>
                      </select>
                    )}
                  />
                </div>
              </div>

              {/* Irrigation Type and Water Source */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Irrigation Type *
                  </label>
                  <Controller
                    name="irrigationType"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="FLOOD">Flood Irrigation</option>
                        <option value="AWD">Alternate Wetting & Drying (AWD)</option>
                        <option value="SRI">System of Rice Intensification (SRI)</option>
                        <option value="DRIP">Drip Irrigation</option>
                        <option value="SPRINKLER">Sprinkler</option>
                        <option value="RAINFED">Rainfed</option>
                      </select>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Water Source
                  </label>
                  <Controller
                    name="waterSource"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="TUBE_WELL">Tube Well</option>
                        <option value="OPEN_WELL">Open Well</option>
                        <option value="CANAL">Canal</option>
                        <option value="RIVER">River</option>
                        <option value="POND">Pond</option>
                        <option value="RAINWATER">Rainwater</option>
                      </select>
                    )}
                  />
                </div>
              </div>

              {/* Area and Elevation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area (Hectares) *
                  </label>
                                     <div className="flex space-x-2">
                     <Controller
                       name="area"
                       control={control}
                       render={({ field }) => (
                         <input
                           {...field}
                           type="text"
                           inputMode="decimal"
                           className={cn(
                             "flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                             errors.area ? "border-red-300" : "border-gray-300"
                           )}
                           placeholder="Enter area in hectares"
                         />
                       )}
                     />
                    <button
                      type="button"
                      onClick={calculateArea}
                      disabled={farmBoundary.length < 3}
                      className={cn(
                        "px-3 py-2 text-sm font-medium rounded-md",
                        farmBoundary.length < 3
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      )}
                      title="Calculate area from map boundary"
                    >
                      📐
                    </button>
                  </div>
                  {errors.area && (
                    <p className="mt-1 text-sm text-red-600">{errors.area.message}</p>
                  )}
                  {parseFloat(watchedArea) > 0 && (
                    <p className="mt-1 text-sm text-green-600">
                      ✓ Area calculated: {watchedArea} hectares
                    </p>
                  )}
                </div>

                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Elevation (meters)
                   </label>
                   <Controller
                     name="elevation"
                     control={control}
                     render={({ field }) => (
                       <input
                         {...field}
                         type="text"
                         inputMode="numeric"
                         className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                         placeholder="Elevation in meters"
                       />
                     )}
                   />
                 </div>
              </div>

              {/* Form Status */}
              {farmBoundary.length < 3 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Please draw at least 3 points on the map to define your farm boundary before registering.
                  </p>
                </div>
              )}
              
              {farmBoundary.length >= 3 && parseFloat(watchedArea) === 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    ℹ️ Farm boundary is ready. Click the 📐 button to calculate the area, or enter it manually.
                  </p>
                </div>
              )}
              
              {farmBoundary.length >= 3 && parseFloat(watchedArea) > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    ✓ Farm is ready to register! All required information is complete.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || farmBoundary.length < 3}
                className={cn(
                  "w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
                  (isSubmitting || farmBoundary.length < 3)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary-600 hover:bg-primary-700"
                )}
              >
                {isSubmitting ? 'Registering Farm...' : 'Register Farm'}
              </button>
            </form>
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Farm Boundary</h2>
              <div className="flex space-x-2">
                <button
                  onClick={clearBoundary}
                  className="px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200"
                >
                  Clear Boundary
                </button>
              </div>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Instructions:</strong> Click on the map to draw your farm boundary. 
                Click at least 3 points to form a polygon. Use the 📐 button next to the Area field to calculate the area.
              </p>
              {farmBoundary.length > 0 && (
                <p className="text-sm text-blue-800 mt-1">
                  Points added: {farmBoundary.length} | 
                  {parseFloat(watchedArea) > 0 && ` Estimated area: ${watchedArea} hectares`}
                  {farmBoundary.length >= 3 && parseFloat(watchedArea) === 0 && (
                    <span className="text-orange-600"> - Click the 📐 button to calculate area</span>
                  )}
                </p>
              )}
            </div>

            <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
              <MapContainer
                ref={mapRef}
                center={mapCenter}
                zoom={13}
                style={{ height: '400px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <MapClickHandler onMapClick={handleMapClick} farmBoundary={farmBoundary} />
                
                {/* Draw farm boundary */}
                {farmBoundary.length >= 3 && (
                  <Polygon
                    positions={farmBoundary.map(([lng, lat]) => [lat, lng])}
                    pathOptions={{
                      color: 'green',
                      weight: 3,
                      fillOpacity: 0.2
                    }}
                  />
                )}
                
                {/* Show boundary points */}
                {farmBoundary.map(([lng, lat], index) => (
                  <Marker
                    key={index}
                    position={[lat, lng]}
                  />
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
