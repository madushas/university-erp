package com.university.backend.modules.core.entity;

import com.university.backend.modules.academic.entity.Registration;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @Column(nullable = false)
    @Email(message = "Email should be valid")
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "employee_id", unique = true)
    private String employeeId;

    @Column(name = "student_id", unique = true)
    private String studentId;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "date_of_birth")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @Column(name = "address")
    private String address;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "country")
    private String country;

    @Column(name = "department")
    private String department;

    @Column(name = "year_of_study")
    private Integer yearOfStudy;

    @Column(name = "gpa")
    private Double gpa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false)
    @Builder.Default
    private UserType userType = UserType.STUDENT;

    @Enumerated(EnumType.STRING)
    @Column(name = "employee_type")
    private EmployeeType employeeType;

    @Enumerated(EnumType.STRING)
    @Column(name = "academic_level")
    private AcademicLevel academicLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "enrollment_date")
    @PastOrPresent(message = "Enrollment date cannot be in the future")
    private LocalDate enrollmentDate;

    @Column(name = "graduation_date")
    private LocalDate graduationDate;

    @Column(name = "admission_date")
    private LocalDate admissionDate;

    @Column(name = "expected_graduation_date")
    private LocalDate expectedGraduationDate;

    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

    @Column(name = "emergency_contact_relationship")
    private String emergencyContactRelationship;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "preferred_language")
    @Builder.Default
    private String preferredLanguage = "en";

    @Column(name = "timezone")
    @Builder.Default
    private String timezone = "UTC";

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "password_changed_at")
    @Builder.Default
    private LocalDateTime passwordChangedAt = LocalDateTime.now();

    @Column(name = "account_locked_until")
    private LocalDateTime accountLockedUntil;

    @Column(name = "failed_login_attempts")
    @Builder.Default
    private Integer failedLoginAttempts = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<Registration> registrations = new ArrayList<>();

    /**
     * Validate business rules for user entity
     */
    @PrePersist
    @PreUpdate
    private void validateBusinessRules() {
        // Validate graduation date is after enrollment date
        if (enrollmentDate != null && graduationDate != null) {
            if (graduationDate.isBefore(enrollmentDate)) {
                throw new IllegalArgumentException("Graduation date cannot be before enrollment date");
            }
        }

        // Validate expected graduation date is after enrollment date
        if (enrollmentDate != null && expectedGraduationDate != null) {
            if (expectedGraduationDate.isBefore(enrollmentDate)) {
                throw new IllegalArgumentException("Expected graduation date cannot be before enrollment date");
            }
        }

        // Validate admission date is before or equal to enrollment date
        if (admissionDate != null && enrollmentDate != null) {
            if (admissionDate.isAfter(enrollmentDate)) {
                throw new IllegalArgumentException("Admission date cannot be after enrollment date");
            }
        }

        // Validate student-specific fields
        if (role == Role.STUDENT) {
            if (studentId == null || studentId.trim().isEmpty()) {
                throw new IllegalArgumentException("Student ID is required for students");
            }
        }

        // Validate employee-specific fields
        if (role == Role.INSTRUCTOR || role == Role.ADMIN) {
            if (employeeId == null || employeeId.trim().isEmpty()) {
                throw new IllegalArgumentException("Employee ID is required for instructors and admins");
            }
        }
    }
}