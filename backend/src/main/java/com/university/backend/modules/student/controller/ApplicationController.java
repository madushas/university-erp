package com.university.backend.modules.student.controller;

import com.university.backend.modules.student.dto.ApplicationDto;
import com.university.backend.modules.student.entity.Application.ApplicationStatus;
import com.university.backend.modules.student.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/student/applications")
@RequiredArgsConstructor
@Slf4j
public class ApplicationController {
    
    private final ApplicationService applicationService;
    
    /**
     * Create a new application
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF')")
    public ResponseEntity<ApplicationDto> createApplication(@Valid @RequestBody ApplicationDto applicationDto) {
        try {
            log.info("Creating new application for applicant: {}", applicationDto.getApplicantEmail());
            
            // Validate required fields
            if (applicationDto.getAcademicProgramId() == null) {
                throw new IllegalArgumentException("Academic program ID is required");
            }
            if (applicationDto.getAcademicYearId() == null) {
                throw new IllegalArgumentException("Academic year ID is required");
            }
            if (applicationDto.getAcademicSemesterId() == null) {
                throw new IllegalArgumentException("Academic semester ID is required");
            }
            if (applicationDto.getApplicationType() == null) {
                throw new IllegalArgumentException("Application type is required");
            }
            
            ApplicationDto savedApplication = applicationService.createApplication(applicationDto);
            log.info("Successfully created application with ID: {}", savedApplication.getId());
            return new ResponseEntity<>(savedApplication, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            log.error("Validation error creating application: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error creating application: {}", e.getMessage());
            throw new RuntimeException("Failed to create application", e);
        }
    }
    
    /**
     * Get all applications (with optional filtering)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF')")
    public ResponseEntity<Page<ApplicationDto>> getAllApplications(
            @RequestParam(required = false) Long id,
            Pageable pageable) {
        
        // If ID is provided, return single application in a page
        if (id != null) {
            return applicationService.findById(id)
                    .map(application -> {
                        Page<ApplicationDto> singlePage = Page.empty();
                        return ResponseEntity.ok(singlePage);
                    })
                    .orElse(ResponseEntity.notFound().build());
        }
        
        // Otherwise return all applications for review
        Page<ApplicationDto> applications = applicationService.findApplicationsForReview(pageable);
        return ResponseEntity.ok(applications);
    }

    /**
     * Get application by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF')")
    public ResponseEntity<ApplicationDto> getApplication(@PathVariable Long id) {
        return applicationService.findById(id)
                .map(application -> ResponseEntity.ok().body(application))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Update application
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF')")
    public ResponseEntity<ApplicationDto> updateApplication(
            @PathVariable Long id, 
            @Valid @RequestBody ApplicationDto applicationDto) {
        applicationDto.setId(id);
        ApplicationDto updatedApplication = applicationService.updateApplication(applicationDto);
        return ResponseEntity.ok(updatedApplication);
    }
    
    /**
     * Submit application for review
     */
    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF')")
    public ResponseEntity<ApplicationDto> submitApplication(@PathVariable Long id) {
        log.info("Submitting application with ID: {}", id);
        ApplicationDto submittedApplication = applicationService.submitApplication(id);
        return ResponseEntity.ok(submittedApplication);
    }
    
    /**
     * Update application status
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF')")
    public ResponseEntity<ApplicationDto> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam ApplicationStatus status,
            @RequestParam(required = false) String reason) {
        log.info("Updating application {} status to: {}", id, status);
        ApplicationDto updatedApplication = applicationService.updateApplicationStatus(id, status, reason);
        return ResponseEntity.ok(updatedApplication);
    }
    
    /**
     * Get applications by student ID
     */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF')")
    public ResponseEntity<List<ApplicationDto>> getApplicationsByStudent(@PathVariable Long studentId) {
        List<ApplicationDto> applications = applicationService.findByStudentId(studentId);
        return ResponseEntity.ok(applications);
    }
    
    /**
     * Get applications by status
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF')")
    public ResponseEntity<Page<ApplicationDto>> getApplicationsByStatus(
            @PathVariable ApplicationStatus status,
            Pageable pageable) {
        Page<ApplicationDto> applications = applicationService.findByStatus(status, pageable);
        return ResponseEntity.ok(applications);
    }
    
    /**
     * Get applications by program and academic year
     */
    @GetMapping("/program/{programId}/year/{academicYearId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF')")
    public ResponseEntity<Page<ApplicationDto>> getApplicationsByProgramAndYear(
            @PathVariable Long programId,
            @PathVariable Long academicYearId,
            Pageable pageable) {
        Page<ApplicationDto> applications = applicationService.findByProgramAndYear(programId, academicYearId, pageable);
        return ResponseEntity.ok(applications);
    }
    
    /**
     * Get applications requiring review
     */
    @GetMapping("/pending-review")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF')")
    public ResponseEntity<Page<ApplicationDto>> getApplicationsForReview(Pageable pageable) {
        try {
            Page<ApplicationDto> applications = applicationService.findApplicationsForReview(pageable);
            log.info("Retrieved {} applications for review", applications.getTotalElements());
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            log.error("Error retrieving applications for review: {}", e.getMessage());
            throw new RuntimeException("Failed to retrieve applications for review", e);
        }
    }
    
    /**
     * Get application statistics
     */
    @GetMapping("/statistics/year/{academicYearId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF')")
    public ResponseEntity<ApplicationService.ApplicationStatistics> getApplicationStatistics(
            @PathVariable Long academicYearId) {
        ApplicationService.ApplicationStatistics statistics = applicationService.getApplicationStatistics(academicYearId);
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * Get application by application number
     */
    @GetMapping("/number/{applicationNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF')")
    public ResponseEntity<ApplicationDto> getApplicationByNumber(@PathVariable String applicationNumber) {
        return applicationService.findByApplicationNumber(applicationNumber)
                .map(application -> ResponseEntity.ok().body(application))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get overdue applications
     */
    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF')")
    public ResponseEntity<List<ApplicationDto>> getOverdueApplications() {
        try {
            List<ApplicationDto> overdueApplications = applicationService.findOverdueApplications();
            log.info("Retrieved {} overdue applications", overdueApplications.size());
            return ResponseEntity.ok(overdueApplications);
        } catch (Exception e) {
            log.error("Error retrieving overdue applications: {}", e.getMessage());
            throw new RuntimeException("Failed to retrieve overdue applications", e);
        }
    }
    
    /**
     * Delete application
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        log.info("Deleting application with ID: {}", id);
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Search applications
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF')")
    public ResponseEntity<Page<ApplicationDto>> searchApplications(
            @RequestParam(required = false) String applicantName,
            @RequestParam(required = false) String applicationNumber,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) Long programId,
            @RequestParam(required = false) Long academicYearId,
            Pageable pageable) {
        
        // This would need a more sophisticated search method in the service
        // For now, return applications by status if provided
        if (status != null) {
            Page<ApplicationDto> applications = applicationService.findByStatus(status, pageable);
            return ResponseEntity.ok(applications);
        }
        
        // Default: return applications for review
        Page<ApplicationDto> applications = applicationService.findApplicationsForReview(pageable);
        return ResponseEntity.ok(applications);
    }
}
