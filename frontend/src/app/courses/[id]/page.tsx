'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { CourseHeader } from '@/components/courses/course-header'
import { EnrollmentTable } from '@/components/courses/enrollment-table'
import { courseApi, registrationApi, adminApi } from '@/services/api-service'
import { Course, Registration } from '@/types'
import { useToast } from '@/components/ui/toast-provider'

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { success, error: showError } = useToast()
  const [course, setCourse] = useState<Course | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false)
  const [courseStatus, setCourseStatus] = useState('DRAFT')

  useEffect(() => {
    if (params.id) {
      fetchCourseDetails()
      if (session?.user?.role === 'ADMIN' || session?.user?.role === 'INSTRUCTOR') {
        fetchCourseRegistrations()
      }
    }
  }, [params.id, session])

  const fetchCourseDetails = async () => {
    try {
      setLoading(true)
      const courseData = await courseApi.getCourseById(Number(params.id))
      setCourse(courseData)
      setCourseStatus((courseData as any).status || 'DRAFT')
    } catch (error) {
      console.error('Failed to fetch course details:', error)
      showError('Error', 'Failed to load course details')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourseRegistrations = async () => {
    try {
      setEnrollmentsLoading(true)
      const registrationData = await registrationApi.getCourseRegistrations(Number(params.id))
      setRegistrations(registrationData)
    } catch (error) {
      console.error('Failed to fetch course registrations:', error)
      showError('Error', 'Failed to load course registrations')
    } finally {
      setEnrollmentsLoading(false)
    }
  }

  const handleEnrollCourse = async () => {
    if (!course) return
    
    try {
      await registrationApi.enrollInCourse(course.id)
      success('Success', 'Successfully enrolled in course')
      await fetchCourseDetails()
    } catch (error) {
      console.error('Failed to enroll in course:', error)
      showError('Error', 'Failed to enroll in course')
    }
  }

  const handleConfirmEnrollment = async (registrationId: number) => {
    try {
      await registrationApi.confirmEnrollment(registrationId)
      success('Success', 'Enrollment confirmed')
      await fetchCourseRegistrations()
    } catch (error) {
      console.error('Failed to confirm enrollment:', error)
      showError('Error', 'Failed to confirm enrollment')
    }
  }

  const handleRejectEnrollment = async (registrationId: number) => {
    try {
      await registrationApi.rejectEnrollment(registrationId)
      success('Success', 'Enrollment rejected')
      await fetchCourseRegistrations()
    } catch (error) {
      console.error('Failed to reject enrollment:', error)
      showError('Error', 'Failed to reject enrollment')
    }
  }

  const handleUpdateGrade = async (registrationId: number, grade: string) => {
    try {
      await registrationApi.updateRegistrationGrade(registrationId, grade)
      success('Success', 'Grade updated successfully')
      await fetchCourseRegistrations()
    } catch (error) {
      console.error('Failed to update grade:', error)
      showError('Error', 'Failed to update grade')
    }
  }

  const handleUnenrollStudent = async (registrationId: number) => {
    if (!confirm('Are you sure you want to unenroll this student?')) return
    
    try {
      await registrationApi.deleteRegistration(registrationId)
      success('Success', 'Student unenrolled successfully')
      await fetchCourseRegistrations()
      await fetchCourseDetails() // Refresh course details to update enrollment count
    } catch (error) {
      console.error('Failed to unenroll student:', error)
      showError('Error', 'Failed to unenroll student')
    }
  }

  const handleUpdateCourseStatus = async (status: string) => {
    if (!course) return
    
    try {
      await adminApi.updateCourseStatus(course.id, status)
      success('Success', 'Course status updated successfully')
      setCourseStatus(status)
      await fetchCourseDetails() // Refresh course details
    } catch (error) {
      console.error('Failed to update course status:', error)
      showError('Error', 'Failed to update course status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
        <button
          onClick={() => router.push('/courses')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Courses
        </button>
      </div>
    )
  }

  const canManageCourse = session?.user?.role === 'ADMIN' || session?.user?.role === 'INSTRUCTOR'
  const canEnroll = session?.user?.role === 'STUDENT'
  const isCourseFull = course.enrolledStudents >= course.maxStudents

  return (
    <div className="space-y-6">
      <CourseHeader
        course={course}
        courseStatus={courseStatus}
        onStatusChange={handleUpdateCourseStatus}
        canManageCourse={canManageCourse}
        canEnroll={canEnroll}
        isCourseFull={isCourseFull}
        onEnroll={handleEnrollCourse}
        onBack={() => router.push('/courses')}
      />

      {/* Enrolled Students (Admin/Instructor Only) */}
      {canManageCourse && (
        <EnrollmentTable
          registrations={registrations}
          loading={enrollmentsLoading}
          onConfirmEnrollment={handleConfirmEnrollment}
          onRejectEnrollment={handleRejectEnrollment}
          onUpdateGrade={handleUpdateGrade}
          onUnenrollStudent={handleUnenrollStudent}
        />
      )}
    </div>
  )
}
