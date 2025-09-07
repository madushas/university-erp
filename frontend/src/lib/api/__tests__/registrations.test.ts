import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegistrationService } from '../registrations';
import type { RegistrationDto, RegistrationStatistics, RegistrationStatus } from '@/lib/types/registration';
import type { CourseDto } from '@/lib/types/course';

// Create a typed API mock that matches the `api` shape used by the service
const mockApi = {
  registrations: {
    getAll: vi.fn<[], Promise<{ data: RegistrationDto[] | null }>>(),
    getByUser: vi.fn<[number], Promise<{ data: RegistrationDto[] | null }>>(),
    getByCourse: vi.fn<[number], Promise<{ data: RegistrationDto[] | null }>>(),
    getById: vi.fn<[number], Promise<{ data: RegistrationDto | null }>>(),
    enroll: vi.fn<[number], Promise<{ data: RegistrationDto | null }>>(),
    updateStatus: vi.fn<[number, RegistrationStatus], Promise<{ data: RegistrationDto }>>(),
    updateGrade: vi.fn<[number, string], Promise<{ data: RegistrationDto }>>(),
    drop: vi.fn<[number], Promise<unknown>>()
  },
  courses: {
    getById: vi.fn<[number], Promise<{ data: CourseDto | null }>>(),
  }
};

vi.mock('../generated', () => ({
  api: mockApi,
}));

