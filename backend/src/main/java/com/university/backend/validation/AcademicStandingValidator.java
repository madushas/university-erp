package com.university.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Arrays;
import java.util.List;

public class AcademicStandingValidator implements ConstraintValidator<ValidAcademicStanding, String> {

    private static final List<String> VALID_STANDINGS = Arrays.asList(
        "GOOD_STANDING", "ACADEMIC_PROBATION", "ACADEMIC_WARNING", 
        "ACADEMIC_SUSPENSION", "ACADEMIC_DISMISSAL", "DEAN_LIST", "HONORS"
    );

    @Override
    public void initialize(ValidAcademicStanding constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(String academicStanding, ConstraintValidatorContext context) {
        if (academicStanding == null || academicStanding.trim().isEmpty()) {
            return true; // Let @NotBlank handle null/empty validation
        }
        
        return VALID_STANDINGS.contains(academicStanding.toUpperCase().trim());
    }
}