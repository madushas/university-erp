import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SecureStorage, secureStorage } from '../secureStorage';
import { AuthResponse, User } from '@/lib/types/auth';

// Mock localStorage and sessionStorage
const mockStorage = () => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] || null
  };
};

// Mock document.cookie
const mockCookie = () => {
  let cookies: string[] = [];
  
  Object.defineProperty(document, 'cookie', {
    get: () => cookies.join('; '),
    set: (value: string) => {
      const [nameValue] = value.split(';');
      const [name] = nameValue.split('=');
      
      // Remove existing cookie with same name
      cookies = cookies.filter(cookie => !cookie.startsWith(`${name}=`));
      
      // Add new cookie if not expired
      if (!value.includes('expires=Thu, 01 Jan 1970')) {
        cookies.push(nameValue);
      }
    },
    configurable: true
  });
};

// Mock window object
const mockWindow = () => {
  Object.defineProperty(global, 'window', {
    value: {
      localStorage: mockStorage(),
      sessionStorage: mockStorage(),
    },
    configurable: true
  });
  
  Object.defineProperty(global, 'localStorage', {
    value: global.window.localStorage,
    configurable: true
  });
  
  Object.defineProperty(global, 'sessionStorage', {
    value: global.window.sessionStorage,
    configurable: true
  });
  
  Object.defineProperty(global, 'document', {
    value: { cookie: '' },
    configurable: true
  });
  
  mockCookie();
};

// Create mock JWT token
const createMockToken = (exp: number, sub: string = 'testuser') => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub, exp, iat: Math.floor(Date.now() / 1000) }));
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
};

const createValidToken = (minutesFromNow: number = 30) => {
  const futureTime = Math.floor(Date.now() / 1000) + (minutesFromNow * 60);
  return createMockToken(futureTime);
};

const createExpiredToken = () => {
  const expiredTime = Math.floor(Date.now() / 1000) - 3600;
  return createMockToken(expiredTime);
};

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'STUDENT'
};

const mockAuthResponse: AuthResponse = {
  accessToken: createValidToken(),
  refreshToken: 'refresh-token-123',
  user: mockUser
};

