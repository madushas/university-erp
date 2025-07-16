export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface Course {
  id: number
  code: string
  title: string
  description: string
  credits: number
  maxStudents: number
  enrolledStudents: number
  instructor: string
  schedule: string
  createdAt: string
  updatedAt: string
}

export interface Registration {
  id: number
  user: User  // Changed from 'student' to 'user' to match backend
  course: Course
  registrationDate: string
  status: RegistrationStatus
  grade?: string
  createdAt: string
  updatedAt: string
}

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export enum RegistrationStatus {
  ENROLLED = 'ENROLLED',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED'
}

// API Request/Response Types
export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  user: User
}

export interface CourseCreateRequest {
  code: string
  title: string
  description: string
  credits: number
  maxStudents: number
  instructor: string
  schedule: string
}

export interface RegistrationCreateRequest {
  courseId: number
}

export interface GradeUpdateRequest {
  grade: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

// Form Types
export interface LoginFormData {
  username: string
  password: string
}

export interface RegisterFormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
}

export interface CourseFormData {
  code: string
  title: string
  description: string
  credits: number
  maxStudents: number
  instructor: string
  schedule: string
}

// Analytics Types
export interface DashboardAnalytics {
  totalCourses: number
  totalStudents: number
  totalRegistrations: number
  completedCourses: number
  activeRegistrations: number
  pendingRegistrations: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: number
  type: 'COURSE_CREATED' | 'STUDENT_ENROLLED' | 'COURSE_COMPLETED' | 'COURSE_DROPPED'
  description: string
  timestamp: string
  user?: string
  course?: string
}

export interface CourseAnalytics {
  courseId: number
  courseName: string
  totalEnrolled: number
  maxCapacity: number
  completionRate: number
  averageGrade: string
  enrollmentTrend: EnrollmentTrendItem[]
}

export interface EnrollmentTrendItem {
  date: string
  enrolled: number
  completed: number
  dropped: number
}
