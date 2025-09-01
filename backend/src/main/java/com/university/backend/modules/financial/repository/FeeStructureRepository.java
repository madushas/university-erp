package com.university.backend.modules.financial.repository;

import com.university.backend.modules.financial.entity.FeeStructure;
import com.university.backend.modules.financial.entity.FeeStructureStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {
    
    List<FeeStructure> findByStatus(FeeStructureStatus status);
    
    List<FeeStructure> findByAcademicYearId(Long academicYearId);
    
    List<FeeStructure> findByProgramId(Long programId);
    
    @Query("SELECT fs FROM FeeStructure fs WHERE fs.status = :status AND " +
           "fs.effectiveDate <= :currentDate AND " +
           "(fs.expiryDate IS NULL OR fs.expiryDate >= :currentDate)")
    List<FeeStructure> findActiveByDate(@Param("status") FeeStructureStatus status, 
                                       @Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT fs FROM FeeStructure fs WHERE fs.academicYear.id = :academicYearId AND " +
           "fs.program.id = :programId AND fs.status = :status")
    Optional<FeeStructure> findByAcademicYearAndProgramAndStatus(@Param("academicYearId") Long academicYearId,
                                                                @Param("programId") Long programId,
                                                                @Param("status") FeeStructureStatus status);
}