package com.university.backend.interceptor;

import com.university.backend.service.PerformanceMonitoringService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor for performance monitoring
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PerformanceMonitoringInterceptor implements HandlerInterceptor {

    private final PerformanceMonitoringService performanceMonitoringService;
    
    private static final String PERFORMANCE_START_TIME = "PERFORMANCE_START_TIME";

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        request.setAttribute(PERFORMANCE_START_TIME, System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, 
                              @NonNull Object handler, @Nullable Exception ex) {
        Long startTime = (Long) request.getAttribute(PERFORMANCE_START_TIME);
        
        if (startTime != null) {
            long duration = System.currentTimeMillis() - startTime;
            String endpoint = request.getMethod() + " " + request.getRequestURI();
            boolean isError = response.getStatus() >= 400 || ex != null;
            
            // Record performance metrics
            performanceMonitoringService.recordRequest(endpoint, duration, isError);
            
            // Log database query performance if available
            logDatabasePerformance(request, duration);
        }
    }
    
    private void logDatabasePerformance(HttpServletRequest request, long totalDuration) {
        // This could be enhanced to track actual database query times
        // For now, we'll estimate based on total request time
        if (totalDuration > 1000) { // If request took more than 1 second
            String endpoint = request.getMethod() + " " + request.getRequestURI();
            log.warn("Potentially slow database queries detected for endpoint: {} (total time: {}ms)", 
                    endpoint, totalDuration);
        }
    }
}