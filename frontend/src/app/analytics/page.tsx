'use client'

import { useAuthStore } from '@/store/auth-store'
import ProtectedRoute from '@/components/protected-route'
import Navigation from '@/components/navigation'
import { SimpleAnalyticsDashboard } from '@/components/analytics/simple-analytics-dashboard'

export default function AnalyticsPage() {
  const { user } = useAuthStore()

  if (user?.role !== 'ADMIN') {
    return (
      <ProtectedRoute>
        <Navigation>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600">You don&apos;t have permission to access analytics.</p>
            </div>
          </div>
        </Navigation>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <Navigation>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Comprehensive analytics and insights for your university system.
            </p>
          </div>
          
          <SimpleAnalyticsDashboard userRole="ADMIN" />
        </div>
      </Navigation>
    </ProtectedRoute>
  )
}
