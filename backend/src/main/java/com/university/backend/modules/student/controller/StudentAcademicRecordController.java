package com.university.backend.modules.student.controller;

import com.university.backend.modules.student.dto.StudentAcademicRecordDto;
import com.university.backend.modules.student.service.StudentAcademicRecordService;
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
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

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
        log.info("Retrieving students eligible for graduation");
        
        // TODO: Implement graduation eligibility retrieval
        return ResponseEntity.ok(List.of());
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
        log.info("Updating academic progress for record: {}", id);
        
        // TODO: Implement academic progress update
        return ResponseEntity.ok().build();
    }
    
    /**
     * Mark student as graduated
     */
    @PatchMapping("/{id}/graduate")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF', 'REGISTRAR')")
    public ResponseEntity<StudentAcademicRecordDto> markAsGraduated(
            @PathVariable Long id,
            @RequestParam LocalDate graduationDate) {
        log.info("Marking student as graduated: {}", id);
        
        // TODO: Implement graduation marking
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get academic statistics for program
     */
    @GetMapping("/statistics/program/{programId}/year/{academicYearId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF')")
    public ResponseEntity<?> getAcademicStatistics(
            @PathVariable Long programId,
            @PathVariable Long academicYearId) {
        log.info("Retrieving academic statistics for program: {} and year: {}", programId, academicYearId);
        
        // TODO: Implement academic statistics retrieval
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get GPA history for student
     */
    @GetMapping("/student/{studentId}/gpa-history")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF')")
    public ResponseEntity<List<Object>> getGpaHistory(@PathVariable Long studentId) {
        log.info("Retrieving GPA history for student: {}", studentId);
        
        // Validate access - students can only view their own records
        securityContextService.validateStudentResourceAccess(studentId);
        
        // TODO: Implement GPA history retrieval
        return ResponseEntity.ok(List.of());
    }
    
    /**
     * Get degree progress summary
     */
    @GetMapping("/student/{studentId}/degree-progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF')")
    public ResponseEntity<Object> getDegreeProgress(@PathVariable Long studentId) {
        log.info("Retrieving degree progress for student: {}", studentId);
        
        // Validate access - students can only view their own records
        securityContextService.validateStudentResourceAccess(studentId);
        
        // TODO: Implement degree progress retrieval
        return ResponseEntity.ok().build();
    }
}
