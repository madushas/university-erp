package com.university.backend.service;

import com.university.backend.dto.request.CourseRequest;
import com.university.backend.dto.response.CourseResponse;
import com.university.backend.entity.Course;
import com.university.backend.exception.CourseNotFoundException;
import com.university.backend.exception.CourseAlreadyExistsException;
import com.university.backend.repository.CourseRepository;
import com.university.backend.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CourseService {

    private final CourseRepository courseRepository;
    private final RegistrationRepository registrationRepository;

    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourses() {
        log.info("Fetching all courses");
        return courseRepository.findAll()
            .stream()
            .map(this::mapToCourseResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<CourseResponse> getAllCoursesPaged(Pageable pageable) {
        log.info("Fetching courses with pagination: page {}, size {}", pageable.getPageNumber(), pageable.getPageSize());
        return courseRepository.findAll(pageable)
            .map(this::mapToCourseResponse);
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long id) {
        log.info("Fetching course with id: {}", id);
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new CourseNotFoundException("Course not found with id: " + id));
        return mapToCourseResponse(course);
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseByCode(String code) {
        log.info("Fetching course with code: {}", code);
        Course course = courseRepository.findByCode(code)
            .orElseThrow(() -> new CourseNotFoundException("Course not found with code: " + code));
        return mapToCourseResponse(course);
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getAvailableCourses() {
        log.info("Fetching available courses (not full)");
        return courseRepository.findAvailableCourses()
            .stream()
            .map(this::mapToCourseResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> searchCoursesByTitle(String title) {
        log.info("Searching courses by title: {}", title);
        return courseRepository.findByTitleContainingIgnoreCase(title)
            .stream()
            .map(this::mapToCourseResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getCoursesByInstructor(String instructor) {
        log.info("Fetching courses by instructor: {}", instructor);
        return courseRepository.findByInstructorContainingIgnoreCase(instructor)
            .stream()
            .map(this::mapToCourseResponse)
            .collect(Collectors.toList());
    }

    public CourseResponse createCourse(CourseRequest request) {
        log.info("Creating new course with code: {}", request.getCode());
        
        if (courseRepository.existsByCode(request.getCode())) {
            throw new CourseAlreadyExistsException("Course with code '" + request.getCode() + "' already exists");
        }

        Course course = Course.builder()
            .code(request.getCode())
            .title(request.getTitle())
            .description(request.getDescription())
            .instructor(request.getInstructor())
            .schedule(request.getSchedule())
            .credits(request.getCredits())
            .maxStudents(request.getMaxStudents())
            .build();

        Course savedCourse = courseRepository.save(course);
        log.info("Course created successfully with id: {}", savedCourse.getId());
        
        return mapToCourseResponse(savedCourse);
    }

    public CourseResponse updateCourse(Long id, CourseRequest request) {
        log.info("Updating course with id: {}", id);
        
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new CourseNotFoundException("Course not found with id: " + id));

        // Check if code is being changed and if new code already exists
        if (!course.getCode().equals(request.getCode()) && 
            courseRepository.existsByCode(request.getCode())) {
            throw new CourseAlreadyExistsException("Course with code '" + request.getCode() + "' already exists");
        }

        course.setCode(request.getCode());
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setInstructor(request.getInstructor());
        course.setSchedule(request.getSchedule());
        course.setCredits(request.getCredits());
        course.setMaxStudents(request.getMaxStudents());

        Course updatedCourse = courseRepository.save(course);
        log.info("Course updated successfully with id: {}", updatedCourse.getId());
        
        return mapToCourseResponse(updatedCourse);
    }

    public void deleteCourse(Long id) {
        log.info("Deleting course with id: {}", id);
        
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new CourseNotFoundException("Course not found with id: " + id));

        // Check if course has active registrations
        Long enrolledCount = registrationRepository.countEnrolledStudentsByCourseId(id);
        if (enrolledCount > 0) {
            throw new RuntimeException("Cannot delete course with active registrations. Current enrollments: " + enrolledCount);
        }

        courseRepository.delete(course);
        log.info("Course deleted successfully with id: {}", id);
    }

    private CourseResponse mapToCourseResponse(Course course) {
        Long enrolledStudents = registrationRepository.countEnrolledStudentsByCourseId(course.getId());
        
        return CourseResponse.builder()
            .id(course.getId())
            .code(course.getCode())
            .title(course.getTitle())
            .description(course.getDescription())
            .instructor(course.getInstructor())
            .schedule(course.getSchedule())
            .credits(course.getCredits())
            .maxStudents(course.getMaxStudents())
            .enrolledStudents(enrolledStudents.intValue())
            .createdAt(course.getCreatedAt())
            .updatedAt(course.getUpdatedAt())
            .build();
    }
}
