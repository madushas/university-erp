package com.university.backend.dto.request;

import com.university.backend.modules.academic.entity.DepartmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDepartmentRequest {
    @NotBlank(message = "Department name is required")
    @Size(min = 2, max = 100, message = "Department name must be between 2 and 100 characters")
    private String name;
    
    @NotBlank(message = "Department code is required")
    @Size(min = 2, max = 10, message = "Department code must be between 2 and 10 characters")
    private String code;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
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
}
