package com.university.backend.exception;

public class CourseNotAvailableException extends RuntimeException {
    public CourseNotAvailableException(String message) {
        super(message);
    }
    
    public CourseNotAvailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
