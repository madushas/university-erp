package com.university.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateStudentAccountRequest {
    private Long studentId;
    private String accountNumber;
    private BigDecimal creditLimit;
    private String accountStatus;
}