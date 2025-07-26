package com.university.backend.repository;

import com.university.backend.entity.Course;
import com.university.backend.entity.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    Optional<Course> findByCode(String code);
    
    boolean existsByCode(String code);
    
    List<Course> findByInstructorContainingIgnoreCase(String instructor);
    
    List<Course> findByTitleContainingIgnoreCase(String title);
    
    List<Course> findByDepartment(String department);
    
    List<Course> findByStatus(CourseStatus status);
    
    List<Course> findByCourseLevel(String courseLevel);
    
    @Query("SELECT c FROM Course c WHERE c.credits = :credits")
    List<Course> findByCredits(@Param("credits") Integer credits);
    
    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.registrations WHERE c.id = :id")
    Optional<Course> findByIdWithRegistrations(@Param("id") Long id);
    
    @Query("SELECT c FROM Course c WHERE SIZE(c.registrations) < c.maxStudents AND c.status = 'ACTIVE'")
    List<Course> findAvailableCourses();
    
    @Query("SELECT c FROM Course c WHERE c.department = :department AND c.status = 'ACTIVE'")
    List<Course> findActiveCoursesByDepartment(@Param("department") String department);
    
    @Query("SELECT c FROM Course c WHERE c.courseFee BETWEEN :minFee AND :maxFee")
    List<Course> findCoursesByFeeRange(@Param("minFee") BigDecimal minFee, @Param("maxFee") BigDecimal maxFee);
    
    @Query("SELECT c FROM Course c WHERE c.startDate >= :startDate AND c.endDate <= :endDate")
    List<Course> findCoursesByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT c FROM Course c WHERE c.daysOfWeek LIKE %:day%")
    List<Course> findCoursesByDayOfWeek(@Param("day") String day);
    
    @Query("SELECT c FROM Course c WHERE c.instructor = :instructor AND c.status = 'ACTIVE'")
    List<Course> findActiveCoursesByInstructor(@Param("instructor") String instructor);
    
    @Query("SELECT c FROM Course c WHERE c.prerequisites IS NULL OR c.prerequisites = ''")
    List<Course> findCoursesWithoutPrerequisites();
    
    @Query("SELECT c FROM Course c WHERE c.prerequisites LIKE %:courseCode%")
    List<Course> findCoursesWithPrerequisite(@Param("courseCode") String courseCode);
    
    @Query("SELECT COUNT(r) FROM Registration r WHERE r.course.id = :courseId AND r.status = 'ENROLLED'")
    Long countEnrolledStudents(@Param("courseId") Long courseId);
    
    @Query("SELECT AVG(c.courseFee) FROM Course c WHERE c.department = :department")
    Double getAverageCourseFeeByDepartment(@Param("department") String department);
    
    boolean existsByDepartment(String department);
}
