'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  TrendingUp, 
  Calendar,
  FileText,
  AlertCircle,
  Clock,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface InstructorDashboardData {
  assignedCourses: number;
  totalStudents: number;
  pendingGrades: number;
  upcomingClasses: number;
  courseList: Array<{
    id: string;
    code: string;
    name: string;
    enrolledStudents: number;
    capacity: number;
    schedule: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'enrollment' | 'grade' | 'assignment';
    message: string;
    timestamp: string;
  }>;
  gradingTasks: Array<{
    courseCode: string;
    courseName: string;
    pendingCount: number;
    dueDate: string;
  }>;
}

export function InstructorDashboard({ forceError }: { forceError?: boolean }) {
  const [dashboardData, setDashboardData] = useState<InstructorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // For testing purposes, allow forcing an error
      const forceErrorActive = typeof window !== 'undefined' && 
        (window.location.search.includes('forceError=true') || 
         localStorage.getItem('forceDashboardError') === 'true');
      
      if (forceErrorActive || forceError) {
        throw new Error('Forced error for testing');
      }
      
      // Mock data for now - replace with actual API call
      const mockData: InstructorDashboardData = {
        assignedCourses: 3,
        totalStudents: 85,
        pendingGrades: 12,
        upcomingClasses: 5,
        courseList: [
          {
            id: '1',
            code: 'CS101',
            name: 'Introduction to Computer Science',
            enrolledStudents: 28,
            capacity: 30,
            schedule: 'MWF 10:00-11:00'
          },
          {
            id: '2',
            code: 'CS201',
            name: 'Data Structures',
            enrolledStudents: 25,
            capacity: 25,
            schedule: 'TTh 14:00-15:30'
          },
          {
            id: '3',
            code: 'CS301',
            name: 'Algorithms',
            enrolledStudents: 32,
            capacity: 35,
            schedule: 'MWF 13:00-14:00'
          }
        ],
        recentActivity: [
          {
            id: '1',
            type: 'enrollment',
            message: 'New student enrolled in CS101',
            timestamp: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            type: 'grade',
            message: 'Assignment grades submitted for CS201',
            timestamp: '2024-01-14T16:45:00Z'
          }
        ],
        gradingTasks: [
          {
            courseCode: 'CS101',
            courseName: 'Introduction to Computer Science',
            pendingCount: 5,
            dueDate: '2024-02-20'
          },
          {
            courseCode: 'CS301',
            courseName: 'Algorithms',
            pendingCount: 7,
            dueDate: '2024-02-22'
          }
        ]
      };

      setDashboardData(mockData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [forceError]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4" data-testid="dashboard-error">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-600" data-testid="error-message">{error}</p>
        </div>
        <Button 
          onClick={loadDashboardData}
          variant="outline"
          size="sm"
          className="mt-2"
          data-testid="retry-button"
        >
          Retry
        </Button>
      </div>
    );
  }

  const getEnrollmentStatus = (enrolled: number, capacity: number) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 90) return { color: 'text-red-600', status: 'Full' };
    if (percentage >= 75) return { color: 'text-yellow-600', status: 'High' };
    return { color: 'text-green-600', status: 'Available' };
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, Professor {user?.lastName}!
          </h1>
          <p className="text-muted-foreground">
            Manage your courses and track student progress.
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          Instructor
        </Badge>
      </div>

      {/* Teaching Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.assignedCourses}</div>
            <p className="text-xs text-muted-foreground">
              This semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{dashboardData?.pendingGrades}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.upcomingClasses}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/courses')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Manage Courses
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/grades')}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Grade Management
              {dashboardData?.pendingGrades && dashboardData.pendingGrades > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {dashboardData.pendingGrades}
                </Badge>
              )}
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/attendance')}
            >
              <Users className="mr-2 h-4 w-4" />
              Attendance
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/hr/leave')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Leave Requests
            </Button>
          </CardContent>
        </Card>

        {/* My Courses */}
        <Card className="lg:col-span-2" data-testid="instructor-my-courses-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center" data-testid="instructor-my-courses-title">
              <GraduationCap className="mr-2 h-5 w-5" />
              My Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.courseList && dashboardData.courseList.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.courseList.map((course) => {
                  const enrollmentStatus = getEnrollmentStatus(course.enrolledStudents, course.capacity);
                  return (
                    <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{course.code}</h4>
                          <p className="text-sm text-muted-foreground">{course.name}</p>
                        </div>
                        <Badge variant="outline">
                          {course.enrolledStudents}/{course.capacity}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{course.schedule}</span>
                        <span className={enrollmentStatus.color}>
                          {enrollmentStatus.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No courses assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Grading Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Grading Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.gradingTasks && dashboardData.gradingTasks.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.gradingTasks.map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <p className="font-medium text-sm">{task.courseCode}</p>
                      <p className="text-xs text-muted-foreground">{task.courseName}</p>
                      <p className="text-xs text-orange-600">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">
                        {task.pendingCount} pending
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pending grading tasks</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grade Submission Reminder */}
      {dashboardData?.pendingGrades && dashboardData.pendingGrades > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-orange-900">
                  Grade Submission Reminder
                </h3>
                <p className="text-orange-700">
                  You have {dashboardData.pendingGrades} pending grades that need to be submitted.
                </p>
              </div>
              <Button onClick={() => router.push('/grades')}>
                Submit Grades
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}