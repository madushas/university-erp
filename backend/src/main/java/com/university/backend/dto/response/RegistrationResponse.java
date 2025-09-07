package com.university.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResponse {
    private Long id;
    private UserResponse user;
    private CourseResponse course;
    private LocalDateTime registrationDate;
    private String grade;
    private String status;
    private String paymentStatus;
    private BigDecimal courseFeePaid;
}
