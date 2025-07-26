package com.university.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "late_fees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class LateFee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_account_id", nullable = false)
    private StudentAccount studentAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billing_statement_id")
    private BillingStatement billingStatement;

    @Enumerated(EnumType.STRING)
    @Column(name = "fee_type", nullable = false)
    @Builder.Default
    private LateFeeType feeType = LateFeeType.LATE_PAYMENT;

    @Column(name = "original_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal originalAmount;

    @Column(name = "fee_rate", precision = 5, scale = 4)
    private BigDecimal feeRate;

    @Column(name = "calculated_fee", precision = 10, scale = 2, nullable = false)
    private BigDecimal calculatedFee;

    @Column(name = "assessed_fee", precision = 10, scale = 2, nullable = false)
    private BigDecimal assessedFee;

    @Column(name = "waived_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal waivedAmount = BigDecimal.ZERO;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "assessment_date", nullable = false)
    private LocalDate assessmentDate;

    @Column(name = "waived_date")
    private LocalDate waivedDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private LateFeeStatus status = LateFeeStatus.ASSESSED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waived_by")
    private User waivedBy;

    @Column(name = "waiver_reason", columnDefinition = "TEXT")
    private String waiverReason;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}