package com.university.backend.modules.core.service;

import com.university.backend.modules.academic.entity.RegistrationStatus;
import com.university.backend.modules.academic.service.RegistrationService;
import com.university.backend.modules.financial.entity.BillingStatement;
import com.university.backend.modules.financial.service.FinancialService;
import com.university.backend.modules.student.service.DegreeAuditService;
import com.university.backend.modules.student.service.StudentAcademicRecordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service that coordinates business logic across academic, financial, and student modules
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AcademicBusinessLogicService {

    private final RegistrationService registrationService;
    private final StudentAcademicRecordService studentAcademicRecordService;
    private final DegreeAuditService degreeAuditService;
    private final FinancialService financialService;

    /**
     * Complete course registration with all business logic
     * This method handles:
     * 1. Enrollment validation (prerequisites, capacity, time conflicts)
     * 2. Billing generation
     * 3. Academic record updates
     */
    public void completeStudentEnrollment(Long studentId, Long courseId) {
        log.info("Completing enrollment for student {} in course {}", studentId, courseId);

        try {
            // 1. Enroll student in course (includes all validation)
            var registration = registrationService.enrollUserInCourse(studentId, courseId);

            // 2. Generate comprehensive billing for the registration
            generateRegistrationBillingStatement(studentId, List.of(registration.getId()));

            // 3. Update student's academic record if needed
            updateStudentAcademicProgress(studentId);

            log.info("Successfully completed enrollment for student {} in course {}", studentId, courseId);

        } catch (Exception e) {
            log.error("Failed to complete enrollment for student {} in course {}: {}",
                     studentId, courseId, e.getMessage());
            throw new RuntimeException("Enrollment failed: " + e.getMessage(), e);
        }
    }

    /**
     * Complete course with grade assignment and GPA calculation
     */
    public void completeCourseWithGrade(Long registrationId, String grade) {
        log.info("Completing course for registration {} with grade {}", registrationId, grade);

        try {
            // 1. Update registration with grade
            var registration = registrationService.updateRegistrationGrade(registrationId, grade);
            
            // 2. Update registration status to completed
            registrationService.updateRegistrationStatus(registrationId, RegistrationStatus.COMPLETED);
            
            // 3. Recalculate student's GPA
            Long studentId = registration.getUser().getId();
            BigDecimal newGpa = registrationService.calculateAndUpdateGPA(studentId);
            
            // 4. Update academic record with new GPA
            studentAcademicRecordService.calculateAndUpdateGPA(studentId);
            
            // 5. Check if student is eligible for graduation
            boolean eligible = degreeAuditService.checkGraduationEligibility(studentId);
            if (eligible) {
                log.info("Student {} is now eligible for graduation", studentId);
            }
            
            log.info("Successfully completed course for registration {} with GPA {}", registrationId, newGpa);
            
        } catch (Exception e) {
            log.error("Failed to complete course for registration {}: {}", registrationId, e.getMessage());
            throw new RuntimeException("Course completion failed: " + e.getMessage(), e);
        }
    }

    /**
     * Generate semester billing for all student registrations
     */
    public BillingStatement generateSemesterBilling(Long studentId, Long semesterId) {
        log.info("Generating semester billing for student {} in semester {}", studentId, semesterId);

        try {
            // Generate comprehensive semester billing
            BillingStatement statement = financialService.generateSemesterBilling(studentId, semesterId);
            
            log.info("Generated semester billing statement {} for student {}", 
                    statement.getStatementNumber(), studentId);
            
            return statement;
            
        } catch (Exception e) {
            log.error("Failed to generate semester billing for student {}: {}", studentId, e.getMessage());
            throw new RuntimeException("Billing generation failed: " + e.getMessage(), e);
        }
    }

    /**
     * Generate billing statement for course registrations
     */
    public BillingStatement generateRegistrationBillingStatement(Long studentId, List<Long> registrationIds) {
        log.info("Generating billing statement for student {} with {} registrations", studentId, registrationIds.size());

        try {
            // Generate billing statement from registrations
            BillingStatement statement = financialService.generateBillingFromRegistrations(studentId, registrationIds);

            log.info("Generated billing statement {} for student {} with {} registrations",
                    statement.getStatementNumber(), studentId, registrationIds.size());

            return statement;

        } catch (Exception e) {
            log.error("Failed to generate billing statement for student {}: {}", studentId, e.getMessage());
            throw new RuntimeException("Billing statement generation failed: " + e.getMessage(), e);
        }
    }

    /**
     * Validate graduation eligibility with comprehensive checks
     */
    public boolean validateGraduationEligibility(Long studentId) {
        log.info("Validating graduation eligibility for student {}", studentId);

        try {
            // 1. Check academic record requirements
            boolean academicRequirementsMet = studentAcademicRecordService.checkGraduationRequirements(studentId);
            
            // 2. Check degree audit requirements
            boolean degreeRequirementsMet = degreeAuditService.checkGraduationEligibility(studentId);
            
            // 3. Check financial obligations (no outstanding balances)
            boolean financialObligationsMet = checkFinancialObligations(studentId);
            
            boolean eligible = academicRequirementsMet && degreeRequirementsMet && financialObligationsMet;
            
            log.info("Graduation eligibility for student {}: Academic={}, Degree={}, Financial={}, Overall={}", 
                    studentId, academicRequirementsMet, degreeRequirementsMet, financialObligationsMet, eligible);
            
            return eligible;
            
        } catch (Exception e) {
            log.error("Failed to validate graduation eligibility for student {}: {}", studentId, e.getMessage());
            return false;
        }
    }

    /**
     * Update student's academic progress after course completion
     */
    private void updateStudentAcademicProgress(Long studentId) {
        try {
            // Update GPA and academic standing
            studentAcademicRecordService.calculateAndUpdateGPA(studentId);
            
            // Generate updated degree audit
            var academicRecord = studentAcademicRecordService.findCurrentRecordByStudentId(studentId);
            if (academicRecord.isPresent() && academicRecord.get().getAcademicProgramId() != null) {
                degreeAuditService.generateDegreeAudit(studentId, academicRecord.get().getAcademicProgramId());
            }
            
        } catch (Exception e) {
            log.warn("Failed to update academic progress for student {}: {}", studentId, e.getMessage());
            // Don't throw exception as this is a secondary operation
        }
    }

    /**
     * Check if student has any outstanding financial obligations
     */
    private boolean checkFinancialObligations(Long studentId) {
        try {
            // Get student account
            var studentAccount = financialService.getStudentAccountByUsername(getUsernameById(studentId));
            
            // Check if there are any outstanding balances
            return studentAccount.getCurrentBalance().compareTo(BigDecimal.ZERO) <= 0;
            
        } catch (Exception e) {
            log.warn("Failed to check financial obligations for student {}: {}", studentId, e.getMessage());
            return true; // Assume no obligations if check fails
        }
    }

    /**
     * Helper method to get username by user ID
     * In a real implementation, this would query the user repository
     */
    private String getUsernameById(Long userId) {
        // This is a simplified implementation
        // In reality, you would inject UserRepository and query it
        return "student" + userId;
    }

    /**
     * Batch process course completions for a semester
     */
    public void batchProcessCourseCompletions(List<Long> registrationIds) {
        log.info("Batch processing {} course completions", registrationIds.size());

        int successCount = 0;
        int failureCount = 0;

        for (Long registrationId : registrationIds) {
            try {
                // This would typically get the grade from the registration
                // For now, we'll skip the grade update and just process completion
                registrationService.updateRegistrationStatus(registrationId, RegistrationStatus.COMPLETED);
                successCount++;
                
            } catch (Exception e) {
                log.error("Failed to process completion for registration {}: {}", registrationId, e.getMessage());
                failureCount++;
            }
        }

        log.info("Batch processing completed: {} successful, {} failed", successCount, failureCount);
    }

    /**
     * Validate and process semester enrollment for multiple courses
     */
    public void processSemesterEnrollment(Long studentId, List<Long> courseIds) {
        log.info("Processing semester enrollment for student {} in {} courses", studentId, courseIds.size());

        int successCount = 0;
        int failureCount = 0;
        List<Long> successfulRegistrationIds = new java.util.ArrayList<>();

        for (Long courseId : courseIds) {
            try {
                completeStudentEnrollment(studentId, courseId);
                // Get the registration ID for billing generation
                var registration = registrationService.getUserRegistrations(studentId)
                    .stream()
                    .filter(r -> r.getCourse().getId().equals(courseId))
                    .findFirst()
                    .orElse(null);
                if (registration != null) {
                    successfulRegistrationIds.add(registration.getId());
                }
                successCount++;

            } catch (Exception e) {
                log.error("Failed to enroll student {} in course {}: {}", studentId, courseId, e.getMessage());
                failureCount++;
            }
        }

        // Generate semester billing after all enrollments
        if (successCount > 0 && !successfulRegistrationIds.isEmpty()) {
            try {
                generateRegistrationBillingStatement(studentId, successfulRegistrationIds);
            } catch (Exception e) {
                log.error("Failed to generate semester billing for student {}: {}", studentId, e.getMessage());
            }
        }

        log.info("Semester enrollment completed for student {}: {} successful, {} failed",
                studentId, successCount, failureCount);
    }
}