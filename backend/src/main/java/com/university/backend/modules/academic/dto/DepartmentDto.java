package com.university.backend.modules.academic.dto;

import com.university.backend.modules.core.dto.BaseDto;
import com.university.backend.modules.academic.entity.DepartmentStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class DepartmentDto extends BaseDto {
    private String code;
    private String name;
    private String description;
    private String headOfDepartment;
    private String headEmail;
    private Long headId;
    private String building;
    private String roomNumber;
    private String phoneNumber;
    private String email;
    private String website;
    private BigDecimal budgetAllocation;
    private DepartmentStatus status;
    private Long collegeId;
    private String collegeName; // Calculated field
}