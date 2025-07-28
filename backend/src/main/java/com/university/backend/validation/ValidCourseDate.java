package com.university.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = ValidCourseDateValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidCourseDate {
    String message() default "Course date must be within reasonable academic range";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}