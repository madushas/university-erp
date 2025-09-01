package com.university.backend.modules.hr.service;

import com.university.backend.modules.hr.entity.LeaveRequest;
import com.university.backend.modules.hr.entity.LeaveRequestStatus;
import com.university.backend.modules.hr.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class LeaveRequestService {
    
    private final LeaveRequestRepository leaveRequestRepository;
    
    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAll();
    }
    
    public Page<LeaveRequest> getAllLeaveRequests(Pageable pageable) {
        return leaveRequestRepository.findAll(pageable);
    }
    
    public Optional<LeaveRequest> getLeaveRequestById(Long id) {
        return leaveRequestRepository.findById(id);
    }
    
    public Optional<LeaveRequest> getLeaveRequestByNumber(String requestNumber) {
        return leaveRequestRepository.findByRequestNumber(requestNumber);
    }
    
    public List<LeaveRequest> getLeaveRequestsByEmployee(Long employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId);
    }
    
    public Page<LeaveRequest> getLeaveRequestsByEmployee(Long employeeId, Pageable pageable) {
        return leaveRequestRepository.findByEmployeeIdAndStatus(employeeId, null, pageable);
    }
    
    public List<LeaveRequest> getLeaveRequestsByStatus(LeaveRequestStatus status) {
        return leaveRequestRepository.findByStatus(status);
    }
    
    @Cacheable("pendingLeaveRequests")
    @Transactional(readOnly = true)
    public List<LeaveRequest> getPendingLeaveRequests() {
        try {
            log.debug("Retrieving pending leave requests");
            List<LeaveRequest> requests = leaveRequestRepository.findPendingRequestsOrderByCreatedDate();
            log.debug("Found {} pending leave requests", requests.size());
            return requests;
        } catch (Exception e) {
            log.error("Error retrieving pending leave requests: {}", e.getMessage());
            return List.of(); // Return empty list to prevent timeout
        }
    }
    
    public List<LeaveRequest> getOverlappingRequests(LocalDate startDate, LocalDate endDate) {
        return leaveRequestRepository.findOverlappingRequests(startDate, endDate);
    }
    
    public List<LeaveRequest> getEmployeeOverlappingRequests(Long employeeId, LocalDate startDate, LocalDate endDate) {
        List<LeaveRequestStatus> activeStatuses = List.of(
            LeaveRequestStatus.PENDING, 
            LeaveRequestStatus.APPROVED, 
            LeaveRequestStatus.COMPLETED
        );
        return leaveRequestRepository.findEmployeeOverlappingRequests(employeeId, startDate, endDate, activeStatuses);
    }
    
    @CacheEvict(value = {"pendingLeaveRequests", "leaveRequestCounts"}, allEntries = true)
    public LeaveRequest createLeaveRequest(LeaveRequest leaveRequest) {
        try {
            log.info("Creating leave request for employee: {}", 
                leaveRequest.getRequestedBy() != null ? leaveRequest.getRequestedBy().getId() : "unknown");
            
            // Validate required fields
            if (leaveRequest.getStartDate() == null) {
                throw new IllegalArgumentException("Start date is required");
            }
            if (leaveRequest.getEndDate() == null) {
                throw new IllegalArgumentException("End date is required");
            }
            if (leaveRequest.getStartDate().isAfter(leaveRequest.getEndDate())) {
                throw new IllegalArgumentException("Start date cannot be after end date");
            }
            if (leaveRequest.getRequestedBy() == null) {
                throw new IllegalArgumentException("Requesting user is required");
            }
            
            // Generate request number if not provided
            if (leaveRequest.getRequestNumber() == null || leaveRequest.getRequestNumber().isEmpty()) {
                leaveRequest.setRequestNumber(generateRequestNumber());
            }
            
            // Set default status
            if (leaveRequest.getStatus() == null) {
                leaveRequest.setStatus(LeaveRequestStatus.PENDING);
            }
            
            LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
            log.info("Created leave request with ID: {}", saved.getId());
            return saved;
        } catch (Exception e) {
            log.error("Error creating leave request: {}", e.getMessage());
            throw new RuntimeException("Failed to create leave request", e);
        }
    }
    
    public LeaveRequest updateLeaveRequest(LeaveRequest leaveRequest) {
        return leaveRequestRepository.save(leaveRequest);
    }
    
    public LeaveRequest approveLeaveRequest(Long id, Long approverId, String comments) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Leave request not found with id: " + id));
        
        leaveRequest.setStatus(LeaveRequestStatus.APPROVED);
        leaveRequest.setApprovedDate(LocalDateTime.now());
        leaveRequest.setHrNotes(comments);
        
        return leaveRequestRepository.save(leaveRequest);
    }
    
    public LeaveRequest rejectLeaveRequest(Long id, String rejectionReason, String comments) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Leave request not found with id: " + id));
        
        leaveRequest.setStatus(LeaveRequestStatus.REJECTED);
        leaveRequest.setRejectionReason(rejectionReason);
        leaveRequest.setHrNotes(comments);
        
        return leaveRequestRepository.save(leaveRequest);
    }
    
    public LeaveRequest cancelLeaveRequest(Long id, String cancellationReason) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Leave request not found with id: " + id));
        
        if (leaveRequest.getStatus() != LeaveRequestStatus.PENDING && 
            leaveRequest.getStatus() != LeaveRequestStatus.APPROVED) {
            throw new RuntimeException("Cannot cancel leave request in current status: " + leaveRequest.getStatus());
        }
        
        leaveRequest.setStatus(LeaveRequestStatus.CANCELLED);
        leaveRequest.setRejectionReason(cancellationReason);
        
        return leaveRequestRepository.save(leaveRequest);
    }
    
    public void deleteLeaveRequest(Long id) {
        leaveRequestRepository.deleteById(id);
    }
    
    @Cacheable("leaveRequestCounts")
    @Transactional(readOnly = true)
    public long countByStatus(LeaveRequestStatus status) {
        try {
            log.debug("Counting leave requests by status: {}", status);
            long count = leaveRequestRepository.countByStatus(status);
            log.debug("Found {} leave requests with status: {}", count, status);
            return count;
        } catch (Exception e) {
            log.error("Error counting leave requests by status {}: {}", status, e.getMessage());
            return 0L; // Return 0 to prevent timeout
        }
    }
    
    public Double getTotalDaysUsedByEmployeeAndType(Long employeeId, Long leaveTypeId, Integer year) {
        List<LeaveRequestStatus> approvedStatuses = List.of(
            LeaveRequestStatus.APPROVED, 
            LeaveRequestStatus.COMPLETED
        );
        return leaveRequestRepository.sumDaysByEmployeeAndLeaveTypeAndYear(
            employeeId, leaveTypeId, approvedStatuses, year);
    }
    
    public boolean hasOverlappingRequests(Long employeeId, LocalDate startDate, LocalDate endDate, Long excludeRequestId) {
        List<LeaveRequest> overlapping = getEmployeeOverlappingRequests(employeeId, startDate, endDate);
        return overlapping.stream().anyMatch(req -> !req.getId().equals(excludeRequestId));
    }
    
    private String generateRequestNumber() {
        // Simple implementation - in production, this should be more sophisticated
        return "LR" + System.currentTimeMillis();
    }
}