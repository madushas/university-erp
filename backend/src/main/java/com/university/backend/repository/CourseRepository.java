package com.university.backend.repository;

import com.university.backend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    Optional<Course> findByCode(String code);
    
    boolean existsByCode(String code);
    
    List<Course> findByInstructorContainingIgnoreCase(String instructor);
    
    List<Course> findByTitleContainingIgnoreCase(String title);
    
    @Query("SELECT c FROM Course c WHERE c.credits = :credits")
    List<Course> findByCredits(@Param("credits") Integer credits);
    
    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.registrations WHERE c.id = :id")
    Optional<Course> findByIdWithRegistrations(@Param("id") Long id);
    
    @Query("SELECT c FROM Course c WHERE SIZE(c.registrations) < c.maxStudents")
    List<Course> findAvailableCourses();
}
