package com.university.backend.dto.response;

import com.university.backend.modules.financial.entity.BillingStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class BillingStatementResponse {
    private Long id;
    private String statementNumber;
    private String studentName;
    private String studentId;
    private LocalDate billingDate;
    private LocalDate dueDate;
    private BigDecimal totalAmount;
    private BigDecimal balanceAmount;
    private BillingStatus status;
}