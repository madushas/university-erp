package com.university.backend.dto;

import com.university.backend.entity.LeaveRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequestDto {
    private Long id;
    private Long employeeId;
    private String employeeNumber;
    private String employeeName;
    private Long leaveTypeId;
    private String leaveTypeCode;
    private String leaveTypeName;
    private String requestNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalDays;
    private String reason;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String supportingDocumentUrl;
    private LeaveRequestStatus status;
    private Long requestedById;
    private String requestedByName;
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime approvedDate;
    private String rejectionReason;
    private String hrNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}