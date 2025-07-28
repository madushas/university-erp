package com.university.backend.modules.financial.entity;

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
@Table(name = "payment_plan_installments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class PaymentPlanInstallment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_plan_id", nullable = false)
    private PaymentPlan paymentPlan;

    @Column(name = "installment_number", nullable = false)
    private Integer installmentNumber;

    @Column(name = "scheduled_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal scheduledAmount;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "paid_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column(name = "late_fee_assessed", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal lateFeeAssessed = BigDecimal.ZERO;

    @Column(name = "late_fee_waived", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal lateFeeWaived = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private InstallmentStatus status = InstallmentStatus.SCHEDULED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}