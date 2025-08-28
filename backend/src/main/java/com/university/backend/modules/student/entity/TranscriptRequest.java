package com.university.backend.modules.student.entity;

import com.university.backend.modules.core.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transcript_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class TranscriptRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
    
    @Column(name = "request_number", unique = true, nullable = false, length = 50)
    private String requestNumber;
    
    // Request Details
    @Enumerated(EnumType.STRING)
    @Column(name = "transcript_type", nullable = false)
    @Builder.Default
    private TranscriptType transcriptType = TranscriptType.OFFICIAL;
    
    @CreatedDate
    @Column(name = "request_date", updatable = false)
    private LocalDateTime requestDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "urgency_level")
    @Builder.Default
    private UrgencyLevel urgencyLevel = UrgencyLevel.STANDARD;
    
    // Delivery Information
    @Column(name = "recipient_name", nullable = false)
    private String recipientName;
    
    @Column(name = "recipient_organization")
    private String recipientOrganization;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_method", nullable = false)
    private DeliveryMethod deliveryMethod;
    
    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress;
    
    @Column(name = "delivery_email")
    private String deliveryEmail;
    
    @Column(name = "delivery_phone", length = 20)
    private String deliveryPhone;
    
    // Processing Information
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private RequestStatus status = RequestStatus.SUBMITTED;
    
    @Column(name = "processing_fee", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal processingFee = new BigDecimal("10.00");
    
    @Column(name = "expedite_fee", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal expediteFee = BigDecimal.ZERO;
    
    @Column(name = "total_fee", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal totalFee = new BigDecimal("10.00");
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @Column(name = "payment_date")
    private LocalDateTime paymentDate;
    
    // Fulfillment
    @Column(name = "processed_date")
    private LocalDateTime processedDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;
    
    @Column(name = "shipped_date")
    private LocalDateTime shippedDate;
    
    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;
    
    @Column(name = "delivery_confirmation")
    private LocalDateTime deliveryConfirmation;
    
    // Special Instructions
    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;
    
    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Enums
    public enum TranscriptType {
        OFFICIAL, UNOFFICIAL, ENROLLMENT_VERIFICATION, DEGREE_VERIFICATION
    }
    
    public enum UrgencyLevel {
        STANDARD, EXPEDITED, RUSH
    }
    
    public enum DeliveryMethod {
        EMAIL, MAIL, PICKUP, ELECTRONIC_DELIVERY
    }
    
    public enum RequestStatus {
        SUBMITTED, PROCESSING, READY, SHIPPED, DELIVERED, CANCELLED
    }
    
    public enum PaymentStatus {
        PENDING, PAID, WAIVED, REFUNDED
    }
}
