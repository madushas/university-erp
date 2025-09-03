'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { secureStorage } from '@/lib/utils/secureStorage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallbackUrl?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackUrl = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, checkRole } = useAuth();
  const router = useRouter();

  // If localStorage already has auth data, treat that as an immediate authentication
  // hint to avoid a short race where the AuthProvider hasn't hydrated yet.
  const hasLocalAuth = typeof window !== 'undefined' && secureStorage.isAuthenticated();

  useEffect(() => {
    if (!isLoading || hasLocalAuth) {
      // If we do not have any auth information at all, redirect to fallback
      if (!isAuthenticated && !hasLocalAuth) {
        router.push(fallbackUrl);
      } else if (requiredRole && !checkRole(requiredRole) && !hasLocalAuth) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, requiredRole, router, fallbackUrl, checkRole, hasLocalAuth]);

  // If still loading and there's no local stored auth, show spinner
  if (isLoading && !hasLocalAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated after loading and no local auth fallback, don't render children
  if (!isAuthenticated && !hasLocalAuth) {
    return null;
  }

  // If a required role is specified and the user doesn't have it (and we can't verify via local token), hide
  if (requiredRole && !checkRole(requiredRole) && !hasLocalAuth) {
    return null;
  }

  return <>{children}</>;
}