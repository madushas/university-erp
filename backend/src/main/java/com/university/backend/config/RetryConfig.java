package com.university.backend.config;

import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.concurrent.TimeoutException;

/**
 * Configuration for retry pattern with exponential backoff
 */
@Configuration
public class RetryConfig {

    @Bean
    public RetryRegistry retryRegistry() {
        return RetryRegistry.ofDefaults();
    }

    @Bean
    public Retry databaseRetry(RetryRegistry registry) {
        io.github.resilience4j.retry.RetryConfig config = 
            io.github.resilience4j.retry.RetryConfig.custom()
                .maxAttempts(3)
                .waitDuration(Duration.ofMillis(500))
                .retryOnException(throwable -> 
                    throwable instanceof TimeoutException ||
                    throwable instanceof org.springframework.dao.QueryTimeoutException ||
                    throwable instanceof org.springframework.transaction.CannotCreateTransactionException
                )
                .build();

        return registry.retry("database", config);
    }

    @Bean
    public Retry externalServiceRetry(RetryRegistry registry) {
        io.github.resilience4j.retry.RetryConfig config = 
            io.github.resilience4j.retry.RetryConfig.custom()
                .maxAttempts(2)
                .waitDuration(Duration.ofMillis(1000))
                .retryOnException(throwable -> 
                    throwable instanceof TimeoutException ||
                    throwable instanceof java.net.SocketTimeoutException ||
                    throwable instanceof java.net.ConnectException
                )
                .build();

        return registry.retry("external-service", config);
    }
}