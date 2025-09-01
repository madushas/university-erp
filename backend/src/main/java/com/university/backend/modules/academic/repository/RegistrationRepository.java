package com.university.backend.modules.academic.repository;

import com.university.backend.modules.academic.entity.PaymentStatus;
import com.university.backend.modules.academic.entity.Registration;
import com.university.backend.modules.academic.entity.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    
    List<Registration> findByUserId(Long userId);
    
    List<Registration> findByCourseId(Long courseId);
    
    List<Registration> findByStatus(RegistrationStatus status);
    
    List<Registration> findByPaymentStatus(PaymentStatus paymentStatus);
    
    Optional<Registration> findByUserIdAndCourseId(Long userId, Long courseId);
    
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
    
    @Query("SELECT r FROM Registration r JOIN FETCH r.user JOIN FETCH r.course WHERE r.user.id = :userId")
    List<Registration> findByUserIdWithDetails(@Param("userId") Long userId);
    
    @Query("SELECT r FROM Registration r JOIN FETCH r.user JOIN FETCH r.course WHERE r.course.id = :courseId")
    List<Registration> findByCourseIdWithDetails(@Param("courseId") Long courseId);
    
    @Query("SELECT COUNT(r) FROM Registration r WHERE r.course.id = :courseId AND r.status = 'ENROLLED'")
    Long countEnrolledStudentsByCourseId(@Param("courseId") Long courseId);
    
    @Query("SELECT r FROM Registration r WHERE r.user.id = :userId AND r.status = 'ENROLLED'")
    List<Registration> findActiveRegistrationsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT r FROM Registration r WHERE r.course.id = :courseId AND r.status = 'ENROLLED'")
    List<Registration> findActiveRegistrationsByCourseId(@Param("courseId") Long courseId);
    
    @Query("SELECT r FROM Registration r WHERE r.grade IS NOT NULL AND r.grade != ''")
    List<Registration> findRegistrationsWithGrades();
    
    @Query("SELECT r FROM Registration r WHERE r.grade IS NULL OR r.grade = ''")
    List<Registration> findRegistrationsWithoutGrades();
    
    @Query("SELECT r FROM Registration r WHERE r.paymentStatus = 'PENDING' OR r.paymentStatus = 'OVERDUE'")
    List<Registration> findUnpaidRegistrations();
    
    @Query("SELECT r FROM Registration r WHERE r.transcriptReleased = false AND r.status = 'COMPLETED'")
    List<Registration> findCompletedRegistrationsWithoutTranscript();
    
    @Query("SELECT r FROM Registration r WHERE r.certificateIssued = false AND r.status = 'COMPLETED'")
    List<Registration> findCompletedRegistrationsWithoutCertificate();
    
    @Query("SELECT r FROM Registration r WHERE r.attendancePercentage < :threshold")
    List<Registration> findRegistrationsWithLowAttendance(@Param("threshold") Double threshold);
    
    @Query("SELECT r FROM Registration r WHERE r.registrationDate BETWEEN :startDate AND :endDate")
    List<Registration> findRegistrationsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT AVG(r.gradePoints) FROM Registration r WHERE r.course.id = :courseId AND r.gradePoints IS NOT NULL")
    Double getAverageGradePointsByCourse(@Param("courseId") Long courseId);
    
    @Query("SELECT AVG(r.gradePoints) FROM Registration r WHERE r.user.id = :userId AND r.gradePoints IS NOT NULL")
    Double getAverageGradePointsByStudent(@Param("userId") Long userId);
    
    @Query("SELECT r FROM Registration r WHERE r.user.department = :department")
    List<Registration> findRegistrationsByDepartment(@Param("department") String department);
    
    @Query("SELECT COUNT(r) FROM Registration r WHERE r.status = :status")
    Long countRegistrationsByStatus(@Param("status") RegistrationStatus status);
    
    @Query("SELECT SUM(r.courseFeePaid) FROM Registration r WHERE r.paymentStatus = 'PAID'")
    Double getTotalRevenue();
    
    @Query("SELECT SUM(r.courseFeePaid) FROM Registration r WHERE r.course.department = :department AND r.paymentStatus = 'PAID'")
    Double getTotalRevenueByDepartment(@Param("department") String department);
    
    Page<Registration> findByStatus(RegistrationStatus status, Pageable pageable);
    
    Page<Registration> findByPaymentStatus(PaymentStatus paymentStatus, Pageable pageable);
    
    @Query("SELECT r FROM Registration r WHERE r.status = :status AND r.paymentStatus = :paymentStatus")
    Page<Registration> findByStatusAndPaymentStatus(@Param("status") RegistrationStatus status, 
                                                    @Param("paymentStatus") PaymentStatus paymentStatus, 
                                                    Pageable pageable);
    
    Long countByPaymentStatus(PaymentStatus paymentStatus);
    
    // Additional methods needed for business logic
    Long countByCourseId(Long courseId);
    
    Long countByCourseIdAndStatus(Long courseId, RegistrationStatus status);
    
    List<Registration> findByUserIdAndStatus(Long userId, RegistrationStatus status);
    
    @Query("SELECT COUNT(r) > 0 FROM Registration r WHERE r.user.id = :userId AND r.course.code = :courseCode AND r.grade NOT IN :grades")
    boolean existsByUserIdAndCourseCodeAndGradeNotIn(@Param("userId") Long userId, @Param("courseCode") String courseCode, @Param("grades") List<String> grades);
}