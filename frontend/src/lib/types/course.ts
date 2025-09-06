import type { components } from '@/lib/api/schema';

// Course types from the API schema with instructor field extensions
export interface CourseDto extends Omit<components['schemas']['CourseDto'], 'instructor'> {
  instructorName?: string;
  instructorId?: number;
  instructor?: string; // Keep for backward compatibility
}

export type CourseResponse = components['schemas']['CourseResponse'];
export type PageCourseDto = components['schemas']['PageCourseDto'];

// Course status enum
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'CANCELLED' | 'COMPLETED' | 'ARCHIVED';

// Course level enum
export type CourseLevel = 'UNDERGRADUATE' | 'GRADUATE' | 'DOCTORAL' | 'CERTIFICATE';

// Days of week for scheduling
export type DaysOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

// Course search and filter types
export interface CourseSearchParams {
  title?: string;
  code?: string;
  instructor?: string;
  department?: string;
  courseLevel?: CourseLevel;
  status?: CourseStatus;
  credits?: number;
  page?: number;
  size?: number;
  sortBy?: 'title' | 'code' | 'instructor' | 'credits' | 'enrolledStudents';
  sortDirection?: 'asc' | 'desc';
}

// Course form data for creation/editing
export interface CourseFormData {
  code: string;
  title: string;
  description?: string;
  instructorId: number | null;
  instructorEmail?: string;
  department?: string;
  courseLevel?: CourseLevel;
  schedule: string;
  classroom?: string;
  startDate?: string;
  endDate?: string;
  startTime?: {
    hour: number;
    minute: number;
  };
  endTime?: {
    hour: number;
    minute: number;
  };
  daysOfWeek?: string;
  credits: number;
  maxStudents?: number;
  minStudents?: number;
  courseFee?: number;
  prerequisites?: string;
  status?: CourseStatus;
  syllabusUrl?: string;
  textbook?: string;
  passingGrade?: string;
}

// Custom CourseRequest type that matches backend expectations
// Backend expects time fields as strings, not LocalTime objects
export interface CourseRequest {
  code: string;
  title: string;
  description?: string;
  instructorId: number;
  instructorEmail?: string;
  department?: string;
  courseLevel?: CourseLevel;
  schedule: string;
  classroom?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string; // Backend expects "HH:mm:ss" format
  endTime?: string;   // Backend expects "HH:mm:ss" format
  daysOfWeek?: string;
  credits: number;
  maxStudents?: number;
  minStudents?: number;
  courseFee?: number;
  prerequisites?: string;
  status?: CourseStatus;
  syllabusUrl?: string;
  textbook?: string;
  passingGrade?: string;
}

// Course enrollment information
export interface CourseEnrollmentInfo {
  courseId: number;
  courseName: string;
  courseCode: string;
  enrolledStudents: number;
  maxStudents: number;
  waitlistCount?: number;
  enrollmentPercentage: number;
  canEnroll: boolean;
  enrollmentMessage?: string;
}

// Course statistics for analytics
export interface CourseStatistics {
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  averageEnrollmentRate: number;
  topCourses: Array<{
    id: number;
    code: string;
    title: string;
    enrollmentCount: number;
  }>;
}

// Course validation errors
export interface CourseValidationError {
  field: string;
  message: string;
}

// Course management permissions
export interface CoursePermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageEnrollment: boolean;
  canViewAnalytics: boolean;
}