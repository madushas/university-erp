package com.university.backend.modules.student.repository;

import com.university.backend.modules.student.entity.TranscriptRequest;
import com.university.backend.modules.student.entity.TranscriptRequest.RequestStatus;
import com.university.backend.modules.student.entity.TranscriptRequest.TranscriptType;
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
public interface TranscriptRequestRepository extends JpaRepository<TranscriptRequest, Long> {
    
    Optional<TranscriptRequest> findByRequestNumber(String requestNumber);
    
    List<TranscriptRequest> findByStudentId(Long studentId);
    
    List<TranscriptRequest> findByStatus(RequestStatus status);
    
    List<TranscriptRequest> findByTranscriptType(TranscriptType transcriptType);
    
    @Query("SELECT tr FROM TranscriptRequest tr WHERE tr.student.id = :studentId ORDER BY tr.requestDate DESC")
    List<TranscriptRequest> findByStudentIdOrderByRequestDateDesc(@Param("studentId") Long studentId);
    
    @Query("SELECT tr FROM TranscriptRequest tr WHERE tr.requestDate BETWEEN :startDate AND :endDate")
    List<TranscriptRequest> findByRequestDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT tr FROM TranscriptRequest tr " +
           "LEFT JOIN FETCH tr.student " +
           "LEFT JOIN FETCH tr.processedBy " +
           "WHERE tr.id = :id")
    Optional<TranscriptRequest> findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT tr FROM TranscriptRequest tr WHERE tr.status = :status ORDER BY tr.requestDate ASC")
    List<TranscriptRequest> findByStatusOrderByRequestDateAsc(@Param("status") RequestStatus status);
    
    @Query("SELECT COUNT(tr) FROM TranscriptRequest tr WHERE tr.status = :status")
    Long countByStatus(@Param("status") RequestStatus status);
    
    @Query("SELECT COUNT(tr) FROM TranscriptRequest tr WHERE tr.transcriptType = :type")
    Long countByTranscriptType(@Param("type") TranscriptType type);
    
    @Query("SELECT tr FROM TranscriptRequest tr WHERE tr.paymentStatus = 'PENDING'")
    List<TranscriptRequest> findPendingPayments();
    
    @Query("SELECT tr FROM TranscriptRequest tr WHERE tr.status = 'SUBMITTED' AND tr.paymentStatus = 'PAID'")
    List<TranscriptRequest> findPaidPendingRequests();
    
    @Query("SELECT tr FROM TranscriptRequest tr WHERE tr.processedDate IS NOT NULL AND tr.shippedDate IS NULL")
    List<TranscriptRequest> findProcessedButNotShipped();
    
    @Query("SELECT SUM(tr.totalFee) FROM TranscriptRequest tr WHERE tr.paymentStatus = 'PAID' AND tr.paymentDate BETWEEN :startDate AND :endDate")
    Double findTotalRevenueBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    Page<TranscriptRequest> findByStatus(RequestStatus status, Pageable pageable);
    
    Page<TranscriptRequest> findByStudentId(Long studentId, Pageable pageable);
    
    Page<TranscriptRequest> findByTranscriptType(TranscriptType transcriptType, Pageable pageable);
}
