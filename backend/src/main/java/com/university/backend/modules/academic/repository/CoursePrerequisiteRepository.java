package com.university.backend.modules.academic.repository;

import com.university.backend.modules.academic.entity.CoursePrerequisite;
import com.university.backend.modules.academic.entity.PrerequisiteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoursePrerequisiteRepository extends JpaRepository<CoursePrerequisite, Long> {
    
    /**
     * Find all prerequisites for a specific course
     */
    List<CoursePrerequisite> findByCourseId(Long courseId);
    
    /**
     * Find all prerequisites of a specific type for a course
     */
    List<CoursePrerequisite> findByCourseIdAndPrerequisiteType(Long courseId, PrerequisiteType prerequisiteType);
    
    /**
     * Find all required prerequisites for a course
     */
    @Query("SELECT cp FROM CoursePrerequisite cp WHERE cp.course.id = :courseId AND cp.prerequisiteType = 'REQUIRED'")
    List<CoursePrerequisite> findRequiredPrerequisitesByCourseId(@Param("courseId") Long courseId);
    
    /**
     * Find all courses that have a specific course as prerequisite
     */
    List<CoursePrerequisite> findByPrerequisiteCourseId(Long prerequisiteCourseId);
    
    /**
     * Check if a specific prerequisite relationship exists
     */
    boolean existsByCourseIdAndPrerequisiteCourseId(Long courseId, Long prerequisiteCourseId);
    
    /**
     * Find prerequisites with details
     */
    @Query("SELECT cp FROM CoursePrerequisite cp " +
           "JOIN FETCH cp.course c " +
           "JOIN FETCH cp.prerequisiteCourse pc " +
           "WHERE cp.course.id = :courseId")
    List<CoursePrerequisite> findByCourseIdWithDetails(@Param("courseId") Long courseId);
}