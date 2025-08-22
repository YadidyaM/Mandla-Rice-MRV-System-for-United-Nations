/**
 * API Service for HTTP requests
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '@/types/api';
import { logger } from '@/utils/logger';

class ApiService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Force production URL for now - remove this when Netlify env vars are set
    this.baseURL = 'https://mandla-rice-mrv-377709c13120.herokuapp.com';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const tokens = this.getTokensFromStorage();
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }

        // Log request in development
        if (import.meta.env.DEV) {
          logger.debug('API Request', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        logger.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development
        if (import.meta.env.DEV) {
          logger.debug('API Response', {
            status: response.status,
            url: response.config.url,
            data: response.data,
          });
        }

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const tokens = this.getTokensFromStorage();
            if (tokens?.refreshToken) {
              const newTokens = await this.refreshToken(tokens.refreshToken);
              this.saveTokensToStorage(newTokens);
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear auth and redirect to login
            this.clearTokensFromStorage();
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        }

        // Transform error for consistent handling
        const apiError: ApiError = {
          message: error.response?.data?.error?.message || error.message || 'An error occurred',
          code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
          status: error.response?.status || 500,
          details: error.response?.data?.error?.details,
        };

        logger.error('API Error', apiError);
        return Promise.reject(apiError);
      }
    );
  }

  private getTokensFromStorage() {
    try {
      const tokens = localStorage.getItem('auth_tokens');
      return tokens ? JSON.parse(tokens) : null;
    } catch {
      return null;
    }
  }

  private saveTokensToStorage(tokens: any) {
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  }

  private clearTokensFromStorage() {
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('auth_user');
  }

  private async refreshToken(refreshToken: string) {
    const response = await axios.post(`${this.baseURL}/auth/refresh`, {
      refreshToken,
    });
    return response.data.data.tokens;
  }

  // Generic request methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // File upload method
  async uploadFile<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await this.client.post<ApiResponse<T>>(url, formData, config);
    return response.data.data;
  }

  // Download file method
  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  // Get base URL
  getBaseURL(): string {
    return this.baseURL;
  }

  // Update base URL
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
    this.client.defaults.baseURL = baseURL;
  }
}

export const apiService = new ApiService();
export const api = apiService;
