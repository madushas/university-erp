package com.university.backend.modules.student.dto;

import com.university.backend.modules.student.entity.Application.ApplicationStatus;
import com.university.backend.modules.student.entity.Application.ApplicationType;
import com.university.backend.modules.student.entity.Application.ContactMethod;
import com.university.backend.modules.student.entity.Application.ReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationDto {
    
    private Long id;
    private String applicationNumber;
    
    // Applicant Information
    private Long applicantId;
    private String applicantName;
    @Email(message = "Invalid email format")
    private String applicantEmail;
    
    // Program Information
    @NotNull(message = "Academic program is required")
    private Long academicProgramId;
    private String programName;
    private String degreeType;
    private String departmentName;
    
    // Academic Year and Semester
    @NotNull(message = "Academic year is required")
    private Long academicYearId;
    private String academicYearName;
    @NotNull(message = "Academic semester is required")
    private Long academicSemesterId;
    private String academicSemesterName;
    
    // Application Details
    @NotNull(message = "Application type is required")
    private ApplicationType applicationType;
    private LocalDate applicationDate;
    private LocalDate applicationDeadline;
    private LocalDate expectedEntryDate;
    
    // Application Status
    private ApplicationStatus status;
    private ReviewStatus reviewStatus;
    private LocalDate decisionDate;
    private String decisionReason;
    
    // Contact Information
    private ContactMethod preferredContactMethod;
    private String phoneNumber;
    private String alternateEmail;
    
    // Academic Background
    private String previousInstitution;
    private BigDecimal previousGpa;
    private LocalDate graduationDate;
    private String degreeObtained;
    private String majorField;
    
    // Application Essays and Documents
    private String personalStatement;
    private String statementOfPurpose;
    private String researchInterests;
    private String careerGoals;
    
    // Financial Information
    private Boolean financialAidRequested;
    private BigDecimal estimatedFamilyContribution;
    private Boolean scholarshipRequested;
    
    // Application Fees
    private BigDecimal applicationFeeAmount;
    private Boolean applicationFeePaid;
    private LocalDateTime applicationFeePaymentDate;
    private Boolean applicationFeeWaived;
    private String applicationFeeWaiverReason;
    
    // System Fields
    private LocalDateTime submittedDate;
    private LocalDateTime lastReviewedDate;
    private String reviewedByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Document and Review Counts
    private Integer documentCount;
    private Integer reviewCount;
    private List<ApplicationDocumentDto> documents;
    private List<ApplicationReviewDto> reviews;
}
