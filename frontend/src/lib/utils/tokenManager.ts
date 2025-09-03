import { jwtDecode } from 'jwt-decode';
import { JWTPayload, AuthResponse } from '@/lib/types/auth';

export interface TokenInfo {
  token: string;
  expiresAt: number;
  isExpired: boolean;
  timeUntilExpiry: number;
}

export interface RefreshConfig {
  maxRetries: number;
  retryDelay: number;
  refreshThreshold: number; // seconds before expiry to refresh
}

export class TokenManager {
  private static instance: TokenManager;
  private refreshPromise: Promise<string | null> | null = null;
  private refreshConfig: RefreshConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    refreshThreshold: 300, // 5 minutes
  };

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Decode JWT token safely
   */
  decodeToken(token: string): JWTPayload | null {
    try {
      return jwtDecode<JWTPayload>(token);
    } catch (error) {
      console.warn('Failed to decode JWT token:', error);
      return null;
    }
  }

  /**
   * Get detailed token information
   */
  getTokenInfo(token: string): TokenInfo | null {
    const decoded = this.decodeToken(token);
    if (!decoded) return null;

    const now = Date.now() / 1000;
    const expiresAt = decoded.exp * 1000;
    const isExpired = decoded.exp < now;
    const timeUntilExpiry = Math.max(0, decoded.exp - now);

    return {
      token,
      expiresAt,
      isExpired,
      timeUntilExpiry,
    };
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const tokenInfo = this.getTokenInfo(token);
    return tokenInfo ? tokenInfo.isExpired : true;
  }

  /**
   * Check if token needs refresh (within threshold)
   */
  shouldRefreshToken(token: string): boolean {
    const tokenInfo = this.getTokenInfo(token);
    if (!tokenInfo) return true;

    return tokenInfo.timeUntilExpiry <= this.refreshConfig.refreshThreshold;
  }

  /**
   * Get token expiration time in milliseconds
   */
  getTokenExpirationTime(token: string): number | null {
    const tokenInfo = this.getTokenInfo(token);
    return tokenInfo ? tokenInfo.expiresAt : null;
  }

  /**
   * Extract user ID from token
   */
  getUserIdFromToken(token: string): string | null {
    const decoded = this.decodeToken(token);
    return decoded ? decoded.sub : null;
  }

  /**
   * Validate token format and structure
   */
  validateTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    
    // JWT should have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Try to decode to ensure it's valid JWT
    const decoded = this.decodeToken(token);
    return decoded !== null;
  }

  /**
   * Check if token is valid (not expired and properly formatted)
   */
  isTokenValid(token: string): boolean {
    return this.validateTokenFormat(token) && !this.isTokenExpired(token);
  }

  /**
   * Refresh token with retry mechanism
   */
  async refreshTokenWithRetry(
    refreshToken: string,
    refreshFunction: (token: string) => Promise<AuthResponse>
  ): Promise<string | null> {
    // If refresh is already in progress, return the same promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefreshWithRetry(refreshToken, refreshFunction);
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performRefreshWithRetry(
    refreshToken: string,
    refreshFunction: (token: string) => Promise<AuthResponse>
  ): Promise<string | null> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.refreshConfig.maxRetries; attempt++) {
      try {
        const response = await refreshFunction(refreshToken);
        if (response.accessToken) {
          return response.accessToken;
        }
        throw new Error('No access token in refresh response');
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown refresh error');
        
        if (attempt < this.refreshConfig.maxRetries) {
          // Wait before retrying with exponential backoff
          const delay = this.refreshConfig.retryDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Token refresh failed after all retries');
  }

  /**
   * Schedule automatic token refresh
   */
  scheduleTokenRefresh(
    token: string,
    refreshFunction: () => Promise<void>
  ): NodeJS.Timeout | null {
    const tokenInfo = this.getTokenInfo(token);
    if (!tokenInfo) return null;

    // Schedule refresh 5 minutes before expiry
    const refreshTime = Math.max(0, tokenInfo.timeUntilExpiry - this.refreshConfig.refreshThreshold);
    const refreshTimeMs = refreshTime * 1000;

    if (refreshTimeMs <= 0) {
      // Token needs immediate refresh
      refreshFunction().catch(console.error);
      return null;
    }

    return setTimeout(() => {
      refreshFunction().catch(console.error);
    }, refreshTimeMs);
  }

  /**
   * Update refresh configuration
   */
  updateRefreshConfig(config: Partial<RefreshConfig>): void {
    this.refreshConfig = { ...this.refreshConfig, ...config };
  }

  /**
   * Get current refresh configuration
   */
  getRefreshConfig(): RefreshConfig {
    return { ...this.refreshConfig };
  }

  /**
   * Clear any pending refresh operations
   */
  clearPendingRefresh(): void {
    this.refreshPromise = null;
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance();

// Export utility functions for backward compatibility
export const decodeToken = (token: string) => tokenManager.decodeToken(token);
export const isTokenExpired = (token: string) => tokenManager.isTokenExpired(token);
export const getTokenExpirationTime = (token: string) => tokenManager.getTokenExpirationTime(token);
export const getUserIdFromToken = (token: string) => tokenManager.getUserIdFromToken(token);
export const validateTokenFormat = (token: string) => tokenManager.validateTokenFormat(token);
export const isTokenValid = (token: string) => tokenManager.isTokenValid(token);