package com.university.backend.service;

import com.university.backend.entity.LeaveRequest;
import com.university.backend.entity.LeaveRequestStatus;
import com.university.backend.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
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
    
    public List<LeaveRequest> getPendingLeaveRequests() {
        return leaveRequestRepository.findPendingRequestsOrderByCreatedDate();
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
    
    public LeaveRequest createLeaveRequest(LeaveRequest leaveRequest) {
        // Generate request number if not provided
        if (leaveRequest.getRequestNumber() == null || leaveRequest.getRequestNumber().isEmpty()) {
            leaveRequest.setRequestNumber(generateRequestNumber());
        }
        
        // Set default status
        if (leaveRequest.getStatus() == null) {
            leaveRequest.setStatus(LeaveRequestStatus.PENDING);
        }
        
        return leaveRequestRepository.save(leaveRequest);
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
    
    public long countByStatus(LeaveRequestStatus status) {
        return leaveRequestRepository.countByStatus(status);
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