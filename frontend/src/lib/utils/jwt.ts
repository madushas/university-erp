import { jwtDecode } from 'jwt-decode';
import { JWTPayload } from '@/lib/types/auth';

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

export const hasRole = (token: string, role: string): boolean => {
  // For now, we'll get the role from localStorage user data
  // since the JWT doesn't contain role information
  if (typeof window === 'undefined') return false;
  
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.role === role;
    }
  } catch {
    // JWT doesn't contain role information, so no fallback available
  }
  
  return false;
};

export const getUserIdFromToken = (token: string): string | null => {
  // Get user ID from localStorage user data
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id?.toString() || null;
    }
  } catch {
    // Fallback to JWT sub claim
    const decoded = decodeToken(token);
    return decoded ? decoded.sub : null;
  }
  
  return null;
};