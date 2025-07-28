package com.university.backend.modules.academic.dto;

import com.university.backend.modules.core.dto.BaseDto;
import com.university.backend.modules.core.dto.UserDto;
import com.university.backend.modules.academic.entity.RegistrationStatus;
import com.university.backend.modules.academic.entity.PaymentStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RegistrationDto extends BaseDto {
    private UserDto user;
    private CourseDto course;
    private LocalDateTime registrationDate;
    private String grade;
    private Double gradePoints;
    private RegistrationStatus status;
    private Double attendancePercentage;
    private String midtermGrade;
    private String finalGrade;
    private BigDecimal courseFeePaid;
    private PaymentStatus paymentStatus;
    private LocalDateTime paymentDate;
    private String paymentMethod;
    private Boolean transcriptReleased;
    private LocalDateTime completionDate;
    private Boolean certificateIssued;
    private String notes;
}