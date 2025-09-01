package com.university.backend.interceptor;

import lombok.extern.slf4j.Slf4j;
import org.hibernate.Interceptor;
import org.hibernate.type.Type;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Hibernate interceptor for database query performance monitoring
 */
@Component
@Slf4j
public class DatabaseQueryInterceptor implements Interceptor {

    private final ConcurrentHashMap<String, AtomicLong> queryExecutionCounts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, AtomicLong> queryExecutionTimes = new ConcurrentHashMap<>();
    private final ThreadLocal<Long> queryStartTime = new ThreadLocal<>();

    @Override
    public boolean onLoad(Object entity, Serializable id, Object[] state, String[] propertyNames, Type[] types) {
        recordQueryStart();
        return false;
    }

    @Override
    public boolean onSave(Object entity, Serializable id, Object[] state, String[] propertyNames, Type[] types) {
        recordQueryStart();
        String entityName = entity.getClass().getSimpleName();
        log.debug("Saving entity: {}", entityName);
        return false;
    }

    @Override
    public boolean onFlushDirty(Object entity, Serializable id, Object[] currentState, Object[] previousState, String[] propertyNames, Type[] types) {
        recordQueryStart();
        String entityName = entity.getClass().getSimpleName();
        log.debug("Updating entity: {}", entityName);
        return false;
    }

    @Override
    public void onDelete(Object entity, Serializable id, Object[] state, String[] propertyNames, Type[] types) {
        recordQueryStart();
        String entityName = entity.getClass().getSimpleName();
        log.debug("Deleting entity: {}", entityName);
    }

    @Override
    public void postFlush(java.util.Iterator entities) {
        recordQueryEnd("FLUSH_OPERATION");
    }

    private void recordQueryStart() {
        queryStartTime.set(System.currentTimeMillis());
    }

    private void recordQueryEnd(String operation) {
        Long startTime = queryStartTime.get();
        if (startTime != null) {
            long duration = System.currentTimeMillis() - startTime;
            
            // Record execution count
            queryExecutionCounts.computeIfAbsent(operation, k -> new AtomicLong(0)).incrementAndGet();
            
            // Record execution time
            queryExecutionTimes.computeIfAbsent(operation, k -> new AtomicLong(0)).addAndGet(duration);
            
            // Log slow queries
            if (duration > 1000) { // Log queries taking more than 1 second
                log.warn("Slow database operation detected: {} took {} ms", operation, duration);
            }
            
            // Log query statistics periodically
            long count = queryExecutionCounts.get(operation).get();
            if (count % 100 == 0) { // Log every 100 operations
                long totalTime = queryExecutionTimes.get(operation).get();
                double avgTime = (double) totalTime / count;
                log.info("Database operation stats - {}: {} executions, avg {} ms", 
                        operation, count, Math.round(avgTime * 100.0) / 100.0);
            }
            
            queryStartTime.remove();
        }
    }

    /**
     * Get query execution statistics
     */
    public java.util.Map<String, Object> getQueryStatistics() {
        java.util.Map<String, Object> stats = new ConcurrentHashMap<>();
        
        for (String operation : queryExecutionCounts.keySet()) {
            long count = queryExecutionCounts.get(operation).get();
            long totalTime = queryExecutionTimes.get(operation).get();
            double avgTime = count > 0 ? (double) totalTime / count : 0;
            
            java.util.Map<String, Object> operationStats = new ConcurrentHashMap<>();
            operationStats.put("executionCount", count);
            operationStats.put("totalTime", totalTime);
            operationStats.put("averageTime", Math.round(avgTime * 100.0) / 100.0);
            
            stats.put(operation, operationStats);
        }
        
        return stats;
    }

    /**
     * Reset query statistics
     */
    public void resetStatistics() {
        queryExecutionCounts.clear();
        queryExecutionTimes.clear();
        log.info("Database query statistics reset");
    }
}