package com.university.backend.modules.hr.mapper;

import com.university.backend.modules.hr.dto.EmployeeRecordDto;
import com.university.backend.modules.hr.dto.LeaveRequestDto;
import com.university.backend.modules.hr.entity.EmployeeRecord;
import com.university.backend.modules.hr.entity.LeaveRequest;
import com.university.backend.modules.core.dto.UserDto;
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
            .user(entity.getUser() != null ? UserDto.builder()
                .id(entity.getUser().getId())
                .username(entity.getUser().getUsername())
                .email(entity.getUser().getEmail())
                .firstName(entity.getUser().getFirstName())
                .lastName(entity.getUser().getLastName())
                .build() : null)
            .employeeNumber(entity.getEmployeeNumber())
            .hireDate(entity.getHireDate())
            .employmentType(entity.getEmploymentType())
            .employmentStatus(entity.getEmploymentStatus())
            .jobTitle(entity.getJobTitle())
            .department(entity.getDepartment())
            .supervisorName(supervisorName)
            .salary(entity.getSalary())
            .benefitsEligible(entity.getBenefitsEligible())
            .tenureTrack(entity.getTenureTrack())
            .contractStartDate(entity.getContractStartDate())
            .contractEndDate(entity.getContractEndDate())
            .officeLocation(entity.getOfficeLocation())
            .officePhone(entity.getOfficePhone())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .user(entity.getUser() != null ? UserDto.builder()
                .id(entity.getUser().getId())
                .firstName(entity.getUser().getFirstName())
                .lastName(entity.getUser().getLastName())
                .email(entity.getUser().getEmail())
                .phoneNumber(entity.getUser().getPhoneNumber())
                .studentId(entity.getUser().getStudentId())
                .role(entity.getUser().getRole())
                .userType(entity.getUser().getUserType())
                .status(entity.getUser().getStatus())
                .createdAt(entity.getUser().getCreatedAt())
                .updatedAt(entity.getUser().getUpdatedAt())
                .build() : null)
            .build();
    }
    
    public LeaveRequestDto toDto(LeaveRequest entity) {
        if (entity == null) {
            return null;
        }
        
        return LeaveRequestDto.builder()
            .id(entity.getId())
            .employee(entity.getEmployee() != null ? toDto(entity.getEmployee()) : null)
            .startDate(entity.getStartDate())
            .endDate(entity.getEndDate())
            .totalDays(entity.getTotalDays() != null ? entity.getTotalDays().intValue() : null)
            .reason(entity.getReason())
            .status(entity.getStatus())
            .approvedDate(entity.getApprovedDate() != null ? entity.getApprovedDate().toLocalDate() : null)
            .attachmentUrl(entity.getSupportingDocumentUrl())
            .build();
    }
}