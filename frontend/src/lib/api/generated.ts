import createClient from 'openapi-fetch';
import type { paths } from './schema';
import { secureStorage } from '@/lib/utils/secureStorage';
import { env } from '@/config/env';

// Custom query serializer to handle complex objects and arrays
const customQuerySerializer = (query: Record<string, unknown>): string => {
  const params = new URLSearchParams();

  const serializeValue = (key: string, value: unknown): void => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      // Handle arrays by creating multiple query parameters
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          // For complex objects in arrays, use bracket notation
          Object.entries(item).forEach(([subKey, subValue]) => {
            serializeValue(`${key}[${index}][${subKey}]`, subValue);
          });
        } else {
          // For simple arrays, use repeated parameters
          params.append(key, String(item));
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      // Handle nested objects with dot notation
      Object.entries(value).forEach(([subKey, subValue]) => {
        serializeValue(`${key}.${subKey}`, subValue);
      });
    } else {
      // Handle primitive values
      params.append(key, String(value));
    }
  };

  Object.entries(query).forEach(([key, value]) => {
    serializeValue(key, value);
  });

  return params.toString();
};

// Create the main API client with authentication
export const apiClient = createClient<paths>({
  baseUrl: env.API_URL,
  querySerializer: customQuerySerializer,
});

