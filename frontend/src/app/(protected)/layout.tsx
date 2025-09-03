'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleBasedNavigation } from '@/components/layout/RoleBasedNavigation';

export const dynamic = 'force-dynamic';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <RoleBasedNavigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}