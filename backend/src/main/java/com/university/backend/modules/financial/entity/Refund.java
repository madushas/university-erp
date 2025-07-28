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

@Entity
@Table(name = "refunds")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Refund {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_account_id", nullable = false)
    private StudentAccount studentAccount;

    @Column(name = "refund_number", unique = true, nullable = false)
    private String refundNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "refund_type", nullable = false)
    private RefundType refundType;

    @Column(name = "reason", nullable = false)
    private String reason;

    @Column(name = "amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "request_date", nullable = false)
    private LocalDate requestDate;

    @Column(name = "approved_date")
    private LocalDate approvedDate;

    @Column(name = "processed_date")
    private LocalDate processedDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "refund_method")
    private RefundMethod refundMethod;

    @Column(name = "check_number")
    private String checkNumber;

    @Column(name = "transaction_id")
    private String transactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private RefundStatus status = RefundStatus.REQUESTED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_payment_id")
    private Payment originalPayment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billing_statement_id")
    private BillingStatement billingStatement;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}