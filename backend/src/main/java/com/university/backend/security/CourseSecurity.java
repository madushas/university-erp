package com.university.backend.security;

import com.university.backend.modules.academic.entity.Course;
import com.university.backend.modules.academic.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Security helper used in @PreAuthorize expressions to validate
 * whether the current authenticated instructor teaches a given course.
 */
@Component("courseSecurity")
@RequiredArgsConstructor
@Slf4j
public class CourseSecurity {

    private final CourseRepository courseRepository;

    /**
     * Returns true if the currently authenticated user is the instructor of the given course ID.
     */
    public boolean isInstructorOfCourse(Long courseId) {
        try {
            if (courseId == null) return false;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) return false;

            String username = auth.getName();
            Optional<Course> courseOpt = courseRepository.findById(courseId);
            if (courseOpt.isEmpty()) return false;

            Course course = courseOpt.get();
            if (course.getInstructor() == null || course.getInstructor().getUsername() == null) {
                return false;
            }
            return username.equals(course.getInstructor().getUsername());
        } catch (Exception ex) {
            log.warn("CourseSecurity.isInstructorOfCourse check failed for courseId={}: {}", courseId, ex.getMessage());
            return false;
        }
    }
}
