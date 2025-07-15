package com.university.backend.controller;

import com.university.backend.dto.response.RegistrationResponse;
import com.university.backend.entity.RegistrationStatus;
import com.university.backend.service.RegistrationService;
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
@RequestMapping("/registrations")
@RequiredArgsConstructor
@Tag(name = "Registration Management", description = "Course registration management APIs")
@SecurityRequirement(name = "bearerAuth")
public class RegistrationController {

    private final RegistrationService registrationService;

    @Operation(summary = "Get user registrations", description = "Get all registrations for a specific user")
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and #userId == authentication.principal.id)")
    public ResponseEntity<List<RegistrationResponse>> getUserRegistrations(
        @Parameter(description = "User ID") @PathVariable Long userId) {
        List<RegistrationResponse> registrations = registrationService.getUserRegistrations(userId);
        return ResponseEntity.ok(registrations);
    }

    @Operation(summary = "Get my registrations", description = "Get all registrations for the current user")
    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<List<RegistrationResponse>> getMyRegistrations() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        // For now, we'll need to get user ID through a service method
        // This will be implemented when we add UserService
        // List<RegistrationResponse> registrations = registrationService.getUserRegistrationsByUsername(username);
        return ResponseEntity.ok(List.of()); // Temporary placeholder
    }

    @Operation(summary = "Get course registrations", description = "Get all registrations for a specific course (admin only)")
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RegistrationResponse>> getCourseRegistrations(
        @Parameter(description = "Course ID") @PathVariable Long courseId) {
        List<RegistrationResponse> registrations = registrationService.getCourseRegistrations(courseId);
        return ResponseEntity.ok(registrations);
    }

    @Operation(summary = "Get registration by ID", description = "Get a specific registration by ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and @registrationService.getRegistration(#id).user.id == authentication.principal.id)")
    public ResponseEntity<RegistrationResponse> getRegistration(
        @Parameter(description = "Registration ID") @PathVariable Long id) {
        RegistrationResponse registration = registrationService.getRegistration(id);
        return ResponseEntity.ok(registration);
    }

    @Operation(summary = "Enroll in course", description = "Enroll the current user in a course")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Successfully enrolled in course"),
        @ApiResponse(responseCode = "400", description = "Course is full or user already enrolled"),
        @ApiResponse(responseCode = "404", description = "Course not found")
    })
    @PostMapping("/enroll/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<RegistrationResponse> enrollInCourse(
        @Parameter(description = "Course ID") @PathVariable Long courseId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        // For now, we'll need to get user ID through a service method
        // RegistrationResponse registration = registrationService.enrollUserInCourseByUsername(username, courseId);
        return ResponseEntity.status(HttpStatus.CREATED).body(null); // Temporary placeholder
    }

    @Operation(summary = "Admin enroll user", description = "Enroll a specific user in a course (admin only)")
    @PostMapping("/admin/enroll/{userId}/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RegistrationResponse> adminEnrollUser(
        @Parameter(description = "User ID") @PathVariable Long userId,
        @Parameter(description = "Course ID") @PathVariable Long courseId) {
        RegistrationResponse registration = registrationService.enrollUserInCourse(userId, courseId);
        return ResponseEntity.status(HttpStatus.CREATED).body(registration);
    }

    @Operation(summary = "Update registration grade", description = "Update the grade for a registration (admin only)")
    @PutMapping("/{id}/grade")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RegistrationResponse> updateGrade(
        @Parameter(description = "Registration ID") @PathVariable Long id,
        @Parameter(description = "Grade") @RequestParam String grade) {
        RegistrationResponse registration = registrationService.updateRegistrationGrade(id, grade);
        return ResponseEntity.ok(registration);
    }

    @Operation(summary = "Update registration status", description = "Update the status of a registration")
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and @registrationService.getRegistration(#id).user.id == authentication.principal.id)")
    public ResponseEntity<RegistrationResponse> updateStatus(
        @Parameter(description = "Registration ID") @PathVariable Long id,
        @Parameter(description = "Status") @RequestParam RegistrationStatus status) {
        RegistrationResponse registration = registrationService.updateRegistrationStatus(id, status);
        return ResponseEntity.ok(registration);
    }

    @Operation(summary = "Drop course", description = "Drop a course for the current user")
    @DeleteMapping("/drop/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> dropCourse(
        @Parameter(description = "Course ID") @PathVariable Long courseId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        // For now, we'll need to get user ID through a service method
        // registrationService.dropCourseByUsername(username, courseId);
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
    public ResponseEntity<List<RegistrationResponse>> getRegistrationsByStatus(
        @Parameter(description = "Registration status") @PathVariable RegistrationStatus status) {
        List<RegistrationResponse> registrations = registrationService.getRegistrationsByStatus(status);
        return ResponseEntity.ok(registrations);
    }
}
