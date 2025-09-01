package com.university.backend.modules.academic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "academic_programs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class AcademicProgram {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Enumerated(EnumType.STRING)
    @Column(name = "program_type", nullable = false)
    private ProgramType programType;

    @Column(name = "degree_type")
    private String degreeType;

    @Column(name = "credit_requirements", nullable = false)
    private Integer creditRequirements;

    @Column(name = "duration_semesters", nullable = false)
    private Integer durationSemesters;

    @Column(name = "admission_requirements", columnDefinition = "TEXT")
    private String admissionRequirements;

    @Column(name = "graduation_requirements", columnDefinition = "TEXT")
    private String graduationRequirements;

    @Column(name = "accreditation_info", columnDefinition = "TEXT")
    private String accreditationInfo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private ProgramStatus status = ProgramStatus.ACTIVE;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}