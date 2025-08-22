/**
 * Authentication Provider
 * Manages user authentication state and provides auth context
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { User, AuthTokens } from '@/types';
import { authService } from '@/services/auth';
import { logger } from '@/utils/logger';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email?: string; phone?: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    setUser,
    setTokens,
    setLoading,
    clearAuth,
  } = useAuthStore();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        const storedTokens = localStorage.getItem('auth_tokens');
        const storedUser = localStorage.getItem('auth_user');
        
        if (storedTokens && storedUser) {
          const parsedTokens = JSON.parse(storedTokens);
          const parsedUser = JSON.parse(storedUser);
          
          // Check if tokens are still valid
          if (await authService.validateToken(parsedTokens.accessToken)) {
            setTokens(parsedTokens);
            setUser(parsedUser);
          } else {
            // Try to refresh tokens
            try {
              const newTokens = await authService.refreshToken(parsedTokens.refreshToken);
              setTokens(newTokens);
              setUser(parsedUser);
              localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
            } catch (error) {
              // Refresh failed, clear auth
              clearAuth();
              localStorage.removeItem('auth_tokens');
              localStorage.removeItem('auth_user');
            }
          }
        }
      } catch (error) {
        logger.error('Failed to initialize auth:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setUser, setTokens, setLoading, clearAuth]);

  const login = async (credentials: { email?: string; phone?: string; password: string }) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      // The backend returns { user, tokens } directly from authService
      const { user, tokens } = response;
      
      setUser(user);
      setTokens(tokens);
      
      // Persist to localStorage
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_tokens', JSON.stringify(tokens));
      
      logger.info('User logged in successfully', { userId: user.id });
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    try {
      setLoading(true);
      console.log('Calling authService.register with data:', data);
      
      const response = await authService.register(data);
      console.log('authService.register response:', response);
      
      if (!response) {
        throw new Error('No response received from registration service');
      }
      
      // The backend returns { user, tokens } directly from authService
      const { user, tokens } = response;
      
      if (!user || !tokens) {
        throw new Error('Invalid response format: missing user or tokens');
      }
      
      setUser(user);
      setTokens(tokens);
      
      // Persist to localStorage
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_tokens', JSON.stringify(tokens));
      
      logger.info('User registered successfully', { userId: user.id });
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (tokens) {
        await authService.logout();
      }
    } catch (error) {
      logger.error('Logout error:', error);
    } finally {
      clearAuth();
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_tokens');
      logger.info('User logged out');
    }
  };

  const refreshToken = async () => {
    try {
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const newTokens = await authService.refreshToken(tokens.refreshToken);
      setTokens(newTokens);
      localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
    } catch (error) {
      logger.error('Token refresh failed:', error);
      await logout();
      throw error;
    }
  };

  const updateProfile = async (data: any) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      logger.info('Profile updated successfully');
    } catch (error) {
      logger.error('Profile update failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
