package com.university.backend.repository;

import com.university.backend.entity.EmployeeRecord;
import com.university.backend.entity.EmploymentStatus;
import com.university.backend.entity.EmploymentType;
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
public interface EmployeeRecordRepository extends JpaRepository<EmployeeRecord, Long> {
    
    Optional<EmployeeRecord> findByEmployeeNumber(String employeeNumber);
    
    Optional<EmployeeRecord> findByUserId(Long userId);
    
    List<EmployeeRecord> findByEmploymentStatus(EmploymentStatus status);
    
    List<EmployeeRecord> findByEmploymentType(EmploymentType type);
    
    List<EmployeeRecord> findByDepartment(String department);
    
    Page<EmployeeRecord> findByEmploymentStatusAndEmploymentType(
        EmploymentStatus status, EmploymentType type, Pageable pageable);
    
    @Query("SELECT er FROM EmployeeRecord er WHERE er.supervisor.id = :supervisorId")
    List<EmployeeRecord> findBySupervisorId(@Param("supervisorId") Long supervisorId);
    
    @Query("SELECT er FROM EmployeeRecord er WHERE er.hireDate BETWEEN :startDate AND :endDate")
    List<EmployeeRecord> findByHireDateBetween(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(er) FROM EmployeeRecord er WHERE er.employmentStatus = :status")
    long countByEmploymentStatus(@Param("status") EmploymentStatus status);
    
    @Query("SELECT er FROM EmployeeRecord er WHERE er.tenureTrack = true AND er.tenureDate IS NULL")
    List<EmployeeRecord> findTenureTrackWithoutTenure();
}