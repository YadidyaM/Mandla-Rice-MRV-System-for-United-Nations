/**
 * Login Page Component
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import { useAuth } from '@/providers/AuthProvider';
import { LoginFormData, loginInputSchema, type LoginInputData } from '@/types/forms';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/utils/cn';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const from = location.state?.from?.pathname || '/app/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputData>({
    resolver: zodResolver(loginInputSchema),
  });

  const onSubmit = async (data: LoginInputData) => {
    try {
      setIsLoading(true);
      // Ensure password is present
      if (!data.password) {
        toast.error(t('profile.passwordRequired'));
        return;
      }
      await login(data as LoginFormData);
      toast.success(t('auth.loginSuccess'));
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.message || t('auth.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('auth.login')}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('profile.welcomeBack')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email or Phone */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            {t('profile.emailOrPhone')}
          </label>
          <input
            {...register('email')}
            type="text"
            placeholder={t('profile.emailOrPhonePlaceholder')}
            className={cn(
              'form-input',
              errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )}
          />
          {errors.email && (
            <p className="form-error">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            {t('auth.password')}
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('profile.passwordPlaceholder')}
              className={cn(
                'form-input pr-10',
                errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="form-error">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link
              to="/auth/forgot-password"
              className="text-primary-600 hover:text-primary-500"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary btn-md w-full"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" color="white" className="mr-2" />
              Signing in...
            </>
          ) : (
            t('auth.login')
          )}
        </button>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('auth.dontHaveAccount')}{' '}
            <Link
              to="/auth/register"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </form>

      {/* Demo Credentials */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Demo Credentials:
        </h4>
        <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
          <p><strong>Farmer:</strong> farmer@example.com / password123</p>
          <p><strong>Admin:</strong> admin@example.com / password123</p>
        </div>
      </div>
    </div>
  );
}
