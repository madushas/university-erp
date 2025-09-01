package com.university.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator for credit hours (non-negative values)
 */
public class ValidCreditHoursValidator implements ConstraintValidator<ValidCreditHours, Integer> {
    
    @Override
    public void initialize(ValidCreditHours constraintAnnotation) {
        // No initialization needed
    }
    
    @Override
    public boolean isValid(Integer credits, ConstraintValidatorContext context) {
        if (credits == null) {
            return true; // Let @NotNull handle null validation
        }
        
        return credits >= 0;
    }
}