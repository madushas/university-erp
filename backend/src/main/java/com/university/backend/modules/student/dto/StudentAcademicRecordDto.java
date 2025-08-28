package com.university.backend.modules.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAcademicRecordDto {
    
    private Long id;
    
    // Student Information
    @NotNull(message = "Student ID is required")
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentNumber;
    
    // Academic Program Information
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
    
    // Academic Status
    private String enrollmentStatus;
    private String studentClassification;
    private String academicStanding;
    
    // Academic Progress
    @DecimalMin(value = "0.0", inclusive = true, message = "GPA cannot be negative")
    @DecimalMax(value = "4.0", inclusive = true, message = "GPA cannot exceed 4.0")
    private BigDecimal cumulativeGpa;
    @DecimalMin(value = "0.0", inclusive = true, message = "GPA cannot be negative")
    @DecimalMax(value = "4.0", inclusive = true, message = "GPA cannot exceed 4.0")
    private BigDecimal semesterGpa;
    @Min(value = 0, message = "Credits earned cannot be negative")
    private Integer totalCreditsEarned;
    @Min(value = 0, message = "Credits attempted cannot be negative")
    private Integer totalCreditsAttempted;
    @Min(value = 0, message = "Credits earned cannot be negative")
    private Integer semesterCreditsEarned;
    @Min(value = 0, message = "Credits attempted cannot be negative")
    private Integer semesterCreditsAttempted;
    
    // Dates
    private LocalDate enrollmentDate;
    private LocalDate expectedGraduationDate;
    private LocalDate graduationDate;
    
    // Additional Information
    private String majorDeclarationDate;
    private String minorField;
    private String concentrationArea;
    private String advisorName;
    
    // Holds and Restrictions
    private Boolean hasAcademicHold;
    private String academicHoldReason;
    private Boolean hasDisciplinaryAction;
    private String disciplinaryActionReason;
    
    // Academic Probation/Warning
    private Boolean isOnAcademicProbation;
    private String academicProbationReason;
    private LocalDate academicProbationDate;
    private Boolean isOnAcademicWarning;
    private String academicWarningReason;
    
    // Transfer Information
    private Integer transferCredits;
    private String transferInstitution;
    private BigDecimal transferGpa;
    
    // System Fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Statistics
    private Integer courseCount;
    private BigDecimal averageGrade;
}
