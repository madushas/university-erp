import { secureStorage } from './secureStorage';
import { isTokenExpired, decodeToken } from './jwt';

export interface AuthDebugInfo {
  hasToken: boolean;
  tokenValid: boolean;
  tokenExpired: boolean;
  hasUser: boolean;
  userRole: string | null;
  username: string | null;
  isAuthenticated: boolean;
  tokenPayload: Record<string, unknown> | null;
  storageStats: Record<string, unknown>;
}

/**
 * Debug utility to diagnose authentication issues
 */
export const getAuthDebugInfo = (): AuthDebugInfo => {
  const token = secureStorage.getAccessToken();
  const user = secureStorage.getUser();
  const storageStats = secureStorage.getStorageStats();
  
  let tokenPayload = null;
  let tokenValid = false;
  let tokenExpired = true;
  
  if (token) {
    try {
      tokenPayload = decodeToken(token);
      tokenValid = !!tokenPayload;
      tokenExpired = isTokenExpired(token);
    } catch (error) {
      console.error('Token decode error:', error);
    }
  }
  
  return {
    hasToken: !!token,
    tokenValid,
    tokenExpired,
    hasUser: !!user,
    userRole: user?.role || null,
    username: user?.username || null,
    isAuthenticated: secureStorage.isAuthenticated(),
    tokenPayload: tokenPayload as Record<string, unknown> | null,
    storageStats,
  };
};

/**
 * Log detailed authentication debug information
 */
export const logAuthDebug = (context: string = 'Auth Debug'): void => {
  const debugInfo = getAuthDebugInfo();
  
  console.group(`🔐 ${context}`);
  console.log('Has Token:', debugInfo.hasToken);
  console.log('Token Valid:', debugInfo.tokenValid);
  console.log('Token Expired:', debugInfo.tokenExpired);
  console.log('Has User:', debugInfo.hasUser);
  console.log('User Role:', debugInfo.userRole);
  console.log('Username:', debugInfo.username);
  console.log('Is Authenticated:', debugInfo.isAuthenticated);
  console.log('Token Payload:', debugInfo.tokenPayload);
  console.log('Storage Stats:', debugInfo.storageStats);
  console.groupEnd();
};

/**
 * Check if authentication is properly configured for API calls
 */
export const validateAuthForApiCall = (endpoint: string): {
  canProceed: boolean;
  issues: string[];
} => {
  const debugInfo = getAuthDebugInfo();
  const issues: string[] = [];
  
  if (!debugInfo.hasToken) {
    issues.push('No access token found');
  }
  
  if (!debugInfo.tokenValid) {
    issues.push('Access token is invalid');
  }
  
  if (debugInfo.tokenExpired) {
    issues.push('Access token has expired');
  }
  
  if (!debugInfo.hasUser) {
    issues.push('No user data found');
  }
  
  if (!debugInfo.userRole) {
    issues.push('User role is missing');
  }
  
  if (!debugInfo.isAuthenticated) {
    issues.push('User is not authenticated');
  }
  
  const canProceed = issues.length === 0;
  
  if (!canProceed) {
    console.warn(`🚫 API call to ${endpoint} blocked due to auth issues:`, issues);
  }
  
  return { canProceed, issues };
};
