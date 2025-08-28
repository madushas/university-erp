package com.university.backend.modules.student.entity;

import com.university.backend.modules.academic.entity.Registration;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "transcript_courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TranscriptCourse {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transcript_id", nullable = false)
    private Transcript transcript;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id")
    private Registration registration;
    
    // Course Information
    @Column(name = "course_code", nullable = false, length = 20)
    private String courseCode;
    
    @Column(name = "course_title", nullable = false)
    private String courseTitle;
    
    @Column(name = "credit_hours", nullable = false, precision = 3, scale = 1)
    private BigDecimal creditHours;
    
    @Column(name = "grade", length = 5)
    private String grade;
    
    @Column(name = "quality_points", precision = 6, scale = 3)
    private BigDecimal qualityPoints;
    
    // Academic Period
    @Column(name = "academic_year", nullable = false, length = 20)
    private String academicYear;
    
    @Column(name = "semester", nullable = false, length = 50)
    private String semester;
    
    // Course Details
    @Column(name = "instructor_name")
    private String instructorName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "course_level")
    private CourseLevel courseLevel;
    
    @Column(name = "transfer_credit")
    @Builder.Default
    private Boolean transferCredit = false;
    
    @Column(name = "transfer_institution")
    private String transferInstitution;
    
    // Display Order
    @Column(name = "semester_order")
    private Integer semesterOrder;
    
    @Column(name = "course_order")
    private Integer courseOrder;
    
    public enum CourseLevel {
        UNDERGRADUATE, GRADUATE, DOCTORAL
    }
}
