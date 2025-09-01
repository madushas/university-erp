package com.university.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service to ensure consistent HTTP responses across all endpoints
 */
@Service
@Slf4j
public class ResponseConsistencyService {

    /**
     * Create a consistent response for successful GET operations
     */
    public <T> ResponseEntity<T> createGetResponse(Optional<T> data, String entityName) {
        if (data.isPresent()) {
            log.debug("Found {}: returning 200 OK", entityName);
            return ResponseEntity.ok(data.get());
        } else {
            log.debug("{} not found: returning 404 NOT FOUND", entityName);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create a consistent response for successful GET operations with lists
     */
    public <T> ResponseEntity<List<T>> createGetListResponse(List<T> data, String entityName) {
        if (data == null) {
            log.warn("{} list is null: returning empty list with 200 OK", entityName);
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        
        log.debug("Found {} {}: returning 200 OK", data.size(), entityName);
        return ResponseEntity.ok(data);
    }

    /**
     * Create a consistent response for successful POST operations
     */
    public <T> ResponseEntity<T> createPostResponse(T createdEntity, String entityName) {
        if (createdEntity == null) {
            log.error("Created {} is null: returning 500 INTERNAL SERVER ERROR", entityName);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        
        log.info("Successfully created {}: returning 201 CREATED", entityName);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEntity);
    }

    /**
     * Create a consistent response for successful PUT operations
     */
    public <T> ResponseEntity<T> createPutResponse(T updatedEntity, String entityName) {
        if (updatedEntity == null) {
            log.error("Updated {} is null: returning 500 INTERNAL SERVER ERROR", entityName);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        
        log.info("Successfully updated {}: returning 200 OK", entityName);
        return ResponseEntity.ok(updatedEntity);
    }

    /**
     * Create a consistent response for successful DELETE operations
     */
    public ResponseEntity<Void> createDeleteResponse(String entityName) {
        log.info("Successfully deleted {}: returning 204 NO CONTENT", entityName);
        return ResponseEntity.noContent().build();
    }

    /**
     * Create a consistent response for not implemented endpoints
     */
    public <T> ResponseEntity<T> createNotImplementedResponse(String endpointName) {
        log.warn("Endpoint {} is not implemented: returning 501 NOT IMPLEMENTED", endpointName);
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    /**
     * Create a consistent response for validation errors
     */
    public <T> ResponseEntity<T> createValidationErrorResponse(String errorMessage) {
        log.warn("Validation error: {} - returning 400 BAD REQUEST", errorMessage);
        return ResponseEntity.badRequest().build();
    }

    /**
     * Create a consistent response for authorization errors
     */
    public <T> ResponseEntity<T> createUnauthorizedResponse(String operation) {
        log.warn("Unauthorized access to {}: returning 403 FORBIDDEN", operation);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    /**
     * Create a consistent response for conflict errors
     */
    public <T> ResponseEntity<T> createConflictResponse(String errorMessage) {
        log.warn("Conflict error: {} - returning 409 CONFLICT", errorMessage);
        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }

    /**
     * Create a consistent response for server errors
     */
    public <T> ResponseEntity<T> createServerErrorResponse(String operation, Exception e) {
        log.error("Server error in {}: {} - returning 500 INTERNAL SERVER ERROR", operation, e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    /**
     * Create a consistent response for service unavailable
     */
    public <T> ResponseEntity<T> createServiceUnavailableResponse(String serviceName) {
        log.error("Service {} is unavailable: returning 503 SERVICE UNAVAILABLE", serviceName);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
    }

    /**
     * Create a consistent response for timeout errors
     */
    public <T> ResponseEntity<T> createTimeoutResponse(String operation) {
        log.error("Timeout in {}: returning 408 REQUEST TIMEOUT", operation);
        return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).build();
    }

    /**
     * Validate and normalize HTTP status for response consistency
     */
    public HttpStatus normalizeHttpStatus(HttpStatus status, String operation) {
        if (status == null) {
            log.warn("Null HTTP status for {}: defaulting to 500 INTERNAL SERVER ERROR", operation);
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
        
        // Ensure we don't return inappropriate status codes
        if (status.is1xxInformational()) {
            log.warn("Informational status {} for {}: converting to 200 OK", status, operation);
            return HttpStatus.OK;
        }
        
        return status;
    }

    /**
     * Check if an endpoint should return 501 Not Implemented
     */
    public boolean shouldReturnNotImplemented(String methodName, Object result) {
        // Check for common patterns that indicate not implemented
        if (result == null) {
            return true;
        }
        
        if (result instanceof String) {
            String str = (String) result;
            return str.contains("not implemented") || 
                   str.contains("TODO") || 
                   str.contains("coming soon");
        }
        
        if (result instanceof List) {
            List<?> list = (List<?>) result;
            return list.isEmpty() && methodName.contains("create");
        }
        
        return false;
    }

    /**
     * Ensure proper role-based access control response
     */
    public <T> ResponseEntity<T> validateRoleAccess(String requiredRole, String userRole, String operation) {
        if (userRole == null || userRole.trim().isEmpty()) {
            log.warn("No user role provided for {}: returning 401 UNAUTHORIZED", operation);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        if (!userRole.equals(requiredRole) && !userRole.equals("ADMIN")) {
            log.warn("User role {} insufficient for {} (required: {}): returning 403 FORBIDDEN", 
                    userRole, operation, requiredRole);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return null; // Access granted
    }
}