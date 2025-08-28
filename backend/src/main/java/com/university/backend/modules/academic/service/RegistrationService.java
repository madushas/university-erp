package com.university.backend.modules.academic.service;

import com.university.backend.modules.academic.dto.RegistrationDto;
import com.university.backend.modules.core.mapper.DtoMapper;
import com.university.backend.modules.academic.entity.*;
import com.university.backend.modules.core.entity.User;
import com.university.backend.exception.*;
import com.university.backend.modules.academic.repository.*;
import com.university.backend.modules.core.repository.UserRepository;
import com.university.backend.modules.student.entity.StudentAcademicRecord;
import com.university.backend.modules.student.repository.StudentAcademicRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalTime;
import java.util.Arrays;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CoursePrerequisiteRepository coursePrerequisiteRepository;
    private final StudentAcademicRecordRepository studentAcademicRecordRepository;
    private final DtoMapper dtoMapper;

    @Transactional(readOnly = true)
    public List<RegistrationDto> getUserRegistrations(Long userId) {
        log.info("Fetching registrations for user: {}", userId);
        return registrationRepository.findByUserIdWithDetails(userId)
            .stream()
            .map(dtoMapper::toRegistrationDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RegistrationDto> getUserRegistrationsByUsername(String username) {
        log.info("Fetching registrations for user: {}", username);
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        return registrationRepository.findByUserIdWithDetails(user.getId())
            .stream()
            .map(dtoMapper::toRegistrationDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RegistrationDto> getCourseRegistrations(Long courseId) {
        log.info("Fetching registrations for course: {}", courseId);
        
        // Validate course ID
        if (courseId == null) {
            throw new IllegalArgumentException("Course ID cannot be null");
        }
        
        // Check if course exists
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new CourseNotFoundException("Course not found with id: " + courseId));
        
        return registrationRepository.findByCourseIdWithDetails(courseId)
            .stream()
            .map(dtoMapper::toRegistrationDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RegistrationDto getRegistration(Long id) {
        log.info("Fetching registration with id: {}", id);
        Registration registration = registrationRepository.findById(id)
            .orElseThrow(() -> new RegistrationNotFoundException("Registration not found with id: " + id));
        return dtoMapper.toRegistrationDto(registration);
    }

    public RegistrationDto enrollUserInCourse(Long userId, Long courseId) {
        log.info("Enrolling user {} in course {}", userId, courseId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new CourseNotFoundException("Course not found with id: " + courseId));

        // Validate enrollment eligibility
        validateEnrollmentEligibility(user, course);

        Registration registration = Registration.builder()
            .user(user)
            .course(course)
            .status(RegistrationStatus.ENROLLED)  // Changed from PENDING to ENROLLED
            .courseFeePaid(course.getCourseFee() != null ? course.getCourseFee() : BigDecimal.ZERO)
            .paymentStatus(PaymentStatus.PENDING)
            .build();

        Registration savedRegistration = registrationRepository.save(registration);
        log.info("User {} successfully enrolled in course {}", userId, courseId);

        return dtoMapper.toRegistrationDto(savedRegistration);
    }

    public RegistrationDto enrollUserInCourseByUsername(String username, Long courseId) {
        log.info("Enrolling user {} in course {}", username, courseId);

        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new CourseNotFoundException("Course not found with id: " + courseId));

        // Check if user is already enrolled
        if (registrationRepository.existsByUserIdAndCourseId(user.getId(), courseId)) {
            log.warn("User {} is already enrolled in course {}", username, courseId);
            // Instead of throwing exception, return existing registration
            Registration existingRegistration = registrationRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new RuntimeException("Registration exists but not found"));
            return dtoMapper.toRegistrationDto(existingRegistration);
        }

        // Validate enrollment eligibility
        validateEnrollmentEligibility(user, course);

        Registration registration = Registration.builder()
            .user(user)
            .course(course)
            .status(RegistrationStatus.ENROLLED)  // Set to ENROLLED instead of PENDING
            .courseFeePaid(course.getCourseFee() != null ? course.getCourseFee() : BigDecimal.ZERO)
            .paymentStatus(PaymentStatus.PENDING)
            .build();

        Registration savedRegistration = registrationRepository.save(registration);
        log.info("User {} successfully enrolled in course {}", username, courseId);

        return dtoMapper.toRegistrationDto(savedRegistration);
    }

    public RegistrationDto updateRegistrationGrade(Long registrationId, String grade) {
        log.info("Updating grade for registration: {} to {}", registrationId, grade);

        // Validate input parameters
        if (registrationId == null) {
            throw new IllegalArgumentException("Registration ID cannot be null");
        }
        if (grade == null || grade.trim().isEmpty()) {
            throw new IllegalArgumentException("Grade cannot be null or empty");
        }

        Registration registration = registrationRepository.findById(registrationId)
            .orElseThrow(() -> new RegistrationNotFoundException("Registration not found with id: " + registrationId));

        // Validate grade format (basic validation)
        String trimmedGrade = grade.trim().toUpperCase();
        if (!isValidGrade(trimmedGrade)) {
            log.warn("Invalid grade format: {}", grade);
            // Don't throw exception, just log warning and proceed
        }

        registration.setGrade(trimmedGrade);
        if (!trimmedGrade.isEmpty()) {
            registration.setStatus(RegistrationStatus.COMPLETED);
        }

        Registration updatedRegistration = registrationRepository.save(registration);
        log.info("Grade updated successfully for registration: {}", registrationId);

        return dtoMapper.toRegistrationDto(updatedRegistration);
    }

    private boolean isValidGrade(String grade) {
        // Basic grade validation - accept common grade formats
        if (grade == null || grade.trim().isEmpty()) {
            return false;
        }
        String trimmed = grade.trim().toUpperCase();
        // Accept letter grades with optional +/- and common formats
        return trimmed.matches("^[A-F][+-]?$|^[A-F]$|^PASS$|^FAIL$|^INCOMPLETE$|^WITHDRAW$");
    }

    public RegistrationDto updateRegistrationStatus(Long registrationId, RegistrationStatus status) {
        log.info("Updating status for registration: {} to {}", registrationId, status);

        Registration registration = registrationRepository.findById(registrationId)
            .orElseThrow(() -> new RegistrationNotFoundException("Registration not found with id: " + registrationId));

        registration.setStatus(status);
        Registration updatedRegistration = registrationRepository.save(registration);
        log.info("Status updated successfully for registration: {}", registrationId);

        return dtoMapper.toRegistrationDto(updatedRegistration);
    }

    public void dropCourse(Long userId, Long courseId) {
        log.info("Dropping course {} for user {}", courseId, userId);

        Registration registration = registrationRepository.findByUserIdAndCourseId(userId, courseId)
            .orElseThrow(() -> new RegistrationNotFoundException(
                "Registration not found for user " + userId + " and course " + courseId));

        registration.setStatus(RegistrationStatus.DROPPED);
        registrationRepository.save(registration);
        log.info("Course {} dropped successfully for user {}", courseId, userId);
    }

    public void dropCourseByUsername(String username, Long courseId) {
        log.info("Dropping course {} for user {}", courseId, username);

        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        Registration registration = registrationRepository.findByUserIdAndCourseId(user.getId(), courseId)
            .orElseThrow(() -> new RegistrationNotFoundException(
                "Registration not found for user " + username + " and course " + courseId));

        registration.setStatus(RegistrationStatus.DROPPED);
        registrationRepository.save(registration);
        log.info("Course {} dropped successfully for user {}", courseId, username);
    }

    public void deleteRegistration(Long registrationId) {
        log.info("Deleting registration: {}", registrationId);

        Registration registration = registrationRepository.findById(registrationId)
            .orElseThrow(() -> new RegistrationNotFoundException("Registration not found with id: " + registrationId));

        registrationRepository.delete(registration);
        log.info("Registration deleted successfully: {}", registrationId);
    }

    @Transactional(readOnly = true)
    public List<RegistrationDto> getRegistrationsByStatus(RegistrationStatus status) {
        log.info("Fetching registrations with status: {}", status);
        return registrationRepository.findByStatus(status)
            .stream()
            .map(dtoMapper::toRegistrationDto)
            .collect(Collectors.toList());
    }

    /**
     * Validate enrollment eligibility for a student in a course
     */
    private void validateEnrollmentEligibility(User user, Course course) {
        // Basic validation - check if already enrolled
        if (registrationRepository.existsByUserIdAndCourseId(user.getId(), course.getId())) {
            throw new RuntimeException("Student is already enrolled in this course");
        }

        // Check course capacity
        if (course.getMaxStudents() != null) {
            long currentEnrollment = registrationRepository.countByCourseIdAndStatus(course.getId(), RegistrationStatus.ENROLLED);
            if (currentEnrollment >= course.getMaxStudents()) {
                throw new RuntimeException("Course has reached maximum capacity (" + course.getMaxStudents() + " students)");
            }
        }

        // Additional validations can be added here as the entity structure allows
    }

    /**
     * Calculate and update GPA for a student based on completed registrations
     */
    public BigDecimal calculateAndUpdateGPA(Long userId) {
        log.info("Calculating GPA for user: {}", userId);

        List<Registration> completedRegistrations = registrationRepository.findByUserIdAndStatus(userId, RegistrationStatus.COMPLETED);
        
        if (completedRegistrations.isEmpty()) {
            return BigDecimal.ZERO;
        }

        double totalQualityPoints = 0.0;
        int totalCredits = 0;

        for (Registration registration : completedRegistrations) {
            if (registration.getGrade() != null && registration.getCourse() != null) {
                double gradePoints = getGradeValue(registration.getGrade());
                int credits = registration.getCourse().getCredits();
                
                // Update grade points in registration if not set
                if (registration.getGradePoints() == null) {
                    registration.setGradePoints(gradePoints);
                    registrationRepository.save(registration);
                }
                
                totalQualityPoints += gradePoints * credits;
                totalCredits += credits;
            }
        }

        BigDecimal gpa = totalCredits > 0 ? 
            BigDecimal.valueOf(totalQualityPoints / totalCredits).setScale(3, RoundingMode.HALF_UP) : 
            BigDecimal.ZERO;

        log.info("Calculated GPA {} for user {}", gpa, userId);
        return gpa;
    }

    /**
     * Convert letter grade to numeric value for comparison
     */
    private double getGradeValue(String grade) {
        if (grade == null || grade.isEmpty()) return 0.0;
        
        switch (grade.charAt(0)) {
            case 'A': return 4.0 + getModifier(grade);
            case 'B': return 3.0 + getModifier(grade);
            case 'C': return 2.0 + getModifier(grade);
            case 'D': return 1.0 + getModifier(grade);
            case 'F': return 0.0;
            default: 
                if (grade.equals("PASS") || grade.equals("P")) return 2.0;
                if (grade.equals("FAIL") || grade.equals("INCOMPLETE")) return 0.0;
                return 0.0;
        }
    }

    /**
     * Get grade modifier for + or - grades
     */
    private double getModifier(String grade) {
        if (grade.length() > 1) {
            char modifier = grade.charAt(1);
            if (modifier == '+') return 0.3;
            if (modifier == '-') return -0.3;
        }
        return 0.0;
    }

    /**
     * Generate billing for course registration
     */
    public void generateRegistrationBilling(Long registrationId) {
        log.info("Generating billing for registration: {}", registrationId);

        Registration registration = registrationRepository.findById(registrationId)
            .orElseThrow(() -> new RuntimeException("Registration not found with id: " + registrationId));

        Course course = registration.getCourse();

        if (course.getCourseFee() != null && course.getCourseFee().compareTo(BigDecimal.ZERO) > 0) {
            // Update registration with course fee
            registration.setCourseFeePaid(course.getCourseFee());
            registration.setPaymentStatus(PaymentStatus.PENDING);
            registrationRepository.save(registration);

            log.info("Generated billing of {} for registration {}", course.getCourseFee(), registrationId);
        }
    }
}