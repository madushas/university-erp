'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { StudentDashboard } from './StudentDashboard';
import { InstructorDashboard } from './InstructorDashboard';
import { AdminDashboard } from './AdminDashboard';
import { UniversityDashboard } from './UniversityDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

interface RoleBasedDashboardProps {
  className?: string;
}

export function RoleBasedDashboard({ className = '' }: RoleBasedDashboardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Check if we should force an error for testing
  const forceError = typeof window !== 'undefined' && 
    (window.location.search.includes('forceError=true') || 
     localStorage.getItem('forceDashboardError') === 'true');

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`} data-testid="dashboard-loading">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground" data-testid="loading-message">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-muted-foreground">
                Please log in to access your dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get user role - the API returns a single role, not an array
  const userRole = user.role || 'STUDENT';
  
  // Use the user's role directly
  const primaryRole = userRole;

  // Render appropriate dashboard based on primary role
  const renderDashboard = () => {
    switch (primaryRole) {
      case 'ADMIN':
        return <AdminDashboard forceError={forceError} />;
      case 'INSTRUCTOR':
        return <InstructorDashboard forceError={forceError} />;
      case 'STUDENT':
        return <StudentDashboard forceError={forceError} />;
      default:
        // Fallback to generic dashboard
        return <UniversityDashboard forceError={forceError} />;
    }
  };

  // Handle unknown role
  if (!primaryRole || !['ADMIN', 'INSTRUCTOR', 'STUDENT'].includes(primaryRole)) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`} data-testid="unknown-role-container">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2" data-testid="unknown-role-title">Unknown Role</h3>
              <p className="text-muted-foreground mb-4" data-testid="unknown-role-message">
                Your account role is not recognized. Please contact support.
              </p>
              <p className="text-sm text-gray-500" data-testid="current-role-display">
                Current role: {primaryRole || 'UNKNOWN_ROLE'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      {renderDashboard()}
    </div>
  );
}