'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  Building2
} from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo'
}

const colorClasses = {
  blue: 'text-blue-600 bg-blue-100',
  green: 'text-green-600 bg-green-100',
  yellow: 'text-yellow-600 bg-yellow-100',
  red: 'text-red-600 bg-red-100',
  purple: 'text-purple-600 bg-purple-100',
  indigo: 'text-indigo-600 bg-indigo-100'
}

const getChangeTypeClass = (changeType?: 'positive' | 'negative' | 'neutral') => {
  switch (changeType) {
    case 'positive':
      return 'bg-green-100 text-green-600'
    case 'negative':
      return 'bg-red-100 text-red-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  color = 'blue' 
}: Readonly<StatCardProps>) {
  const iconColorClass = colorClasses[color]

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {trend && (
                <span className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${iconColorClass}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface AnalyticsData {
  totalStudents?: number
  totalFaculty?: number
  totalCourses?: number
  activeRegistrations?: number
  totalRevenue?: number
  unpaidRegistrations?: number
  completedRegistrations?: number
  totalDepartments?: number
  totalRegistrations?: number
  currentGPA?: number
  totalCredits?: number
}

interface MetricGridProps {
  analytics: AnalyticsData | null
  userRole?: string
}

export function MetricGrid({ analytics, userRole }: Readonly<MetricGridProps>) {
  if (!analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }, (_, i) => (
          <Card key={`loading-card-${i}`} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const adminMetrics = [
    {
      title: 'Total Students',
      value: analytics.totalStudents || 0,
      icon: Users,
      color: 'blue' as const,
      description: 'Active students enrolled'
    },
    {
      title: 'Total Faculty',
      value: analytics.totalFaculty || 0,
      icon: GraduationCap,
      color: 'purple' as const,
      description: 'Active faculty members'
    },
    {
      title: 'Total Courses',
      value: analytics.totalCourses || 0,
      icon: BookOpen,
      color: 'green' as const,
      description: 'Available courses'
    },
    {
      title: 'Active Registrations',
      value: analytics.activeRegistrations || 0,
      icon: ClipboardList,
      color: 'yellow' as const,
      description: 'Currently enrolled students'
    },
    {
      title: 'Total Revenue',
      value: `$${(analytics.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'green' as const,
      description: 'Total fees collected'
    },
    {
      title: 'Unpaid Registrations',
      value: analytics.unpaidRegistrations || 0,
      icon: AlertCircle,
      color: 'red' as const,
      description: 'Pending payments'
    },
    {
      title: 'Completed Courses',
      value: analytics.completedRegistrations || 0,
      icon: CheckCircle,
      color: 'indigo' as const,
      description: 'Successfully completed'
    },
    {
      title: 'Departments',
      value: analytics.totalDepartments || 0,
      icon: Building2,
      color: 'purple' as const,
      description: 'Academic departments'
    }
  ]

  const studentMetrics = [
    {
      title: 'My Courses',
      value: analytics.totalRegistrations || 0,
      icon: BookOpen,
      color: 'blue' as const,
      description: 'Total enrolled courses'
    },
    {
      title: 'Current GPA',
      value: analytics.currentGPA ? analytics.currentGPA.toFixed(2) : 'N/A',
      icon: TrendingUp,
      color: 'green' as const,
      description: 'Grade point average'
    },
    {
      title: 'Completed',
      value: analytics.completedRegistrations || 0,
      icon: CheckCircle,
      color: 'indigo' as const,
      description: 'Courses completed'
    },
    {
      title: 'Total Credits',
      value: analytics.totalCredits || 0,
      icon: Calendar,
      color: 'purple' as const,
      description: 'Credit hours earned'
    }
  ]

  const metrics = userRole === 'ADMIN' ? adminMetrics : studentMetrics

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <StatCard key={`${metric.title}-${index}`} {...metric} />
      ))}
    </div>
  )
}

interface QuickStatsProps {
  title: string
  stats: Array<{
    label: string
    value: string | number
    change?: number
    changeType?: 'positive' | 'negative' | 'neutral'
  }>
}

export function QuickStats({ title, stats }: Readonly<QuickStatsProps>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div key={`${stat.label}-${index}`} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{stat.label}</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </span>
                {stat.change !== undefined && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    getChangeTypeClass(stat.changeType)
                  }`}>
                    {stat.changeType === 'positive' ? '+' : ''}
                    {stat.change}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
