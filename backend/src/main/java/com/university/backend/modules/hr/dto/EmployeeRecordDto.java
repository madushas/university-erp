package com.university.backend.modules.hr.dto;

import com.university.backend.modules.core.dto.BaseDto;
import com.university.backend.modules.core.dto.UserDto;
import com.university.backend.modules.hr.entity.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class EmployeeRecordDto extends BaseDto {
    private UserDto user;
    private String employeeNumber;
    private LocalDate hireDate;
    private EmploymentType employmentType;
    private EmploymentStatus employmentStatus;
    private String jobTitle;
    private String department;
    private BigDecimal salary;
    private Boolean benefitsEligible;
    private Boolean tenureTrack;
    private LocalDate contractStartDate;
    private LocalDate contractEndDate;
    private String officeLocation;
    private String officePhone;
    private String supervisorName; // Calculated field
    private String organizationalUnitName; // Calculated field
}