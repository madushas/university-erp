package com.university.backend.modules.academic.entity;

public enum PaymentStatus {
    PENDING,
    PAID,
    PARTIALLY_PAID,
    OVERDUE,
    REFUNDED,
    CANCELLED,
    COMPLETED,
    PROCESSING,
    FAILED
}