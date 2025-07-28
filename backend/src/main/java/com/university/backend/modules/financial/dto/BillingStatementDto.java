package com.university.backend.modules.financial.dto;

import com.university.backend.modules.core.dto.BaseDto;
import com.university.backend.modules.financial.entity.BillingStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class BillingStatementDto extends BaseDto {
    private StudentAccountDto studentAccount;
    private String statementNumber;
    private LocalDate billingDate;
    private LocalDate dueDate;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal outstandingAmount;
    private BillingStatus status;
    private String paymentTerms;
    private String notes;
    private List<BillingLineItemDto> lineItems;
}