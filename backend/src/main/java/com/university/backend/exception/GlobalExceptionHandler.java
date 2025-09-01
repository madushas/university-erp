package com.university.backend.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.QueryTimeoutException;
import org.springframework.transaction.CannotCreateTransactionException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, WebRequest request) {
        log.warn("Access denied: {}", ex.getMessage());
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.FORBIDDEN.value())
                .error("Forbidden")
                .message("Access denied. You don't have permission to access this resource.")
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleUserAlreadyExists(UserAlreadyExistsException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Conflict")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(CourseNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleCourseNotFound(CourseNotFoundException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(RegistrationNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleRegistrationNotFound(RegistrationNotFoundException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(CourseFullException.class)
    public ResponseEntity<ErrorResponse> handleCourseFull(CourseFullException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DuplicateRegistrationException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateRegistration(DuplicateRegistrationException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Conflict")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(CourseAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleCourseAlreadyExists(CourseAlreadyExistsException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Conflict")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(PrerequisiteNotMetException.class)
    public ResponseEntity<ErrorResponse> handlePrerequisiteNotMet(PrerequisiteNotMetException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ScheduleConflictException.class)
    public ResponseEntity<ErrorResponse> handleScheduleConflict(ScheduleConflictException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Conflict")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(CourseNotAvailableException.class)
    public ResponseEntity<ErrorResponse> handleCourseNotAvailable(CourseNotAvailableException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUsernameNotFound(UsernameNotFoundException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error("Unauthorized")
                .message("Invalid username or password")
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ValidationErrorResponse errorResponse = ValidationErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .message("Invalid input data")
                .path(request.getDescription(false).replace("uri=", ""))
                .validationErrors(errors)
                .build();
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, WebRequest request) {
        log.error("Unexpected error occurred", ex);
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("An unexpected error occurred")
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(DepartmentAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleDepartmentAlreadyExists(DepartmentAlreadyExistsException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Conflict")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(DepartmentNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleDepartmentNotFound(DepartmentNotFoundException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFound(NoResourceFoundException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message("The requested resource was not found")
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException ex, WebRequest request) {
        String message = "Invalid request body";
        if (ex.getMessage().contains("Required request body is missing")) {
            message = "Request body is required";
        } else if (ex.getMessage().contains("JSON parse error")) {
            message = "Invalid JSON format";
        } else if (ex.getMessage().contains("Cannot deserialize value")) {
            message = "Invalid data format";
        }
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(message)
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParams(MissingServletRequestParameterException ex, WebRequest request) {
        String message = String.format("Required request parameter '%s' is missing", ex.getParameterName());
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(message)
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex, WebRequest request) {
        Class<?> requiredTypeClass = ex.getRequiredType();
        String requiredType = requiredTypeClass != null ? requiredTypeClass.getSimpleName() : "unknown";
        String message = String.format("Invalid value '%s' for parameter '%s'. Expected type: %s", 
                ex.getValue(), ex.getName(), requiredType);
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(message)
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex, WebRequest request) {
        String message = "Data integrity violation occurred";
        
        // Extract more meaningful message from the exception
        if (ex.getMessage() != null) {
            if (ex.getMessage().contains("not-null")) {
                message = "Required field is missing";
            } else if (ex.getMessage().contains("unique")) {
                message = "Duplicate entry - record already exists";
            } else if (ex.getMessage().contains("foreign key")) {
                message = "Referenced record does not exist";
            }
        }
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(message)
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(TimeoutException.class)
    public ResponseEntity<ErrorResponse> handleTimeout(TimeoutException ex, WebRequest request) {
        log.error("Request timeout occurred: {}", ex.getMessage());
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.REQUEST_TIMEOUT.value())
                .error("Request Timeout")
                .message("The request took too long to process. Please try again.")
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.REQUEST_TIMEOUT);
    }

    @ExceptionHandler(QueryTimeoutException.class)
    public ResponseEntity<ErrorResponse> handleQueryTimeout(QueryTimeoutException ex, WebRequest request) {
        log.error("Database query timeout occurred: {}", ex.getMessage());
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.REQUEST_TIMEOUT.value())
                .error("Database Timeout")
                .message("Database query took too long to execute. Please try again.")
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.REQUEST_TIMEOUT);
    }

    @ExceptionHandler(CannotCreateTransactionException.class)
    public ResponseEntity<ErrorResponse> handleCannotCreateTransaction(CannotCreateTransactionException ex, WebRequest request) {
        log.error("Cannot create database transaction: {}", ex.getMessage());
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.SERVICE_UNAVAILABLE.value())
                .error("Service Unavailable")
                .message("Database service is temporarily unavailable. Please try again later.")
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.SERVICE_UNAVAILABLE);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex, WebRequest request) {
        log.error("Illegal state: {}", ex.getMessage());
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Business Rule Violation")
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ErrorResponse> handleSecurity(SecurityException ex, WebRequest request) {
        log.error("Security exception: {}", ex.getMessage());
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.FORBIDDEN.value())
                .error("Access Denied")
                .message("You do not have permission to access this resource")
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(org.springframework.web.HttpRequestMethodNotSupportedException ex, WebRequest request) {
        log.error("Method not supported: {}", ex.getMessage());
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.METHOD_NOT_ALLOWED.value())
                .error("Method Not Allowed")
                .message("HTTP method " + ex.getMethod() + " is not supported for this endpoint")
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.METHOD_NOT_ALLOWED);
    }

    @ExceptionHandler(org.springframework.dao.DuplicateKeyException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateKey(org.springframework.dao.DuplicateKeyException ex, WebRequest request) {
        log.error("Duplicate key violation: {}", ex.getMessage());
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Duplicate Entry")
                .message("A record with this information already exists")
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(org.springframework.dao.EmptyResultDataAccessException.class)
    public ResponseEntity<ErrorResponse> handleEmptyResult(org.springframework.dao.EmptyResultDataAccessException ex, WebRequest request) {
        log.error("Empty result: {}", ex.getMessage());
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message("The requested resource was not found")
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
    public ResponseEntity<ValidationErrorResponse> handleConstraintViolation(jakarta.validation.ConstraintViolationException ex, WebRequest request) {
        log.error("Constraint violation: {}", ex.getMessage());
        
        Map<String, String> validationErrors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            validationErrors.put(fieldName, errorMessage);
        });
        
        ValidationErrorResponse errorResponse = ValidationErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .message("Request validation failed")
                .path(request.getDescription(false).replace("uri=", ""))
                .validationErrors(validationErrors)
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex, WebRequest request) {
        log.error("Runtime exception occurred: {}", ex.getMessage(), ex);
        
        // Check if it's a business logic exception with a meaningful message
        String message = ex.getMessage();
        if (message != null && !message.isEmpty()) {
            ErrorResponse errorResponse = ErrorResponse.builder()
                    .timestamp(LocalDateTime.now())
                    .status(HttpStatus.BAD_REQUEST.value())
                    .error("Business Logic Error")
                    .message(message)
                    .path(request.getDescription(false).replace("uri=", ""))
                    .build();
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
        
        // Generic runtime exception
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("An unexpected error occurred")
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
