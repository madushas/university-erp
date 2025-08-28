package com.university.backend.modules.academic.entity;

/**
 * Enumeration for different types of course prerequisites
 */
public enum PrerequisiteType {
    /**
     * Required prerequisite - must be completed before enrollment
     */
    REQUIRED,
    
    /**
     * Recommended prerequisite - suggested but not mandatory
     */
    RECOMMENDED,
    
    /**
     * Corequisite - must be taken concurrently or previously completed
     */
    COREQUISITE
}