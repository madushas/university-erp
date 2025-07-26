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
@Table(name = "billing_statements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class BillingStatement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_account_id", nullable = false)
    private StudentAccount studentAccount;

    @Column(name = "statement_number", unique = true, nullable = false)
    private String statementNumber;

    @Column(name = "billing_date", nullable = false)
    private LocalDate billingDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id")
    private AcademicSemester semester;

    // Amount calculations
    @Column(name = "subtotal_amount", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal subtotalAmount = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "paid_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "balance_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal balanceAmount;

    // Payment terms
    @Column(name = "payment_terms")
    private String paymentTerms;

    @Column(name = "late_fee_rate", precision = 5, scale = 4)
    @Builder.Default
    private BigDecimal lateFeeRate = new BigDecimal("0.0150"); // 1.5% per month

    @Column(name = "minimum_payment", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal minimumPayment = BigDecimal.ZERO;

    // Status and tracking
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private BillingStatus status = BillingStatus.PENDING;

    @Column(name = "payment_plan_id")
    private Long paymentPlanId;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "billingStatement", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<BillingLineItem> lineItems = new ArrayList<>();

    @OneToMany(mappedBy = "billingStatement", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PaymentAllocation> paymentAllocations = new ArrayList<>();

    @OneToMany(mappedBy = "billingStatement", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<LateFee> lateFees = new ArrayList<>();

    @OneToMany(mappedBy = "billingStatement", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Refund> refunds = new ArrayList<>();

    // Helper methods
    public boolean isOverdue() {
        return LocalDate.now().isAfter(dueDate) && 
               balanceAmount.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isPaid() {
        return status == BillingStatus.PAID || 
               balanceAmount.compareTo(BigDecimal.ZERO) <= 0;
    }

    public BigDecimal getRemainingBalance() {
        return totalAmount.subtract(paidAmount);
    }

    public int getDaysOverdue() {
        if (!isOverdue()) {
            return 0;
        }
        return (int) java.time.temporal.ChronoUnit.DAYS.between(dueDate, LocalDate.now());
    }
}