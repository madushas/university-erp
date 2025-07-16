'use client'

import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, ClipboardList, GraduationCap, TrendingUp, User } from 'lucide-react'

interface ChartContainerProps {
  children: React.ReactNode
  title: string
  description?: string
  badge?: string
  className?: string
}

function ChartContainer({ children, title, description, badge, className = "" }: Readonly<ChartContainerProps>) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {badge && (
            <Badge variant="outline">{badge}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

interface EnrollmentTrendChartProps {
  data: Array<{
    month: string
    enrollments: number
    revenue: number
  }>
}

export function EnrollmentTrendChart({ data }: Readonly<EnrollmentTrendChartProps>) {
  return (
    <ChartContainer 
      title="Enrollment Trends" 
      description="Monthly enrollment and revenue over time"
      badge="Last 12 months"
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip 
            formatter={(value, name) => [
              name === 'enrollments' ? value : `$${value}`,
              name === 'enrollments' ? 'Enrollments' : 'Revenue'
            ]}
          />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="enrollments"
            stackId="1"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

interface DepartmentPerformanceChartProps {
  data: Array<{
    department: string
    students: number
    courses: number
    avgGpa: number
    revenue: number
  }>
}

export function DepartmentPerformanceChart({ data }: Readonly<DepartmentPerformanceChartProps>) {
  return (
    <ChartContainer 
      title="Department Performance" 
      description="Student count and average GPA by department"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="department" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" domain={[0, 4]} />
          <Tooltip 
            formatter={(value, name) => {
              const getLabel = (name: string) => {
                if (name === 'students') return 'Students'
                if (name === 'courses') return 'Courses'
                return 'Avg GPA'
              }
              return [
                name === 'avgGpa' ? `${value} GPA` : value,
                getLabel(name as string)
              ]
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="students" fill="#3b82f6" />
          <Bar yAxisId="left" dataKey="courses" fill="#8b5cf6" />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgGpa"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

interface CourseDistributionChartProps {
  data: Array<{
    status: string
    count: number
    color: string
  }>
}

export function CourseDistributionChart({ data }: Readonly<CourseDistributionChartProps>) {
  return (
    <ChartContainer 
      title="Course Status Distribution" 
      description="Breakdown of courses by current status"
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${entry.status}-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, 'Courses']} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

interface GradeDistributionChartProps {
  data: Array<{
    grade: string
    count: number
    percentage: number
  }>
}

export function GradeDistributionChart({ data }: Readonly<GradeDistributionChartProps>) {

  return (
    <ChartContainer 
      title="Grade Distribution" 
      description="Student performance across all courses"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="grade" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [
              value,
              name === 'count' ? 'Students' : 'Percentage'
            ]}
          />
          <Legend />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

interface RevenueChartProps {
  data: Array<{
    month: string
    revenue: number
    target: number
    courses: number
  }>
}

export function RevenueChart({ data }: Readonly<RevenueChartProps>) {
  return (
    <ChartContainer 
      title="Revenue Analytics" 
      description="Monthly revenue vs targets"
      badge="USD"
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`$${value}`, 'Revenue']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981' }}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#ef4444' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

interface AttendanceChartProps {
  data: Array<{
    course: string
    averageAttendance: number
    studentsCount: number
  }>
}

export function AttendanceChart({ data }: Readonly<AttendanceChartProps>) {
  return (
    <ChartContainer 
      title="Course Attendance" 
      description="Average attendance percentage by course"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal" margin={{ top: 20, right: 30, left: 50, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="course" type="category" width={100} />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Attendance']}
          />
          <Bar dataKey="averageAttendance" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

interface StudentProgressChartProps {
  data: Array<{
    semester: string
    gpaAverage: number
    passRate: number
    enrollmentCount: number
  }>
}

export function StudentProgressChart({ data }: Readonly<StudentProgressChartProps>) {
  return (
    <ChartContainer 
      title="Student Academic Progress" 
      description="GPA trends and pass rates over time"
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semester" />
          <YAxis yAxisId="left" domain={[0, 4]} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
          <Tooltip 
            formatter={(value, name) => [
              name === 'gpaAverage' ? `${value} GPA` : `${value}%`,
              name === 'gpaAverage' ? 'Average GPA' : 'Pass Rate'
            ]}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="gpaAverage"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6' }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="passRate"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

// Quick Stats Component for dashboard overview
interface QuickStatsProps {
  stats: {
    totalStudents: number
    totalCourses: number
    totalRevenue: number
    averageGpa: number
    activeEnrollments: number
    completionRate: number
  }
}

export function QuickStats({ stats }: Readonly<QuickStatsProps>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average GPA</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageGpa.toFixed(2)}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeEnrollments}</p>
            </div>
            <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-indigo-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate.toFixed(1)}%</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
