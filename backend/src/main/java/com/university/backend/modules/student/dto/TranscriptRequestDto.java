package com.university.backend.modules.student.dto;

import com.university.backend.modules.student.entity.TranscriptRequest.DeliveryMethod;
import com.university.backend.modules.student.entity.TranscriptRequest.RequestStatus;
import com.university.backend.modules.student.entity.TranscriptRequest.TranscriptType;
import com.university.backend.modules.student.entity.TranscriptRequest.UrgencyLevel;
import com.university.backend.modules.student.entity.TranscriptRequest.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TranscriptRequestDto {
    
    private Long id;
    
    // Student Information
    @NotNull(message = "Student ID is required")
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentNumber;
    
    // Request Information
    @NotNull(message = "Transcript type is required")
    private TranscriptType transcriptType;
    private LocalDateTime requestDate;
    @NotBlank(message = "Purpose is required")
    private String purpose;
    private String notes;
    private UrgencyLevel urgencyLevel;
    
    // Delivery Information
    @NotNull(message = "Delivery method is required")
    private DeliveryMethod deliveryMethod;
    @NotBlank(message = "Recipient name is required")
    private String recipientName;
    private String recipientInstitution;
    private String deliveryAddress;
    private String deliveryEmail;
    private String deliveryPhone;
    
    // Processing Information
    private RequestStatus status;
    private LocalDateTime expectedDeliveryDate;
    private LocalDateTime actualDeliveryDate;
    private String processedByName;
    private LocalDateTime processedDate;
    
    // Payment Information
    private BigDecimal feeAmount;
    private PaymentStatus paymentStatus;
    private LocalDateTime feePaymentDate;
    private String paymentTransactionId;
    
    // Tracking Information
    private String trackingNumber;
    private String deliveryConfirmation;
    private Boolean isRush;
    private LocalDateTime rushDeadline;
    
    // Associated Transcript
    private Long transcriptId;
    private String transcriptNumber;
    
    // System Fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
