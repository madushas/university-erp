package com.university.backend.modules.student.controller;

import com.university.backend.modules.student.dto.TranscriptDto;
import com.university.backend.modules.student.dto.TranscriptRequestDto;
import com.university.backend.modules.student.service.TranscriptService;
import com.university.backend.modules.core.entity.User;
import com.university.backend.security.SecurityContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/student/transcripts")
@RequiredArgsConstructor
@Slf4j
public class TranscriptController {
    
    private final TranscriptService transcriptService;
    private final SecurityContextService securityContextService;
    
    /**
     * Generate transcript for student
     */
    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF', 'REGISTRAR')")
    public ResponseEntity<TranscriptDto> generateTranscript(
            @RequestParam Long studentId,
            @RequestParam String transcriptType) {
        log.info("Generating transcript for student: {} of type: {}", studentId, transcriptType);
        
        // Validate access - students can only generate their own transcripts
        securityContextService.validateStudentResourceAccess(studentId);
        
        TranscriptDto transcript = transcriptService.generateTranscript(studentId, transcriptType);
        return new ResponseEntity<>(transcript, HttpStatus.CREATED);
    }
    
    /**
     * Get transcript by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF', 'REGISTRAR')")
    public ResponseEntity<TranscriptDto> getTranscript(@PathVariable Long id) {
        log.info("Retrieving transcript with ID: {}", id);
        
        return transcriptService.findById(id)
                .map(transcript -> {
                    // Validate access - students can only view their own transcripts
                    securityContextService.validateStudentResourceAccess(transcript.getStudentId());
                    return ResponseEntity.ok().body(transcript);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get transcripts by student ID
     */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF', 'REGISTRAR')")
    public ResponseEntity<List<TranscriptDto>> getTranscriptsByStudent(@PathVariable Long studentId) {
        log.info("Retrieving transcripts for student: {}", studentId);
        
        // Validate access - students can only view their own transcripts
        securityContextService.validateStudentResourceAccess(studentId);
        
        List<TranscriptDto> transcripts = transcriptService.findByStudentId(studentId);
        return ResponseEntity.ok(transcripts);
    }
    
    /**
     * Request transcript
     */
    @PostMapping("/request")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF')")
    public ResponseEntity<TranscriptRequestDto> requestTranscript(@Valid @RequestBody TranscriptRequestDto requestDto) {
        User currentUser = securityContextService.getCurrentUserOrThrow();
        log.info("Processing transcript request for student: {} by user: {}", requestDto.getStudentId(), currentUser.getUsername());
        
        // Validate access - students can only request their own transcripts
        securityContextService.validateStudentResourceAccess(requestDto.getStudentId());
        
        // Note: The requesting user context should be handled in the service layer
        TranscriptRequestDto savedRequest = transcriptService.createTranscriptRequest(requestDto);
        return new ResponseEntity<>(savedRequest, HttpStatus.CREATED);
    }
    
    /**
     * Get transcript request by ID
     */
    @GetMapping("/requests/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF', 'REGISTRAR')")
    public ResponseEntity<TranscriptRequestDto> getTranscriptRequest(@PathVariable Long id) {
        log.info("Retrieving transcript request with ID: {}", id);
        
        return transcriptService.findRequestById(id)
                .map(request -> {
                    // Validate access - students can only view their own transcript requests
                    securityContextService.validateStudentResourceAccess(request.getStudentId());
                    return ResponseEntity.ok().body(request);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get transcript requests by student
     */
    @GetMapping("/requests/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF', 'REGISTRAR')")
    public ResponseEntity<List<TranscriptRequestDto>> getTranscriptRequestsByStudent(@PathVariable Long studentId) {
        log.info("Retrieving transcript requests for student: {}", studentId);
        
        // Validate access - students can only view their own transcript requests
        securityContextService.validateStudentResourceAccess(studentId);
        
        List<TranscriptRequestDto> requests = transcriptService.findRequestsByStudentId(studentId);
        return ResponseEntity.ok(requests);
    }
    
    /**
     * Get pending transcript requests
     */
    @GetMapping("/requests/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF', 'REGISTRAR')")
    public ResponseEntity<Page<TranscriptRequestDto>> getPendingTranscriptRequests(Pageable pageable) {
        log.info("Retrieving pending transcript requests");
        
        Page<TranscriptRequestDto> pendingRequests = transcriptService.findPendingRequests(pageable);
        return ResponseEntity.ok(pendingRequests);
    }
    
    /**
     * Process transcript request
     */
    @PatchMapping("/requests/{id}/process")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF', 'REGISTRAR')")
    public ResponseEntity<TranscriptRequestDto> processTranscriptRequest(@PathVariable Long id) {
        User currentUser = securityContextService.getCurrentUserOrThrow();
        log.info("Processing transcript request with ID: {} by user: {}", id, currentUser.getUsername());
        
        // Only admin, academic staff, and registrar can process transcript requests
        if (!securityContextService.isCurrentUserAdmin() && 
            !securityContextService.isCurrentUserFaculty()) {
            throw new SecurityException("Access denied: Insufficient privileges to process transcript requests");
        }
        
        TranscriptRequestDto processedRequest = transcriptService.processRequest(id);
        return ResponseEntity.ok(processedRequest);
    }
    
    /**
     * Cancel transcript request
     */
    @PatchMapping("/requests/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT', 'ACADEMIC_STAFF')")
    public ResponseEntity<TranscriptRequestDto> cancelTranscriptRequest(@PathVariable Long id) {
        User currentUser = securityContextService.getCurrentUserOrThrow();
        log.info("Canceling transcript request with ID: {} by user: {}", id, currentUser.getUsername());
        
        // Validate that the user can cancel this request
        // Students can only cancel their own requests, admin/staff can cancel any
        if (securityContextService.isCurrentUserStudent()) {
            TranscriptRequestDto existingRequest = transcriptService.findRequestById(id)
                .orElseThrow(() -> new RuntimeException("Transcript request not found"));
            
            if (!existingRequest.getStudentId().equals(currentUser.getId())) {
                throw new SecurityException("Access denied: Students can only cancel their own transcript requests");
            }
        }
        
        TranscriptRequestDto cancelledRequest = transcriptService.cancelRequest(id);
        return ResponseEntity.ok(cancelledRequest);
    }
    
    /**
     * Update transcript request status
     */
    @PatchMapping("/requests/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIC_STAFF', 'REGISTRAR')")
    public ResponseEntity<TranscriptRequestDto> updateTranscriptRequestStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        User currentUser = securityContextService.getCurrentUserOrThrow();
        log.info("Updating transcript request {} status to: {} by user: {}", id, status, currentUser.getUsername());
        
        // Only admin, academic staff, and registrar can update transcript request status
        if (!securityContextService.isCurrentUserAdmin() && 
            !securityContextService.isCurrentUserFaculty()) {
            throw new SecurityException("Access denied: Insufficient privileges to update transcript request status");
        }
        
        TranscriptRequestDto updatedRequest = transcriptService.updateRequestStatus(id, status);
        return ResponseEntity.ok(updatedRequest);
    }
}
