import { AxiosError } from 'axios';
import { publicApiClient } from './client';
import apiClient from './client';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '@/lib/types/auth';
import { secureStorage } from '@/lib/utils/secureStorage';
import { tokenManager } from '@/lib/utils/tokenManager';
import { API_ROUTES, ERROR_MESSAGES } from '@/lib/utils/constants';

// Enhanced error types for better error handling
export interface AuthError extends Error {
  code: string;
  status?: number;
  details?: unknown;
  retryable?: boolean;
}

export interface AuthApiConfig {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

export class EnhancedAuthApi {
  private config: AuthApiConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
  };

  private refreshPromise: Promise<AuthResponse | null> | null = null;

  constructor(config?: Partial<AuthApiConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Create enhanced auth error with proper typing and context
   */
  private createAuthError(
    message: string,
    code: string,
    status?: number,
    details?: unknown,
    retryable = false
  ): AuthError {
    const error = new Error(message) as AuthError;
    error.code = code;
    error.status = status;
    error.details = details;
    error.retryable = retryable;
    return error;
  }

  /**
   * Handle API errors with comprehensive error mapping
   */
  private handleApiError(error: AxiosError): AuthError {
    if (!error.response) {
      // Network error
      return this.createAuthError(
        ERROR_MESSAGES.NETWORK_ERROR,
        'NETWORK_ERROR',
        undefined,
        error.message,
        true
      );
    }

    const { status, data } = error.response;
    const errorData = data as Record<string, unknown>;

    switch (status) {
      case 400:
        return this.createAuthError(
          (typeof errorData?.message === 'string' ? errorData.message : 'Invalid request'),
          'INVALID_REQUEST',
          status,
          errorData
        );
      case 401:
        return this.createAuthError(
          ERROR_MESSAGES.INVALID_CREDENTIALS,
          'INVALID_CREDENTIALS',
          status,
          errorData
        );
      case 403:
        return this.createAuthError(
          ERROR_MESSAGES.UNAUTHORIZED,
          'FORBIDDEN',
          status,
          errorData
        );
      case 404:
        return this.createAuthError(
          'Authentication endpoint not found',
          'ENDPOINT_NOT_FOUND',
          status,
          errorData
        );
      case 429:
        return this.createAuthError(
          'Too many requests. Please try again later',
          'RATE_LIMITED',
          status,
          errorData,
          true
        );
      case 500:
      case 502:
      case 503:
      case 504:
        return this.createAuthError(
          ERROR_MESSAGES.SERVER_ERROR,
          'SERVER_ERROR',
          status,
          errorData,
          true
        );
      default:
        return this.createAuthError(
          (typeof errorData?.message === 'string' ? errorData.message : 'Authentication failed'),
          'AUTH_ERROR',
          status,
          errorData
        );
    }
  }

  /**
   * Retry mechanism with exponential backoff
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries = this.config.maxRetries
  ): Promise<T> {
    let lastError: AuthError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error as AuthError : 
          this.createAuthError('Unknown error', 'UNKNOWN_ERROR');

        // Don't retry if error is not retryable or it's the last attempt
        if (!lastError.retryable || attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retrying with exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Validate login request data
   */
  private validateLoginRequest(data: LoginRequest): void {
    if (!data.username || !data.password) {
      throw this.createAuthError(
        'Username and password are required',
        'VALIDATION_ERROR'
      );
    }

    if (data.username.length < 3) {
      throw this.createAuthError(
        'Username must be at least 3 characters long',
        'VALIDATION_ERROR'
      );
    }

    if (data.password.length < 6) {
      throw this.createAuthError(
        'Password must be at least 6 characters long',
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * Validate register request data
   */
  private validateRegisterRequest(data: RegisterRequest): void {
    if (!data.username || !data.password || !data.email) {
      throw this.createAuthError(
        'Username, email, and password are required',
        'VALIDATION_ERROR'
      );
    }

    if (data.username.length < 3) {
      throw this.createAuthError(
        'Username must be at least 3 characters long',
        'VALIDATION_ERROR'
      );
    }

    if (data.password.length < 6) {
      throw this.createAuthError(
        'Password must be at least 6 characters long',
        'VALIDATION_ERROR'
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw this.createAuthError(
        'Please provide a valid email address',
        'VALIDATION_ERROR'
      );
    }
  }

  /**
   * Enhanced login with validation and error handling
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      this.validateLoginRequest(data);

      const response = await this.retryOperation(async () => {
        const result = await publicApiClient.post<AuthResponse>(
          API_ROUTES.AUTH.LOGIN, 
          data,
          { timeout: this.config.timeout }
        );
        return result;
      });

      // Validate response data
      if (!response.data.accessToken) {
        throw this.createAuthError(
          'Invalid response from server',
          'INVALID_RESPONSE'
        );
      }

      // Validate token format
      if (!tokenManager.validateTokenFormat(response.data.accessToken)) {
        throw this.createAuthError(
          'Invalid token format received',
          'INVALID_TOKEN'
        );
      }

      // Store auth data securely
      secureStorage.setAuthData(response.data);

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw this.handleApiError(error);
      }
      throw error;
    }
  }

  /**
   * Enhanced register with validation and error handling
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      this.validateRegisterRequest(data);

      const response = await this.retryOperation(async () => {
        const result = await publicApiClient.post<AuthResponse>(
          API_ROUTES.AUTH.REGISTER, 
          data,
          { timeout: this.config.timeout }
        );
        return result;
      });

      // Validate response data
      if (!response.data.accessToken) {
        throw this.createAuthError(
          'Invalid response from server',
          'INVALID_RESPONSE'
        );
      }

      // Store auth data securely
      secureStorage.setAuthData(response.data);

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw this.handleApiError(error);
      }
      throw error;
    }
  }

  /**
   * Enhanced logout with proper cleanup
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = secureStorage.getRefreshToken();
      
      if (refreshToken) {
        // Try to logout on server, but don't fail if it doesn't work
        try {
          await apiClient.post(
            API_ROUTES.AUTH.LOGOUT, 
            { refreshToken },
            { timeout: 5000 } // Shorter timeout for logout
          );
        } catch (error) {
          // Log error but don't throw - we still want to clear local data
          console.warn('Server logout failed:', error);
        }
      }
    } finally {
      // Always clear local auth data
      secureStorage.clearAuthData();
      this.refreshPromise = null;
    }
  }

  /**
   * Get current user with caching and validation
   */
  async getCurrentUser(): Promise<User> {
    try {
      // Check if we have cached user data
      const cachedUser = secureStorage.getUser();
      const token = secureStorage.getAccessToken();

      if (cachedUser && token && tokenManager.isTokenValid(token)) {
        // Return cached user if token is still valid
        return cachedUser;
      }

      // Fetch fresh user data
      const response = await this.retryOperation(async () => {
        return await apiClient.get<User>(
          API_ROUTES.AUTH.ME,
          { timeout: this.config.timeout }
        );
      });

      // Update cached user data
      secureStorage.setUser(response.data);

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw this.handleApiError(error);
      }
      throw error;
    }
  }

  /**
   * Enhanced token refresh with concurrency control
   */
  async refreshToken(refreshToken?: string): Promise<AuthResponse> {
    // If refresh is already in progress, return the same promise
    if (this.refreshPromise) {
      const result = await this.refreshPromise;
      if (result) return result;
    }

    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      const result = await this.refreshPromise;
      if (!result) {
        throw this.createAuthError(
          'Token refresh failed',
          'REFRESH_FAILED'
        );
      }
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform actual token refresh
   */
  private async performTokenRefresh(refreshToken?: string): Promise<AuthResponse | null> {
    try {
      const token = refreshToken || secureStorage.getRefreshToken();
      
      if (!token) {
        throw this.createAuthError(
          'No refresh token available',
          'NO_REFRESH_TOKEN'
        );
      }

      const response = await this.retryOperation(async () => {
        return await publicApiClient.post<AuthResponse>(
          API_ROUTES.AUTH.REFRESH,
          { refreshToken: token },
          { timeout: this.config.timeout }
        );
      });

      // Validate response
      if (!response.data.accessToken) {
        throw this.createAuthError(
          'Invalid refresh response',
          'INVALID_REFRESH_RESPONSE'
        );
      }

      // Update stored auth data
      secureStorage.setAuthData(response.data);

      return response.data;
    } catch (error) {
      // Clear auth data on refresh failure
      secureStorage.clearAuthData();
      
      if (error instanceof AxiosError) {
        throw this.handleApiError(error);
      }
      throw error;
    }
  }

  /**
   * Validate user role
   */
  async validateRole(requiredRole: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user.role==requiredRole;
    } catch {
      return false;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return secureStorage.isAuthenticated();
  }

  /**
   * Get authentication status with details
   */
  getAuthStatus(): {
    isAuthenticated: boolean;
    user: User | null;
    tokenExpiry: number | null;
    needsRefresh: boolean;
  } {
    const user = secureStorage.getUser();
    const token = secureStorage.getAccessToken();
    const isAuthenticated = secureStorage.isAuthenticated();
    
    let tokenExpiry: number | null = null;
    let needsRefresh = false;

    if (token) {
      tokenExpiry = tokenManager.getTokenExpirationTime(token);
      needsRefresh = tokenManager.shouldRefreshToken(token);
    }

    return {
      isAuthenticated,
      user,
      tokenExpiry,
      needsRefresh,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AuthApiConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): AuthApiConfig {
    return { ...this.config };
  }
}

// Create singleton instance
export const enhancedAuthApi = new EnhancedAuthApi();

// Export enhanced API as default
export const authApi = {
  login: (data: LoginRequest) => enhancedAuthApi.login(data),
  register: (data: RegisterRequest) => enhancedAuthApi.register(data),
  logout: () => enhancedAuthApi.logout(),
  getCurrentUser: () => enhancedAuthApi.getCurrentUser(),
  refreshToken: (refreshToken?: string) => enhancedAuthApi.refreshToken(refreshToken),
  validateRole: (role: string) => enhancedAuthApi.validateRole(role),
  isAuthenticated: () => enhancedAuthApi.isAuthenticated(),
  getAuthStatus: () => enhancedAuthApi.getAuthStatus(),
};

// Enhanced refresh function with token manager integration
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = secureStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Use token manager's retry mechanism
    return await tokenManager.refreshTokenWithRetry(
      refreshToken,
      async (token: string) => {
        return await enhancedAuthApi.refreshToken(token);
      }
    );
  } catch (error) {
    secureStorage.clearAuthData();
    throw error;
  }
};