// Add request interceptor for authentication
apiClient.use({
  onRequest({ request }) {
    const token = secureStorage.getAccessToken();
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    return request;
  },
  
  async onResponse({ response, request }) {
    // Handle 401 responses
    if (response.status === 401) {
      // Try to refresh token
      try {
        const refreshToken = secureStorage.getRefreshToken();
        if (refreshToken) {
          const { data: authResponse } = await publicApiClient.POST('/api/v1/auth/refresh', {
            body: { refreshToken }
          });
          
          if (authResponse) {
            secureStorage.setAuthData(authResponse);
            // Retry the original request
            const newToken = authResponse.accessToken;
            request.headers.set('Authorization', `Bearer ${newToken}`);
            return fetch(request);
          }
        }
      } catch {
        // Refresh failed, clear auth data and redirect to login
        secureStorage.clearAuthData();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return response;
  }
});

// Create a public client for authentication endpoints (no auth required)
export const publicApiClient = createClient<paths>({
  baseUrl: env.API_URL,
  querySerializer: customQuerySerializer,
});

// Export typed API methods for easier usage
export const api = {
  // Authentication
  auth: {
    login: (body: paths['/api/v1/auth/login']['post']['requestBody']['content']['application/json']) =>
      publicApiClient.POST('/api/v1/auth/login', { body }),
      
    register: (body: paths['/api/v1/auth/register']['post']['requestBody']['content']['application/json']) =>
      publicApiClient.POST('/api/v1/auth/register', { body }),
      
    refresh: (body: paths['/api/v1/auth/refresh']['post']['requestBody']['content']['application/json']) =>
      publicApiClient.POST('/api/v1/auth/refresh', { body }),
      
    getCurrentUser: () =>
      apiClient.GET('/api/v1/users/me'),
  },

  // Courses
  courses: {
    getAll: () =>
      apiClient.GET('/api/v1/courses'),
      
    getPaged: (params: paths['/api/v1/courses/paged']['get']['parameters']['query']) =>
      apiClient.GET('/api/v1/courses/paged', { params: { query: params } }),
      
    getById: (id: number) =>
      apiClient.GET('/api/v1/courses/{id}', { params: { path: { id } } }),
      
    getByCode: (code: string) =>
      apiClient.GET('/api/v1/courses/code/{code}', { params: { path: { code } } }),
      
    getByInstructor: (instructor: string) =>
      apiClient.GET('/api/v1/courses/instructor/{instructor}', { params: { path: { instructor } } }),
      
    getAvailable: () =>
      apiClient.GET('/api/v1/courses/available'),
      
    search: (title: string) =>
      apiClient.GET('/api/v1/courses/search', { params: { query: { title } } }),
      
    create: (body: paths['/api/v1/courses']['post']['requestBody']['content']['application/json']) =>
      apiClient.POST('/api/v1/courses', { body }),
      
    update: (id: number, body: paths['/api/v1/courses/{id}']['put']['requestBody']['content']['application/json']) =>
      apiClient.PUT('/api/v1/courses/{id}', { params: { path: { id } }, body }),
      
    delete: (id: number) =>
      apiClient.DELETE('/api/v1/courses/{id}', { params: { path: { id } } }),
  },

  // Registrations
  registrations: {
    getAll: () =>
      apiClient.GET('/api/v1/registrations/my'),
      
    getById: (id: number) =>
      apiClient.GET('/api/v1/registrations/{id}', { params: { path: { id } } }),
      
    getByUser: (userId: number) =>
      apiClient.GET('/api/v1/registrations/user/{userId}', { params: { path: { userId } } }),
      
    getByCourse: (courseId: number) =>
      apiClient.GET('/api/v1/registrations/course/{courseId}', { params: { path: { courseId } } }),
      
    getByStatus: (status: "ENROLLED" | "COMPLETED" | "DROPPED" | "PENDING" | "WITHDRAWN" | "FAILED" | "TRANSFERRED") =>
      apiClient.GET('/api/v1/registrations/status/{status}', { params: { path: { status } } }),
      
    register: (body: paths['/api/v1/registrations']['post']['requestBody']['content']['application/json']) =>
      apiClient.POST('/api/v1/registrations', { body }),
      
    enroll: (courseId: number) =>
      apiClient.POST('/api/v1/registrations/enroll/{courseId}', { params: { path: { courseId } } }),
      
    updateStatus: (id: number, status: "ENROLLED" | "COMPLETED" | "DROPPED" | "PENDING" | "WITHDRAWN" | "FAILED" | "TRANSFERRED") =>
      apiClient.PUT('/api/v1/registrations/{id}/status', { 
        params: { path: { id }, query: { status } }
      }),
      
    updateGrade: (id: number, grade: string) =>
      apiClient.PUT('/api/v1/registrations/{id}/grade', { 
        params: { path: { id }, query: { grade } }
      }),
      
    drop: (courseId: number) =>
      apiClient.DELETE('/api/v1/registrations/drop/{courseId}', { params: { path: { courseId } } }),
      
    delete: (id: number) =>
      apiClient.DELETE('/api/v1/registrations/{id}', { params: { path: { id } } }),
  },

  // Analytics
  analytics: {
    getDashboard: () =>
      apiClient.GET('/api/v1/analytics/dashboard'),
      
    getCourse: (courseId: number) =>
      apiClient.GET('/api/v1/analytics/course/{courseId}', { params: { path: { courseId } } }),
      
    getDepartment: (departmentCode: string) =>
      apiClient.GET('/api/v1/analytics/department/{departmentCode}', { params: { path: { departmentCode } } }),
      
    getStudent: (studentId: number) =>
      apiClient.GET('/api/v1/analytics/student/{studentId}', { params: { path: { studentId } } }),
      
    getFinancial: () =>
      apiClient.GET('/api/v1/analytics/financial'),
      
    getRecentActivity: () =>
      apiClient.GET('/api/v1/analytics/recent-activity'),
  },

  // Admin
  admin: {
    users: {
      getAll: (params?: paths['/api/v1/admin/users']['get']['parameters']['query']) =>
        apiClient.GET('/api/v1/admin/users', { params: { query: params } }),
        
      getById: (id: number) =>
        apiClient.GET('/api/v1/admin/users/{id}', { params: { path: { id } } }),
        
      create: (body: paths['/api/v1/admin/users']['post']['requestBody']['content']['application/json']) =>
        apiClient.POST('/api/v1/admin/users', { body }),
        
      update: (id: number, body: paths['/api/v1/admin/users/{id}']['put']['requestBody']['content']['application/json']) =>
        apiClient.PUT('/api/v1/admin/users/{id}', { params: { path: { id } }, body }),
        
      updateStatus: (id: number, status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "GRADUATED" | "PENDING_APPROVAL") =>
        apiClient.PATCH('/api/v1/admin/users/{id}/status', { 
          params: { path: { id }, query: { status } }
        }),
        
      delete: (id: number) =>
        apiClient.DELETE('/api/v1/admin/users/{id}', { params: { path: { id } } }),
    },

    departments: {
      getAll: () =>
        apiClient.GET('/api/v1/admin/departments'),
        
      create: (body: paths['/api/v1/admin/departments']['post']['requestBody']['content']['application/json']) =>
        apiClient.POST('/api/v1/admin/departments', { body }),
        
      update: (id: number, body: paths['/api/v1/admin/departments/{id}']['put']['requestBody']['content']['application/json']) =>
        apiClient.PUT('/api/v1/admin/departments/{id}', { params: { path: { id } }, body }),
        
      delete: (id: number) =>
        apiClient.DELETE('/api/v1/admin/departments/{id}', { params: { path: { id } } }),
    },

    registrations: {
      getAll: () =>
        apiClient.GET('/api/v1/admin/registrations'),
        
      updateStatus: (id: number, status: "ENROLLED" | "COMPLETED" | "DROPPED" | "PENDING" | "WITHDRAWN" | "FAILED" | "TRANSFERRED") =>
        apiClient.PATCH('/api/v1/admin/registrations/{id}/status', { 
          params: { path: { id }, query: { status } }
        }),
        
      updateGrade: (id: number, grade: string) =>
        apiClient.PATCH('/api/v1/admin/registrations/{id}/grade', { 
          params: { path: { id }, query: { grade } }
        }),
        
      unenroll: (id: number) =>
        apiClient.DELETE('/api/v1/admin/registrations/{id}', { params: { path: { id } } }),
    },
    
    financial: {
      getAllAccounts: () =>
        apiClient.GET('/api/v1/admin/financial/accounts'),
        
      createAccount: (body: paths['/api/v1/admin/financial/accounts']['post']['requestBody']['content']['application/json']) =>
        apiClient.POST('/api/v1/admin/financial/accounts', { body }),
        
      getAccount: (id: number) =>
        apiClient.GET('/api/v1/admin/financial/accounts/{id}', { params: { path: { id } } }),
        
      updateAccountStatus: (id: number, status: "ACTIVE" | "SUSPENDED" | "CLOSED" | "HOLD") =>
        apiClient.PATCH('/api/v1/admin/financial/accounts/{id}/status', { 
          params: { path: { id }, query: { status } }
        }),
        
      getAllBillingStatements: (params?: paths['/api/v1/admin/financial/billing-statements']['get']['parameters']['query']) =>
        apiClient.GET('/api/v1/admin/financial/billing-statements', { params: { query: params } }),
        
      generateBillingStatement: (body: paths['/api/v1/admin/financial/billing-statements/generate']['post']['requestBody']['content']['application/json']) =>
        apiClient.POST('/api/v1/admin/financial/billing-statements/generate', { body }),
        
      getBillingStatement: (id: number) =>
        apiClient.GET('/api/v1/financial/billing-statements/{id}', { params: { path: { id } } }),
        
      updateBillingStatementStatus: (id: number, body: paths['/api/v1/admin/financial/billing-statements/{id}/status']['put']['requestBody']['content']['application/json']) =>
        apiClient.PUT('/api/v1/admin/financial/billing-statements/{id}/status', { params: { path: { id } }, body }),
        
      addLineItem: (id: number, body: paths['/api/v1/admin/financial/billing-statements/{id}/line-items']['post']['requestBody']['content']['application/json']) =>
        apiClient.POST('/api/v1/admin/financial/billing-statements/{id}/line-items', { params: { path: { id } }, body }),
        
      getAllFeeStructures: () =>
        apiClient.GET('/api/v1/admin/financial/fee-structures'),
        
      createFeeStructure: (body: paths['/api/v1/admin/financial/fee-structures']['post']['requestBody']['content']['application/json']) =>
        apiClient.POST('/api/v1/admin/financial/fee-structures', { body }),
        
      getFeeStructure: (id: number) =>
        apiClient.GET('/api/v1/admin/financial/fee-structures/{id}', { params: { path: { id } } }),
        
      updateFeeStructure: (id: number, body: paths['/api/v1/admin/financial/fee-structures/{id}']['put']['requestBody']['content']['application/json']) =>
        apiClient.PUT('/api/v1/admin/financial/fee-structures/{id}', { params: { path: { id } }, body }),
    },

    reports: {
      getAcademic: () =>
        apiClient.GET('/api/v1/admin/reports/academic'),
        
      getFinancial: () =>
        apiClient.GET('/api/v1/admin/reports/financial'),
    },
  },

  // Student specific
  student: {
    applications: {
      getAll: (params: paths['/api/v1/student/applications']['get']['parameters']['query']) =>
        apiClient.GET('/api/v1/student/applications', { params: { query: params } }),
        
      getById: (id: number) =>
        apiClient.GET('/api/v1/student/applications/{id}', { params: { path: { id } } }),
        
      getByStudent: (studentId: number) =>
        apiClient.GET('/api/v1/student/applications/student/{studentId}', { params: { path: { studentId } } }),
        
      create: (body: paths['/api/v1/student/applications']['post']['requestBody']['content']['application/json']) =>
        apiClient.POST('/api/v1/student/applications', { body }),
        
      submit: (id: number) =>
        apiClient.POST('/api/v1/student/applications/{id}/submit', { params: { path: { id } } }),
        
      updateStatus: (id: number, status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | "WAITLISTED" | "WITHDRAWN" | "EXPIRED", reason?: string) =>
        apiClient.PATCH('/api/v1/student/applications/{id}/status', { 
          params: { path: { id }, query: { status, ...(reason && { reason }) } }
        }),
    },

    transcripts: {
      getById: (id: number) =>
        apiClient.GET('/api/v1/student/transcripts/{id}', { params: { path: { id } } }),
        
      getByStudent: (studentId: number) =>
        apiClient.GET('/api/v1/student/transcripts/student/{studentId}', { params: { path: { studentId } } }),
        
      generate: (studentId: number, transcriptType: string) =>
        apiClient.POST('/api/v1/student/transcripts/generate', { 
          params: { query: { studentId, transcriptType } }
        }),

      requests: {
        getById: (id: number) =>
          apiClient.GET('/api/v1/student/transcripts/requests/{id}', { params: { path: { id } } }),
          
        getByStudent: (studentId: number) =>
          apiClient.GET('/api/v1/student/transcripts/requests/student/{studentId}', { params: { path: { studentId } } }),
          
        getPending: (params: paths['/api/v1/student/transcripts/requests/pending']['get']['parameters']['query']) =>
          apiClient.GET('/api/v1/student/transcripts/requests/pending', { params: { query: params } }),
          
        create: (body: paths['/api/v1/student/transcripts/request']['post']['requestBody']['content']['application/json']) =>
          apiClient.POST('/api/v1/student/transcripts/request', { body }),
          
        updateStatus: (id: number, status: string) =>
          apiClient.PATCH('/api/v1/student/transcripts/requests/{id}/status', { 
            params: { path: { id }, query: { status } }
          }),
          
        process: (id: number) =>
          apiClient.PATCH('/api/v1/student/transcripts/requests/{id}/process', { params: { path: { id } } }),
          
        cancel: (id: number) =>
          apiClient.PATCH('/api/v1/student/transcripts/requests/{id}/cancel', { params: { path: { id } } }),
      },
    },

    academicRecords: {
      getById: (id: number) =>
        apiClient.GET('/api/v1/student/academic-records/{id}', { params: { path: { id } } }),
        
      getByStudent: (studentId: number) =>
        apiClient.GET('/api/v1/student/academic-records/student/{studentId}', { params: { path: { studentId } } }),
        
      getCurrent: (studentId: number) =>
        apiClient.GET('/api/v1/student/academic-records/student/{studentId}/current', { params: { path: { studentId } } }),
        
      getGpaHistory: (studentId: number) =>
        apiClient.GET('/api/v1/student/academic-records/student/{studentId}/gpa-history', { params: { path: { studentId } } }),
        
      getDegreeProgress: (studentId: number) =>
        apiClient.GET('/api/v1/student/academic-records/student/{studentId}/degree-progress', { params: { path: { studentId } } }),
        
      create: (body: paths['/api/v1/student/academic-records']['post']['requestBody']['content']['application/json']) =>
        apiClient.POST('/api/v1/student/academic-records', { body }),
        
      update: (id: number, body: paths['/api/v1/student/academic-records/{id}']['put']['requestBody']['content']['application/json']) =>
        apiClient.PUT('/api/v1/student/academic-records/{id}', { params: { path: { id } }, body }),
        
      updateProgress: (id: number, newGpa: number, newCredits: number) =>
        apiClient.PATCH('/api/v1/student/academic-records/{id}/progress', { 
          params: { path: { id }, query: { newGpa, newCredits } }
        }),
        
      markGraduated: (id: number, graduationDate: string) =>
        apiClient.PATCH('/api/v1/student/academic-records/{id}/graduate', { 
          params: { path: { id }, query: { graduationDate } }
        }),
    },

    degreeAudits: {
      getById: (id: number) =>
        apiClient.GET('/api/v1/student/degree-audits/{id}', { params: { path: { id } } }),
        
      getByStudent: (studentId: number) =>
        apiClient.GET('/api/v1/student/degree-audits/student/{studentId}', { params: { path: { studentId } } }),
        
      getLatest: (studentId: number) =>
        apiClient.GET('/api/v1/student/degree-audits/student/{studentId}/latest', { params: { path: { studentId } } }),
        
      getProgress: (studentId: number) =>
        apiClient.GET('/api/v1/student/degree-audits/student/{studentId}/progress', { params: { path: { studentId } } }),
        
      getMissingRequirements: (studentId: number) =>
        apiClient.GET('/api/v1/student/degree-audits/student/{studentId}/missing-requirements', { params: { path: { studentId } } }),
        
      checkGraduationEligibility: (studentId: number) =>
        apiClient.GET('/api/v1/student/degree-audits/student/{studentId}/graduation-eligibility', { params: { path: { studentId } } }),
        
      generate: (studentId: number, academicProgramId: number) =>
        apiClient.POST('/api/v1/student/degree-audits/generate', { 
          params: { query: { studentId, academicProgramId } }
        }),
        
      update: (id: number, body: paths['/api/v1/student/degree-audits/{id}']['put']['requestBody']['content']['application/json']) =>
        apiClient.PUT('/api/v1/student/degree-audits/{id}', { params: { path: { id } }, body }),
        
      approve: (id: number) =>
        apiClient.PATCH('/api/v1/student/degree-audits/{id}/approve', { params: { path: { id } } }),
        
      delete: (id: number) =>
        apiClient.DELETE('/api/v1/student/degree-audits/{id}', { params: { path: { id } } }),
    },
  },

  // HR Module
  hr: {
    employees: {
      getAll: (params?: paths['/api/v1/hr/employees']['get']['parameters']['query']) =>
        apiClient.GET('/api/v1/hr/employees', { params: { query: params } }),
        
      getById: (id: number) =>
        apiClient.GET('/api/v1/hr/employees/{id}', { params: { path: { id } } }),
        
      getByNumber: (employeeNumber: string) =>
        apiClient.GET('/api/v1/hr/employees/number/{employeeNumber}', { params: { path: { employeeNumber } } }),
        
      getByDepartment: (department: string, params?: paths['/api/v1/hr/employees/department/{department}']['get']['parameters']['query']) =>
        apiClient.GET('/api/v1/hr/employees/department/{department}', { 
          params: { path: { department }, query: params } 
        }),
        
      getMyRecord: () =>
        apiClient.GET('/api/v1/hr/employees/my-record'),
        
      create: (body: paths['/api/v1/hr/employees']['post']['requestBody']['content']['application/json']) =>
        apiClient.POST('/api/v1/hr/employees', { body }),
        
      update: (id: number, body: paths['/api/v1/hr/employees/{id}']['put']['requestBody']['content']['application/json']) =>
        apiClient.PUT('/api/v1/hr/employees/{id}', { params: { path: { id } }, body }),
        
      updateStatus: (id: number, status: "ACTIVE" | "INACTIVE" | "TERMINATED" | "RETIRED") =>
        apiClient.PATCH('/api/v1/hr/employees/{id}/status', { 
          params: { path: { id }, query: { status } }
        }),
        
      delete: (id: number) =>
        apiClient.DELETE('/api/v1/hr/employees/{id}', { params: { path: { id } } }),
    },

    leaveRequests: {
      getAll: () =>
        apiClient.GET('/api/v1/hr/leave/requests'),
        
      getById: (id: number) =>
        apiClient.GET('/api/v1/hr/leave/requests/{id}', { params: { path: { id } } }),
        
      create: (body: paths['/api/v1/hr/leave/requests']['post']['requestBody']['content']['application/json']) =>
        apiClient.POST('/api/v1/hr/leave/requests', { body }),
        
      update: (id: number, body: paths['/api/v1/hr/leave/requests/{id}']['put']['requestBody']['content']['application/json']) =>
        apiClient.PUT('/api/v1/hr/leave/requests/{id}', { params: { path: { id } }, body }),
        
      approve: (id: number, body?: Record<string, string>) =>
        apiClient.PATCH('/api/v1/hr/leave/requests/{id}/approve', { 
          params: { path: { id } }, ...(body && { body }) 
        }),
        
      reject: (id: number, body: Record<string, string>) =>
        apiClient.PATCH('/api/v1/hr/leave/requests/{id}/reject', { 
          params: { path: { id } }, body 
        }),
        
      cancel: (id: number, body: Record<string, string>) =>
        apiClient.PATCH('/api/v1/hr/leave/requests/{id}/cancel', { 
          params: { path: { id } }, body 
        }),
        
      delete: (id: number) =>
        apiClient.DELETE('/api/v1/hr/leave/requests/{id}', { params: { path: { id } } }),
    },

    leaveTypes: {
      getAll: () =>
        apiClient.GET('/api/v1/hr/leave/types'),
        
      getById: (id: number) =>
        apiClient.GET('/api/v1/hr/leave/types/{id}', { params: { path: { id } } }),
        
      getByCode: (code: string) =>
        apiClient.GET('/api/v1/hr/leave/types/code/{code}', { params: { path: { code } } }),
        
      create: (body: paths['/api/v1/hr/leave/types']['post']['requestBody']['content']['application/json']) =>
        apiClient.POST('/api/v1/hr/leave/types', { body }),
        
      update: (id: number, body: paths['/api/v1/hr/leave/types/{id}']['put']['requestBody']['content']['application/json']) =>
        apiClient.PUT('/api/v1/hr/leave/types/{id}', { params: { path: { id } }, body }),
        
      updateStatus: (id: number, status: "ACTIVE" | "INACTIVE") =>
        apiClient.PATCH('/api/v1/hr/leave/types/{id}/status', { 
          params: { path: { id }, query: { status } }
        }),
        
      delete: (id: number) =>
        apiClient.DELETE('/api/v1/hr/leave/types/{id}', { params: { path: { id } } }),
    },

    dashboard: () =>
      apiClient.GET('/api/v1/hr/dashboard'),
      
    reports: {
      getLeaveUsage: (params?: paths['/api/v1/hr/reports/leave-usage']['get']['parameters']['query']) =>
        apiClient.GET('/api/v1/hr/reports/leave-usage', { params: { query: params } }),
        
      getHeadcount: (params?: paths['/api/v1/hr/reports/headcount']['get']['parameters']['query']) =>
        apiClient.GET('/api/v1/hr/reports/headcount', { params: { query: params } }),
    },
  },
} as const;

export default api;
