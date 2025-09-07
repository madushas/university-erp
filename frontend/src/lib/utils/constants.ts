export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  COURSES: '/courses',
  HOME: '/',
};

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',
  },
  COURSES: '/api/v1/courses',
  REGISTRATIONS: '/api/v1/registrations',
  USERS: '/api/v1/users',
  ADMIN: '/api/v1/admin',
};

// Centralized app navigation routes
export const NAV_ROUTES = {
  HOME: '/',
  LOGIN: AUTH_ROUTES.LOGIN,
  REGISTER: AUTH_ROUTES.REGISTER,
  DASHBOARD: AUTH_ROUTES.DASHBOARD,
  COURSES: '/courses',
  COURSES_MY: '/courses/my',
  REGISTRATION: '/registration',
  ACADEMIC_RECORDS: '/academic-records',
  DEGREE_AUDIT: '/degree-audit',
  PAYMENTS: '/payments',
} as const;

export const ROLES = {
  ADMIN: 'ADMIN',
  STUDENT: 'STUDENT',
  INSTRUCTOR: 'INSTRUCTOR',
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to access this resource',
  SESSION_EXPIRED: 'Your session has expired. Please login again',
  NETWORK_ERROR: 'Network error. Please check your connection',
  INVALID_CREDENTIALS: 'Invalid username or password',
  SERVER_ERROR: 'Server error. Please try again later',
};

// Role utilities
export type AppRole = keyof typeof ROLES;

/**
 * Normalize a role string to the standardized unprefixed, uppercased form
 * - Accepts values like "ADMIN", "ROLE_ADMIN", "admin", etc.
 * - Maps legacy synonyms (e.g., FACULTY) to the closest app role
 */
export const normalizeRole = (role?: string | null): string | null => {
  if (!role || typeof role !== 'string') return null;
  let r = role.trim().toUpperCase();
  if (r.startsWith('ROLE_')) r = r.substring(5);
  // Map legacy synonyms if they appear in payloads
  if (r === 'FACULTY') r = ROLES.INSTRUCTOR;
  return r;
};

/** Compare a user role with a required role allowing prefixed/unprefixed inputs */
export const roleEquals = (userRole?: string | null, requiredRole?: string | null): boolean => {
  const u = normalizeRole(userRole);
  const r = normalizeRole(requiredRole);
  return !!u && !!r && u === r;
};

/** Check if user roles include any of the required roles (normalized) */
export const rolesInclude = (userRoles: (string | null | undefined)[] | undefined, required: (string | null | undefined)[]): boolean => {
  if (!userRoles || userRoles.length === 0 || !required || required.length === 0) return false;
  const normalizedUser = new Set(userRoles.map(normalizeRole).filter(Boolean) as string[]);
  return required.map(normalizeRole).some((r) => !!r && normalizedUser.has(r as string));
};