package com.university.backend.modules.student.entity;

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
@Table(name = "transcripts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Transcript {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "transcript_type", nullable = false)
    @Builder.Default
    private TranscriptType transcriptType = TranscriptType.OFFICIAL;
    
    // Transcript Details
    @Column(name = "transcript_number", unique = true, nullable = false, length = 50)
    private String transcriptNumber;
    
    @Column(name = "issue_date", nullable = false)
    @Builder.Default
    private LocalDate issueDate = LocalDate.now();
    
    @Column(name = "effective_date", nullable = false)
    @Builder.Default
    private LocalDate effectiveDate = LocalDate.now();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_start")
    private AcademicYear academicYearStart;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_end")
    private AcademicYear academicYearEnd;
    
    // Student Information (at time of transcript)
    @Column(name = "student_name", nullable = false)
    private String studentName;
    
    @Column(name = "student_number", nullable = false, length = 50)
    private String studentNumber;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "program_of_study")
    private String programOfStudy;
    
    @Column(name = "degree_conferred")
    private String degreeConferred;
    
    @Column(name = "graduation_date")
    private LocalDate graduationDate;
    
    // Academic Summary
    @Column(name = "total_credits_attempted")
    @Builder.Default
    private Integer totalCreditsAttempted = 0;
    
    @Column(name = "total_credits_earned")
    @Builder.Default
    private Integer totalCreditsEarned = 0;
    
    @Column(name = "cumulative_gpa", precision = 4, scale = 3)
    private BigDecimal cumulativeGpa;
    
    @Column(name = "class_rank")
    private Integer classRank;
    
    @Column(name = "class_size")
    private Integer classSize;
    
    @Column(name = "academic_honors", columnDefinition = "TEXT")
    private String academicHonors;
    
    // Transcript Status
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private TranscriptStatus status = TranscriptStatus.DRAFT;
    
    @Column(name = "released_date")
    private LocalDateTime releasedDate;
    
    @Column(name = "released_to")
    private String releasedTo;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "release_method")
    private ReleaseMethod releaseMethod;
    
    // Security and Verification
    @Column(name = "security_code", length = 100)
    private String securityCode;
    
    @Column(name = "digital_signature", columnDefinition = "TEXT")
    private String digitalSignature;
    
    @Column(name = "verification_url", length = 500)
    private String verificationUrl;
    
    @Column(name = "holds_preventing_release", columnDefinition = "TEXT")
    private String holdsPreventingRelease;
    
    // Administrative
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_by")
    private User generatedBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "transcript", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<TranscriptCourse> courses = new ArrayList<>();
    
    // Enums
    public enum TranscriptType {
        OFFICIAL, UNOFFICIAL, ENROLLMENT_VERIFICATION, DEGREE_VERIFICATION
    }
    
    public enum TranscriptStatus {
        DRAFT, PENDING_APPROVAL, APPROVED, RELEASED, CANCELLED
    }
    
    public enum ReleaseMethod {
        EMAIL, MAIL, PICKUP, ELECTRONIC, THIRD_PARTY
    }
}
