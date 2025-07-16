'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useCourseStore } from '@/store/course-store'
import { useRegistrationStore } from '@/store/registration-store'
import { useAnalyticsStore } from '@/store/analytics-store'
import ProtectedRoute from '@/components/protected-route'
import Navigation from '@/components/navigation'
import { ApiErrorHandler, LoadingSpinner } from '@/components/error-boundary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { 
  BookOpenIcon, 
  ClipboardDocumentListIcon,
  AcademicCapIcon 
} from '@heroicons/react/24/outline'
import { RegistrationStatus } from '@/types'

export default function DashboardPage() {
  const { user, initialize } = useAuthStore()
  const { courses, fetchCourses, isLoading: coursesLoading, error: coursesError } = useCourseStore()
  const { registrations, fetchMyRegistrations, isLoading: registrationsLoading, error: registrationsError } = useRegistrationStore()
  const { dashboardAnalytics, fetchDashboardAnalytics, isLoading: analyticsLoading, error: analyticsError } = useAnalyticsStore()
  
  const [stats, setStats] = useState({
    totalCourses: 0,
    myRegistrations: 0,
    completedCourses: 0,
    totalRegistrations: 0,
    activeRegistrations: 0,
  })

  const [refreshKey, setRefreshKey] = useState(0)

  const loadData = useCallback(async () => {
    try {
      // Fetch courses data
      await fetchCourses(0, 100)
      
      // Fetch user-specific data
      if (user?.role === 'STUDENT') {
        await fetchMyRegistrations(0, 100)
      }
      
      // Fetch analytics data (for admin users)
      if (user?.role === 'ADMIN') {
        await fetchDashboardAnalytics()
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }, [fetchCourses, fetchMyRegistrations, fetchDashboardAnalytics, user])

  useEffect(() => {
    // Initialize auth state from localStorage
    initialize()
  }, [initialize])

  useEffect(() => {
    loadData()
  }, [loadData, user, refreshKey])

  useEffect(() => {
    // Update stats based on analytics data or local data
    if (user?.role === 'ADMIN' && dashboardAnalytics) {
      setStats({
        totalCourses: dashboardAnalytics.totalCourses,
        myRegistrations: dashboardAnalytics.totalRegistrations,
        completedCourses: dashboardAnalytics.completedCourses,
        totalRegistrations: dashboardAnalytics.totalRegistrations,
        activeRegistrations: dashboardAnalytics.activeRegistrations,
      })
    } else {
      // For students, use local data
      const completedCount = registrations.filter(reg => reg.status === 'COMPLETED').length
      const activeCount = registrations.filter(reg => reg.status === 'ENROLLED').length
      
      setStats({
        totalCourses: courses.length,
        myRegistrations: registrations.length,
        completedCourses: completedCount,
        totalRegistrations: registrations.length,
        activeRegistrations: activeCount,
      })
    }
  }, [courses, registrations, dashboardAnalytics, user])

  const recentRegistrations = registrations.slice(0, 5)
  const recentCourses = courses.slice(0, 5)

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const isLoading = coursesLoading || registrationsLoading || analyticsLoading
  const hasError = coursesError || registrationsError || analyticsError

  return (
    <ProtectedRoute>
      <Navigation>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {user?.firstName}! Here&apos;s what&apos;s happening with your courses.
            </p>
          </div>

          {/* Error Handling */}
          {hasError && (
            <ApiErrorHandler 
              error={coursesError || registrationsError || analyticsError}
              onRetry={handleRefresh}
              onClear={() => {
                // Clear errors (you might want to add clearError methods to stores)
              }}
            />
          )}

          {/* Loading State */}
          {isLoading && <LoadingSpinner message="Loading dashboard data..." />}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookOpenIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClipboardDocumentListIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      {user?.role === 'ADMIN' ? 'Total Registrations' : 'My Registrations'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{stats.myRegistrations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AcademicCapIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completed Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClipboardDocumentListIcon className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Enrollments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeRegistrations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Courses */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Courses</CardTitle>
                <CardDescription>
                  Latest courses added to the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCourses.map((course) => (
                    <div key={course.id} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {course.code} - {course.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Instructor: {course.instructor}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {course.credits} credits
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No courses available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Registrations */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {user?.role === 'ADMIN' ? 'Recent Registrations' : 'My Recent Activity'}
                </CardTitle>
                <CardDescription>
                  Latest enrollment activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRegistrations.map((registration) => {
                    const statusColorMap: Record<RegistrationStatus, string> = {
                      ENROLLED: 'bg-green-600',
                      COMPLETED: 'bg-blue-600',
                      DROPPED: 'bg-red-600',
                    };
                    const statusBadgeColorMap: Record<RegistrationStatus, string> = {
                      ENROLLED: 'bg-green-100 text-green-800',
                      COMPLETED: 'bg-blue-100 text-blue-800',
                      DROPPED: 'bg-red-100 text-red-800',
                    };

                    const statusColor = statusColorMap[registration.status] || 'bg-gray-400';
                    const statusBadgeColor = statusBadgeColorMap[registration.status] || 'bg-gray-100 text-gray-800';

                    return (
                      <div key={registration.id} className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {registration.course.code} - {registration.course.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {user?.role === 'ADMIN' ? `Student: ${registration.user.firstName} ${registration.user.lastName}` : 
                             `Registered: ${formatDate(registration.registrationDate)}`}
                          </p>
                        </div>
                        <div className="text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeColor}`}>
                            {registration.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {registrations.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No registrations yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Navigation>
    </ProtectedRoute>
  )
}
