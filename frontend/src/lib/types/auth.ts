import type { components } from '@/lib/api/schema';

// Extract types from generated schema
export type User = components['schemas']['UserResponse'];
export type AuthResponse = components['schemas']['AuthResponse'];
export type LoginRequest = components['schemas']['LoginRequest'];
export type RegisterRequest = components['schemas']['RegisterRequest'];

// Legacy role type for backward compatibility
export interface Role {
  id: string;
  name: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  permissions?: string[];
}

export interface JWTPayload {
  sub: string;  // username
  iat: number;  // issued at
  exp: number;  // expiration time
  // Note: roles and userId are not in the JWT payload
  // They should be retrieved from the user object in localStorage
}