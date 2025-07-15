package com.university.backend.repository;

import com.university.backend.entity.Registration;
import com.university.backend.entity.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    
    List<Registration> findByUserId(Long userId);
    
    List<Registration> findByCourseId(Long courseId);
    
    List<Registration> findByStatus(RegistrationStatus status);
    
    Optional<Registration> findByUserIdAndCourseId(Long userId, Long courseId);
    
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
    
    @Query("SELECT r FROM Registration r JOIN FETCH r.user JOIN FETCH r.course WHERE r.user.id = :userId")
    List<Registration> findByUserIdWithDetails(@Param("userId") Long userId);
    
    @Query("SELECT r FROM Registration r JOIN FETCH r.user JOIN FETCH r.course WHERE r.course.id = :courseId")
    List<Registration> findByCourseIdWithDetails(@Param("courseId") Long courseId);
    
    @Query("SELECT COUNT(r) FROM Registration r WHERE r.course.id = :courseId AND r.status = 'ENROLLED'")
    Long countEnrolledStudentsByCourseId(@Param("courseId") Long courseId);
}
