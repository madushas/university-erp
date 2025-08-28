package com.university.backend.modules.student.service;

import com.university.backend.modules.academic.repository.AcademicProgramRepository;
import com.university.backend.modules.academic.repository.AcademicSemesterRepository;
import com.university.backend.modules.academic.repository.AcademicYearRepository;
import com.university.backend.modules.core.entity.User;
import com.university.backend.modules.core.repository.UserRepository;
import com.university.backend.modules.student.dto.ApplicationDto;
import com.university.backend.modules.student.entity.Application;
import com.university.backend.modules.student.entity.Application.ApplicationStatus;
import com.university.backend.modules.student.entity.Application.ReviewStatus;
import com.university.backend.modules.student.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
@Validated
public class ApplicationService {
    
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final AcademicProgramRepository academicProgramRepository;
    private final AcademicYearRepository academicYearRepository;
    private final AcademicSemesterRepository academicSemesterRepository;
    
    /**
     * Create a new application
     */
    public ApplicationDto createApplication(@NotNull(message = "Application data is required") ApplicationDto applicationDto) {
        log.info("Creating new application for applicant: {}", applicationDto.getApplicantEmail());
        
        // Validate required fields
        if (applicationDto.getAcademicProgramId() == null) {
            throw new IllegalArgumentException("Academic program is required");
        }
        if (applicationDto.getAcademicYearId() == null) {
            throw new IllegalArgumentException("Academic year is required");
        }
        if (applicationDto.getAcademicSemesterId() == null) {
            throw new IllegalArgumentException("Academic semester is required");
        }
        if (applicationDto.getApplicationType() == null) {
            throw new IllegalArgumentException("Application type is required");
        }
        
        // If applicantId is not provided, use the current authenticated user
        if (applicationDto.getApplicantId() == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getName() != null) {
                User currentUser = userRepository.findByUsername(authentication.getName())
                        .orElseThrow(() -> new IllegalArgumentException("Current user not found: " + authentication.getName()));
                applicationDto.setApplicantId(currentUser.getId());
                log.info("Set applicant ID to current user: {}", currentUser.getId());
            } else {
                throw new IllegalArgumentException("No authenticated user found and applicantId not provided");
            }
        }
        
        // Validate that applicant exists
        userRepository.findById(applicationDto.getApplicantId())
                .orElseThrow(() -> new IllegalArgumentException("Applicant not found with ID: " + applicationDto.getApplicantId()));
        
        // Validate that academic program exists
        academicProgramRepository.findById(applicationDto.getAcademicProgramId())
                .orElseThrow(() -> new IllegalArgumentException("Academic program not found with ID: " + applicationDto.getAcademicProgramId()));
        
        // Validate that academic year exists
        academicYearRepository.findById(applicationDto.getAcademicYearId())
                .orElseThrow(() -> new IllegalArgumentException("Academic year not found with ID: " + applicationDto.getAcademicYearId()));
        
        // Validate that academic semester exists
        academicSemesterRepository.findById(applicationDto.getAcademicSemesterId())
                .orElseThrow(() -> new IllegalArgumentException("Academic semester not found with ID: " + applicationDto.getAcademicSemesterId()));
        
        Application application = convertToEntity(applicationDto);
        
        application.setStatus(ApplicationStatus.DRAFT);
        application.setReviewStatus(ReviewStatus.PENDING);
        application.setApplicationDate(LocalDate.now());
        
        // Generate application number
        application.setApplicationNumber(generateApplicationNumber());
        
        Application savedApplication = applicationRepository.save(application);
        log.info("Created application with ID: {} and number: {} for applicant: {}", 
                savedApplication.getId(), savedApplication.getApplicationNumber(), 
                savedApplication.getApplicant().getId());
        
