'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAnalyticsStore } from '@/store/analytics-store'
import { MetricGrid } from '@/components/analytics/metric-cards'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Download, 
  RefreshCw,
  Users,
  BookOpen,
  GraduationCap,
  AlertCircle
} from 'lucide-react'

interface RealAnalyticsDashboardProps {
  readonly userRole?: 'ADMIN' | 'STUDENT' | 'INSTRUCTOR'
  readonly userId?: number
}

export function RealAnalyticsDashboard({ userRole = 'ADMIN', userId }: RealAnalyticsDashboardProps) {
  const { 
    dashboardAnalytics, 
    courseAnalytics,
    loading,
    error,
    fetchDashboardAnalytics,
    fetchRecentActivity,
    fetchFinancialAnalytics,
    clearError
  } = useAnalyticsStore()

  const [refreshing, setRefreshing] = useState(false)

  const loadAnalytics = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        fetchDashboardAnalytics(),
        fetchRecentActivity(),
        fetchFinancialAnalytics()
      ])
    } catch (err) {
      console.error('Failed to load analytics:', err)
    } finally {
      setRefreshing(false)
    }
  }, [fetchDashboardAnalytics, fetchRecentActivity, fetchFinancialAnalytics])

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
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-500 mb-4">Error loading analytics: {error}</p>
          <Button onClick={() => { clearError(); handleRefresh(); }} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const renderRecentActivity = () => {
    if (!dashboardAnalytics?.recentActivity || dashboardAnalytics.recentActivity.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardAnalytics.recentActivity.slice(0, 10).map((activity) => (
              <div key={`activity-${activity.id}`} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {activity.type === 'COURSE_CREATED' && <BookOpen className="h-4 w-4 text-blue-500" />}
                  {activity.type === 'STUDENT_ENROLLED' && <Users className="h-4 w-4 text-green-500" />}
                  {activity.type === 'COURSE_COMPLETED' && <GraduationCap className="h-4 w-4 text-purple-500" />}
                  {activity.type === 'COURSE_DROPPED' && <AlertCircle className="h-4 w-4 text-red-500" />}
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
        </CardContent>
      </Card>
    )
  }

  const renderBasicStats = () => {
    if (!dashboardAnalytics) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardAnalytics.totalCourses}</div>
            <p className="text-xs text-gray-500">Available courses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardAnalytics.totalStudents}</div>
            <p className="text-xs text-gray-500">Registered students</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Total Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardAnalytics.totalRegistrations}</div>
            <p className="text-xs text-gray-500">Course enrollments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Active Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardAnalytics.activeRegistrations}</div>
            <p className="text-xs text-gray-500">Currently enrolled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Completed Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardAnalytics.completedCourses}</div>
            <p className="text-xs text-gray-500">Successfully completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Pending Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardAnalytics.pendingRegistrations}</div>
            <p className="text-xs text-gray-500">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderCourseAnalytics = () => {
    if (!courseAnalytics || courseAnalytics.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Course Analytics</CardTitle>
            <CardDescription>Individual course performance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">No course analytics available</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Analytics</CardTitle>
          <CardDescription>Individual course performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courseAnalytics.map((course) => (
              <div key={`course-${course.courseId}`} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{course.courseName}</h3>
                  <span className="text-sm text-gray-500">ID: {course.courseId}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Enrolled:</span>
                    <div className="font-medium">{course.totalEnrolled}/{course.maxCapacity}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Completion Rate:</span>
                    <div className="font-medium">{course.completionRate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Average Grade:</span>
                    <div className="font-medium">{course.averageGrade || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Capacity:</span>
                    <div className="font-medium">{((course.totalEnrolled / course.maxCapacity) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MetricGrid analytics={dashboardAnalytics} userRole={userRole} />
          {renderBasicStats()}
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          {renderCourseAnalytics()}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {renderRecentActivity()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
