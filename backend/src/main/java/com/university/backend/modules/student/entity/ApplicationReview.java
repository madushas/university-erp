package com.university.backend.modules.student.entity;

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
@Table(name = "application_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class ApplicationReview {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;
    
    @Column(name = "review_type", nullable = false, length = 50)
    @Builder.Default
    private String reviewType = "GENERAL";
    
    @CreatedDate
    @Column(name = "review_date", updatable = false)
    private LocalDateTime reviewDate;
    
    @Column(name = "rating", precision = 3, scale = 2)
    private BigDecimal rating;
    
    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "recommendation", length = 50)
    private Recommendation recommendation;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "department_approval", length = 50)
    private DepartmentApproval departmentApproval;
    
    @Column(name = "is_final_review")
    @Builder.Default
    private Boolean isFinalReview = false;
    
    public enum Recommendation {
        ACCEPT, REJECT, WAITLIST, CONDITIONAL_ACCEPT, DEFER
    }
    
    public enum DepartmentApproval {
        APPROVED, REJECTED, PENDING
    }
}
