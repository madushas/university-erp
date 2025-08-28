package com.university.backend.modules.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationReviewDto {
    
    private Long id;
    private Long applicationId;
    private String applicationNumber;
    
    // Review Information
    private String reviewType;
    private String reviewerName;
    private String reviewerRole;
    private LocalDateTime reviewDate;
    
    // Review Content
    private String comments;
    private String recommendation;
    private Integer rating;
    private String strengths;
    private String weaknesses;
    private String additionalNotes;
    
    // Review Status
    private String status;
    private Boolean isConfidential;
    private Boolean isFinalReview;
    
    // System Fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
