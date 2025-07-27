package com.university.backend.mapper;

import com.university.backend.dto.EmployeeRecordDto;
import com.university.backend.dto.LeaveRequestDto;
import com.university.backend.entity.EmployeeRecord;
import com.university.backend.entity.LeaveRequest;
import org.springframework.stereotype.Component;

@Component
public class HRMapper {
    
    public EmployeeRecordDto toDto(EmployeeRecord entity) {
        if (entity == null) {
            return null;
        }
        
        String supervisorName = null;
        if (entity.getSupervisor() != null) {
            supervisorName = entity.getSupervisor().getFirstName() + " " + 
                           entity.getSupervisor().getLastName();
        }
        
        return EmployeeRecordDto.builder()
            .id(entity.getId())
            .userId(entity.getUser() != null ? entity.getUser().getId() : null)
            .employeeNumber(entity.getEmployeeNumber())
            .hireDate(entity.getHireDate())
            .employmentType(entity.getEmploymentType())
            .employmentStatus(entity.getEmploymentStatus())
            .jobTitle(entity.getJobTitle())
            .department(entity.getDepartment())
            .supervisorId(entity.getSupervisor() != null ? entity.getSupervisor().getId() : null)
            .supervisorName(supervisorName)
            .salary(entity.getSalary())
            .hourlyRate(entity.getHourlyRate())
            .benefitsEligible(entity.getBenefitsEligible())
            .tenureTrack(entity.getTenureTrack())
            .tenureDate(entity.getTenureDate())
            .contractStartDate(entity.getContractStartDate())
            .contractEndDate(entity.getContractEndDate())
            .officeLocation(entity.getOfficeLocation())
            .officePhone(entity.getOfficePhone())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .firstName(entity.getUser() != null ? entity.getUser().getFirstName() : null)
            .lastName(entity.getUser() != null ? entity.getUser().getLastName() : null)
            .email(entity.getUser() != null ? entity.getUser().getEmail() : null)
            .phoneNumber(entity.getUser() != null ? entity.getUser().getPhoneNumber() : null)
            .build();
    }
    
    public LeaveRequestDto toDto(LeaveRequest entity) {
        if (entity == null) {
            return null;
        }
        
        return LeaveRequestDto.builder()
            .id(entity.getId())
            .employeeId(entity.getEmployee() != null ? entity.getEmployee().getId() : null)
            .employeeNumber(entity.getEmployee() != null ? entity.getEmployee().getEmployeeNumber() : null)
            .employeeName(entity.getEmployee() != null && entity.getEmployee().getUser() != null ? 
                entity.getEmployee().getUser().getFirstName() + " " + entity.getEmployee().getUser().getLastName() : null)
            .leaveTypeId(entity.getLeaveType() != null ? entity.getLeaveType().getId() : null)
            .leaveTypeCode(entity.getLeaveType() != null ? entity.getLeaveType().getCode() : null)
            .leaveTypeName(entity.getLeaveType() != null ? entity.getLeaveType().getName() : null)
            .requestNumber(entity.getRequestNumber())
            .startDate(entity.getStartDate())
            .endDate(entity.getEndDate())
            .totalDays(entity.getTotalDays())
            .reason(entity.getReason())
            .emergencyContactName(entity.getEmergencyContactName())
            .emergencyContactPhone(entity.getEmergencyContactPhone())
            .supportingDocumentUrl(entity.getSupportingDocumentUrl())
            .status(entity.getStatus())
            .requestedById(entity.getRequestedBy() != null ? entity.getRequestedBy().getId() : null)
            .requestedByName(entity.getRequestedBy() != null ? 
                entity.getRequestedBy().getFirstName() + " " + entity.getRequestedBy().getLastName() : null)
            .approvedById(entity.getApprovedBy() != null ? entity.getApprovedBy().getId() : null)
            .approvedByName(entity.getApprovedBy() != null ? 
                entity.getApprovedBy().getFirstName() + " " + entity.getApprovedBy().getLastName() : null)
            .approvedDate(entity.getApprovedDate())
            .rejectionReason(entity.getRejectionReason())
            .hrNotes(entity.getHrNotes())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}