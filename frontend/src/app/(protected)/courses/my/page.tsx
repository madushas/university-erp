'use client';

import { CourseService } from '@/lib/api/courses';
import { RegistrationDto } from '@/lib/types/registration';
import { CourseDto } from '@/lib/types/course';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { normalizeRole } from '@/lib/utils/constants';
import { getMyRegistrations } from '@/lib/api/registrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  getCourseTitle,
  getCourseCode,
  getCourseInstructorName,
  getCourseStatus,
  getCourseCredits,
  getCourseLevel,
  getCourseDetailsLink,
} from '@/lib/utils/courseDisplay';

export default function MyCoursesPage() {
  const { user, isLoading: userLoading } = useAuth();
  const [data, setData] = useState<RegistrationDto[] | CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (userLoading) return;
      if (!user) {
        setError('User not authenticated.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const role = normalizeRole(user.role);
        if (role === 'STUDENT') {
          const registrations = await getMyRegistrations();
          const active = (registrations || []).filter(
            (r) => ['ENROLLED', 'PENDING'].includes((r.status as string) || '')
          );
          setData(active);
        } else if (role === 'INSTRUCTOR') {
          const instructorCourses = await CourseService.getMyCourses();
          setData(instructorCourses);
        } else if (role === 'ADMIN') {
          // Admins can see all courses they manage
          const allCourses = await CourseService.getAllCourses();
          setData(allCourses);
        } else {
          setError('Access denied. Only students, instructors, and admins can view this page.');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load your data';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error fetching data for my courses/classes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userLoading]);

  if (loading || userLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-red-600 mb-2">Error loading data</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const normalizedRole = normalizeRole(user?.role || null);
  const isStudentView = normalizedRole === 'STUDENT';
  const isInstructorView = normalizedRole === 'INSTRUCTOR';
  const isAdminView = normalizedRole === 'ADMIN';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        {isStudentView ? 'My Registered Courses' : isInstructorView ? 'My Classes' : isAdminView ? 'All Courses' : 'Access Denied'}
      </h1>
      <p className="text-gray-600 mt-1">
        {isStudentView ? 'View the courses you are currently registered for.' : isInstructorView ? 'View the courses you are teaching.' : isAdminView ? 'Manage all courses in the system.' : ''}
      </p>

      {data.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isStudentView ? 'No registered courses found' : isInstructorView ? 'No classes found' : isAdminView ? 'No courses found' : ''}
          </h3>
          <p className="text-gray-600 mb-4">
            {isStudentView ? 'It looks like you haven\'t registered for any courses yet.' : isInstructorView ? 'You are not currently assigned to teach any classes.' : isAdminView ? 'No courses have been created yet.' : ''}
          </p>
          {isStudentView && (
            <Link href="/courses">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Browse Available Courses
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => {
            if (isStudentView) {
              const registration = item as RegistrationDto;
              return (
                <Card key={registration.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">{getCourseTitle(registration)}</CardTitle>
                    <p className="text-sm text-gray-500">Code: {getCourseCode(registration)}</p>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2">
                    <p className="text-sm text-gray-700">Instructor: {getCourseInstructorName(registration)}</p>
                    <p className="text-sm text-gray-700">Status: {registration.status || 'N/A'}</p>
                    {registration.grade && <p className="text-sm text-gray-700">Grade: {registration.grade}</p>}
                  </CardContent>
                  <div className="p-4 border-t flex justify-end">
                    <Link href={getCourseDetailsLink(registration)}>
                      <Button variant="outline" size="sm">
                        View Course Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            } else if (isInstructorView || isAdminView) {
              const course = item as CourseDto;
              return (
                <Card key={course.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">{getCourseTitle(course)}</CardTitle>
                    <p className="text-sm text-gray-500">Code: {getCourseCode(course)}</p>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2">
                    <p className="text-sm text-gray-700">Instructor: {getCourseInstructorName(course)}</p>
                    <p className="text-sm text-gray-700">Status: {getCourseStatus(course)}</p>
                    {isAdminView && (
                      <>
                        <p className="text-sm text-gray-700">Credits: {getCourseCredits(course)}</p>
                        <p className="text-sm text-gray-700">Level: {getCourseLevel(course)}</p>
                      </>
                    )}
                  </CardContent>
                  <div className="p-4 border-t flex justify-end">
                    <Link href={getCourseDetailsLink(course)}>
                      <Button variant="outline" size="sm">
                        Open
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
