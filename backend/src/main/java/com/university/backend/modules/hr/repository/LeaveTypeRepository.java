package com.university.backend.modules.hr.repository;

import com.university.backend.modules.hr.entity.LeaveType;
import com.university.backend.modules.hr.entity.LeaveTypeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveType, Long> {
    
    Optional<LeaveType> findByCode(String code);
    
    List<LeaveType> findByStatus(LeaveTypeStatus status);
    
    List<LeaveType> findByIsPaid(Boolean isPaid);
    
    List<LeaveType> findByRequiresApproval(Boolean requiresApproval);
    
    List<LeaveType> findByCarryoverAllowed(Boolean carryoverAllowed);
}