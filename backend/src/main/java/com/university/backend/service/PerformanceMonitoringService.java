package com.university.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Service for monitoring application performance metrics
 */
@Service
@Slf4j
public class PerformanceMonitoringService {

    private final Map<String, AtomicLong> requestCounts = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> totalResponseTimes = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> maxResponseTimes = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> errorCounts = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> slowRequestCounts = new ConcurrentHashMap<>();

    private static final long SLOW_REQUEST_THRESHOLD = 5000; // 5 seconds

    /**
     * Record a request with its response time
     */
    public void recordRequest(String endpoint, long responseTimeMs, boolean isError) {
        String key = normalizeEndpoint(endpoint);
        
        // Increment request count
        requestCounts.computeIfAbsent(key, k -> new AtomicLong(0)).incrementAndGet();
        
        // Record response time
        totalResponseTimes.computeIfAbsent(key, k -> new AtomicLong(0)).addAndGet(responseTimeMs);
        
        // Update max response time
        maxResponseTimes.computeIfAbsent(key, k -> new AtomicLong(0))
                .updateAndGet(current -> Math.max(current, responseTimeMs));
        
        // Record errors
        if (isError) {
            errorCounts.computeIfAbsent(key, k -> new AtomicLong(0)).incrementAndGet();
        }
        
        // Record slow requests
        if (responseTimeMs > SLOW_REQUEST_THRESHOLD) {
            slowRequestCounts.computeIfAbsent(key, k -> new AtomicLong(0)).incrementAndGet();
            log.warn("Slow request detected: {} took {} ms", endpoint, responseTimeMs);
        }
        
        // Log performance metrics periodically
        long requestCount = requestCounts.get(key).get();
        if (requestCount % 100 == 0) { // Log every 100 requests
            logPerformanceMetrics(key);
        }
    }

    /**
     * Get performance metrics for an endpoint
     */
    public Map<String, Object> getMetrics(String endpoint) {
        String key = normalizeEndpoint(endpoint);
        
        long requests = requestCounts.getOrDefault(key, new AtomicLong(0)).get();
        long totalTime = totalResponseTimes.getOrDefault(key, new AtomicLong(0)).get();
        long maxTime = maxResponseTimes.getOrDefault(key, new AtomicLong(0)).get();
        long errors = errorCounts.getOrDefault(key, new AtomicLong(0)).get();
        long slowRequests = slowRequestCounts.getOrDefault(key, new AtomicLong(0)).get();
        
        double avgResponseTime = requests > 0 ? (double) totalTime / requests : 0;
        double errorRate = requests > 0 ? (double) errors / requests * 100 : 0;
        double slowRequestRate = requests > 0 ? (double) slowRequests / requests * 100 : 0;
        
        Map<String, Object> metrics = new ConcurrentHashMap<>();
        metrics.put("endpoint", endpoint);
        metrics.put("totalRequests", requests);
        metrics.put("averageResponseTime", Math.round(avgResponseTime * 100.0) / 100.0);
        metrics.put("maxResponseTime", maxTime);
        metrics.put("errorCount", errors);
        metrics.put("errorRate", Math.round(errorRate * 100.0) / 100.0);
        metrics.put("slowRequestCount", slowRequests);
        metrics.put("slowRequestRate", Math.round(slowRequestRate * 100.0) / 100.0);
        metrics.put("lastUpdated", LocalDateTime.now());
        
        return metrics;
    }

    /**
     * Get all performance metrics
     */
    public Map<String, Map<String, Object>> getAllMetrics() {
        Map<String, Map<String, Object>> allMetrics = new ConcurrentHashMap<>();
        
        for (String endpoint : requestCounts.keySet()) {
            allMetrics.put(endpoint, getMetrics(endpoint));
        }
        
        return allMetrics;
    }

    /**
     * Get system-wide performance summary
     */
    public Map<String, Object> getSystemSummary() {
        long totalRequests = requestCounts.values().stream()
                .mapToLong(AtomicLong::get)
                .sum();
        
        long totalErrors = errorCounts.values().stream()
                .mapToLong(AtomicLong::get)
                .sum();
        
        long totalSlowRequests = slowRequestCounts.values().stream()
                .mapToLong(AtomicLong::get)
                .sum();
        
        double systemErrorRate = totalRequests > 0 ? (double) totalErrors / totalRequests * 100 : 0;
        double systemSlowRequestRate = totalRequests > 0 ? (double) totalSlowRequests / totalRequests * 100 : 0;
        
        Map<String, Object> summary = new ConcurrentHashMap<>();
        summary.put("totalRequests", totalRequests);
        summary.put("totalErrors", totalErrors);
        summary.put("systemErrorRate", Math.round(systemErrorRate * 100.0) / 100.0);
        summary.put("totalSlowRequests", totalSlowRequests);
        summary.put("systemSlowRequestRate", Math.round(systemSlowRequestRate * 100.0) / 100.0);
        summary.put("activeEndpoints", requestCounts.size());
        summary.put("timestamp", LocalDateTime.now());
        
        return summary;
    }

    /**
     * Reset metrics for an endpoint
     */
    public void resetMetrics(String endpoint) {
        String key = normalizeEndpoint(endpoint);
        
        requestCounts.remove(key);
        totalResponseTimes.remove(key);
        maxResponseTimes.remove(key);
        errorCounts.remove(key);
        slowRequestCounts.remove(key);
        
        log.info("Reset performance metrics for endpoint: {}", endpoint);
    }

    /**
     * Reset all metrics
     */
    public void resetAllMetrics() {
        requestCounts.clear();
        totalResponseTimes.clear();
        maxResponseTimes.clear();
        errorCounts.clear();
        slowRequestCounts.clear();
        
        log.info("Reset all performance metrics");
    }

    /**
     * Check if an endpoint is performing poorly
     */
    public boolean isEndpointPerformingPoorly(String endpoint) {
        Map<String, Object> metrics = getMetrics(endpoint);
        
        double avgResponseTime = (Double) metrics.get("averageResponseTime");
        double errorRate = (Double) metrics.get("errorRate");
        double slowRequestRate = (Double) metrics.get("slowRequestRate");
        
        return avgResponseTime > 3000 || // Average response time > 3 seconds
               errorRate > 5.0 ||         // Error rate > 5%
               slowRequestRate > 10.0;    // Slow request rate > 10%
    }

    /**
     * Get list of poorly performing endpoints
     */
    public java.util.List<String> getPoorlyPerformingEndpoints() {
        return requestCounts.keySet().stream()
                .filter(this::isEndpointPerformingPoorly)
                .collect(java.util.stream.Collectors.toList());
    }

    private String normalizeEndpoint(String endpoint) {
        if (endpoint == null) {
            return "unknown";
        }
        
        // Remove query parameters
        int queryIndex = endpoint.indexOf('?');
        if (queryIndex > 0) {
            endpoint = endpoint.substring(0, queryIndex);
        }
        
        // Replace path variables with placeholders
        endpoint = endpoint.replaceAll("/\\d+", "/{id}");
        endpoint = endpoint.replaceAll("/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}", "/{uuid}");
        
        return endpoint;
    }

    private void logPerformanceMetrics(String endpoint) {
        Map<String, Object> metrics = getMetrics(endpoint);
        
        log.info("Performance metrics for {}: {} requests, avg {}ms, max {}ms, {}% errors, {}% slow", 
                endpoint,
                metrics.get("totalRequests"),
                metrics.get("averageResponseTime"),
                metrics.get("maxResponseTime"),
                metrics.get("errorRate"),
                metrics.get("slowRequestRate"));
    }
}