package com.university.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = SafeInputValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface SafeInput {
    String message() default "Input contains unsafe content";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    
    boolean allowEmojis() default false;
    boolean allowHtml() default false;
}