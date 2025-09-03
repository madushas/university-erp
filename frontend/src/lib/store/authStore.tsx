'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode, useRef } from 'react';
import { User, RegisterRequest } from '@/lib/types/auth';
import { authApi } from '@/lib/api/auth';
import { secureStorage } from '@/lib/utils/secureStorage';
import { isTokenValid } from '@/lib/utils/tokenManager';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  checkAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload,
        isLoading: false 
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const checkAuthRef = useRef<(() => Promise<void>) | undefined>(undefined);

  const checkAuth = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if we have a valid token before making the request
      const token = secureStorage.getAccessToken();
      if (!token || !isTokenValid(token)) {
        // No valid token, set as not authenticated
        dispatch({ type: 'SET_USER', payload: null });
        return;
      }
      
      const data = await authApi.getCurrentUser();
      if (data) {
        dispatch({ type: 'SET_USER', payload: data as User });
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    } catch {
      dispatch({ type: 'SET_USER', payload: null });
    }
  }, []); // Empty dependency array - only create once

  // Store the function in ref to avoid dependency issues
  checkAuthRef.current = checkAuth;

  const login = async (username: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      const data = await authApi.login({ username, password });
      if (data?.user && data.accessToken) {
        secureStorage.setAuthData(data);
        dispatch({ type: 'SET_USER', payload: data.user });
      } else {
        throw new Error('Login failed: Invalid response from server');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      throw error; // Re-throw the error so LoginForm can catch it
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Log error but don't throw - we still want to clear local data
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local data regardless of API call success
      secureStorage.clearAuthData();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const register = async (registerData: RegisterRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      await authApi.register(registerData);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const refreshAuth = async () => {
    const refreshToken = secureStorage.getRefreshToken();
    if (!refreshToken) {
      await logout();
      return;
    }
    try {
      const data = await authApi.refreshToken(refreshToken);
      if (data?.user && data.accessToken) {
        secureStorage.setAuthData(data);
        dispatch({ type: 'SET_USER', payload: data.user });
      } else {
        await logout();
      }
    } catch {
      await logout();
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Check auth on mount - but skip if we have stored auth data
  useEffect(() => {
    const storedToken = secureStorage.getAccessToken();
    const storedUser = secureStorage.getUser();
    
    if (storedToken && storedUser) {
      // If we have stored auth data, use it directly
      dispatch({ type: 'SET_USER', payload: storedUser });
    } else {
      // Otherwise, check with the server
      if (checkAuthRef.current) {
        checkAuthRef.current();
      }
    }
  }, []); // Empty dependency array - only run once on mount

  const value: AuthContextType = {
    ...state,
    checkAuth,
    login,
    logout,
    register,
    refreshAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export for backward compatibility (if needed)
export const useAuthStore = useAuth;