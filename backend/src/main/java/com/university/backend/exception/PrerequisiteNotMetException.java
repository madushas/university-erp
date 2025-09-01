package com.university.backend.exception;

public class PrerequisiteNotMetException extends RuntimeException {
    public PrerequisiteNotMetException(String message) {
        super(message);
    }
    
    public PrerequisiteNotMetException(String message, Throwable cause) {
        super(message, cause);
    }
}
