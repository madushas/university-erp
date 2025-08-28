package com.university.backend.modules.student.repository;

import com.university.backend.modules.student.entity.DegreeAudit;
import com.university.backend.modules.student.entity.DegreeAudit.AuditType;
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
public interface DegreeAuditRepository extends JpaRepository<DegreeAudit, Long> {
    
    List<DegreeAudit> findByStudentId(Long studentId);
    
    List<DegreeAudit> findByAuditType(AuditType auditType);
    
    @Query("SELECT da FROM DegreeAudit da WHERE da.student.id = :studentId ORDER BY da.auditDate DESC")
    List<DegreeAudit> findByStudentIdOrderByAuditDateDesc(@Param("studentId") Long studentId);
    
    @Query("SELECT da FROM DegreeAudit da WHERE da.student.id = :studentId AND da.auditDate = " +
           "(SELECT MAX(da2.auditDate) FROM DegreeAudit da2 WHERE da2.student.id = :studentId)")
    Optional<DegreeAudit> findLatestByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT da FROM DegreeAudit da WHERE da.academicProgram.id = :programId")
    List<DegreeAudit> findByAcademicProgramId(@Param("programId") Long programId);
    
    @Query("SELECT da FROM DegreeAudit da WHERE da.eligibleForGraduation = true")
    List<DegreeAudit> findEligibleForGraduation();
    
    @Query("SELECT da FROM DegreeAudit da WHERE da.auditDate BETWEEN :startDate AND :endDate")
    List<DegreeAudit> findByAuditDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT da FROM DegreeAudit da " +
           "LEFT JOIN FETCH da.student " +
           "LEFT JOIN FETCH da.academicProgram " +
           "LEFT JOIN FETCH da.requirementItems " +
           "WHERE da.id = :id")
    Optional<DegreeAudit> findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT da FROM DegreeAudit da WHERE da.student.id = :studentId AND da.academicProgram.id = :programId ORDER BY da.auditDate DESC")
    List<DegreeAudit> findByStudentIdAndAcademicProgramId(@Param("studentId") Long studentId, @Param("programId") Long programId);
    
    @Query("SELECT COUNT(da) FROM DegreeAudit da WHERE da.eligibleForGraduation = true")
    Long countEligibleForGraduation();
    
    @Query("SELECT COUNT(da) FROM DegreeAudit da WHERE da.auditType = :auditType")
    Long countByAuditType(@Param("auditType") AuditType auditType);
    
    @Query("SELECT AVG(da.degreeCompletionPercentage) FROM DegreeAudit da WHERE da.auditType = 'PROGRESS'")
    Double findAverageDegreeCompletionPercentage();
    
    Page<DegreeAudit> findByStudentId(Long studentId, Pageable pageable);
    
    Page<DegreeAudit> findByAuditType(AuditType auditType, Pageable pageable);
}
