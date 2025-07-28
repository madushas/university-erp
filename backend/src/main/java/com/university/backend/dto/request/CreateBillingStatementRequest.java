package com.university.backend.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateBillingStatementRequest {
    private Long studentAccountId;
    private Long academicYearId;
    private Long semesterId;
    private Long feeStructureId;
    private LocalDate dueDate;
    private String paymentTerms;
    private String notes;
    
    // Legacy fields for backward compatibility
    private Long studentId;
    private BigDecimal amount;
    private String description;
}