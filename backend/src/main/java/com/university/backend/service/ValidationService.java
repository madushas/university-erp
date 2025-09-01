package com.university.backend.service;

import com.university.backend.dto.response.ValidationResultDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for comprehensive input validation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ValidationService {

    private final Validator validator;
    private final BusinessLogicValidationService businessLogicValidationService;

    /**
     * Validate an object using Bean Validation annotations
     */
    public <T> ValidationResultDto validateObject(T object) {
        if (object == null) {
            return ValidationResultDto.failure("Object cannot be null");
        }

        Set<ConstraintViolation<T>> violations = validator.validate(object);
        
        if (violations.isEmpty()) {
            return ValidationResultDto.success();
        }

        Map<String, List<String>> fieldErrors = new HashMap<>();
        List<String> globalErrors = new ArrayList<>();

        for (ConstraintViolation<T> violation : violations) {
            String propertyPath = violation.getPropertyPath().toString();
            String message = violation.getMessage();

            if (propertyPath.isEmpty()) {
                globalErrors.add(message);
            } else {
                fieldErrors.computeIfAbsent(propertyPath, k -> new ArrayList<>()).add(message);
            }
        }

        return ValidationResultDto.builder()
                .valid(false)
                .message("Validation failed")
                .fieldErrors(fieldErrors)
                .globalErrors(globalErrors)
                .timestamp(java.time.LocalDateTime.now())
                .build();
    }

    /**
     * Validate request payload for POST endpoints
     */
    public <T> ValidationResultDto validateCreateRequest(T request) {
        log.debug("Validating create request for: {}", request.getClass().getSimpleName());
        
        ValidationResultDto result = validateObject(request);
        if (!result.isValid()) {
            log.warn("Create request validation failed: {}", result.getMessage());
            return result;
        }

        // Additional business logic validation can be added here
        return performBusinessLogicValidation(request, "CREATE");
    }

    /**
     * Validate request payload for PUT endpoints
     */
    public <T> ValidationResultDto validateUpdateRequest(T request, Long id) {
        log.debug("Validating update request for: {} with ID: {}", request.getClass().getSimpleName(), id);
        
        if (id == null || id <= 0) {
            return ValidationResultDto.failure("Invalid ID for update operation");
        }

        ValidationResultDto result = validateObject(request);
        if (!result.isValid()) {
            log.warn("Update request validation failed: {}", result.getMessage());
            return result;
        }

        return performBusinessLogicValidation(request, "UPDATE");
    }

    /**
     * Validate pagination parameters
     */
    public ValidationResultDto validatePaginationParams(int page, int size) {
        List<String> errors = new ArrayList<>();

        if (page < 0) {
            errors.add("Page number cannot be negative");
        }

        if (size <= 0) {
            errors.add("Page size must be positive");
        }

        if (size > 100) {
            errors.add("Page size cannot exceed 100");
        }

        if (!errors.isEmpty()) {
            return ValidationResultDto.builder()
                    .valid(false)
                    .message("Invalid pagination parameters")
                    .globalErrors(errors)
                    .timestamp(java.time.LocalDateTime.now())
                    .build();
        }

        return ValidationResultDto.success();
    }

    /**
     * Validate search parameters
     */
    public ValidationResultDto validateSearchParams(String query, Integer minLength) {
        List<String> errors = new ArrayList<>();

        if (query == null) {
            errors.add("Search query cannot be null");
        } else {
            String trimmedQuery = query.trim();
            if (trimmedQuery.isEmpty()) {
                errors.add("Search query cannot be empty");
            } else if (minLength != null && trimmedQuery.length() < minLength) {
                errors.add("Search query must be at least " + minLength + " characters long");
            } else if (trimmedQuery.length() > 255) {
                errors.add("Search query cannot exceed 255 characters");
            }
        }

        if (!errors.isEmpty()) {
            return ValidationResultDto.builder()
                    .valid(false)
                    .message("Invalid search parameters")
                    .globalErrors(errors)
                    .timestamp(java.time.LocalDateTime.now())
                    .build();
        }

        return ValidationResultDto.success();
    }

    /**
     * Validate ID parameter
     */
    public ValidationResultDto validateId(Long id, String entityName) {
        if (id == null) {
            return ValidationResultDto.failure(entityName + " ID cannot be null");
        }

        if (id <= 0) {
            return ValidationResultDto.failure(entityName + " ID must be positive");
        }

        return ValidationResultDto.success();
    }

    /**
     * Validate multiple IDs
     */
    public ValidationResultDto validateIds(List<Long> ids, String entityName) {
        if (ids == null || ids.isEmpty()) {
            return ValidationResultDto.failure(entityName + " IDs cannot be null or empty");
        }

        List<String> errors = new ArrayList<>();
        for (int i = 0; i < ids.size(); i++) {
            Long id = ids.get(i);
            if (id == null || id <= 0) {
                errors.add(entityName + " ID at position " + i + " is invalid: " + id);
            }
        }

        if (!errors.isEmpty()) {
            return ValidationResultDto.builder()
                    .valid(false)
                    .message("Invalid " + entityName + " IDs")
                    .globalErrors(errors)
                    .timestamp(java.time.LocalDateTime.now())
                    .build();
        }

        return ValidationResultDto.success();
    }

    /**
     * Validate date range
     */
    public ValidationResultDto validateDateRange(java.time.LocalDate startDate, java.time.LocalDate endDate, String context) {
        try {
            businessLogicValidationService.validateDateRange(startDate, endDate, context);
            return ValidationResultDto.success();
        } catch (IllegalArgumentException e) {
            return ValidationResultDto.failure(e.getMessage());
        }
    }

    /**
     * Perform business logic validation based on operation type
     */
    private <T> ValidationResultDto performBusinessLogicValidation(T request, String operation) {
        try {
            // Add specific business logic validation based on request type
            if (request instanceof com.university.backend.dto.request.CourseRequest) {
                return validateCourseRequest((com.university.backend.dto.request.CourseRequest) request);
            }
            // Add more specific validations as needed
            
            return ValidationResultDto.success();
        } catch (Exception e) {
            log.error("Business logic validation failed for {}: {}", operation, e.getMessage());
            return ValidationResultDto.failure("Business logic validation failed: " + e.getMessage());
        }
    }

    /**
     * Validate course request
     */
    private ValidationResultDto validateCourseRequest(com.university.backend.dto.request.CourseRequest request) {
        List<String> errors = new ArrayList<>();

        try {
            if (request.getCredits() != null) {
                businessLogicValidationService.validateCreditHours(request.getCredits());
            }
        } catch (IllegalArgumentException e) {
            errors.add(e.getMessage());
        }

        if (request.getStartDate() != null && request.getEndDate() != null) {
            try {
                businessLogicValidationService.validateDateRange(request.getStartDate(), request.getEndDate(), "Course");
            } catch (IllegalArgumentException e) {
                errors.add(e.getMessage());
            }
        }

        if (!errors.isEmpty()) {
            return ValidationResultDto.builder()
                    .valid(false)
                    .message("Course validation failed")
                    .globalErrors(errors)
                    .timestamp(java.time.LocalDateTime.now())
                    .build();
        }

        return ValidationResultDto.success();
    }
}