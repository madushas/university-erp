import type { 
  RegistrationDto, 
  EnrollmentValidation, 
  RegistrationFormData 
} from '@/lib/types/registration';
import type { CourseDto } from '@/lib/types/course';

/**
 * Registration validation utilities
 */
export class RegistrationValidationUtils {
  
  /**
   * Validate course enrollment eligibility
   */
  static validateCourseEnrollment(
    course: CourseDto,
    existingRegistrations: RegistrationDto[]
  ): EnrollmentValidation {
    const validation: EnrollmentValidation = {
      canEnroll: true,
      reasons: [],
      warnings: [],
      prerequisites: [],
      conflicts: []
    };

    // Check if course is active
    if (course.status !== 'ACTIVE') {
      validation.canEnroll = false;
      validation.reasons.push('Course is not currently active');
    }

    // Check for duplicate enrollment
    const alreadyEnrolled = existingRegistrations.some(reg => 
      reg.course?.id === course.id && 
      ['ENROLLED', 'PENDING'].includes(reg.status || '')
    );

    if (alreadyEnrolled) {
      validation.canEnroll = false;
      validation.reasons.push('Already enrolled in this course');
      validation.conflicts.push({
        type: 'duplicate',
        message: 'You are already enrolled in this course',
        courseCode: course.code
      });
    }

    // Check course capacity
    const enrolledCount = existingRegistrations.filter(reg => 
      reg.course?.id === course.id && 
      ['ENROLLED', 'PENDING'].includes(reg.status || '')
    ).length;

    const maxStudents = course.maxStudents || 0;
    
    if (maxStudents > 0) {
      if (enrolledCount >= maxStudents) {
        validation.canEnroll = false;
        validation.reasons.push('Course is at full capacity');
        validation.conflicts.push({
          type: 'capacity',
          message: `Course is full (${enrolledCount}/${maxStudents} students)`
        });
      } else if (enrolledCount >= maxStudents * 0.9) {
        validation.warnings.push(`Course is filling up (${enrolledCount}/${maxStudents} students)`);
      }
    }

    // Check schedule conflicts
    const scheduleConflicts = this.checkScheduleConflicts(course, existingRegistrations);
    if (scheduleConflicts.length > 0) {
      validation.canEnroll = false;
      validation.reasons.push('Schedule conflict detected');
      validation.conflicts.push(...scheduleConflicts);
    }

    // Check prerequisites (basic implementation)
    const prerequisiteCheck = this.checkPrerequisites(course, existingRegistrations);
    validation.prerequisites = prerequisiteCheck.prerequisites;
    
    if (!prerequisiteCheck.allMet) {
      validation.canEnroll = false;
      validation.reasons.push('Prerequisites not met');
      validation.conflicts.push({
        type: 'prerequisite',
        message: 'Required prerequisites have not been completed'
      });
    }

    // Check minimum enrollment requirements
    if (course.minStudents && course.minStudents > 0 && enrolledCount < course.minStudents) {
      validation.warnings.push(
        `Course needs ${course.minStudents - enrolledCount} more students to meet minimum enrollment`
      );
    }

    return validation;
  }

  /**
   * Check for schedule conflicts
   */
  private static checkScheduleConflicts(
    course: CourseDto,
    existingRegistrations: RegistrationDto[]
  ): Array<{ type: 'schedule'; message: string; courseCode?: string }> {
    const conflicts: Array<{ type: 'schedule'; message: string; courseCode?: string }> = [];

    // Get enrolled courses with schedules
    const enrolledCourses = existingRegistrations
      .filter(reg => ['ENROLLED', 'PENDING'].includes(reg.status || ''))
      .map(reg => reg.course)
      .filter(Boolean) as CourseDto[];

    for (const enrolledCourse of enrolledCourses) {
      if (this.hasTimeConflict(course, enrolledCourse)) {
        conflicts.push({
          type: 'schedule',
          message: `Schedule conflict with ${enrolledCourse.code} - ${enrolledCourse.title}`,
          courseCode: enrolledCourse.code
        });
      }
    }

    return conflicts;
  }

  /**
   * Check if two courses have time conflicts
   */
  private static hasTimeConflict(course1: CourseDto, course2: CourseDto): boolean {
    // Basic implementation - would need more sophisticated scheduling logic
    if (!course1.daysOfWeek || !course2.daysOfWeek) {
      return false;
    }

    if (!course1.startTime || !course1.endTime || !course2.startTime || !course2.endTime) {
      return false;
    }

    // Check if courses share any days
    const days1 = course1.daysOfWeek.split(',').map(d => d.trim());
    const days2 = course2.daysOfWeek.split(',').map(d => d.trim());
    const sharedDays = days1.filter(day => days2.includes(day));

    if (sharedDays.length === 0) {
      return false;
    }

    // Convert times to strings if they're not already
    const startTime1 = typeof course1.startTime === 'string' ? course1.startTime : String(course1.startTime);
    const endTime1 = typeof course1.endTime === 'string' ? course1.endTime : String(course1.endTime);
    const startTime2 = typeof course2.startTime === 'string' ? course2.startTime : String(course2.startTime);
    const endTime2 = typeof course2.endTime === 'string' ? course2.endTime : String(course2.endTime);

    // Check time overlap
    const start1 = this.parseTime(startTime1);
    const end1 = this.parseTime(endTime1);
    const start2 = this.parseTime(startTime2);
    const end2 = this.parseTime(endTime2);

    // Check if times overlap
    return (start1 < end2 && start2 < end1);
  }

