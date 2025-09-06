package com.university.backend.modules.core.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorDto {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String department;
    private String employeeId;
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
