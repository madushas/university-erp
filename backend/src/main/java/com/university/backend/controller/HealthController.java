package com.university.backend.controller;

import com.university.backend.service.PerformanceMonitoringService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthComponent;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Custom health check controller for application monitoring
 */
@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Health", description = "Application health monitoring endpoints")
public class HealthController {

    private final HealthEndpoint healthEndpoint;
    private final PerformanceMonitoringService performanceMonitoringService;

    @GetMapping
    @Operation(summary = "Get application health status", 
               description = "Returns the overall health status of the application")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Health status retrieved successfully"),
        @ApiResponse(responseCode = "503", description = "Service unavailable - health check failed")
    })
    public ResponseEntity<Map<String, Object>> getHealth() {
        try {
            // In Spring Boot 3.x, health() returns HealthComponent
            Object healthResult = healthEndpoint.health();
            Map<String, Object> response = new HashMap<>();
            
            if (healthResult instanceof HealthComponent healthComponent) {
                // Spring Boot 3.x style
                response.put("status", healthComponent.getStatus().getCode());
                response.put("timestamp", LocalDateTime.now());
                
                // HealthComponent doesn't have getDetails() in the same way
                Map<String, Object> details = new HashMap<>();
                details.put("description", "Health check performed at " + LocalDateTime.now());
                response.put("details", details);
                
                if (healthComponent.getStatus().getCode().equals("UP")) {
                    return ResponseEntity.ok(response);
                } else {
                    return ResponseEntity.status(503).body(response);
                }
            } else if (healthResult instanceof Health health) {
                // Fallback for Spring Boot 2.x style
                response.put("status", health.getStatus().getCode());
                response.put("timestamp", LocalDateTime.now());
                response.put("details", health.getDetails());
                
                if (health.getStatus().getCode().equals("UP")) {
                    return ResponseEntity.ok(response);
                } else {
                    return ResponseEntity.status(503).body(response);
                }
            } else {
                // Unknown type, return generic response
                response.put("status", "UNKNOWN");
                response.put("timestamp", LocalDateTime.now());
                response.put("details", Map.of("error", "Unknown health check result type"));
                return ResponseEntity.status(503).body(response);
            }
        } catch (Exception e) {
            log.error("Health check failed", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "DOWN");
            errorResponse.put("timestamp", LocalDateTime.now());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(503).body(errorResponse);
        }
    }

    @GetMapping("/ready")
    @Operation(summary = "Readiness probe", 
               description = "Checks if the application is ready to serve requests")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Application is ready"),
        @ApiResponse(responseCode = "503", description = "Application is not ready")
    })
    public ResponseEntity<Map<String, Object>> getReadiness() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "READY");
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "Application is ready to serve requests");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/live")
    @Operation(summary = "Liveness probe", 
               description = "Checks if the application is alive and running")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Application is alive"),
        @ApiResponse(responseCode = "503", description = "Application is not responding")
    })
    public ResponseEntity<Map<String, Object>> getLiveness() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ALIVE");
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "Application is alive and running");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/version")
    @Operation(summary = "Get application version", 
               description = "Returns version and build information")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Version information retrieved successfully")
    })
    public ResponseEntity<Map<String, Object>> getVersion() {
        Map<String, Object> response = new HashMap<>();
        response.put("application", "University ERP System");
        response.put("version", "1.0.0");
        response.put("buildTime", LocalDateTime.now());
        response.put("javaVersion", System.getProperty("java.version"));
        response.put("springBootVersion", org.springframework.boot.SpringBootVersion.getVersion());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/performance")
    @Operation(summary = "Get performance metrics", 
               description = "Returns system-wide performance metrics")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Performance metrics retrieved successfully")
    })
    public ResponseEntity<Map<String, Object>> getPerformanceMetrics() {
        Map<String, Object> response = new HashMap<>();
        response.put("systemSummary", performanceMonitoringService.getSystemSummary());
        response.put("allMetrics", performanceMonitoringService.getAllMetrics());
        
        List<String> poorlyPerformingEndpoints = performanceMonitoringService.getPoorlyPerformingEndpoints();
        response.put("poorlyPerformingEndpoints", poorlyPerformingEndpoints);
        response.put("hasPerformanceIssues", !poorlyPerformingEndpoints.isEmpty());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/performance/{endpoint}")
    @Operation(summary = "Get performance metrics for specific endpoint", 
               description = "Returns performance metrics for a specific endpoint")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Endpoint metrics retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Endpoint not found")
    })
    public ResponseEntity<Map<String, Object>> getEndpointMetrics(@PathVariable String endpoint) {
        Map<String, Object> metrics = performanceMonitoringService.getMetrics(endpoint);
        
        if ((Long) metrics.get("totalRequests") == 0) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "No metrics found for endpoint: " + endpoint);
            errorResponse.put("timestamp", LocalDateTime.now());
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(metrics);
    }
}