package com.university.backend.config;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Configuration for circuit breaker pattern
 */
@Configuration
public class CircuitBreakerConfig {

    @Value("${app.timeout.circuit-breaker.failure-threshold:5}")
    private int failureThreshold;

    @Value("${app.timeout.circuit-breaker.timeout:10000}")
    private long timeout;

    @Value("${app.timeout.circuit-breaker.reset-timeout:60000}")
    private long resetTimeout;

    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        return CircuitBreakerRegistry.ofDefaults();
    }

    @Bean
    public CircuitBreaker databaseCircuitBreaker(CircuitBreakerRegistry registry) {
        io.github.resilience4j.circuitbreaker.CircuitBreakerConfig config = 
            io.github.resilience4j.circuitbreaker.CircuitBreakerConfig.custom()
                .failureRateThreshold(50.0f)
                .waitDurationInOpenState(Duration.ofMillis(resetTimeout))
                .slidingWindowSize(failureThreshold)
                .minimumNumberOfCalls(3)
                .slowCallRateThreshold(50.0f)
                .slowCallDurationThreshold(Duration.ofMillis(timeout))
                .build();

        return registry.circuitBreaker("database", config);
    }

    @Bean
    public CircuitBreaker externalServiceCircuitBreaker(CircuitBreakerRegistry registry) {
        io.github.resilience4j.circuitbreaker.CircuitBreakerConfig config = 
            io.github.resilience4j.circuitbreaker.CircuitBreakerConfig.custom()
                .failureRateThreshold(60.0f)
                .waitDurationInOpenState(Duration.ofMillis(resetTimeout))
                .slidingWindowSize(failureThreshold)
                .minimumNumberOfCalls(2)
                .slowCallRateThreshold(60.0f)
                .slowCallDurationThreshold(Duration.ofMillis(timeout * 2))
                .build();

        return registry.circuitBreaker("external-service", config);
    }
}