package com.university.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CreditHoursValidator implements ConstraintValidator<ValidCreditHours, Integer> {

    @Override
    public void initialize(ValidCreditHours constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(Integer creditHours, ConstraintValidatorContext context) {
        if (creditHours == null) {
            return true; // Let @NotNull handle null validation
        }
        
        return creditHours >= 0 && creditHours <= 30;
    }
}