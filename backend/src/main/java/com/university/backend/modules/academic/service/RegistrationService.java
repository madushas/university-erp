package com.university.backend.modules.academic.service;

import com.university.backend.modules.academic.dto.RegistrationDto;
import com.university.backend.modules.core.mapper.DtoMapper;
import com.university.backend.modules.academic.entity.Course;
import com.university.backend.modules.academic.entity.Registration;
import com.university.backend.modules.academic.entity.RegistrationStatus;
import com.university.backend.modules.core.entity.User;
import com.university.backend.exception.*;
import com.university.backend.modules.academic.repository.CourseRepository;
import com.university.backend.modules.academic.repository.RegistrationRepository;
import com.university.backend.modules.core.repository.UserRepository;
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

        if (registrationRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new DuplicateRegistrationException("User is already enrolled in this course");
        }

        Long enrolledCount = registrationRepository.countEnrolledStudentsByCourseId(courseId);
        if (enrolledCount >= course.getMaxStudents()) {
            throw new CourseFullException("Course is full. Maximum students: " + course.getMaxStudents());
        }

        Registration registration = Registration.builder()
            .user(user)
            .course(course)
            .status(RegistrationStatus.PENDING)
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

        if (registrationRepository.existsByUserIdAndCourseId(user.getId(), courseId)) {
            throw new DuplicateRegistrationException("User is already enrolled in this course");
        }

        Long enrolledCount = registrationRepository.countEnrolledStudentsByCourseId(courseId);
        if (enrolledCount >= course.getMaxStudents()) {
            throw new CourseFullException("Course is full. Maximum students: " + course.getMaxStudents());
        }

        Registration registration = Registration.builder()
            .user(user)
            .course(course)
            .status(RegistrationStatus.PENDING)
            .build();

        Registration savedRegistration = registrationRepository.save(registration);
        log.info("User {} successfully enrolled in course {}", username, courseId);

        return dtoMapper.toRegistrationDto(savedRegistration);
    }

    public RegistrationDto updateRegistrationGrade(Long registrationId, String grade) {
        log.info("Updating grade for registration: {} to {}", registrationId, grade);

        Registration registration = registrationRepository.findById(registrationId)
            .orElseThrow(() -> new RegistrationNotFoundException("Registration not found with id: " + registrationId));

        registration.setGrade(grade);
        if (grade != null && !grade.trim().isEmpty()) {
            registration.setStatus(RegistrationStatus.COMPLETED);
        }

        Registration updatedRegistration = registrationRepository.save(registration);
        log.info("Grade updated successfully for registration: {}", registrationId);

        return dtoMapper.toRegistrationDto(updatedRegistration);
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
}