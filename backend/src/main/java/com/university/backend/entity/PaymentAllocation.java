package com.university.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_allocations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class PaymentAllocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billing_statement_id")
    private BillingStatement billingStatement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billing_line_item_id")
    private BillingLineItem billingLineItem;

    @Column(name = "allocated_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal allocatedAmount;

    @Column(name = "allocation_date")
    @CreatedDate
    private LocalDateTime allocationDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}