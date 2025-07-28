package com.university.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDate;

public class ValidCourseDateValidator implements ConstraintValidator<ValidCourseDate, LocalDate> {
    
    @Override
    public void initialize(ValidCourseDate constraintAnnotation) {
        // No initialization needed
    }
    
    @Override
    public boolean isValid(LocalDate date, ConstraintValidatorContext context) {
        if (date == null) {
            return true; // Let @NotNull handle null validation
        }
        
        LocalDate now = LocalDate.now();
        LocalDate minDate = now.minusYears(1); // Allow courses from 1 year ago
        LocalDate maxDate = now.plusYears(5);  // Allow courses up to 5 years in future
        
        return !date.isBefore(minDate) && !date.isAfter(maxDate);
    }
}