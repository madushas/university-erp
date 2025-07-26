package com.university.backend.dto.response;

import com.university.backend.entity.Role;
import com.university.backend.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private String employeeId;
    private String studentId;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String department;
    private Integer yearOfStudy;
    private Double gpa;
    private UserStatus status;
    private LocalDate enrollmentDate;
    private LocalDate graduationDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