        return convertToDto(savedApplication);
    }
    
    /**
     * Update an existing application
     */
    public ApplicationDto updateApplication(ApplicationDto applicationDto) {
        log.info("Updating application with ID: {}", applicationDto.getId());
        
        if (applicationDto.getId() == null) {
            throw new IllegalArgumentException("Application ID is required for update");
        }
        
        Application existingApplication = applicationRepository.findById(applicationDto.getId())
                .orElseThrow(() -> new IllegalArgumentException("Application not found with ID: " + applicationDto.getId()));
        
        // Only allow updates to DRAFT applications
        if (existingApplication.getStatus() != ApplicationStatus.DRAFT) {
            throw new IllegalArgumentException("Only draft applications can be updated");
        }
        
        // Keep the original applicant and application number
        applicationDto.setApplicantId(existingApplication.getApplicant().getId());
        
        Application updatedApplication = convertToEntity(applicationDto);
        updatedApplication.setApplicationNumber(existingApplication.getApplicationNumber());
        updatedApplication.setApplicationDate(existingApplication.getApplicationDate());
        
        Application savedApplication = applicationRepository.save(updatedApplication);
        log.info("Updated application: {}", savedApplication.getApplicationNumber());
        
        return convertToDto(savedApplication);
    }
    
    /**
     * Submit application for review
     */
    public ApplicationDto submitApplication(Long applicationId) {
        log.info("Submitting application with ID: {}", applicationId);
        
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with ID: " + applicationId));
                
        if (application.getStatus() != ApplicationStatus.DRAFT) {
            throw new IllegalArgumentException("Only draft applications can be submitted");
        }
        
        // Validate required fields
        validateApplicationForSubmission(application);
        
        application.setStatus(ApplicationStatus.SUBMITTED);
        application.setReviewStatus(ReviewStatus.IN_PROGRESS);
        application.setSubmittedDate(LocalDateTime.now());
        
        Application savedApplication = applicationRepository.save(application);
        log.info("Submitted application: {}", savedApplication.getApplicationNumber());
        
        return convertToDto(savedApplication);
    }
    
    /**
     * Update application status
     */
    public ApplicationDto updateApplicationStatus(Long applicationId, ApplicationStatus status, String reason) {
        log.info("Updating application {} status to: {}", applicationId, status);
        
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with ID: " + applicationId));
                
        application.setStatus(status);
        application.setDecisionReason(reason);
        
        if (status == ApplicationStatus.ACCEPTED || status == ApplicationStatus.REJECTED) {
            application.setDecisionDate(LocalDate.now());
            application.setReviewStatus(ReviewStatus.COMPLETED);
        }
        
        Application savedApplication = applicationRepository.save(application);
        log.info("Updated application {} status to: {}", savedApplication.getApplicationNumber(), status);
        
        return convertToDto(savedApplication);
    }
    
    /**
     * Find application by ID
     */
    @Transactional(readOnly = true)
    public Optional<ApplicationDto> findById(Long id) {
        return applicationRepository.findById(id)
                .map(this::convertToDto);
    }
    
    /**
     * Find applications by student ID
     */
    @Transactional(readOnly = true)
    public List<ApplicationDto> findByStudentId(Long studentId) {
        return applicationRepository.findByApplicantIdOrderByApplicationDateDesc(studentId)
                .stream()
                .map(this::convertToDto)
                .toList();
    }
    
    /**
     * Find applications by status
     */
    @Transactional(readOnly = true)
    public Page<ApplicationDto> findByStatus(ApplicationStatus status, Pageable pageable) {
        return applicationRepository.findByStatus(status, pageable)
                .map(this::convertToDto);
    }
    
    /**
     * Find applications by program and academic year
     */
    @Transactional(readOnly = true)
    public Page<ApplicationDto> findByProgramAndYear(Long programId, Long academicYearId, Pageable pageable) {
        return applicationRepository.findByAcademicProgramIdAndAcademicYearId(programId, academicYearId, pageable)
                .map(this::convertToDto);
    }
    
    /**
     * Find applications requiring review
     */
    @Transactional(readOnly = true)
    public Page<ApplicationDto> findApplicationsForReview(Pageable pageable) {
        return applicationRepository.findByReviewStatus(ReviewStatus.IN_PROGRESS, pageable)
                .map(this::convertToDto);
    }
    
    /**
     * Get application statistics
     */
    @Transactional(readOnly = true)
    public ApplicationStatistics getApplicationStatistics(Long academicYearId) {
        Long total = applicationRepository.countByAcademicYearId(academicYearId);
        Long pending = applicationRepository.countByAcademicYearIdAndStatus(academicYearId, ApplicationStatus.SUBMITTED);
        Long accepted = applicationRepository.countByAcademicYearIdAndStatus(academicYearId, ApplicationStatus.ACCEPTED);
        Long rejected = applicationRepository.countByAcademicYearIdAndStatus(academicYearId, ApplicationStatus.REJECTED);
        
        return new ApplicationStatistics(total, pending, accepted, rejected);
    }
    
    /**
     * Find applications by application number
     */
    @Transactional(readOnly = true)
    public Optional<ApplicationDto> findByApplicationNumber(String applicationNumber) {
        return applicationRepository.findByApplicationNumber(applicationNumber)
                .map(this::convertToDto);
    }
    
    /**
     * Find overdue applications (past deadline without decision)
     */
    @Transactional(readOnly = true)
    public List<ApplicationDto> findOverdueApplications() {
        LocalDate currentDate = LocalDate.now();
        return applicationRepository.findByApplicationDeadlineLessThanAndStatusIn(
                currentDate, 
                List.of(ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW))
                .stream()
                .map(this::convertToDto)
                .toList();
    }
    
    /**
     * Delete application (only if in draft status)
     */
    public void deleteApplication(Long applicationId) {
        log.info("Deleting application with ID: {}", applicationId);
        
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with ID: " + applicationId));
                
        if (application.getStatus() != ApplicationStatus.DRAFT) {
            throw new RuntimeException("Only draft applications can be deleted");
        }
        
        applicationRepository.delete(application);
        log.info("Deleted application: {}", application.getApplicationNumber());
    }
    
    // Helper methods
    
    private void validateApplicationForSubmission(Application application) {
        if (application.getApplicant() == null) {
            throw new IllegalArgumentException("Applicant information is required");
        }
        if (application.getAcademicProgram() == null) {
            throw new IllegalArgumentException("Academic program selection is required");
        }
        if (application.getPersonalStatement() == null || application.getPersonalStatement().trim().isEmpty()) {
            throw new IllegalArgumentException("Personal statement is required");
        }
    }
    
    private String generateApplicationNumber() {
        String year = String.valueOf(LocalDate.now().getYear());
        Long count = applicationRepository.countByApplicationDateBetween(
                LocalDate.of(LocalDate.now().getYear(), 1, 1),
                LocalDate.of(LocalDate.now().getYear(), 12, 31)
        );
        return String.format("APP-%s-%06d", year, count + 1);
    }
    
    private ApplicationDto convertToDto(Application application) {
        return ApplicationDto.builder()
                .id(application.getId())
                .applicationNumber(application.getApplicationNumber())
                .applicantId(application.getApplicant().getId())
                .applicantName(application.getApplicant().getFirstName() + " " + application.getApplicant().getLastName())
                .applicantEmail(application.getApplicant().getEmail())
                .academicProgramId(application.getAcademicProgram() != null ? application.getAcademicProgram().getId() : null)
                .programName(application.getAcademicProgram() != null ? application.getAcademicProgram().getName() : null)
                .degreeType(application.getAcademicProgram() != null ? application.getAcademicProgram().getDegreeType() : null)
                .departmentName(application.getAcademicProgram() != null ? application.getAcademicProgram().getDepartment().getName() : null)
                .academicYearId(application.getAcademicYear() != null ? application.getAcademicYear().getId() : null)
                .academicYearName(application.getAcademicYear() != null ? application.getAcademicYear().getName() : null)
                .academicSemesterId(application.getAcademicSemester() != null ? application.getAcademicSemester().getId() : null)
                .academicSemesterName(application.getAcademicSemester() != null ? application.getAcademicSemester().getName() : null)
                .applicationType(application.getApplicationType())
                .applicationDate(application.getApplicationDate())
                .applicationDeadline(application.getApplicationDeadline())
                .expectedEntryDate(application.getExpectedEntryDate())
                .status(application.getStatus())
                .reviewStatus(application.getReviewStatus())
                .decisionDate(application.getDecisionDate())
                .decisionReason(application.getDecisionReason())
                .preferredContactMethod(application.getPreferredContactMethod())
                .phoneNumber(application.getPhoneNumber())
                .alternateEmail(application.getAlternateEmail())
                .previousInstitution(application.getPreviousInstitution())
                .previousGpa(application.getPreviousGpa())
                .graduationDate(application.getGraduationDate())
                .degreeObtained(application.getDegreeObtained())
                .majorField(application.getMajorField())
                .personalStatement(application.getPersonalStatement())
                .statementOfPurpose(application.getStatementOfPurpose())
                .researchInterests(application.getResearchInterests())
                .careerGoals(application.getCareerGoals())
                .financialAidRequested(application.getFinancialAidRequested())
                .estimatedFamilyContribution(application.getEstimatedFamilyContribution())
                .scholarshipRequested(application.getScholarshipRequested())
                .applicationFeeAmount(application.getApplicationFeeAmount())
                .applicationFeePaid(application.getApplicationFeePaid())
                .applicationFeePaymentDate(application.getApplicationFeePaymentDate())
                .applicationFeeWaived(application.getApplicationFeeWaived())
                .applicationFeeWaiverReason(application.getApplicationFeeWaiverReason())
                .submittedDate(application.getSubmittedDate())
                .lastReviewedDate(application.getLastReviewedDate())
                .reviewedByName(application.getReviewedBy() != null ? 
                        application.getReviewedBy().getFirstName() + " " + application.getReviewedBy().getLastName() : null)
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .build();
    }
    
    private Application convertToEntity(ApplicationDto dto) {
        Application.ApplicationBuilder builder = Application.builder();
        
        if (dto.getId() != null) {
            builder.id(dto.getId());
        }
        
        return builder
                .applicationNumber(dto.getApplicationNumber())
                .applicant(dto.getApplicantId() != null ? 
                        userRepository.findById(dto.getApplicantId()).orElse(null) : null)
                .academicProgram(dto.getAcademicProgramId() != null ? 
                        academicProgramRepository.findById(dto.getAcademicProgramId()).orElse(null) : null)
                .academicYear(dto.getAcademicYearId() != null ? 
                        academicYearRepository.findById(dto.getAcademicYearId()).orElse(null) : null)
                .academicSemester(dto.getAcademicSemesterId() != null ? 
                        academicSemesterRepository.findById(dto.getAcademicSemesterId()).orElse(null) : null)
                .applicationType(dto.getApplicationType())
                .applicationDate(dto.getApplicationDate())
                .applicationDeadline(dto.getApplicationDeadline())
                .expectedEntryDate(dto.getExpectedEntryDate())
                .status(dto.getStatus())
                .reviewStatus(dto.getReviewStatus())
                .decisionDate(dto.getDecisionDate())
                .decisionReason(dto.getDecisionReason())
                .preferredContactMethod(dto.getPreferredContactMethod())
                .phoneNumber(dto.getPhoneNumber())
                .alternateEmail(dto.getAlternateEmail())
                .previousInstitution(dto.getPreviousInstitution())
                .previousGpa(dto.getPreviousGpa())
                .graduationDate(dto.getGraduationDate())
                .degreeObtained(dto.getDegreeObtained())
                .majorField(dto.getMajorField())
                .personalStatement(dto.getPersonalStatement())
                .statementOfPurpose(dto.getStatementOfPurpose())
                .researchInterests(dto.getResearchInterests())
                .careerGoals(dto.getCareerGoals())
                .financialAidRequested(dto.getFinancialAidRequested())
                .estimatedFamilyContribution(dto.getEstimatedFamilyContribution())
                .scholarshipRequested(dto.getScholarshipRequested())
                .applicationFeeAmount(dto.getApplicationFeeAmount())
                .applicationFeePaid(dto.getApplicationFeePaid())
                .applicationFeePaymentDate(dto.getApplicationFeePaymentDate())
                .applicationFeeWaived(dto.getApplicationFeeWaived())
                .applicationFeeWaiverReason(dto.getApplicationFeeWaiverReason())
                .submittedDate(dto.getSubmittedDate())
                .lastReviewedDate(dto.getLastReviewedDate())
                .build();
    }
    
    // Inner class for statistics
    public static class ApplicationStatistics {
        private final Long totalApplications;
        private final Long pendingApplications;
        private final Long acceptedApplications;
        private final Long rejectedApplications;
        private final BigDecimal acceptanceRate;
        
        public ApplicationStatistics(Long total, Long pending, Long accepted, Long rejected) {
            this.totalApplications = total != null ? total : 0L;
            this.pendingApplications = pending != null ? pending : 0L;
            this.acceptedApplications = accepted != null ? accepted : 0L;
            this.rejectedApplications = rejected != null ? rejected : 0L;
            this.acceptanceRate = total != null && total > 0 ? 
                    BigDecimal.valueOf((accepted != null ? accepted : 0L) * 100.0 / total) : BigDecimal.ZERO;
        }
        
        // Getters
        public Long getTotalApplications() { return totalApplications; }
        public Long getPendingApplications() { return pendingApplications; }
        public Long getAcceptedApplications() { return acceptedApplications; }
        public Long getRejectedApplications() { return rejectedApplications; }
        public BigDecimal getAcceptanceRate() { return acceptanceRate; }
    }
}
