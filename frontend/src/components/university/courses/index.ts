// Course Management Components
export { default as CourseList } from './CourseList';
export { default as CourseForm } from './CourseForm';
export { default as CourseCard } from './CourseCard';
export { default as CourseDetails } from './CourseDetails';
export { default as CourseManagement } from './CourseManagement';

// Re-export types for convenience
export type {
  CourseDto,
  CourseRequest,
  CourseResponse,
  CourseSearchParams,
  CourseFormData,
  CourseEnrollmentInfo,
  CourseStatistics,
  CoursePermissions,
  CourseStatus,
  CourseLevel,
  DaysOfWeek
} from '@/lib/types/course';