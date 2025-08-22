/**
 * Authentication Store using Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User, AuthTokens } from '@/types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: Boolean(user) 
        }, false, 'setUser'),

      setTokens: (tokens) => 
        set({ tokens }, false, 'setTokens'),

      setLoading: (isLoading) => 
        set({ isLoading }, false, 'setLoading'),

      clearAuth: () => 
        set({ 
          user: null, 
          tokens: null, 
          isAuthenticated: false 
        }, false, 'clearAuth'),
    }),
    {
      name: 'auth-store',
    }
  )
);
