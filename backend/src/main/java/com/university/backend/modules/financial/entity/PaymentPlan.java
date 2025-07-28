package com.university.backend.modules.financial.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.university.backend.modules.core.entity.User;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payment_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class PaymentPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_account_id", nullable = false)
    private StudentAccount studentAccount;

    @Column(name = "plan_name", nullable = false)
    private String planName;

    @Column(name = "total_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "down_payment", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal downPayment = BigDecimal.ZERO;

    @Column(name = "number_of_installments", nullable = false)
    private Integer numberOfInstallments;

    @Column(name = "installment_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal installmentAmount;

    @Column(name = "setup_fee", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal setupFee = BigDecimal.ZERO;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "first_payment_date", nullable = false)
    private LocalDate firstPaymentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_frequency")
    @Builder.Default
    private PaymentFrequency paymentFrequency = PaymentFrequency.MONTHLY;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private PaymentPlanStatus status = PaymentPlanStatus.ACTIVE;

    @Column(name = "auto_pay_enabled")
    @Builder.Default
    private Boolean autoPayEnabled = false;

    @Column(name = "late_fee_amount", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal lateFeeAmount = new BigDecimal("25.00");

    @Column(name = "grace_period_days")
    @Builder.Default
    private Integer gracePeriodDays = 10;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "paymentPlan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PaymentPlanInstallment> installments = new ArrayList<>();
}