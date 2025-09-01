package com.university.backend.modules.student.controller;

import com.university.backend.modules.student.dto.StudentAcademicRecordDto;
import com.university.backend.modules.student.service.StudentAcademicRecordService;
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
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/student/academic-records")
@RequiredArgsConstructor
@Slf4j
public class StudentAcademicRecordController {
    
    private final StudentAcademicRecordService studentAcademicRecordService;
    private final SecurityContextService securityContextService;
    
    /**
     * Create academic record
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF', 'REGISTRAR')")
    public ResponseEntity<StudentAcademicRecordDto> createAcademicRecord(
            @Valid @RequestBody StudentAcademicRecordDto recordDto) {
        log.info("Creating academic record for student: {}", recordDto.getStudentId());
        
        StudentAcademicRecordDto savedRecord = studentAcademicRecordService.createAcademicRecord(recordDto);
        return new ResponseEntity<>(savedRecord, HttpStatus.CREATED);
    }
    
    /**
     * Get academic record by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF')")
    public ResponseEntity<StudentAcademicRecordDto> getAcademicRecord(@PathVariable Long id) {
        log.info("Retrieving academic record with ID: {}", id);
        
        return studentAcademicRecordService.findById(id)
                .map(record -> {
                    // Validate access - students can only view their own records
                    securityContextService.validateStudentResourceAccess(record.getStudentId());
                    return ResponseEntity.ok().body(record);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Update academic record
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF', 'REGISTRAR')")
    public ResponseEntity<StudentAcademicRecordDto> updateAcademicRecord(
            @PathVariable Long id,
            @Valid @RequestBody StudentAcademicRecordDto recordDto) {
        log.info("Updating academic record with ID: {}", id);
        
        recordDto.setId(id);
        StudentAcademicRecordDto updatedRecord = studentAcademicRecordService.updateAcademicRecord(id, recordDto);
        return ResponseEntity.ok(updatedRecord);
    }
    
    /**
     * Get academic records by student ID
     */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF')")
    public ResponseEntity<List<StudentAcademicRecordDto>> getAcademicRecordsByStudent(@PathVariable Long studentId) {
        log.info("Retrieving academic records for student: {}", studentId);
        
        // Validate access - students can only view their own records
        securityContextService.validateStudentResourceAccess(studentId);
        
        List<StudentAcademicRecordDto> records = studentAcademicRecordService.findByStudentId(studentId);
        return ResponseEntity.ok(records);
    }
    
