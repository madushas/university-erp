package com.university.backend.modules.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeHistoryDto {
    
    private Long id;
    
    // Student Information
    private Long studentId;
    private String studentName;
    private String studentNumber;
    
    // Course Information
    private Long courseId;
    private String courseCode;
    private String courseName;
    private String departmentName;
    
    // Academic Period
    private Long academicYearId;
    private String academicYearName;
    private Long academicSemesterId;
    private String academicSemesterName;
    
    // Grade Information
    private String originalGrade;
    private String newGrade;
    private String changeReason;
    private String changeType;
    
    // Credit Information
    private BigDecimal creditHours;
    private BigDecimal originalQualityPoints;
    private BigDecimal newQualityPoints;
    
    // Change Details
    private LocalDateTime changeDate;
    private String changedByName;
    private String changedByRole;
    private String approvedByName;
    private LocalDateTime approvedDate;
    
    // Impact Information
    private BigDecimal gpaImpact;
    private String impactNotes;
    private Boolean affectsDegreeRequirements;
    
    // System Fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String comments;
}
