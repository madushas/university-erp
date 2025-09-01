package com.university.backend.config;

import com.university.backend.interceptor.TimeoutInterceptor;
import com.university.backend.interceptor.ValidationInterceptor;
import com.university.backend.interceptor.ResponseConsistencyInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.AsyncSupportConfigurer;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.core.task.AsyncTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuration for request timeouts and async processing
 */
@Configuration
public class TimeoutConfig implements WebMvcConfigurer {

    @Value("${app.timeout.request:30000}")
    private long requestTimeout;

    @Autowired
    private TimeoutInterceptor timeoutInterceptor;
    
    @Autowired
    private ValidationInterceptor validationInterceptor;
    
    @Autowired
    private ResponseConsistencyInterceptor responseConsistencyInterceptor;

    @Override
    public void configureAsyncSupport(AsyncSupportConfigurer configurer) {
        configurer.setDefaultTimeout(requestTimeout);
        configurer.setTaskExecutor(asyncTaskExecutor());
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(timeoutInterceptor);
        registry.addInterceptor(validationInterceptor);
        registry.addInterceptor(responseConsistencyInterceptor);
    }

    @Bean(name = "asyncTaskExecutor")
    public AsyncTaskExecutor asyncTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("AsyncTask-");
        executor.setKeepAliveSeconds(60);
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}