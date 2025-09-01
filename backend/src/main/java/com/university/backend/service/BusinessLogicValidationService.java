package com.university.backend.service;

import com.university.backend.modules.academic.entity.Course;
import com.university.backend.modules.academic.entity.Registration;
import com.university.backend.modules.academic.entity.RegistrationStatus;
import com.university.backend.modules.academic.repository.CourseRepository;
import com.university.backend.modules.academic.repository.RegistrationRepository;
import com.university.backend.modules.core.entity.User;
import com.university.backend.modules.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * Service for business logic validation across the application
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BusinessLogicValidationService {

    private final CourseRepository courseRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;

    private static final List<String> VALID_ACADEMIC_STANDINGS = Arrays.asList(
        "GOOD_STANDING", "ACADEMIC_PROBATION", "ACADEMIC_WARNING", 
        "ACADEMIC_SUSPENSION", "ACADEMIC_DISMISSAL", "DEAN_LIST", "HONORS"
    );

    /**
     * Validate GPA range (0.0-4.0)
     */
    public void validateGPA(BigDecimal gpa) {
        if (gpa == null) {
            throw new IllegalArgumentException("GPA cannot be null");
        }
        
        if (gpa.compareTo(BigDecimal.ZERO) < 0 || gpa.compareTo(new BigDecimal("4.0")) > 0) {
            throw new IllegalArgumentException("GPA must be between 0.0 and 4.0, provided: " + gpa);
        }
        
        // Check for reasonable precision (max 2 decimal places)
        if (gpa.scale() > 2) {
            throw new IllegalArgumentException("GPA cannot have more than 2 decimal places");
        }
    }

    /**
     * Validate credit hours for non-negative values
     */
    public void validateCreditHours(Integer creditHours) {
        if (creditHours == null) {
            throw new IllegalArgumentException("Credit hours cannot be null");
        }
        
        if (creditHours < 0) {
            throw new IllegalArgumentException("Credit hours cannot be negative, provided: " + creditHours);
        }
        
        if (creditHours > 30) {
            throw new IllegalArgumentException("Credit hours cannot exceed 30 per semester, provided: " + creditHours);
        }
    }

    /**
     * Validate academic standing for allowed values
     */
    public void validateAcademicStanding(String academicStanding) {
        if (academicStanding == null || academicStanding.trim().isEmpty()) {
            throw new IllegalArgumentException("Academic standing cannot be null or empty");
        }
        
        String upperStanding = academicStanding.toUpperCase().trim();
        if (!VALID_ACADEMIC_STANDINGS.contains(upperStanding)) {
            throw new IllegalArgumentException("Invalid academic standing: " + academicStanding + 
                ". Valid values are: " + String.join(", ", VALID_ACADEMIC_STANDINGS));
        }
    }

    /**
     * Validate course registration prerequisites and capacity
     */
    public void validateCourseRegistration(Long userId, Long courseId) {
        log.info("Validating course registration for user {} and course {}", userId, courseId);
        
        // Check if user exists
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        
        // Check if course exists
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new IllegalArgumentException("Course not found with ID: " + courseId));
        
        // Check course capacity
        Long currentEnrollment = registrationRepository.countEnrolledStudentsByCourseId(courseId);
        if (currentEnrollment >= course.getMaxStudents()) {
            throw new IllegalArgumentException("Course is at maximum capacity (" + course.getMaxStudents() + " students)");
        }
        
        // Check if student is already registered
        boolean alreadyRegistered = registrationRepository.existsByUserIdAndCourseId(userId, courseId);
        if (alreadyRegistered) {
            throw new IllegalArgumentException("Student is already registered for this course");
        }
        
        // Check prerequisites (simplified - assumes prerequisites are stored as comma-separated course codes)
        if (course.getPrerequisites() != null && !course.getPrerequisites().trim().isEmpty()) {
            validatePrerequisites(userId, course.getPrerequisites());
        }
        
        // Check credit hour limits for the semester
        validateSemesterCreditHours(userId, course.getCredits());
    }

    /**
     * Validate application deadline rules
     */
    public void validateApplicationDeadline(LocalDate applicationDeadline, LocalDate submissionDate) {
        if (applicationDeadline == null) {
            throw new IllegalArgumentException("Application deadline cannot be null");
        }
        
        if (submissionDate == null) {
            submissionDate = LocalDate.now();
        }
        
        if (submissionDate.isAfter(applicationDeadline)) {
            throw new IllegalArgumentException("Application submission date (" + submissionDate + 
                ") is after the deadline (" + applicationDeadline + ")");
        }
        
        // Check if deadline is reasonable (not too far in the past or future)
        LocalDate now = LocalDate.now();
        if (applicationDeadline.isBefore(now.minusYears(1))) {
            throw new IllegalArgumentException("Application deadline cannot be more than 1 year in the past");
        }
        
        if (applicationDeadline.isAfter(now.plusYears(2))) {
            throw new IllegalArgumentException("Application deadline cannot be more than 2 years in the future");
        }
    }

    /**
     * Validate student enrollment status and credit requirements
     */
    public void validateEnrollmentStatus(Integer totalCreditHours, String enrollmentStatus) {
        if (enrollmentStatus == null || enrollmentStatus.trim().isEmpty()) {
            throw new IllegalArgumentException("Enrollment status cannot be null or empty");
        }
        
        if (totalCreditHours == null || totalCreditHours < 0) {
            throw new IllegalArgumentException("Total credit hours must be a non-negative number");
        }
        
        String status = enrollmentStatus.toUpperCase().trim();
        
        switch (status) {
            case "FULL_TIME":
                if (totalCreditHours < 12) {
                    throw new IllegalArgumentException("Full-time students must be enrolled in at least 12 credit hours, current: " + totalCreditHours);
                }
                break;
            case "PART_TIME":
                if (totalCreditHours >= 12) {
                    throw new IllegalArgumentException("Part-time students must be enrolled in less than 12 credit hours, current: " + totalCreditHours);
                }
                if (totalCreditHours == 0) {
                    throw new IllegalArgumentException("Part-time students must be enrolled in at least 1 credit hour");
                }
                break;
            case "INACTIVE":
                // Inactive students can have 0 credit hours
                break;
            default:
                throw new IllegalArgumentException("Invalid enrollment status: " + enrollmentStatus + 
                    ". Valid values are: FULL_TIME, PART_TIME, INACTIVE");
        }
    }

    /**
     * Validate grade values
     */
    public void validateGrade(String grade) {
        if (grade == null || grade.trim().isEmpty()) {
            throw new IllegalArgumentException("Grade cannot be null or empty");
        }
        
        List<String> validGrades = Arrays.asList("A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", 
            "D+", "D", "D-", "F", "I", "W", "P", "NP", "AU");
        
        String upperGrade = grade.toUpperCase().trim();
        if (!validGrades.contains(upperGrade)) {
            throw new IllegalArgumentException("Invalid grade: " + grade + 
                ". Valid grades are: " + String.join(", ", validGrades));
        }
    }

    /**
     * Private helper method to validate prerequisites
     */
    private void validatePrerequisites(Long userId, String prerequisites) {
        String[] prereqCodes = prerequisites.split(",");
        
        for (String prereqCode : prereqCodes) {
            String trimmedCode = prereqCode.trim();
            if (!trimmedCode.isEmpty()) {
                // Check if student has completed the prerequisite course
                boolean hasPrerequisite = registrationRepository.existsByUserIdAndCourseCodeAndGradeNotIn(
                    userId, trimmedCode, Arrays.asList("F", "I", "W", "NP"));
                
                if (!hasPrerequisite) {
                    throw new IllegalArgumentException("Student has not completed prerequisite course: " + trimmedCode);
                }
            }
        }
    }

    /**
     * Private helper method to validate semester credit hours
     */
    private void validateSemesterCreditHours(Long userId, Integer additionalCredits) {
        // Get current semester registrations (simplified - assumes current semester)
        List<Registration> currentRegistrations = registrationRepository.findByUserIdAndStatus(userId, RegistrationStatus.ENROLLED);
        
        int currentCredits = currentRegistrations.stream()
            .mapToInt(reg -> reg.getCourse().getCredits())
            .sum();
        
        int totalCredits = currentCredits + additionalCredits;
        
        if (totalCredits > 21) {
            throw new IllegalArgumentException("Total credit hours for semester cannot exceed 21. " +
                "Current: " + currentCredits + ", Additional: " + additionalCredits + ", Total: " + totalCredits);
        }
    }

    /**
     * Validate payment amount
     */
    public void validatePaymentAmount(BigDecimal amount) {
        if (amount == null) {
            throw new IllegalArgumentException("Payment amount cannot be null");
        }
        
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive, provided: " + amount);
        }
        
        if (amount.compareTo(new BigDecimal("50000.00")) > 0) {
            throw new IllegalArgumentException("Payment amount cannot exceed $50,000.00, provided: " + amount);
        }
        
        // Check for reasonable precision (max 2 decimal places for currency)
        if (amount.scale() > 2) {
            throw new IllegalArgumentException("Payment amount cannot have more than 2 decimal places");
        }
    }

    /**
     * Validate date ranges
     */
    public void validateDateRange(LocalDate startDate, LocalDate endDate, String context) {
        if (startDate == null) {
            throw new IllegalArgumentException(context + " start date cannot be null");
        }
        
        if (endDate == null) {
            throw new IllegalArgumentException(context + " end date cannot be null");
        }
        
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException(context + " start date (" + startDate + 
                ") cannot be after end date (" + endDate + ")");
        }
        
        // Check for reasonable date ranges (not more than 10 years)
        if (startDate.plusYears(10).isBefore(endDate)) {
            throw new IllegalArgumentException(context + " date range cannot exceed 10 years");
        }
    }
}