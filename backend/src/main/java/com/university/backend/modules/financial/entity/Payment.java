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
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_account_id", nullable = false)
    private StudentAccount studentAccount;

    @Column(name = "payment_number", unique = true, nullable = false)
    private String paymentNumber;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type")
    @Builder.Default
    private PaymentType paymentType = PaymentType.REGULAR;

    @Column(name = "reference_number")
    private String referenceNumber;

    @Column(name = "check_number")
    private String checkNumber;

    @Column(name = "gateway_transaction_id")
    private String gatewayTransactionId;

    @Column(name = "authorization_code")
    private String authorizationCode;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "account_last_four")
    private String accountLastFour;

    @Column(name = "routing_number")
    private String routingNumber;

    @Column(name = "processed_date")
    private LocalDateTime processedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;

    @Column(name = "processing_fee", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal processingFee = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "reconciliation_date")
    private LocalDate reconciliationDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reconciled_by")
    private User reconciledBy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "receipt_sent")
    @Builder.Default
    private Boolean receiptSent = false;

    @Column(name = "receipt_sent_date")
    private LocalDateTime receiptSentDate;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PaymentAllocation> paymentAllocations = new ArrayList<>();

    // Helper methods
    public boolean isSuccessful() {
        return status == PaymentStatus.COMPLETED;
    }

    public boolean isPending() {
        return status == PaymentStatus.PENDING || status == PaymentStatus.PROCESSING;
    }

    public boolean isFailed() {
        return status == PaymentStatus.FAILED || status == PaymentStatus.CANCELLED;
    }

    public BigDecimal getNetAmount() {
        return amount.subtract(processingFee);
    }
}