package com.university.backend.modules.financial.dto;

import com.university.backend.modules.core.dto.BaseDto;
import com.university.backend.modules.core.dto.UserDto;
import com.university.backend.modules.financial.entity.AccountStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class StudentAccountDto extends BaseDto {
    private UserDto student;
    private String accountNumber;
    private BigDecimal currentBalance;
    private BigDecimal creditLimit;
    private AccountStatus status;
    private BigDecimal totalCharges; // Calculated field
    private BigDecimal totalPayments; // Calculated field
    private BigDecimal outstandingBalance; // Calculated field
}