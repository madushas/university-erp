package com.university.backend.validation;

import com.university.backend.util.InputSanitizer;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;

public class SafeInputValidator implements ConstraintValidator<SafeInput, String> {
    
    @Autowired
    private InputSanitizer inputSanitizer;
    
    private boolean allowEmojis;
    private boolean allowHtml;
    
    @Override
    public void initialize(SafeInput constraintAnnotation) {
        this.allowEmojis = constraintAnnotation.allowEmojis();
        this.allowHtml = constraintAnnotation.allowHtml();
    }
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // Let @NotNull handle null validation
        }
        
        // Check for dangerous content
        if (inputSanitizer.containsDangerousContent(value)) {
            return false;
        }
        
        // Check for emojis if not allowed
        if (!allowEmojis && inputSanitizer.containsEmojis(value)) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Input contains emojis which are not allowed")
                   .addConstraintViolation();
            return false;
        }
        
        return true;
    }
}