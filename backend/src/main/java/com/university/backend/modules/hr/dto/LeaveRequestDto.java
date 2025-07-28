package com.university.backend.modules.hr.dto;

import com.university.backend.modules.core.dto.BaseDto;
import com.university.backend.modules.hr.entity.LeaveRequestStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class LeaveRequestDto extends BaseDto {
    private EmployeeRecordDto employee;
    private LeaveTypeDto leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalDays;
    private String reason;
    private LeaveRequestStatus status;
    private String approverName; // Calculated field
    private LocalDate approvedDate;
    private String approverComments;
    private Boolean isEmergency;
    private String attachmentUrl;
}