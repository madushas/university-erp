package com.university.backend.exception;

public class DepartmentAlreadyExistsException extends RuntimeException {
    public DepartmentAlreadyExistsException(String message) {
        super(message);
    }
    
    public DepartmentAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}
