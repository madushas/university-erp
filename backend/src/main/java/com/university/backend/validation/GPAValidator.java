package com.university.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.math.BigDecimal;

public class GPAValidator implements ConstraintValidator<ValidGpa, BigDecimal> {

    @Override
    public void initialize(ValidGpa constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(BigDecimal gpa, ConstraintValidatorContext context) {
        if (gpa == null) {
            return true; // Let @NotNull handle null validation
        }
        
        return gpa.compareTo(BigDecimal.ZERO) >= 0 && 
               gpa.compareTo(new BigDecimal("4.0")) <= 0 &&
               gpa.scale() <= 2;
    }
}