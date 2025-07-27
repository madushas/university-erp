package com.university.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_qualifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class EmployeeQualification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @NotNull
    private EmployeeRecord employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "qualification_type", nullable = false)
    @NotNull
    private QualificationType qualificationType;

    @Column(name = "institution")
    @Size(max = 255)
    private String institution;

    @Column(name = "field_of_study")
    @Size(max = 255)
    private String fieldOfStudy;

    @Enumerated(EnumType.STRING)
    @Column(name = "degree_level")
    private DegreeLevel degreeLevel;

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "document_url")
    @Size(max = 500)
    private String documentUrl;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}