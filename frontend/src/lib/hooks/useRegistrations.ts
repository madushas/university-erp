import { useState, useEffect, useCallback } from 'react';
import { RegistrationService } from '@/lib/api/registrations';
import type {
  RegistrationDto,
  RegistrationStatistics,
  StudentAcademicRecord,
  EnrollmentValidation,
  CourseEnrollmentSummary,
} from '@/lib/types/registration';

interface UseRegistrationsOptions {
  autoLoad?: boolean;
  userId?: number;
  courseId?: number;
}

interface UseRegistrationsReturn {
  registrations: RegistrationDto[];
  loading: boolean;
  error: string | null;
  statistics: RegistrationStatistics | null;
  
  // Actions
  loadRegistrations: () => Promise<void>;
  loadMyRegistrations: () => Promise<void>;
  loadUserRegistrations: (userId: number) => Promise<void>;
  loadCourseRegistrations: (courseId: number) => Promise<void>;
  getRegistrationById: (id: number) => Promise<RegistrationDto | null>;
  enrollInCourse: (courseId: number) => Promise<RegistrationDto | null>;
  dropCourse: (courseId: number) => Promise<boolean>;
  updateRegistrationStatus: (id: number, status: string) => Promise<RegistrationDto | null>;
  updateRegistrationGrade: (id: number, grade: string) => Promise<RegistrationDto | null>;
  validateEnrollment: (courseId: number, userId?: number) => Promise<EnrollmentValidation | null>;
  loadStatistics: () => Promise<void>;
  
