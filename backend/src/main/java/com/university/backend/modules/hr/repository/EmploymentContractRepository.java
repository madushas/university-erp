package com.university.backend.modules.hr.repository;

import com.university.backend.modules.hr.entity.ContractStatus;
import com.university.backend.modules.hr.entity.ContractType;
import com.university.backend.modules.hr.entity.EmploymentContract;
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
public interface EmploymentContractRepository extends JpaRepository<EmploymentContract, Long> {
    
    Optional<EmploymentContract> findByContractNumber(String contractNumber);
    
    List<EmploymentContract> findByEmployeeId(Long employeeId);
    
    List<EmploymentContract> findByStatus(ContractStatus status);
    
    List<EmploymentContract> findByContractType(ContractType contractType);
    
    Page<EmploymentContract> findByStatusAndContractType(
        ContractStatus status, ContractType contractType, Pageable pageable);
    
    @Query("SELECT ec FROM EmploymentContract ec WHERE ec.endDate IS NOT NULL AND ec.endDate <= :date AND ec.status = 'ACTIVE'")
    List<EmploymentContract> findExpiringContracts(@Param("date") LocalDate date);
    
    @Query("SELECT ec FROM EmploymentContract ec WHERE ec.endDate IS NOT NULL AND ec.endDate BETWEEN :startDate AND :endDate AND ec.status = 'ACTIVE'")
    List<EmploymentContract> findContractsExpiringBetween(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate);
    
    @Query("SELECT ec FROM EmploymentContract ec WHERE ec.renewalEligible = true AND ec.endDate <= :date AND ec.status = 'ACTIVE'")
    List<EmploymentContract> findRenewalEligibleContracts(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(ec) FROM EmploymentContract ec WHERE ec.status = :status")
    long countByStatus(@Param("status") ContractStatus status);
    
    @Query("SELECT ec FROM EmploymentContract ec WHERE ec.employee.id = :employeeId AND ec.status = 'ACTIVE'")
    Optional<EmploymentContract> findActiveContractByEmployeeId(@Param("employeeId") Long employeeId);
}