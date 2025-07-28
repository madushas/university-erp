package com.university.backend.modules.hr.repository;

import com.university.backend.modules.hr.entity.PerformanceReview;
import com.university.backend.modules.hr.entity.ReviewStatus;
import com.university.backend.modules.hr.entity.ReviewType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {
    
    List<PerformanceReview> findByEmployeeId(Long employeeId);
    
    List<PerformanceReview> findByReviewerId(Long reviewerId);
    
    List<PerformanceReview> findByStatus(ReviewStatus status);
    
    List<PerformanceReview> findByReviewType(ReviewType reviewType);
    
    Page<PerformanceReview> findByEmployeeIdAndStatus(
        Long employeeId, ReviewStatus status, Pageable pageable);
    
    @Query("SELECT pr FROM PerformanceReview pr WHERE pr.dueDate <= :date AND pr.status IN :statuses")
    List<PerformanceReview> findOverdueReviews(
        @Param("date") LocalDate date, 
        @Param("statuses") List<ReviewStatus> statuses);
    
    @Query("SELECT pr FROM PerformanceReview pr WHERE pr.reviewPeriodStart >= :startDate AND pr.reviewPeriodEnd <= :endDate")
    List<PerformanceReview> findByReviewPeriod(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(pr) FROM PerformanceReview pr WHERE pr.status = :status")
    long countByStatus(@Param("status") ReviewStatus status);
}