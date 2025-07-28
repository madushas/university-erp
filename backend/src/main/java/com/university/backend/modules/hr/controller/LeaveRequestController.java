package com.university.backend.modules.hr.controller;

import com.university.backend.modules.hr.mapper.HRMapper;
import com.university.backend.modules.hr.dto.LeaveRequestDto;
import com.university.backend.modules.hr.entity.LeaveRequest;
import com.university.backend.modules.hr.entity.LeaveRequestStatus;
import com.university.backend.modules.hr.service.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/hr/leave/requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LeaveRequestController {
    
    private final LeaveRequestService leaveRequestService;
    private final HRMapper hrMapper;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<LeaveRequestDto>> getAllLeaveRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<LeaveRequest> requests = leaveRequestService.getAllLeaveRequests(pageable);
        List<LeaveRequestDto> requestDtos = requests.getContent().stream()
            .map(hrMapper::toDto)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(requestDtos);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('FACULTY') or hasRole('STAFF')")
    public ResponseEntity<LeaveRequest> getLeaveRequestById(@PathVariable Long id) {
        return leaveRequestService.getLeaveRequestById(id)
            .map(request -> ResponseEntity.ok(request))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Page<LeaveRequest>> getLeaveRequestsByEmployee(
            @PathVariable Long employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<LeaveRequest> requests = leaveRequestService.getLeaveRequestsByEmployee(employeeId, pageable);
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('FACULTY') or hasRole('STAFF')")
    public ResponseEntity<Page<LeaveRequest>> getMyLeaveRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        // TODO: Get current user's employee ID from security context
        // For now, return empty page
        Pageable pageable = PageRequest.of(page, size);
        Page<LeaveRequest> requests = Page.empty(pageable);
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('FACULTY')")
    public ResponseEntity<List<LeaveRequestDto>> getPendingLeaveRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        List<LeaveRequest> requests = leaveRequestService.getPendingLeaveRequests();
        List<LeaveRequestDto> requestDtos = requests.stream()
            .map(hrMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(requestDtos);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('FACULTY') or hasRole('STAFF')")
    public ResponseEntity<LeaveRequest> createLeaveRequest(@Valid @RequestBody LeaveRequest leaveRequest) {
        try {
            // TODO: Set requestedBy to current user from security context
            // TODO: Validate leave balance and business rules
            
            LeaveRequest createdRequest = leaveRequestService.createLeaveRequest(leaveRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<LeaveRequest> updateLeaveRequest(
            @PathVariable Long id, 
            @Valid @RequestBody LeaveRequest leaveRequest) {
        try {
            if (!leaveRequestService.getLeaveRequestById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            leaveRequest.setId(id);
            LeaveRequest updatedRequest = leaveRequestService.updateLeaveRequest(leaveRequest);
            return ResponseEntity.ok(updatedRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('FACULTY')")
    public ResponseEntity<LeaveRequest> approveLeaveRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> requestBody) {
        try {
            String comments = requestBody != null ? requestBody.get("approverComments") : null;
            // TODO: Get approver ID from security context
            Long approverId = 1L; // Placeholder
            
            LeaveRequest approvedRequest = leaveRequestService.approveLeaveRequest(id, approverId, comments);
            return ResponseEntity.ok(approvedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('FACULTY')")
    public ResponseEntity<LeaveRequest> rejectLeaveRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> requestBody) {
        try {
            String rejectionReason = requestBody.get("rejectionReason");
            String comments = requestBody.get("approverComments");
            
            if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            LeaveRequest rejectedRequest = leaveRequestService.rejectLeaveRequest(id, rejectionReason, comments);
            return ResponseEntity.ok(rejectedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('FACULTY') or hasRole('STAFF')")
    public ResponseEntity<LeaveRequest> cancelLeaveRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> requestBody) {
        try {
            String cancellationReason = requestBody.get("cancellationReason");
            
            if (cancellationReason == null || cancellationReason.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            // TODO: Verify that current user owns this leave request
            
            LeaveRequest cancelledRequest = leaveRequestService.cancelLeaveRequest(id, cancellationReason);
            return ResponseEntity.ok(cancelledRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/calendar")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('FACULTY')")
    public ResponseEntity<List<LeaveRequest>> getLeaveCalendar(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam(required = false) Long departmentId) {
        
        List<LeaveRequest> requests = leaveRequestService.getOverlappingRequests(startDate, endDate);
        // TODO: Filter by department if provided
        return ResponseEntity.ok(requests);
    }
    
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Map<String, Object>> getLeaveStatistics(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Long departmentId) {
        
        Map<String, Object> stats = Map.of(
            "totalPending", leaveRequestService.countByStatus(LeaveRequestStatus.PENDING),
            "totalApproved", leaveRequestService.countByStatus(LeaveRequestStatus.APPROVED),
            "totalRejected", leaveRequestService.countByStatus(LeaveRequestStatus.REJECTED),
            "totalCompleted", leaveRequestService.countByStatus(LeaveRequestStatus.COMPLETED),
            "totalCancelled", leaveRequestService.countByStatus(LeaveRequestStatus.CANCELLED)
        );
        return ResponseEntity.ok(stats);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLeaveRequest(@PathVariable Long id) {
        try {
            if (!leaveRequestService.getLeaveRequestById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            leaveRequestService.deleteLeaveRequest(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}