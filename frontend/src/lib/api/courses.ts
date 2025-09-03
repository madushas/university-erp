import { api } from './generated';
import type { 
  CourseDto, 
  CourseRequest, 
  CourseSearchParams, 
  CourseEnrollmentInfo,
  CourseStatistics 
} from '@/lib/types/course';
import type { paths } from './schema';

type SortableValue = string | number | undefined;

/**
 * Enhanced Course API service with comprehensive course management functionality
 */
export class CourseService {
  /**
   * Get all courses with optional pagination
   */
  static async getAllCourses() {
    const response = await api.courses.getAll();
    if (!response.data) {
      throw new Error('Failed to fetch courses');
    }
    return response.data || [];
  }

  /**
   * Get paginated courses with search and filtering
   */
  static async getPagedCourses(params: CourseSearchParams = {}) {
    let allCourses: CourseDto[] = [];

    // If we have a title search, use the search endpoint
    if (params.title) {
      allCourses = await this.searchCourses(params.title);
    } else {
      // Get all courses for client-side filtering
      allCourses = await this.getAllCourses();
    }

    // Apply client-side filters
    let filteredCourses = allCourses;

    if (params.code) {
      filteredCourses = filteredCourses.filter(course => 
        course.code?.toLowerCase().includes(params.code!.toLowerCase())
      );
    }

    if (params.instructor) {
      filteredCourses = filteredCourses.filter(course => 
        course.instructor?.toLowerCase().includes(params.instructor!.toLowerCase())
      );
    }

    if (params.department) {
      filteredCourses = filteredCourses.filter(course => 
        course.department?.toLowerCase().includes(params.department!.toLowerCase())
      );
    }

    if (params.courseLevel) {
      filteredCourses = filteredCourses.filter(course => course.courseLevel === params.courseLevel);
    }

    if (params.status) {
      filteredCourses = filteredCourses.filter(course => course.status === params.status);
    }

    if (params.credits) {
      filteredCourses = filteredCourses.filter(course => course.credits === params.credits);
    }

    // Apply sorting
    const sortBy = params.sortBy || 'title';
    const sortDirection = params.sortDirection || 'asc';

    filteredCourses.sort((a, b) => {
      let aValue: SortableValue = a[sortBy as keyof CourseDto] as SortableValue;
      let bValue: SortableValue = b[sortBy as keyof CourseDto] as SortableValue;

      // Handle null values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

      // Convert strings to lowercase for case-insensitive comparison
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply pagination
    const page = params.page || 0;
    const size = params.size || 12;
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

    // Return in the expected PageCourseDto format
    return {
      content: paginatedCourses,
      pageable: {
        pageNumber: params.page || 0,
        pageSize: params.size || 12,
        sort: {
          empty: false,
          unsorted: false,
          sorted: true
        },
        offset: (params.page || 0) * (params.size || 12),
        paged: true,
        unpaged: false
      },
      totalElements: filteredCourses.length,
      totalPages: Math.ceil(filteredCourses.length / size),
      last: endIndex >= filteredCourses.length,
      first: page === 0,
      numberOfElements: paginatedCourses.length,
      size: size,
      number: page,
      sort: {
        empty: false,
        unsorted: false,
        sorted: true
      },
      empty: paginatedCourses.length === 0
    };
  }

  /**
   * Get course by ID
   */
  static async getCourseById(id: number): Promise<CourseDto> {
    const response = await api.courses.getById(id);
    if (!response.data) {
      throw new Error('Course not found');
    }
    return response.data;
  }

  /**
   * Get course by code
   */
  static async getCourseByCode(code: string): Promise<CourseDto> {
    const response = await api.courses.getByCode(code);
    if (!response.data) {
      throw new Error('Course not found');
    }
    return response.data;
  }

  /**
   * Search courses by title
   */
  static async searchCourses(title: string): Promise<CourseDto[]> {
    const response = await api.courses.search(title);
    if (!response.data) {
      throw new Error('Failed to search courses');
    }
    return response.data || [];
  }

  /**
   * Get courses by instructor
   */
  static async getCoursesByInstructor(instructor: string): Promise<CourseDto[]> {
    const response = await api.courses.getByInstructor(instructor);
    if (!response.data) {
      throw new Error('Failed to fetch instructor courses');
    }
    return response.data || [];
  }

  /**
   * Get available courses for enrollment
   */
  static async getAvailableCourses(): Promise<CourseDto[]> {
    const response = await api.courses.getAvailable();
    if (!response.data) {
      throw new Error('Failed to fetch available courses');
    }
    return response.data || [];
  }

  /**
   * Create a new course
   */
  static async createCourse(courseData: CourseRequest): Promise<CourseDto> {
    // Validate required fields
    this.validateCourseData(courseData);

    // Transform time strings to LocalTime objects for API compatibility
    const transformedData = this.transformCourseRequestForAPI(courseData);

    const response = await api.courses.create(transformedData);
    if (!response.data) {
      throw new Error('Failed to create course - no data returned');
    }
    return response.data;
  }

  /**
   * Update an existing course
   */
  static async updateCourse(id: number, courseData: CourseRequest): Promise<CourseDto> {
    // Validate required fields
    this.validateCourseData(courseData);

    // Transform time strings to LocalTime objects for API compatibility
    const transformedData = this.transformCourseRequestForAPI(courseData);

    const response = await api.courses.update(id, transformedData);
    if (!response.data) {
      throw new Error('Failed to update course - no data returned');
    }
    return response.data;
  }

  /**
   * Delete a course
   */
  static async deleteCourse(id: number): Promise<void> {
    const response = await api.courses.delete(id);
    if (response.error) {
      throw new Error('Failed to delete course');
    }
  }

  /**
   * Get course enrollment information
   */
  static async getCourseEnrollmentInfo(courseId: number): Promise<CourseEnrollmentInfo> {
    const course = await this.getCourseById(courseId);
    const enrolledStudents = course.enrolledStudents || 0;
    const maxStudents = course.maxStudents || 0;
    const enrollmentPercentage = maxStudents > 0 ? (enrolledStudents / maxStudents) * 100 : 0;
    
    return {
      courseId: course.id!,
      courseName: course.title || '',
      courseCode: course.code || '',
      enrolledStudents,
      maxStudents,
      enrollmentPercentage,
      canEnroll: enrolledStudents < maxStudents && course.status === 'ACTIVE',
      enrollmentMessage: this.getEnrollmentMessage(enrolledStudents, maxStudents, course.status),
    };
  }

  /**
   * Get course statistics for analytics
   */
  static async getCourseStatistics(): Promise<CourseStatistics> {
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

    if (!courseData.instructor?.trim()) {
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

  /**
   * Transform CourseRequest data to match the API client's expected LocalTime format
   */
  private static transformCourseRequestForAPI(courseData: CourseRequest): paths['/api/v1/courses']['post']['requestBody']['content']['application/json'] {
    const parseTimeString = (timeString: string | undefined) => {
      if (!timeString) return undefined;
      
      // Parse HH:mm:ss format
      const parts = timeString.split(':');
      if (parts.length >= 2) {
        return {
          hour: parseInt(parts[0], 10),
          minute: parseInt(parts[1], 10),
          second: parts.length > 2 ? parseInt(parts[2], 10) : 0,
          nano: 0
        };
      }
      return undefined;
    };

    return {
      ...courseData,
      startTime: parseTimeString(courseData.startTime),
      endTime: parseTimeString(courseData.endTime)
    };
  }
}

// Export the service as default and named export for convenience
export default CourseService;
export { CourseService as courseService };