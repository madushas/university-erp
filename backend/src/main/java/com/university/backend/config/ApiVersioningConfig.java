package com.university.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ApiVersioningConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(new ApiVersionInterceptor())
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api-docs/**", "/swagger-ui/**", "/actuator/**");
    }
}