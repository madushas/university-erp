// Course Registration Components
export { AvailableCoursesDisplay } from './AvailableCoursesDisplay';
export { RegistrationForm } from './RegistrationForm';
export { RegistrationConfirmation } from './RegistrationConfirmation';
export { CourseRegistrationInterface } from './CourseRegistrationInterface';

// Student Registration Dashboard Components
export { StudentRegistrationDashboard } from './StudentRegistrationDashboard';
export { CurrentRegistrationsDisplay } from './CurrentRegistrationsDisplay';
export { RegistrationHistory } from './RegistrationHistory';

// Re-export types for convenience
export type {
  RegistrationDto,
  RegistrationRequest,
  RegistrationSearchParams,
  RegistrationWithDetails,
  RegistrationStatistics,
  StudentAcademicRecord,
  GradeUpdateRequest,
  StatusUpdateRequest,
  EnrollmentValidation,
  CourseEnrollmentSummary,
  StudentEnrollmentHistory,
  RegistrationFormData,
  BulkRegistrationRequest,
  RegistrationAnalytics,
  RegistrationPermissions,
  RegistrationNotificationPreferences,
  RegistrationExportOptions,
} from '@/lib/types/registration';