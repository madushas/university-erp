package com.university.backend.modules.student.entity;

import com.university.backend.modules.core.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "application_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class ApplicationDocument {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;
    
    @Column(name = "document_type", nullable = false, length = 100)
    private String documentType;
    
    @Column(name = "document_name", nullable = false)
    private String documentName;
    
    @Column(name = "file_path", length = 500)
    private String filePath;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "mime_type", length = 100)
    private String mimeType;
    
    @CreatedDate
    @Column(name = "uploaded_date", updatable = false)
    private LocalDateTime uploadedDate;
    
    @Column(name = "verified_date")
    private LocalDateTime verifiedDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status")
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;
    
    @Column(name = "verification_notes")
    private String verificationNotes;
    
    @Column(name = "is_required")
    @Builder.Default
    private Boolean isRequired = true;
    
    public enum VerificationStatus {
        PENDING, VERIFIED, REJECTED, MISSING
    }
}
