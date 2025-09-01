package com.university.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ValidGpaValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidGpa {
    String message() default "GPA must be between 0.0 and 4.0";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}