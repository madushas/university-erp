package com.university.backend.modules.student.repository;

import com.university.backend.modules.student.entity.Transcript;
import com.university.backend.modules.student.entity.Transcript.TranscriptStatus;
import com.university.backend.modules.student.entity.Transcript.TranscriptType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TranscriptRepository extends JpaRepository<Transcript, Long> {
    
    Optional<Transcript> findByTranscriptNumber(String transcriptNumber);
    
    List<Transcript> findByStudentId(Long studentId);
    
    List<Transcript> findByStatus(TranscriptStatus status);
    
    List<Transcript> findByTranscriptType(TranscriptType transcriptType);
    
    @Query("SELECT t FROM Transcript t WHERE t.student.id = :studentId ORDER BY t.issueDate DESC")
    List<Transcript> findByStudentIdOrderByIssueDateDesc(@Param("studentId") Long studentId);
    
    @Query("SELECT t FROM Transcript t WHERE t.student.id = :studentId AND t.transcriptType = :type")
    List<Transcript> findByStudentIdAndTranscriptType(@Param("studentId") Long studentId, @Param("type") TranscriptType type);
    
    @Query("SELECT t FROM Transcript t WHERE t.issueDate BETWEEN :startDate AND :endDate")
    List<Transcript> findByIssueDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT t FROM Transcript t " +
           "LEFT JOIN FETCH t.student " +
           "LEFT JOIN FETCH t.courses " +
           "WHERE t.id = :id")
    Optional<Transcript> findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT t FROM Transcript t " +
           "LEFT JOIN FETCH t.student " +
           "LEFT JOIN FETCH t.courses " +
           "WHERE t.transcriptNumber = :transcriptNumber")
    Optional<Transcript> findByTranscriptNumberWithDetails(@Param("transcriptNumber") String transcriptNumber);
    
    @Query("SELECT COUNT(t) FROM Transcript t WHERE t.status = :status")
    Long countByStatus(@Param("status") TranscriptStatus status);
    
    @Query("SELECT COUNT(t) FROM Transcript t WHERE t.transcriptType = :type")
    Long countByTranscriptType(@Param("type") TranscriptType type);
    
    @Query("SELECT t FROM Transcript t WHERE t.student.studentId = :studentNumber")
    List<Transcript> findByStudentNumber(@Param("studentNumber") String studentNumber);
    
    @Query("SELECT t FROM Transcript t WHERE t.status = 'APPROVED' AND t.releasedDate IS NULL")
    List<Transcript> findApprovedButNotReleased();
    
    @Query("SELECT t FROM Transcript t WHERE t.holdsPreventingRelease IS NOT NULL AND t.holdsPreventingRelease != ''")
    List<Transcript> findWithHolds();
    
    Page<Transcript> findByStatus(TranscriptStatus status, Pageable pageable);
    
    Page<Transcript> findByTranscriptType(TranscriptType transcriptType, Pageable pageable);
    
    Page<Transcript> findByStudentId(Long studentId, Pageable pageable);
}
