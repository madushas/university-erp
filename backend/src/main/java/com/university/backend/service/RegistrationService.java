package com.university.backend.service;

import com.university.backend.dto.response.RegistrationResponse;
import com.university.backend.dto.response.UserResponse;
import com.university.backend.dto.response.CourseResponse;
import com.university.backend.entity.Course;
import com.university.backend.entity.Registration;
import com.university.backend.entity.RegistrationStatus;
import com.university.backend.entity.User;
import com.university.backend.exception.*;
import com.university.backend.repository.CourseRepository;
import com.university.backend.repository.RegistrationRepository;
import com.university.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getUserRegistrations(Long userId) {
        log.info("Fetching registrations for user: {}", userId);
        return registrationRepository.findByUserIdWithDetails(userId)
            .stream()
            .map(this::mapToRegistrationResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getCourseRegistrations(Long courseId) {
        log.info("Fetching registrations for course: {}", courseId);
        return registrationRepository.findByCourseIdWithDetails(courseId)
            .stream()
            .map(this::mapToRegistrationResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RegistrationResponse getRegistration(Long id) {
        log.info("Fetching registration with id: {}", id);
        Registration registration = registrationRepository.findById(id)
            .orElseThrow(() -> new RegistrationNotFoundException("Registration not found with id: " + id));
        return mapToRegistrationResponse(registration);
    }

    public RegistrationResponse enrollUserInCourse(Long userId, Long courseId) {
        log.info("Enrolling user {} in course {}", userId, courseId);

        // Check if user exists
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Check if course exists
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new CourseNotFoundException("Course not found with id: " + courseId));

        // Check if user is already enrolled
        if (registrationRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new DuplicateRegistrationException("User is already enrolled in this course");
        }

        // Check if course is full
        Long enrolledCount = registrationRepository.countEnrolledStudentsByCourseId(courseId);
        if (enrolledCount >= course.getMaxStudents()) {
            throw new CourseFullException("Course is full. Maximum students: " + course.getMaxStudents());
        }

        Registration registration = Registration.builder()
            .user(user)
            .course(course)
            .status(RegistrationStatus.ENROLLED)
            .build();

        Registration savedRegistration = registrationRepository.save(registration);
        log.info("User {} successfully enrolled in course {}", userId, courseId);

        return mapToRegistrationResponse(savedRegistration);
    }

    public RegistrationResponse updateRegistrationGrade(Long registrationId, String grade) {
        log.info("Updating grade for registration: {} to {}", registrationId, grade);

        Registration registration = registrationRepository.findById(registrationId)
            .orElseThrow(() -> new RegistrationNotFoundException("Registration not found with id: " + registrationId));

        registration.setGrade(grade);
        if (grade != null && !grade.trim().isEmpty()) {
            registration.setStatus(RegistrationStatus.COMPLETED);
        }

        Registration updatedRegistration = registrationRepository.save(registration);
        log.info("Grade updated successfully for registration: {}", registrationId);

        return mapToRegistrationResponse(updatedRegistration);
    }

    public RegistrationResponse updateRegistrationStatus(Long registrationId, RegistrationStatus status) {
        log.info("Updating status for registration: {} to {}", registrationId, status);

        Registration registration = registrationRepository.findById(registrationId)
            .orElseThrow(() -> new RegistrationNotFoundException("Registration not found with id: " + registrationId));

        registration.setStatus(status);
        Registration updatedRegistration = registrationRepository.save(registration);
        log.info("Status updated successfully for registration: {}", registrationId);

        return mapToRegistrationResponse(updatedRegistration);
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

    public void deleteRegistration(Long registrationId) {
        log.info("Deleting registration: {}", registrationId);

        Registration registration = registrationRepository.findById(registrationId)
            .orElseThrow(() -> new RegistrationNotFoundException("Registration not found with id: " + registrationId));

        registrationRepository.delete(registration);
        log.info("Registration deleted successfully: {}", registrationId);
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getRegistrationsByStatus(RegistrationStatus status) {
        log.info("Fetching registrations by status: {}", status);
        return registrationRepository.findByStatus(status)
            .stream()
            .map(this::mapToRegistrationResponse)
            .collect(Collectors.toList());
    }

    private RegistrationResponse mapToRegistrationResponse(Registration registration) {
        UserResponse userResponse = UserResponse.builder()
            .id(registration.getUser().getId())
            .username(registration.getUser().getUsername())
            .email(registration.getUser().getEmail())
            .firstName(registration.getUser().getFirstName())
            .lastName(registration.getUser().getLastName())
            .role(registration.getUser().getRole().name())
            .build();

        CourseResponse courseResponse = CourseResponse.builder()
            .id(registration.getCourse().getId())
            .code(registration.getCourse().getCode())
            .title(registration.getCourse().getTitle())
            .description(registration.getCourse().getDescription())
            .instructor(registration.getCourse().getInstructor())
            .schedule(registration.getCourse().getSchedule())
            .credits(registration.getCourse().getCredits())
            .maxStudents(registration.getCourse().getMaxStudents())
            .build();

        return RegistrationResponse.builder()
            .id(registration.getId())
            .user(userResponse)
            .course(courseResponse)
            .registrationDate(registration.getRegistrationDate())
            .grade(registration.getGrade())
            .status(registration.getStatus().name())
            .build();
    }
}
