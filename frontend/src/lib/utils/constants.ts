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
    LOGOUT: '/api/v1/auth/logout',
    ME: '/api/v1/users/me',
  },
  COURSES: '/api/v1/courses',
  REGISTRATIONS: '/api/v1/registrations',
  USERS: '/api/v1/users',
  ADMIN: '/api/v1/admin',
};

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