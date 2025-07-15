'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useCourseStore } from '@/store/course-store'
import { useRegistrationStore } from '@/store/registration-store'
import ProtectedRoute from '@/components/protected-route'
import Navigation from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { 
  BookOpenIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  AcademicCapIcon 
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { courses, fetchCourses } = useCourseStore()
  const { registrations, fetchMyRegistrations, fetchRegistrations } = useRegistrationStore()
  const [stats, setStats] = useState({
    totalCourses: 0,
    myRegistrations: 0,
    completedCourses: 0,
    totalRegistrations: 0,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchCourses(0, 100) // Fetch all courses for stats
        
        if (user?.role === 'STUDENT') {
          await fetchMyRegistrations(0, 100)
        } else if (user?.role === 'ADMIN') {
          await fetchRegistrations(0, 100)
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      }
    }
    
    loadData()
  }, [user, fetchCourses, fetchMyRegistrations, fetchRegistrations])

  useEffect(() => {
    // Calculate stats based on loaded data
    const completedCount = registrations.filter(reg => reg.status === 'COMPLETED').length
    
    setStats({
      totalCourses: courses.length,
      myRegistrations: registrations.length,
      completedCourses: completedCount,
      totalRegistrations: user?.role === 'ADMIN' ? registrations.length : registrations.length,
    })
  }, [courses, registrations, user])

  const recentRegistrations = registrations.slice(0, 5)

  return (
    <ProtectedRoute>
      <Navigation>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {user?.firstName}! Here's what's happening with your courses.
            </p>
          </div>

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

            {user?.role === 'ADMIN' && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserGroupIcon className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Active Students</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Set(registrations.map(reg => reg.student.id)).size}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
                  {courses.slice(0, 5).map((course) => (
                    <div key={course.id} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {course.code} - {course.name}
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
                  {recentRegistrations.map((registration) => (
                    <div key={registration.id} className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        registration.status === 'ENROLLED' ? 'bg-green-600' :
                        registration.status === 'COMPLETED' ? 'bg-blue-600' :
                        'bg-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {registration.course.code} - {registration.course.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {user?.role === 'ADMIN' ? `Student: ${registration.student.firstName} ${registration.student.lastName}` : 
                           `Registered: ${formatDate(registration.registrationDate)}`}
                        </p>
                      </div>
                      <div className="text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          registration.status === 'ENROLLED' ? 'bg-green-100 text-green-800' :
                          registration.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {registration.status}
                        </span>
                      </div>
                    </div>
                  ))}
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
