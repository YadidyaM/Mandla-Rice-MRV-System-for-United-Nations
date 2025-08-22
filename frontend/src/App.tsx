import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout Components
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Pages - Lazy loaded for better performance
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const Test3D = React.lazy(() => import('@/pages/Test3D'));
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage'));
const DashboardPage = React.lazy(() => import('@/pages/dashboard/DashboardPage'));
const FarmsPage = React.lazy(() => import('@/pages/farms/FarmsPage'));
const FarmDetailsPage = React.lazy(() => import('@/pages/farms/FarmDetailsPage'));
const AddFarmPage = React.lazy(() => import('@/pages/farms/AddFarmPage'));
const MRVPage = React.lazy(() => import('@/pages/mrv/MRVPage'));
const MRVReportPage = React.lazy(() => import('@/pages/mrv/MRVReportPage'));
const CarbonCreditsPage = React.lazy(() => import('@/pages/credits/CarbonCreditsPage'));
const MarketplacePage = React.lazy(() => import('@/pages/marketplace/MarketplacePage'));
const ProfilePage = React.lazy(() => import('@/pages/profile/ProfilePage'));

const HelpPage = React.lazy(() => import('@/pages/help/HelpPage'));
const AdminDashboardPage = React.lazy(() => import('@/pages/admin/AdminDashboardPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

// Loading fallback component
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/test-3d" element={<Test3D />} />
            
            {/* Auth Routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>
            
            {/* Protected Routes */}
            <Route path="/app" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Farms */}
              <Route path="farms" element={<FarmsPage />} />
              <Route path="farms/add" element={<AddFarmPage />} />
              <Route path="farms/:farmId" element={<FarmDetailsPage />} />
              
              {/* MRV */}
              <Route path="mrv" element={<MRVPage />} />
              <Route path="mrv/report/:reportId" element={<MRVReportPage />} />
              
              {/* Carbon Credits */}
              <Route path="credits" element={<CarbonCreditsPage />} />
              
              {/* Marketplace */}
              <Route path="marketplace" element={<MarketplacePage />} />
              
              {/* Profile & Settings */}
              <Route path="profile" element={<ProfilePage />} />
              <Route path="help" element={<HelpPage />} />
              
              {/* Admin Routes */}
              <Route path="admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboardPage /></ProtectedRoute>} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  );
};

export default App;
