import type { components } from '@/lib/api/schema';

// Registration types from the API schema
export type RegistrationDto = components['schemas']['RegistrationDto'];

// Registration status enum
export type RegistrationStatus = 
  | 'ENROLLED' 
  | 'COMPLETED' 
  | 'DROPPED' 
  | 'PENDING' 
  | 'WITHDRAWN' 
  | 'FAILED' 
  | 'TRANSFERRED';

// Payment status enum
export type PaymentStatus = 
  | 'PENDING' 
  | 'PAID' 
  | 'PARTIAL' 
  | 'OVERDUE' 
  | 'REFUNDED' 
  | 'CANCELLED';

// Registration request for enrollment
export interface RegistrationRequest {
  courseId: number;
  userId?: number; // Optional for admin enrollment
  notes?: string;
}

// Registration search and filter parameters
export interface RegistrationSearchParams {
  userId?: number;
  courseId?: number;
  status?: RegistrationStatus;
  paymentStatus?: PaymentStatus;
  semester?: string;
  academicYear?: string;
  page?: number;
  size?: number;
  sortBy?: 'registrationDate' | 'grade' | 'status' | 'courseName' | 'studentName';
  sortDirection?: 'asc' | 'desc';
}

// Enhanced registration with computed fields
export interface RegistrationWithDetails extends RegistrationDto {
  courseName: string;
  courseCode: string;
  studentName: string;
  studentId: string;
  canDrop: boolean;
  canUpdateGrade: boolean;
  enrollmentDuration?: number; // days enrolled
}

// Registration statistics
export interface RegistrationStatistics {
  totalRegistrations: number;
  activeRegistrations: number;
  completedRegistrations: number;
  droppedRegistrations: number;
  averageGrade: number;
  completionRate: number;
  dropoutRate: number;
}

// Student academic record
export interface StudentAcademicRecord {
  studentId: number;
  studentName: string;
  studentNumber: string;
  totalCredits: number;
  completedCredits: number;
  gpa: number;
  academicStanding: string;
  registrations: RegistrationWithDetails[];
  semesterGPAs: Array<{
    semester: string;
    year: string;
    gpa: number;
    credits: number;
  }>;
}

// Grade update request
export interface GradeUpdateRequest {
  registrationId: number;
  grade: string;
  gradePoints?: number;
  notes?: string;
}

// Status update request
export interface StatusUpdateRequest {
  registrationId: number;
  status: RegistrationStatus;
  reason?: string;
  effectiveDate?: string;
}

// Enrollment validation result
export interface EnrollmentValidation {
  canEnroll: boolean;
  reasons: string[];
  warnings: string[];
  prerequisites: Array<{
    courseCode: string;
    courseName: string;
    completed: boolean;
    grade?: string;
  }>;
  conflicts: Array<{
    type: 'schedule' | 'capacity' | 'prerequisite' | 'duplicate';
    message: string;
    courseCode?: string;
  }>;
}

// Course enrollment summary
export interface CourseEnrollmentSummary {
  courseId: number;
  courseCode: string;
  courseName: string;
  instructor: string;
  maxStudents: number;
  enrolledCount: number;
  waitlistCount: number;
  availableSpots: number;
  enrollmentPercentage: number;
  registrations: RegistrationWithDetails[];
}

// Student enrollment history
export interface StudentEnrollmentHistory {
  studentId: number;
  totalCourses: number;
  completedCourses: number;
  currentEnrollments: number;
  cumulativeGPA: number;
  totalCredits: number;
  academicStanding: string;
  enrollmentsByStatus: Record<RegistrationStatus, number>;
  recentRegistrations: RegistrationWithDetails[];
}

// Registration form data
export interface RegistrationFormData {
  courseId: number;
  notes?: string;
  acknowledgements: {
    prerequisitesReviewed: boolean;
    scheduleConflictAware: boolean;
    paymentTermsAccepted: boolean;
    withdrawalPolicyUnderstood: boolean;
  };
}

// Bulk registration request (for admin)
export interface BulkRegistrationRequest {
  courseId: number;
  studentIds: number[];
  notes?: string;
  overrideValidation?: boolean;
}

// Registration analytics
export interface RegistrationAnalytics {
  enrollmentTrends: Array<{
    period: string;
    enrollments: number;
    completions: number;
    drops: number;
  }>;
  popularCourses: Array<{
    courseId: number;
    courseCode: string;
    courseName: string;
    enrollmentCount: number;
    completionRate: number;
  }>;
  studentPerformance: {
    averageGPA: number;
    gradeDistribution: Record<string, number>;
    completionRate: number;
    retentionRate: number;
  };
  departmentStats: Array<{
    department: string;
    totalEnrollments: number;
    averageGPA: number;
    completionRate: number;
  }>;
}

// Registration permissions
export interface RegistrationPermissions {
  canEnroll: boolean;
  canDrop: boolean;
  canViewGrades: boolean;
  canUpdateGrades: boolean;
  canManageRegistrations: boolean;
  canViewAnalytics: boolean;
  canBulkEnroll: boolean;
  canOverrideValidation: boolean;
}

// Registration notification preferences
export interface RegistrationNotificationPreferences {
  enrollmentConfirmation: boolean;
  gradeUpdates: boolean;
  statusChanges: boolean;
  paymentReminders: boolean;
  courseUpdates: boolean;
  deadlineReminders: boolean;
}

// Registration export options
export interface RegistrationExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeFields: string[];
  filters: RegistrationSearchParams;
  groupBy?: 'course' | 'student' | 'semester' | 'department';
}