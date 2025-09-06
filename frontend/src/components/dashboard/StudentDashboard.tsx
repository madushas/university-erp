'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/generated';
import { RegistrationService } from '@/lib/api/registrations';
import type { RegistrationDto } from '@/lib/types/registration';

type StudentAnalytics = {
  totalRegistrations?: number;
  currentGPA?: number;
  activeRegistrations?: number;
  completedRegistrations?: number;
  droppedRegistrations?: number;
  totalCredits?: number;
  totalFeePaid?: number; // BigDecimal serialized
  outstandingPayments?: number;
  averageAttendance?: number;
};

export function StudentDashboard({ forceError }: { forceError?: boolean }) {
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const toNumber = (v: unknown): number => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const n = Number(v);
      return isNaN(n) ? 0 : n;
    }
    return 0;
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      if (!user?.id) throw new Error('User not found');

      if (forceError) {
        throw new Error('Forced error for testing');
      }

      // Fetch analytics and my registrations in parallel
      const [res, regs] = await Promise.all([
        api.analytics.getStudent(user.id as number),
        RegistrationService.getMyRegistrations(),
      ]);
      const anyRes = res as unknown as { data?: unknown; error?: unknown };
      if (anyRes.error) throw new Error(String(anyRes.error));
      const data = (anyRes.data || {}) as Record<string, unknown>;
      setAnalytics({
        totalRegistrations: toNumber(data.totalRegistrations),
        currentGPA: toNumber(data.currentGPA),
        activeRegistrations: toNumber(data.activeRegistrations),
        completedRegistrations: toNumber(data.completedRegistrations),
        droppedRegistrations: toNumber(data.droppedRegistrations),
        totalCredits: toNumber(data.totalCredits),
        totalFeePaid: toNumber(data.totalFeePaid),
        outstandingPayments: toNumber(data.outstandingPayments),
        averageAttendance: toNumber(data.averageAttendance),
      });
      setRegistrations(regs || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [forceError, user?.id]);

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

  // Helpers to derive dashboard lists from real registration data
  const todayName = (() => {
    const d = new Date();
    // Map JS getDay() 0-6 to string names matching backend
    const names = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
    return names[d.getDay()];
  })();

  const hasClassToday = (daysOfWeek?: string | null): boolean => {
    if (!daysOfWeek) return false;
    return daysOfWeek.split(',').map(s => s.trim().toUpperCase()).includes(todayName);
  };

  const formatTime = (time: unknown): string | null => {
    if (!time) return null;
    if (typeof time === 'string') return time.substring(0,5); // HH:mm:ss -> HH:mm
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

  type CourseLike = {
    code?: string;
    title?: string;
    credits?: number;
    classroom?: string;
    startTime?: unknown;
    endTime?: unknown;
    schedule?: string;
    daysOfWeek?: string | null;
  };

  type RegistrationLike = RegistrationDto & {
    course?: CourseLike;
    paymentStatus?: string;
    grade?: string;
    status?: string;
  };

  const todaysClasses = registrations
    .filter((r) => {
      const reg = r as unknown as RegistrationLike;
      return !!reg.course && hasClassToday(reg.course.daysOfWeek);
    })
    .slice(0, 5);

  const unpaidRegistrations = registrations
    .filter((r) => {
      const reg = r as unknown as RegistrationLike;
      const ps = reg.paymentStatus;
      return !!ps && (ps === 'PENDING' || ps === 'OVERDUE' || ps === 'PARTIAL');
    })
    .slice(0, 5);

  const recentGrades = registrations
    .filter((r) => {
      const reg = r as unknown as RegistrationLike;
      return !!reg.grade;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s your academic progress and financial summary.
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
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.activeRegistrations ?? 0}</div>
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
            <div className="text-2xl font-bold">{analytics?.totalCredits ?? 0}</div>
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
            <div className={`text-2xl font-bold ${getGPAColor(analytics?.currentGPA || 0)}`}>
              {(analytics?.currentGPA ?? 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Cumulative GPA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.completedRegistrations ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              All time
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
              View Transcript
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/students/audit')}
            >
              Degree Audit
            </Button>
          </CardContent>
        </Card>

        {/* Today's Classes (real data) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Today&apos;s Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {todaysClasses.length > 0 ? (
              <div className="space-y-3">
                {todaysClasses.map((reg, idx) => {
                  const rr = reg as unknown as RegistrationLike;
                  const c = rr.course as CourseLike | undefined;
                  const start = formatTime(c?.startTime);
                  const end = formatTime(c?.endTime);
                  return (
                    <div key={(rr as { id?: number }).id ?? idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{c?.code} — {c?.title}</p>
                        <p className="text-xs text-muted-foreground">{start && end ? `${start} - ${end}` : c?.schedule || 'Time N/A'} • {c?.classroom || 'Room TBA'}</p>
                      </div>
                      <Badge variant="outline">{(rr.status) || 'ENROLLED'}</Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No classes scheduled for today.</p>
            )}
          </CardContent>
        </Card>

        {/* Progress & Financial Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Progress & Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Dropped Courses</p>
                <p className="text-2xl font-bold">{analytics?.droppedRegistrations ?? 0}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Outstanding Payments</p>
                <p className="text-2xl font-bold">{analytics?.outstandingPayments ?? 0}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Fees Paid</p>
                <p className="text-2xl font-bold">${(analytics?.totalFeePaid ?? 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Average Attendance: <span className="font-medium">{(analytics?.averageAttendance ?? 0).toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Unpaid Courses (details from registrations) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Unpaid Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {unpaidRegistrations.length > 0 ? (
              <div className="space-y-3">
                {unpaidRegistrations.map((reg, idx) => {
                  const rr = reg as unknown as RegistrationLike;
                  const c = rr.course as CourseLike | undefined;
                  return (
                    <div key={(rr as { id?: number }).id ?? idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                      <div>
                        <p className="text-sm font-medium">{c?.code} — {c?.title}</p>
                        <p className="text-xs text-red-700">Status: {rr.paymentStatus}</p>
                      </div>
                      <Badge variant="destructive">Attention</Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No unpaid registrations 🎉</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Grades (from registrations) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Recent Grades</CardTitle>
          </CardHeader>
          <CardContent>
            {recentGrades.length > 0 ? (
              <div className="space-y-3">
                {recentGrades.map((reg, idx) => {
                  const rr = reg as unknown as RegistrationLike;
                  const c = rr.course as CourseLike | undefined;
                  return (
                    <div key={(rr as { id?: number }).id ?? idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{c?.code} — {c?.title}</p>
                        <p className="text-xs text-muted-foreground">Credits: {c?.credits ?? 'N/A'}</p>
                      </div>
                      <Badge>{rr.grade}</Badge>
                    </div>
                  );
                })}
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