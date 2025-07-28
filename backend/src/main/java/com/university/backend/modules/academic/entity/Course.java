package com.university.backend.modules.academic.entity;

import com.university.backend.modules.core.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String instructor;

    @Column(name = "instructor_email")
    private String instructorEmail;

    @Column(name = "department")
    private String department;

    @Column(name = "course_level")
    private String courseLevel; // Undergraduate, Graduate, PhD

    @Column(nullable = false)
    private String schedule;

    @Column(name = "classroom")
    private String classroom;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "days_of_week")
    private String daysOfWeek; // MON,WED,FRI

    @Column(nullable = false)
    private Integer credits;

    @Column(name = "max_students")
    private Integer maxStudents;

    @Column(name = "min_students")
    @Builder.Default
    private Integer minStudents = 1;

    @Column(name = "course_fee", precision = 10, scale = 2)
    private BigDecimal courseFee;

    @Column(name = "prerequisites")
    private String prerequisites; // Comma-separated course codes

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private CourseStatus status = CourseStatus.DRAFT;

    @Column(name = "syllabus_url")
    private String syllabusUrl;

    @Column(name = "textbook")
    private String textbook;

    @Column(name = "passing_grade")
    @Builder.Default
    private String passingGrade = "D";

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<Registration> registrations = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<CoursePrerequisite> coursePrerequisites = new ArrayList<>();

    @OneToMany(mappedBy = "prerequisiteCourse", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<CoursePrerequisite> prerequisiteFor = new ArrayList<>();
}