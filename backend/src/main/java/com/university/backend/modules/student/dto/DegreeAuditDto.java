package com.university.backend.modules.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DegreeAuditDto {

    private Long id;

    // Student Information
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentNumber;

    // Academic Program Information
    private Long academicProgramId;
    private String programName;
    private String degreeType;
    private String departmentName;

    // Audit Information
    private String auditType;
    private LocalDate auditDate;
    private String auditStatus;
    private String auditedByName;

    // Degree Requirements Summary
    private BigDecimal totalRequiredCredits;
    private BigDecimal totalEarnedCredits;
    private BigDecimal totalRemainingCredits;
    private BigDecimal overallGpa;
    private BigDecimal majorGpa;

    // Progress Information
    private BigDecimal completionPercentage;
    private Integer totalRequiredCourses;
    private Integer totalCompletedCourses;
    private String expectedGraduationDate;

    // Additional fields for updates
    private String notes;
    private String advisorComments;

    // Status Information
    private Boolean isEligibleForGraduation;
    private String graduationEligibilityNotes;
    private Boolean hasOutstandingRequirements;
    private String outstandingRequirementsNotes;

    // Academic Standing
    private String academicStanding;
    private Boolean isOnTrack;
    private String advisorRecommendations;

    // System Fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Detailed Requirements
    private List<DegreeRequirementItemDto> requirementItems;
    private Integer requirementItemsCount;
}
