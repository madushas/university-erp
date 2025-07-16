'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useCourseStore } from '@/store/course-store'
import { useRegistrationStore } from '@/store/registration-store'
import { useToast } from '@/components/ui/toast-provider'
import { Course } from '@/types'
import ProtectedRoute from '@/components/protected-route'
import Navigation from '@/components/navigation'
import CourseForm from '@/components/forms/course-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  AcademicCapIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export default function CoursesPage() {
  const { user } = useAuthStore()
  const { success, error: showError } = useToast()
  const { 
    courses, 
    isLoading, 
    error, 
    fetchCourses, 
    deleteCourse, 
    clearError 
  } = useCourseStore()
  const { 
    enrollInCourse, 
    fetchMyRegistrations,
    isEnrolledInCourse,
    error: registrationError, 
    clearError: clearRegistrationError 
  } = useRegistrationStore()
  
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null)

  useEffect(() => {
    fetchCourses()
    // For students, also fetch their registrations to check enrollment status
    if (user?.role === 'STUDENT') {
      fetchMyRegistrations()
    }
  }, [fetchCourses, fetchMyRegistrations, user?.role])

  useEffect(() => {
    if (error) {
      console.error('Course error:', error)
    }
    if (registrationError) {
      console.error('Registration error:', registrationError)
    }
  }, [error, registrationError])

  const handleEnroll = async (courseId: number) => {
    try {
      setEnrollingCourseId(courseId)
      clearRegistrationError()
      
      await enrollInCourse(courseId)
      
      // Refresh courses to update enrollment counts
      await fetchCourses()
      
      // Refresh user's registrations to update enrollment status
      if (user?.role === 'STUDENT') {
        await fetchMyRegistrations()
      }
      
      success('Successfully enrolled in the course!')
      
    } catch (error) {
      console.error('Enrollment failed:', error)
      showError('Failed to enroll in course', 'Please try again or contact support')
    } finally {
      setEnrollingCourseId(null)
    }
  }

  const handleDelete = async (courseId: number) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(courseId)
        success('Course deleted successfully')
      } catch (error) {
        console.error('Delete failed:', error)
        showError('Failed to delete course', 'Please try again or contact support')
      }
    }
  }

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <ProtectedRoute>
      <Navigation>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
              <p className="mt-2 text-gray-600">
                {user?.role === 'ADMIN' ? 'Manage course offerings' : 'Browse and enroll in courses'}
              </p>
            </div>
            {user?.role === 'ADMIN' && (
              <Button onClick={() => setShowCreateForm(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            )}
          </div>

          {/* Error Messages */}
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

          {registrationError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{registrationError}</div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearRegistrationError}
                className="mt-2 text-red-700 hover:text-red-900"
              >
                Dismiss
              </Button>
            </div>
          )}

          {/* Create Form Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <CourseForm
                  onSuccess={() => {
                    setShowCreateForm(false)
                    fetchCourses()
                  }}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            </div>
          )}

          {/* Edit Form Modal */}
          {editingCourse && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <CourseForm
                  course={editingCourse}
                  onSuccess={() => {
                    setEditingCourse(null)
                    fetchCourses()
                  }}
                  onCancel={() => setEditingCourse(null)}
                />
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search courses by name, code, or instructor..."
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

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{course.code}</CardTitle>
                      <CardDescription className="font-medium text-gray-900">
                        {course.title}
                      </CardDescription>
                    </div>
                    <div className="text-sm text-gray-500">
                      {course.credits} credits
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {course.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span>Instructor: {course.instructor}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <AcademicCapIcon className="h-4 w-4 mr-2" />
                        <span>Capacity: {course.enrolledStudents || 0}/{course.maxStudents} students</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>
                          {course.schedule}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      {user?.role === 'STUDENT' && (
                        <>
                          {isEnrolledInCourse(course.id) ? (
                            <Button
                              size="sm"
                              className="flex-1"
                              variant="outline"
                              disabled
                            >
                              Already Enrolled
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleEnroll(course.id)}
                              disabled={enrollingCourseId === course.id}
                            >
                              {enrollingCourseId === course.id ? 'Enrolling...' : 'Enroll'}
                            </Button>
                          )}
                        </>
                      )}
                      
                      {user?.role === 'ADMIN' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setEditingCourse(course)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(course.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {!isLoading && filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {(() => {
                  if (searchQuery) {
                    return 'Try adjusting your search criteria.';
                  }
                  if (user?.role === 'ADMIN') {
                    return 'Get started by creating a new course.';
                  }
                  return 'No courses are currently available.';
                })()}
              </p>
              {user?.role === 'ADMIN' && !searchQuery && (
                <div className="mt-6">
                  <Button onClick={() => setShowCreateForm(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Course
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
