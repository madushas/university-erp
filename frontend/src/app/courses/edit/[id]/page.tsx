'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { courseApi } from '@/services/api-service'
import { Course } from '@/types'
import { useToast } from '@/components/ui/toast-provider'

export default function CourseEditPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { success, error: showError } = useToast()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    credits: 3,
    maxStudents: 30,
    instructor: '',
    schedule: '',
    department: '',
    semester: '',
    prerequisites: [] as string[],
    fee: 0,
    status: 'DRAFT' as const
  })

  useEffect(() => {
    // Role-based access control
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'INSTRUCTOR') {
      router.push('/courses')
      return
    }

    if (params.id) {
      fetchCourse()
    }
  }, [params.id, session, router])

  const fetchCourse = async () => {
    try {
      setLoading(true)
      const courseData = await courseApi.getCourseById(Number(params.id))
      setCourse(courseData)
      setFormData({
        code: courseData.code,
        title: courseData.title,
        description: courseData.description,
        credits: courseData.credits,
        maxStudents: courseData.maxStudents,
        instructor: courseData.instructor,
        schedule: courseData.schedule,
        department: courseData.department || '',
        semester: courseData.semester || '',
        prerequisites: courseData.prerequisites || [],
        fee: courseData.fee || 0,
        status: (courseData as any).status || 'DRAFT'
      })
    } catch (error) {
      console.error('Failed to fetch course:', error)
      showError('Error', 'Failed to load course details')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!course) return

    try {
      setSaving(true)
      await courseApi.updateCourse(course.id, formData)
      success('Success', 'Course updated successfully')
      router.push('/courses')
    } catch (error) {
      console.error('Failed to update course:', error)
      showError('Error', 'Failed to update course')
    } finally {
      setSaving(false)
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
        <Button onClick={() => router.push('/courses')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/courses')}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Courses</span>
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push('/courses')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Course</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Code
              </label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="e.g., CS101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credits
              </label>
              <Input
                type="number"
                value={formData.credits}
                onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
                placeholder="3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Introduction to Computer Science"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Course description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructor
              </label>
              <Input
                value={formData.instructor}
                onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                placeholder="Dr. Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Students
              </label>
              <Input
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schedule
            </label>
            <Input
              value={formData.schedule}
              onChange={(e) => setFormData({...formData, schedule: e.target.value})}
              placeholder="Mon/Wed/Fri 10:00-11:00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                placeholder="Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <Input
                value={formData.semester}
                onChange={(e) => setFormData({...formData, semester: e.target.value})}
                placeholder="Fall 2024"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Fee
            </label>
            <Input
              type="number"
              value={formData.fee}
              onChange={(e) => setFormData({...formData, fee: parseFloat(e.target.value)})}
              placeholder="1500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Course Status"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ACTIVE">Active</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
