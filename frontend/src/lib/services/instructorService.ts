import { api } from '@/lib/api/generated';

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

  /**
   * Get all active instructors for course assignment
   */
  static async getAllActiveInstructors(): Promise<InstructorDto[]> {
    try {
      const res = await api.instructors.getAll();
      return (res.data as unknown as InstructorDto[]) ?? [];
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
      const res = await api.instructors.getById(id);
      if (!res.data) throw new Error('Instructor not found');
      return res.data as unknown as InstructorDto;
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
      const res = await api.instructors.search(name);
      return (res.data as unknown as InstructorDto[]) ?? [];
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
