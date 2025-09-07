'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCourses } from '@/lib/hooks/useCourses';
import { useRoleAccess } from '@/lib/hooks/useRoleAccess';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import CourseList from './CourseList';
import CourseDetails from './CourseDetails';
import CourseForm from './CourseForm';
import type { CourseDto, CourseRequest } from '@/lib/types/course';
import { NAV_ROUTES } from '@/lib/utils/constants';

type ViewMode = 'list' | 'details' | 'create' | 'edit';

export default function CourseManagement() {
  const router = useRouter();
  const { canManageCourses, isStudent, isInstructor } = useRoleAccess();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCourse, setSelectedCourse] = useState<CourseDto | null>(null);
  const { statistics, loading, courses, loadStatistics, createCourse, updateCourse, deleteCourse, loadPagedCourses } = useCourses({ autoLoad: false });

  const canManage = canManageCourses();
  const isStudentUser = isStudent();
  const isInstructorUser = isInstructor();

  const handleCourseSelect = (course: CourseDto) => {
    // Navigate to the unified dedicated route instead of inline details
    if (course.id) {
      router.push(`/course/${course.id}`);
      return;
    }
    // Fallback (should rarely happen)
    setSelectedCourse(course);
    setViewMode('details');
  };

  const handleDeleteCourse = async (id: number) => {
    if (!id) return;
    try {
      const confirmed = typeof window !== 'undefined' ? window.confirm('Are you sure you want to delete this course?') : true;
      if (!confirmed) return;
      const ok = await deleteCourse(id);
      if (ok) {
        toast.success('Course deleted successfully!');
        if (selectedCourse?.id === id) {
          setSelectedCourse(null);
          setViewMode('list');
        }
        if (canManageCourses()) {
          loadPagedCourses();
        }
      } else {
        toast.error('Failed to delete course');
      }
    } catch (error) {
      console.error('Failed to delete course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete course';
      toast.error(`Error deleting course: ${errorMessage}`);
    }
  };

  const handleEditCourseFromList = (course: CourseDto) => {
    setSelectedCourse(course);
    setViewMode('edit');
  };

  const handleCreateCourse = async (courseData: CourseRequest) => {
    console.log('🚀 handleCreateCourse called with data:', courseData);
    try {
      console.log('📞 Calling createCourse API...');
      const newCourse = await createCourse(courseData);
      console.log('✅ createCourse API response:', newCourse);
      if (newCourse) {
        toast.success('Course created successfully!');
        setViewMode('list');
        // Refresh the course list
        if (canManageCourses()) {
          loadPagedCourses();
        }
      }
    } catch (error) {
      console.error('❌ Failed to create course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create course';
      toast.error(`Error creating course: ${errorMessage}`);
    }
  };

  const handleUpdateCourse = async (courseData: CourseRequest) => {
    if (!selectedCourse?.id) {
      toast.error('No course selected for update');
      return;
    }
    
    try {
      const updatedCourse = await updateCourse(selectedCourse.id, courseData);
      if (updatedCourse) {
        setSelectedCourse(updatedCourse);
        toast.success('Course updated successfully!');
        setViewMode('details');
        // Refresh the course list
        if (canManageCourses()) {
          loadPagedCourses();
        }
      }
    } catch (error) {
      console.error('Failed to update course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update course';
      toast.error(`Error updating course: ${errorMessage}`);
    }
  };

  const handleEditCourse = () => {
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setSelectedCourse(null);
    setViewMode('list');
  };

  const handleRegisterForCourse = (courseId: number) => {
    // TODO: Implement course registration
    console.log('Register for course:', courseId);
  };

  // Load statistics when component mounts or role changes
  // IMPORTANT: Avoid unstable function dependencies to prevent infinite loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    import('@/lib/utils/authDebug').then(({ logAuthDebug }) => {
      logAuthDebug('CourseManagement Component');
    });

    const instructor = isInstructor();
    const student = isStudent();
    const can = canManageCourses();

    console.log('🔄 CourseManagement useEffect triggered', {
      instructor,
      userRole: user?.role,
      student,
      canManageCourses: can,
    });

    if (instructor) {
      console.log('👨‍🏫 Instructor: loading all courses for browse and statistics');
      loadStatistics();
      loadPagedCourses();
    } else if (student) {
      console.log('🎓 Loading all courses for student');
      loadPagedCourses();
    } else if (can) { // Admins
      console.log('📊 Loading all courses and statistics for admin');
      loadStatistics();
      loadPagedCourses();
    } else {
      console.warn('⚠️ No matching role condition for course loading');
    }
  }, [user?.role]);

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      {viewMode === 'list' && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalCourses}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-green-600">{statistics.activeCourses}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-purple-600">{statistics.totalEnrollments}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Enrollment</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(statistics.averageEnrollmentRate)}%
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Top Courses (only for instructors and admins) */}
      {viewMode === 'list' && statistics && (canManage || isInstructorUser) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Enrolled Courses</h3>
          <div className="space-y-3">
            {statistics.topCourses.map((course, index) => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{course.code}</p>
                    <p className="text-sm text-gray-600">{course.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{course.enrollmentCount}</p>
                  <p className="text-sm text-gray-600">students</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Content */}
      {viewMode === 'list' && (
        <CourseList 
          courses={courses}
          loading={loading} 
          onCourseSelect={handleCourseSelect}
          onEdit={canManage ? handleEditCourseFromList : undefined}
          onDelete={canManage ? handleDeleteCourse : undefined}
          onAddNew={canManage ? () => setViewMode('create') : undefined}
          searchable={true}
          filterable={true}
        />
      )}

      {viewMode === 'details' && selectedCourse && (
        <CourseDetails
          courseId={selectedCourse.id!}
          onEdit={canManage ? handleEditCourse : undefined}
          onBack={handleBackToList}
          onRegister={isStudentUser ? handleRegisterForCourse : undefined}
        />
      )}

      {viewMode === 'create' && (
        <CourseForm
          mode="create"
          onSubmit={handleCreateCourse}
          onCancel={handleBackToList}
          loading={loading}
        />
      )}

      {viewMode === 'edit' && selectedCourse && (
        <CourseForm
          course={selectedCourse}
          mode="edit"
          onSubmit={handleUpdateCourse}
          onCancel={() => setViewMode('details')}
          loading={loading}
        />
      )}

      {/* Quick Actions for different user types */}
      {viewMode === 'list' && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2">
          {canManage && (
            <Button
              onClick={() => setViewMode('create')}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg"
              size="lg"
            >
              + Add Course
            </Button>
          )}
          
          {isStudentUser && (
            <Button
              variant="outline"
              className="shadow-lg bg-white"
              onClick={() => {
                router.push(NAV_ROUTES.COURSES_MY);
              }}
            >
              My Courses
            </Button>
          )}
          
          {isInstructorUser && (
            <Button
              variant="outline"
              className="shadow-lg bg-white"
              onClick={() => {
                router.push(NAV_ROUTES.COURSES_MY);
              }}
            >
              My Classes
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
