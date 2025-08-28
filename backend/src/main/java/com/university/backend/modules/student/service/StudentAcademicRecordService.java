package com.university.backend.modules.student.service;

import com.university.backend.modules.academic.repository.AcademicProgramRepository;
import com.university.backend.modules.academic.repository.AcademicSemesterRepository;
import com.university.backend.modules.academic.repository.AcademicYearRepository;
import com.university.backend.modules.core.repository.UserRepository;
import com.university.backend.modules.student.dto.StudentAcademicRecordDto;
import com.university.backend.modules.student.entity.StudentAcademicRecord;
import com.university.backend.modules.student.entity.StudentAcademicRecord.AcademicStanding;
import com.university.backend.modules.student.entity.StudentAcademicRecord.EnrollmentStatus;
import com.university.backend.modules.student.repository.StudentAcademicRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StudentAcademicRecordService {
    
    private static final String RECORD_NOT_FOUND_MESSAGE = "Academic record not found with ID: ";
    
    private final StudentAcademicRecordRepository studentAcademicRecordRepository;
    private final UserRepository userRepository;
    private final AcademicProgramRepository academicProgramRepository;
    private final AcademicYearRepository academicYearRepository;
    private final AcademicSemesterRepository academicSemesterRepository;
    
    /**
     * Create a new student academic record
     */
    public StudentAcademicRecordDto createAcademicRecord(StudentAcademicRecordDto recordDto) {
        log.info("Creating academic record for student: {}", recordDto.getStudentId());
        
        // Validate required fields
        if (recordDto.getStudentId() == null) {
            throw new IllegalArgumentException("Student ID is required");
        }
        if (recordDto.getAcademicProgramId() == null) {
            throw new IllegalArgumentException("Academic program is required");
        }
        if (recordDto.getAcademicYearId() == null) {
            throw new IllegalArgumentException("Academic year is required");
        }
        if (recordDto.getAcademicSemesterId() == null) {
            throw new IllegalArgumentException("Academic semester is required");
        }
        
        // Validate that student exists
        userRepository.findById(recordDto.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + recordDto.getStudentId()));
        
        // Validate that academic program exists
        academicProgramRepository.findById(recordDto.getAcademicProgramId())
                .orElseThrow(() -> new IllegalArgumentException("Academic program not found with ID: " + recordDto.getAcademicProgramId()));
        
        // Validate that academic year exists
        academicYearRepository.findById(recordDto.getAcademicYearId())
                .orElseThrow(() -> new IllegalArgumentException("Academic year not found with ID: " + recordDto.getAcademicYearId()));
        
        // Validate that academic semester exists
        academicSemesterRepository.findById(recordDto.getAcademicSemesterId())
                .orElseThrow(() -> new IllegalArgumentException("Academic semester not found with ID: " + recordDto.getAcademicSemesterId()));
        
        StudentAcademicRecord academicRecord = convertToEntity(recordDto);
        academicRecord.setRecordDate(LocalDate.now());
        academicRecord.setEffectiveDate(LocalDate.now());
        
        StudentAcademicRecord savedRecord = studentAcademicRecordRepository.save(academicRecord);
        log.info("Created academic record with ID: {}", savedRecord.getId());
        
        return convertToDto(savedRecord);
    }
    
    /**
     * Update academic record
     */
    public StudentAcademicRecordDto updateAcademicRecord(Long recordId, StudentAcademicRecordDto recordDto) {
        log.info("Updating academic record with ID: {}", recordId);
        
        StudentAcademicRecord existingRecord = studentAcademicRecordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException(RECORD_NOT_FOUND_MESSAGE + recordId));
        
        // Update fields that exist in the entity
        if (recordDto.getEnrollmentStatus() != null) {
            existingRecord.setEnrollmentStatus(EnrollmentStatus.valueOf(recordDto.getEnrollmentStatus()));
        }
        if (recordDto.getStudentClassification() != null) {
            // Map to ClassLevel enum
            existingRecord.setClassLevel(StudentAcademicRecord.ClassLevel.valueOf(recordDto.getStudentClassification()));
        }
        if (recordDto.getAcademicStanding() != null) {
            existingRecord.setAcademicStanding(AcademicStanding.valueOf(recordDto.getAcademicStanding()));
        }
        if (recordDto.getCumulativeGpa() != null) {
            existingRecord.setCumulativeGpa(recordDto.getCumulativeGpa());
        }
        if (recordDto.getSemesterGpa() != null) {
            existingRecord.setSemesterGpa(recordDto.getSemesterGpa());
        }
        if (recordDto.getTotalCreditsEarned() != null) {
            existingRecord.setTotalCreditsEarned(recordDto.getTotalCreditsEarned());
        }
        if (recordDto.getTotalCreditsAttempted() != null) {
            existingRecord.setTotalCreditsAttempted(recordDto.getTotalCreditsAttempted());
        }
        if (recordDto.getExpectedGraduationDate() != null) {
            existingRecord.setExpectedGraduationDate(recordDto.getExpectedGraduationDate());
        }
        
        StudentAcademicRecord savedRecord = studentAcademicRecordRepository.save(existingRecord);
        log.info("Updated academic record with ID: {}", savedRecord.getId());
        
        return convertToDto(savedRecord);
    }
    
    /**
     * Find academic record by ID
     */
    @Transactional(readOnly = true)
    public Optional<StudentAcademicRecordDto> findById(Long id) {
        return studentAcademicRecordRepository.findById(id)
                .map(this::convertToDto);
    }
    
    /**
     * Find academic records by student ID
     */
    @Transactional(readOnly = true)
    public List<StudentAcademicRecordDto> findByStudentId(Long studentId) {
        return studentAcademicRecordRepository.findByStudentIdOrderByAcademicYearDesc(studentId)
                .stream()
                .map(this::convertToDto)
                .toList();
    }
    
    /**
     * Find current academic record for student
     */
    @Transactional(readOnly = true)
    public Optional<StudentAcademicRecordDto> findCurrentRecordByStudentId(Long studentId) {
        Page<StudentAcademicRecord> records = studentAcademicRecordRepository.findCurrentRecordsByStudentId(
                studentId, PageRequest.of(0, 1));
        return records.hasContent() ? Optional.of(convertToDto(records.getContent().get(0))) : Optional.empty();
    }
    
    /**
     * Find academic records by program and semester
     */
    @Transactional(readOnly = true)
    public Page<StudentAcademicRecordDto> findByProgramAndSemester(Long programId, Long semesterId, Pageable pageable) {
        return studentAcademicRecordRepository.findByAcademicProgramIdAndAcademicSemesterId(programId, semesterId, pageable)
                .map(this::convertToDto);
    }
    
    /**
     * Find students by academic standing
     */
    @Transactional(readOnly = true)
    public Page<StudentAcademicRecordDto> findByAcademicStanding(String academicStanding, Pageable pageable) {
        AcademicStanding standing = AcademicStanding.valueOf(academicStanding);
        return studentAcademicRecordRepository.findByAcademicStanding(standing, pageable)
                .map(this::convertToDto);
    }
    
    /**
     * Find students eligible for graduation
     */
    @Transactional(readOnly = true)
    public List<StudentAcademicRecordDto> findEligibleForGraduation() {
        return studentAcademicRecordRepository.findEligibleForGraduation()
                .stream()
                .map(this::convertToDto)
                .toList();
    }
    
    /**
     * Get academic statistics for a program
     */
    @Transactional(readOnly = true)
    public AcademicStatistics getAcademicStatistics(Long programId, Long academicYearId) {
        Long totalStudents = studentAcademicRecordRepository.countByAcademicProgramIdAndAcademicYearId(programId, academicYearId);
        Double averageGpa = studentAcademicRecordRepository.getAverageGpaByProgram(programId, academicYearId);
        Long graduatedStudents = studentAcademicRecordRepository.countGraduatedStudents(programId, academicYearId);
        
        return new AcademicStatistics(totalStudents, averageGpa, graduatedStudents);
    }
    
    /**
     * Update GPA and credit totals
     */
    public StudentAcademicRecordDto updateAcademicProgress(Long recordId, BigDecimal newGpa, Integer newCredits) {
        log.info("Updating academic progress for record: {}", recordId);
        
        StudentAcademicRecord academicRecord = studentAcademicRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException(RECORD_NOT_FOUND_MESSAGE + recordId));
        
        academicRecord.setCumulativeGpa(newGpa);
        academicRecord.setTotalCreditsEarned(academicRecord.getTotalCreditsEarned() + newCredits);
        
        // Update academic standing based on GPA
        academicRecord.setAcademicStanding(determineAcademicStanding(newGpa));
        
        StudentAcademicRecord savedRecord = studentAcademicRecordRepository.save(academicRecord);
        log.info("Updated academic progress for record: {}", savedRecord.getId());
        
        return convertToDto(savedRecord);
    }
    
    /**
     * Mark student as graduated
     */
    public StudentAcademicRecordDto markAsGraduated(Long recordId, LocalDate graduationDate) {
        log.info("Marking student as graduated: {}", recordId);
        
        StudentAcademicRecord academicRecord = studentAcademicRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException(RECORD_NOT_FOUND_MESSAGE + recordId));
        
        academicRecord.setGraduationApplicationDate(graduationDate);
        academicRecord.setEnrollmentStatus(StudentAcademicRecord.EnrollmentStatus.GRADUATED);
        academicRecord.setGraduationEligibilityVerified(true);
        
        StudentAcademicRecord savedRecord = studentAcademicRecordRepository.save(academicRecord);
        log.info("Marked student as graduated: {}", savedRecord.getId());
        
        return convertToDto(savedRecord);
    }
    
    /**
     * Calculate GPA from registrations and update academic record
     */
    public StudentAcademicRecordDto calculateAndUpdateGPA(Long studentId) {
        log.info("Calculating and updating GPA for student: {}", studentId);
        
        // Get student's current academic record
        Optional<StudentAcademicRecordDto> currentRecordOpt = findCurrentRecordByStudentId(studentId);
        if (currentRecordOpt.isEmpty()) {
            throw new IllegalArgumentException("No current academic record found for student: " + studentId);
        }
        
        StudentAcademicRecordDto currentRecord = currentRecordOpt.get();
        
        // Calculate new GPA based on completed registrations
        BigDecimal newGpa = calculateGPAFromRegistrations(studentId);
        Integer totalCredits = calculateTotalCreditsEarned(studentId);
        
        // Update the record
        currentRecord.setCumulativeGpa(newGpa);
        currentRecord.setTotalCreditsEarned(totalCredits);
        currentRecord.setAcademicStanding(determineAcademicStanding(newGpa).name());
        
        return updateAcademicRecord(currentRecord.getId(), currentRecord);
    }
    
    /**
     * Calculate GPA from student's completed registrations
     */
    private BigDecimal calculateGPAFromRegistrations(Long studentId) {
        // This would typically involve querying registrations
        // For now, we'll use a simplified calculation
        // In a real implementation, this would integrate with RegistrationService
        
        // Get current GPA from academic record as baseline
        Optional<StudentAcademicRecordDto> recordOpt = findCurrentRecordByStudentId(studentId);
        if (recordOpt.isPresent()) {
            return recordOpt.get().getCumulativeGpa() != null ? 
                recordOpt.get().getCumulativeGpa() : BigDecimal.valueOf(2.0);
        }
        
        return BigDecimal.valueOf(2.0); // Default GPA for new students
    }
    
    /**
     * Calculate total credits earned from completed registrations
     */
    private Integer calculateTotalCreditsEarned(Long studentId) {
        // This would typically involve querying registrations
        // For now, we'll use the current value from academic record
        
        Optional<StudentAcademicRecordDto> recordOpt = findCurrentRecordByStudentId(studentId);
        if (recordOpt.isPresent()) {
            return recordOpt.get().getTotalCreditsEarned() != null ? 
                recordOpt.get().getTotalCreditsEarned() : 0;
        }
        
        return 0;
    }
    
    /**
     * Validate credit hour requirements for graduation
     */
    public boolean validateCreditHourRequirements(Long studentId, Long programId) {
        log.info("Validating credit hour requirements for student: {} in program: {}", studentId, programId);
        
        // Get student's academic record
        Optional<StudentAcademicRecordDto> recordOpt = findCurrentRecordByStudentId(studentId);
        if (recordOpt.isEmpty()) {
            return false;
        }
        
        StudentAcademicRecordDto record = recordOpt.get();
        
        // Get program requirements
        var program = academicProgramRepository.findById(programId);
        if (program.isEmpty()) {
            return false;
        }
        
        int requiredCredits = program.get().getCreditRequirements();
        int earnedCredits = record.getTotalCreditsEarned() != null ? record.getTotalCreditsEarned() : 0;
        
        return earnedCredits >= requiredCredits;
    }
    
    /**
     * Check if student meets graduation requirements
     */
    public boolean checkGraduationRequirements(Long studentId) {
        log.info("Checking graduation requirements for student: {}", studentId);
        
        Optional<StudentAcademicRecordDto> recordOpt = findCurrentRecordByStudentId(studentId);
        if (recordOpt.isEmpty()) {
            return false;
        }
        
        StudentAcademicRecordDto record = recordOpt.get();
        
        // Check GPA requirement (minimum 2.0)
        BigDecimal minimumGpa = BigDecimal.valueOf(2.0);
        boolean gpaRequirementMet = record.getCumulativeGpa() != null && 
            record.getCumulativeGpa().compareTo(minimumGpa) >= 0;
        
        // Check credit requirements
        boolean creditRequirementMet = record.getAcademicProgramId() != null && 
            validateCreditHourRequirements(studentId, record.getAcademicProgramId());
        
        // Check academic standing
        boolean goodStanding = record.getAcademicStanding() != null && 
            (record.getAcademicStanding().equals("GOOD_STANDING") || 
             record.getAcademicStanding().equals("DEANS_LIST"));
        
        return gpaRequirementMet && creditRequirementMet && goodStanding;
    }
    
    /**
     * Update academic standing based on performance
     */
    public StudentAcademicRecordDto updateAcademicStanding(Long recordId) {
        log.info("Updating academic standing for record: {}", recordId);
        
        Optional<StudentAcademicRecordDto> recordOpt = findById(recordId);
        if (recordOpt.isEmpty()) {
            throw new IllegalArgumentException("Academic record not found with ID: " + recordId);
        }
        
        StudentAcademicRecordDto record = recordOpt.get();
        BigDecimal gpa = record.getCumulativeGpa() != null ? record.getCumulativeGpa() : BigDecimal.ZERO;
        
        // Determine new academic standing
        AcademicStanding newStanding = determineAcademicStanding(gpa);
        record.setAcademicStanding(newStanding.name());
        
        return updateAcademicRecord(recordId, record);
    }

    // Helper methods
    
    private AcademicStanding determineAcademicStanding(BigDecimal gpa) {
        if (gpa.compareTo(BigDecimal.valueOf(3.5)) >= 0) {
            return AcademicStanding.DEANS_LIST;
        } else if (gpa.compareTo(BigDecimal.valueOf(2.0)) >= 0) {
            return AcademicStanding.GOOD_STANDING;
        } else if (gpa.compareTo(BigDecimal.valueOf(1.5)) >= 0) {
            return AcademicStanding.ACADEMIC_PROBATION;
        } else {
            return AcademicStanding.ACADEMIC_DISMISSAL;
        }
    }
    
    private StudentAcademicRecordDto convertToDto(StudentAcademicRecord academicRecord) {
        return StudentAcademicRecordDto.builder()
                .id(academicRecord.getId())
                .studentId(academicRecord.getStudent().getId())
                .studentName(academicRecord.getStudent().getFirstName() + " " + academicRecord.getStudent().getLastName())
                .studentEmail(academicRecord.getStudent().getEmail())
                .studentNumber(academicRecord.getStudent().getUsername()) // Assuming username is student number
                .academicProgramId(academicRecord.getAcademicProgram() != null ? academicRecord.getAcademicProgram().getId() : null)
                .programName(academicRecord.getAcademicProgram() != null ? academicRecord.getAcademicProgram().getName() : null)
                .degreeType(academicRecord.getAcademicProgram() != null ? academicRecord.getAcademicProgram().getDegreeType() : null)
                .departmentName(academicRecord.getAcademicProgram() != null ? academicRecord.getAcademicProgram().getDepartment().getName() : null)
                .academicYearId(academicRecord.getAcademicYear() != null ? academicRecord.getAcademicYear().getId() : null)
                .academicYearName(academicRecord.getAcademicYear() != null ? academicRecord.getAcademicYear().getName() : null)
                .academicSemesterId(academicRecord.getAcademicSemester() != null ? academicRecord.getAcademicSemester().getId() : null)
                .academicSemesterName(academicRecord.getAcademicSemester() != null ? academicRecord.getAcademicSemester().getName() : null)
                .enrollmentStatus(academicRecord.getEnrollmentStatus().name())
                .studentClassification(academicRecord.getClassLevel() != null ? academicRecord.getClassLevel().name() : null)
                .academicStanding(academicRecord.getAcademicStanding().name())
                .cumulativeGpa(academicRecord.getCumulativeGpa())
                .semesterGpa(academicRecord.getSemesterGpa())
                .totalCreditsEarned(academicRecord.getTotalCreditsEarned())
                .totalCreditsAttempted(academicRecord.getTotalCreditsAttempted())
                .semesterCreditsEarned(null) // Not available in entity
                .semesterCreditsAttempted(null) // Not available in entity
                .enrollmentDate(academicRecord.getRecordDate()) // Using recordDate as enrollment date
                .expectedGraduationDate(academicRecord.getExpectedGraduationDate())
                .graduationDate(academicRecord.getGraduationApplicationDate()) // Using graduation application date
                .createdAt(academicRecord.getCreatedAt())
                .updatedAt(academicRecord.getUpdatedAt())
                .build();
    }
    
    private StudentAcademicRecord convertToEntity(StudentAcademicRecordDto dto) {
        StudentAcademicRecord.StudentAcademicRecordBuilder builder = StudentAcademicRecord.builder();
        
        if (dto.getId() != null) {
            builder.id(dto.getId());
        }
        
        return builder
                .student(dto.getStudentId() != null ? 
                        userRepository.findById(dto.getStudentId()).orElse(null) : null)
                .academicProgram(dto.getAcademicProgramId() != null ? 
                        academicProgramRepository.findById(dto.getAcademicProgramId()).orElse(null) : null)
                .academicYear(dto.getAcademicYearId() != null ? 
                        academicYearRepository.findById(dto.getAcademicYearId()).orElse(null) : null)
                .academicSemester(dto.getAcademicSemesterId() != null ? 
                        academicSemesterRepository.findById(dto.getAcademicSemesterId()).orElse(null) : null)
                .enrollmentStatus(dto.getEnrollmentStatus() != null ? 
                        StudentAcademicRecord.EnrollmentStatus.valueOf(dto.getEnrollmentStatus()) : null)
                .classLevel(dto.getStudentClassification() != null ? 
                        StudentAcademicRecord.ClassLevel.valueOf(dto.getStudentClassification()) : null)
                .academicStanding(dto.getAcademicStanding() != null ? 
                        StudentAcademicRecord.AcademicStanding.valueOf(dto.getAcademicStanding()) : null)
                .cumulativeGpa(dto.getCumulativeGpa())
                .semesterGpa(dto.getSemesterGpa())
                .totalCreditsEarned(dto.getTotalCreditsEarned())
                .totalCreditsAttempted(dto.getTotalCreditsAttempted())
                .recordDate(dto.getEnrollmentDate())
                .expectedGraduationDate(dto.getExpectedGraduationDate())
                .graduationApplicationDate(dto.getGraduationDate())
                .build();
    }
    
    // Inner class for statistics
    public static class AcademicStatistics {
        private final Long totalStudents;
        private final Double averageGpa;
        private final Long graduatedStudents;
        
        public AcademicStatistics(Long totalStudents, Double averageGpa, Long graduatedStudents) {
            this.totalStudents = totalStudents != null ? totalStudents : 0L;
            this.averageGpa = averageGpa != null ? averageGpa : 0.0;
            this.graduatedStudents = graduatedStudents != null ? graduatedStudents : 0L;
        }
        
        // Getters
        public Long getTotalStudents() { return totalStudents; }
        public Double getAverageGpa() { return averageGpa; }
        public Long getGraduatedStudents() { return graduatedStudents; }
    }
}
