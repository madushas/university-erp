package com.university.backend.modules.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DegreeRequirementItemDto {
    
    private Long id;
    private Long degreeAuditId;
    
    // Requirement Information
    private String requirementCategory;
    private String requirementName;
    private String description;
    private String requirementType;
    
    // Credit Requirements
    private Integer requiredCredits;
    private Integer earnedCredits;
    private Integer remainingCredits;
    
    // Course Requirements
    private Integer requiredCourses;
    private Integer completedCourses;
    private Integer remainingCourses;
    
    // GPA Requirements
    private BigDecimal minimumGpa;
    private BigDecimal currentGpa;
    
    // Status
    private String status;
    private Boolean isCompleted;
    private Boolean isInProgress;
    private String completionNotes;
    
    // Course Lists
    private String requiredCoursesList;
    private String completedCoursesList;
    private String inProgressCoursesList;
    private String recommendedCoursesList;
}
