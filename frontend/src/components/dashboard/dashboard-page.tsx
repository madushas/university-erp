'use client'

import React from 'react'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download, 
  RefreshCw,
  GraduationCap,
  Clock
} from 'lucide-react'

export function DashboardPage() {
  const { user } = useAuthStore()
  const userRole = user?.role || 'STUDENT'
  const [refreshing, setRefreshing] = React.useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleExport = () => {
    console.log('Exporting data...')
  }

  const QuickMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">1,250</p>
              <p className="text-xs text-green-600 mt-1">↗ 8.2% from last month</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
              <p className="text-xs text-green-600 mt-1">↗ 12% from last semester</p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$125,000</p>
              <p className="text-xs text-green-600 mt-1">↗ 15.2% from last quarter</p>
            </div>
            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average GPA</p>
              <p className="text-2xl font-bold text-gray-900">3.2</p>
              <p className="text-xs text-green-600 mt-1">↗ 2.1% improvement</p>
            </div>
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const RecentActivityCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <CardDescription>Latest system events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New Student Registration</p>
              <p className="text-sm text-gray-500">Sarah Johnson enrolled in Advanced Mathematics</p>
              <p className="text-xs text-gray-400 mt-1 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                2 hours ago
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-green-100">
              <BookOpen className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Course Updated</p>
              <p className="text-sm text-gray-500">Physics 101 schedule changed to 2:00 PM</p>
              <p className="text-xs text-gray-400 mt-1 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                4 hours ago
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Payment Received</p>
              <p className="text-sm text-gray-500">Tuition payment for Spring 2024</p>
              <p className="text-xs text-gray-400 mt-1 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                6 hours ago
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const DepartmentOverview = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Department Overview</CardTitle>
        <CardDescription>Performance by department</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { name: 'Computer Science', students: 320, courses: 12, gpa: 3.4 },
            { name: 'Mathematics', students: 280, courses: 10, gpa: 3.1 },
            { name: 'Physics', students: 200, courses: 8, gpa: 3.2 },
            { name: 'Chemistry', students: 150, courses: 6, gpa: 3.0 }
          ].map((dept) => (
            <div key={dept.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{dept.name}</p>
                <p className="text-sm text-gray-500">{dept.students} students • {dept.courses} courses</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Avg GPA: {dept.gpa}</p>
                <Badge variant="outline" className="text-xs">
                  Active
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const CourseStatus = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Course Status</CardTitle>
        <CardDescription>Current course distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <span className="text-sm font-medium">28 courses</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Draft</span>
            </div>
            <span className="text-sm font-medium">8 courses</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <span className="text-sm font-medium">12 courses</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Cancelled</span>
            </div>
            <span className="text-sm font-medium">3 courses</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderAdminDashboard = () => (
    <Tabs defaultValue="overview" className="space-y-6">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>
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
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <TabsContent value="overview" className="space-y-6">
        <QuickMetrics />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivityCard />
          <DepartmentOverview />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CourseStatus />
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enrollment Trends</CardTitle>
              <CardDescription>Monthly enrollment overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { month: 'January', enrollments: 120, revenue: '$24,000' },
                  { month: 'February', enrollments: 140, revenue: '$28,000' },
                  { month: 'March', enrollments: 110, revenue: '$22,000' },
                  { month: 'April', enrollments: 180, revenue: '$36,000' }
                ].map((item) => (
                  <div key={item.month} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.month}</span>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.enrollments} enrollments</p>
                      <p className="text-xs text-gray-500">{item.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="departments" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Computer Science', students: 320, courses: 12, gpa: 3.4, revenue: '$64,000' },
            { name: 'Mathematics', students: 280, courses: 10, gpa: 3.1, revenue: '$56,000' },
            { name: 'Physics', students: 200, courses: 8, gpa: 3.2, revenue: '$40,000' },
            { name: 'Chemistry', students: 150, courses: 6, gpa: 3.0, revenue: '$30,000' },
            { name: 'Biology', students: 180, courses: 7, gpa: 3.3, revenue: '$36,000' },
            { name: 'Engineering', students: 220, courses: 9, gpa: 3.5, revenue: '$44,000' }
          ].map((dept) => (
            <Card key={dept.name}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{dept.name}</CardTitle>
                <Badge variant="outline">Active</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Students</span>
                    <span className="text-sm font-medium">{dept.students}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Courses</span>
                    <span className="text-sm font-medium">{dept.courses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg GPA</span>
                    <span className="text-sm font-medium">{dept.gpa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revenue</span>
                    <span className="text-sm font-medium text-green-600">{dept.revenue}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="courses" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CourseStatus />
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Courses</CardTitle>
              <CardDescription>Highest enrollment courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { code: 'CS101', title: 'Intro to Computer Science', enrolled: 45, capacity: 50 },
                  { code: 'MATH201', title: 'Calculus II', enrolled: 38, capacity: 40 },
                  { code: 'PHYS101', title: 'General Physics', enrolled: 42, capacity: 45 },
                  { code: 'ENG101', title: 'English Composition', enrolled: 35, capacity: 40 }
                ].map((course) => (
                  <div key={course.code} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{course.code}</p>
                      <p className="text-sm text-gray-500">{course.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{course.enrolled}/{course.capacity}</p>
                      <p className="text-xs text-gray-500">
                        {Math.round((course.enrolled / course.capacity) * 100)}% full
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="students" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">1,250</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average GPA</p>
                  <p className="text-2xl font-bold text-gray-900">3.2</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Graduation Rate</p>
                  <p className="text-2xl font-bold text-gray-900">87%</p>
                </div>
                <GraduationCap className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                  <p className="text-2xl font-bold text-gray-900">92%</p>
                </div>
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )

  const renderStudentDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current GPA</p>
                <p className="text-2xl font-bold text-gray-900">3.45</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Credits Completed</p>
                <p className="text-2xl font-bold text-gray-900">84</p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">92%</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>Currently enrolled courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { code: 'CS101', title: 'Intro to Computer Science', instructor: 'Dr. Smith', grade: 'A-' },
                { code: 'MATH201', title: 'Calculus II', instructor: 'Prof. Johnson', grade: 'B+' },
                { code: 'PHYS101', title: 'General Physics', instructor: 'Dr. Wilson', grade: 'A' },
                { code: 'ENG101', title: 'English Composition', instructor: 'Prof. Davis', grade: 'B' }
              ].map((course) => (
                <div key={course.code} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{course.code}</p>
                    <p className="text-sm text-gray-500">{course.title}</p>
                    <p className="text-xs text-gray-400">{course.instructor}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{course.grade}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <RecentActivityCard />
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {userRole === 'ADMIN' ? 'Analytics Dashboard' : 
             userRole === 'STUDENT' ? 'My Dashboard' : 
             'Instructor Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            {userRole === 'ADMIN' ? 'Comprehensive system analytics and insights' :
             userRole === 'STUDENT' ? 'Your academic progress and course information' :
             'Course management and student analytics'}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {userRole === 'ADMIN' ? renderAdminDashboard() : renderStudentDashboard()}
    </div>
  )
}
