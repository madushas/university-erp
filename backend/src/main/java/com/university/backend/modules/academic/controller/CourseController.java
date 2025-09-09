package com.university.backend.modules.academic.controller;


import com.university.backend.dto.request.CourseRequest;
import com.university.backend.modules.academic.dto.CourseDto;
import com.university.backend.modules.academic.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
@Tag(name = "Course Management", description = "Course management APIs")
@SecurityRequirement(name = "bearerAuth")
public class CourseController {

    private final CourseService courseService;

    @Operation(summary = "Get all courses", description = "Retrieve all courses (accessible by students and admins)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved courses"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<CourseDto>> getAllCourses() {
        List<CourseDto> courses = courseService.getAllCourses();
        return ResponseEntity.ok(courses);
    }

    @Operation(summary = "Get courses with pagination", description = "Retrieve paginated courses")
    @GetMapping("/paged")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<Page<CourseDto>> getCoursesPaged(
        @PageableDefault(size = 10, sort = "title", direction = Sort.Direction.ASC) Pageable pageable,
        @RequestParam(required = false) String title,
        @RequestParam(required = false) String code,
        @RequestParam(required = false) String department,
        @RequestParam(required = false) String courseLevel,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) Integer creditsMin,
        @RequestParam(required = false) Integer creditsMax,
        @RequestParam(required = false, name = "instructorName") String instructorName
    ) {
        Page<CourseDto> courses = courseService.getCoursesPagedFiltered(
            pageable,
            title,
            code,
            department,
            courseLevel,
            status,
            creditsMin,
            creditsMax,
            instructorName
        );
        return ResponseEntity.ok(courses);
    }

    @Operation(summary = "Get course by ID", description = "Retrieve a specific course by its ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<CourseDto> getCourseById(
        @Parameter(description = "Course ID") @PathVariable Long id) {
        CourseDto course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }

    @Operation(summary = "Get course by code", description = "Retrieve a specific course by its code")
    @GetMapping("/code/{code}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<CourseDto> getCourseByCode(
        @Parameter(description = "Course code") @PathVariable String code) {
        CourseDto course = courseService.getCourseByCode(code);
        return ResponseEntity.ok(course);
    }

    @Operation(summary = "Get available courses", description = "Retrieve courses that are not full")
    @GetMapping("/available")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<CourseDto>> getAvailableCourses() {
        List<CourseDto> courses = courseService.getAvailableCourses();
        return ResponseEntity.ok(courses);
    }

    @Operation(summary = "Search courses by title", description = "Search courses by title (case-insensitive)")
    @GetMapping("/search")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<CourseDto>> searchCoursesByTitle(
        @Parameter(description = "Title to search for") @RequestParam String title) {
        List<CourseDto> courses = courseService.searchCoursesByTitle(title);
        return ResponseEntity.ok(courses);
    }

    @Operation(summary = "Get courses by instructor", description = "Retrieve courses by instructor name")
    @GetMapping("/instructor/{instructor}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<CourseDto>> getCoursesByInstructor(
        @Parameter(description = "Instructor name") @PathVariable String instructor) {
        List<CourseDto> courses = courseService.getCoursesByInstructor(instructor);
        return ResponseEntity.ok(courses);
    }

    @Operation(summary = "Get my courses as instructor", description = "Retrieve courses assigned to current instructor")
    @GetMapping("/my")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<CourseDto>> getMyCourses(Authentication authentication) {
        String username = authentication.getName();
        List<CourseDto> courses = courseService.getCoursesByCurrentInstructor(username);
        return ResponseEntity.ok(courses);
    }

    @Operation(summary = "Create a new course", description = "Create a new course (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Course created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request body"),
        @ApiResponse(responseCode = "403", description = "Access denied - admin role required"),
        @ApiResponse(responseCode = "409", description = "Course code already exists")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseDto> createCourse(@Valid @RequestBody CourseRequest request) {
        CourseDto course = courseService.createCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(course);
    }

    @Operation(summary = "Update a course", description = "Update an existing course (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Course updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request body"),
        @ApiResponse(responseCode = "403", description = "Access denied - admin role required"),
        @ApiResponse(responseCode = "404", description = "Course not found"),
        @ApiResponse(responseCode = "409", description = "Course code already exists")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseDto> updateCourse(
        @Parameter(description = "Course ID") @PathVariable Long id,
        @Valid @RequestBody CourseRequest request) {
        CourseDto course = courseService.updateCourse(id, request);
        return ResponseEntity.ok(course);
    }

    @Operation(summary = "Delete a course", description = "Delete a course (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Course deleted successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied - admin role required"),
        @ApiResponse(responseCode = "404", description = "Course not found"),
        @ApiResponse(responseCode = "400", description = "Cannot delete course with active registrations")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCourse(
        @Parameter(description = "Course ID") @PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
}