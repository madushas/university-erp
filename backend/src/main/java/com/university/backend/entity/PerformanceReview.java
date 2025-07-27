package com.university.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "performance_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class PerformanceReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @NotNull
    private EmployeeRecord employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    @NotNull
    private User reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_cycle_id")
    private PerformanceReviewCycle reviewCycle;

    @Column(name = "review_period_start", nullable = false)
    @NotNull
    private LocalDate reviewPeriodStart;

    @Column(name = "review_period_end", nullable = false)
    @NotNull
    private LocalDate reviewPeriodEnd;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_type", nullable = false)
    @NotNull
    private ReviewType reviewType;

    @Enumerated(EnumType.STRING)
    @Column(name = "overall_rating")
    private PerformanceRating overallRating;

    @Enumerated(EnumType.STRING)
    @Column(name = "goals_achievement_rating")
    private PerformanceRating goalsAchievementRating;

    @Enumerated(EnumType.STRING)
    @Column(name = "professional_development_rating")
    private PerformanceRating professionalDevelopmentRating;

    @Enumerated(EnumType.STRING)
    @Column(name = "leadership_rating")
    private PerformanceRating leadershipRating;

    @Enumerated(EnumType.STRING)
    @Column(name = "communication_rating")
    private PerformanceRating communicationRating;

    @Enumerated(EnumType.STRING)
    @Column(name = "technical_skills_rating")
    private PerformanceRating technicalSkillsRating;

    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "areas_for_improvement", columnDefinition = "TEXT")
    private String areasForImprovement;

    @Column(name = "goals_for_next_period", columnDefinition = "TEXT")
    private String goalsForNextPeriod;

    @Column(name = "manager_comments", columnDefinition = "TEXT")
    private String managerComments;

    @Column(name = "employee_comments", columnDefinition = "TEXT")
    private String employeeComments;

    @Column(name = "hr_comments", columnDefinition = "TEXT")
    private String hrComments;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ReviewStatus status = ReviewStatus.DRAFT;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "submitted_date")
    private LocalDate submittedDate;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "performanceReview", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PerformanceGoal> goals = new ArrayList<>();
}