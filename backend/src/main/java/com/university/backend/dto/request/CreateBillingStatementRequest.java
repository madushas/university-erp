package com.university.backend.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateBillingStatementRequest {
    private Long studentId;
    private BigDecimal amount;
    private String description;
}