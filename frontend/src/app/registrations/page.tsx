'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useRegistrationStore } from '@/store/registration-store'
import ProtectedRoute from '@/components/protected-route'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { 
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  UserIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'

import { useToast } from '@/components/ui/toast-provider'

export default function RegistrationsPage() {
  const { user } = useAuthStore()
  const { success, error: showError } = useToast()
  const { 
    registrations, 
    isLoading, 
    error, 
    fetchRegistrations,
    fetchMyRegistrations,
    dropCourse,
    deleteRegistration,
    updateGrade,
    clearError 
  } = useRegistrationStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [editingGrade, setEditingGrade] = useState<{ id: number; grade: string } | null>(null)

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchRegistrations()
    } else {
      fetchMyRegistrations()
    }
  }, [user, fetchRegistrations, fetchMyRegistrations])

  const handleDropCourse = async (courseId: number) => {
    if (window.confirm('Are you sure you want to drop this course?')) {
      try {
        await dropCourse(courseId)
        success('Course dropped successfully')
      } catch (error) {
        console.error('Drop course failed:', error)
        showError('Failed to drop course', 'Please try again or contact support')
      }
    }
  }

  const handleDeleteRegistration = async (registrationId: number) => {
    if (window.confirm('Are you sure you want to remove this student from the course?')) {
      try {
        await deleteRegistration(registrationId)
        success('Student removed from course successfully')
      } catch (error) {
        console.error('Delete registration failed:', error)
        showError('Failed to remove student', 'Please try again or contact support')
      }
    }
  }

  const handleUpdateGrade = async (registrationId: number, grade: string) => {
    try {
      await updateGrade(registrationId, { grade })
      setEditingGrade(null)
      success('Grade updated successfully')
    } catch (error) {
      console.error('Update grade failed:', error)
      showError('Failed to update grade', 'Please try again or contact support')
    }
  }

  const startEditGrade = (registrationId: number, currentGrade: string) => {
    setEditingGrade({ id: registrationId, grade: currentGrade || '' })
  }

  const cancelEditGrade = () => {
    setEditingGrade(null)
  }

  const filteredRegistrations = registrations.filter(registration =>
    registration.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    registration.course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user?.role === 'ADMIN' && 
     `${registration.user.firstName} ${registration.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENROLLED':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'DROPPED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <ProtectedRoute>
      <Navigation>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'ADMIN' ? 'All Registrations' : 'My Registrations'}
            </h1>
            <p className="mt-2 text-gray-600">
              {user?.role === 'ADMIN' 
                ? 'Manage student enrollments and grades' 
                : 'View your course enrollments and grades'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearError}
                className="mt-2 text-red-700 hover:text-red-900"
              >
                Dismiss
              </Button>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder={user?.role === 'ADMIN' 
                ? "Search by course name, code, or student name..." 
                : "Search your courses..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}

          {/* Registrations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRegistrations.map((registration) => (
              <Card key={registration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {registration.course.code} - {registration.course.title}
                      </CardTitle>
                      <CardDescription>
                        {user?.role === 'ADMIN' && (
                          <span className="font-medium">
                            Student: {registration.user.firstName} {registration.user.lastName}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
                      {registration.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <AcademicCapIcon className="h-4 w-4 mr-2" />
                        <span>{registration.course.credits} credits</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span>{registration.course.instructor}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>Enrolled: {formatDate(registration.registrationDate)}</span>
                      </div>
                    </div>

                    {/* Grade Section */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Grade:</span>
                        <div className="flex items-center gap-2">
                          {editingGrade?.id === registration.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={editingGrade.grade}
                                onChange={(e) => setEditingGrade({
                                  ...editingGrade,
                                  grade: e.target.value
                                })}
                                className="w-20 h-8 text-sm"
                                placeholder="A-F"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleUpdateGrade(registration.id, editingGrade.grade)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditGrade}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">
                                {registration.grade || 'Not assigned'}
                              </span>
                              {user?.role === 'ADMIN' && registration.status === 'ENROLLED' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditGrade(registration.id, registration.grade || '')}
                                >
                                  Edit
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {user?.role === 'STUDENT' && registration.status === 'ENROLLED' && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDropCourse(registration.course.id)}
                          className="flex-1"
                        >
                          Drop Course
                        </Button>
                      </div>
                    )}

                    {user?.role === 'ADMIN' && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteRegistration(registration.id)}
                        >
                          Remove Student
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {!isLoading && filteredRegistrations.length === 0 && (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No registrations found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery 
                  ? 'Try adjusting your search criteria.'
                  : user?.role === 'ADMIN'
                    ? 'No students have enrolled in courses yet.'
                    : 'You haven\'t enrolled in any courses yet.'}
              </p>
              {user?.role === 'STUDENT' && !searchQuery && (
                <div className="mt-6">
                  <Button onClick={() => window.location.href = '/courses'}>
                    Browse Courses
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Navigation>
    </ProtectedRoute>
  )
}
