package com.university.backend.modules.academic.repository;

import com.university.backend.modules.academic.entity.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long> {
    
    @Query("SELECT ay FROM AcademicYear ay WHERE ay.status = 'ACTIVE' ORDER BY ay.name DESC")
    List<AcademicYear> findActiveAcademicYears();
    
    @Query("SELECT ay FROM AcademicYear ay WHERE ay.startDate <= :currentDate AND ay.endDate >= :currentDate AND ay.status = 'ACTIVE'")
    Optional<AcademicYear> findCurrentAcademicYear(@Param("currentDate") LocalDate currentDate);
    
    Optional<AcademicYear> findByName(String name);
    
    @Query("SELECT ay FROM AcademicYear ay WHERE ay.startDate >= :startDate ORDER BY ay.startDate")
    List<AcademicYear> findUpcomingAcademicYears(@Param("startDate") LocalDate startDate);
    
    @Query("SELECT ay FROM AcademicYear ay WHERE ay.endDate < :endDate ORDER BY ay.endDate DESC")
    List<AcademicYear> findPastAcademicYears(@Param("endDate") LocalDate endDate);
}
