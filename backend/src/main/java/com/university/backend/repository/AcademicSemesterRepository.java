package com.university.backend.repository;

import com.university.backend.entity.AcademicSemester;
import com.university.backend.entity.SemesterStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicSemesterRepository extends JpaRepository<AcademicSemester, Long> {
    
    Optional<AcademicSemester> findByCode(String code);
    
    boolean existsByCode(String code);
    
    List<AcademicSemester> findByStatus(SemesterStatus status);
    
    @Query("SELECT s FROM AcademicSemester s WHERE s.isCurrent = true")
    Optional<AcademicSemester> findCurrentSemester();
    
    @Query("SELECT s FROM AcademicSemester s WHERE s.startDate <= :date AND s.endDate >= :date")
    List<AcademicSemester> findSemestersByDate(LocalDate date);
    
    @Query("SELECT s FROM AcademicSemester s WHERE s.registrationStartDate <= :date AND s.registrationEndDate >= :date")
    List<AcademicSemester> findSemestersInRegistrationPeriod(LocalDate date);
    
    @Query("SELECT s FROM AcademicSemester s ORDER BY s.startDate DESC")
    List<AcademicSemester> findAllOrderByStartDateDesc();
    
    @Query("SELECT s FROM AcademicSemester s WHERE s.status IN ('ACTIVE', 'REGISTRATION_OPEN') ORDER BY s.startDate")
    List<AcademicSemester> findActiveAndRegistrationOpenSemesters();
}
