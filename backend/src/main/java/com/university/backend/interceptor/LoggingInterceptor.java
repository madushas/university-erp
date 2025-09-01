package com.university.backend.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Interceptor for logging HTTP requests and responses
 */
@Component
@Slf4j
public class LoggingInterceptor implements HandlerInterceptor {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String REQUEST_START_TIME = "REQUEST_START_TIME";
    private static final String REQUEST_ID_ATTR = "REQUEST_ID";
    
    // Sensitive headers that should not be logged
    private static final String[] SENSITIVE_HEADERS = {
        "authorization", "cookie", "set-cookie", "x-auth-token", "x-api-key"
    };

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // Generate or extract request ID
        String requestId = request.getHeader(REQUEST_ID_HEADER);
        if (requestId == null || requestId.trim().isEmpty()) {
            requestId = UUID.randomUUID().toString();
        }
        
        // Store request ID and start time
        request.setAttribute(REQUEST_ID_ATTR, requestId);
        request.setAttribute(REQUEST_START_TIME, System.currentTimeMillis());
        
        // Add request ID to response header
        response.setHeader(REQUEST_ID_HEADER, requestId);
        
        // Log incoming request
        logRequest(request, requestId);
        
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                              Object handler, Exception ex) {
        String requestId = (String) request.getAttribute(REQUEST_ID_ATTR);
        Long startTime = (Long) request.getAttribute(REQUEST_START_TIME);
        
        if (startTime != null) {
            long duration = System.currentTimeMillis() - startTime;
            logResponse(request, response, requestId, duration, ex);
        }
    }

    private void logRequest(HttpServletRequest request, String requestId) {
        try {
            Map<String, Object> logData = new HashMap<>();
            logData.put("requestId", requestId);
            logData.put("method", request.getMethod());
            logData.put("uri", request.getRequestURI());
            logData.put("queryString", request.getQueryString());
            logData.put("remoteAddr", getClientIpAddress(request));
            logData.put("userAgent", request.getHeader("User-Agent"));
            logData.put("headers", getFilteredHeaders(request));
            
            // Log request body for POST/PUT requests (if not too large)
            if (shouldLogRequestBody(request)) {
                String requestBody = getRequestBody(request);
                if (requestBody != null && requestBody.length() < 10000) { // Limit to 10KB
                    logData.put("requestBody", requestBody);
                }
            }
            
            log.info("Incoming Request: {}", logData);
        } catch (Exception e) {
            log.warn("Failed to log request for requestId: {}", requestId, e);
        }
    }

    private void logResponse(HttpServletRequest request, HttpServletResponse response, 
                           String requestId, long duration, Exception ex) {
        try {
            Map<String, Object> logData = new HashMap<>();
            logData.put("requestId", requestId);
            logData.put("method", request.getMethod());
            logData.put("uri", request.getRequestURI());
            logData.put("status", response.getStatus());
            logData.put("duration", duration + "ms");
            
            // Add response headers (filtered)
            Map<String, String> responseHeaders = new HashMap<>();
            for (String headerName : response.getHeaderNames()) {
                if (!isSensitiveHeader(headerName)) {
                    responseHeaders.put(headerName, response.getHeader(headerName));
                }
            }
            logData.put("responseHeaders", responseHeaders);
            
            // Log response body for errors or if configured
            if (shouldLogResponseBody(response)) {
                String responseBody = getResponseBody(response);
                if (responseBody != null && responseBody.length() < 10000) { // Limit to 10KB
                    logData.put("responseBody", responseBody);
                }
            }
            
            if (ex != null) {
                logData.put("exception", ex.getClass().getSimpleName());
                logData.put("exceptionMessage", ex.getMessage());
                log.error("Request Failed: {}", logData, ex);
            } else if (response.getStatus() >= 400) {
                log.warn("Request Error: {}", logData);
            } else if (duration > 5000) { // Log slow requests (>5 seconds)
                log.warn("Slow Request: {}", logData);
            } else {
                log.info("Request Completed: {}", logData);
            }
        } catch (Exception e) {
            log.warn("Failed to log response for requestId: {}", requestId, e);
        }
    }

    private Map<String, String> getFilteredHeaders(HttpServletRequest request) {
        Map<String, String> headers = new HashMap<>();
        Enumeration<String> headerNames = request.getHeaderNames();
        
        if (headerNames != null) {
            for (String headerName : Collections.list(headerNames)) {
                if (!isSensitiveHeader(headerName)) {
                    headers.put(headerName, request.getHeader(headerName));
                } else {
                    headers.put(headerName, "[FILTERED]");
                }
            }
        }
        
        return headers;
    }

    private boolean isSensitiveHeader(String headerName) {
        if (headerName == null) return false;
        
        String lowerCaseHeader = headerName.toLowerCase();
        for (String sensitiveHeader : SENSITIVE_HEADERS) {
            if (lowerCaseHeader.contains(sensitiveHeader)) {
                return true;
            }
        }
        return false;
    }

    private boolean shouldLogRequestBody(HttpServletRequest request) {
        String method = request.getMethod();
        String contentType = request.getContentType();
        
        return ("POST".equals(method) || "PUT".equals(method) || "PATCH".equals(method)) &&
               contentType != null && 
               (contentType.contains("application/json") || contentType.contains("application/xml"));
    }

    private boolean shouldLogResponseBody(HttpServletResponse response) {
        int status = response.getStatus();
        String contentType = response.getContentType();
        
        return (status >= 400 || status < 300) && // Log errors and success responses
               contentType != null && 
               (contentType.contains("application/json") || contentType.contains("application/xml"));
    }

    private String getRequestBody(HttpServletRequest request) {
        try {
            if (request instanceof ContentCachingRequestWrapper) {
                ContentCachingRequestWrapper wrapper = (ContentCachingRequestWrapper) request;
                byte[] content = wrapper.getContentAsByteArray();
                if (content.length > 0) {
                    return new String(content, StandardCharsets.UTF_8);
                }
            }
        } catch (Exception e) {
            log.debug("Failed to read request body", e);
        }
        return null;
    }

    private String getResponseBody(HttpServletResponse response) {
        try {
            if (response instanceof ContentCachingResponseWrapper) {
                ContentCachingResponseWrapper wrapper = (ContentCachingResponseWrapper) response;
                byte[] content = wrapper.getContentAsByteArray();
                if (content.length > 0) {
                    return new String(content, StandardCharsets.UTF_8);
                }
            }
        } catch (Exception e) {
            log.debug("Failed to read response body", e);
        }
        return null;
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String[] headerNames = {
            "X-Forwarded-For",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "REMOTE_ADDR"
        };
        
        for (String header : headerNames) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // Handle multiple IPs in X-Forwarded-For
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        }
        
        return request.getRemoteAddr();
    }
}