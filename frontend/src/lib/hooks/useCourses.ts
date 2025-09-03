import { useState, useEffect, useCallback } from 'react';
import { CourseService } from '@/lib/api/courses';
import type { 
  CourseDto, 
  CourseRequest, 
  CourseSearchParams,
  PageCourseDto,
  CourseEnrollmentInfo,
  CourseStatistics 
} from '@/lib/types/course';

interface UseCoursesOptions {
  autoLoad?: boolean;
  searchParams?: CourseSearchParams;
}

interface UseCoursesReturn {
  courses: CourseDto[];
  pagedCourses: PageCourseDto | null;
  loading: boolean;
  error: string | null;
  statistics: CourseStatistics | null;
  
  // Actions
  loadCourses: () => Promise<void>;
  loadPagedCourses: (params?: CourseSearchParams) => Promise<void>;
  searchCourses: (title: string) => Promise<void>;
  getCourseById: (id: number) => Promise<CourseDto | null>;
  getCourseByCode: (code: string) => Promise<CourseDto | null>;
  createCourse: (courseData: CourseRequest) => Promise<CourseDto | null>;
  updateCourse: (id: number, courseData: CourseRequest) => Promise<CourseDto | null>;
  deleteCourse: (id: number) => Promise<boolean>;
  getCourseEnrollmentInfo: (courseId: number) => Promise<CourseEnrollmentInfo | null>;
  loadStatistics: () => Promise<void>;
  
  // Utilities
  clearError: () => void;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for course management operations
 */
export function useCourses(options: UseCoursesOptions = {}): UseCoursesReturn {
  const { autoLoad = true, searchParams } = options;
  
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [pagedCourses, setPagedCourses] = useState<PageCourseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<CourseStatistics | null>(null);

  /**
   * Load all courses
   */
  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CourseService.getAllCourses();
      setCourses(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load courses';
      setError(errorMessage);
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load paginated courses with search/filter
   */
  const loadPagedCourses = useCallback(async (params?: CourseSearchParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await CourseService.getPagedCourses(params || searchParams);
      setPagedCourses(data || null);
      
      // Also update the courses array if we have content
      if (data?.content) {
        setCourses(data.content);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load courses';
      setError(errorMessage);
      console.error('Error loading paged courses:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  /**
   * Search courses by title
   */
  const searchCourses = useCallback(async (title: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await CourseService.searchCourses(title);
      setCourses(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search courses';
      setError(errorMessage);
      console.error('Error searching courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get course by ID
   */
  const getCourseById = useCallback(async (id: number): Promise<CourseDto | null> => {
    try {
      setError(null);
      return await CourseService.getCourseById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get course';
      setError(errorMessage);
      console.error('Error getting course by ID:', err);
      return null;
    }
  }, []);

  /**
   * Get course by code
   */
  const getCourseByCode = useCallback(async (code: string): Promise<CourseDto | null> => {
    try {
      setError(null);
      return await CourseService.getCourseByCode(code);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get course';
      setError(errorMessage);
      console.error('Error getting course by code:', err);
      return null;
    }
  }, []);

  /**
   * Create a new course
   */
  const createCourse = useCallback(async (courseData: CourseRequest): Promise<CourseDto | null> => {
    try {
      setError(null);
      const newCourse = await CourseService.createCourse(courseData);
      
      // Add to local state
      setCourses(prev => [...prev, newCourse]);
      
      return newCourse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create course';
      setError(errorMessage);
      console.error('Error creating course:', err);
      return null;
    }
  }, []);

  /**
   * Update an existing course
   */
  const updateCourse = useCallback(async (id: number, courseData: CourseRequest): Promise<CourseDto | null> => {
    try {
      setError(null);
      const updatedCourse = await CourseService.updateCourse(id, courseData);
      
      // Update local state
      setCourses(prev => prev.map(course => 
        course.id === id ? updatedCourse : course
      ));
      
      return updatedCourse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update course';
      setError(errorMessage);
      console.error('Error updating course:', err);
      return null;
    }
  }, []);

  /**
   * Delete a course
   */
  const deleteCourse = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await CourseService.deleteCourse(id);
      
      // Remove from local state
      setCourses(prev => prev.filter(course => course.id !== id));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete course';
      setError(errorMessage);
      console.error('Error deleting course:', err);
      return false;
    }
  }, []);

  /**
   * Get course enrollment information
   */
  const getCourseEnrollmentInfo = useCallback(async (courseId: number): Promise<CourseEnrollmentInfo | null> => {
    try {
      setError(null);
      return await CourseService.getCourseEnrollmentInfo(courseId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get enrollment info';
      setError(errorMessage);
      console.error('Error getting enrollment info:', err);
      return null;
    }
  }, []);

  /**
   * Load course statistics
   */
  const loadStatistics = useCallback(async () => {
    try {
      setError(null);
      const stats = await CourseService.getCourseStatistics();
      setStatistics(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load statistics';
      setError(errorMessage);
      console.error('Error loading statistics:', err);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh current data
   */
  const refresh = useCallback(async () => {
    if (pagedCourses) {
      await loadPagedCourses();
    } else {
      await loadCourses();
    }
  }, [pagedCourses, loadPagedCourses, loadCourses]);

  // Auto-load courses on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      if (searchParams) {
        loadPagedCourses(searchParams);
      } else {
        loadCourses();
      }
    }
  }, [autoLoad, searchParams, loadCourses, loadPagedCourses]);

  return {
    courses,
    pagedCourses,
    loading,
    error,
    statistics,
    
    // Actions
    loadCourses,
    loadPagedCourses,
    searchCourses,
    getCourseById,
    getCourseByCode,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseEnrollmentInfo,
    loadStatistics,
    
    // Utilities
    clearError,
    refresh,
  };
}

/**
 * Hook for managing a single course
 */
export function useCourse(courseId?: number) {
  const [course, setCourse] = useState<CourseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourse = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await CourseService.getCourseById(id);
      setCourse(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load course';
      setError(errorMessage);
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (courseId) {
      loadCourse(courseId);
    }
  }, [courseId, loadCourse]);

  return {
    course,
    loading,
    error,
    loadCourse,
    clearError: () => setError(null),
  };
}