  // Utilities
  clearError: () => void;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for registration management operations
 */
export function useRegistrations(options: UseRegistrationsOptions = {}): UseRegistrationsReturn {
  const { autoLoad = true, userId, courseId } = options;
  
  const [registrations, setRegistrations] = useState<RegistrationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<RegistrationStatistics | null>(null);

  /**
   * Load current user's registrations
   */
  const loadMyRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RegistrationService.getMyRegistrations();
      setRegistrations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load registrations';
      setError(errorMessage);
      console.error('Error loading my registrations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load registrations for a specific user
   */
  const loadUserRegistrations = useCallback(async (targetUserId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await RegistrationService.getUserRegistrations(targetUserId);
      setRegistrations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user registrations';
      setError(errorMessage);
      console.error('Error loading user registrations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load registrations for a specific course
   */
  const loadCourseRegistrations = useCallback(async (targetCourseId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await RegistrationService.getCourseRegistrations(targetCourseId);
      setRegistrations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load course registrations';
      setError(errorMessage);
      console.error('Error loading course registrations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load registrations based on options
   */
  const loadRegistrations = useCallback(async () => {
    if (userId) {
      await loadUserRegistrations(userId);
    } else if (courseId) {
      await loadCourseRegistrations(courseId);
    } else {
      await loadMyRegistrations();
    }
  }, [userId, courseId, loadUserRegistrations, loadCourseRegistrations, loadMyRegistrations]);

  /**
   * Get registration by ID
   */
  const getRegistrationById = useCallback(async (id: number): Promise<RegistrationDto | null> => {
    try {
      setError(null);
      return await RegistrationService.getRegistrationById(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get registration';
      setError(errorMessage);
      console.error('Error getting registration by ID:', err);
      return null;
    }
  }, []);

  /**
   * Enroll in a course
   */
  const enrollInCourse = useCallback(async (courseId: number): Promise<RegistrationDto | null> => {
    try {
      setError(null);
      const newRegistration = await RegistrationService.enrollInCourse(courseId);
      
      // Add to local state
      if (newRegistration) {
        setRegistrations(prev => [...prev, newRegistration]);
      }
      
      return newRegistration;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enroll in course';
      setError(errorMessage);
      console.error('Error enrolling in course:', err);
      return null;
    }
  }, []);

  /**
   * Drop a course
   */
  const dropCourse = useCallback(async (courseId: number): Promise<boolean> => {
    try {
      setError(null);
      await RegistrationService.dropCourse(courseId);
      
      // Remove from local state
      setRegistrations(prev => prev.filter(reg => reg.course?.id !== courseId));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to drop course';
      setError(errorMessage);
      console.error('Error dropping course:', err);
      return false;
    }
  }, []);

  /**
   * Update registration status
   */
  const updateRegistrationStatus = useCallback(async (id: number, status: string): Promise<RegistrationDto | null> => {
    try {
      setError(null);
      const updatedRegistration = await RegistrationService.updateRegistrationStatus(id, status);
      
      // Update local state
      if (updatedRegistration) {
        setRegistrations(prev => prev.map(reg => 
          reg.id === id ? updatedRegistration : reg
        ));
      }
      
      return updatedRegistration;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update registration status';
      setError(errorMessage);
      console.error('Error updating registration status:', err);
      return null;
    }
  }, []);

  /**
   * Update registration grade
   */
  const updateRegistrationGrade = useCallback(async (id: number, grade: string): Promise<RegistrationDto | null> => {
    try {
      setError(null);
      const updatedRegistration = await RegistrationService.updateRegistrationGrade(id, grade);
      
      // Update local state
      if (updatedRegistration) {
        setRegistrations(prev => prev.map(reg => 
          reg.id === id ? updatedRegistration : reg
        ));
      }
      
      return updatedRegistration;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update registration grade';
      setError(errorMessage);
      console.error('Error updating registration grade:', err);
      return null;
    }
  }, []);

  /**
   * Validate enrollment eligibility
   */
  const validateEnrollment = useCallback(async (courseId: number): Promise<EnrollmentValidation | null> => {
    try {
      setError(null);
      const result = await RegistrationService.validateEnrollment(courseId);
      return result as EnrollmentValidation | null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate enrollment';
      setError(errorMessage);
      console.error('Error validating enrollment:', err);
      return null;
    }
  }, []);

  /**
   * Load registration statistics
   */
  const loadStatistics = useCallback(async () => {
    try {
      setError(null);
      const stats = await RegistrationService.getRegistrationStatistics();
      setStatistics(stats as RegistrationStatistics | null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load statistics';
      setError(errorMessage);
      console.error('Error loading statistics:', err);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh current data
   */
  const refresh = useCallback(async () => {
    await loadRegistrations();
  }, [loadRegistrations]);

  // Auto-load registrations on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadRegistrations();
    }
  }, [autoLoad, loadRegistrations]);

  return {
    registrations,
    loading,
    error,
    statistics,
    
    // Actions
    loadRegistrations,
    loadMyRegistrations,
    loadUserRegistrations,
    loadCourseRegistrations,
    getRegistrationById,
    enrollInCourse,
    dropCourse,
    updateRegistrationStatus,
    updateRegistrationGrade,
    validateEnrollment,
    loadStatistics,
    
    // Utilities
    clearError,
    refresh,
  };
}

/**
 * Hook for managing student academic records
 */
export function useStudentAcademicRecord(studentId?: number) {
  const [academicRecord, setAcademicRecord] = useState<StudentAcademicRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAcademicRecord = useCallback(async (targetStudentId?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await RegistrationService.getStudentAcademicRecord(targetStudentId || 0);
      setAcademicRecord(data as StudentAcademicRecord | null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load academic record';
      setError(errorMessage);
      console.error('Error loading academic record:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (studentId !== undefined) {
      loadAcademicRecord(studentId);
    } else {
      loadAcademicRecord();
    }
  }, [studentId, loadAcademicRecord]);

  return {
    academicRecord,
    loading,
    error,
    loadAcademicRecord,
    clearError: () => setError(null),
  };
}

/**
 * Hook for managing course enrollment summary
 */
export function useCourseEnrollmentSummary(courseId?: number) {
  const [enrollmentSummary, setEnrollmentSummary] = useState<CourseEnrollmentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEnrollmentSummary = useCallback(async (targetCourseId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await RegistrationService.getCourseEnrollmentSummary(targetCourseId);
      setEnrollmentSummary(data as CourseEnrollmentSummary | null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load enrollment summary';
      setError(errorMessage);
      console.error('Error loading enrollment summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (courseId) {
      loadEnrollmentSummary(courseId);
    }
  }, [courseId, loadEnrollmentSummary]);

  return {
    enrollmentSummary,
    loading,
    error,
    loadEnrollmentSummary,
    clearError: () => setError(null),
  };
}

/**
 * Hook for enrollment validation
 */
export function useEnrollmentValidation() {
  const [validation, setValidation] = useState<EnrollmentValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEnrollment = useCallback(async (courseId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await RegistrationService.validateEnrollment(courseId);
      setValidation(data as EnrollmentValidation | null);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate enrollment';
      setError(errorMessage);
      console.error('Error validating enrollment:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    validation,
    loading,
    error,
    validateEnrollment,
    clearError: () => setError(null),
  };
}