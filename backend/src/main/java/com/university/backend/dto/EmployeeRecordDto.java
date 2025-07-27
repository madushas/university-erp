package com.university.backend.dto;

import com.university.backend.entity.EmploymentStatus;
import com.university.backend.entity.EmploymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeRecordDto {
    private Long id;
    private Long userId;
    private String employeeNumber;
    private LocalDate hireDate;
    private EmploymentType employmentType;
    private EmploymentStatus employmentStatus;
    private String jobTitle;
    private String department;
    private Long supervisorId;
    private String supervisorName;
    private BigDecimal salary;
    private BigDecimal hourlyRate;
    private Boolean benefitsEligible;
    private Boolean tenureTrack;
    private LocalDate tenureDate;
    private LocalDate contractStartDate;
    private LocalDate contractEndDate;
    private String officeLocation;
    private String officePhone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // User information
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
}