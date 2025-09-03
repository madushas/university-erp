import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { CourseService } from '@/lib/api/courses';
import { api } from '@/lib/api/generated';

// Mock the API
vi.mock('@/lib/api/generated', () => ({
  api: {
    courses: {
      getAll: vi.fn(),
      getPaged: vi.fn(),
      getById: vi.fn(),
      getByCode: vi.fn(),
      search: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('CourseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllCourses', () => {
    it('should return courses when API call succeeds', async () => {
      const mockCourses = [
        { id: 1, code: 'CS101', title: 'Intro to CS', credits: 3 },
        { id: 2, code: 'MATH101', title: 'Calculus I', credits: 4 },
      ];

      (api.courses.getAll as Mock).mockResolvedValue({
        data: mockCourses,
        error: null,
      });

      const result = await CourseService.getAllCourses();

      expect(result).toEqual(mockCourses);
      expect(api.courses.getAll).toHaveBeenCalledTimes(1);
    });

    it('should throw error when API call fails', async () => {
      (api.courses.getAll as Mock).mockResolvedValue({
        data: null,
        error: { detail: 'Failed to fetch courses' },
      });

      await expect(CourseService.getAllCourses()).rejects.toThrow('Failed to fetch courses');
    });
  });

  describe('createCourse', () => {
    it('should create course when data is valid', async () => {
      const courseData = {
        code: 'CS102',
        title: 'Data Structures',
        instructor: 'Dr. Smith',
        schedule: 'MWF 10:00-11:00',
        credits: 3,
      };

      const mockCreatedCourse = { id: 3, ...courseData };

      (api.courses.create as Mock).mockResolvedValue({
        data: mockCreatedCourse,
        error: null,
      });

      const result = await CourseService.createCourse(courseData);

      expect(result).toEqual(mockCreatedCourse);
      expect(api.courses.create).toHaveBeenCalledWith(courseData);
    });

    it('should throw error when required fields are missing', async () => {
      const invalidCourseData = {
        code: '', // Missing required field
        title: 'Data Structures',
        instructor: 'Dr. Smith',
        schedule: 'MWF 10:00-11:00',
        credits: 3,
      };

      await expect(CourseService.createCourse(invalidCourseData)).rejects.toThrow('Course code is required');
    });
  });

  describe('getCourseEnrollmentInfo', () => {
    it('should return enrollment info for a course', async () => {
      const mockCourse = {
        id: 1,
        code: 'CS101',
        title: 'Intro to CS',
        enrolledStudents: 25,
        maxStudents: 30,
        status: 'ACTIVE',
      };

      (api.courses.getById as Mock).mockResolvedValue({
        data: mockCourse,
        error: null,
      });

      const result = await CourseService.getCourseEnrollmentInfo(1);

      expect(result).toEqual({
        courseId: 1,
        courseName: 'Intro to CS',
        courseCode: 'CS101',
        enrolledStudents: 25,
        maxStudents: 30,
        enrollmentPercentage: (25 / 30) * 100,
        canEnroll: true,
        enrollmentMessage: 'Only 5 spots remaining',
      });
    });
  });

  describe('validation', () => {
    it('should validate email format', async () => {
      const courseData = {
        code: 'CS102',
        title: 'Data Structures',
        instructor: 'Dr. Smith',
        instructorEmail: 'invalid-email',
        schedule: 'MWF 10:00-11:00',
        credits: 3,
      };

      await expect(CourseService.createCourse(courseData)).rejects.toThrow('Invalid instructor email format');
    });

    it('should validate credit requirements', async () => {
      const courseData = {
        code: 'CS102',
        title: 'Data Structures',
        instructor: 'Dr. Smith',
        schedule: 'MWF 10:00-11:00',
        credits: 0, // Invalid credits
      };

      await expect(CourseService.createCourse(courseData)).rejects.toThrow('Credits must be at least 1');
    });

    it('should validate student capacity', async () => {
      const courseData = {
        code: 'CS102',
        title: 'Data Structures',
        instructor: 'Dr. Smith',
        schedule: 'MWF 10:00-11:00',
        credits: 3,
        maxStudents: 20,
        minStudents: 25, // Invalid: min > max
      };

      await expect(CourseService.createCourse(courseData)).rejects.toThrow('Minimum students cannot exceed maximum students');
    });
  });
});