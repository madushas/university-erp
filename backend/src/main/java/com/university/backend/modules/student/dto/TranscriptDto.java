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
public class TranscriptDto {
    
    private Long id;
    
    // Student Information
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentNumber;
    private LocalDate dateOfBirth;
    
    // Academic Program Information
    private Long academicProgramId;
    private String programName;
    private String degreeType;
    private String departmentName;
    private String majorField;
    private String minorField;
    
    // Transcript Information
    private String transcriptType;
    private LocalDate issueDate;
    private LocalDate graduationDate;
    private String transcriptStatus;
    
    // Academic Summary
    private BigDecimal cumulativeGpa;
    private BigDecimal majorGpa;
    private BigDecimal totalCreditsEarned;
    private BigDecimal totalCreditsAttempted;
    private BigDecimal totalQualityPoints;
    
    // Degree Information
    private String degreeAwarded;
    private String degreeAwardedDate;
    private String graduationHonors;
    private String thesisTitle;
    
    // Academic Standing
    private String finalAcademicStanding;
    private String classRank;
    private String gradeSummaryNotes;
    
    // Transfer Credits
    private BigDecimal transferCredits;
    private String transferInstitutions;
    
    // Transcript Security
    private String transcriptNumber;
    private Boolean isOfficial;
    private String securityFeatures;
    private String verificationCode;
    
    // System Fields
    private String generatedByName;
    private LocalDateTime generatedDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Course Details
    private List<TranscriptCourseDto> courses;
    private Integer courseCount;
    
    // Additional Information
    private String institutionName;
    private String institutionAddress;
    private String registrarSignature;
    private String notes;
}
