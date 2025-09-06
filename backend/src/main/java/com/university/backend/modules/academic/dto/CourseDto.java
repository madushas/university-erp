package com.university.backend.modules.academic.dto;

import com.university.backend.modules.core.dto.BaseDto;
import com.university.backend.modules.academic.entity.CourseStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CourseDto extends BaseDto {
    private String code;
    private String title;
    private String description;
    private Long instructorId;
    private String instructorName;
    private String instructorEmail;
    private String department;
    private String courseLevel;
    private String schedule;
    private String classroom;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String daysOfWeek;
    private Integer credits;
    private Integer maxStudents;
    private Integer minStudents;
    private BigDecimal courseFee;
    private String prerequisites;
    private CourseStatus status;
    private String syllabusUrl;
    private String textbook;
    private String passingGrade;
    private Integer enrolledStudents; // Calculated field
}