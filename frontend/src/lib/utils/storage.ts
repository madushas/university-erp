import { AuthResponse, User } from '@/lib/types/auth';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const storage = {
  // Token management
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setAccessToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  // User management
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  setUser: (user: User): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Auth data management
  setAuthData: (data: AuthResponse): void => {
    if (data.accessToken) {
      storage.setAccessToken(data.accessToken);
    }
    if (data.refreshToken) {
      storage.setRefreshToken(data.refreshToken);
    }
    if (data.user) {
      storage.setUser(data.user);
    }
  },

  clearAuthData: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Clear any session storage
    sessionStorage.clear();
  },

  // Session management
  setSessionData: (key: string, value: unknown): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(key, JSON.stringify(value));
  },

  getSessionData: (key: string): unknown => {
    if (typeof window === 'undefined') return null;
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  // Cookie management for middleware compatibility
  setCookie: (name: string, value: string, minutes: number): void => {
    if (typeof window === 'undefined') return;
    const expires = new Date();
    expires.setTime(expires.getTime() + minutes * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  },

  deleteCookie: (name: string): void => {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  },

  // Authentication status check
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    const token = storage.getAccessToken();
    const user = storage.getUser();
    return !!(token && user);
  },
};