'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { 
  BookOpenIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  UserGroupIcon,
  CalendarIcon,
  AcademicCapIcon,
  Squares2X2Icon,
  TableCellsIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { courseApi, registrationApi } from '@/services/api-service'
import { Course } from '@/types'
import { useToast } from '@/components/ui/toast-provider'

const ProgressBar = ({ current, max }: { current: number; max: number }) => {
  const percentage = Math.min(Math.round((current / max) * 100), 100)
  
  let widthClass = 'w-1/12'
  if (percentage === 100) {
    widthClass = 'w-full'
  } else if (percentage >= 75) {
    widthClass = 'w-3/4'
  } else if (percentage >= 50) {
    widthClass = 'w-1/2'
  } else if (percentage >= 25) {
    widthClass = 'w-1/4'
  }
  
  return (
    <div className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${widthClass}`} />
  )
}

export default function CoursesPage() {
  const { data: session } = useSession()
  const { success: showSuccess, error: showError } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [totalCourses, setTotalCourses] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const itemsPerPage = 12
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
    fetchCourses()
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const sortString = `${sortBy},${sortOrder}`
      const response = await courseApi.getCourses(currentPage - 1, itemsPerPage, sortString)
      
      // Filter courses based on search term and status
      let filteredCourses = response.content || []
      
      if (searchTerm) {
        filteredCourses = filteredCourses.filter(course =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      if (statusFilter) {
        filteredCourses = filteredCourses.filter(course => 
          (course.status || 'DRAFT') === statusFilter
        )
      }
      
      setCourses(filteredCourses)
      setTotalCourses(response.totalElements || filteredCourses.length)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      showError('Error', 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollCourse = async (courseId: number) => {
    try {
      await registrationApi.enrollInCourse(courseId)
      showSuccess('Success', 'Successfully enrolled in course')
      await fetchCourses() // Refresh courses
    } catch (error) {
      console.error('Failed to enroll in course:', error)
      showError('Error', 'Failed to enroll in course')
    }
  }

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return
    
    try {
      const response = await courseApi.deleteCourse(courseId) as unknown as Response
      if (response.status === 204) {
        showSuccess('Success', 'Course deleted successfully')
        await fetchCourses()
      }
      throw new Error('Failed to delete course')
    } catch (error) {
      console.error('Failed to delete course:', error)
      showError('Error', 'Failed to delete course')
    }
  }

  const handleCreateCourse = async () => {
    try {
      await courseApi.createCourse(formData)
      showSuccess('Success', 'Course created successfully')
      setShowCreateModal(false)
      resetForm()
      await fetchCourses()
    } catch (error) {
      console.error('Failed to create course:', error)
      showError('Error', 'Failed to create course')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      title: '',
      description: '',
      credits: 3,
      maxStudents: 30,
      instructor: '',
      schedule: '',
      department: '',
      semester: '',
      prerequisites: [],
      fee: 0,
      status: 'DRAFT'
    })
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setSortBy('title')
    setSortOrder('asc')
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const canCreateCourse = session?.user?.role === 'ADMIN' || session?.user?.role === 'INSTRUCTOR'
  const totalPages = Math.ceil(totalCourses / itemsPerPage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="mt-2 text-gray-600">Browse and manage course offerings</p>
        </div>
        {canCreateCourse && (
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border rounded-lg shadow-sm">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search courses by title, code, or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filter by status"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ACTIVE">Active</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Sort by"
              >
                <option value="title">Title</option>
                <option value="code">Code</option>
                <option value="instructor">Instructor</option>
                <option value="credits">Credits</option>
                <option value="enrolledStudents">Enrollment</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
              
              {(searchTerm || statusFilter || sortBy !== 'title') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {courses.length} {courses.length === 1 ? 'course' : 'courses'} found
            </span>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Squares2X2Icon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <TableCellsIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <LoadingSpinner />
          <p className="mt-2 text-gray-600">Loading courses...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && courses.length === 0 && (
        <div className="text-center py-8">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No courses found</p>
        </div>
      )}

      {/* Grid View */}
      {!loading && courses.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: Course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpenIcon className="h-5 w-5 text-blue-600" />
                    <Badge variant="secondary">
                      {course.code}
                    </Badge>
                  </div>
                  {canCreateCourse && (
                    <div className="flex space-x-1">
                      <Link href={`/courses/edit/${course.id}`}>
                        <Button variant="ghost" size="sm">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <Link href={`/courses/${course.id}`} className="block">
                  <CardTitle className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {course.description}
                  </CardDescription>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <AcademicCapIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {course.credits} credits
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Instructor: {course.instructor}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {course.schedule}
                    </span>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Enrollment</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {course.enrolledStudents}/{course.maxStudents}
                      </span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <ProgressBar current={course.enrolledStudents} max={course.maxStudents} />
                    </div>
                    
                    {/* Enrollment Button for Students */}
                    {session?.user?.role === 'STUDENT' && (
                      <div className="mt-3">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEnrollCourse(course.id)
                          }}
                          disabled={course.enrolledStudents >= course.maxStudents}
                          size="sm"
                          className="w-full"
                        >
                          {course.enrolledStudents >= course.maxStudents ? 'Course Full' : 'Enroll Now'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {!loading && courses.length > 0 && viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course: Course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BookOpenIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <Link href={`/courses/${course.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                          {course.title}
                        </Link>
                        <div className="text-sm text-gray-500">
                          {course.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.instructor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.schedule}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.credits}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">
                        {course.enrolledStudents}/{course.maxStudents}
                      </div>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <ProgressBar current={course.enrolledStudents} max={course.maxStudents} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex justify-end space-x-2">
                      {/* Student Enrollment */}
                      {session?.user?.role === 'STUDENT' && (
                        <Button
                          onClick={() => handleEnrollCourse(course.id)}
                          disabled={course.enrolledStudents >= course.maxStudents}
                          size="sm"
                          className="whitespace-nowrap"
                        >
                          {course.enrolledStudents >= course.maxStudents ? 'Full' : 'Enroll'}
                        </Button>
                      )}
                      
                      {/* Admin Actions */}
                      {canCreateCourse && (
                        <>
                          <Link href={`/courses/edit/${course.id}`}>
                            <Button size="sm" variant="outline">
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Course</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Course Code
                  </label>
                  <Input
                    id="courseCode"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="e.g., CS101"
                  />
                </div>
                <div>
                  <label htmlFor="courseCredits" className="block text-sm font-medium text-gray-700 mb-1">
                    Credits
                  </label>
                  <Input
                    id="courseCredits"
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
                    placeholder="3"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="courseTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Course Title
                </label>
                <Input
                  id="courseTitle"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Introduction to Computer Science"
                />
              </div>

              <div>
                <label htmlFor="courseDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="courseDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Course description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="courseInstructor" className="block text-sm font-medium text-gray-700 mb-1">
                    Instructor
                  </label>
                  <Input
                    id="courseInstructor"
                    value={formData.instructor}
                    onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                    placeholder="Dr. Smith"
                  />
                </div>
                <div>
                  <label htmlFor="courseMaxStudents" className="block text-sm font-medium text-gray-700 mb-1">
                    Max Students
                  </label>
                  <Input
                    id="courseMaxStudents"
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="courseSchedule" className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule
                </label>
                <Input
                  id="courseSchedule"
                  value={formData.schedule}
                  onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                  placeholder="Mon/Wed/Fri 10:00-11:00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="courseDepartment" className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <Input
                    id="courseDepartment"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <label htmlFor="courseSemester" className="block text-sm font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <Input
                    id="courseSemester"
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    placeholder="Fall 2024"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="courseFee" className="block text-sm font-medium text-gray-700 mb-1">
                  Course Fee
                </label>
                <Input
                  id="courseFee"
                  type="number"
                  value={formData.fee}
                  onChange={(e) => setFormData({...formData, fee: parseFloat(e.target.value)})}
                  placeholder="1500"
                />
              </div>

              <div>
                <label htmlFor="courseStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="courseStatus"
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
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateCourse}>
                Create Course
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && courses.length > 0 && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalCourses}
          />
        </div>
      )}
    </div>
  )
}
