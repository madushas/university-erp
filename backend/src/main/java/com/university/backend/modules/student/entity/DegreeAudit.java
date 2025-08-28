package com.university.backend.modules.student.entity;

import com.university.backend.modules.academic.entity.AcademicProgram;
import com.university.backend.modules.academic.entity.AcademicSemester;
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
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "degree_audits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class DegreeAudit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_program_id", nullable = false)
    private AcademicProgram academicProgram;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "audit_type", nullable = false)
    @Builder.Default
    private AuditType auditType = AuditType.PROGRESS;
    
    // Audit Details
    @Column(name = "audit_date", nullable = false)
    @Builder.Default
    private LocalDate auditDate = LocalDate.now();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_semester_id")
    private AcademicSemester auditSemester;
    
    @Column(name = "total_credits_required", nullable = false)
    private Integer totalCreditsRequired;
    
    @Column(name = "credits_completed")
    @Builder.Default
    private Integer creditsCompleted = 0;
    
    @Column(name = "credits_in_progress")
    @Builder.Default
    private Integer creditsInProgress = 0;
    
    @Column(name = "credits_remaining")
    @Builder.Default
    private Integer creditsRemaining = 0;
    
    // GPA Requirements
    @Column(name = "minimum_gpa_required", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal minimumGpaRequired = new BigDecimal("2.0");
    
    @Column(name = "current_gpa", precision = 4, scale = 3)
    private BigDecimal currentGpa;
    
    @Column(name = "gpa_requirement_met")
    @Builder.Default
    private Boolean gpaRequirementMet = false;
    
    // Requirement Categories
    @Column(name = "core_requirements_met")
    @Builder.Default
    private Boolean coreRequirementsMet = false;
    
    @Column(name = "major_requirements_met")
    @Builder.Default
    private Boolean majorRequirementsMet = false;
    
    @Column(name = "minor_requirements_met")
    @Builder.Default
    private Boolean minorRequirementsMet = false;
    
    @Column(name = "elective_requirements_met")
    @Builder.Default
    private Boolean electiveRequirementsMet = false;
    
    @Column(name = "general_education_met")
    @Builder.Default
    private Boolean generalEducationMet = false;
    
    // Graduation Eligibility
    @Column(name = "eligible_for_graduation")
    @Builder.Default
    private Boolean eligibleForGraduation = false;
    
    @Column(name = "projected_graduation_date")
    private LocalDate projectedGraduationDate;
    
    @Column(name = "degree_completion_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal degreeCompletionPercentage = BigDecimal.ZERO;
    
    // Administrative
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audited_by")
    private User auditedBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;
    
    @Column(name = "audit_notes", columnDefinition = "TEXT")
    private String auditNotes;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "degreeAudit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DegreeRequirementItem> requirementItems = new ArrayList<>();
    
    public enum AuditType {
        PROGRESS, GRADUATION, TRANSFER_CREDIT, DEGREE_CHANGE
    }
}
