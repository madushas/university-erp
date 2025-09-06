import { env } from '@/config/env';
import { secureStorage } from '@/lib/utils/secureStorage';
import { AUTH_ROUTES } from '@/lib/utils/constants';

export interface InstructorDto {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  employeeId?: string;
}

export class InstructorService {
  private static async request<T>(path: string, query?: Record<string, string>): Promise<T> {
    const base = env.API_URL;
    const url = new URL(path, base);
    if (query) {
      Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const token = secureStorage.getAccessToken();
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });

    if (res.status === 401) {
      // Clear auth and redirect to login
      secureStorage.clearAuthData();
      if (typeof window !== 'undefined') {
        window.location.href = AUTH_ROUTES.LOGIN;
      }
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed with status ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  /**
   * Get all active instructors for course assignment
   */
  static async getAllActiveInstructors(): Promise<InstructorDto[]> {
    try {
      return await this.request<InstructorDto[]>('/api/v1/instructors');
    } catch (error) {
      console.error('Error fetching instructors:', error);
      throw error;
    }
  }

  /**
   * Get instructor by ID
   */
  static async getInstructorById(id: number): Promise<InstructorDto> {
    try {
      return await this.request<InstructorDto>(`/api/v1/instructors/${id}`);
    } catch (error) {
      console.error(`Error fetching instructor with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search instructors by name
   */
  static async searchInstructors(name: string): Promise<InstructorDto[]> {
    try {
      return await this.request<InstructorDto[]>('/api/v1/instructors/search', { name });
    } catch (error) {
      console.error(`Error searching instructors with name ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get instructor's full name
   */
  static getFullName(instructor: InstructorDto): string {
    return `${instructor.firstName} ${instructor.lastName}`;
  }

  /**
   * Format instructor for display in dropdown
   */
  static formatForDisplay(instructor: InstructorDto): string {
    const fullName = this.getFullName(instructor);
    return instructor.department 
      ? `${fullName} (${instructor.department})`
      : fullName;
  }
}
