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
  name: string
  description: string
  credits: number
  capacity: number
  instructor: string
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export interface Registration {
  id: number
  student: User
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
  token: string
  refreshToken: string
  type: string
  user: User
}

export interface CourseCreateRequest {
  code: string
  name: string
  description: string
  credits: number
  capacity: number
  instructor: string
  startDate: string
  endDate: string
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
  name: string
  description: string
  credits: number
  capacity: number
  instructor: string
  startDate: string
  endDate: string
}
