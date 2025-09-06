package com.university.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.university.backend.modules.academic.entity.CourseStatus;
import com.university.backend.validation.SafeInput;
import com.university.backend.validation.ValidCourseDate;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CourseRequest {
    @NotBlank(message = "Course code is required")
    @Size(min = 2, max = 20, message = "Course code must be between 2 and 20 characters")
    @SafeInput(message = "Course code contains unsafe content")
    private String code;
    
    @NotBlank(message = "Course title is required")
    @Size(max = 255, message = "Course title cannot exceed 255 characters")
    @SafeInput(message = "Course title contains unsafe content")
    private String title;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    @SafeInput(message = "Description contains unsafe content")
    private String description;
    
    @NotNull(message = "Instructor ID is required")
    private Long instructorId;
    
    private String instructorEmail;
    
    private String department;
    
    private String courseLevel;
    
    @NotBlank(message = "Schedule is required")
    private String schedule;
    
    private String classroom;
    
    @ValidCourseDate(message = "Start date must be within reasonable academic range")
    private LocalDate startDate;
    
    @ValidCourseDate(message = "End date must be within reasonable academic range")
    private LocalDate endDate;
    
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;
    
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;
    
    private String daysOfWeek;
    
    @NotNull(message = "Credits is required")
    @Min(value = 1, message = "Credits must be at least 1")
    @Max(value = 10, message = "Credits cannot exceed 10")
    private Integer credits;
    
    @Min(value = 1, message = "Maximum students must be at least 1")
    @Max(value = 1000, message = "Maximum students cannot exceed 1000")
    private Integer maxStudents = 50;
    
    @Min(value = 1, message = "Minimum students must be at least 1")
    @Max(value = 100, message = "Minimum students cannot exceed 100")
    private Integer minStudents = 1;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private BigDecimal courseFee;
    
    private String prerequisites;
    
    private CourseStatus status;
    
    private String syllabusUrl;
    
    private String textbook;
    
    private String passingGrade;
    
    // Manual getter methods for compatibility
    public Integer getCredits() {
        return this.credits;
    }
    
    public LocalDate getStartDate() {
        return this.startDate;
    }
    
    public LocalDate getEndDate() {
        return this.endDate;
    }
}
