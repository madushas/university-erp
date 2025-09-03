import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TokenManager, tokenManager } from '../tokenManager';
import type { AuthResponse } from '@/lib/types/auth';

// Mock JWT tokens for testing
const createMockToken = (exp: number, sub: string = 'testuser') => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub, exp, iat: Math.floor(Date.now() / 1000) }));
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
};

const createExpiredToken = () => {
  const expiredTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
  return createMockToken(expiredTime);
};

const createValidToken = (minutesFromNow: number = 30) => {
  const futureTime = Math.floor(Date.now() / 1000) + (minutesFromNow * 60);
  return createMockToken(futureTime);
};

describe('TokenManager', () => {
  let manager: TokenManager;

  beforeEach(() => {
    manager = TokenManager.getInstance();
    manager.clearPendingRefresh();
  });

  afterEach(() => {
    manager.clearPendingRefresh();
  });

  describe('Token Decoding', () => {
    it('should decode valid JWT token', () => {
      const token = createValidToken();
      const decoded = manager.decodeToken(token);
      
      expect(decoded).toBeTruthy();
      expect(decoded?.sub).toBe('testuser');
      expect(typeof decoded?.exp).toBe('number');
      expect(typeof decoded?.iat).toBe('number');
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = manager.decodeToken(invalidToken);
      
      expect(decoded).toBeNull();
    });
  });

  describe('Token Validation', () => {
    it('should validate token format correctly', () => {
      const validToken = createValidToken();
      const invalidToken = 'invalid-token';
      
      expect(manager.validateTokenFormat(validToken)).toBe(true);
      expect(manager.validateTokenFormat(invalidToken)).toBe(false);
    });

    it('should check if token is expired', () => {
      const validToken = createValidToken();
      const expiredToken = createExpiredToken();
      
      expect(manager.isTokenExpired(validToken)).toBe(false);
      expect(manager.isTokenExpired(expiredToken)).toBe(true);
    });

    it('should check if token is valid', () => {
      const validToken = createValidToken();
      const expiredToken = createExpiredToken();
      
      expect(manager.isTokenValid(validToken)).toBe(true);
      expect(manager.isTokenValid(expiredToken)).toBe(false);
    });
  });

  describe('Token Refresh Logic', () => {
    it('should identify when token needs refresh', () => {
      const validToken = createValidToken(30); // 30 minutes
      const expiredToken = createExpiredToken();
      
      expect(manager.shouldRefreshToken(validToken)).toBe(false);
      expect(manager.shouldRefreshToken(expiredToken)).toBe(true);
    });

    it('should handle refresh with retry mechanism', async () => {
      const refreshToken = 'refresh-token';
      let attemptCount = 0;
      
      const mockRefreshFunction = async (): Promise<AuthResponse> => {
        attemptCount++;
        if (attemptCount < 2) {
          throw new Error('Network error');
        }
        return {
          accessToken: createValidToken(),
          refreshToken: 'new-refresh-token',
          user: { id: 1, username: 'testuser', email: 'test@example.com' }
        };
      };

      const result = await manager.refreshTokenWithRetry(refreshToken, mockRefreshFunction);
      
      expect(result).toBeTruthy();
      expect(attemptCount).toBe(2);
    });
  });

  describe('Utility Functions', () => {
    it('should extract user ID from token', () => {
      const token = createMockToken(Math.floor(Date.now() / 1000) + 3600, 'user123');
      const userId = manager.getUserIdFromToken(token);
      
      expect(userId).toBe('user123');
    });

    it('should get token expiration time', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      const token = createMockToken(futureTime);
      const expirationTime = manager.getTokenExpirationTime(token);
      
      expect(expirationTime).toBe(futureTime * 1000);
    });
  });

  describe('Configuration Management', () => {
    it('should update refresh configuration', () => {
      const newConfig = {
        maxRetries: 5,
        retryDelay: 2000,
        refreshThreshold: 600
      };
      
      manager.updateRefreshConfig(newConfig);
      const currentConfig = manager.getRefreshConfig();
      
      expect(currentConfig.maxRetries).toBe(5);
      expect(currentConfig.retryDelay).toBe(2000);
      expect(currentConfig.refreshThreshold).toBe(600);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = TokenManager.getInstance();
      const instance2 = TokenManager.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(tokenManager);
    });
  });
});