'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';

export function ConditionalHeader() {
  const pathname = usePathname();
  
  // Don't show header on protected routes that have their own navigation
  const isProtectedRoute = pathname?.startsWith('/dashboard') || 
                          pathname?.startsWith('/admin') || 
                          pathname?.startsWith('/profile') ||
                          pathname?.startsWith('/courses') ||
                          pathname?.startsWith('/hr');
  
  if (isProtectedRoute) {
    return null;
  }
  
  return <Header />;
}