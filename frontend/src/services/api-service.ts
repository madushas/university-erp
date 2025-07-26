import apiClient from '@/lib/api';
import {
  Course,
  Registration,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  CourseCreateRequest,
  PaginatedResponse,
  DashboardAnalytics,
  CourseAnalytics,
  User,
  Department,
  CreateUserRequest,
  UpdateUserRequest,
  CreateDepartmentRequest,
} from '@/types';

// Authentication API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', userData);
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    return apiClient.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
  },
};

// Course API
export const courseApi = {
  // Get all courses with pagination
  getCourses: async (page = 0, size = 10, sort = 'title,asc'): Promise<PaginatedResponse<Course>> => {
    return apiClient.get<PaginatedResponse<Course>>(`/courses/paged?page=${page}&size=${size}&sort=${sort}`);
  },

  // Get all courses without pagination
  getAllCourses: async (): Promise<Course[]> => {
    return apiClient.get<Course[]>('/courses');
  },

  // Get course by ID
  getCourseById: async (id: number): Promise<Course> => {
    return apiClient.get<Course>(`/courses/${id}`);
  },

  // Get course by code
  getCourseByCode: async (code: string): Promise<Course> => {
    return apiClient.get<Course>(`/courses/code/${code}`);
  },

  // Search courses by title
  searchCourses: async (title: string): Promise<Course[]> => {
    return apiClient.get<Course[]>(`/courses/search?title=${encodeURIComponent(title)}`);
  },

  // Get available courses (not full)
  getAvailableCourses: async (): Promise<Course[]> => {
    return apiClient.get<Course[]>('/courses/available');
  },

  // Get courses by instructor
  getCoursesByInstructor: async (instructor: string): Promise<Course[]> => {
    return apiClient.get<Course[]>(`/courses/instructor/${encodeURIComponent(instructor)}`);
  },

  // Create new course (admin only)
  createCourse: async (courseData: CourseCreateRequest): Promise<Course> => {
    return apiClient.post<Course>('/courses', courseData);
  },

  // Update course (admin only)
  updateCourse: async (id: number, courseData: Partial<CourseCreateRequest>): Promise<Course> => {
    return apiClient.put<Course>(`/courses/${id}`, courseData);
  },

  // Delete course (admin only)
  deleteCourse: async (id: number): Promise<void> => {
    await apiClient.delete(`/courses/${id}`);
  },
};

// Registration API
export const registrationApi = {
  // Enroll current user in course
  enrollInCourse: async (courseId: number): Promise<Registration> => {
    return apiClient.post<Registration>(`/registrations/enroll/${courseId}`);
  },

  // Admin enroll user in course
  adminEnrollUser: async (userId: number, courseId: number): Promise<Registration> => {
    return apiClient.post<Registration>(`/registrations/admin/enroll/${userId}/${courseId}`);
  },

  // Get all registrations (admin only)
  getAllRegistrations: async (page = 0, size = 50, status?: string, paymentStatus?: string): Promise<Registration[]> => {
    let url = `/admin/registrations?page=${page}&size=${size}`;
    if (status) url += `&status=${status}`;
    if (paymentStatus) url += `&paymentStatus=${paymentStatus}`;
    return apiClient.get<Registration[]>(url);
  },

  // Get my registrations
  getMyRegistrations: async (): Promise<Registration[]> => {
    return apiClient.get<Registration[]>('/registrations/my');
  },

  // Get user registrations by user ID (admin only)
  getUserRegistrations: async (userId: number): Promise<Registration[]> => {
    return apiClient.get<Registration[]>(`/registrations/user/${userId}`);
  },

  // Get course registrations (admin only)
  getCourseRegistrations: async (courseId: number): Promise<Registration[]> => {
    return apiClient.get<Registration[]>(`/registrations/course/${courseId}`);
  },

  // Get registration by ID
  getRegistrationById: async (id: number): Promise<Registration> => {
    return apiClient.get<Registration>(`/registrations/${id}`);
  },

  // Update registration grade (admin only)
  updateGrade: async (registrationId: number, grade: string): Promise<Registration> => {
    return apiClient.put<Registration>(`/registrations/${registrationId}/grade?grade=${encodeURIComponent(grade)}`);
  },

  // Update registration status (admin only)
  updateStatus: async (registrationId: number, status: string): Promise<Registration> => {
    return apiClient.put<Registration>(`/registrations/${registrationId}/status?status=${status}`);
  },

  // Get registrations by status (admin only)
  getRegistrationsByStatus: async (status: string): Promise<Registration[]> => {
    return apiClient.get<Registration[]>(`/registrations/status/${status}`);
  },

  // Drop course (student)
  dropCourse: async (courseId: number): Promise<void> => {
    await apiClient.delete(`/registrations/drop/${courseId}`);
  },

  // Delete registration (admin only)
  deleteRegistration: async (registrationId: number): Promise<void> => {
    await apiClient.delete(`/registrations/${registrationId}`);
  },

  // Update payment status (admin only)
  updatePaymentStatus: async (registrationId: number, paymentStatus: string): Promise<Registration> => {
    return apiClient.patch<Registration>(`/admin/registrations/${registrationId}/payment-status?paymentStatus=${paymentStatus}`);
  },

  // Update grade (admin only)
  updateRegistrationGrade: async (registrationId: number, grade: string): Promise<Registration> => {
    return apiClient.patch<Registration>(`/admin/registrations/${registrationId}/grade?grade=${encodeURIComponent(grade)}`);
  },

  // Confirm enrollment (admin only)
  confirmEnrollment: async (registrationId: number): Promise<Registration> => {
    return apiClient.put<Registration>(`/registrations/${registrationId}/status?status=ENROLLED`);
  },

  // Reject enrollment (admin only)
  rejectEnrollment: async (registrationId: number): Promise<Registration> => {
    return apiClient.put<Registration>(`/registrations/${registrationId}/status?status=REJECTED`);
  },
};

