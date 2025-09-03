'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCourses } from '@/lib/hooks/useCourses';
import { useRoleAccess } from '@/lib/hooks/useRoleAccess';
import CourseList from './CourseList';
import CourseDetails from './CourseDetails';
import CourseForm from './CourseForm';
import type { CourseDto, CourseRequest } from '@/lib/types/course';

type ViewMode = 'list' | 'details' | 'create' | 'edit';

export default function CourseManagement() {
  const { canManageCourses, isStudent, isInstructor } = useRoleAccess();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCourse, setSelectedCourse] = useState<CourseDto | null>(null);
  const { statistics, loadStatistics, createCourse, updateCourse } = useCourses({ autoLoad: false });

  const canManage = canManageCourses();
  const isStudentUser = isStudent();
  const isInstructorUser = isInstructor();

  const handleCourseSelect = (course: CourseDto) => {
    setSelectedCourse(course);
    setViewMode('details');
  };

  const handleCreateCourse = async (courseData: CourseRequest) => {
    try {
      await createCourse(courseData);
      setViewMode('list');
      // Show success message
    } catch (error) {
      console.error('Failed to create course:', error);
      // Show error message
    }
  };

  const handleUpdateCourse = async (courseData: CourseRequest) => {
    if (!selectedCourse?.id) return;
    
    try {
      const updatedCourse = await updateCourse(selectedCourse.id, courseData);
      if (updatedCourse) {
        setSelectedCourse(updatedCourse);
      }
      setViewMode('details');
      // Show success message
    } catch (error) {
      console.error('Failed to update course:', error);
      // Show error message
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

  // Load statistics when component mounts
  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

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
          onCourseSelect={handleCourseSelect}
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
        />
      )}

      {viewMode === 'edit' && selectedCourse && (
        <CourseForm
          course={selectedCourse}
          mode="edit"
          onSubmit={handleUpdateCourse}
          onCancel={() => setViewMode('details')}
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
                // TODO: Navigate to my courses
                console.log('Navigate to my courses');
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
                // TODO: Navigate to instructor dashboard
                console.log('Navigate to instructor dashboard');
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