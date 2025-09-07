'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  Settings,
  BarChart3,
  Shield,
  Database,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/generated';

type AdminAnalytics = {
  totalStudents?: number;
  totalFaculty?: number; // instructors/faculty
  totalCourses?: number;
  totalRegistrations?: number;
  totalDepartments?: number;
  activeRegistrations?: number;
  completedRegistrations?: number;
  droppedRegistrations?: number;
  totalRevenue?: number;
  unpaidRegistrations?: number;
  registrationsWithGrades?: number;
  registrationsWithoutGrades?: number;
  transcriptsNotReleased?: number;
  certificatesNotIssued?: number;
  availableCourses?: number;
};

type RecentActivityAnalytics = {
  recentRegistrations?: number;
  monthlyRegistrations?: number;
  totalGradedRegistrations?: number;
  lowAttendanceAlerts?: number;
};

type FinancialAnalytics = {
  totalRevenue?: number;
  unpaidRegistrations?: number;
  unpaidAmount?: number; // BigDecimal in backend, number in JSON
  revenueByDepartment?: Record<string, number>;
};

export function AdminDashboard({ forceError }: { forceError?: boolean }) {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [recent, setRecent] = useState<RecentActivityAnalytics | null>(null);
  const [financial, setFinancial] = useState<FinancialAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

      const forceErrorActive = typeof window !== 'undefined' &&
        (window.location.search.includes('forceError=true') ||
         localStorage.getItem('forceDashboardError') === 'true');

      if (forceErrorActive || forceError) {
        throw new Error('Forced error for testing');
      }

      const [dashRes, recentRes, finRes] = await Promise.all([
        api.analytics.getDashboard(),
        api.analytics.getRecentActivity(),
        api.analytics.getFinancial(),
      ]);

      // Cast to a minimal shape to safely access possible error/data
      const dashAny = dashRes as unknown as { data?: unknown; error?: unknown };
      const recentAny = recentRes as unknown as { data?: unknown; error?: unknown };
      const finAny = finRes as unknown as { data?: unknown; error?: unknown };

      if (dashAny.error) throw new Error(String(dashAny.error));
      if (recentAny.error) throw new Error(String(recentAny.error));
      if (finAny.error) throw new Error(String(finAny.error));

      const dashData = (dashAny.data || {}) as Record<string, unknown>;
      const recentData = (recentAny.data || {}) as Record<string, unknown>;
      const finData = (finAny.data || {}) as Record<string, unknown>;

      setAnalytics({
        totalStudents: toNumber(dashData.totalStudents),
        totalFaculty: toNumber(dashData.totalFaculty),
        totalCourses: toNumber(dashData.totalCourses),
        totalRegistrations: toNumber(dashData.totalRegistrations),
        totalDepartments: toNumber(dashData.totalDepartments),
        activeRegistrations: toNumber(dashData.activeRegistrations),
        completedRegistrations: toNumber(dashData.completedRegistrations),
        droppedRegistrations: toNumber(dashData.droppedRegistrations),
        totalRevenue: toNumber(dashData.totalRevenue),
        unpaidRegistrations: toNumber(dashData.unpaidRegistrations),
        registrationsWithGrades: toNumber(dashData.registrationsWithGrades),
        registrationsWithoutGrades: toNumber(dashData.registrationsWithoutGrades),
        transcriptsNotReleased: toNumber(dashData.transcriptsNotReleased),
        certificatesNotIssued: toNumber(dashData.certificatesNotIssued),
        availableCourses: toNumber(dashData.availableCourses),
      });

      setRecent({
        recentRegistrations: toNumber(recentData.recentRegistrations),
        monthlyRegistrations: toNumber(recentData.monthlyRegistrations),
        totalGradedRegistrations: toNumber(recentData.totalGradedRegistrations),
        lowAttendanceAlerts: toNumber(recentData.lowAttendanceAlerts),
      });

      const revenueByDepartment = (finData.revenueByDepartment || {}) as Record<string, number>;
      setFinancial({
        totalRevenue: toNumber(finData.totalRevenue),
        unpaidRegistrations: toNumber(finData.unpaidRegistrations),
        unpaidAmount: toNumber(finData.unpaidAmount),
        revenueByDepartment,
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
  }, [loadDashboardData, forceError]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(6)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            System Administration
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage the university management system.
          </p>
        </div>
        <Badge variant="destructive" className="px-3 py-1">
          Administrator
        </Badge>
      </div>

      {/* System Statistics (from analytics) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalStudents ?? 0}</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faculty</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalFaculty ?? 0}</div>
            <p className="text-xs text-muted-foreground">Instructors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalCourses ?? 0}</div>
            <p className="text-xs text-muted-foreground">Total courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalRegistrations ?? 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(analytics?.totalRevenue ?? 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalDepartments ?? 0}</div>
            <p className="text-xs text-muted-foreground">Total departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Registration Status Breakdown */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.activeRegistrations ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Completed Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.completedRegistrations ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Dropped Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.droppedRegistrations ?? 0}</div>
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
              onClick={() => router.push('/admin/users')}
            >
              <Users className="mr-2 h-4 w-4" />
              User Management
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push('/admin/courses')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Course Management
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push('/admin/analytics')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics & Reports
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push('/admin/system')}
            >
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push('/admin/registrations')}
            >
              <Database className="mr-2 h-4 w-4" />
              Registration Management
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push('/hr')}
            >
              <Shield className="mr-2 h-4 w-4" />
              HR Management
            </Button>
          </CardContent>
        </Card>

        {/* Academic Records & Compliance */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Academic Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">With Grades</p>
                <p className="text-xl font-semibold">{analytics?.registrationsWithGrades ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Without Grades</p>
                <p className="text-xl font-semibold">{analytics?.registrationsWithoutGrades ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Transcripts Pending</p>
                <p className="text-xl font-semibold">{analytics?.transcriptsNotReleased ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Certificates Pending</p>
                <p className="text-xl font-semibold">{analytics?.certificatesNotIssued ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Availability & Unpaid */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Course & Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Available Courses</p>
                <p className="text-xl font-semibold">{analytics?.availableCourses ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Unpaid Registrations</p>
                <p className="text-xl font-semibold">{analytics?.unpaidRegistrations ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity (counts) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Recent Activity (Last periods)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-muted-foreground text-sm">Last Week Registrations</p>
                <p className="text-2xl font-bold">{recent?.recentRegistrations ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Last Month Registrations</p>
                <p className="text-2xl font-bold">{recent?.monthlyRegistrations ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Graded Registrations</p>
                <p className="text-2xl font-bold">{recent?.totalGradedRegistrations ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Low Attendance Alerts</p>
                <p className="text-2xl font-bold">{recent?.lowAttendanceAlerts ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-semibold">${(financial?.totalRevenue ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unpaid Registrations</span>
                <span className="font-semibold">{financial?.unpaidRegistrations ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unpaid Amount</span>
                <span className="font-semibold">${(financial?.unpaidAmount ?? 0).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Department */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Revenue by Department</CardTitle>
          </CardHeader>
          <CardContent>
            {financial?.revenueByDepartment && Object.keys(financial.revenueByDepartment).length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(financial.revenueByDepartment).map(([dept, amount]) => (
                  <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-muted-foreground">{dept}</span>
                    <span className="text-sm font-medium">${(amount ?? 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No department revenue data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}