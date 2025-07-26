package com.university.backend.entity;

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
@Table(name = "fee_structures")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class FeeStructure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id")
    private AcademicProgram program;

    @Enumerated(EnumType.STRING)
    @Column(name = "student_type", nullable = false)
    private StudentType studentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "residency_status")
    @Builder.Default
    private ResidencyStatus residencyStatus = ResidencyStatus.DOMESTIC;

    @Enumerated(EnumType.STRING)
    @Column(name = "enrollment_status")
    @Builder.Default
    private EnrollmentStatus enrollmentStatus = EnrollmentStatus.FULL_TIME;

    // Base fees
    @Column(name = "base_tuition", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal baseTuition = BigDecimal.ZERO;

    @Column(name = "tuition_per_credit", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal tuitionPerCredit = BigDecimal.ZERO;

    // Standard fees
    @Column(name = "technology_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal technologyFee = BigDecimal.ZERO;

    @Column(name = "activity_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal activityFee = BigDecimal.ZERO;

    @Column(name = "library_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal libraryFee = BigDecimal.ZERO;

    @Column(name = "lab_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal labFee = BigDecimal.ZERO;

    @Column(name = "parking_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal parkingFee = BigDecimal.ZERO;

    @Column(name = "health_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal healthFee = BigDecimal.ZERO;

    @Column(name = "recreation_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal recreationFee = BigDecimal.ZERO;

    @Column(name = "student_union_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal studentUnionFee = BigDecimal.ZERO;

    @Column(name = "graduation_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal graduationFee = BigDecimal.ZERO;

    // Additional fees
    @Column(name = "application_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal applicationFee = BigDecimal.ZERO;

    @Column(name = "registration_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal registrationFee = BigDecimal.ZERO;

    @Column(name = "late_registration_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal lateRegistrationFee = BigDecimal.ZERO;

    @Column(name = "transcript_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal transcriptFee = BigDecimal.ZERO;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private FeeStructureStatus status = FeeStructureStatus.ACTIVE;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "feeStructure", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<BillingLineItem> billingLineItems = new ArrayList<>();

    // Helper method to calculate total standard fees
    public BigDecimal getTotalStandardFees() {
        return technologyFee.add(activityFee)
                .add(libraryFee)
                .add(labFee)
                .add(parkingFee)
                .add(healthFee)
                .add(recreationFee)
                .add(studentUnionFee);
    }

    // Helper method to check if fee structure is currently active
    public boolean isCurrentlyActive() {
        LocalDate now = LocalDate.now();
        return status == FeeStructureStatus.ACTIVE &&
               !now.isBefore(effectiveDate) &&
               (expiryDate == null || !now.isAfter(expiryDate));
    }
}