package com.university.backend.dto.request;

import com.university.backend.modules.core.entity.*;
import com.university.backend.validation.SafeInput;
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
public class CreateUserRequest {
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name cannot exceed 50 characters")
    @SafeInput(allowEmojis = false, message = "First name contains unsafe content")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name cannot exceed 50 characters")
    @SafeInput(allowEmojis = false, message = "Last name contains unsafe content")
    private String lastName;
    
    @NotNull(message = "Role is required")
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
