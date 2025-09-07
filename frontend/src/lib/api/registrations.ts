import { api } from './generated';
import { RegistrationDto, RegistrationStatus, EnrollmentValidation, CourseEnrollmentSummary, StudentAcademicRecord, RegistrationStatistics, RegistrationWithDetails } from '@/lib/types/registration';
import { CourseDto } from '@/lib/types/course';

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

  static async dropCourse(courseId: number): Promise<boolean> {
    try {
      await api.registrations.drop(courseId);
      return true;
    } catch {
      return false;
    }
  }

  static async validateEnrollment(courseId: number): Promise<EnrollmentValidation | null> {
    try {
      // Fetch current user's registrations, course details, and current course registrations
      const [myRegsRes, courseRes, courseRegsRes] = await Promise.all([
        api.registrations.getAll(),
        api.courses.getById(courseId),
        api.registrations.getByCourse(courseId)
      ]);

      const myRegs = (myRegsRes.data as unknown as RegistrationDto[]) || [];
      const course = (courseRes.data as unknown as CourseDto) || null;
      const courseRegs = (courseRegsRes.data as unknown as RegistrationDto[]) || [];
      if (!course) {
        return {
          canEnroll: false,
          reasons: ['Course not found'],
          warnings: [],
          prerequisites: [],
          conflicts: [],
        };
      }

      const alreadyEnrolled = myRegs.some(r => r.course?.id === courseId && ['ENROLLED', 'PENDING'].includes(r.status || ''));
      const max = course.maxStudents || 0;
      const enrolledCount = courseRegs.length;
      const isFull = max > 0 && enrolledCount >= max;

      const reasons: string[] = [];
      const conflicts: EnrollmentValidation['conflicts'] = [];
      if (alreadyEnrolled) {
        reasons.push('Already enrolled in this course');
        conflicts.push({ type: 'duplicate', message: 'Already enrolled in this course', courseCode: course.code || '' });
      }
      if (isFull) {
        reasons.push('Course is at full capacity');
        conflicts.push({ type: 'capacity', message: 'Course is at full capacity', courseCode: course.code || '' });
      }
      if ((course.status || 'ACTIVE') !== 'ACTIVE') {
        reasons.push('Course is not open for enrollment');
      }

      const canEnroll = reasons.length === 0;
      const result: EnrollmentValidation = {
        canEnroll,
        reasons,
        warnings: [],
        prerequisites: [],
        conflicts,
      };

      return result;
    } catch {
      return null;
    }
  }

  static async getRegistrationStatistics(): Promise<RegistrationStatistics | null> {
    // Safe fallback: compute minimal stats from current user's registrations
    try {
      const regs = await getMyRegistrations();
      const total = regs.length;
      const count = (s: RegistrationStatus) => regs.filter(r => r.status === s).length;
      const stats: RegistrationStatistics = {
        totalRegistrations: total,
        activeRegistrations: count('ENROLLED') + count('PENDING'),
        completedRegistrations: count('COMPLETED'),
        droppedRegistrations: count('DROPPED'),
        averageGrade: 0,
        completionRate: total ? Number(((count('COMPLETED') / total) * 100).toFixed(2)) : 0,
        dropoutRate: total ? Number(((count('DROPPED') / total) * 100).toFixed(2)) : 0,
      };
      return stats;
    } catch {
      return null;
    }
  }

  static async getStudentAcademicRecord(studentId?: number): Promise<StudentAcademicRecord | null> {
    try {
      const regs: RegistrationDto[] = studentId && studentId > 0
        ? await RegistrationService.getUserRegistrations(studentId)
        : await getMyRegistrations();

      const completed = regs.filter(r => r.status === 'COMPLETED');
      const totalCredits = completed.reduce((sum, r) => sum + (r.course?.credits || 0), 0);
      const totalGradePoints = completed.reduce((sum, r) => sum + ((r.gradePoints || 0) * (r.course?.credits || 0)), 0);
      const gpa = totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0;
      const academicStanding = gpa >= 3.7 ? "Dean's List" : gpa >= 2.0 ? 'Good Standing' : 'Probation';

      return {
        studentId: regs[0]?.user?.id || 0,
        studentName: `${regs[0]?.user?.firstName || ''} ${regs[0]?.user?.lastName || ''}`.trim(),
        studentNumber: regs[0]?.user?.studentId || '',
        totalCredits,
        completedCredits: totalCredits,
        gpa,
        academicStanding,
        registrations: regs as unknown as RegistrationWithDetails[],
        semesterGPAs: [],
      };
    } catch {
      return null;
    }
  }

  static async getCourseEnrollmentSummary(courseId: number): Promise<CourseEnrollmentSummary | null> {
    try {
      const [courseRes, regsRes] = await Promise.all([
        api.courses.getById(courseId),
        api.registrations.getByCourse(courseId)
      ]);
      const course = courseRes.data as unknown as CourseDto;
      const regs = (regsRes.data as unknown as RegistrationDto[]) || [];
      if (!course) return null;
      const enrolledCount = regs.length;
      const max = course.maxStudents || 0;
      const available = max > 0 ? Math.max(0, max - enrolledCount) : 0;
      const percent = max > 0 ? Number(((enrolledCount / max) * 100).toFixed(2)) : 0;
      return {
        courseId: course.id!,
        courseCode: course.code || '',
        courseName: course.title || '',
        instructor: course.instructorName || course.instructor || 'TBA',
        maxStudents: max,
        enrolledCount,
        waitlistCount: 0,
        availableSpots: available,
        enrollmentPercentage: percent,
        registrations: regs as unknown as RegistrationWithDetails[],
      };
    } catch {
      return null;
    }
  }
}