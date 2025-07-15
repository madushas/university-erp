package com.university.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {
    private Long id;
    private String code;
    private String title;
    private String description;
    private String instructor;
    private String schedule;
    private Integer credits;
    private Integer maxStudents;
    private Integer enrolledStudents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