  /**
   * Parse time string to minutes since midnight
   */
  private static parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Check prerequisites
   */
  private static checkPrerequisites(
    course: CourseDto,
    existingRegistrations: RegistrationDto[]
  ): { allMet: boolean; prerequisites: Array<{ courseCode: string; courseName: string; completed: boolean; grade?: string }> } {
    const prerequisites: Array<{ courseCode: string; courseName: string; completed: boolean; grade?: string }> = [];

    if (!course.prerequisites) {
      return { allMet: true, prerequisites };
    }

    // Parse prerequisites (basic implementation)
    const prereqCodes = course.prerequisites.split(',').map(code => code.trim());
    
    for (const prereqCode of prereqCodes) {
      const completedPrereq = existingRegistrations.find(reg => 
        reg.course?.code === prereqCode && 
        reg.status === 'COMPLETED' &&
        this.isPassingGrade(reg.grade)
      );

      prerequisites.push({
        courseCode: prereqCode,
        courseName: completedPrereq?.course?.title || 'Unknown Course',
        completed: !!completedPrereq,
        grade: completedPrereq?.grade
      });
    }

    const allMet = prerequisites.every(prereq => prereq.completed);
    return { allMet, prerequisites };
  }

  /**
   * Check if a grade is passing
   */
  private static isPassingGrade(grade?: string): boolean {
    if (!grade) return false;
    
    const passingGrades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'P'];
    return passingGrades.includes(grade.toUpperCase());
  }

  /**
   * Validate registration form data
   */
  static validateRegistrationForm(formData: RegistrationFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required acknowledgements
    if (!formData.acknowledgements.prerequisitesReviewed) {
      errors.push('You must review and acknowledge the prerequisites');
    }

    if (!formData.acknowledgements.scheduleConflictAware) {
      errors.push('You must acknowledge awareness of potential schedule conflicts');
    }

    if (!formData.acknowledgements.paymentTermsAccepted) {
      errors.push('You must accept the payment terms and conditions');
    }

    if (!formData.acknowledgements.withdrawalPolicyUnderstood) {
      errors.push('You must acknowledge understanding of the withdrawal policy');
    }

    // Validate course ID
    if (!formData.courseId || formData.courseId <= 0) {
      errors.push('Invalid course selection');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate GPA from registrations
   */
  static calculateGPA(registrations: RegistrationDto[]): number {
    const completedWithGrades = registrations.filter(reg => 
      reg.status === 'COMPLETED' && 
      reg.gradePoints !== undefined && 
      reg.gradePoints !== null &&
      reg.course?.credits
    );

    if (completedWithGrades.length === 0) {
      return 0;
    }

    const totalQualityPoints = completedWithGrades.reduce((sum, reg) => 
      sum + (reg.gradePoints! * (reg.course?.credits || 0)), 0
    );

    const totalCredits = completedWithGrades.reduce((sum, reg) => 
      sum + (reg.course?.credits || 0), 0
    );

    return totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
  }

  /**
   * Calculate total credits
   */
  static calculateTotalCredits(registrations: RegistrationDto[], status?: string): number {
    const filteredRegistrations = status 
      ? registrations.filter(reg => reg.status === status)
      : registrations.filter(reg => ['COMPLETED', 'ENROLLED'].includes(reg.status || ''));

    return filteredRegistrations.reduce((sum, reg) => 
      sum + (reg.course?.credits || 0), 0
    );
  }

  /**
   * Get academic standing based on GPA
   */
  static getAcademicStanding(gpa: number, totalCredits: number): string {
    if (totalCredits < 12) {
      return 'Insufficient Credits';
    }

    if (gpa >= 3.75) {
      return 'Dean\'s List';
    } else if (gpa >= 3.5) {
      return 'High Honors';
    } else if (gpa >= 3.0) {
      return 'Good Standing';
    } else if (gpa >= 2.0) {
      return 'Satisfactory';
    } else if (gpa >= 1.5) {
      return 'Academic Probation';
    } else {
      return 'Academic Suspension';
    }
  }

  /**
   * Check if student can drop a course
   */
  static canDropCourse(registration: RegistrationDto): { canDrop: boolean; reason?: string } {
    if (!registration.status) {
      return { canDrop: false, reason: 'Invalid registration status' };
    }

    if (!['ENROLLED', 'PENDING'].includes(registration.status)) {
      return { canDrop: false, reason: 'Can only drop enrolled or pending courses' };
    }

    // Check if it's past the drop deadline (would need course/semester dates)
    // For now, allow dropping if enrolled
    return { canDrop: true };
  }

  /**
   * Format grade for display
   */
  static formatGrade(grade?: string, gradePoints?: number): string {
    if (!grade) {
      return 'N/A';
    }

    if (gradePoints !== undefined && gradePoints !== null) {
      return `${grade} (${gradePoints.toFixed(2)})`;
    }

    return grade;
  }

  /**
   * Get grade color for UI
   */
  static getGradeColor(grade?: string): string {
    if (!grade) return 'text-gray-500';

    const gradeUpper = grade.toUpperCase();
    
    if (['A', 'A+', 'A-'].includes(gradeUpper)) {
      return 'text-green-600';
    } else if (['B+', 'B', 'B-'].includes(gradeUpper)) {
      return 'text-blue-600';
    } else if (['C+', 'C', 'C-'].includes(gradeUpper)) {
      return 'text-yellow-600';
    } else if (['D+', 'D', 'D-'].includes(gradeUpper)) {
      return 'text-orange-600';
    } else if (['F'].includes(gradeUpper)) {
      return 'text-red-600';
    } else {
      return 'text-gray-600';
    }
  }

  /**
   * Get status color for UI
   */
  static getStatusColor(status?: string): string {
    if (!status) return 'text-gray-500';

    switch (status.toUpperCase()) {
      case 'ENROLLED':
        return 'text-green-600';
      case 'COMPLETED':
        return 'text-blue-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'DROPPED':
      case 'WITHDRAWN':
        return 'text-orange-600';
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }
}