package com.university.backend.modules.student.service;

import com.university.backend.modules.academic.entity.Registration;
import com.university.backend.modules.academic.repository.RegistrationRepository;
import com.university.backend.modules.core.entity.User;
import com.university.backend.modules.core.repository.UserRepository;
import com.university.backend.modules.student.dto.TranscriptCourseDto;
import com.university.backend.modules.student.dto.TranscriptDto;
import com.university.backend.modules.student.dto.TranscriptRequestDto;
import com.university.backend.modules.student.entity.Transcript;
import com.university.backend.modules.student.entity.TranscriptCourse;
import com.university.backend.modules.student.entity.TranscriptRequest;
import com.university.backend.modules.student.repository.TranscriptRepository;
import com.university.backend.modules.student.repository.TranscriptRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
@Validated
public class TranscriptService {
    
    private final TranscriptRepository transcriptRepository;
    private final TranscriptRequestRepository transcriptRequestRepository;
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;
    private final StudentAcademicRecordService studentAcademicRecordService;
    
    /**
     * Generate transcript for student
     */
    public TranscriptDto generateTranscript(@NotNull(message = "Student ID is required") Long studentId, 
                                          @NotBlank(message = "Transcript type is required") String transcriptType) {
        log.info("Generating transcript for student: {} of type: {}", studentId, transcriptType);
        
        // Validate required parameters
        if (studentId == null) {
            throw new IllegalArgumentException("Student ID is required");
        }
        if (transcriptType == null || transcriptType.trim().isEmpty()) {
            throw new IllegalArgumentException("Transcript type is required");
        }
        
        // Validate transcript type
        Transcript.TranscriptType type;
        try {
            type = Transcript.TranscriptType.valueOf(transcriptType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid transcript type: " + transcriptType);
        }
        
        // Get student information
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + studentId));
        
        // Get student's academic record
        var academicRecord = studentAcademicRecordService.findCurrentRecordByStudentId(studentId);
        
        // Get student's course registrations
        List<Registration> registrations = registrationRepository.findByUserIdWithDetails(studentId);
        
        // Create transcript entity
        Transcript transcript = Transcript.builder()
                .student(student)
                .transcriptType(type)
                .transcriptNumber(generateTranscriptNumber())
                .issueDate(LocalDate.now())
                .effectiveDate(LocalDate.now())
                .studentName(student.getFirstName() + " " + student.getLastName())
                .studentNumber(student.getUsername())
                .dateOfBirth(student.getDateOfBirth())
                .status(type == Transcript.TranscriptType.OFFICIAL ? 
                        Transcript.TranscriptStatus.PENDING_APPROVAL : 
                        Transcript.TranscriptStatus.APPROVED)
                .generatedBy(getCurrentUser())
                .build();
        
        // Set academic information from record
        if (academicRecord.isPresent()) {
            var record = academicRecord.get();
            transcript.setProgramOfStudy(record.getProgramName());
            transcript.setDegreeConferred(record.getDegreeType());
            transcript.setCumulativeGpa(record.getCumulativeGpa());
            transcript.setTotalCreditsEarned(record.getTotalCreditsEarned());
            transcript.setTotalCreditsAttempted(record.getTotalCreditsAttempted());
            transcript.setGraduationDate(record.getGraduationDate());
        }
        
        // Calculate academic summary from registrations
        calculateAcademicSummary(transcript, registrations);
        
        // Add security features for official transcripts
        if (type == Transcript.TranscriptType.OFFICIAL) {
            transcript.setSecurityCode(generateSecurityCode());
            transcript.setVerificationUrl(generateVerificationUrl(transcript.getTranscriptNumber()));
        }
        
        // Save transcript
        Transcript savedTranscript = transcriptRepository.save(transcript);
        
        // Create transcript courses
        List<TranscriptCourse> transcriptCourses = createTranscriptCourses(savedTranscript, registrations);
        savedTranscript.setCourses(transcriptCourses);
        
        log.info("Generated transcript with ID: {} for student: {}", savedTranscript.getId(), studentId);
        
