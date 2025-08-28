package com.university.backend.modules.student.dto;

import com.university.backend.modules.student.entity.ApplicationDocument.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationDocumentDto {
    
    private Long id;
    private Long applicationId;
    private String applicationNumber;
    
    // Document Information
    private String documentType;
    private String documentName;
    private String fileName;
    private String filePath;
    private String mimeType;
    private Long fileSize;
    
    // Document Status
    private VerificationStatus verificationStatus;
    private Boolean isRequired;
    private String description;
    private String notes;
    
    // Verification Information
    private Boolean isVerified;
    private LocalDateTime verifiedDate;
    private String verifiedByName;
    private String verificationNotes;
    
    // System Fields
    private LocalDateTime uploadedDate;
    private String uploadedByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
