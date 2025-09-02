package com.university.backend.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor to handle request timeouts
 */
@Component
@Slf4j
public class TimeoutInterceptor implements HandlerInterceptor {

    @Value("${app.timeout.request:30000}")
    private long requestTimeout;

    private final ThreadLocal<Long> requestStartTime = new ThreadLocal<>();

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        requestStartTime.set(System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler, @Nullable Exception ex) {
        Long startTime = requestStartTime.get();
        if (startTime != null) {
            long duration = System.currentTimeMillis() - startTime;
            
            if (duration > requestTimeout) {
                log.warn("Request exceeded timeout: {} ms for {} {}", 
                    duration, request.getMethod(), request.getRequestURI());
            }
            
            // Log slow requests (more than half the timeout)
            if (duration > requestTimeout / 2) {
                log.info("Slow request detected: {} ms for {} {}", 
                    duration, request.getMethod(), request.getRequestURI());
            }
            
            requestStartTime.remove();
        }
    }
}