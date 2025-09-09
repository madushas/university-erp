'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api/generated';
import { normalizeRole } from '@/lib/utils/constants';

// Based on the actual backend AnalyticsService implementation
interface DashboardData {
  // Student Statistics
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  totalRegistrations: number;
  totalDepartments: number;
  
  // Registration Statistics
  activeRegistrations: number;
  completedRegistrations: number;
  droppedRegistrations: number;
  
  // Financial Statistics
  totalRevenue: number;
  unpaidRegistrations: number;
  
  // Academic Performance
  registrationsWithGrades: number;
  registrationsWithoutGrades: number;
  transcriptsNotReleased: number;
  certificatesNotIssued: number;
  
  // Course Availability
  availableCourses: number;
}

export function UniversityDashboard({ forceError }: { forceError?: boolean }) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const userRole = normalizeRole(user?.role) || 'STUDENT';
  const isAdmin = userRole === 'ADMIN';

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Only admins should call admin-only analytics endpoints
      if (!isAdmin) {
        setDashboardData(null);
        setError(null);
        return;
      }

      // For testing purposes, allow forcing an error
      const shouldForceError = forceError === true || 
        (typeof window !== 'undefined' && 
         (window.location.search.includes('forceError=true') || 
          localStorage.getItem('forceDashboardError') === 'true'));
      
      if (shouldForceError) {
        throw new Error('Forced error for testing');
      }
      
      // Use the typed OpenAPI client (auth handled by interceptor)
      const res = await api.analytics.getDashboard();
      if (!res.data) {
        throw new Error('Failed to load dashboard data');
      }
      setDashboardData(res.data as unknown as DashboardData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [forceError, isAdmin]);

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
        <p className="text-red-600" data-testid="error-message">{error}</p>
        <button 
          onClick={loadDashboardData}
          className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          data-testid="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening at the university today.
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {user?.role}
        </Badge>
      </div>

      {/* Statistics Cards (admin-only) */}
      {isAdmin && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalStudents || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active enrollments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.availableCourses || 0}</div>
              <p className="text-xs text-muted-foreground">
                This semester
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalRegistrations || 0}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalDepartments || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active departments
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {user?.role === 'STUDENT' && (
          <>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Course Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse and register for available courses this semester.
                </p>
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  View Courses
                </button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">My Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  View your current course registrations and grades.
                </p>
                <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                  View Registrations
                </button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Academic Records</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Access your transcripts and academic progress.
                </p>
                <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
                  View Records
                </button>
              </CardContent>
            </Card>
          </>
        )}

        {user?.role === 'INSTRUCTOR' && (
          <>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">My Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your assigned courses and student enrollments.
                </p>
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  View Courses
                </button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Grade Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Update student grades and academic performance.
                </p>
                <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                  Manage Grades
                </button>
              </CardContent>
            </Card>
          </>
        )}

        {user?.role === 'ADMIN' && (
          <>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage student and instructor accounts.
                </p>
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Manage Users
                </button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Course Administration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Create and manage course offerings.
                </p>
                <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                  Manage Courses
                </button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">System Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate reports and analytics.
                </p>
                <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
                  View Reports
                </button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
