import type { components } from '@/lib/api/schema';

// User types from the API schema
export type UserDto = components['schemas']['UserDto'];

// User role enum
export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN' | 'STAFF';

// User status enum
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED';

// Basic user information
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  studentId?: string;
  employeeId?: string;
}

// User profile information
export interface UserProfile extends User {
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  profilePictureUrl?: string;
  preferredLanguage?: string;
  timezone?: string;
}

// User search parameters
export interface UserSearchParams {
  query?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  page?: number;
  size?: number;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'role' | 'status';
  sortDirection?: 'asc' | 'desc';
}