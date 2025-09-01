package com.university.backend.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor to ensure response consistency across all endpoints
 */
@Component
@Slf4j
public class ResponseConsistencyInterceptor implements HandlerInterceptor {

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                               Object handler, Exception ex) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        int status = response.getStatus();
        
        // Log responses that might indicate inconsistency
        if (status == 0) {
            log.warn("No response status set for {} {}: this may indicate an incomplete endpoint", method, uri);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        
        // Check for common inconsistency patterns
        if (isApiEndpoint(uri)) {
            validateApiResponseConsistency(method, uri, status);
        }
        
        // Add standard headers for consistency
        if (!response.containsHeader("Content-Type") && status != HttpServletResponse.SC_NO_CONTENT) {
            response.setHeader("Content-Type", "application/json");
        }
        
        // Add cache control headers for GET requests
        if ("GET".equals(method) && !response.containsHeader("Cache-Control")) {
            if (uri.contains("/health") || uri.contains("/status")) {
                response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            } else {
                response.setHeader("Cache-Control", "public, max-age=300"); // 5 minutes
            }
        }
    }

    private boolean isApiEndpoint(String uri) {
        return uri.startsWith("/api/");
    }

    private void validateApiResponseConsistency(String method, String uri, int status) {
        switch (method) {
            case "GET":
                if (status != 200 && status != 404 && status != 400 && status != 403 && status != 500) {
                    log.warn("Unusual status {} for GET {}: consider using standard status codes", status, uri);
                }
                break;
            case "POST":
                if (status != 201 && status != 400 && status != 409 && status != 403 && status != 500) {
                    log.warn("Unusual status {} for POST {}: consider using 201 for successful creation", status, uri);
                }
                break;
            case "PUT":
                if (status != 200 && status != 404 && status != 400 && status != 403 && status != 500) {
                    log.warn("Unusual status {} for PUT {}: consider using 200 for successful update", status, uri);
                }
                break;
            case "DELETE":
                if (status != 204 && status != 404 && status != 403 && status != 500) {
                    log.warn("Unusual status {} for DELETE {}: consider using 204 for successful deletion", status, uri);
                }
                break;
            case "PATCH":
                if (status != 200 && status != 404 && status != 400 && status != 403 && status != 500) {
                    log.warn("Unusual status {} for PATCH {}: consider using 200 for successful partial update", status, uri);
                }
                break;
        }
        
        // Check for endpoints that might not be implemented
        if (status == 501) {
            log.info("Endpoint {} {} returns 501 NOT IMPLEMENTED - this is correct for incomplete endpoints", method, uri);
        }
        
        // Warn about generic 500 errors that might need better handling
        if (status == 500) {
            log.warn("Internal server error for {} {}: consider more specific error handling", method, uri);
        }
    }
}