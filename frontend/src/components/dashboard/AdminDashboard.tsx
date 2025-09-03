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
  FileText,
  AlertCircle,
  BarChart3,
  Shield,
  Database,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminDashboardData {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalRegistrations: number;
  totalRevenue: number;
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: string;
    activeUsers: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'user' | 'course' | 'system';
    message: string;
    timestamp: string;
    severity: 'info' | 'warning' | 'error';
  }>;
  pendingApprovals: Array<{
    id: string;
    type: 'course' | 'user' | 'application';
    title: string;
    requestedBy: string;
    date: string;
  }>;
  systemAlerts: Array<{
    id: string;
    type: 'security' | 'performance' | 'maintenance';
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
  }>;
}

export function AdminDashboard({ forceError }: { forceError?: boolean }) {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      const mockData: AdminDashboardData = {
        totalUsers: 1247,
        totalStudents: 1050,
        totalInstructors: 85,
        totalCourses: 156,
        totalRegistrations: 3420,
        totalRevenue: 2450000,
        systemHealth: {
          status: 'healthy',
          uptime: '99.9%',
          activeUsers: 234
        },
        recentActivity: [
          {
            id: '1',
            type: 'user',
            message: 'New instructor account created: Dr. Smith',
            timestamp: '2024-01-15T10:30:00Z',
            severity: 'info'
          },
          {
            id: '2',
            type: 'course',
            message: 'Course CS401 capacity increased to 40',
            timestamp: '2024-01-15T09:15:00Z',
            severity: 'info'
          },
          {
            id: '3',
            type: 'system',
            message: 'Database backup completed successfully',
            timestamp: '2024-01-15T02:00:00Z',
            severity: 'info'
          }
        ],
        pendingApprovals: [
          {
            id: '1',
            type: 'course',
            title: 'New Course: Advanced Machine Learning',
            requestedBy: 'Dr. Johnson',
            date: '2024-01-14'
          },
          {
            id: '2',
            type: 'user',
            title: 'Instructor Role Request',
            requestedBy: 'John Doe',
            date: '2024-01-13'
          }
        ],
        systemAlerts: [
          {
            id: '1',
            type: 'maintenance',
            message: 'Scheduled maintenance window: Sunday 2AM-4AM',
            severity: 'medium',
            timestamp: '2024-01-15T08:00:00Z'
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

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

      {/* System Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              All system users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Active students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instructors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalInstructors}</div>
            <p className="text-xs text-muted-foreground">
              Faculty members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Available courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              Total enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(dashboardData?.totalRevenue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthStatusColor(dashboardData?.systemHealth.status || 'healthy')}`}>
                {dashboardData?.systemHealth.status?.toUpperCase()}
              </div>
              <p className="text-sm text-muted-foreground">System Status</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {dashboardData?.systemHealth.uptime}
              </div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {dashboardData?.systemHealth.activeUsers}
              </div>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
              onClick={() => router.push('/hr')}
            >
              <Shield className="mr-2 h-4 w-4" />
              HR Management
            </Button>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.pendingApprovals && dashboardData.pendingApprovals.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.pendingApprovals.map((approval) => (
                  <div key={approval.id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs">
                        {approval.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(approval.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-medium text-sm">{approval.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Requested by: {approval.requestedBy}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pending approvals</p>
            )}
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.systemAlerts && dashboardData.systemAlerts.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.systemAlerts.map((alert) => (
                  <div key={alert.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No system alerts</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Recent System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                      <span className="text-sm">{activity.message}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Required Banner */}
      {dashboardData?.pendingApprovals && dashboardData.pendingApprovals.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-900">
                  Action Required
                </h3>
                <p className="text-yellow-700">
                  You have {dashboardData.pendingApprovals.length} pending approval{dashboardData.pendingApprovals.length > 1 ? 's' : ''} that need your attention.
                </p>
              </div>
              <Button onClick={() => router.push('/admin/approvals')}>
                Review Approvals
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}