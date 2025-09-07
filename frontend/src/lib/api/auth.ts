import { api, publicApiClient } from './generated';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '@/lib/types/auth';
import { secureStorage } from '@/lib/utils/secureStorage';
import { roleEquals } from '@/lib/utils/constants';

// Simple error class
export class AuthError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code = 'AUTH_ERROR', status?: number) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = 'AuthError';
  }
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.auth.login(data);
      if (response.error) {
        throw new AuthError(`Login failed: ${response.error}`);
      }
      if (!response.data) {
        throw new AuthError('Login failed: No data returned');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.auth.register(data);
      if (response.error) {
        throw new AuthError(`Registration failed: ${response.error}`);
      }
      if (!response.data) {
        throw new AuthError('Registration failed: No data returned');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.auth.getCurrentUser();
      if (response.error) {
        throw new AuthError(`Failed to get user: ${response.error}`);
      }
      if (!response.data) {
        throw new AuthError('Failed to get user: No data returned');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(`Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    try {
      const response = await publicApiClient.POST('/api/v1/auth/refresh', {
        body: { refreshToken }
      });
      if (response.error) {
        throw new AuthError(`Token refresh failed: ${response.error}`);
      }
      if (!response.data) {
        throw new AuthError('Token refresh failed: No data returned');
      }
      return response.data;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  logout: async (): Promise<void> => {
    // Note: Backend may not have logout endpoint, this is just a client-side cleanup
    console.log('Logout called - clearing client-side data');
  },
};

// Legacy enhanced API for backward compatibility
export class EnhancedAuthApi {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return authApi.login(data);
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return authApi.register(data);
  }

  async logout(): Promise<void> {
    return authApi.logout();
  }

  async getCurrentUser(): Promise<User> {
    return authApi.getCurrentUser();
  }

  async refreshToken(refreshToken?: string): Promise<AuthResponse> {
    if (!refreshToken) {
      refreshToken = secureStorage.getRefreshToken() || '';
    }
    return authApi.refreshToken(refreshToken);
  }

  async validateRole(requiredRole: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return roleEquals(user.role, requiredRole);
    } catch {
      return false;
    }
  }

  isAuthenticated(): boolean {
    return secureStorage.isAuthenticated();
  }

  getAuthStatus() {
    const user = secureStorage.getUser();
    const token = secureStorage.getAccessToken();
    const isAuthenticated = secureStorage.isAuthenticated();
    
    return {
      isAuthenticated,
      user,
      hasToken: !!token
    };
  }
}

// Create singleton instance
export const enhancedAuthApi = new EnhancedAuthApi();

// Enhanced refresh function
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = secureStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const data = await authApi.refreshToken(refreshToken);
    if (data.accessToken) {
      secureStorage.setAuthData(data);
      return data.accessToken;
    }
    return null;
  } catch (error) {
    secureStorage.clearAuthData();
    throw error;
  }
};