    /**
     * Get current academic record for student
     */
    @GetMapping("/student/{studentId}/current")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF')")
    public ResponseEntity<StudentAcademicRecordDto> getCurrentAcademicRecord(@PathVariable Long studentId) {
        log.info("Retrieving current academic record for student: {}", studentId);
        
        // Validate access - students can only view their own records
        securityContextService.validateStudentResourceAccess(studentId);
        
        return studentAcademicRecordService.findCurrentRecordByStudentId(studentId)
                .map(record -> ResponseEntity.ok().body(record))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get academic records by program and semester
     */
    @GetMapping("/program/{programId}/semester/{semesterId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF')")
    public ResponseEntity<Page<StudentAcademicRecordDto>> getAcademicRecordsByProgramAndSemester(
            @PathVariable Long programId,
            @PathVariable Long semesterId,
            Pageable pageable) {
        log.info("Retrieving academic records for program: {} and semester: {}", programId, semesterId);
        
        Page<StudentAcademicRecordDto> records = studentAcademicRecordService.findByProgramAndSemester(programId, semesterId, pageable);
        return ResponseEntity.ok(records);
    }
    
    /**
     * Get students by academic standing
     */
    @GetMapping("/academic-standing/{standing}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF')")
    public ResponseEntity<Page<StudentAcademicRecordDto>> getStudentsByAcademicStanding(
            @PathVariable String standing,
            Pageable pageable) {
        log.info("Retrieving students with academic standing: {}", standing);
        
        Page<StudentAcademicRecordDto> records = studentAcademicRecordService.findByAcademicStanding(standing, pageable);
        return ResponseEntity.ok(records);
    }
    
    /**
     * Get students eligible for graduation
     */
    @GetMapping("/eligible-for-graduation")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF', 'REGISTRAR')")
    public ResponseEntity<List<StudentAcademicRecordDto>> getStudentsEligibleForGraduation() {
        try {
            log.info("Retrieving students eligible for graduation");
            
            List<StudentAcademicRecordDto> eligibleStudents = studentAcademicRecordService.findEligibleForGraduation();
            log.info("Found {} students eligible for graduation", eligibleStudents.size());
            return ResponseEntity.ok(eligibleStudents);
        } catch (Exception e) {
            log.error("Error retrieving students eligible for graduation: {}", e.getMessage());
            throw new RuntimeException("Failed to retrieve students eligible for graduation", e);
        }
    }
    
    /**
     * Update academic progress
     */
    @PatchMapping("/{id}/progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF', 'REGISTRAR')")
    public ResponseEntity<StudentAcademicRecordDto> updateAcademicProgress(
            @PathVariable Long id,
            @RequestParam BigDecimal newGpa,
            @RequestParam Integer newCredits) {
        try {
            log.info("Updating academic progress for record: {}", id);
            
            // Validate GPA range (0.0-4.0)
            if (newGpa.compareTo(BigDecimal.ZERO) < 0 || newGpa.compareTo(new BigDecimal("4.0")) > 0) {
                throw new IllegalArgumentException("GPA must be between 0.0 and 4.0");
            }
            
            // Validate credit hours (non-negative)
            if (newCredits < 0) {
                throw new IllegalArgumentException("Credit hours cannot be negative");
            }
            
            StudentAcademicRecordDto updatedRecord = studentAcademicRecordService.updateAcademicProgress(id, newGpa, newCredits);
            log.info("Successfully updated academic progress for record: {}", id);
            return ResponseEntity.ok(updatedRecord);
        } catch (IllegalArgumentException e) {
            log.error("Validation error updating academic progress: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error updating academic progress for record {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to update academic progress", e);
        }
    }
    
    /**
     * Mark student as graduated
     */
    @PatchMapping("/{id}/graduate")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF', 'REGISTRAR')")
    public ResponseEntity<StudentAcademicRecordDto> markAsGraduated(
            @PathVariable Long id,
            @RequestParam LocalDate graduationDate) {
        try {
            log.info("Marking student as graduated: {}", id);
            
            // Validate graduation date
            if (graduationDate == null) {
                throw new IllegalArgumentException("Graduation date is required");
            }
            if (graduationDate.isAfter(LocalDate.now())) {
                throw new IllegalArgumentException("Graduation date cannot be in the future");
            }
            
            StudentAcademicRecordDto graduatedRecord = studentAcademicRecordService.markAsGraduated(id, graduationDate);
            log.info("Successfully marked student as graduated: {}", id);
            return ResponseEntity.ok(graduatedRecord);
        } catch (IllegalArgumentException e) {
            log.error("Validation error marking student as graduated: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error marking student as graduated {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to mark student as graduated", e);
        }
    }
    
    /**
     * Get academic statistics for program
     */
    @GetMapping("/statistics/program/{programId}/year/{academicYearId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF')")
    public ResponseEntity<StudentAcademicRecordService.AcademicStatistics> getAcademicStatistics(
            @PathVariable Long programId,
            @PathVariable Long academicYearId) {
        try {
            log.info("Retrieving academic statistics for program: {} and year: {}", programId, academicYearId);
            
            StudentAcademicRecordService.AcademicStatistics statistics = 
                studentAcademicRecordService.getAcademicStatistics(programId, academicYearId);
            log.info("Retrieved academic statistics for program: {} and year: {}", programId, academicYearId);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error retrieving academic statistics for program {} and year {}: {}", 
                programId, academicYearId, e.getMessage());
            throw new RuntimeException("Failed to retrieve academic statistics", e);
        }
    }
    
    /**
     * Get GPA history for student
     */
    @GetMapping("/student/{studentId}/gpa-history")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF')")
    public ResponseEntity<List<StudentAcademicRecordDto>> getGpaHistory(@PathVariable Long studentId) {
        try {
            log.info("Retrieving GPA history for student: {}", studentId);
            
            // Validate access - students can only view their own records
            securityContextService.validateStudentResourceAccess(studentId);
            
            List<StudentAcademicRecordDto> gpaHistory = studentAcademicRecordService.findByStudentId(studentId);
            log.info("Retrieved {} GPA history records for student: {}", gpaHistory.size(), studentId);
            return ResponseEntity.ok(gpaHistory);
        } catch (Exception e) {
            log.error("Error retrieving GPA history for student {}: {}", studentId, e.getMessage());
            throw new RuntimeException("Failed to retrieve GPA history", e);
        }
    }
    
    /**
     * Get degree progress summary
     */
    @GetMapping("/student/{studentId}/degree-progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF')")
    public ResponseEntity<StudentAcademicRecordDto> getDegreeProgress(@PathVariable Long studentId) {
        try {
            log.info("Retrieving degree progress for student: {}", studentId);
            
            // Validate access - students can only view their own records
            securityContextService.validateStudentResourceAccess(studentId);
            
            Optional<StudentAcademicRecordDto> currentRecord = studentAcademicRecordService.findCurrentRecordByStudentId(studentId);
            if (currentRecord.isPresent()) {
                log.info("Retrieved degree progress for student: {}", studentId);
                return ResponseEntity.ok(currentRecord.get());
            } else {
                log.info("No degree progress found for student: {}", studentId);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error retrieving degree progress for student {}: {}", studentId, e.getMessage());
            throw new RuntimeException("Failed to retrieve degree progress", e);
        }
    }
}
