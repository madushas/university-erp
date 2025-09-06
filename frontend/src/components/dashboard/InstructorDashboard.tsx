'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Users, 
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { CourseService } from '@/lib/api/courses';
import type { CourseDto } from '@/lib/types/course';
import { RegistrationService } from '@/lib/api/registrations';
import type { RegistrationDto } from '@/lib/types/registration';

interface InstructorDashboardData {
  assignedCourses: number;
  totalStudents: number;
  courseList: Array<{
    id: number;
    code: string;
    title: string;
    enrolledStudents: number;
    maxStudents: number;
    schedule: string;
    classroom?: string;
    daysOfWeek?: string | null;
    startTime?: unknown;
    endTime?: unknown;
  }>;
  gradingTasks: Array<{
    courseId: number;
    courseCode: string;
    courseTitle: string;
    pendingCount: number;
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
      const forceErrorActive = typeof window !== 'undefined' && 
        (window.location.search.includes('forceError=true') || 
         localStorage.getItem('forceDashboardError') === 'true');
      if (forceErrorActive || forceError) {
        throw new Error('Forced error for testing');
      }

      const courses: CourseDto[] = await CourseService.getMyCourses();
      const courseList = courses.map((c) => {
        const ci = c as unknown as {
          daysOfWeek?: string | null;
          startTime?: unknown;
          endTime?: unknown;
          classroom?: string;
        };
        return {
          id: c.id!,
          code: c.code || '',
          title: c.title || '',
          enrolledStudents: c.enrolledStudents || 0,
          maxStudents: c.maxStudents || 0,
          schedule: c.schedule || '',
          classroom: ci.classroom,
          daysOfWeek: ci.daysOfWeek ?? null,
          startTime: ci.startTime,
          endTime: ci.endTime,
        };
      });

      const totalStudents = courseList.reduce((sum, c) => sum + (c.enrolledStudents || 0), 0);

      // Fetch registrations for each course to compute grading tasks
      const regsByCourse: Array<{ course: typeof courseList[number]; regs: RegistrationDto[] }> = await Promise.all(
        courseList.map(async (c) => ({ course: c, regs: await RegistrationService.getCourseRegistrations(c.id) }))
      );
      const gradingTasks = regsByCourse.map(({ course, regs }) => {
        const pending = (regs || []).filter((r) => {
          const rr = r as unknown as { grade?: string; status?: string };
          const grade = rr.grade;
          const status = rr.status;
          return (!grade || grade.trim() === '') && (status === 'COMPLETED' || status === 'ENROLLED');
        }).length;
        return {
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          pendingCount: pending,
        };
      }).filter(t => t.pendingCount > 0)
        .sort((a,b) => b.pendingCount - a.pendingCount)
        .slice(0, 5);

      setDashboardData({
        assignedCourses: courseList.length,
        totalStudents,
        courseList,
        gradingTasks,
      });
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
          {[...Array(2)].map((_, i) => (
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
    if (!capacity || capacity <= 0) return { color: 'text-gray-600', status: 'N/A' };
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 100) return { color: 'text-red-600', status: 'Full' };
    if (percentage >= 75) return { color: 'text-yellow-600', status: 'High' };
    return { color: 'text-green-600', status: 'Available' };
  };

  // Helpers for today's classes
  const todayName = (() => {
    const d = new Date();
    const names = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
    return names[d.getDay()];
  })();

  const hasClassToday = (daysOfWeek?: string | null): boolean => {
    if (!daysOfWeek) return false;
    return daysOfWeek.split(',').map(s => s.trim().toUpperCase()).includes(todayName);
  };

  const formatTime = (time: unknown): string | null => {
    if (!time) return null;
    if (typeof time === 'string') return time.substring(0,5);
    const isTimeObj = (val: unknown): val is { hour?: number; minute?: number } => (
      typeof val === 'object' && val !== null && 'hour' in (val as Record<string, unknown>)
    );
    if (isTimeObj(time)) {
      const hh = String(time.hour ?? 0).padStart(2,'0');
      const mm = String(time.minute ?? 0).padStart(2,'0');
      return `${hh}:${mm}`;
    }
    return null;
  };

  const todaysClasses = (dashboardData?.courseList || [])
    .filter(c => hasClassToday(c.daysOfWeek))
    .slice(0, 5);

  const capacityAlerts = (dashboardData?.courseList || [])
    .filter(c => c.maxStudents > 0)
    .map(c => ({
      course: c,
      pct: c.enrolledStudents / c.maxStudents,
    }))
    .filter(x => x.pct >= 0.9 || x.pct <= 0.25)
    .sort((a,b) => b.pct - a.pct)
    .slice(0, 5);

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
            <div className="text-2xl font-bold">{dashboardData?.assignedCourses ?? 0}</div>
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
            <div className="text-2xl font-bold">{dashboardData?.totalStudents ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        {/* Grading Tasks */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Grading Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.gradingTasks && dashboardData.gradingTasks.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.gradingTasks.map((task, idx) => (
                  <div key={`${task.courseId}-${idx}`} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <p className="text-sm font-medium">{task.courseCode} — {task.courseTitle}</p>
                      <p className="text-xs text-muted-foreground">Pending: {task.pendingCount}</p>
                    </div>
                    <Badge variant="destructive">{task.pendingCount}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pending grading tasks</p>
            )}
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
              onClick={() => router.push('/courses/my')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              My Classes
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/attendance')}
            >
              <Users className="mr-2 h-4 w-4" />
              Attendance
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
                  const enrollmentStatus = getEnrollmentStatus(course.enrolledStudents, course.maxStudents);
                  return (
                    <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{course.code}</h4>
                          <p className="text-sm text-muted-foreground">{course.title}</p>
                        </div>
                        <Badge variant="outline">
                          {course.enrolledStudents}/{course.maxStudents}
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

        {/* Today's Classes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Today&apos;s Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {todaysClasses.length > 0 ? (
              <div className="space-y-3">
                {todaysClasses.map((c, idx) => {
                  const start = formatTime(c.startTime);
                  const end = formatTime(c.endTime);
                  return (
                    <div key={c.id ?? idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{c.code} — {c.title}</p>
                        <p className="text-xs text-muted-foreground">{start && end ? `${start} - ${end}` : c.schedule || 'Time N/A'} • {c.classroom || 'Room TBA'}</p>
                      </div>
                      <Badge variant="outline">{c.enrolledStudents}/{c.maxStudents}</Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No classes scheduled for today.</p>
            )}
          </CardContent>
        </Card>

        {/* My Teaching Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <GraduationCap className="mr-2 h-5 w-5" />
              Teaching Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-muted-foreground">My Courses</p>
                <p className="text-2xl font-bold">{dashboardData?.assignedCourses ?? 0}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{dashboardData?.totalStudents ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capacity Alerts */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Capacity Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {capacityAlerts.length > 0 ? (
              <div className="space-y-3">
                {capacityAlerts.map(({ course, pct }, idx) => (
                  <div key={course.id ?? idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{course.code} — {course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.enrolledStudents}/{course.maxStudents} ({Math.round(pct * 100)}%)</p>
                    </div>
                    <Badge variant={pct >= 0.9 ? 'destructive' : 'outline'}>
                      {pct >= 0.9 ? 'Near Full' : 'Low' }
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No capacity alerts.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}