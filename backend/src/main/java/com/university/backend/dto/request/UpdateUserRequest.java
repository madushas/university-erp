package com.university.backend.dto.request;

import com.university.backend.modules.core.entity.*;
import com.university.backend.modules.academic.entity.Department;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;
    
    @Email(message = "Please provide a valid email address")
    private String email;
    
    @Size(max = 50, message = "First name cannot exceed 50 characters")
    private String firstName;
    
    @Size(max = 50, message = "Last name cannot exceed 50 characters")
    private String lastName;
    
    private Role role;
    
    // User type and employment fields
    private UserType userType;
    private EmployeeType employeeType;
    private AcademicLevel academicLevel;
    private UserStatus status;
    
    // Identification fields
    private String employeeId;
    private String studentId;
    
    // Contact information
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    
    // Academic/Work information
    private String department;
    private Integer yearOfStudy;
    private Double gpa;
    
    // Academic dates
    private LocalDate enrollmentDate;
    private LocalDate graduationDate;
    private LocalDate admissionDate;
    private LocalDate expectedGraduationDate;
    
    // Emergency contact
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;
    
    // Profile settings
    private String profilePictureUrl;
    private String preferredLanguage;
    private String timezone;
}
