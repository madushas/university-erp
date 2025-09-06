import { api } from './generated';
import type { paths } from '@/lib/api/schema';
import { withErrorHandling, extractApiError } from '@/lib/utils/errorHandler';
import type { 
  CourseDto, 
  CourseRequest, 
  CourseSearchParams, 
  CourseEnrollmentInfo,
  CourseStatistics,
  PageCourseDto,
} from '@/lib/types/course';

/**
 * Enhanced Course API service with comprehensive course management functionality
 */
export class CourseService {
  /**
   * Get all courses
   */
  static async getAllCourses(): Promise<CourseDto[]> {
    return withErrorHandling(async () => {
      const response = await api.courses.getAll();
      const apiError = extractApiError(response);
      if (apiError) throw apiError;
      
      if (!response.data) {
        throw new Error('Failed to fetch courses');
      }
      return response.data || [];
    }, 'CourseService.getAllCourses');
  }

  /**
   * Get paged courses directly from API (raw PageCourseDto)
   */
  static async getPagedCourses(params?: CourseSearchParams): Promise<PageCourseDto> {
    return withErrorHandling(async () => {
      const query = {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        ...(params?.sortBy ? { sort: [`${params.sortBy},${params.sortDirection || 'asc'}`] } : {}),
      } as Record<string, unknown>;

      const response = await api.courses.getPaged(query as never);
      const apiError = extractApiError(response);
      if (apiError) throw apiError;

      if (!response.data) {
        throw new Error('Failed to fetch paged courses - no data returned');
      }
      return response.data;
    }, 'CourseService.getPagedCourses');
  }

  /**
   * Simple title search (hook compatibility)
   */
  static async searchCoursesByTitle(title: string): Promise<CourseDto[]> {
    return withErrorHandling(async () => {
      const response = await api.courses.search(title);
      const apiError = extractApiError(response);
      if (apiError) throw apiError;
      return response.data ?? [];
    }, 'CourseService.searchCoursesByTitle');
  }

  /**
   * Get course by code
   */
  static async getCourseByCode(code: string): Promise<CourseDto> {
    return withErrorHandling(async () => {
      const response = await api.courses.getByCode(code);
      const apiError = extractApiError(response);
      if (apiError) throw apiError;
      if (!response.data) throw new Error(`Course with code ${code} not found`);
      return response.data;
    }, 'CourseService.getCourseByCode');
  }

  /**
   * Get courses by instructor identifier (username or id as string as per backend)
   */
  static async getCoursesByInstructor(instructor: string): Promise<CourseDto[]> {
    return withErrorHandling(async () => {
      const response = await api.courses.getByInstructor(instructor);
      const apiError = extractApiError(response);
      if (apiError) throw apiError;
      return response.data ?? [];
    }, 'CourseService.getCoursesByInstructor');
  }

