package com.university.backend.modules.student.entity;

import com.university.backend.modules.academic.entity.AcademicSemester;
import com.university.backend.modules.academic.entity.Course;
import com.university.backend.modules.academic.entity.Registration;
import com.university.backend.modules.core.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "grade_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class GradeHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id", nullable = false)
    private Registration registration;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_semester_id")
    private AcademicSemester academicSemester;
    
    // Grade Information
    @Column(name = "original_grade", length = 5)
    private String originalGrade;
    
    @Column(name = "new_grade", length = 5)
    private String newGrade;
    
    @Column(name = "grade_change_reason")
    private String gradeChangeReason;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "grade_change_type", length = 50)
    private GradeChangeType gradeChangeType;
    
    // Credit and Quality Points
    @Column(name = "credit_hours", precision = 3, scale = 1)
    private BigDecimal creditHours;
    
    @Column(name = "quality_points", precision = 6, scale = 3)
    private BigDecimal qualityPoints;
    
    @Column(name = "grade_point_value", precision = 3, scale = 2)
    private BigDecimal gradePointValue;
    
    // Administrative
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;
    
    @CreatedDate
    @Column(name = "change_date", updatable = false)
    private LocalDateTime changeDate;
    
    @Column(name = "approval_date")
    private LocalDateTime approvalDate;
    
    @Column(name = "change_notes", columnDefinition = "TEXT")
    private String changeNotes;
    
    public enum GradeChangeType {
        CORRECTION, INCOMPLETE_RESOLUTION, APPEAL, ADMINISTRATIVE
    }
}
