package com.university.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Registration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @CreatedDate
    @Column(name = "registration_date", nullable = false)
    private LocalDateTime registrationDate;

    @Column(name = "grade")
    private String grade;

    @Column(name = "grade_points")
    private Double gradePoints;

    @Column(name = "attendance_percentage")
    private Double attendancePercentage;

    @Column(name = "midterm_grade")
    private String midtermGrade;

    @Column(name = "final_grade")
    private String finalGrade;

    @Column(name = "assignment_grades")
    private String assignmentGrades; // JSON string for multiple assignments

    @Column(name = "exam_grades")
    private String examGrades; // JSON string for multiple exams

    @Column(name = "course_fee_paid", precision = 10, scale = 2)
    private BigDecimal courseFeePaid;

    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "transcript_released")
    @Builder.Default
    private Boolean transcriptReleased = false;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RegistrationStatus status = RegistrationStatus.ENROLLED;

    @Column(name = "completion_date")
    private LocalDateTime completionDate;

    @Column(name = "certificate_issued")
    @Builder.Default
    private Boolean certificateIssued = false;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Unique constraint to prevent duplicate registrations
    @Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "course_id"})
    })
    public static class RegistrationConstraints {}
}
