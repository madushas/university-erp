package com.university.backend.modules.core.dto;

import com.university.backend.modules.core.entity.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UserDto extends BaseDto {
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private UserType userType;
    private EmployeeType employeeType;
    private AcademicLevel academicLevel;
    private UserStatus status;
    
    // Identification
    private String employeeId;
    private String studentId;
    
    // Contact Information
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    
    // Academic/Work Information
    private String department;
    private Integer yearOfStudy;
    private Double gpa;
    
    // Academic Dates
    private LocalDate enrollmentDate;
    private LocalDate graduationDate;
    private LocalDate admissionDate;
    private LocalDate expectedGraduationDate;
    
    // Emergency Contact
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;
    
    // Profile Settings
    private String profilePictureUrl;
    private String preferredLanguage;
    private String timezone;
    private LocalDateTime lastLoginAt;
    private LocalDateTime passwordChangedAt;
    private LocalDateTime accountLockedUntil;
    private Integer failedLoginAttempts;
}