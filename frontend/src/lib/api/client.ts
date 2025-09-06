import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { env } from '@/config/env';
import { secureStorage } from '@/lib/utils/secureStorage';
import { AUTH_ROUTES } from '@/lib/utils/constants';
import { isTokenExpired } from '@/lib/utils/jwt';
import { refreshAccessToken } from './auth';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: env.API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = secureStorage.getAccessToken();
    
    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        try {
          console.log(' Token expired, attempting refresh...');
          const newToken = await refreshAccessToken();
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
            console.log(' Token refreshed successfully');
          } else {
            console.warn(' Token refresh failed - no new token received');
            throw new Error('Token refresh failed');
          }
        } catch (error) {
          // If refresh fails, clear auth data and redirect to login
          console.error(' Token refresh failed:', error);
          secureStorage.clearAuthData();
          if (typeof window !== 'undefined') {
            window.location.href = AUTH_ROUTES.LOGIN;
          }
          throw error;
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      console.warn(' No access token found for API request to:', config.url);
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error(' Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        secureStorage.clearAuthData();
        if (typeof window !== 'undefined') {
          window.location.href = AUTH_ROUTES.LOGIN;
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Public client for auth endpoints that don't need interceptors
export const publicApiClient = axios.create({
  baseURL: env.API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});