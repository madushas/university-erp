package com.university.backend.modules.student.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "degree_requirement_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DegreeRequirementItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "degree_audit_id", nullable = false)
    private DegreeAudit degreeAudit;
    
    @Column(name = "requirement_category", nullable = false, length = 100)
    private String requirementCategory;
    
    @Column(name = "requirement_description", nullable = false, columnDefinition = "TEXT")
    private String requirementDescription;
    
    @Column(name = "credits_required", nullable = false)
    @Builder.Default
    private Integer creditsRequired = 0;
    
    @Column(name = "credits_completed")
    @Builder.Default
    private Integer creditsCompleted = 0;
    
    @Column(name = "requirement_met")
    @Builder.Default
    private Boolean requirementMet = false;
    
    @Column(name = "courses_required", columnDefinition = "TEXT")
    private String coursesRequired; // JSON array of required course codes
    
    @Column(name = "courses_completed", columnDefinition = "TEXT") 
    private String coursesCompleted; // JSON array of completed course codes
    
    @Column(name = "grade_requirement", length = 10)
    private String gradeRequirement; // Minimum grade required
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
