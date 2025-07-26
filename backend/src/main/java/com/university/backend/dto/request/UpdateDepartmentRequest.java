package com.university.backend.dto.request;

import jakarta.validation.constraints.Size;

public class UpdateDepartmentRequest {
    @Size(min = 2, max = 100, message = "Department name must be between 2 and 100 characters")
    private String name;
    
    @Size(min = 2, max = 10, message = "Department code must be between 2 and 10 characters")
    private String code;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    private String headOfDepartment;
    private String status;
    
    // Constructors
    public UpdateDepartmentRequest() {}
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getHeadOfDepartment() { return headOfDepartment; }
    public void setHeadOfDepartment(String headOfDepartment) { this.headOfDepartment = headOfDepartment; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
