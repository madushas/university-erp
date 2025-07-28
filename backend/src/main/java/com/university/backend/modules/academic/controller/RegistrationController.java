package com.university.backend.modules.academic.controller;

import com.university.backend.modules.academic.dto.RegistrationDto;
import com.university.backend.modules.academic.entity.RegistrationStatus;
import com.university.backend.modules.academic.service.RegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/registrations")
@RequiredArgsConstructor
@Tag(name = "Registration Management", description = "Course registration management APIs")
@SecurityRequirement(name = "bearerAuth")
public class RegistrationController {

    private final RegistrationService registrationService;

    @Operation(summary = "Get user registrations", description = "Get all registrations for a specific user")
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and #userId == authentication.principal.id)")
    public ResponseEntity<List<RegistrationDto>> getUserRegistrations(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        List<RegistrationDto> registrations = registrationService.getUserRegistrations(userId);
        return ResponseEntity.ok(registrations);
    }

    @Operation(summary = "Get my registrations", description = "Get all registrations for the current user")
    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<List<RegistrationDto>> getMyRegistrations() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        List<RegistrationDto> registrations = registrationService.getUserRegistrationsByUsername(username);
        return ResponseEntity.ok(registrations);
    }

    @Operation(summary = "Get course registrations", description = "Get all registrations for a specific course (admin only)")
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RegistrationDto>> getCourseRegistrations(
            @Parameter(description = "Course ID") @PathVariable Long courseId) {
        List<RegistrationDto> registrations = registrationService.getCourseRegistrations(courseId);
        return ResponseEntity.ok(registrations);
    }

    @Operation(summary = "Get registration by ID", description = "Get a specific registration by ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and @registrationService.getRegistration(#id).user.id == authentication.principal.id)")
    public ResponseEntity<RegistrationDto> getRegistration(
            @Parameter(description = "Registration ID") @PathVariable Long id) {
        RegistrationDto registration = registrationService.getRegistration(id);
        return ResponseEntity.ok(registration);
    }

    @Operation(summary = "Register for course", description = "Register the current user for a course")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Successfully registered for course"),
            @ApiResponse(responseCode = "400", description = "Course is full or user already registered"),
            @ApiResponse(responseCode = "404", description = "Course not found")
    })
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<RegistrationDto> registerForCourse(
            @RequestBody com.university.backend.dto.request.RegistrationRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        RegistrationDto registration = registrationService.enrollUserInCourseByUsername(username,
                request.getCourseId());
        return ResponseEntity.status(HttpStatus.CREATED).body(registration);
    }

    @Operation(summary = "Enroll in course", description = "Enroll the current user in a course")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Successfully enrolled in course"),
            @ApiResponse(responseCode = "400", description = "Course is full or user already enrolled"),
            @ApiResponse(responseCode = "404", description = "Course not found")
    })
    @PostMapping("/enroll/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<RegistrationDto> enrollInCourse(
            @Parameter(description = "Course ID") @PathVariable Long courseId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        RegistrationDto registration = registrationService.enrollUserInCourseByUsername(username, courseId);
        return ResponseEntity.status(HttpStatus.CREATED).body(registration);
    }

    @Operation(summary = "Admin enroll user", description = "Enroll a specific user in a course (admin only)")
    @PostMapping("/admin/enroll/{userId}/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RegistrationDto> adminEnrollUser(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @Parameter(description = "Course ID") @PathVariable Long courseId) {
        RegistrationDto registration = registrationService.enrollUserInCourse(userId, courseId);
        return ResponseEntity.status(HttpStatus.CREATED).body(registration);
    }

    @Operation(summary = "Update registration grade", description = "Update the grade for a registration (admin only)")
    @PutMapping("/{id}/grade")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RegistrationDto> updateGrade(
            @Parameter(description = "Registration ID") @PathVariable Long id,
            @Parameter(description = "Grade") @RequestParam String grade) {
        RegistrationDto registration = registrationService.updateRegistrationGrade(id, grade);
        return ResponseEntity.ok(registration);
    }

    @Operation(summary = "Update registration status", description = "Update the status of a registration")
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and @registrationService.getRegistration(#id).user.id == authentication.principal.id)")
    public ResponseEntity<RegistrationDto> updateStatus(
            @Parameter(description = "Registration ID") @PathVariable Long id,
            @Parameter(description = "Status") @RequestParam RegistrationStatus status) {
        RegistrationDto registration = registrationService.updateRegistrationStatus(id, status);
        return ResponseEntity.ok(registration);
    }

    @Operation(summary = "Drop course", description = "Drop a course for the current user")
    @DeleteMapping("/drop/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> dropCourse(
            @Parameter(description = "Course ID") @PathVariable Long courseId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        registrationService.dropCourseByUsername(username, courseId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Delete registration", description = "Delete a registration (admin only)")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRegistration(
            @Parameter(description = "Registration ID") @PathVariable Long id) {
        registrationService.deleteRegistration(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get registrations by status", description = "Get all registrations with a specific status (admin only)")
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RegistrationDto>> getRegistrationsByStatus(
            @Parameter(description = "Registration status") @PathVariable RegistrationStatus status) {
        List<RegistrationDto> registrations = registrationService.getRegistrationsByStatus(status);
        return ResponseEntity.ok(registrations);
    }
}
