package com.university.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.lang.reflect.Field;
import java.time.LocalDate;

public class ValidDateRangeValidator implements ConstraintValidator<ValidDateRange, Object> {
    
    private String startDateField;
    private String endDateField;
    
    @Override
    public void initialize(ValidDateRange constraintAnnotation) {
        this.startDateField = constraintAnnotation.startDateField();
        this.endDateField = constraintAnnotation.endDateField();
    }
    
    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }
        
        try {
            Field startField = value.getClass().getDeclaredField(startDateField);
            Field endField = value.getClass().getDeclaredField(endDateField);
            
            startField.setAccessible(true);
            endField.setAccessible(true);
            
            LocalDate startDate = (LocalDate) startField.get(value);
            LocalDate endDate = (LocalDate) endField.get(value);
            
            if (startDate == null || endDate == null) {
                return true; // Let other validators handle null values
            }
            
            // Check if dates are in reasonable range (not too far in past or future)
            LocalDate now = LocalDate.now();
            LocalDate minDate = now.minusYears(10);
            LocalDate maxDate = now.plusYears(10);
            
            if (startDate.isBefore(minDate) || startDate.isAfter(maxDate)) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Start date must be within reasonable range")
                       .addPropertyNode(startDateField)
                       .addConstraintViolation();
                return false;
            }
            
            if (endDate.isBefore(minDate) || endDate.isAfter(maxDate)) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("End date must be within reasonable range")
                       .addPropertyNode(endDateField)
                       .addConstraintViolation();
                return false;
            }
            
            // Check if start date is before end date
            if (startDate.isAfter(endDate)) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Start date must be before end date")
                       .addPropertyNode(startDateField)
                       .addConstraintViolation();
                return false;
            }
            
            return true;
            
        } catch (Exception e) {
            return false;
        }
    }
}