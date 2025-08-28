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
public class TranscriptCourseDto {
    
    private Long id;
    private Long transcriptId;
    
    // Course Information
    private String courseCode;
    private String courseName;
    private String courseDescription;
    private String departmentName;
    
    // Academic Period
    private String academicYearName;
    private String academicSemesterName;
    private String termCode;
    
    // Credit Information
    private BigDecimal creditHours;
    private BigDecimal qualityPoints;
    private String gradeEarned;
    private String gradePoints;
    
    // Course Status
    private String courseStatus;
    private Boolean isRepeated;
    private Boolean countsTowardGpa;
    private Boolean countsTowardDegree;
    
    // Transfer Information
    private Boolean isTransferCredit;
    private String transferInstitution;
    private String originalGrade;
    
    // Additional Information
    private String instructorName;
    private String courseLevel;
    private String courseType;
    private String gradeMode;
    private String notes;
}