describe('RegistrationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRegistration: RegistrationDto = {
    id: 1,
    user: {
      id: 1,
      username: 'john.doe',
      email: 'john@university.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'STUDENT',
      status: 'ACTIVE',
      studentId: 'STU001'
    },
    course: {
      id: 1,
      code: 'CS101',
      title: 'Introduction to Computer Science',
      credits: 3,
      status: 'ACTIVE'
    },
    registrationDate: '2024-01-15T10:00:00Z',
    status: 'ENROLLED',
    grade: undefined,
    gradePoints: undefined,
    paymentStatus: 'PENDING'
  };

  describe('getMyRegistrations', () => {
    it('should fetch current user registrations successfully', async () => {
      mockApi.registrations.getAll.mockResolvedValue({ data: [mockRegistration] });
      const result = await RegistrationService.getMyRegistrations();
      expect(mockApi.registrations.getAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockRegistration]);
    });

    it('should throw if underlying client throws', async () => {
      mockApi.registrations.getAll.mockRejectedValue(new Error('Unauthorized'));
      await expect(RegistrationService.getMyRegistrations()).rejects.toThrow('Unauthorized');
    });

    it('should return empty array when no data', async () => {
      mockApi.registrations.getAll.mockResolvedValue({ data: null });
      const result = await RegistrationService.getMyRegistrations();
      expect(result).toEqual([]);
    });
  });

  describe('getUserRegistrations', () => {
    it('should fetch user registrations by ID', async () => {
      const userId = 123;
      mockApi.registrations.getByUser.mockResolvedValue({ data: [mockRegistration] });

      const result = await RegistrationService.getUserRegistrations(userId);

      expect(mockApi.registrations.getByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual([mockRegistration]);
    });
  });

  describe('getCourseRegistrations', () => {
    it('should fetch course registrations by course ID', async () => {
      const courseId = 456;
      mockApi.registrations.getByCourse.mockResolvedValue({ data: [mockRegistration] });

      const result = await RegistrationService.getCourseRegistrations(courseId);

      expect(mockApi.registrations.getByCourse).toHaveBeenCalledWith(courseId);
      expect(result).toEqual([mockRegistration]);
    });
  });

  describe('getRegistrationById', () => {
    it('should fetch registration by ID', async () => {
      const registrationId = 789;
      mockApi.registrations.getById.mockResolvedValue({ data: mockRegistration });

      const result = await RegistrationService.getRegistrationById(registrationId);

      expect(mockApi.registrations.getById).toHaveBeenCalledWith(registrationId);
      expect(result).toEqual(mockRegistration);
    });

    it('should return null when registration not found', async () => {
      const registrationId = 999;
      mockApi.registrations.getById.mockResolvedValue({ data: null });

      const result = await RegistrationService.getRegistrationById(registrationId);
      expect(result).toBeNull();
    });
  });

  describe('enrollInCourse', () => {
    it('should enroll in course successfully', async () => {
      const courseId = 123;
      mockApi.registrations.enroll.mockResolvedValue({ data: mockRegistration });

      const result = await RegistrationService.enrollInCourse(courseId);

      expect(mockApi.registrations.enroll).toHaveBeenCalledWith(courseId);
      expect(result).toEqual(mockRegistration);
    });

    it('should return null when enrollment fails', async () => {
      const courseId = 123;
      mockApi.registrations.enroll.mockResolvedValue({ data: null });

      const result = await RegistrationService.enrollInCourse(courseId);
      expect(result).toBeNull();
    });

    it('should return null when enrollment throws', async () => {
      const courseId = 123;
      mockApi.registrations.enroll.mockRejectedValue(new Error('Network'));

      const result = await RegistrationService.enrollInCourse(courseId);
      expect(result).toBeNull();
    });
  });

  describe('dropCourse', () => {
    it('should drop course successfully', async () => {
      const courseId = 123;
      mockApi.registrations.drop.mockResolvedValue({});

      const ok = await RegistrationService.dropCourse(courseId);
      expect(ok).toBe(true);
      expect(mockApi.registrations.drop).toHaveBeenCalledWith(courseId);
    });

    it('should handle drop course errors', async () => {
      const courseId = 123;
      mockApi.registrations.drop.mockRejectedValue(new Error('Cannot drop after deadline'));
      const ok = await RegistrationService.dropCourse(courseId);
      expect(ok).toBe(false);
    });
  });

  describe('updateRegistrationStatus', () => {
    it('should update registration status successfully', async () => {
      const registrationId = 123;
      const status = 'COMPLETED';
      const updatedRegistration = { ...mockRegistration, status: 'COMPLETED' };
      mockApi.registrations.updateStatus.mockResolvedValue({ data: updatedRegistration });

      const result = await RegistrationService.updateRegistrationStatus(registrationId, status);

      expect(mockApi.registrations.updateStatus).toHaveBeenCalledWith(registrationId, status);
      expect(result).toEqual(updatedRegistration);
    });
  });

  describe('updateRegistrationGrade', () => {
    it('should update registration grade successfully', async () => {
      const registrationId = 123;
      const grade = 'A';
      const updatedRegistration = { ...mockRegistration, grade: 'A', gradePoints: 4.0 };
      mockApi.registrations.updateGrade.mockResolvedValue({ data: updatedRegistration });

      const result = await RegistrationService.updateRegistrationGrade(registrationId, grade);

      expect(mockApi.registrations.updateGrade).toHaveBeenCalledWith(registrationId, grade);
      expect(result).toEqual(updatedRegistration);
    });
  });

  describe('validateEnrollment', () => {
    it('should validate enrollment successfully when course is available', async () => {
      const courseId = 123;
      const mockCourse = {
        id: courseId,
        code: 'CS101',
        title: 'Introduction to Computer Science',
        status: 'ACTIVE',
        maxStudents: 30,
        credits: 3
      };

      mockApi.courses.getById.mockResolvedValue({ data: mockCourse });
      mockApi.registrations.getAll.mockResolvedValue({ data: [] });
      mockApi.registrations.getByCourse.mockResolvedValue({ data: [] });

      const result = await RegistrationService.validateEnrollment(courseId);
      expect(result).not.toBeNull();
      const v = result!;
      expect(v.canEnroll).toBe(true);
      expect(v.reasons).toHaveLength(0);
      expect(v.conflicts).toHaveLength(0);
    });

    it('should detect duplicate enrollment', async () => {
      const courseId = 123;
      const mockCourse = {
        id: courseId,
        code: 'CS101',
        title: 'Introduction to Computer Science',
        status: 'ACTIVE',
        maxStudents: 30
      };

      const existingRegistration = {
        ...mockRegistration,
        course: { ...mockRegistration.course, id: courseId },
        status: 'ENROLLED'
      };

      mockApi.courses.getById.mockResolvedValue({ data: mockCourse });
      mockApi.registrations.getAll.mockResolvedValue({ data: [existingRegistration] });
      mockApi.registrations.getByCourse.mockResolvedValue({ data: [] });

      const result = await RegistrationService.validateEnrollment(courseId);
      expect(result).not.toBeNull();
      const v = result!;
      expect(v.canEnroll).toBe(false);
      expect(v.reasons).toContain('Already enrolled in this course');
      expect(v.conflicts).toHaveLength(1);
      expect(v.conflicts[0].type).toBe('duplicate');
    });

    it('should detect course at capacity', async () => {
      const courseId = 123;
      const mockCourse = {
        id: courseId,
        code: 'CS101',
        title: 'Introduction to Computer Science',
        status: 'ACTIVE',
        maxStudents: 2
      };

      const courseRegistrations = [
        { ...mockRegistration, status: 'ENROLLED' },
        { ...mockRegistration, id: 2, status: 'ENROLLED' }
      ];

      mockApi.courses.getById.mockResolvedValue({ data: mockCourse });
      mockApi.registrations.getAll.mockResolvedValue({ data: [] });
      mockApi.registrations.getByCourse.mockResolvedValue({ data: courseRegistrations });

      const result = await RegistrationService.validateEnrollment(courseId);
      expect(result).not.toBeNull();
      const v = result!;
      expect(v.canEnroll).toBe(false);
      expect(v.reasons).toContain('Course is at full capacity');
      expect(v.conflicts).toHaveLength(1);
      expect(v.conflicts[0].type).toBe('capacity');
    });

    it('should handle course not found', async () => {
      const courseId = 999;
      mockApi.courses.getById.mockResolvedValue({ data: null });
      mockApi.registrations.getAll.mockResolvedValue({ data: [] });
      mockApi.registrations.getByCourse.mockResolvedValue({ data: [] });

      const result = await RegistrationService.validateEnrollment(courseId);
      expect(result).not.toBeNull();
      const v = result!;
      expect(v.canEnroll).toBe(false);
      expect(v.reasons).toContain('Course not found');
    });
  });

  describe('getStudentAcademicRecord', () => {
    it('should calculate academic record correctly', async () => {
      const completedRegistration = {
        ...mockRegistration,
        status: 'COMPLETED',
        grade: 'A',
        gradePoints: 4.0,
        course: { ...mockRegistration.course, credits: 3 }
      };

      mockApi.registrations.getAll.mockResolvedValue({ data: [completedRegistration] });

      const result = await RegistrationService.getStudentAcademicRecord(0);

      expect(result.totalCredits).toBe(3);
      expect(result.gpa).toBe(4.0);
      expect(result.academicStanding).toBe('Dean\'s List');
      expect(result.registrations).toHaveLength(1);
    });

    it('should handle empty registrations', async () => {
      mockApi.registrations.getAll.mockResolvedValue({ data: [] });

      const result = await RegistrationService.getStudentAcademicRecord();
      expect(result).not.toBeNull();
      const ar = result!;
      expect(ar.totalCredits).toBe(0);
      expect(ar.gpa).toBe(0);
      expect(ar.registrations).toHaveLength(0);
    });
  });

  describe('getCourseEnrollmentSummary', () => {
    it('should calculate enrollment summary correctly', async () => {
      const courseId = 123;
      const mockCourse = {
        id: courseId,
        code: 'CS101',
        title: 'Introduction to Computer Science',
        instructorName: 'Dr. Smith',
        maxStudents: 30
      };

      const enrolledRegistrations = [
        { ...mockRegistration, status: 'ENROLLED' },
        { ...mockRegistration, id: 2, status: 'ENROLLED' }
      ];

      mockApi.registrations.getByCourse.mockResolvedValue({ data: enrolledRegistrations });
      mockApi.courses.getById.mockResolvedValue({ data: mockCourse });

      const result = await RegistrationService.getCourseEnrollmentSummary(courseId);
      expect(result).not.toBeNull();
      const summary = result!;
      expect(summary.enrolledCount).toBe(2);
      expect(summary.availableSpots).toBe(28);
      expect(summary.enrollmentPercentage).toBe(6.67);
      expect(summary.registrations).toHaveLength(2);
    });
  });

  describe('getRegistrationStatistics', () => {
    it('should calculate statistics correctly', async () => {
      const registrations = [
        { ...mockRegistration, status: 'ENROLLED' },
        { ...mockRegistration, id: 2, status: 'COMPLETED', gradePoints: 3.5 },
        { ...mockRegistration, id: 3, status: 'DROPPED' }
      ];

      mockApi.registrations.getAll.mockResolvedValue({ data: registrations });

      const result = await RegistrationService.getRegistrationStatistics();
      expect(result).not.toBeNull();
      const stats = result as RegistrationStatistics;
      expect(stats.totalRegistrations).toBe(3);
      expect(stats.activeRegistrations).toBe(1);
      expect(stats.completedRegistrations).toBe(1);
      expect(stats.droppedRegistrations).toBe(1);
      expect(stats.completionRate).toBe(33.33);
      expect(stats.dropoutRate).toBe(33.33);
    });
  });
});