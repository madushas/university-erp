package com.university.backend.modules.hr.dto;

import com.university.backend.modules.core.dto.BaseDto;
import com.university.backend.modules.hr.entity.LeaveTypeStatus;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class LeaveTypeDto extends BaseDto {
    private String code;
    private String name;
    private String description;
    private Boolean isPaid;
    private Boolean requiresApproval;
    private Integer maxDaysPerYear;
    private Double accrualRate;
    private Boolean carryoverAllowed;
    private Integer advanceNoticeRequiredDays;
    private Boolean documentationRequired;
    private LeaveTypeStatus status;
}