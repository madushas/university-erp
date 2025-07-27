package com.university.backend.dto;

import com.university.backend.entity.EmploymentStatus;
import com.university.backend.entity.EmploymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateEmployeeRequest {
    
    @NotNull
    private Long userId;
    
    @NotNull
    @Size(max = 50)
    private String employeeNumber;
    
    @NotNull
    private LocalDate hireDate;
    
    @NotNull
    private EmploymentType employmentType;
    
    @Builder.Default
    private EmploymentStatus employmentStatus = EmploymentStatus.ACTIVE;
    
    @NotNull
    @Size(max = 255)
    private String jobTitle;
    
    @Size(max = 255)
    private String department;
    
    private Long supervisorId;
    
    private BigDecimal salary;
    
    private BigDecimal hourlyRate;
    
    @Builder.Default
    private Boolean benefitsEligible = true;
    
    @Builder.Default
    private Boolean tenureTrack = false;
    
    private LocalDate tenureDate;
    
    private LocalDate contractStartDate;
    
    private LocalDate contractEndDate;
    
    @Size(max = 255)
    private String officeLocation;
    
    @Size(max = 50)
    private String officePhone;
}