export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: Role
  employeeId?: string
  studentId?: string
  department?: string
  yearOfStudy?: number
  gpa?: number
  address?: string
  phoneNumber?: string
  dateOfBirth?: string
  status?: UserStatus
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
  instructorId?: number
  schedule: string
  department?: string
  prerequisites?: string[]
  fee?: number
  semester?: string
  status?: CourseStatus
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
  paymentStatus?: PaymentStatus
  attendancePercentage?: number
  createdAt: string
  updatedAt: string
}

export interface Department {
  id: number
  name: string
  code: string
  description?: string
  headOfDepartment?: string
  status?: DepartmentStatus
  createdAt: string
  updatedAt: string
}

export type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'

export enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum CourseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED'
}

export enum DepartmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum RegistrationStatus {
  ENROLLED = 'ENROLLED',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
  PENDING = 'PENDING'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
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

// Request Types
export interface CreateUserRequest {
  username: string
  email: string
  firstName: string
  lastName: string
  password: string
  role: Role
  employeeId?: string
  studentId?: string
  phoneNumber?: string
  dateOfBirth?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  department?: string
  yearOfStudy?: number
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  role?: Role
  employeeId?: string
  studentId?: string
  phoneNumber?: string
  dateOfBirth?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  department?: string
  yearOfStudy?: number
}

export interface CreateDepartmentRequest {
  name: string
  code: string
  description?: string
  headOfDepartment?: string
}
