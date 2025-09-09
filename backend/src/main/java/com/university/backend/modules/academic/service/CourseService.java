package com.university.backend.modules.academic.service;

import com.university.backend.dto.request.CourseRequest;
import com.university.backend.modules.academic.dto.CourseDto;
import com.university.backend.modules.core.mapper.DtoMapper;
import com.university.backend.modules.academic.entity.Course;
import com.university.backend.modules.academic.entity.CourseStatus;
import com.university.backend.exception.CourseNotFoundException;
import com.university.backend.exception.CourseAlreadyExistsException;
import com.university.backend.modules.academic.repository.CourseRepository;
import com.university.backend.modules.academic.repository.RegistrationRepository;
import com.university.backend.modules.core.repository.UserRepository;
import com.university.backend.modules.core.entity.User;
import com.university.backend.modules.core.entity.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CourseService {

    private final CourseRepository courseRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final DtoMapper dtoMapper;

    @Cacheable("courses")
    @Transactional(readOnly = true)
    public List<CourseDto> getAllCourses() {
        log.info("Fetching all courses");
        return courseRepository.findAll()
            .stream()
            .map(dtoMapper::toCourseDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<CourseDto> getAllCoursesPaged(Pageable pageable) {
        log.info("Fetching courses with pagination: page {}, size {}", pageable.getPageNumber(), pageable.getPageSize());
        return courseRepository.findAll(pageable)
            .map(dtoMapper::toCourseDto);
    }

    @Transactional(readOnly = true)
    public Page<CourseDto> getCoursesPagedFiltered(
        Pageable pageable,
        String title,
        String code,
        String department,
        String courseLevel,
        String status,
        Integer creditsMin,
        Integer creditsMax,
        String instructorName
    ) {
        log.info("Fetching courses (filtered) with pagination: page {}, size {}", pageable.getPageNumber(), pageable.getPageSize());

        Specification<Course> spec = Specification.where(null);

        if (title != null && !title.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%"));
        }
        if (code != null && !code.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("code")), "%" + code.toLowerCase() + "%"));
        }
        if (department != null && !department.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("department")), department.toLowerCase()));
        }
        if (courseLevel != null && !courseLevel.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("courseLevel")), courseLevel.toLowerCase()));
        }
        if (status != null && !status.isBlank()) {
            try {
                CourseStatus cs = CourseStatus.valueOf(status.toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), cs));
            } catch (IllegalArgumentException ex) {
                log.warn("Ignoring invalid course status filter: {}", status);
            }
        }
        if (creditsMin != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("credits"), creditsMin));
        }
        if (creditsMax != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("credits"), creditsMax));
        }
        if (instructorName != null && !instructorName.isBlank()) {
            spec = spec.and((root, query, cb) -> {
                Join<Course, User> instructor = root.join("instructor", JoinType.LEFT);
                // CONCAT(firstName, ' ', lastName) ILIKE %instructorName%
                return cb.like(
                    cb.lower(cb.concat(cb.concat(instructor.get("firstName"), " "), instructor.get("lastName"))),
                    "%" + instructorName.toLowerCase() + "%"
                );
            });
        }

        return courseRepository.findAll(spec, pageable)
            .map(dtoMapper::toCourseDto);
    }

    @Cacheable(value = "courses", key = "#id")
    @Transactional(readOnly = true)
    public CourseDto getCourseById(Long id) {
        log.info("Fetching course with id: {}", id);
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new CourseNotFoundException("Course not found with id: " + id));
        return dtoMapper.toCourseDto(course);
    }

    @Transactional(readOnly = true)
    public CourseDto getCourseByCode(String code) {
        log.info("Fetching course with code: {}", code);
        Course course = courseRepository.findByCode(code)
            .orElseThrow(() -> new CourseNotFoundException("Course not found with code: " + code));
        return dtoMapper.toCourseDto(course);
    }

    @Transactional(readOnly = true)
    public List<CourseDto> getAvailableCourses() {
        log.info("Fetching available courses (not full)");
        return courseRepository.findAvailableCourses()
            .stream()
            .map(dtoMapper::toCourseDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CourseDto> searchCoursesByTitle(String title) {
        log.info("Searching courses by title: {}", title);
        return courseRepository.findByTitleContainingIgnoreCase(title)
            .stream()
            .map(dtoMapper::toCourseDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CourseDto> getCoursesByInstructor(String instructor) {
        log.info("Fetching courses by instructor username: {}", instructor);
        return courseRepository.findActiveCoursesByInstructorUsername(instructor)
            .stream()
            .map(dtoMapper::toCourseDto)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<CourseDto> getCoursesByCurrentInstructor(String username) {
        log.info("Fetching courses for current instructor: {}", username);
        User instructor = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("Instructor not found with username: " + username));
        
        return courseRepository.findActiveCoursesByInstructorId(instructor.getId())
            .stream()
            .map(dtoMapper::toCourseDto)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<CourseDto> getCoursesByInstructorId(Long instructorId) {
        log.info("Fetching courses by instructor ID: {}", instructorId);
        return courseRepository.findByInstructorId(instructorId)
            .stream()
            .map(dtoMapper::toCourseDto)
            .collect(Collectors.toList());
    }

    @CacheEvict(value = "courses", allEntries = true)
    public CourseDto createCourse(CourseRequest request) {
        log.info("Creating new course with code: {}", request.getCode());
        
        if (courseRepository.existsByCode(request.getCode())) {
            throw new CourseAlreadyExistsException("Course with code '" + request.getCode() + "' already exists");
        }

        // Validate and fetch instructor
        User instructor = userRepository.findById(request.getInstructorId())
            .orElseThrow(() -> new IllegalArgumentException("Instructor not found with id: " + request.getInstructorId()));
        
        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new IllegalArgumentException("User with id " + request.getInstructorId() + " is not an instructor");
        }

        Course course = Course.builder()
            .code(request.getCode())
            .title(request.getTitle())
            .description(request.getDescription())
            .instructor(instructor)
            .instructorEmail(instructor.getEmail())
            .department(request.getDepartment())
            .courseLevel(request.getCourseLevel())
            .schedule(request.getSchedule())
            .classroom(request.getClassroom())
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .startTime(request.getStartTime())
            .endTime(request.getEndTime())
            .daysOfWeek(request.getDaysOfWeek())
            .credits(request.getCredits())
            .maxStudents(request.getMaxStudents())
            .minStudents(request.getMinStudents())
            .courseFee(request.getCourseFee())
            .prerequisites(request.getPrerequisites())
            .status(request.getStatus() != null ? request.getStatus() : CourseStatus.DRAFT)
            .syllabusUrl(request.getSyllabusUrl())
            .textbook(request.getTextbook())
            .passingGrade(request.getPassingGrade() != null ? request.getPassingGrade() : "D")
            .build();

        Course savedCourse = courseRepository.save(course);
        log.info("Course created successfully with id: {}", savedCourse.getId());
        
        return dtoMapper.toCourseDto(savedCourse);
    }

    @CacheEvict(value = "courses", allEntries = true)
    public CourseDto updateCourse(Long id, CourseRequest request) {
        log.info("Updating course with id: {}", id);
        
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new CourseNotFoundException("Course not found with id: " + id));

        // Check if code is being changed and if new code already exists
        if (!course.getCode().equals(request.getCode()) && 
            courseRepository.existsByCode(request.getCode())) {
            throw new CourseAlreadyExistsException("Course with code '" + request.getCode() + "' already exists");
        }

        // Validate and fetch instructor
        User instructor = userRepository.findById(request.getInstructorId())
            .orElseThrow(() -> new IllegalArgumentException("Instructor not found with id: " + request.getInstructorId()));
        
        if (instructor.getRole() != Role.INSTRUCTOR) {
            throw new IllegalArgumentException("User with id " + request.getInstructorId() + " is not an instructor");
        }

        course.setCode(request.getCode());
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setInstructor(instructor);
        course.setInstructorEmail(instructor.getEmail());
        course.setDepartment(request.getDepartment());
        course.setCourseLevel(request.getCourseLevel());
        course.setSchedule(request.getSchedule());
        course.setClassroom(request.getClassroom());
        course.setStartDate(request.getStartDate());
        course.setEndDate(request.getEndDate());
        course.setStartTime(request.getStartTime());
        course.setEndTime(request.getEndTime());
        course.setDaysOfWeek(request.getDaysOfWeek());
        course.setCredits(request.getCredits());
        course.setMaxStudents(request.getMaxStudents());
        course.setMinStudents(request.getMinStudents());
        course.setCourseFee(request.getCourseFee());
        course.setPrerequisites(request.getPrerequisites());
        if (request.getStatus() != null) {
            course.setStatus(request.getStatus());
        }
        course.setSyllabusUrl(request.getSyllabusUrl());
        course.setTextbook(request.getTextbook());
        if (request.getPassingGrade() != null) {
            course.setPassingGrade(request.getPassingGrade());
        }

        Course updatedCourse = courseRepository.save(course);
        log.info("Course updated successfully with id: {}", updatedCourse.getId());
        
        return dtoMapper.toCourseDto(updatedCourse);
    }

    public void deleteCourse(Long id) {
        log.info("Deleting course with id: {}", id);
        
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new CourseNotFoundException("Course not found with id: " + id));

        // Check if course has active registrations
        Long enrolledCount = registrationRepository.countEnrolledStudentsByCourseId(id);
        if (enrolledCount > 0) {
            throw new IllegalStateException("Cannot delete course with active registrations. Current enrollments: " + enrolledCount);
        }

        courseRepository.delete(course);
        log.info("Course deleted successfully with id: {}", id);
    }
}