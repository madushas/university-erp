package com.university.backend.modules.hr.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "performance_review_cycles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class PerformanceReviewCycle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cycle_name", nullable = false)
    @Size(max = 255)
    @NotNull
    private String cycleName;

    @Column(name = "cycle_year", nullable = false)
    @NotNull
    private Integer cycleYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_type", nullable = false)
    @NotNull
    private ReviewType reviewType;

    @Column(name = "start_date", nullable = false)
    @NotNull
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    @NotNull
    private LocalDate endDate;

    @Column(name = "self_assessment_deadline")
    private LocalDate selfAssessmentDeadline;

    @Column(name = "manager_review_deadline")
    private LocalDate managerReviewDeadline;

    @Column(name = "final_review_deadline")
    private LocalDate finalReviewDeadline;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ReviewCycleStatus status = ReviewCycleStatus.PLANNED;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Relationships
    @OneToMany(mappedBy = "reviewCycle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PerformanceReview> performanceReviews = new ArrayList<>();
}