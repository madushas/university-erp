package com.university.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = CreditHoursValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidCreditHours {
    String message() default "Credit hours must be between 0 and 30";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}