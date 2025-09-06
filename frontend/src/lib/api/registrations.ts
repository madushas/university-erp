import apiClient from './client';
import { api } from './generated';
import { RegistrationDto, RegistrationStatus } from '@/lib/types/registration';

export const getMyRegistrations = async (): Promise<RegistrationDto[]> => {
  const res = await api.registrations.getAll();
  return (res.data as unknown as RegistrationDto[]) || [];
};

export const getCourseRegistrations = async (courseId: number): Promise<RegistrationDto[]> => {
  const res = await api.registrations.getByCourse(courseId);
  return (res.data as unknown as RegistrationDto[]) || [];
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
      const res = await api.registrations.getById(id);
      return (res.data as unknown as RegistrationDto) ?? null;
    } catch {
      return null;
    }
  }

  static async enrollInCourse(courseId: number): Promise<RegistrationDto | null> {
    try {
      const res = await api.registrations.enroll(courseId);
      return (res.data as unknown as RegistrationDto) ?? null;
    } catch {
      return null;
    }
  }

  static async updateRegistrationStatus(id: number, status: RegistrationStatus): Promise<RegistrationDto | null> {
    try {
      const res = await api.registrations.updateStatus(id, status);
      return (res.data as unknown as RegistrationDto) ?? null;
    } catch {
      return null;
    }
  }

  static async updateRegistrationGrade(id: number, grade: string): Promise<RegistrationDto | null> {
    try {
      const res = await api.registrations.updateGrade(id, grade);
      return (res.data as unknown as RegistrationDto) ?? null;
    } catch {
      return null;
    }
  }

  static async getUserRegistrations(userId: number): Promise<RegistrationDto[]> {
    try {
      const res = await api.registrations.getByUser(userId);
      return (res.data as unknown as RegistrationDto[]) ?? [];
    } catch {
      return [];
    }
  }

  static async dropCourse(registrationId: number): Promise<boolean> {
    try {
      await api.registrations.delete(registrationId);
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