  /**
   * Search courses - overloads
   * - searchCourses(title: string) => CourseDto[]
   * - searchCourses(params: CourseSearchParams) => paged result with filters
   */
  static async searchCourses(title: string): Promise<CourseDto[]>;
  static async searchCourses(params: CourseSearchParams): Promise<{
    courses: CourseDto[];
    total: number;
    page: number;
    size: number;
  }>;
  static async searchCourses(param: string | CourseSearchParams): Promise<CourseDto[] | { courses: CourseDto[]; total: number; page: number; size: number }> {
    if (typeof param === 'string') {
      return this.searchCoursesByTitle(param);
    }

    const params = param as CourseSearchParams;
    return withErrorHandling(async () => {
      console.log('🔍 CourseService.searchCourses called with:', params);
      
      // Build flat pagination parameters expected by Spring Pageable (page, size, sort)
      const paginationParams = {
        page: params.page ?? 0,
        size: params.size ?? 10,
        ...(params.sortBy ? { sort: [`${params.sortBy},${params.sortDirection || 'asc'}`] } : {}),
      } as Record<string, unknown>;

      console.log('🌐 Making paginated API call with params:', paginationParams);
      const response = await api.courses.getPaged(paginationParams as never);
      
      // Apply minimal client-side filtering for now (until backend supports full filtering)
      let filteredCourses = response.data?.content || [];
      
      if (params.title) {
        filteredCourses = filteredCourses.filter(course => 
          course.title?.toLowerCase().includes(params.title!.toLowerCase())
        );
      }
      
      if (params.code) {
        filteredCourses = filteredCourses.filter(course => 
          course.code?.toLowerCase().includes(params.code!.toLowerCase())
        );
      }
      
      if (params.instructor) {
        filteredCourses = filteredCourses.filter(course => {
          const c = course as unknown as { instructorName?: string; instructor?: string };
          const name = (c.instructorName || c.instructor || '').toLowerCase();
          return name.includes(params.instructor!.toLowerCase());
        });
      }
      
      if (params.department) {
        filteredCourses = filteredCourses.filter(course => 
          course.department?.toLowerCase().includes(params.department!.toLowerCase())
        );
      }
      
      if (params.status) {
        filteredCourses = filteredCourses.filter(course => 
          course.status === params.status
        );
      }
      
      if (params.credits) {
        filteredCourses = filteredCourses.filter(course => 
          course.credits === params.credits
        );
      }
      
      // Check for API errors
      const apiError = extractApiError(response);
      if (apiError) {
        throw apiError;
      }

      if (!response.data) {
        throw new Error('Failed to fetch paginated courses - no data returned');
      }

      console.log('✅ Paginated courses fetched successfully:', {
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        currentPage: response.data.number,
        size: response.data.size,
        filteredCount: filteredCourses.length
      });

      return {
        courses: filteredCourses,
        total: response.data.totalElements ?? filteredCourses.length,
        page: response.data.number ?? 0,
        size: response.data.size ?? (params.size ?? 10),
      };
    }, 'CourseService.searchCourses');
  }

  /**
   * Get course by ID
   */
  static async getCourseById(id: number): Promise<CourseDto> {
    return withErrorHandling(async () => {
      const response = await api.courses.getById(id);
      const apiError = extractApiError(response);
      if (apiError) throw apiError;
      
      if (!response.data) {
        throw new Error(`Course with ID ${id} not found`);
      }
      return response.data;
    }, 'CourseService.getCourseById');
  }

  /**
   * Get courses for current instructor
   */
  static async getMyCourses(): Promise<CourseDto[]> {
    return withErrorHandling(async () => {
      const response = await api.courses.my();
      const apiError = extractApiError(response);
      if (apiError) throw apiError;
      if (!response.data) {
        throw new Error('Failed to fetch my courses');
      }
      return response.data as unknown as CourseDto[];
    }, 'CourseService.getMyCourses');
  }