// Analytics API (Admin only)
export const analyticsApi = {
  // Get dashboard analytics
  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
    return apiClient.get<DashboardAnalytics>('/analytics/dashboard');
  },

  // Get course analytics
  getCourseAnalytics: async (courseId: number): Promise<CourseAnalytics> => {
    return apiClient.get<CourseAnalytics>(`/analytics/course/${courseId}`);
  },

  // Get department analytics
  getDepartmentAnalytics: async (department: string): Promise<Record<string, unknown>> => {
    return apiClient.get<Record<string, unknown>>(`/analytics/department/${department}`);
  },

  // Get student analytics
  getStudentAnalytics: async (studentId: number): Promise<Record<string, unknown>> => {
    return apiClient.get<Record<string, unknown>>(`/analytics/student/${studentId}`);
  },

  // Get recent activity analytics
  getRecentActivity: async (): Promise<Record<string, unknown>> => {
    return apiClient.get<Record<string, unknown>>('/analytics/recent-activity');
  },

  // Get financial analytics
  getFinancialAnalytics: async (): Promise<Record<string, unknown>> => {
    return apiClient.get<Record<string, unknown>>('/analytics/financial');
  },
};

// Admin API
export const adminApi = {
  // User management
  getAllUsers: async (page = 0, size = 50, sortBy = 'id', sortDir = 'asc', role?: string, status?: string): Promise<User[]> => {
    let url = `/admin/users?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
    if (role) url += `&role=${role}`;
    if (status) url += `&status=${status}`;
    return apiClient.get<User[]>(url);
  },

  createUser: async (userData: CreateUserRequest): Promise<User> => {
    return apiClient.post<User>('/admin/users', userData);
  },

  updateUser: async (userId: number, userData: UpdateUserRequest): Promise<User> => {
    return apiClient.put<User>(`/admin/users/${userId}`, userData);
  },

  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  getUserById: async (userId: number): Promise<User> => {
    return apiClient.get<User>(`/admin/users/${userId}`);
  },

  // Update user status
  updateUserStatus: async (userId: number, status: string): Promise<User> => {
    return apiClient.patch<User>(`/admin/users/${userId}/status?status=${status}`);
  },

  // Department management
  getAllDepartments: async (): Promise<Department[]> => {
    return apiClient.get<Department[]>('/admin/departments');
  },

  createDepartment: async (departmentData: CreateDepartmentRequest): Promise<Department> => {
    return apiClient.post<Department>('/admin/departments', departmentData);
  },

  updateDepartment: async (deptId: number, departmentData: Partial<CreateDepartmentRequest>): Promise<Department> => {
    return apiClient.put<Department>(`/admin/departments/${deptId}`, departmentData);
  },

  deleteDepartment: async (deptId: number): Promise<void> => {
    await apiClient.delete(`/admin/departments/${deptId}`);
  },

  getDepartmentById: async (deptId: number): Promise<Department> => {
    return apiClient.get<Department>(`/admin/departments/${deptId}`);
  },

  // Course management (admin view)
  getAdminCourses: async (page = 0, size = 50): Promise<Course[]> => {
    return apiClient.get<Course[]>(`/admin/courses?page=${page}&size=${size}`);
  },

  // Update course status
  updateCourseStatus: async (courseId: number, status: string): Promise<Course> => {
    return apiClient.patch<Course>(`/admin/courses/${courseId}/status?status=${status}`);
  },

  // Reports
  getFinancialReport: async (startDate?: string, endDate?: string): Promise<Record<string, unknown>> => {
    let url = '/admin/reports/financial';
    if (startDate || endDate) {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      url += '?' + params.toString();
    }
    return apiClient.get<Record<string, unknown>>(url);
  },

  getAcademicReport: async (): Promise<Record<string, unknown>> => {
    return apiClient.get<Record<string, unknown>>('/admin/reports/academic');
  },

  // System status
  getSystemStatus: async (): Promise<Record<string, unknown>> => {
    return apiClient.get<Record<string, unknown>>('/admin/system/status');
  },
};
