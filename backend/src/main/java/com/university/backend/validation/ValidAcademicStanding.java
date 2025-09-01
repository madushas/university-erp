package com.university.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = AcademicStandingValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidAcademicStanding {
    String message() default "Invalid academic standing. Valid values are: GOOD_STANDING, ACADEMIC_PROBATION, ACADEMIC_WARNING, ACADEMIC_SUSPENSION, ACADEMIC_DISMISSAL, DEAN_LIST, HONORS";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}