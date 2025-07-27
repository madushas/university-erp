package com.university.backend.controller;

import com.university.backend.entity.EmploymentStatus;
import com.university.backend.entity.LeaveRequestStatus;
import com.university.backend.service.EmployeeRecordService;
import com.university.backend.service.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/hr")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HRDashboardController {
    
    private final EmployeeRecordService employeeRecordService;
    private final LeaveRequestService leaveRequestService;
    
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Map<String, Object>> getHRDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        
        // Employee statistics
        Map<String, Object> employeeStats = new HashMap<>();
        employeeStats.put("totalActive", employeeRecordService.countByStatus(EmploymentStatus.ACTIVE));
        employeeStats.put("totalInactive", employeeRecordService.countByStatus(EmploymentStatus.INACTIVE));
        employeeStats.put("totalTerminated", employeeRecordService.countByStatus(EmploymentStatus.TERMINATED));
        employeeStats.put("totalRetired", employeeRecordService.countByStatus(EmploymentStatus.RETIRED));
        dashboard.put("employees", employeeStats);
        
        // Leave request statistics
        Map<String, Object> leaveStats = new HashMap<>();
        leaveStats.put("pendingRequests", leaveRequestService.countByStatus(LeaveRequestStatus.PENDING));
        leaveStats.put("approvedRequests", leaveRequestService.countByStatus(LeaveRequestStatus.APPROVED));
        leaveStats.put("rejectedRequests", leaveRequestService.countByStatus(LeaveRequestStatus.REJECTED));
        leaveStats.put("completedRequests", leaveRequestService.countByStatus(LeaveRequestStatus.COMPLETED));
        dashboard.put("leaveRequests", leaveStats);
        
        // Quick actions
        dashboard.put("quickActions", Map.of(
            "pendingLeaveApprovals", leaveRequestService.countByStatus(LeaveRequestStatus.PENDING),
            "tenureTrackPending", employeeRecordService.getTenureTrackWithoutTenure().size()
        ));
        
        return ResponseEntity.ok(dashboard);
    }
    
    @GetMapping("/reports/headcount")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Map<String, Object>> getHeadcountReport(
            @RequestParam(defaultValue = "department") String groupBy) {
        
        Map<String, Object> report = new HashMap<>();
        
        // Simple headcount by status
        Map<String, Long> headcountByStatus = new HashMap<>();
        headcountByStatus.put("ACTIVE", employeeRecordService.countByStatus(EmploymentStatus.ACTIVE));
        headcountByStatus.put("INACTIVE", employeeRecordService.countByStatus(EmploymentStatus.INACTIVE));
        headcountByStatus.put("TERMINATED", employeeRecordService.countByStatus(EmploymentStatus.TERMINATED));
        headcountByStatus.put("RETIRED", employeeRecordService.countByStatus(EmploymentStatus.RETIRED));
        
        report.put("headcountByStatus", headcountByStatus);
        report.put("groupBy", groupBy);
        report.put("totalEmployees", employeeRecordService.countByStatus(EmploymentStatus.ACTIVE));
        
        return ResponseEntity.ok(report);
    }
    
    @GetMapping("/reports/leave-usage")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Map<String, Object>> getLeaveUsageReport(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Long departmentId) {
        
        Map<String, Object> report = new HashMap<>();
        
        // Simple leave statistics
        Map<String, Long> leaveByStatus = new HashMap<>();
        leaveByStatus.put("PENDING", leaveRequestService.countByStatus(LeaveRequestStatus.PENDING));
        leaveByStatus.put("APPROVED", leaveRequestService.countByStatus(LeaveRequestStatus.APPROVED));
        leaveByStatus.put("REJECTED", leaveRequestService.countByStatus(LeaveRequestStatus.REJECTED));
        leaveByStatus.put("COMPLETED", leaveRequestService.countByStatus(LeaveRequestStatus.COMPLETED));
        leaveByStatus.put("CANCELLED", leaveRequestService.countByStatus(LeaveRequestStatus.CANCELLED));
        
        report.put("leaveByStatus", leaveByStatus);
        report.put("year", year != null ? year : 2025);
        report.put("departmentId", departmentId);
        
        return ResponseEntity.ok(report);
    }
}