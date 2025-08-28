package com.university.backend.modules.student.controller;

import com.university.backend.modules.student.dto.DegreeAuditDto;
import com.university.backend.modules.student.service.DegreeAuditService;
import com.university.backend.modules.core.entity.User;
import com.university.backend.security.SecurityContextService;
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
@RequestMapping("/api/v1/student/degree-audits")
@RequiredArgsConstructor
@Slf4j
public class DegreeAuditController {
    
    private final DegreeAuditService degreeAuditService;
    private final SecurityContextService securityContextService;
    
    /**
     * Generate degree audit for student
     */
    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF', 'ADVISOR')")
    public ResponseEntity<DegreeAuditDto> generateDegreeAudit(
            @RequestParam Long studentId,
            @RequestParam Long academicProgramId) {
        log.info("Generating degree audit for student: {} in program: {}", studentId, academicProgramId);
        
        DegreeAuditDto audit = degreeAuditService.generateDegreeAudit(studentId, academicProgramId);
        return new ResponseEntity<>(audit, HttpStatus.CREATED);
    }
    
    /**
     * Get degree audit by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF', 'ADVISOR')")
    public ResponseEntity<DegreeAuditDto> getDegreeAudit(@PathVariable Long id) {
        log.info("Retrieving degree audit with ID: {}", id);
        
        return degreeAuditService.findById(id)
                .map(audit -> {
                    // Validate access - students can only view their own degree audits
                    securityContextService.validateStudentResourceAccess(audit.getStudentId());
                    return ResponseEntity.ok().body(audit);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get degree audits by student ID
     */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF', 'ADVISOR')")
    public ResponseEntity<List<DegreeAuditDto>> getDegreeAuditsByStudent(@PathVariable Long studentId) {
        log.info("Retrieving degree audits for student: {}", studentId);
        
        // Validate access - students can only view their own degree audits
        securityContextService.validateStudentResourceAccess(studentId);
        
        List<DegreeAuditDto> audits = degreeAuditService.findByStudentId(studentId);
        return ResponseEntity.ok(audits);
    }
    
    /**
     * Get latest degree audit for student
     */
    @GetMapping("/student/{studentId}/latest")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF', 'ADVISOR')")
    public ResponseEntity<DegreeAuditDto> getLatestDegreeAudit(@PathVariable Long studentId) {
        log.info("Retrieving latest degree audit for student: {}", studentId);
        
        // Validate access - students can only view their own degree audits
        securityContextService.validateStudentResourceAccess(studentId);
        
        return degreeAuditService.findLatestByStudentId(studentId)
                .map(audit -> ResponseEntity.ok().body(audit))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Update degree audit
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF', 'ADVISOR')")
    public ResponseEntity<DegreeAuditDto> updateDegreeAudit(
            @PathVariable Long id,
            @Valid @RequestBody DegreeAuditDto auditDto) {
        log.info("Updating degree audit with ID: {}", id);
        
        DegreeAuditDto updatedAudit = degreeAuditService.updateDegreeAudit(id, auditDto);
        return ResponseEntity.ok(updatedAudit);
    }
    
    /**
     * Get degree audits by program
     */
    @GetMapping("/program/{programId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF', 'ADVISOR')")
    public ResponseEntity<Page<DegreeAuditDto>> getDegreeAuditsByProgram(
            @PathVariable Long programId,
            Pageable pageable) {
        log.info("Retrieving degree audits for program: {}", programId);
        
        Page<DegreeAuditDto> audits = degreeAuditService.findByProgramId(programId, pageable);
        return ResponseEntity.ok(audits);
    }
    
    /**
     * Get students eligible for graduation
     */
    @GetMapping("/eligible-for-graduation")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF', 'REGISTRAR')")
    public ResponseEntity<List<DegreeAuditDto>> getStudentsEligibleForGraduation() {
        log.info("Retrieving students eligible for graduation");
        
        List<DegreeAuditDto> eligibleStudents = degreeAuditService.findEligibleForGraduation();
        return ResponseEntity.ok(eligibleStudents);
    }
    
    /**
     * Check graduation eligibility for student
     */
    @GetMapping("/student/{studentId}/graduation-eligibility")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF', 'ADVISOR')")
    public ResponseEntity<Boolean> checkGraduationEligibility(@PathVariable Long studentId) {
        log.info("Checking graduation eligibility for student: {}", studentId);
        
        // Validate access - students can only check their own graduation eligibility
        securityContextService.validateStudentResourceAccess(studentId);
        
        boolean isEligible = degreeAuditService.checkGraduationEligibility(studentId);
        return ResponseEntity.ok(isEligible);
    }
    
    /**
     * Get degree requirements progress
     */
    @GetMapping("/student/{studentId}/progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF', 'ADVISOR')")
    public ResponseEntity<DegreeAuditDto> getDegreeProgress(@PathVariable Long studentId) {
        log.info("Retrieving degree progress for student: {}", studentId);
        
        // Validate access - students can only view their own degree progress
        securityContextService.validateStudentResourceAccess(studentId);
        
        return degreeAuditService.getDegreeProgress(studentId)
                .map(progress -> ResponseEntity.ok().body(progress))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get missing requirements for student
     */
    @GetMapping("/student/{studentId}/missing-requirements")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF', 'ADVISOR')")
    public ResponseEntity<List<String>> getMissingRequirements(@PathVariable Long studentId) {
        log.info("Retrieving missing requirements for student: {}", studentId);
        
        // Validate access - students can only view their own missing requirements
        securityContextService.validateStudentResourceAccess(studentId);
        
        List<String> missingRequirements = degreeAuditService.getMissingRequirements(studentId);
        return ResponseEntity.ok(missingRequirements);
    }
    
    /**
     * Approve degree audit
     */
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF', 'ADVISOR')")
    public ResponseEntity<DegreeAuditDto> approveDegreeAudit(@PathVariable Long id) {
        User currentUser = securityContextService.getCurrentUserOrThrow();
        log.info("Approving degree audit with ID: {} by user: {}", id, currentUser.getUsername());
        
        // Only admin, academic staff, and advisors can approve degree audits
        if (!securityContextService.isCurrentUserAdmin() && 
            !securityContextService.isCurrentUserFaculty()) {
            throw new SecurityException("Access denied: Insufficient privileges to approve degree audits");
        }
        
        // TODO: Implement degree audit approval logic with current user as approver
        return degreeAuditService.findById(id)
                .map(audit -> ResponseEntity.ok().body(audit))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Delete degree audit
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF')")
    public ResponseEntity<String> deleteDegreeAudit(@PathVariable Long id) {
        log.info("Deleting degree audit with ID: {}", id);
        
        degreeAuditService.deleteDegreeAudit(id);
        return ResponseEntity.ok("Degree audit deleted successfully");
    }
}
