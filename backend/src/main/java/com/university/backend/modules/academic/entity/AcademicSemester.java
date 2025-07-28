package com.university.backend.modules.academic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "academic_semesters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class AcademicSemester {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id")
    private AcademicYear academicYear;

    @Column(nullable = false)
    private String code; // e.g., "FALL2024", "SPRING2025"

    @Column(nullable = false)
    private String name; // e.g., "Fall 2024", "Spring 2025"

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "registration_start_date")
    private LocalDate registrationStartDate;

    @Column(name = "registration_end_date")
    private LocalDate registrationEndDate;

    @Column(name = "add_drop_deadline")
    private LocalDate addDropDeadline;

    @Column(name = "withdrawal_deadline")
    private LocalDate withdrawalDeadline;

    @Column(name = "final_exam_start_date")
    private LocalDate finalExamStartDate;

    @Column(name = "final_exam_end_date")
    private LocalDate finalExamEndDate;

    @Column(name = "grade_submission_deadline")
    private LocalDate gradeSubmissionDeadline;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private SemesterStatus status = SemesterStatus.PLANNING;

    @Column(name = "is_current")
    @Builder.Default
    private Boolean isCurrent = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @org.springframework.data.annotation.LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
