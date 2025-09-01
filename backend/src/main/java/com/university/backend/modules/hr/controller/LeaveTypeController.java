package com.university.backend.modules.hr.controller;

import com.university.backend.modules.hr.entity.LeaveType;
import com.university.backend.modules.hr.entity.LeaveTypeStatus;
import com.university.backend.modules.hr.service.LeaveTypeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/hr/leave/types")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class LeaveTypeController {
    
    private final LeaveTypeService leaveTypeService;
    
    @GetMapping
    public ResponseEntity<List<LeaveType>> getAllLeaveTypes() {
        try {
            log.debug("Fetching all active leave types");
            long startTime = System.currentTimeMillis();
            
            List<LeaveType> leaveTypes = leaveTypeService.getActiveLeaveTypes();
            
            long duration = System.currentTimeMillis() - startTime;
            if (duration > 1000) { // Log if takes more than 1 second
                log.warn("Leave types query took {} ms", duration);
            }
            
            log.debug("Retrieved {} leave types in {} ms", leaveTypes.size(), duration);
            return ResponseEntity.ok(leaveTypes);
        } catch (Exception e) {
            log.error("Error fetching leave types", e);
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<LeaveType> getLeaveTypeById(@PathVariable Long id) {
        try {
            log.debug("Fetching leave type by ID: {}", id);
            
            if (id == null || id <= 0) {
                log.warn("Invalid leave type ID: {}", id);
                return ResponseEntity.badRequest().build();
            }
            
            return leaveTypeService.getLeaveTypeById(id)
                .map(leaveType -> {
                    log.debug("Found leave type: {}", leaveType.getName());
                    return ResponseEntity.ok(leaveType);
                })
                .orElseGet(() -> {
                    log.debug("Leave type not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
        } catch (Exception e) {
            log.error("Error fetching leave type by ID: {}", id, e);
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/code/{code}")
    public ResponseEntity<LeaveType> getLeaveTypeByCode(@PathVariable String code) {
        try {
            log.debug("Fetching leave type by code: {}", code);
            
            if (code == null || code.trim().isEmpty()) {
                log.warn("Invalid leave type code: {}", code);
                return ResponseEntity.badRequest().build();
            }
            
            return leaveTypeService.getLeaveTypeByCode(code.trim().toUpperCase())
                .map(leaveType -> {
                    log.debug("Found leave type: {}", leaveType.getName());
                    return ResponseEntity.ok(leaveType);
                })
                .orElseGet(() -> {
                    log.debug("Leave type not found with code: {}", code);
                    return ResponseEntity.notFound().build();
                });
        } catch (Exception e) {
            log.error("Error fetching leave type by code: {}", code, e);
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<LeaveType> createLeaveType(@Valid @RequestBody LeaveType leaveType) {
        try {
            log.info("Creating leave type: {}", leaveType.getName());
            
            // Validate required fields
            if (leaveType.getCode() == null || leaveType.getCode().trim().isEmpty()) {
                throw new IllegalArgumentException("Leave type code is required");
            }
            if (leaveType.getName() == null || leaveType.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Leave type name is required");
            }
            
            // Normalize code to uppercase
            leaveType.setCode(leaveType.getCode().trim().toUpperCase());
            
            if (leaveTypeService.existsByCode(leaveType.getCode())) {
                log.warn("Leave type with code {} already exists", leaveType.getCode());
                throw new IllegalArgumentException("Leave type with code " + leaveType.getCode() + " already exists");
            }
            
            LeaveType createdLeaveType = leaveTypeService.createLeaveType(leaveType);
            log.info("Created leave type with ID: {}", createdLeaveType.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdLeaveType);
        } catch (IllegalArgumentException e) {
            log.error("Validation error creating leave type: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error creating leave type", e);
            throw new RuntimeException("Failed to create leave type", e);
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<LeaveType> updateLeaveType(
            @PathVariable Long id, 
            @Valid @RequestBody LeaveType leaveType) {
        try {
            if (!leaveTypeService.getLeaveTypeById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            leaveType.setId(id);
            LeaveType updatedLeaveType = leaveTypeService.updateLeaveType(leaveType);
            return ResponseEntity.ok(updatedLeaveType);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<LeaveType> updateLeaveTypeStatus(
            @PathVariable Long id, 
            @RequestParam LeaveTypeStatus status) {
        try {
            LeaveType updatedLeaveType = leaveTypeService.updateLeaveTypeStatus(id, status);
            return ResponseEntity.ok(updatedLeaveType);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLeaveType(@PathVariable Long id) {
        try {
            log.info("Deleting leave type: {}", id);
            
            if (id == null || id <= 0) {
                log.warn("Invalid leave type ID for deletion: {}", id);
                return ResponseEntity.badRequest().build();
            }
            
            if (!leaveTypeService.getLeaveTypeById(id).isPresent()) {
                log.warn("Leave type not found for deletion: {}", id);
                return ResponseEntity.notFound().build();
            }
            
            leaveTypeService.deleteLeaveType(id);
            log.info("Successfully deleted leave type: {}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting leave type: {}", id, e);
            throw new RuntimeException("Failed to delete leave type", e);
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        try {
            long startTime = System.currentTimeMillis();
            List<LeaveType> types = leaveTypeService.getActiveLeaveTypes();
            long duration = System.currentTimeMillis() - startTime;
            
            String status = duration < 3000 ? "HEALTHY" : "SLOW";
            String message = String.format("Leave types endpoint: %s (response time: %d ms, count: %d)", 
                status, duration, types.size());
            
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            log.error("Health check failed", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("Leave types endpoint: UNHEALTHY - " + e.getMessage());
        }
    }
}