package com.university.backend.controller;

import com.university.backend.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Analytics and reporting APIs")
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {
    
    private final AnalyticsService analyticsService;

    @Operation(summary = "Get dashboard analytics", description = "Get comprehensive dashboard analytics (admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Analytics retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied - admin role required")
    })
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardAnalytics() {
        Map<String, Object> analytics = analyticsService.getDashboardAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @Operation(summary = "Get department analytics", description = "Get analytics for a specific department (admin only)")
    @GetMapping("/department/{departmentCode}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDepartmentAnalytics(
        @Parameter(description = "Department code") @PathVariable String departmentCode) {
        Map<String, Object> analytics = analyticsService.getDepartmentAnalytics(departmentCode);
        return ResponseEntity.ok(analytics);
    }

    @Operation(summary = "Get course analytics", description = "Get analytics for a specific course (admin only)")
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getCourseAnalytics(
        @Parameter(description = "Course ID") @PathVariable Long courseId) {
        Map<String, Object> analytics = analyticsService.getCourseAnalytics(courseId);
        return ResponseEntity.ok(analytics);
    }

    @Operation(summary = "Get student analytics", description = "Get analytics for a specific student")
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and #studentId == authentication.principal.id)")
    public ResponseEntity<Map<String, Object>> getStudentAnalytics(
        @Parameter(description = "Student ID") @PathVariable Long studentId) {
        Map<String, Object> analytics = analyticsService.getStudentAnalytics(studentId);
        return ResponseEntity.ok(analytics);
    }

    @Operation(summary = "Get recent activity analytics", description = "Get recent activity analytics (admin only)")
    @GetMapping("/recent-activity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getRecentActivityAnalytics() {
        Map<String, Object> analytics = analyticsService.getRecentActivityAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @Operation(summary = "Get financial analytics", description = "Get financial analytics (admin only)")
    @GetMapping("/financial")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getFinancialAnalytics() {
        Map<String, Object> analytics = analyticsService.getFinancialAnalytics();
        return ResponseEntity.ok(analytics);
    }
}
