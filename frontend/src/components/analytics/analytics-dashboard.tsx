'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download, Calendar, Users, BookOpen, TrendingUp, DollarSign } from 'lucide-react'
import { useAnalyticsStore } from '@/store/analytics-store'

interface AnalyticsDashboardProps {
  userRole?: 'ADMIN' | 'STUDENT' | 'INSTRUCTOR'
  userId?: number
}

export function AnalyticsDashboard({ userRole = 'ADMIN', userId }: Readonly<AnalyticsDashboardProps>) {
  const { 
    dashboardAnalytics, 
    loading,
    error,
    fetchDashboardAnalytics
  } = useAnalyticsStore()

  const [refreshing, setRefreshing] = useState(false)

  const loadAnalytics = useCallback(async () => {
    setRefreshing(true)
    try {
      await fetchDashboardAnalytics()
    } catch (err) {
      console.error('Failed to load analytics:', err)
    } finally {
      setRefreshing(false)
    }
  }, [fetchDashboardAnalytics])

  useEffect(() => {
    loadAnalytics()
  }, [userRole, userId, loadAnalytics])

  const handleRefresh = () => {
    loadAnalytics()
  }

  const handleExportData = () => {
    if (dashboardAnalytics) {
      const dataStr = JSON.stringify(dashboardAnalytics, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      const exportFileDefaultName = 'analytics_data.json'
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
    }
  }

  const getDashboardTitle = () => {
    switch (userRole) {
      case 'ADMIN':
        return 'Analytics Dashboard'
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
        return 'Comprehensive system analytics and insights'
      case 'STUDENT':
        return 'Your academic progress and course information'
      case 'INSTRUCTOR':
        return 'Course management and student analytics'
      default:
        return 'Analytics dashboard'
    }
  }

  if (loading && !dashboardAnalytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading analytics: {error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getDashboardTitle()}</h1>
          <p className="text-gray-600 mt-1">{getDashboardDescription()}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Total Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardAnalytics?.totalCourses || 0}</div>
                <p className="text-xs text-gray-500">Available courses</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardAnalytics?.totalStudents || 0}</div>
                <p className="text-xs text-gray-500">Registered students</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Total Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardAnalytics?.totalRegistrations || 0}</div>
                <p className="text-xs text-gray-500">Course enrollments</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Active Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardAnalytics?.activeRegistrations || 0}</div>
                <p className="text-xs text-gray-500">Currently enrolled</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Completed Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardAnalytics?.completedCourses || 0}</div>
                <p className="text-xs text-gray-500">Successfully completed</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Pending Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardAnalytics?.pendingRegistrations || 0}</div>
                <p className="text-xs text-gray-500">Awaiting approval</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system activities</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardAnalytics?.recentActivity && dashboardAnalytics.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {dashboardAnalytics.recentActivity.slice(0, 10).map((activity) => (
                    <div key={`activity-${activity.id}`} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === 'COURSE_CREATED' && <BookOpen className="h-4 w-4 text-blue-500" />}
                        {activity.type === 'STUDENT_ENROLLED' && <Users className="h-4 w-4 text-green-500" />}
                        {activity.type === 'COURSE_COMPLETED' && <TrendingUp className="h-4 w-4 text-purple-500" />}
                        {activity.type === 'COURSE_DROPPED' && <DollarSign className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            {activity.user && `by ${activity.user}`}
                            {activity.course && ` • ${activity.course}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
