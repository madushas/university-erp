'use client';

import { useEffect, useState } from 'react';

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
  // Track client mount to keep SSR and first client render consistent and avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Only check local storage after mount (first client render keeps this false just like SSR)
  const hasLocalAuth = mounted && secureStorage.isAuthenticated();

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

  // Always render children to keep SSR and client trees consistent.
  // Hide content visually until we either have local auth or loading completes.
  const shouldHide = !mounted || (isLoading && !hasLocalAuth) || (!isAuthenticated && !hasLocalAuth) || (requiredRole && !checkRole(requiredRole) && !hasLocalAuth);
  return <div style={{ visibility: shouldHide ? 'hidden' : 'visible' }}>{children}</div>;
}