        return convertToTranscriptDto(savedTranscript);
    }
    
    /**
     * Find transcript by ID
     */
    @Transactional(readOnly = true)
    public Optional<TranscriptDto> findById(@NotNull(message = "Transcript ID is required") Long id) {
        log.info("Finding transcript with ID: {}", id);
        
        if (id == null) {
            return Optional.empty();
        }
        
        return transcriptRepository.findByIdWithDetails(id)
                .map(this::convertToTranscriptDto);
    }
    
    /**
     * Find transcripts by student ID
     */
    @Transactional(readOnly = true)
    public List<TranscriptDto> findByStudentId(@NotNull(message = "Student ID is required") Long studentId) {
        log.info("Finding transcripts for student: {}", studentId);
        
        if (studentId == null) {
            return List.of();
        }
        
        return transcriptRepository.findByStudentIdOrderByIssueDateDesc(studentId)
                .stream()
                .map(this::convertToTranscriptDto)
                .toList();
    }
    
    /**
     * Create transcript request
     */
    public TranscriptRequestDto createTranscriptRequest(@NotNull(message = "Request data is required") TranscriptRequestDto requestDto) {
        log.info("Creating transcript request for student: {}", requestDto.getStudentId());
        
        // Validate required fields
        if (requestDto.getStudentId() == null) {
            throw new IllegalArgumentException("Student ID is required");
        }
        if (requestDto.getTranscriptType() == null) {
            throw new IllegalArgumentException("Transcript type is required");
        }
        if (requestDto.getDeliveryMethod() == null) {
            throw new IllegalArgumentException("Delivery method is required");
        }
        if (requestDto.getRecipientName() == null || requestDto.getRecipientName().trim().isEmpty()) {
            throw new IllegalArgumentException("Recipient name is required");
        }
        if (requestDto.getPurpose() == null || requestDto.getPurpose().trim().isEmpty()) {
            throw new IllegalArgumentException("Purpose is required");
        }
        
        // Validate student exists
        User student = userRepository.findById(requestDto.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + requestDto.getStudentId()));
        
        // Create transcript request entity
        TranscriptRequest request = TranscriptRequest.builder()
                .student(student)
                .requestNumber(generateRequestNumber())
                .transcriptType(requestDto.getTranscriptType())
                .urgencyLevel(requestDto.getUrgencyLevel() != null ? 
                        requestDto.getUrgencyLevel() : TranscriptRequest.UrgencyLevel.STANDARD)
                .recipientName(requestDto.getRecipientName())
                .recipientOrganization(requestDto.getRecipientInstitution())
                .deliveryMethod(requestDto.getDeliveryMethod())
                .deliveryAddress(requestDto.getDeliveryAddress())
                .deliveryEmail(requestDto.getDeliveryEmail())
                .deliveryPhone(requestDto.getDeliveryPhone())
                .status(TranscriptRequest.RequestStatus.SUBMITTED)
                .processingFee(calculateProcessingFee(requestDto.getTranscriptType(), requestDto.getUrgencyLevel()))
                .expediteFee(calculateExpediteFee(requestDto.getUrgencyLevel()))
                .paymentStatus(TranscriptRequest.PaymentStatus.PENDING)
                .specialInstructions(requestDto.getNotes())
                .build();
        
        // Calculate total fee
        request.setTotalFee(request.getProcessingFee().add(request.getExpediteFee()));
        
        // Save request
        TranscriptRequest savedRequest = transcriptRequestRepository.save(request);
        
        log.info("Created transcript request with ID: {} for student: {}", savedRequest.getId(), requestDto.getStudentId());
        
        return convertToTranscriptRequestDto(savedRequest);
    }
    
    /**
     * Find transcript request by ID
     */
    @Transactional(readOnly = true)
    public Optional<TranscriptRequestDto> findRequestById(Long id) {
        log.info("Finding transcript request with ID: {}", id);
        
        if (id == null) {
            return Optional.empty();
        }
        
        return transcriptRequestRepository.findByIdWithDetails(id)
                .map(this::convertToTranscriptRequestDto);
    }
    
    /**
     * Find transcript requests by student ID
     */
    @Transactional(readOnly = true)
    public List<TranscriptRequestDto> findRequestsByStudentId(Long studentId) {
        log.info("Finding transcript requests for student: {}", studentId);
        
        if (studentId == null) {
            return List.of();
        }
        
        return transcriptRequestRepository.findByStudentIdOrderByRequestDateDesc(studentId)
                .stream()
                .map(this::convertToTranscriptRequestDto)
                .toList();
    }
    
    /**
     * Find pending transcript requests
     */
    @Transactional(readOnly = true)
    public Page<TranscriptRequestDto> findPendingRequests(Pageable pageable) {
        log.info("Finding pending transcript requests");
        
        return transcriptRequestRepository.findByStatus(TranscriptRequest.RequestStatus.SUBMITTED, pageable)
                .map(this::convertToTranscriptRequestDto);
    }
    
    /**
     * Process transcript request
     */
    public TranscriptRequestDto processRequest(Long requestId) {
        log.info("Processing transcript request with ID: {}", requestId);
        
        // Validate request ID
        if (requestId == null) {
            throw new IllegalArgumentException("Request ID is required");
        }
        
        // Get the request
        TranscriptRequest request = transcriptRequestRepository.findByIdWithDetails(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Transcript request not found with ID: " + requestId));
        
        // Validate request can be processed
        if (request.getStatus() != TranscriptRequest.RequestStatus.SUBMITTED) {
            throw new IllegalStateException("Request cannot be processed. Current status: " + request.getStatus());
        }
        
        // Check payment status for paid requests
        if (request.getPaymentStatus() != TranscriptRequest.PaymentStatus.PAID && 
            request.getPaymentStatus() != TranscriptRequest.PaymentStatus.WAIVED) {
            throw new IllegalStateException("Payment required before processing request");
        }
        
        // Generate the actual transcript
        TranscriptDto transcript = generateTranscript(request.getStudent().getId(), 
                request.getTranscriptType().name());
        
        // Update request status
        request.setStatus(TranscriptRequest.RequestStatus.PROCESSING);
        request.setProcessedDate(LocalDateTime.now());
        request.setProcessedBy(getCurrentUser());
        
        // For electronic delivery, mark as ready immediately
        if (request.getDeliveryMethod() == TranscriptRequest.DeliveryMethod.EMAIL ||
            request.getDeliveryMethod() == TranscriptRequest.DeliveryMethod.ELECTRONIC_DELIVERY) {
            request.setStatus(TranscriptRequest.RequestStatus.READY);
        }
        
        TranscriptRequest savedRequest = transcriptRequestRepository.save(request);
        
        log.info("Processed transcript request with ID: {}", requestId);
        
        return convertToTranscriptRequestDto(savedRequest);
    }
    
    /**
     * Cancel transcript request
     */
    public TranscriptRequestDto cancelRequest(Long requestId) {
        log.info("Canceling transcript request with ID: {}", requestId);
        
        if (requestId == null) {
            throw new IllegalArgumentException("Request ID is required");
        }
        
        // Get the request
        TranscriptRequest request = transcriptRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Transcript request not found with ID: " + requestId));
        
        // Validate request can be cancelled
        if (request.getStatus() == TranscriptRequest.RequestStatus.SHIPPED ||
            request.getStatus() == TranscriptRequest.RequestStatus.DELIVERED ||
            request.getStatus() == TranscriptRequest.RequestStatus.CANCELLED) {
            throw new IllegalStateException("Request cannot be cancelled. Current status: " + request.getStatus());
        }
        
        // Update status
        request.setStatus(TranscriptRequest.RequestStatus.CANCELLED);
        
        // Handle refund if payment was made
        if (request.getPaymentStatus() == TranscriptRequest.PaymentStatus.PAID) {
            request.setPaymentStatus(TranscriptRequest.PaymentStatus.REFUNDED);
        }
        
        TranscriptRequest savedRequest = transcriptRequestRepository.save(request);
        
        log.info("Cancelled transcript request with ID: {}", requestId);
        
        return convertToTranscriptRequestDto(savedRequest);
    }
    
    /**
     * Update transcript request status
     */
    public TranscriptRequestDto updateRequestStatus(Long requestId, String status) {
        log.info("Updating transcript request {} status to: {}", requestId, status);
        
        if (requestId == null) {
            throw new IllegalArgumentException("Request ID is required");
        }
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status is required");
        }
        
        // Validate status
        TranscriptRequest.RequestStatus newStatus;
        try {
            newStatus = TranscriptRequest.RequestStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
        
        // Get the request
        TranscriptRequest request = transcriptRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Transcript request not found with ID: " + requestId));
        
        // Update status
        request.setStatus(newStatus);
        
        // Set additional fields based on status
        switch (newStatus) {
            case PROCESSING:
                if (request.getProcessedDate() == null) {
                    request.setProcessedDate(LocalDateTime.now());
                    request.setProcessedBy(getCurrentUser());
                }
                break;
            case SHIPPED:
                if (request.getShippedDate() == null) {
                    request.setShippedDate(LocalDateTime.now());
                    request.setTrackingNumber(generateTrackingNumber());
                }
                break;
            case DELIVERED:
                if (request.getDeliveryConfirmation() == null) {
                    request.setDeliveryConfirmation(LocalDateTime.now());
                }
                break;
        }
        
        TranscriptRequest savedRequest = transcriptRequestRepository.save(request);
        
        log.info("Updated transcript request {} status to: {}", requestId, status);
        
        return convertToTranscriptRequestDto(savedRequest);
    }
    
    // Helper methods
    
    private String generateTranscriptNumber() {
        return "TR-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + 
               "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    private String generateRequestNumber() {
        return "REQ-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + 
               "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    private String generateSecurityCode() {
        return UUID.randomUUID().toString().replace("-", "").toUpperCase();
    }
    
    private String generateVerificationUrl(String transcriptNumber) {
        return "https://university.edu/verify/transcript/" + transcriptNumber;
    }
    
    private String generateTrackingNumber() {
        return "TRK-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName() != null) {
            return userRepository.findByUsername(authentication.getName()).orElse(null);
        }
        return null;
    }
    
    private BigDecimal calculateProcessingFee(TranscriptRequest.TranscriptType transcriptType, 
                                            TranscriptRequest.UrgencyLevel urgencyLevel) {
        BigDecimal baseFee = new BigDecimal("10.00");
        
        // Official transcripts cost more
        if (transcriptType == TranscriptRequest.TranscriptType.OFFICIAL) {
            baseFee = new BigDecimal("15.00");
        }
        
        return baseFee;
    }
    
    private BigDecimal calculateExpediteFee(TranscriptRequest.UrgencyLevel urgencyLevel) {
        if (urgencyLevel == null) {
            return BigDecimal.ZERO;
        }
        
        return switch (urgencyLevel) {
            case EXPEDITED -> new BigDecimal("25.00");
            case RUSH -> new BigDecimal("50.00");
            default -> BigDecimal.ZERO;
        };
    }
    
    private void calculateAcademicSummary(Transcript transcript, List<Registration> registrations) {
        int totalCreditsAttempted = 0;
        int totalCreditsEarned = 0;
        BigDecimal totalQualityPoints = BigDecimal.ZERO;
        int gradeCount = 0;
        
        for (Registration registration : registrations) {
            if (registration.getCourse() != null && registration.getCourse().getCredits() != null) {
                totalCreditsAttempted += registration.getCourse().getCredits();
                
                if (registration.getGrade() != null && !registration.getGrade().isEmpty()) {
                    BigDecimal gradePoints = convertGradeToPoints(registration.getGrade());
                    if (gradePoints.compareTo(BigDecimal.ZERO) >= 0) {
                        totalCreditsEarned += registration.getCourse().getCredits();
                        totalQualityPoints = totalQualityPoints.add(
                            gradePoints.multiply(new BigDecimal(registration.getCourse().getCredits())));
                        gradeCount++;
                    }
                }
            }
        }
        
        transcript.setTotalCreditsAttempted(totalCreditsAttempted);
        transcript.setTotalCreditsEarned(totalCreditsEarned);
        
        // Calculate GPA
        if (totalCreditsEarned > 0) {
            BigDecimal gpa = totalQualityPoints.divide(new BigDecimal(totalCreditsEarned), 3, RoundingMode.HALF_UP);
            transcript.setCumulativeGpa(gpa);
        }
    }
    
    private BigDecimal convertGradeToPoints(String grade) {
        if (grade == null || grade.trim().isEmpty()) {
            return BigDecimal.valueOf(-1); // Invalid grade
        }
        
        return switch (grade.toUpperCase().trim()) {
            case "A", "A+" -> BigDecimal.valueOf(4.0);
            case "A-" -> BigDecimal.valueOf(3.7);
            case "B+" -> BigDecimal.valueOf(3.3);
            case "B" -> BigDecimal.valueOf(3.0);
            case "B-" -> BigDecimal.valueOf(2.7);
            case "C+" -> BigDecimal.valueOf(2.3);
            case "C" -> BigDecimal.valueOf(2.0);
            case "C-" -> BigDecimal.valueOf(1.7);
            case "D+" -> BigDecimal.valueOf(1.3);
            case "D" -> BigDecimal.valueOf(1.0);
            case "D-" -> BigDecimal.valueOf(0.7);
            case "F" -> BigDecimal.ZERO;
            default -> BigDecimal.valueOf(-1); // Invalid grade
        };
    }
    
    private List<TranscriptCourse> createTranscriptCourses(Transcript transcript, List<Registration> registrations) {
        List<TranscriptCourse> transcriptCourses = new ArrayList<>();
        
        for (Registration registration : registrations) {
            if (registration.getCourse() != null) {
                TranscriptCourse transcriptCourse = TranscriptCourse.builder()
                        .transcript(transcript)
                        .registration(registration)
                        .courseCode(registration.getCourse().getCode())
                        .courseTitle(registration.getCourse().getTitle())
                        .creditHours(new BigDecimal(registration.getCourse().getCredits()))
                        .grade(registration.getGrade())
                        .qualityPoints(calculateQualityPoints(registration.getGrade(), registration.getCourse().getCredits()))
                        .academicYear("2024-2025") // Default academic year
                        .semester("Fall 2024") // Default semester
                        .instructorName(registration.getCourse().getInstructor())
                        .courseLevel(TranscriptCourse.CourseLevel.UNDERGRADUATE) // Default level
                        .transferCredit(false)
                        .build();
                
                transcriptCourses.add(transcriptCourse);
            }
        }
        
        return transcriptCourses;
    }
    
    private BigDecimal calculateQualityPoints(String grade, Integer credits) {
        if (grade == null || credits == null) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal gradePoints = convertGradeToPoints(grade);
        if (gradePoints.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO;
        }
        
        return gradePoints.multiply(new BigDecimal(credits));
    }
    
    private TranscriptDto convertToTranscriptDto(Transcript transcript) {
        List<TranscriptCourseDto> courseDtos = new ArrayList<>();
        if (transcript.getCourses() != null) {
            courseDtos = transcript.getCourses().stream()
                    .map(this::convertToTranscriptCourseDto)
                    .toList();
        }
        
        return TranscriptDto.builder()
                .id(transcript.getId())
                .studentId(transcript.getStudent().getId())
                .studentName(transcript.getStudentName())
                .studentEmail(transcript.getStudent().getEmail())
                .studentNumber(transcript.getStudentNumber())
                .dateOfBirth(transcript.getDateOfBirth())
                .programName(transcript.getProgramOfStudy())
                .degreeType(transcript.getDegreeConferred())
                .transcriptType(transcript.getTranscriptType().name())
                .issueDate(transcript.getIssueDate())
                .graduationDate(transcript.getGraduationDate())
                .transcriptStatus(transcript.getStatus().name())
                .cumulativeGpa(transcript.getCumulativeGpa())
                .totalCreditsEarned(transcript.getTotalCreditsEarned() != null ? 
                        new BigDecimal(transcript.getTotalCreditsEarned()) : BigDecimal.ZERO)
                .totalCreditsAttempted(transcript.getTotalCreditsAttempted() != null ? 
                        new BigDecimal(transcript.getTotalCreditsAttempted()) : BigDecimal.ZERO)
                .degreeAwarded(transcript.getDegreeConferred())
                .degreeAwardedDate(transcript.getGraduationDate() != null ? 
                        transcript.getGraduationDate().toString() : null)
                .graduationHonors(transcript.getAcademicHonors())
                .transcriptNumber(transcript.getTranscriptNumber())
                .isOfficial(transcript.getTranscriptType() == Transcript.TranscriptType.OFFICIAL)
                .securityFeatures(transcript.getSecurityCode())
                .verificationCode(transcript.getSecurityCode())
                .generatedByName(transcript.getGeneratedBy() != null ? 
                        transcript.getGeneratedBy().getFirstName() + " " + transcript.getGeneratedBy().getLastName() : "System")
                .generatedDate(transcript.getCreatedAt())
                .createdAt(transcript.getCreatedAt())
                .updatedAt(transcript.getUpdatedAt())
                .courses(courseDtos)
                .courseCount(courseDtos.size())
                .institutionName("University")
                .institutionAddress("123 University Ave, City, State 12345")
                .registrarSignature("Digital Signature")
                .build();
    }
    
    private TranscriptCourseDto convertToTranscriptCourseDto(TranscriptCourse transcriptCourse) {
        return TranscriptCourseDto.builder()
                .id(transcriptCourse.getId())
                .transcriptId(transcriptCourse.getTranscript().getId())
                .courseCode(transcriptCourse.getCourseCode())
                .courseName(transcriptCourse.getCourseTitle())
                .academicYearName(transcriptCourse.getAcademicYear())
                .academicSemesterName(transcriptCourse.getSemester())
                .creditHours(transcriptCourse.getCreditHours())
                .qualityPoints(transcriptCourse.getQualityPoints())
                .gradeEarned(transcriptCourse.getGrade())
                .isTransferCredit(transcriptCourse.getTransferCredit())
                .transferInstitution(transcriptCourse.getTransferInstitution())
                .instructorName(transcriptCourse.getInstructorName())
                .courseLevel(transcriptCourse.getCourseLevel() != null ? 
                        transcriptCourse.getCourseLevel().name() : null)
                .countsTowardGpa(transcriptCourse.getGrade() != null && 
                        !transcriptCourse.getGrade().equalsIgnoreCase("PASS") &&
                        !transcriptCourse.getGrade().equalsIgnoreCase("FAIL"))
                .countsTowardDegree(true)
                .build();
    }
    
    private TranscriptRequestDto convertToTranscriptRequestDto(TranscriptRequest request) {
        return TranscriptRequestDto.builder()
                .id(request.getId())
                .studentId(request.getStudent().getId())
                .studentName(request.getStudent().getFirstName() + " " + request.getStudent().getLastName())
                .studentEmail(request.getStudent().getEmail())
                .studentNumber(request.getStudent().getUsername())
                .transcriptType(request.getTranscriptType())
                .requestDate(request.getRequestDate())
                .purpose(request.getSpecialInstructions())
                .notes(request.getInternalNotes())
                .urgencyLevel(request.getUrgencyLevel())
                .deliveryMethod(request.getDeliveryMethod())
                .recipientName(request.getRecipientName())
                .recipientInstitution(request.getRecipientOrganization())
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryEmail(request.getDeliveryEmail())
                .deliveryPhone(request.getDeliveryPhone())
                .status(request.getStatus())
                .processedByName(request.getProcessedBy() != null ? 
                        request.getProcessedBy().getFirstName() + " " + request.getProcessedBy().getLastName() : null)
                .processedDate(request.getProcessedDate())
                .feeAmount(request.getTotalFee())
                .paymentStatus(request.getPaymentStatus())
                .feePaymentDate(request.getPaymentDate())
                .trackingNumber(request.getTrackingNumber())
                .deliveryConfirmation(request.getDeliveryConfirmation() != null ? 
                        request.getDeliveryConfirmation().toString() : null)
                .isRush(request.getUrgencyLevel() == TranscriptRequest.UrgencyLevel.RUSH)
                .createdAt(request.getRequestDate())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}