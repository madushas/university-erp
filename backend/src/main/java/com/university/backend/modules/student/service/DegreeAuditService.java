package com.university.backend.modules.student.service;

import com.university.backend.modules.student.dto.DegreeAuditDto;
import com.university.backend.modules.student.entity.DegreeAudit;
import com.university.backend.modules.student.entity.StudentAcademicRecord;
import com.university.backend.modules.student.repository.DegreeAuditRepository;
import com.university.backend.modules.student.repository.StudentAcademicRecordRepository;
import com.university.backend.modules.academic.entity.AcademicProgram;
import com.university.backend.modules.academic.entity.Registration;
import com.university.backend.modules.academic.repository.AcademicProgramRepository;
import com.university.backend.modules.academic.repository.RegistrationRepository;
import com.university.backend.modules.core.entity.User;
import com.university.backend.modules.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DegreeAuditService {

    private final DegreeAuditRepository degreeAuditRepository;
    private final StudentAcademicRecordRepository studentAcademicRecordRepository;
    private final AcademicProgramRepository academicProgramRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;

    /**
     * Generate degree audit for student
     */
    public DegreeAuditDto generateDegreeAudit(Long studentId, Long academicProgramId) {
        log.info("Generating degree audit for student: {} in program: {}", studentId, academicProgramId);

        // Validate required parameters
        if (studentId == null) {
            throw new IllegalArgumentException("Student ID is required");
        }
        if (academicProgramId == null) {
            throw new IllegalArgumentException("Academic program ID is required");
        }

        // Fetch student and program
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + studentId));
        AcademicProgram program = academicProgramRepository.findById(academicProgramId)
                .orElseThrow(
                        () -> new IllegalArgumentException("Academic program not found with ID: " + academicProgramId));

        // Get student's academic record
        Optional<StudentAcademicRecord> academicRecordOpt = studentAcademicRecordRepository
                .findLatestByStudentId(studentId);

        // Get student's registrations and calculate progress
        List<Registration> registrations = registrationRepository.findByUserId(studentId);
        List<Registration> completedRegistrations = registrations.stream()
                .filter(r -> r.getGrade() != null && !r.getGrade().isEmpty())
                .collect(Collectors.toList());

        // Calculate credits
        int totalCreditsRequired = program.getCreditRequirements();
        int creditsCompleted = calculateCreditsCompleted(completedRegistrations);
        int creditsInProgress = calculateCreditsInProgress(registrations);
        int creditsRemaining = Math.max(0, totalCreditsRequired - creditsCompleted - creditsInProgress);

        // Calculate GPA
        BigDecimal currentGpa = calculateGPA(completedRegistrations);
        BigDecimal minimumGpaRequired = new BigDecimal("2.0");
        boolean gpaRequirementMet = currentGpa.compareTo(minimumGpaRequired) >= 0;

        // Calculate completion percentage
        BigDecimal completionPercentage = calculateCompletionPercentage(creditsCompleted, totalCreditsRequired);

        // Check graduation eligibility
        boolean eligibleForGraduation = checkGraduationEligibilityInternal(
                creditsCompleted, totalCreditsRequired, currentGpa, minimumGpaRequired);

        // Create degree audit entity
        DegreeAudit degreeAudit = DegreeAudit.builder()
                .student(student)
                .academicProgram(program)
                .auditType(DegreeAudit.AuditType.GRADUATION)
                .auditDate(LocalDate.now())
                .totalCreditsRequired(totalCreditsRequired)
                .creditsCompleted(creditsCompleted)
                .creditsInProgress(creditsInProgress)
                .creditsRemaining(creditsRemaining)
                .minimumGpaRequired(minimumGpaRequired)
                .currentGpa(currentGpa)
                .gpaRequirementMet(gpaRequirementMet)
                .coreRequirementsMet(true) // Simplified for now
                .majorRequirementsMet(true) // Simplified for now
                .electiveRequirementsMet(true) // Simplified for now
                .generalEducationMet(true) // Simplified for now
                .eligibleForGraduation(eligibleForGraduation)
                .degreeCompletionPercentage(completionPercentage)
                .projectedGraduationDate(calculateProjectedGraduationDate(creditsRemaining))
                .auditNotes("Generated by system on " + LocalDate.now())
                .build();

        // Save the audit
        degreeAudit = degreeAuditRepository.save(degreeAudit);

        // Convert to DTO
        return convertToDto(degreeAudit);
    }

    /**
     * Find degree audit by ID
     */
    @Transactional(readOnly = true)
    public Optional<DegreeAuditDto> findById(Long id) {
        log.info("Finding degree audit with ID: {}", id);

        if (id == null) {
            return Optional.empty();
        }

        return degreeAuditRepository.findByIdWithDetails(id)
                .map(this::convertToDto);
    }

    /**
     * Find degree audits by student ID
     */
    @Transactional(readOnly = true)
    public List<DegreeAuditDto> findByStudentId(Long studentId) {
        log.info("Finding degree audits for student: {}", studentId);

        if (studentId == null) {
            return List.of();
        }

        return degreeAuditRepository.findByStudentIdOrderByAuditDateDesc(studentId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Find latest degree audit for student
     */
    @Transactional(readOnly = true)
    public Optional<DegreeAuditDto> findLatestByStudentId(Long studentId) {
        log.info("Finding latest degree audit for student: {}", studentId);

        if (studentId == null) {
            return Optional.empty();
        }

        return degreeAuditRepository.findLatestByStudentId(studentId)
                .map(this::convertToDto);
    }

    /**
     * Update degree audit
     */
    public DegreeAuditDto updateDegreeAudit(Long id, DegreeAuditDto auditDto) {
        log.info("Updating degree audit with ID: {}", id);

        // Validate input
        if (id == null) {
            throw new IllegalArgumentException("Degree audit ID cannot be null");
        }
        if (auditDto == null) {
            throw new IllegalArgumentException("Degree audit data cannot be null");
        }

        // Find existing audit
        DegreeAudit existingAudit = degreeAuditRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Degree audit not found with ID: " + id));

        // Update fields
        if (auditDto.getNotes() != null) {
            existingAudit.setAuditNotes(auditDto.getNotes());
        }

        // Update completion status if provided
        if (auditDto.getCompletionPercentage() != null) {
            existingAudit.setDegreeCompletionPercentage(auditDto.getCompletionPercentage());
        }

        // Update graduation eligibility if provided
        if (auditDto.getIsEligibleForGraduation() != null) {
            existingAudit.setEligibleForGraduation(auditDto.getIsEligibleForGraduation());
        }

        // Save updated audit
        existingAudit = degreeAuditRepository.save(existingAudit);

        log.info("Degree audit updated successfully for ID: {}", id);
        return convertToDto(existingAudit);
    }

    /**
     * Find degree audits by program
     */
    @Transactional(readOnly = true)
    public Page<DegreeAuditDto> findByProgramId(Long programId, Pageable pageable) {
        log.info("Finding degree audits for program: {}", programId);

        if (programId == null) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        List<DegreeAudit> audits = degreeAuditRepository.findByAcademicProgramId(programId);
        List<DegreeAuditDto> auditDtos = audits.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        // Manual pagination since repository method doesn't support Pageable
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), auditDtos.size());

        if (start > auditDtos.size()) {
            return new PageImpl<>(List.of(), pageable, auditDtos.size());
        }

        List<DegreeAuditDto> pageContent = auditDtos.subList(start, end);
        return new PageImpl<>(pageContent, pageable, auditDtos.size());
    }

    /**
     * Find students eligible for graduation
     */
    @Transactional(readOnly = true)
    public List<DegreeAuditDto> findEligibleForGraduation() {
        log.info("Finding students eligible for graduation");

        return degreeAuditRepository.findEligibleForGraduation()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Check graduation eligibility for student
     */
    @Transactional(readOnly = true)
    public boolean checkGraduationEligibility(Long studentId) {
        log.info("Checking graduation eligibility for student: {}", studentId);

        if (studentId == null) {
            return false;
        }

        // Get student's latest academic record
        Optional<StudentAcademicRecord> academicRecordOpt = studentAcademicRecordRepository
                .findLatestByStudentId(studentId);
        if (academicRecordOpt.isEmpty()) {
            log.warn("No academic record found for student: {}", studentId);
            return false;
        }

        StudentAcademicRecord academicRecord = academicRecordOpt.get();

        // Get student's registrations
        List<Registration> completedRegistrations = registrationRepository.findByUserId(studentId)
                .stream()
                .filter(r -> r.getGrade() != null && !r.getGrade().isEmpty())
                .collect(Collectors.toList());

        // Calculate current GPA
        BigDecimal currentGpa = calculateGPA(completedRegistrations);

        // Get program requirements
        AcademicProgram program = academicRecord.getAcademicProgram();
        if (program == null) {
            log.warn("No academic program found for student: {}", studentId);
            return false;
        }

        int totalCreditsRequired = program.getCreditRequirements();
        int creditsCompleted = calculateCreditsCompleted(completedRegistrations);
        BigDecimal minimumGpaRequired = new BigDecimal("2.0");

        return checkGraduationEligibilityInternal(creditsCompleted, totalCreditsRequired, currentGpa,
                minimumGpaRequired);
    }

    /**
     * Get degree progress for student
     */
    @Transactional(readOnly = true)
    public Optional<DegreeAuditDto> getDegreeProgress(Long studentId) {
        log.info("Getting degree progress for student: {}", studentId);

        if (studentId == null) {
            return Optional.empty();
        }

        // Try to find the latest progress audit first
        Optional<DegreeAudit> latestAudit = degreeAuditRepository.findLatestByStudentId(studentId);
        if (latestAudit.isPresent()) {
            return Optional.of(convertToDto(latestAudit.get()));
        }

        // If no audit exists, generate a progress audit
        Optional<StudentAcademicRecord> academicRecordOpt = studentAcademicRecordRepository
                .findLatestByStudentId(studentId);
        if (academicRecordOpt.isEmpty()) {
            return Optional.empty();
        }

        StudentAcademicRecord academicRecord = academicRecordOpt.get();
        AcademicProgram program = academicRecord.getAcademicProgram();
        if (program == null) {
            return Optional.empty();
        }

        // Generate a temporary progress audit
        DegreeAuditDto progressAudit = generateDegreeAudit(studentId, program.getId());
        progressAudit.setAuditType("PROGRESS");

        return Optional.of(progressAudit);
    }

    /**
     * Get missing requirements for student
     */
    @Transactional(readOnly = true)
    public List<String> getMissingRequirements(Long studentId) {
        log.info("Getting missing requirements for student: {}", studentId);

        if (studentId == null) {
            return List.of();
        }

        List<String> missingRequirements = List.of();

        // Get student's academic record
        Optional<StudentAcademicRecord> academicRecordOpt = studentAcademicRecordRepository
                .findLatestByStudentId(studentId);
        if (academicRecordOpt.isEmpty()) {
            return List.of("No academic record found");
        }

        StudentAcademicRecord academicRecord = academicRecordOpt.get();
        AcademicProgram program = academicRecord.getAcademicProgram();
        if (program == null) {
            return List.of("No academic program assigned");
        }

        // Get student's completed registrations
        List<Registration> completedRegistrations = registrationRepository.findByUserId(studentId)
                .stream()
                .filter(r -> r.getGrade() != null && !r.getGrade().isEmpty())
                .collect(Collectors.toList());

        // Calculate missing requirements
        List<String> requirements = List.of();

        // Check credit requirements
        int totalCreditsRequired = program.getCreditRequirements();
        int creditsCompleted = calculateCreditsCompleted(completedRegistrations);
        if (creditsCompleted < totalCreditsRequired) {
            requirements.add(
                    "Missing " + (totalCreditsRequired - creditsCompleted) + " credits to meet degree requirements");
        }

        // Check GPA requirements
        BigDecimal currentGpa = calculateGPA(completedRegistrations);
        BigDecimal minimumGpaRequired = new BigDecimal("2.0");
        if (currentGpa.compareTo(minimumGpaRequired) < 0) {
            requirements.add("GPA of " + currentGpa + " is below minimum requirement of " + minimumGpaRequired);
        }

        // For now, return simplified requirements
        // In a full implementation, this would check specific course requirements,
        // core curriculum, major requirements, etc.
        if (requirements.isEmpty()) {
            return List.of("All requirements met");
        }

        return requirements;
    }

    /**
     * Delete degree audit
     */
    public void deleteDegreeAudit(Long id) {
        log.info("Deleting degree audit with ID: {}", id);

        // Check if audit exists
        if (id == null) {
            throw new IllegalArgumentException("Degree audit ID is required");
        }

        // Verify audit exists
        if (!degreeAuditRepository.existsById(id)) {
            throw new IllegalArgumentException("Degree audit not found with ID: " + id);
        }

        // Delete the audit
        degreeAuditRepository.deleteById(id);

        log.info("Deleted degree audit with ID: {}", id);
    }

    // Helper methods

    /**
     * Calculate total credits completed from registrations
     */
    private int calculateCreditsCompleted(List<Registration> completedRegistrations) {
        return completedRegistrations.stream()
                .filter(r -> isPassingGrade(r.getGrade()))
                .mapToInt(r -> r.getCourse() != null ? r.getCourse().getCredits() : 0)
                .sum();
    }

    /**
     * Calculate credits currently in progress
     */
    private int calculateCreditsInProgress(List<Registration> registrations) {
        return registrations.stream()
                .filter(r -> r.getGrade() == null || r.getGrade().isEmpty())
                .mapToInt(r -> r.getCourse() != null ? r.getCourse().getCredits() : 0)
                .sum();
    }

    /**
     * Calculate GPA from completed registrations
     */
    private BigDecimal calculateGPA(List<Registration> completedRegistrations) {
        if (completedRegistrations.isEmpty()) {
            return BigDecimal.ZERO;
        }

        double totalQualityPoints = 0.0;
        int totalCredits = 0;

        for (Registration registration : completedRegistrations) {
            if (registration.getGradePoints() != null && registration.getCourse() != null) {
                int credits = registration.getCourse().getCredits();
                totalQualityPoints += registration.getGradePoints() * credits;
                totalCredits += credits;
            }
        }

        if (totalCredits == 0) {
            return BigDecimal.ZERO;
        }

        return BigDecimal.valueOf(totalQualityPoints / totalCredits)
                .setScale(3, RoundingMode.HALF_UP);
    }

    /**
     * Calculate degree completion percentage
     */
    private BigDecimal calculateCompletionPercentage(int creditsCompleted, int totalCreditsRequired) {
        if (totalCreditsRequired == 0) {
            return BigDecimal.ZERO;
        }

        return BigDecimal.valueOf((double) creditsCompleted / totalCreditsRequired * 100)
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Check if grade is passing
     */
    private boolean isPassingGrade(String grade) {
        if (grade == null || grade.isEmpty()) {
            return false;
        }

        // Consider A, B, C, D as passing grades (F is failing)
        return grade.matches("^[A-D][+-]?$") || grade.equals("P") || grade.equals("PASS");
    }

    /**
     * Check graduation eligibility based on requirements
     */
    private boolean checkGraduationEligibilityInternal(int creditsCompleted, int totalCreditsRequired,
            BigDecimal currentGpa, BigDecimal minimumGpaRequired) {
        boolean creditsRequirementMet = creditsCompleted >= totalCreditsRequired;
        boolean gpaRequirementMet = currentGpa.compareTo(minimumGpaRequired) >= 0;

        return creditsRequirementMet && gpaRequirementMet;
    }

    /**
     * Calculate projected graduation date based on remaining credits
     */
    private LocalDate calculateProjectedGraduationDate(int creditsRemaining) {
        if (creditsRemaining <= 0) {
            return LocalDate.now(); // Already eligible
        }

        // Assume average of 15 credits per semester
        int semestersRemaining = (int) Math.ceil((double) creditsRemaining / 15);

        // Add semesters to current date (assuming 4 months per semester)
        return LocalDate.now().plusMonths(semestersRemaining * 4L);
    }

    /**
     * Convert DegreeAudit entity to DTO
     */
    private DegreeAuditDto convertToDto(DegreeAudit degreeAudit) {
        if (degreeAudit == null) {
            return null;
        }

        return DegreeAuditDto.builder()
                .id(degreeAudit.getId())
                .studentId(degreeAudit.getStudent() != null ? degreeAudit.getStudent().getId() : null)
                .studentName(degreeAudit.getStudent() != null
                        ? degreeAudit.getStudent().getFirstName() + " " + degreeAudit.getStudent().getLastName()
                        : null)
                .studentEmail(degreeAudit.getStudent() != null ? degreeAudit.getStudent().getEmail() : null)
                .academicProgramId(
                        degreeAudit.getAcademicProgram() != null ? degreeAudit.getAcademicProgram().getId() : null)
                .programName(
                        degreeAudit.getAcademicProgram() != null ? degreeAudit.getAcademicProgram().getName() : null)
                .degreeType(degreeAudit.getAcademicProgram() != null ? degreeAudit.getAcademicProgram().getDegreeType()
                        : null)
                .departmentName(degreeAudit.getAcademicProgram() != null
                        && degreeAudit.getAcademicProgram().getDepartment() != null
                                ? degreeAudit.getAcademicProgram().getDepartment().getName()
                                : null)
                .auditType(degreeAudit.getAuditType() != null ? degreeAudit.getAuditType().name() : null)
                .auditDate(degreeAudit.getAuditDate())
                .auditStatus("COMPLETED") // Simplified status
                .auditedByName(degreeAudit.getAuditedBy() != null
                        ? degreeAudit.getAuditedBy().getFirstName() + " " + degreeAudit.getAuditedBy().getLastName()
                        : "System")
                .totalRequiredCredits(degreeAudit.getTotalCreditsRequired() != null
                        ? BigDecimal.valueOf(degreeAudit.getTotalCreditsRequired())
                        : BigDecimal.ZERO)
                .totalEarnedCredits(degreeAudit.getCreditsCompleted() != null
                        ? BigDecimal.valueOf(degreeAudit.getCreditsCompleted())
                        : BigDecimal.ZERO)
                .totalRemainingCredits(degreeAudit.getCreditsRemaining() != null
                        ? BigDecimal.valueOf(degreeAudit.getCreditsRemaining())
                        : BigDecimal.ZERO)
                .overallGpa(degreeAudit.getCurrentGpa())
                .majorGpa(degreeAudit.getCurrentGpa()) // Simplified - using same as overall
                .completionPercentage(degreeAudit.getDegreeCompletionPercentage())
                .expectedGraduationDate(degreeAudit.getProjectedGraduationDate() != null
                        ? degreeAudit.getProjectedGraduationDate().toString()
                        : null)
                .notes(degreeAudit.getAuditNotes())
                .isEligibleForGraduation(degreeAudit.getEligibleForGraduation())
                .graduationEligibilityNotes(
                        degreeAudit.getEligibleForGraduation() ? "Student meets all graduation requirements"
                                : "Student does not meet all graduation requirements")
                .hasOutstandingRequirements(!degreeAudit.getEligibleForGraduation())
                .academicStanding("GOOD_STANDING") // Simplified
                .isOnTrack(degreeAudit.getDegreeCompletionPercentage() != null &&
                        degreeAudit.getDegreeCompletionPercentage().compareTo(BigDecimal.valueOf(50)) >= 0)
                .createdAt(degreeAudit.getCreatedAt())
                .updatedAt(degreeAudit.getUpdatedAt())
                .build();
    }
}
