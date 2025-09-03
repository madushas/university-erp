import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/store/authStore';
import { secureStorage } from '@/lib/utils/secureStorage';
import { getTokenExpirationTime } from '@/lib/utils/jwt';

export const useRefreshToken = () => {
  const { refreshAuth } = useAuth();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const scheduleTokenRefresh = useCallback(() => {
    const token = secureStorage.getAccessToken();
    if (!token) return;

    const expirationTime = getTokenExpirationTime(token);
    if (!expirationTime) return;

    // Refresh 1 minute before expiration
    const refreshTime = expirationTime - Date.now() - 60000;
    
    if (refreshTime > 0) {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          await refreshAuth();
          scheduleTokenRefresh(); // Schedule next refresh
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      }, refreshTime);
    }
  }, [refreshAuth]);

  useEffect(() => {
    scheduleTokenRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [scheduleTokenRefresh]);

  return { scheduleTokenRefresh };
};