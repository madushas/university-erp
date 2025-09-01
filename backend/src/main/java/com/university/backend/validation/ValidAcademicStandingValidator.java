package com.university.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Arrays;
import java.util.List;

/**
 * Validator for academic standing values
 */
public class ValidAcademicStandingValidator implements ConstraintValidator<ValidAcademicStanding, String> {
    
    private static final List<String> VALID_STANDINGS = Arrays.asList(
        "GOOD_STANDING", 
        "DEANS_LIST", 
        "ACADEMIC_PROBATION", 
        "ACADEMIC_DISMISSAL",
        "PROBATION",
        "SUSPENDED"
    );
    
    @Override
    public void initialize(ValidAcademicStanding constraintAnnotation) {
        // No initialization needed
    }
    
    @Override
    public boolean isValid(String standing, ConstraintValidatorContext context) {
        if (standing == null || standing.trim().isEmpty()) {
            return true; // Let @NotNull/@NotBlank handle null/empty validation
        }
        
        return VALID_STANDINGS.contains(standing.trim().toUpperCase());
    }
}