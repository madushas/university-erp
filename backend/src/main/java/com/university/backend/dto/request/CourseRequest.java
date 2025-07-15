package com.university.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CourseRequest {
    @NotBlank(message = "Course code is required")
    private String code;
    
    @NotBlank(message = "Course title is required")
    private String title;
    
    private String description;
    
    @NotBlank(message = "Instructor name is required")
    private String instructor;
    
    @NotBlank(message = "Schedule is required")
    private String schedule;
    
    @NotNull(message = "Credits is required")
    @Min(value = 1, message = "Credits must be at least 1")
    private Integer credits;
    
    @Min(value = 1, message = "Maximum students must be at least 1")
    private Integer maxStudents = 50;
}
