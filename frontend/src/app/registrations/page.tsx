'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, UserMinus } from 'lucide-react';
import { registrationApi } from '@/services/api-service';
import { Registration } from '@/types';

export default function RegistrationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      router.push('/login');
      return;
    }
    fetchRegistrations();
  }, [session, status, router, currentPage, pageSize]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const data = session?.user?.role === 'ADMIN' 
        ? await registrationApi.getAllRegistrations()
        : await registrationApi.getMyRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      showError('Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleDropCourse = async (courseId: number) => {
    try {
      setActionLoading(courseId);
      await registrationApi.dropCourse(courseId);
      await fetchRegistrations();
      success('Course dropped successfully');
    } catch (error) {
      console.error('Error dropping course:', error);
      showError('Failed to drop course');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteRegistration = async (registrationId: number) => {
    try {
      setActionLoading(registrationId);
      await registrationApi.deleteRegistration(registrationId);
      await fetchRegistrations();
      success('Registration deleted successfully');
    } catch (error) {
      console.error('Error deleting registration:', error);
      showError('Failed to delete registration');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENROLLED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DROPPED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return <div>Access denied</div>;
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {session?.user?.role === 'ADMIN' ? 'All Registrations' : 'My Registrations'}
          </h1>
          <Button onClick={fetchRegistrations} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {loading ? (
          <div className="text-center">Loading registrations...</div>
        ) : (
          <div className="grid gap-4">
            {registrations.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-gray-500">No registrations found</p>
                </CardContent>
              </Card>
            ) : (
              registrations.map((registration) => (
                <Card key={registration.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {registration.course.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {registration.course.code} - {registration.course.instructor}
                        </p>
                        {session?.user?.role === 'ADMIN' && (
                          <p className="text-sm text-gray-500">
                            Student: {registration.user.firstName} {registration.user.lastName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(registration.status)}>
                          {registration.status}
                        </Badge>
                        {registration.grade && (
                          <Badge variant="outline">
                            Grade: {registration.grade}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        <p>Registered: {new Date(registration.registrationDate).toLocaleDateString()}</p>
                        <p>Credits: {registration.course.credits}</p>
                        {registration.attendancePercentage && (
                          <p>Attendance: {registration.attendancePercentage}%</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {session?.user?.role === 'ADMIN' ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRegistration(registration.id)}
                            disabled={actionLoading === registration.id}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {actionLoading === registration.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        ) : (
                          registration.status === 'ENROLLED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDropCourse(registration.course.id)}
                              disabled={actionLoading === registration.course.id}
                            >
                              <UserMinus className="h-4 w-4 mr-1" />
                              {actionLoading === registration.course.id ? 'Dropping...' : 'Drop Course'}
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
  );
}