  /**
   * Validate course data before submission
   */
  private static validateCourseData(courseData: CourseRequest): void {
    const errors: string[] = [];

    if (!courseData.code?.trim()) {
      errors.push('Course code is required');
    }

    if (!courseData.title?.trim()) {
      errors.push('Course title is required');
    }

    if (!courseData.instructorId) {
      errors.push('Instructor is required');
    }

    if (!courseData.schedule?.trim()) {
      errors.push('Schedule is required');
    }

    if (!courseData.credits || courseData.credits < 1) {
      errors.push('Credits must be at least 1');
    }

    if (courseData.maxStudents && courseData.maxStudents < 1) {
      errors.push('Maximum students must be at least 1');
    }

    if (courseData.minStudents && courseData.minStudents < 1) {
      errors.push('Minimum students must be at least 1');
    }

    if (courseData.maxStudents && courseData.minStudents && 
        courseData.minStudents > courseData.maxStudents) {
      errors.push('Minimum students cannot exceed maximum students');
    }

    if (courseData.instructorEmail && !this.isValidEmail(courseData.instructorEmail)) {
      errors.push('Invalid instructor email format');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Create a new course
   */
  static async createCourse(courseData: CourseRequest): Promise<CourseDto> {
    return withErrorHandling(async () => {
      console.log('🎯 CourseService.createCourse called with:', courseData);
      
      // Validate required fields
      this.validateCourseData(courseData);
      console.log('✅ Course data validation passed');
      // Backend expects instructorId (Long) and LocalTime as "HH:mm:ss" strings per CourseRequest
      // Send the request body as-is, assuming CourseForm formatted times correctly
      const apiPayload = { ...courseData };
      
      const response = await api.courses.create(
        apiPayload as unknown as paths['/api/v1/courses']['post']['requestBody']['content']['application/json']
      );
      
      // Check for API errors
      const apiError = extractApiError(response);
      if (apiError) {
        throw apiError;
      }
      
      if (!response.data) {
        throw new Error('Failed to create course - no data returned');
      }
      console.log('✅ Course created successfully:', response.data);
      return response.data;
    }, 'CourseService.createCourse');
  }

  /**
   * Update an existing course
   */
  static async updateCourse(id: number, courseData: CourseRequest): Promise<CourseDto> {
    return withErrorHandling(async () => {
      // Validate required fields
      this.validateCourseData(courseData);
      
      // Backend expects instructorId (Long) and LocalTime as "HH:mm:ss" strings per CourseRequest
      const apiPayload = { ...courseData };
      
      const response = await api.courses.update(
        id,
        apiPayload as unknown as paths['/api/v1/courses/{id}']['put']['requestBody']['content']['application/json']
      );
      
      // Check for API errors
      const apiError = extractApiError(response);
      if (apiError) {
        throw apiError;
      }
      
      if (!response.data) {
        throw new Error('Failed to update course - no data returned');
      }
      return response.data;
    }, 'CourseService.updateCourse');
  }

  /**
   * Delete a course
   */
  static async deleteCourse(id: number): Promise<void> {
    return withErrorHandling(async () => {
      const response = await api.courses.delete(id);
      
      // Check for API errors
      const apiError = extractApiError(response);
      if (apiError) {
        throw apiError;
      }
    }, 'CourseService.deleteCourse');
  }

  /**
   * Get course enrollment information
   */
  static async getCourseEnrollmentInfo(courseId: number): Promise<CourseEnrollmentInfo> {
    return withErrorHandling(async () => {
      const course = await this.getCourseById(courseId);
      
      const enrolledCount = course.enrolledStudents || 0;
      const maxCount = course.maxStudents || 0;
      const enrollmentPercentage = maxCount > 0 ? (enrolledCount / maxCount) * 100 : 0;
      const canEnroll = course.status === 'ACTIVE' && enrolledCount < maxCount;

      return {
        courseId: course.id!,
        courseName: course.title || '',
        courseCode: course.code || '',
        enrolledStudents: enrolledCount,
        maxStudents: maxCount,
        enrollmentPercentage,
        canEnroll,
        enrollmentMessage: this.getEnrollmentMessage(enrolledCount, maxCount, course.status)
      };
    }, 'CourseService.getCourseEnrollmentInfo');
  }

  /**
   * Get course statistics for analytics
   */
  static async getCourseStatistics(): Promise<CourseStatistics> {
    return withErrorHandling(async () => {
      const courses = await this.getAllCourses();
      const activeCourses = courses.filter(course => course.status === 'ACTIVE');
      const totalEnrollments = courses.reduce((sum, course) => sum + (course.enrolledStudents || 0), 0);
      const averageEnrollmentRate = courses.length > 0 
        ? courses.reduce((sum, course) => {
            const rate = course.maxStudents && course.maxStudents > 0 
              ? (course.enrolledStudents || 0) / course.maxStudents 
              : 0;
            return sum + rate;
          }, 0) / courses.length * 100
        : 0;

      const topCourses = courses
        .sort((a, b) => (b.enrolledStudents || 0) - (a.enrolledStudents || 0))
        .slice(0, 5)
        .map(course => ({
          id: course.id!,
          code: course.code || '',
          title: course.title || '',
          enrollmentCount: course.enrolledStudents || 0,
        }));

      return {
        totalCourses: courses.length,
        activeCourses: activeCourses.length,
        totalEnrollments,
        averageEnrollmentRate,
        topCourses,
      };
    }, 'CourseService.getCourseStatistics');
  }

  /**
   * Get enrollment message based on course status and capacity
   */
  private static getEnrollmentMessage(
    enrolled: number, 
    max: number, 
    status?: string
  ): string {
    if (status !== 'ACTIVE') {
      return 'Course is not available for enrollment';
    }
    
    if (max === 0) {
      return 'No enrollment limit set';
    }
    
    if (enrolled >= max) {
      return 'Course is full';
    }
    
    const remaining = max - enrolled;
    if (remaining <= 5) {
      return `Only ${remaining} spots remaining`;
    }
    
    return 'Available for enrollment';
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export the service as default and named export for convenience
export default CourseService;
export { CourseService as courseService };