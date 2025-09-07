import { jwtDecode } from 'jwt-decode';
import { JWTPayload } from '@/lib/types/auth';
import { secureStorage } from '@/lib/utils/secureStorage';
import { roleEquals } from '@/lib/utils/constants';

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

export const getTokenExpirationTime = (token: string): number | null => {
  const decoded = decodeToken(token);
  return decoded ? decoded.exp * 1000 : null;
};

export const hasRole = (_token: string, role: string): boolean => {
  // Get the role from secure storage user data
  if (typeof window === 'undefined') return false;

  const user = secureStorage.getUser();
  if (user && user.role) {
    return roleEquals(user.role, role);
  }
  // Fallback to localStorage for backward compatibility
  try {
    const userData = localStorage.getItem('uni_user_data');
    if (userData) {
      const storageItem = JSON.parse(userData);
      const legacyUser = storageItem.value;
      return roleEquals(legacyUser?.role, role);
    }
  } catch {
    // ignore
  }

  return false;
};

export const getUserIdFromToken = (token: string): string | null => {
  // Get user ID from secure storage user data
  if (typeof window === 'undefined') return null;
  
  const user = secureStorage.getUser();
  if (user && user.id) {
    return user.id.toString();
  }
  // Fallback to localStorage for backward compatibility
  try {
    const userData = localStorage.getItem('uni_user_data');
    if (userData) {
      const storageItem = JSON.parse(userData);
      const legacyUser = storageItem.value;
      return legacyUser.id?.toString() || null;
    }
  } catch {
    // Fallback to JWT sub claim
    const decoded = decodeToken(token);
    return decoded ? decoded.sub : null;
  }
  
  return null;
};