'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  TrendingUp, 
  Clock,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface StudentDashboardData {
  currentRegistrations: number;
  completedCourses: number;
  totalCredits: number;
  currentGPA: number;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    date: string;
    type: 'assignment' | 'exam' | 'registration';
  }>;
  recentGrades: Array<{
    courseCode: string;
    courseName: string;
    grade: string;
    credits: number;
  }>;
  availableCourses: number;
  pendingApplications: number;
}

export function StudentDashboard({ forceError }: { forceError?: boolean }) {
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // For testing purposes, allow forcing an error
      if (forceError) {
        throw new Error('Forced error for testing');
      }
      
      // Mock data for now - replace with actual API call
      const mockData: StudentDashboardData = {
        currentRegistrations: 5,
        completedCourses: 12,
        totalCredits: 45,
        currentGPA: 3.7,
        upcomingDeadlines: [
          {
            id: '1',
            title: 'Course Registration Deadline',
            date: '2024-02-15',
            type: 'registration'
          },
          {
            id: '2',
            title: 'Final Exam - CS101',
            date: '2024-02-20',
            type: 'exam'
          }
        ],
        recentGrades: [
          {
            courseCode: 'CS101',
            courseName: 'Introduction to Computer Science',
            grade: 'A',
            credits: 3
          },
          {
            courseCode: 'MATH201',
            courseName: 'Calculus II',
            grade: 'B+',
            credits: 4
          }
        ],
        availableCourses: 25,
        pendingApplications: 1
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
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
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

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-green-600';
    if (gpa >= 3.0) return 'text-blue-600';
    if (gpa >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s your academic progress and upcoming activities.
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          Student
        </Badge>
      </div>

      {/* Academic Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.currentRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              This semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalCredits}</div>
            <p className="text-xs text-muted-foreground">
              Completed credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getGPAColor(dashboardData?.currentGPA || 0)}`}>
              {dashboardData?.currentGPA?.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Cumulative GPA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.availableCourses}</div>
            <p className="text-xs text-muted-foreground">
              For registration
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
              Browse Courses
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/students/records')}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Transcript
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/students/audit')}
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              Degree Audit
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/students/applications')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Applications
              {dashboardData?.pendingApplications && dashboardData.pendingApplications > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {dashboardData.pendingApplications}
                </Badge>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.upcomingDeadlines && dashboardData.upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(deadline.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={deadline.type === 'exam' ? 'destructive' : 'default'}>
                      {deadline.type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CheckCircle className="mr-2 h-5 w-5" />
              Recent Grades
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentGrades && dashboardData.recentGrades.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentGrades.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{grade.courseCode}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {grade.courseName}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {grade.credits} cr
                      </span>
                      <Badge className={getGradeColor(grade.grade)}>
                        {grade.grade}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent grades</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course Registration Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                Course Registration Open
              </h3>
              <p className="text-blue-700">
                Register for next semester&apos;s courses. Don&apos;t miss the deadline!
              </p>
            </div>
            <Button onClick={() => router.push('/courses')}>
              Register Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}