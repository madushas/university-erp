import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { tokenManager } from '@/lib/utils/tokenManager';

// Route configuration with role-based access control
interface RouteConfig {
  path: string;
  roles?: string[];
  requireAuth: boolean;
  redirectTo?: string;
}

const routeConfigs: RouteConfig[] = [
  // Public routes (no authentication required)
  { path: '/', requireAuth: false },
  { path: '/login', requireAuth: false },
  { path: '/register', requireAuth: false },
  
  // Protected routes - general access
  { path: '/dashboard', requireAuth: true, redirectTo: '/login' },
  { path: '/profile', requireAuth: true, redirectTo: '/login' },
  
  // Student-specific routes
  { path: '/courses', requireAuth: true, roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN'], redirectTo: '/dashboard' },
  { path: '/students/records', requireAuth: true, roles: ['STUDENT', 'ADMIN'], redirectTo: '/dashboard' },
  { path: '/students/audit', requireAuth: true, roles: ['STUDENT', 'ADMIN'], redirectTo: '/dashboard' },
  { path: '/students/applications', requireAuth: true, roles: ['STUDENT', 'ADMIN'], redirectTo: '/dashboard' },
  
  // HR routes
  { path: '/hr', requireAuth: true, roles: ['ADMIN', 'HR'], redirectTo: '/dashboard' },
  { path: '/hr/employees', requireAuth: true, roles: ['ADMIN', 'HR'], redirectTo: '/dashboard' },
  { path: '/hr/leave', requireAuth: true, roles: ['ADMIN', 'HR', 'INSTRUCTOR'], redirectTo: '/dashboard' },
  
  // Admin-only routes
  { path: '/admin', requireAuth: true, roles: ['ADMIN'], redirectTo: '/dashboard' },
  { path: '/admin/users', requireAuth: true, roles: ['ADMIN'], redirectTo: '/dashboard' },
  { path: '/admin/system', requireAuth: true, roles: ['ADMIN'], redirectTo: '/dashboard' },
  { path: '/admin/analytics', requireAuth: true, roles: ['ADMIN'], redirectTo: '/dashboard' },
];

// Auth routes that should redirect authenticated users
const authRoutes = ['/login', '/register'];

/**
 * Enhanced token validation with comprehensive error handling
 */
function validateToken(token: string): { isValid: boolean; error?: string } {
  if (!token) {
    return { isValid: false, error: 'No token provided' };
  }

  if (!tokenManager.validateTokenFormat(token)) {
    return { isValid: false, error: 'Invalid token format' };
  }

  if (tokenManager.isTokenExpired(token)) {
    return { isValid: false, error: 'Token expired' };
  }

  return { isValid: true };
}

/**
 * Get user roles from stored user data (since JWT doesn't contain roles)
 */
function getUserRoles(request: NextRequest): string[] {
  try {
    // Try to get user data from cookie
    const userCookie = request.cookies.get('uni_user_data')?.value;
    if (userCookie) {
      const userData = JSON.parse(decodeURIComponent(userCookie));
      // Fix: Use 'role' (singular) instead of 'roles' (plural) to match the API schema
      const role = userData.role;
      return role ? [role] : [];
    }
    
    // Fallback: try to get from headers (for API requests)
    const userHeader = request.headers.get('x-user-roles');
    if (userHeader) {
      return userHeader.split(',').map(role => role.trim());
    }
    
    return [];
  } catch (error) {
    console.warn('Failed to parse user roles:', error);
    return [];
  }
}

/**
 * Check if user has required role for the route
 */
function hasRequiredRole(userRoles: string[], requiredRoles?: string[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // No specific roles required
  }
  
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Find matching route configuration for the given pathname
 */
function findRouteConfig(pathname: string): RouteConfig | null {
  // Find exact match first
  const exactMatch = routeConfigs.find(config => config.path === pathname);
  if (exactMatch) return exactMatch;
  
  // Find prefix match (longest match wins)
  const prefixMatches = routeConfigs
    .filter(config => pathname.startsWith(config.path) && config.path !== '/')
    .sort((a, b) => b.path.length - a.path.length);
  
  return prefixMatches[0] || null;
}

/**
 * Create redirect response with proper cleanup
 */
function createRedirectResponse(request: NextRequest, redirectPath: string, clearAuth = false): NextResponse {
  const response = NextResponse.redirect(new URL(redirectPath, request.url));
  
  if (clearAuth) {
    // Clear authentication cookies
    response.cookies.delete('uni_access_token');
    response.cookies.delete('uni_refresh_token');
    response.cookies.delete('uni_user_data');
    
    // Also clear legacy cookie names for backward compatibility
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
  }
  
  return response;
}

/**
 * Enhanced middleware with comprehensive authentication and authorization
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // Get authentication token from multiple sources
  const token = 
    request.cookies.get('uni_access_token')?.value ||
    request.cookies.get('accessToken')?.value || // Legacy support
    request.headers.get('authorization')?.replace('Bearer ', '');

  // Find route configuration
  const routeConfig = findRouteConfig(pathname);
  
  // If no specific route config found, allow access to public routes
  if (!routeConfig) {
    return NextResponse.next();
  }

  // Handle authentication requirements
  if (routeConfig.requireAuth) {
    const tokenValidation = validateToken(token || '');
    
    if (!tokenValidation.isValid) {
      // Token is invalid or expired, redirect to login
      const redirectPath = routeConfig.redirectTo || '/login';
      return createRedirectResponse(request, redirectPath, true);
    }

    // Check role-based access if roles are specified
    if (routeConfig.roles && routeConfig.roles.length > 0) {
      const userRoles = getUserRoles(request);
      
      if (!hasRequiredRole(userRoles, routeConfig.roles)) {
        // User doesn't have required role, redirect to appropriate page
        const redirectPath = routeConfig.redirectTo || '/dashboard';
        return createRedirectResponse(request, redirectPath);
      }
    }
  } else {
    // Route doesn't require auth, but check if authenticated user is accessing auth routes
    if (authRoutes.includes(pathname) && token) {
      const tokenValidation = validateToken(token);
      
      if (tokenValidation.isValid) {
        // Authenticated user trying to access login/register, redirect to dashboard
        return createRedirectResponse(request, '/dashboard');
      }
    }
  }

  // Add security headers
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add authentication status to headers for client-side use
  if (token) {
    const tokenValidation = validateToken(token);
    response.headers.set('X-Auth-Status', tokenValidation.isValid ? 'authenticated' : 'invalid');
    
    if (tokenValidation.isValid) {
      const userRoles = getUserRoles(request);
      response.headers.set('X-User-Roles', userRoles.join(','));
    }
  } else {
    response.headers.set('X-Auth-Status', 'unauthenticated');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};