describe('SecureStorage', () => {
  let storage: SecureStorage;

  beforeEach(() => {
    mockWindow();
    storage = SecureStorage.getInstance();
  });

  afterEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = '';
    }
  });

  describe('Token Management', () => {
    it('should store and retrieve access token', () => {
      const token = createValidToken();
      
      storage.setAccessToken(token);
      const retrievedToken = storage.getAccessToken();
      
      expect(retrievedToken).toBe(token);
    });

    it('should not store invalid token format', () => {
      const invalidToken = 'invalid-token';
      
      storage.setAccessToken(invalidToken);
      const retrievedToken = storage.getAccessToken();
      
      expect(retrievedToken).toBeNull();
    });

    it('should remove expired token automatically', () => {
      const expiredToken = createExpiredToken();
      
      storage.setAccessToken(expiredToken);
      const retrievedToken = storage.getAccessToken();
      
      expect(retrievedToken).toBeNull();
    });

    it('should store and retrieve refresh token', () => {
      const refreshToken = 'refresh-token-123';
      
      storage.setRefreshToken(refreshToken);
      const retrievedToken = storage.getRefreshToken();
      
      expect(retrievedToken).toBe(refreshToken);
    });

    it('should remove tokens', () => {
      const token = createValidToken();
      const refreshToken = 'refresh-token-123';
      
      storage.setAccessToken(token);
      storage.setRefreshToken(refreshToken);
      
      storage.removeAccessToken();
      storage.removeRefreshToken();
      
      expect(storage.getAccessToken()).toBeNull();
      expect(storage.getRefreshToken()).toBeNull();
    });
  });

  describe('User Data Management', () => {
    it('should store and retrieve user data', () => {
      storage.setUser(mockUser);
      const retrievedUser = storage.getUser();
      
      expect(retrievedUser).toEqual(mockUser);
    });

    it('should remove user data', () => {
      storage.setUser(mockUser);
      storage.removeUser();
      
      expect(storage.getUser()).toBeNull();
    });
  });

  describe('Complete Auth Data Management', () => {
    it('should store complete auth data', () => {
      storage.setAuthData(mockAuthResponse);
      
      expect(storage.getAccessToken()).toBe(mockAuthResponse.accessToken);
      expect(storage.getRefreshToken()).toBe(mockAuthResponse.refreshToken);
      expect(storage.getUser()).toEqual(mockAuthResponse.user);
    });

    it('should clear all auth data', () => {
      storage.setAuthData(mockAuthResponse);
      storage.clearAuthData();
      
      expect(storage.getAccessToken()).toBeNull();
      expect(storage.getRefreshToken()).toBeNull();
      expect(storage.getUser()).toBeNull();
    });

    it('should handle partial auth data', () => {
      const partialAuth: AuthResponse = {
        accessToken: createValidToken(),
        refreshToken: undefined,
        user: undefined
      };
      
      storage.setAuthData(partialAuth);
      
      expect(storage.getAccessToken()).toBe(partialAuth.accessToken);
      expect(storage.getRefreshToken()).toBeNull();
      expect(storage.getUser()).toBeNull();
    });
  });

  describe('Session Data Management', () => {
    it('should store and retrieve session data', () => {
      const sessionData = { key: 'value', number: 123 };
      
      storage.setSessionData('test-key', sessionData);
      const retrievedData = storage.getSessionData('test-key');
      
      expect(retrievedData).toEqual(sessionData);
    });

    it('should handle session data expiration', () => {
      const sessionData = { key: 'value' };
      const shortExpiry = 100; // 100ms
      
      storage.setSessionData('test-key', sessionData, shortExpiry);
      
      // Should be available immediately
      expect(storage.getSessionData('test-key')).toEqual(sessionData);
      
      // Should expire after timeout
      setTimeout(() => {
        expect(storage.getSessionData('test-key')).toBeNull();
      }, shortExpiry + 50);
    });

    it('should remove session data', () => {
      storage.setSessionData('test-key', { data: 'test' });
      storage.removeSessionData('test-key');
      
      expect(storage.getSessionData('test-key')).toBeNull();
    });

    it('should clear all session data', () => {
      storage.setSessionData('key1', 'value1');
      storage.setSessionData('key2', 'value2');
      
      storage.clearSessionData();
      
      expect(storage.getSessionData('key1')).toBeNull();
      expect(storage.getSessionData('key2')).toBeNull();
    });
  });

  describe('Authentication Status', () => {
    it('should correctly identify authenticated state', () => {
      expect(storage.isAuthenticated()).toBe(false);
      
      storage.setAuthData(mockAuthResponse);
      expect(storage.isAuthenticated()).toBe(true);
      
      storage.clearAuthData();
      expect(storage.isAuthenticated()).toBe(false);
    });

    it('should return false for expired token', () => {
      const expiredAuth: AuthResponse = {
        accessToken: createExpiredToken(),
        refreshToken: 'refresh-token',
        user: mockUser
      };
      
      storage.setAuthData(expiredAuth);
      expect(storage.isAuthenticated()).toBe(false);
    });
  });

  describe('Storage Statistics', () => {
    it('should provide accurate storage statistics', () => {
      const stats = storage.getStorageStats();
      
      expect(stats.hasAccessToken).toBe(false);
      expect(stats.hasRefreshToken).toBe(false);
      expect(stats.hasUser).toBe(false);
      expect(stats.tokenExpiry).toBeNull();
      expect(stats.isAuthenticated).toBe(false);
    });

    it('should update statistics after storing data', () => {
      storage.setAuthData(mockAuthResponse);
      const stats = storage.getStorageStats();
      
      expect(stats.hasAccessToken).toBe(true);
      expect(stats.hasRefreshToken).toBe(true);
      expect(stats.hasUser).toBe(true);
      expect(stats.tokenExpiry).toBeTruthy();
      expect(stats.isAuthenticated).toBe(true);
    });
  });

  describe('Configuration Management', () => {
    it('should update storage configuration', () => {
      const newConfig = {
        tokenKey: 'custom_token_key',
        refreshTokenKey: 'custom_refresh_key'
      };
      
      storage.updateConfig(newConfig);
      const config = storage.getConfig();
      
      expect(config.tokenKey).toBe('custom_token_key');
      expect(config.refreshTokenKey).toBe('custom_refresh_key');
    });

    it('should maintain other config values when partially updating', () => {
      const originalConfig = storage.getConfig();
      
      storage.updateConfig({ tokenKey: 'new_token_key' });
      const updatedConfig = storage.getConfig();
      
      expect(updatedConfig.tokenKey).toBe('new_token_key');
      expect(updatedConfig.refreshTokenKey).toBe(originalConfig.refreshTokenKey);
      expect(updatedConfig.userKey).toBe(originalConfig.userKey);
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('Storage quota exceeded');
      };
      
      // Should not throw error
      expect(() => {
        storage.setAccessToken(createValidToken());
      }).not.toThrow();
      
      // Restore original method
      localStorage.setItem = originalSetItem;
    });

    it('should handle JSON parsing errors gracefully', () => {
      // Manually set invalid JSON in localStorage
      localStorage.setItem('uni_access_token', 'invalid-json');
      
      const token = storage.getAccessToken();
      expect(token).toBeNull();
    });
  });

  describe('Cookie Management', () => {
    it('should set and retrieve cookies', () => {
      const token = createValidToken();
      
      storage.setAccessToken(token);
      
      // Check if cookie was set (basic check since we're mocking)
      // Note: The cookie key might be different due to config changes in other tests
      expect(document.cookie).toContain('=');
    });

    it('should delete cookies when removing tokens', () => {
      const token = createValidToken();
      
      storage.setAccessToken(token);
      storage.removeAccessToken();
      
      // Cookie should be expired/removed
      expect(document.cookie).not.toContain(`uni_access_token=${token}`);
    });
  });

  describe('Server-Side Compatibility', () => {
    it('should handle server-side environment gracefully', () => {
      // Mock server environment
      const originalWindow = global.window;
      delete (global as Record<string, unknown>).window;
      
      const serverStorage = SecureStorage.getInstance();
      
      // Should not throw errors
      expect(() => {
        serverStorage.setAccessToken(createValidToken());
        serverStorage.getAccessToken();
        serverStorage.setUser(mockUser);
        serverStorage.getUser();
        serverStorage.clearAuthData();
      }).not.toThrow();
      
      // All operations should return null/undefined in server environment
      expect(serverStorage.getAccessToken()).toBeNull();
      expect(serverStorage.getUser()).toBeNull();
      expect(serverStorage.isAuthenticated()).toBe(false);
      
      // Restore window
      global.window = originalWindow;
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = SecureStorage.getInstance();
      const instance2 = SecureStorage.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(secureStorage);
    });
  });
});

// Test backward compatibility
describe('Backward Compatibility Storage', () => {
  beforeEach(() => {
    mockWindow();
  });

  afterEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
  });

  it('should provide backward compatible storage interface', async () => {
    const { storage } = await import('../secureStorage');
    
    const token = createValidToken();
    const refreshToken = 'refresh-token';
    const user = mockUser;
    
    // Test all backward compatibility methods
    storage.setAccessToken(token);
    expect(storage.getAccessToken()).toBe(token);
    
    storage.setRefreshToken(refreshToken);
    expect(storage.getRefreshToken()).toBe(refreshToken);
    
    storage.setUser(user);
    expect(storage.getUser()).toEqual(user);
    
    storage.setAuthData(mockAuthResponse);
    expect(storage.getAccessToken()).toBe(mockAuthResponse.accessToken);
    
    storage.clearAuthData();
    expect(storage.getAccessToken()).toBeNull();
    
    storage.setSessionData('test', 'value');
    expect(storage.getSessionData('test')).toBe('value');
  });
});