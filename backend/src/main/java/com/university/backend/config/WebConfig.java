package com.university.backend.config;

import com.university.backend.interceptor.LoggingInterceptor;
import com.university.backend.interceptor.PerformanceMonitoringInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web configuration for registering interceptors
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final LoggingInterceptor loggingInterceptor;
    private final PerformanceMonitoringInterceptor performanceMonitoringInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Add performance monitoring interceptor first
        registry.addInterceptor(performanceMonitoringInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                    "/api/health/**",
                    "/api/auth/login",
                    "/actuator/**"
                );

        // Add logging interceptor
        registry.addInterceptor(loggingInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                    "/api/health/live",
                    "/api/health/ready",
                    "/actuator/**"
                );
    }
}