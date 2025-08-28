package com.university.backend.modules.student.entity;

import com.university.backend.modules.academic.entity.AcademicProgram;
import com.university.backend.modules.academic.entity.AcademicSemester;
import com.university.backend.modules.academic.entity.AcademicYear;
import com.university.backend.modules.core.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_academic_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class StudentAcademicRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_program_id")
    private AcademicProgram academicProgram;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_semester_id")
    private AcademicSemester academicSemester;
    
    // Academic Standing
    @Enumerated(EnumType.STRING)
    @Column(name = "academic_level", nullable = false)
    @Builder.Default
    private AcademicLevel academicLevel = AcademicLevel.UNDERGRADUATE;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "class_level", length = 50)
    private ClassLevel classLevel;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "enrollment_status", nullable = false)
    @Builder.Default
    private EnrollmentStatus enrollmentStatus = EnrollmentStatus.ACTIVE;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "academic_standing")
    @Builder.Default
    private AcademicStanding academicStanding = AcademicStanding.GOOD_STANDING;
    
    // GPA Calculations
    @Column(name = "semester_gpa", precision = 4, scale = 3)
    private BigDecimal semesterGpa;
    
    @Column(name = "cumulative_gpa", precision = 4, scale = 3)
    private BigDecimal cumulativeGpa;
    
    @Column(name = "major_gpa", precision = 4, scale = 3)
    private BigDecimal majorGpa;
    
    @Column(name = "total_credits_attempted")
    @Builder.Default
    private Integer totalCreditsAttempted = 0;
    
    @Column(name = "total_credits_earned")
    @Builder.Default
    private Integer totalCreditsEarned = 0;
    
    @Column(name = "total_quality_points", precision = 8, scale = 3)
    @Builder.Default
    private BigDecimal totalQualityPoints = BigDecimal.ZERO;
    
    // Degree Progress
    @Column(name = "degree_progress_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal degreeProgressPercentage = BigDecimal.ZERO;
    
    @Column(name = "credits_remaining")
    private Integer creditsRemaining;
    
    @Column(name = "expected_graduation_date")
    private LocalDate expectedGraduationDate;
    
    @Column(name = "graduation_application_date")
    private LocalDate graduationApplicationDate;
    
    @Column(name = "graduation_eligibility_verified")
    @Builder.Default
    private Boolean graduationEligibilityVerified = false;
    
    // Academic Warnings and Actions
    @Enumerated(EnumType.STRING)
    @Column(name = "probation_status")
    private ProbationStatus probationStatus;
    
    @Column(name = "probation_start_date")
    private LocalDate probationStartDate;
    
    @Column(name = "probation_end_date")
    private LocalDate probationEndDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "suspension_status")
    private SuspensionStatus suspensionStatus;
    
    @Column(name = "readmission_conditions", columnDefinition = "TEXT")
    private String readmissionConditions;
    
    // Dean's List and Honors
    @Column(name = "deans_list_eligible")
    @Builder.Default
    private Boolean deansListEligible = false;
    
    @Column(name = "honors_designation", length = 100)
    private String honorsDesignation;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "latin_honors")
    private LatinHonors latinHonors;
    
    // Record Dates
    @Column(name = "record_date", nullable = false)
    @Builder.Default
    private LocalDate recordDate = LocalDate.now();
    
    @Column(name = "effective_date", nullable = false)
    @Builder.Default
    private LocalDate effectiveDate = LocalDate.now();
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Enums
    public enum AcademicLevel {
        UNDERGRADUATE, GRADUATE, DOCTORAL, CERTIFICATE, NON_DEGREE
    }
    
    public enum ClassLevel {
        FRESHMAN, SOPHOMORE, JUNIOR, SENIOR, GRADUATE, DOCTORAL
    }
    
    public enum EnrollmentStatus {
        ACTIVE, INACTIVE, GRADUATED, WITHDRAWN, SUSPENDED, LEAVE_OF_ABSENCE
    }
    
    public enum AcademicStanding {
        GOOD_STANDING, ACADEMIC_PROBATION, ACADEMIC_SUSPENSION, ACADEMIC_DISMISSAL, DEANS_LIST
    }
    
    public enum ProbationStatus {
        NONE, FIRST_WARNING, PROBATION, FINAL_WARNING
    }
    
    public enum SuspensionStatus {
        NONE, SUSPENDED, DISMISSED
    }
    
    public enum LatinHonors {
        CUM_LAUDE, MAGNA_CUM_LAUDE, SUMMA_CUM_LAUDE
    }
}
