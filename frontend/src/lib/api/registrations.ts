import apiClient from './client';
import { RegistrationDto } from '@/lib/types/registration';

export const getMyRegistrations = async (): Promise<RegistrationDto[]> => {
  const response = await apiClient.get<RegistrationDto[]>('/api/v1/registrations/my');
  return response.data;
};

export const getCourseRegistrations = async (courseId: number): Promise<RegistrationDto[]> => {
  const response = await apiClient.get<RegistrationDto[]>(`/api/v1/registrations/course/${courseId}`);
  return response.data;
};

// Simple RegistrationService class for compatibility
export class RegistrationService {
  static async getMyRegistrations(): Promise<RegistrationDto[]> {
    return getMyRegistrations();
  }

  static async getCourseRegistrations(courseId: number): Promise<RegistrationDto[]> {
    return getCourseRegistrations(courseId);
  }

  static async getRegistrationById(id: number): Promise<RegistrationDto | null> {
    try {
      const response = await apiClient.get<RegistrationDto>(`/api/v1/registrations/${id}`);
      return response.data;
    } catch {
      return null;
    }
  }

  static async enrollInCourse(courseId: number): Promise<RegistrationDto | null> {
    try {
      const response = await apiClient.post<RegistrationDto>('/api/v1/registrations/enroll/' + courseId);
      return response.data;
    } catch {
      return null;
    }
  }

  static async updateRegistrationStatus(id: number, status: string): Promise<RegistrationDto | null> {
    try {
      const response = await apiClient.put<RegistrationDto>(`/api/v1/registrations/${id}/status`, { status });
      return response.data;
    } catch {
      return null;
    }
  }

  static async updateRegistrationGrade(id: number, grade: string): Promise<RegistrationDto | null> {
    try {
      const response = await apiClient.put<RegistrationDto>(`/api/v1/registrations/${id}/grade`, { grade });
      return response.data;
    } catch {
      return null;
    }
  }

  static async getUserRegistrations(userId: number): Promise<RegistrationDto[]> {
    try {
      const response = await apiClient.get<RegistrationDto[]>(`/api/v1/registrations/user/${userId}`);
      return response.data;
    } catch {
      return [];
    }
  }

  static async dropCourse(registrationId: number): Promise<boolean> {
    try {
      await apiClient.delete(`/api/v1/registrations/${registrationId}`);
      return true;
    } catch {
      return false;
    }
  }

  static async validateEnrollment(courseId: number): Promise<unknown> {
    try {
      const response = await apiClient.get(`/api/v1/registrations/validate/${courseId}`);
      return response.data;
    } catch {
      return null;
    }
  }

  static async getRegistrationStatistics(): Promise<unknown> {
    try {
      const response = await apiClient.get('/api/v1/registrations/statistics');
      return response.data;
    } catch {
      return null;
    }
  }

  static async getStudentAcademicRecord(studentId: number): Promise<unknown> {
    try {
      const response = await apiClient.get(`/api/v1/registrations/academic-record/${studentId}`);
      return response.data;
    } catch {
      return null;
    }
  }

  static async getCourseEnrollmentSummary(courseId: number): Promise<unknown> {
    try {
      const response = await apiClient.get(`/api/v1/registrations/enrollment-summary/${courseId}`);
      return response.data;
    } catch {
      return null;
    }
  }
}