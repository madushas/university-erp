import apiClient from './client';
import { API_ROUTES } from '@/lib/utils/constants';

// Types from schema
type CreateCourseRequest = Record<string, unknown>;
type CreateUserRequest = Record<string, unknown>;
type CreateDepartmentRequest = Record<string, unknown>;
type PaymentRequest = Record<string, unknown>;

// Course API
export const courseApi = {
  getAllCourses: async (page = 0, size = 10) => {
    const response = await apiClient.get(`${API_ROUTES.COURSES}?page=${page}&size=${size}`);
    return response.data;
  },

  getCourseById: async (id: number) => {
    const response = await apiClient.get(`${API_ROUTES.COURSES}/${id}`);
    return response.data;
  },

  createCourse: async (courseData: CreateCourseRequest) => {
    const response = await apiClient.post(API_ROUTES.COURSES, courseData);
    return response.data;
  },

  updateCourse: async (id: number, courseData: Partial<CreateCourseRequest>) => {
    const response = await apiClient.put(`${API_ROUTES.COURSES}/${id}`, courseData);
    return response.data;
  },

  deleteCourse: async (id: number) => {
    await apiClient.delete(`${API_ROUTES.COURSES}/${id}`);
  },
};

// Registration API
export const registrationApi = {
  getMyRegistrations: async (page = 0, size = 10) => {
    const response = await apiClient.get(`${API_ROUTES.REGISTRATIONS}/my?page=${page}&size=${size}`);
    return response.data;
  },

  getAllRegistrations: async (page = 0, size = 10) => {
    const response = await apiClient.get(`${API_ROUTES.REGISTRATIONS}?page=${page}&size=${size}`);
    return response.data;
  },

  registerForCourse: async (courseId: number) => {
    const response = await apiClient.post(API_ROUTES.REGISTRATIONS, { courseId });
    return response.data;
  },

  updateRegistration: async (id: number, status: string) => {
    const response = await apiClient.put(`${API_ROUTES.REGISTRATIONS}/${id}`, { status });
    return response.data;
  },

  dropCourse: async (id: number) => {
    await apiClient.delete(`${API_ROUTES.REGISTRATIONS}/${id}`);
  },
};

// Admin API
export const adminApi = {
  getAllUsers: async (page = 0, size = 20, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(search && { search }),
    });
    const response = await apiClient.get(`${API_ROUTES.ADMIN}/users?${params}`);
    return response.data;
  },

  getUserById: async (id: number) => {
    const response = await apiClient.get(`${API_ROUTES.ADMIN}/users/${id}`);
    return response.data;
  },

  createUser: async (userData: CreateUserRequest) => {
    const response = await apiClient.post(`${API_ROUTES.ADMIN}/users`, userData);
    return response.data;
  },

  updateUser: async (id: number, userData: Partial<CreateUserRequest>) => {
    const response = await apiClient.put(`${API_ROUTES.ADMIN}/users/${id}`, userData);
    return response.data;
  },

  updateUserStatus: async (id: number, status: string) => {
    const response = await apiClient.patch(`${API_ROUTES.ADMIN}/users/${id}/status?status=${status}`);
    return response.data;
  },

  deleteUser: async (id: number) => {
    await apiClient.delete(`${API_ROUTES.ADMIN}/users/${id}`);
  },

  // Department management
  getAllDepartments: async () => {
    const response = await apiClient.get(`${API_ROUTES.ADMIN}/departments`);
    return response.data;
  },

  createDepartment: async (departmentData: CreateDepartmentRequest) => {
    const response = await apiClient.post(`${API_ROUTES.ADMIN}/departments`, departmentData);
    return response.data;
  },

  updateDepartment: async (id: number, departmentData: Partial<CreateDepartmentRequest>) => {
    const response = await apiClient.put(`${API_ROUTES.ADMIN}/departments/${id}`, departmentData);
    return response.data;
  },

  deleteDepartment: async (id: number) => {
    await apiClient.delete(`${API_ROUTES.ADMIN}/departments/${id}`);
  },

  // Reports
  getFinancialReport: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiClient.get(`${API_ROUTES.ADMIN}/reports/financial?${params}`);
    return response.data;
  },

  getAcademicReport: async () => {
    const response = await apiClient.get(`${API_ROUTES.ADMIN}/reports/academic`);
    return response.data;
  },
};

// Analytics API  
export const analyticsApi = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  },

  getCourseEnrollmentStats: async (timeRange?: string) => {
    const params = timeRange ? `?timeRange=${timeRange}` : '';
    const response = await apiClient.get(`/analytics/course-enrollment${params}`);
    return response.data;
  },

  getStudentPerformanceStats: async (courseId?: number) => {
    const params = courseId ? `?courseId=${courseId}` : '';
    const response = await apiClient.get(`/analytics/student-performance${params}`);
    return response.data;
  },
};

// Financial API
export const financialApi = {
  getStudentAccount: async () => {
    const response = await apiClient.get('/financial/student-account');
    return response.data;
  },

  getBillingStatements: async (page = 0, size = 10) => {
    const response = await apiClient.get(`/financial/billing-statements?page=${page}&size=${size}`);
    return response.data;
  },

  makePayment: async (paymentData: PaymentRequest) => {
    const response = await apiClient.post('/financial/payments', paymentData);
    return response.data;
  },

  getPaymentHistory: async (page = 0, size = 10) => {
    const response = await apiClient.get(`/financial/payments?page=${page}&size=${size}`);
    return response.data;
  },
};
