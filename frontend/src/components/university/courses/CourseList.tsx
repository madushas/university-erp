'use client';

import { useState } from 'react';
import { useRoleAccess } from '@/lib/hooks/useRoleAccess';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import CourseCard from './CourseCard';
import type { CourseDto } from '@/lib/types/course';

interface CourseListProps {
  courses: CourseDto[];
  loading: boolean;
  onCourseSelect?: (course: CourseDto) => void;
  onEdit?: (course: CourseDto) => void;
  onDelete?: (id: number) => void;
  onAddNew?: () => void;
  searchable?: boolean;
  filterable?: boolean;
}

const COURSE_LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'UNDERGRADUATE', label: 'Undergraduate' },
  { value: 'GRADUATE', label: 'Graduate' },
  { value: 'DOCTORAL', label: 'Doctoral' },
  { value: 'CERTIFICATE', label: 'Certificate' },
];

const COURSE_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export default function CourseList({ 
  courses,
  loading,
  onCourseSelect,
  onEdit,
  onDelete,
  onAddNew,
  searchable = true,
  filterable = true 
}: CourseListProps) {
  const { canManageCourses, isStudent } = useRoleAccess();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const canManage = canManageCourses();
  const isStudentUser = isStudent();

  const filteredCourses = courses.filter(course => {
    if (searchTerm && !course.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedLevel && course.courseLevel !== selectedLevel) {
      return false;
    }
    if (selectedStatus && course.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLevel('');
    setSelectedStatus('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
          <p className="text-gray-600 mt-1">
            Manage courses, schedules, and enrollment
          </p>
        </div>
        
        <div className="flex gap-2">
          {canManage && (
            <Button
              onClick={() => onAddNew?.()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add New Course
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      {(searchable || filterable) && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {searchable && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Courses
                </label>
                <Input
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
            
            {filterable && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {COURSE_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {COURSE_STATUSES.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex-1"
              >
                Clear Filters
              </Button>
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm border-l ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Course Grid/List */}
      {!loading && filteredCourses.length > 0 && (
        <div className={
          viewMode === 'grid' 
            ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' 
            : 'space-y-4'
        }>
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              viewMode={viewMode}
              canManage={canManage}
              isStudent={isStudentUser}
              onEdit={() => onEdit?.(course)}
              onDelete={() => course.id && onDelete?.(course.id)}
              onSelect={() => onCourseSelect?.(course)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedLevel || selectedStatus 
              ? 'Try adjusting your search criteria or filters'
              : 'Get started by creating your first course'
            }
          </p>
          {canManage && (
            <Button
              onClick={() => onAddNew?.()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Course
            </Button>
          )}
        </div>
      )}
    </div>
  );
}