/**
 * Authentication Service
 */

import { apiService } from './api';
import { User, AuthTokens, LoginCredentials, RegisterData } from '@/types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiService.post('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    console.log('AuthService.register called with data:', data);
    console.log('Making API call to /auth/register');
    
    try {
      const response = await apiService.post('/auth/register', data);
      console.log('authService.register response:', response);
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await apiService.post('/auth/logout');
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiService.post('/auth/refresh', { refreshToken });
    return response.data.tokens;
  }

  async getProfile(): Promise<User> {
    const response = await apiService.get('/auth/me');
    return response.data;
  }

  async updateProfile(data: any): Promise<User> {
    const response = await apiService.put('/auth/profile', data);
    return response.data;
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      // Simple validation by making an authenticated request
      await apiService.get('/auth/me');
      return true;
    } catch {
      return false;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    await apiService.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await apiService.post('/auth/reset-password', { token, password });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/change-password', { 
      currentPassword, 
      newPassword 
    });
  }
}

export const authService = new AuthService();
