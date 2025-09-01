package com.university.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
public class ApiVersionInterceptor implements HandlerInterceptor {

    private static final String API_VERSION_HEADER = "X-API-Version";
    private static final String DEFAULT_VERSION = "v1";

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        String apiVersion = request.getHeader(API_VERSION_HEADER);

        if (apiVersion == null || apiVersion.trim().isEmpty()) {
            apiVersion = DEFAULT_VERSION;
        }

        // Add version to request attributes for potential use in controllers
        request.setAttribute("apiVersion", apiVersion);

        // Log API version usage for monitoring
        if (log.isDebugEnabled()) {
            log.debug("API Request - Version: {}, URI: {}", apiVersion, request.getRequestURI());
        }

        return true;
    }
}
