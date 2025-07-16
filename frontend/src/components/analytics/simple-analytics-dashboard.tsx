import React, { useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAnalyticsStore } from '@/store/analytics-store'
import { MetricGrid } from '@/components/analytics/metric-cards'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface SimpleAnalyticsDashboardProps {
  readonly userRole?: 'ADMIN' | 'STUDENT' | 'INSTRUCTOR'
  readonly userId?: number
}

export function SimpleAnalyticsDashboard({ userRole = 'ADMIN', userId }: SimpleAnalyticsDashboardProps) {
  const { 
    dashboardAnalytics, 
    loading,
    error,
    fetchDashboardAnalytics,
    clearError
  } = useAnalyticsStore()

  const handleRefresh = useCallback(async () => {
    try {
      await fetchDashboardAnalytics()
    } catch (err) {
      console.error('Failed to refresh analytics:', err)
    }
  }, [fetchDashboardAnalytics])

  const getDashboardTitle = () => {
    switch (userRole) {
      case 'ADMIN':
        return 'Admin Dashboard'
      case 'STUDENT':
        return 'My Dashboard'
      case 'INSTRUCTOR':
        return 'Instructor Dashboard'
      default:
        return 'Dashboard'
    }
  }

  const getDashboardDescription = () => {
    switch (userRole) {
      case 'ADMIN':
        return 'Complete analytics and system overview'
      case 'STUDENT':
        return 'Your academic progress and course information'
      case 'INSTRUCTOR':
        return 'Course management and student analytics'
      default:
        return 'Analytics dashboard'
    }
  }

  useEffect(() => {
    handleRefresh()
  }, [userRole, userId, handleRefresh])

  if (loading && !dashboardAnalytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading analytics: {error}</p>
            <Button onClick={() => { clearError(); handleRefresh(); }} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{getDashboardTitle()}</h1>
          <p className="text-gray-600">{getDashboardDescription()}</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <MetricGrid analytics={dashboardAnalytics} userRole={userRole} />

      {dashboardAnalytics?.recentActivity && dashboardAnalytics.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardAnalytics.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={`activity-${activity.id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.user || 'System'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{activity.timestamp}</p>
                    <p className="text-xs text-gray-400">{activity.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
