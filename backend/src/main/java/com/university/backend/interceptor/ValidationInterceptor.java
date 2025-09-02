package com.university.backend.interceptor;

import com.university.backend.dto.response.ValidationResultDto;
import com.university.backend.service.ValidationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor to perform automatic validation on requests
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ValidationInterceptor implements HandlerInterceptor {

    private final ValidationService validationService;

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        
        log.debug("Validating request: {} {}", method, uri);
        
        // Validate pagination parameters for GET requests
        if ("GET".equals(method) && hasPageParams(request)) {
            ValidationResultDto result = validatePaginationParams(request);
            if (!result.isValid()) {
                log.warn("Pagination validation failed for {}: {}", uri, result.getMessage());
                // Could set error attributes here for controller to handle
                request.setAttribute("validationError", result);
            }
        }
        
        // Validate search parameters
        if ("GET".equals(method) && hasSearchParams(request)) {
            ValidationResultDto result = validateSearchParams(request);
            if (!result.isValid()) {
                log.warn("Search validation failed for {}: {}", uri, result.getMessage());
                request.setAttribute("validationError", result);
            }
        }
        
        return true; // Continue processing
    }

    private boolean hasPageParams(HttpServletRequest request) {
        return request.getParameter("page") != null || request.getParameter("size") != null;
    }

    private boolean hasSearchParams(HttpServletRequest request) {
        return request.getParameter("query") != null || 
               request.getParameter("search") != null ||
               request.getParameter("q") != null;
    }

    private ValidationResultDto validatePaginationParams(HttpServletRequest request) {
        try {
            int page = Integer.parseInt(request.getParameter("page") != null ? 
                request.getParameter("page") : "0");
            int size = Integer.parseInt(request.getParameter("size") != null ? 
                request.getParameter("size") : "10");
            
            return validationService.validatePaginationParams(page, size);
        } catch (NumberFormatException e) {
            return ValidationResultDto.failure("Invalid pagination parameters: " + e.getMessage());
        }
    }

    private ValidationResultDto validateSearchParams(HttpServletRequest request) {
        String query = request.getParameter("query");
        if (query == null) {
            query = request.getParameter("search");
        }
        if (query == null) {
            query = request.getParameter("q");
        }
        
        return validationService.validateSearchParams(query, 2);
    }
}