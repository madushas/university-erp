'use client';

import { useRoleAccess } from '@/lib/hooks/useRoleAccess';
import { api } from '@/lib/api/generated';
import { useState, useEffect } from 'react';
import type { components } from '@/lib/api/schema';

type Course = components['schemas']['CourseResponse'];

export default function CourseList() {
  const { canManageCourses, isStudent } = useRoleAccess();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canManage = canManageCourses();
  const isStudentUser = isStudent();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await api.courses.getAll();
      
      if (error) {
        setError('Failed to load courses');
        return;
      }
      
      if (data) {
        setCourses(data);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadCourses}
          className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Courses</h2>
        {canManage && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Add New Course
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{course.code}</h3>
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                ACTIVE
              </span>
            </div>
            
            <h4 className="text-md font-medium text-gray-700 mb-2">{course.title}</h4>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
            
            <div className="space-y-1 text-sm text-gray-500">
              <p><span className="font-medium">Instructor:</span> {course.instructor || 'TBA'}</p>
              <p><span className="font-medium">Credits:</span> {course.credits}</p>
              <p><span className="font-medium">Schedule:</span> {course.schedule || 'TBA'}</p>
              <p><span className="font-medium">Enrollment:</span> {course.enrolledStudents}/{course.maxStudents}</p>
            </div>

            <div className="mt-4 flex gap-2">
              {isStudentUser && (
                <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700">
                  Register
                </button>
              )}
              {canManage && (
                <>
                  <button className="flex-1 bg-gray-600 text-white py-2 px-3 rounded text-sm hover:bg-gray-700">
                    Edit
                  </button>
                  <button className="bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700">
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No courses available</p>
        </div>
      )}
    </div>
  );
}
