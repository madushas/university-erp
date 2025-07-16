import apiClient from './api-client'
import { 
  Course, 
  Registration, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  CourseCreateRequest,
  PaginatedResponse,
  DashboardAnalytics,
  CourseAnalytics
} from '@/types'

// Authentication API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials as unknown as Record<string, unknown>)
    return response
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData as unknown as Record<string, unknown>)
    return response
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken
    })
    return response
  }
}

// Course API
export const courseApi = {
  // Get all courses with pagination
  getCourses: async (page = 0, size = 10, sort = 'title,asc'): Promise<PaginatedResponse<Course>> => {
    const response = await apiClient.get<PaginatedResponse<Course>>('/courses/paged', {
      page,
      size,
      sort
    })
    return response
  },

  // Get all courses without pagination
  getAllCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get<Course[]>('/courses')
    return response
  },

  // Get course by ID
  getCourseById: async (id: number): Promise<Course> => {
    const response = await apiClient.get<Course>(`/courses/${id}`)
    return response
  },

  // Get course by code
  getCourseByCode: async (code: string): Promise<Course> => {
    const response = await apiClient.get<Course>(`/courses/code/${code}`)
    return response
  },

  // Search courses by title
  searchCourses: async (title: string): Promise<Course[]> => {
    const response = await apiClient.get<Course[]>('/courses/search', { title })
    return response
  },

  // Get available courses (not full)
  getAvailableCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get<Course[]>('/courses/available')
    return response
  },

  // Get courses by instructor
  getCoursesByInstructor: async (instructor: string): Promise<Course[]> => {
    const response = await apiClient.get<Course[]>(`/courses/instructor/${instructor}`)
    return response
  },

  // Create new course (admin only)
  createCourse: async (courseData: CourseCreateRequest): Promise<Course> => {
    const response = await apiClient.post<Course>('/courses', courseData as unknown as Record<string, unknown>)
    return response
  },

  // Update course (admin only)
  updateCourse: async (id: number, courseData: Partial<CourseCreateRequest>): Promise<Course> => {
    const response = await apiClient.put<Course>(`/courses/${id}`, courseData)
    return response
  },

  // Delete course (admin only)
  deleteCourse: async (id: number): Promise<void> => {
    await apiClient.delete(`/courses/${id}`)
  }
}

// Registration API
export const registrationApi = {
  // Enroll current user in course
  enrollInCourse: async (courseId: number): Promise<Registration> => {
    const response = await apiClient.post<Registration>(`/registrations/enroll/${courseId}`)
    return response
  },

  // Admin enroll user in course
  adminEnrollUser: async (userId: number, courseId: number): Promise<Registration> => {
    const response = await apiClient.post<Registration>(`/registrations/admin/enroll/${userId}/${courseId}`)
    return response
  },

  // Get my registrations
  getMyRegistrations: async (): Promise<Registration[]> => {
    const response = await apiClient.get<Registration[]>('/registrations/my')
    return response
  },

  // Get user registrations by user ID (admin only)
  getUserRegistrations: async (userId: number): Promise<Registration[]> => {
    const response = await apiClient.get<Registration[]>(`/registrations/user/${userId}`)
    return response
  },

  // Get course registrations (admin only)
  getCourseRegistrations: async (courseId: number): Promise<Registration[]> => {
    const response = await apiClient.get<Registration[]>(`/registrations/course/${courseId}`)
    return response
  },

  // Get registration by ID
  getRegistrationById: async (id: number): Promise<Registration> => {
    const response = await apiClient.get<Registration>(`/registrations/${id}`)
    return response
  },

  // Update registration grade (admin only)
  updateGrade: async (registrationId: number, grade: string): Promise<Registration> => {
    const response = await apiClient.put<Registration>(`/registrations/${registrationId}/grade?grade=${grade}`)
    return response
  },

  // Update registration status (admin only)
  updateStatus: async (registrationId: number, status: string): Promise<Registration> => {
    const response = await apiClient.put<Registration>(`/registrations/${registrationId}/status?status=${status}`)
    return response
  },

  // Get registrations by status (admin only)
  getRegistrationsByStatus: async (status: string): Promise<Registration[]> => {
    const response = await apiClient.get<Registration[]>(`/registrations/status/${status}`)
    return response
  },

  // Drop course (student)
  dropCourse: async (courseId: number): Promise<void> => {
    await apiClient.delete(`/registrations/drop/${courseId}`)
  },

  // Delete registration (admin only)
  deleteRegistration: async (registrationId: number): Promise<void> => {
    await apiClient.delete(`/registrations/${registrationId}`)
  }
}

// Analytics API (Admin only)
export const analyticsApi = {
  // Get dashboard analytics
  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
    const response = await apiClient.get<DashboardAnalytics>('/analytics/dashboard')
    return response
  },

  // Get course analytics
  getCourseAnalytics: async (courseId: number): Promise<CourseAnalytics> => {
    const response = await apiClient.get<CourseAnalytics>(`/analytics/course/${courseId}`)
    return response
  },

  // Get department analytics
  getDepartmentAnalytics: async (department: string): Promise<Record<string, unknown>> => {
    const response = await apiClient.get<Record<string, unknown>>(`/analytics/department/${department}`)
    return response
  },

  // Get student analytics
  getStudentAnalytics: async (studentId: number): Promise<Record<string, unknown>> => {
    const response = await apiClient.get<Record<string, unknown>>(`/analytics/student/${studentId}`)
    return response
  },

  // Get recent activity analytics
  getRecentActivity: async (): Promise<Record<string, unknown>> => {
    const response = await apiClient.get<Record<string, unknown>>('/analytics/recent-activity')
    return response
  },

  // Get financial analytics
  getFinancialAnalytics: async (): Promise<Record<string, unknown>> => {
    const response = await apiClient.get<Record<string, unknown>>('/analytics/financial')
    return response
  }
}

// Combined API object
export const api = {
  auth: authApi,
  courses: courseApi,
  registrations: registrationApi,
  analytics: analyticsApi
}

export default api
