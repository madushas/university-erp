package com.university.backend.modules.student.entity;

import com.university.backend.modules.academic.entity.AcademicProgram;
import com.university.backend.modules.academic.entity.AcademicSemester;
import com.university.backend.modules.academic.entity.AcademicYear;
import com.university.backend.modules.core.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Application {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "application_number", unique = true, nullable = false, length = 50)
    private String applicationNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false)
    private User applicant;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_program_id", nullable = false)
    private AcademicProgram academicProgram;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_semester_id", nullable = false)
    private AcademicSemester academicSemester;
    
    // Application Details
    @Enumerated(EnumType.STRING)
    @Column(name = "application_type", nullable = false)
    @Builder.Default
    private ApplicationType applicationType = ApplicationType.UNDERGRADUATE;
    
    @Column(name = "application_date", nullable = false)
    @Builder.Default
    private LocalDate applicationDate = LocalDate.now();
    
    @Column(name = "application_deadline", nullable = false)
    private LocalDate applicationDeadline;
    
    @Column(name = "expected_entry_date")
    private LocalDate expectedEntryDate;
    
    // Application Status
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.DRAFT;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "review_status")
    @Builder.Default
    private ReviewStatus reviewStatus = ReviewStatus.PENDING;
    
    @Column(name = "decision_date")
    private LocalDate decisionDate;
    
    @Column(name = "decision_reason")
    private String decisionReason;
    
    // Contact Information
    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_contact_method")
    @Builder.Default
    private ContactMethod preferredContactMethod = ContactMethod.EMAIL;
    
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;
    
    @Column(name = "alternate_email")
    private String alternateEmail;
    
    // Academic Background
    @Column(name = "previous_institution")
    private String previousInstitution;
    
    @Column(name = "previous_gpa", precision = 3, scale = 2)
    private BigDecimal previousGpa;
    
    @Column(name = "graduation_date")
    private LocalDate graduationDate;
    
    @Column(name = "degree_obtained", length = 100)
    private String degreeObtained;
    
    @Column(name = "major_field", length = 100)
    private String majorField;
    
    // Application Essays and Documents
    @Column(name = "personal_statement", columnDefinition = "TEXT")
    private String personalStatement;
    
    @Column(name = "statement_of_purpose", columnDefinition = "TEXT")
    private String statementOfPurpose;
    
    @Column(name = "research_interests", columnDefinition = "TEXT")
    private String researchInterests;
    
    @Column(name = "career_goals", columnDefinition = "TEXT")
    private String careerGoals;
    
    // Financial Information
    @Column(name = "financial_aid_requested")
    @Builder.Default
    private Boolean financialAidRequested = false;
    
    @Column(name = "estimated_family_contribution", precision = 10, scale = 2)
    private BigDecimal estimatedFamilyContribution;
    
    @Column(name = "scholarship_requested")
    @Builder.Default
    private Boolean scholarshipRequested = false;
    
    // Application Fees
    @Column(name = "application_fee_amount", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal applicationFeeAmount = new BigDecimal("50.00");
    
    @Column(name = "application_fee_paid")
    @Builder.Default
    private Boolean applicationFeePaid = false;
    
    @Column(name = "application_fee_payment_date")
    private LocalDateTime applicationFeePaymentDate;
    
    @Column(name = "application_fee_waived")
    @Builder.Default
    private Boolean applicationFeeWaived = false;
    
    @Column(name = "application_fee_waiver_reason")
    private String applicationFeeWaiverReason;
    
    // System Fields
    @Column(name = "submitted_date")
    private LocalDateTime submittedDate;
    
    @Column(name = "last_reviewed_date")
    private LocalDateTime lastReviewedDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ApplicationDocument> documents = new ArrayList<>();
    
    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ApplicationReview> reviews = new ArrayList<>();
    
    // Enums
    public enum ApplicationType {
        UNDERGRADUATE, GRADUATE, TRANSFER, VISITING, INTERNATIONAL, READMISSION
    }
    
    public enum ApplicationStatus {
        DRAFT, SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED, WAITLISTED, WITHDRAWN, EXPIRED
    }
    
    public enum ReviewStatus {
        PENDING, IN_PROGRESS, COMPLETED, DEFERRED
    }
    
    public enum ContactMethod {
        EMAIL, PHONE, MAIL, TEXT
    }
}
