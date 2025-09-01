package com.university.backend.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;

/**
 * Filter to wrap requests and responses for content caching
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class ContentCachingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        // Skip wrapping for certain paths
        if (shouldSkipWrapping(request)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Wrap request and response for content caching
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);
        
        try {
            filterChain.doFilter(wrappedRequest, wrappedResponse);
        } finally {
            // Copy cached content to actual response
            wrappedResponse.copyBodyToResponse();
        }
    }
    
    private boolean shouldSkipWrapping(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String contentType = request.getContentType();
        
        // Skip for static resources
        if (uri.contains("/static/") || uri.contains("/css/") || uri.contains("/js/") || 
            uri.contains("/images/") || uri.contains("/favicon.ico")) {
            return true;
        }
        
        // Skip for actuator endpoints (except health)
        if (uri.startsWith("/actuator/") && !uri.startsWith("/actuator/health")) {
            return true;
        }
        
        // Skip for file uploads
        if (contentType != null && contentType.startsWith("multipart/")) {
            return true;
        }
        
        // Skip for large content
        String contentLength = request.getHeader("Content-Length");
        if (contentLength != null) {
            try {
                long length = Long.parseLong(contentLength);
                if (length > 1024 * 1024) { // Skip if larger than 1MB
                    return true;
                }
            } catch (NumberFormatException e) {
                // Ignore parsing errors
            }
        }
        
        return false;
    }
}