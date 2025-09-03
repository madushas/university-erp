import { AuthResponse, User } from '@/lib/types/auth';
import { tokenManager } from './tokenManager';

export interface StorageConfig {
  tokenKey: string;
  refreshTokenKey: string;
  userKey: string;
  sessionPrefix: string;
  cookieOptions: {
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    httpOnly: boolean;
  };
}

export interface StorageItem<T = unknown> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

export class SecureStorage {
  private static instance: SecureStorage;
  private config: StorageConfig;

  private constructor() {
    this.config = {
      tokenKey: 'uni_access_token',
      refreshTokenKey: 'uni_refresh_token',
      userKey: 'uni_user_data',
      sessionPrefix: 'uni_session_',
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        httpOnly: false, // Client-side access needed
      },
    };
  }

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  /**
   * Check if we're in a browser environment
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Store item with metadata
   */
  private setStorageItem<T>(key: string, value: T, expiresIn?: number): void {
    if (!this.isBrowser()) return;

    const item: StorageItem<T> = {
      value,
      timestamp: Date.now(),
      expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
    };

    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to store item in localStorage:', error);
      // Fallback to sessionStorage if localStorage fails
      try {
        sessionStorage.setItem(key, JSON.stringify(item));
      } catch (error) {
        console.error('Failed to store item in sessionStorage:', error);
      }
    }
  }

  /**
   * Get item with expiration check
   */
  private getStorageItem<T>(key: string): T | null {
    if (!this.isBrowser()) return null;

    try {
      const itemStr = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (!itemStr) return null;

      const item: StorageItem<T> = JSON.parse(itemStr);
      
      // Check if item has expired
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.removeStorageItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Failed to retrieve item from storage:', error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  private removeStorageItem(key: string): void {
    if (!this.isBrowser()) return;

    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item from storage:', error);
    }
  }

  /**
   * Set cookie with security options
   */
  private setCookie(name: string, value: string, maxAge: number): void {
    if (!this.isBrowser()) return;

    const options = this.config.cookieOptions;
    const cookieString = [
      `${name}=${encodeURIComponent(value)}`,
      `Max-Age=${maxAge}`,
      'Path=/',
      `SameSite=${options.sameSite}`,
      options.secure ? 'Secure' : '',
    ].filter(Boolean).join('; ');

    document.cookie = cookieString;
  }

  /**
   * Get cookie value
   */
  private getCookie(name: string): string | null {
    if (!this.isBrowser()) return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    return null;
  }

  /**
   * Delete cookie
   */
  private deleteCookie(name: string): void {
    if (!this.isBrowser()) return;

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=${this.config.cookieOptions.sameSite}`;
  }

  // Public API methods

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    const token = this.getStorageItem<string>(this.config.tokenKey);
    
    // Validate token before returning
    if (token && !tokenManager.isTokenValid(token)) {
      this.removeAccessToken();
      return null;
    }
    
    return token;
  }

  /**
   * Set access token with automatic expiration
   */
  setAccessToken(token: string): void {
    if (!tokenManager.validateTokenFormat(token)) {
      console.error('Invalid token format provided');
      return;
    }

    const expirationTime = tokenManager.getTokenExpirationTime(token);
    const expiresIn = expirationTime ? expirationTime - Date.now() : undefined;

    this.setStorageItem(this.config.tokenKey, token, expiresIn);
    
    // Set cookie with same expiry as token for middleware access
    if (expiresIn) {
      const cookieMaxAge = Math.floor(expiresIn / 1000); // Convert to seconds
      this.setCookie(this.config.tokenKey, token, cookieMaxAge);
    } else {
      // Fallback to 1 hour if no expiry info
      this.setCookie(this.config.tokenKey, token, 3600);
    }
  }

  /**
   * Remove access token
   */
  removeAccessToken(): void {
    this.removeStorageItem(this.config.tokenKey);
    this.deleteCookie(this.config.tokenKey);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.getStorageItem<string>(this.config.refreshTokenKey);
  }

  /**
   * Set refresh token with longer expiration
   */
  setRefreshToken(token: string): void {
    // Refresh tokens typically last 24 hours
    const expiresIn = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    this.setStorageItem(this.config.refreshTokenKey, token, expiresIn);
    
    // Set as cookie with longer expiry
    this.setCookie(this.config.refreshTokenKey, token, 24 * 60 * 60); // 24 hours in seconds
  }

  /**
   * Remove refresh token
   */
  removeRefreshToken(): void {
    this.removeStorageItem(this.config.refreshTokenKey);
    this.deleteCookie(this.config.refreshTokenKey);
  }

  /**
   * Get user data
   */
  getUser(): User | null {
    return this.getStorageItem<User>(this.config.userKey);
  }

  /**
   * Set user data
   */
  setUser(user: User): void {
    this.setStorageItem(this.config.userKey, user);
    
    // Also set as cookie for middleware access
    const userData = JSON.stringify(user);
    // Set user data cookie to expire in 24 hours
    this.setCookie(this.config.userKey, userData, 24 * 60 * 60);
  }

  /**
   * Remove user data
   */
  removeUser(): void {
    this.removeStorageItem(this.config.userKey);
  }

  /**
   * Set complete auth data
   */
  setAuthData(data: AuthResponse): void {
    if (data.accessToken) {
      this.setAccessToken(data.accessToken);
    }
    if (data.refreshToken) {
      this.setRefreshToken(data.refreshToken);
    }
    if (data.user) {
      this.setUser(data.user);
    }
  }

  /**
   * Clear all auth data
   */
  clearAuthData(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
    this.removeUser();
    this.clearSessionData();
    
    // Also clear cookies
    this.deleteCookie(this.config.tokenKey);
    this.deleteCookie(this.config.refreshTokenKey);
    this.deleteCookie(this.config.userKey);
  }

  /**
   * Set session data with expiration
   */
  setSessionData(key: string, value: unknown, expiresIn?: number): void {
    const sessionKey = `${this.config.sessionPrefix}${key}`;
    this.setStorageItem(sessionKey, value, expiresIn);
  }

  /**
   * Get session data
   */
  getSessionData<T = unknown>(key: string): T | null {
    const sessionKey = `${this.config.sessionPrefix}${key}`;
    return this.getStorageItem<T>(sessionKey);
  }

  /**
   * Remove session data
   */
  removeSessionData(key: string): void {
    const sessionKey = `${this.config.sessionPrefix}${key}`;
    this.removeStorageItem(sessionKey);
  }

  /**
   * Clear all session data
   */
  clearSessionData(): void {
    if (!this.isBrowser()) return;

    // Clear localStorage session items
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.config.sessionPrefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Clear sessionStorage completely
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getUser();
    return !!(token && user && tokenManager.isTokenValid(token));
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    hasUser: boolean;
    tokenExpiry: number | null;
    isAuthenticated: boolean;
  } {
    const accessToken = this.getAccessToken();
    return {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!this.getRefreshToken(),
      hasUser: !!this.getUser(),
      tokenExpiry: accessToken ? tokenManager.getTokenExpirationTime(accessToken) : null,
      isAuthenticated: this.isAuthenticated(),
    };
  }

  /**
   * Update storage configuration
   */
  updateConfig(config: Partial<StorageConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): StorageConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const secureStorage = SecureStorage.getInstance();

// Export for backward compatibility
export const storage = {
  getAccessToken: () => secureStorage.getAccessToken(),
  setAccessToken: (token: string) => secureStorage.setAccessToken(token),
  getRefreshToken: () => secureStorage.getRefreshToken(),
  setRefreshToken: (token: string) => secureStorage.setRefreshToken(token),
  getUser: () => secureStorage.getUser(),
  setUser: (user: User) => secureStorage.setUser(user),
  setAuthData: (data: AuthResponse) => secureStorage.setAuthData(data),
  clearAuthData: () => secureStorage.clearAuthData(),
  setSessionData: (key: string, value: unknown) => secureStorage.setSessionData(key, value),
  getSessionData: (key: string) => secureStorage.getSessionData(key),
  isAuthenticated: () => secureStorage.isAuthenticated(),
  setCookie: (name: string, value: string, minutes: number) => {
    secureStorage['setCookie'](name, value, minutes * 60);
  },
  deleteCookie: (name: string) => secureStorage['deleteCookie'](name),
};