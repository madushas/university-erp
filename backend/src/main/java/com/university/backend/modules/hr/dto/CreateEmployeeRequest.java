package com.university.backend.modules.hr.dto;

import com.university.backend.modules.core.entity.Role;
import com.university.backend.modules.hr.entity.EmploymentStatus;
import com.university.backend.modules.hr.entity.EmploymentType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateEmployeeRequest {
    
    @NotBlank(message = "Username is required")
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotNull(message = "Role is required")
    private Role role;
    
    private String phoneNumber;
    
    private LocalDate dateOfBirth;
    
    private String address;
    
    private String city;
    
    private String state;
    
    private String postalCode;
    
    private String country;
    
    // Employee specific fields
    @NotBlank(message = "Employee number is required")
    private String employeeNumber;
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    private Long supervisorId;
    
    @NotBlank(message = "Department is required")
    private String department;
    
    @NotBlank(message = "Job title is required")
    private String jobTitle;
    
    @NotNull(message = "Employment type is required")
    private EmploymentType employmentType;
    
    @NotNull(message = "Employment status is required")
    private EmploymentStatus employmentStatus;
    
    @NotNull(message = "Hire date is required")
    private LocalDate hireDate;
    
    private BigDecimal salary;
    
    private BigDecimal hourlyRate;
    
    private Boolean benefitsEligible;
    
    private Boolean tenureTrack;
    
    private LocalDate tenureDate;
    
    private LocalDate contractStartDate;
    
    private LocalDate contractEndDate;
    
    private String officeLocation;
    
    private String officePhone;
    
    private String emergencyContactName;
    
    private String emergencyContactPhone;
    
    private String emergencyContactRelationship;
}