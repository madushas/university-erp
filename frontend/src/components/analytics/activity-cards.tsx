'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  User, 
  BookOpen, 
  Calendar,
  ArrowRight,
  GraduationCap,
  CreditCard,
  TrendingUp,
  ClipboardList
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Course, CourseStatus } from '@/types'

interface RecentActivity {
  id: string
  type: 'registration' | 'course' | 'payment' | 'grade'
  title: string
  description: string
  timestamp: string
  status?: string
  user?: {
    name: string
    avatar?: string
  }
  metadata?: Record<string, unknown>
}

interface ActivityFeedProps {
  activities: RecentActivity[]
  title?: string
  showViewAll?: boolean
  onViewAll?: () => void
}

const getActivityIcon = (type: RecentActivity['type']) => {
  switch (type) {
    case 'registration':
      return ClipboardList
    case 'course':
      return BookOpen
    case 'payment':
      return CreditCard
    case 'grade':
      return TrendingUp
    default:
      return Clock
  }
}

const getActivityColor = (type: RecentActivity['type']) => {
  switch (type) {
    case 'registration':
      return 'bg-blue-100 text-blue-600'
    case 'course':
      return 'bg-green-100 text-green-600'
    case 'payment':
      return 'bg-yellow-100 text-yellow-600'
    case 'grade':
      return 'bg-purple-100 text-purple-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'enrolled':
    case 'active':
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'pending':
    case 'draft':
      return 'bg-yellow-100 text-yellow-800'
    case 'cancelled':
    case 'dropped':
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function ActivityFeed({ 
  activities, 
  title = "Recent Activity", 
  showViewAll = true,
  onViewAll 
}: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>Latest system activity</CardDescription>
        </div>
        {showViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      {activity.status && (
                        <Badge className={`ml-2 ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      {activity.user && (
                        <div className="flex items-center mr-4">
                          <User className="h-3 w-3 mr-1" />
                          {activity.user.name}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface CourseCardProps {
  course: {
    id: number
    code: string
    title: string
    instructor: string
    schedule: string
    credits: number
    enrolledStudents?: number
    maxStudents: number
    status: string
    department?: string
  }
  onEnroll?: (courseId: number) => void
  onEdit?: (course: Course) => void
  isAdmin?: boolean
}

export function EnhancedCourseCard({ 
  course, 
  onEnroll, 
  onEdit, 
  isAdmin = false 
}: CourseCardProps) {
  const enrollmentPercentage = course.enrolledStudents 
    ? (course.enrolledStudents / course.maxStudents) * 100 
    : 0

  const getEnrollmentColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {course.code}
              </Badge>
              <Badge className={getStatusColor(course.status)}>
                {course.status}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight">
              {course.title}
            </CardTitle>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-600">
              {course.credits} Credits
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <GraduationCap className="h-4 w-4 mr-2" />
            {course.instructor}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {course.schedule}
          </div>

          {course.department && (
            <div className="flex items-center text-sm text-gray-600">
              <BookOpen className="h-4 w-4 mr-2" />
              {course.department}
            </div>
          )}

          {course.enrolledStudents !== undefined && (              <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Enrollment</span>
                <span className={`font-medium ${getEnrollmentColor(enrollmentPercentage)}`}>
                  {course.enrolledStudents}/{course.maxStudents}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    enrollmentPercentage >= 90 ? 'bg-red-500' :
                    enrollmentPercentage >= 70 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  data-width={Math.min(enrollmentPercentage, 100)}
                />
              </div>
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            {!isAdmin && onEnroll && (
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => onEnroll(course.id)}
                disabled={enrollmentPercentage >= 100}
              >
                {enrollmentPercentage >= 100 ? 'Full' : 'Enroll'}
              </Button>
            )}
            {isAdmin && onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onEdit({
                  ...course,
                  enrolledStudents: course.enrolledStudents ?? 0, // Ensure enrolledStudents is a number
                  description: '',
                  status: course.status as CourseStatus,
                  createdAt: '', // Add a default or dynamic value
                  updatedAt: new Date().toISOString() // Add a default or dynamic value
                })}
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface RegistrationCardProps {
  registration: {
    id: number
    course: {
      code: string
      title: string
      instructor: string
      credits: number
    }
    user?: {
      firstName: string
      lastName: string
      studentId: string
    }
    status: string
    grade?: string
    registrationDate: string
    attendancePercentage?: number
    paymentStatus?: string
  }
  isAdmin?: boolean
  onUpdateGrade?: (id: number, grade: string) => void
  onDropCourse?: (id: number) => void
}

export function EnhancedRegistrationCard({ 
  registration, 
  isAdmin = false,
  onUpdateGrade,
  onDropCourse 
}: RegistrationCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {registration.course.code}
                </Badge>
                <Badge className={getStatusColor(registration.status)}>
                  {registration.status}
                </Badge>
              </div>
              <h4 className="font-medium text-gray-900 leading-tight">
                {registration.course.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {registration.course.instructor}
              </p>
            </div>
            <div className="text-right text-xs text-gray-500">
              {registration.course.credits} credits
            </div>
          </div>

          {isAdmin && registration.user && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              {registration.user.firstName} {registration.user.lastName}
              <Badge variant="outline" className="ml-2 text-xs">
                {registration.user.studentId}
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            {registration.grade && (
              <div>
                <span className="text-gray-600">Grade:</span>
                <span className="ml-2 font-medium">{registration.grade}</span>
              </div>
            )}
            {registration.attendancePercentage && (
              <div>
                <span className="text-gray-600">Attendance:</span>
                <span className="ml-2 font-medium">
                  {registration.attendancePercentage.toFixed(1)}%
                </span>
              </div>
            )}
            {registration.paymentStatus && (
              <div>
                <span className="text-gray-600">Payment:</span>
                <Badge className={`ml-2 ${getStatusColor(registration.paymentStatus)}`}>
                  {registration.paymentStatus}
                </Badge>
              </div>
            )}
            <div>
              <span className="text-gray-600">Enrolled:</span>
              <span className="ml-2 text-xs">
                {formatDate(registration.registrationDate)}
              </span>
            </div>
          </div>

          {(onUpdateGrade || onDropCourse) && (
            <div className="flex space-x-2 pt-2 border-t">
              {onUpdateGrade && (
                <Button variant="outline" size="sm" className="flex-1">
                  Update Grade
                </Button>
              )}
              {onDropCourse && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onDropCourse(registration.id)}
                >
                  Drop
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
