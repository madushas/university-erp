package com.university.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationResultDto {
    private boolean valid;
    private String message;
    private LocalDateTime timestamp;
    private Map<String, List<String>> fieldErrors;
    private List<String> globalErrors;
    
    public static ValidationResultDto success() {
        return ValidationResultDto.builder()
                .valid(true)
                .message("Validation successful")
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static ValidationResultDto failure(String message) {
        return ValidationResultDto.builder()
                .valid(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static ValidationResultDto failure(String message, Map<String, List<String>> fieldErrors) {
        return ValidationResultDto.builder()
                .valid(false)
                .message(message)
                .fieldErrors(fieldErrors)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    // Additional methods for compatibility
    public boolean isValid() {
        return this.valid;
    }
    
    public String getMessage() {
        return this.message;
    }
}