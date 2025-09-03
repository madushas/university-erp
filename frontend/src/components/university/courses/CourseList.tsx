'use client';

import { useState, useEffect } from 'react';
import { useRoleAccess } from '@/lib/hooks/useRoleAccess';
import { useCourses } from '@/lib/hooks/useCourses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import CourseForm from './CourseForm';
import CourseCard from './CourseCard';
import type { CourseDto, CourseRequest, CourseSearchParams, CourseLevel, CourseStatus } from '@/lib/types/course';

interface CourseListProps {
  showCreateForm?: boolean;
  onCourseSelect?: (course: CourseDto) => void;
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
  showCreateForm = false,
  onCourseSelect,
  searchable = true,
  filterable = true 
}: CourseListProps) {
  const { canManageCourses, isStudent } = useRoleAccess();
  const [showForm, setShowForm] = useState(showCreateForm);
  const [editingCourse, setEditingCourse] = useState<CourseDto | null>(null);
  const [searchParams, setSearchParams] = useState<CourseSearchParams>({
    page: 0,
    size: 12,
    sortBy: 'title',
    sortDirection: 'asc'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const {
    courses,
    pagedCourses,
    loading,
    error,
    loadPagedCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    clearError,
    refresh
  } = useCourses({ 
    autoLoad: false,
    searchParams 
  });

  const canManage = canManageCourses();
  const isStudentUser = isStudent();

  // Update search params when filters change
  useEffect(() => {
    const newParams: CourseSearchParams = {
      page: 0, // Reset to first page when filters change
      size: 12,
      sortBy: 'title',
      sortDirection: 'asc'
    };

    if (searchTerm.trim()) {
      newParams.title = searchTerm.trim();
    }
    if (selectedLevel) {
      newParams.courseLevel = selectedLevel as CourseLevel;
    }
    if (selectedStatus) {
      newParams.status = selectedStatus as CourseStatus;
    }

    setSearchParams(newParams);
  }, [searchTerm, selectedLevel, selectedStatus]);

  // Load courses when search params change
  useEffect(() => {
    loadPagedCourses(searchParams);
  }, [searchParams, loadPagedCourses]);

  const handleCreateCourse = async (courseData: CourseRequest) => {
    try {
      await createCourse(courseData);
      setShowForm(false);
      // Show success message
    } catch (error) {
      console.error('Failed to create course:', error);
    }
  };

  const handleUpdateCourse = async (courseData: CourseRequest) => {
    if (!editingCourse?.id) return;
    
    try {
      await updateCourse(editingCourse.id, courseData);
      setEditingCourse(null);
      // Show success message
    } catch (error) {
      console.error('Failed to update course:', error);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await deleteCourse(courseId);
      // Show success message
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => ({ ...prev, page: newPage }));
  };

  const handleSortChange = (sortBy: string) => {
    setSearchParams(prev => ({
      ...prev,
      sortBy: sortBy as 'title' | 'code' | 'instructor' | 'credits' | 'enrolledStudents',
      sortDirection: prev.sortBy === sortBy && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLevel('');
    setSelectedStatus('');
    setSearchParams({
      page: 0,
      size: 12,
      sortBy: 'title',
      sortDirection: 'asc'
    });
  };

  if (showForm) {
    return (
      <CourseForm
        mode="create"
        onSubmit={handleCreateCourse}
        onCancel={() => setShowForm(false)}
        loading={loading}
      />
    );
  }

  if (editingCourse) {
    return (
      <CourseForm
        course={editingCourse}
        mode="edit"
        onSubmit={handleUpdateCourse}
        onCancel={() => setEditingCourse(null)}
        loading={loading}
      />
    );
  }

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
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add New Course
            </Button>
          )}
          <Button
            variant="outline"
            onClick={refresh}
            disabled={loading}
          >
            Refresh
          </Button>
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

      {/* Results Summary */}
      {pagedCourses && (
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            Showing {pagedCourses.content?.length || 0} of {pagedCourses.totalElements || 0} courses
          </div>
          <div className="flex items-center gap-4">
            <span>Sort by:</span>
            <select
              value={searchParams.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="title">Title</option>
              <option value="code">Code</option>
              <option value="instructor">Instructor</option>
              <option value="credits">Credits</option>
              <option value="enrolledStudents">Enrollment</option>
            </select>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex justify-between items-center">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearError}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Course Grid/List */}
      {!loading && courses.length > 0 && (
        <div className={
          viewMode === 'grid' 
            ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' 
            : 'space-y-4'
        }>
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              viewMode={viewMode}
              canManage={canManage}
              isStudent={isStudentUser}
              onEdit={() => setEditingCourse(course)}
              onDelete={() => course.id && handleDeleteCourse(course.id)}
              onSelect={() => onCourseSelect?.(course)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && courses.length === 0 && (
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
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Course
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagedCourses && pagedCourses.totalPages && pagedCourses.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(Math.max(0, (pagedCourses.number || 0) - 1))}
            disabled={pagedCourses.number === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, pagedCourses.totalPages || 0) }, (_, i) => {
              const pageNum = Math.max(0, (pagedCourses.number || 0) - 2) + i;
              if (pageNum >= (pagedCourses.totalPages || 0)) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === pagedCourses.number ? "default" : "outline"}
                  onClick={() => handlePageChange(pageNum)}
                  className="w-10"
                >
                  {pageNum + 1}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(Math.min((pagedCourses.totalPages || 0) - 1, (pagedCourses.number || 0) + 1))}
            disabled={pagedCourses.number === ((pagedCourses.totalPages || 0) - 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
