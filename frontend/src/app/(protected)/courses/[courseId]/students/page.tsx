'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCourseRegistrations } from '@/lib/api/registrations'; // Assuming this function will be created/modified
import { RegistrationDto } from '@/lib/types/registration';
import { toast } from 'sonner';

export default function CourseStudentsPage() {
  const params = useParams();
  const courseId = params.courseId ? parseInt(params.courseId as string) : null;

  const [registrations, setRegistrations] = useState<RegistrationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setError('Course ID not provided.');
      setLoading(false);
      return;
    }

    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        // NOTE: This API endpoint is currently admin-only. 
        // A backend change is required to allow instructors to view their course registrations.
        // For demonstration, we are using it assuming admin privileges or future backend update.
        const data = await getCourseRegistrations(courseId);
        setRegistrations(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load enrolled students';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error fetching course registrations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600 mb-2">Error loading students</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Enrolled Students for Course {courseId}</h1>
      <p className="text-gray-600 mt-1">List of students registered for this course.</p>

      {registrations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students enrolled yet</h3>
          <p className="text-gray-600 mb-4">
            There are no students registered for this course at the moment.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {registrations.map((reg) => (
            <Card key={reg.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{reg.user?.firstName} {reg.user?.lastName}</CardTitle>
                <p className="text-sm text-gray-500">{reg.user?.email}</p>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <p className="text-sm text-gray-700">Registration Status: {reg.status}</p>
                {reg.grade && <p className="text-sm text-gray-700">Grade: {reg.grade}</p>}
                {/* Add more student/registration details as needed */}
              </CardContent>
              <div className="p-4 border-t flex justify-end">
                {/* Example: Button to edit grade or view student profile */}
                <Button variant="outline" size="sm">
                  Edit Grade
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
