import React from 'react'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { 
  BookOpenIcon, 
  ArrowLeftIcon,
  PencilIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { Course } from '@/types'

interface CourseHeaderProps {
  course: Course
  courseStatus: string
  onStatusChange: (status: string) => void
  canManageCourse: boolean
  canEnroll: boolean
  isCourseFull: boolean
  onEnroll: () => void
  onBack: () => void
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
  course,
  courseStatus,
  onStatusChange,
  canManageCourse,
  canEnroll,
  isCourseFull,
  onEnroll,
  onBack
}) => {
  const getCourseStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'PUBLISHED':
        return 'bg-blue-100 text-blue-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800'
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Courses</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          {canManageCourse && (
            <Link href={`/courses/edit/${course.id}`}>
              <Button variant="outline">
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Course
              </Button>
            </Link>
          )}
          {canEnroll && (
            <Button
              onClick={onEnroll}
              disabled={isCourseFull}
            >
              {isCourseFull ? 'Course Full' : 'Enroll Now'}
            </Button>
          )}
        </div>
      </div>

      {/* Course Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <BookOpenIcon className="h-6 w-6 text-blue-600" />
                <Badge variant="secondary" className="text-sm">
                  {course.code}
                </Badge>
                <Badge className={getCourseStatusColor(courseStatus)}>
                  {courseStatus}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {course.title}
              </CardTitle>
              <p className="text-gray-600 mt-2">{course.description}</p>
            </div>
            
            {/* Course Status Management */}
            {canManageCourse && (
              <div className="flex flex-col space-y-2">
                <label htmlFor="courseStatus" className="text-sm font-medium text-gray-700">
                  Course Status
                </label>
                <select
                  id="courseStatus"
                  value={courseStatus}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <AcademicCapIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Credits</p>
                  <p className="font-semibold">{course.credits}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <UserGroupIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Instructor</p>
                  <Link href={`/instructors/${course.instructor}`} className="font-semibold text-blue-600 hover:text-blue-800">
                    {course.instructor}
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Schedule</p>
                  <p className="font-semibold">{course.schedule}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Semester</p>
                  <p className="font-semibold">{course.semester}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <UserGroupIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Enrollment</p>
                  <p className="font-semibold">
                    {course.enrolledStudents}/{course.maxStudents}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Fee</p>
                  <p className="font-semibold">${course.fee}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
