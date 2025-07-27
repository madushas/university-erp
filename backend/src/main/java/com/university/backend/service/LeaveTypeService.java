package com.university.backend.service;

import com.university.backend.entity.LeaveType;
import com.university.backend.entity.LeaveTypeStatus;
import com.university.backend.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveTypeService {
    
    private final LeaveTypeRepository leaveTypeRepository;
    
    public List<LeaveType> getAllLeaveTypes() {
        return leaveTypeRepository.findAll();
    }
    
    public List<LeaveType> getActiveLeaveTypes() {
        return leaveTypeRepository.findByStatus(LeaveTypeStatus.ACTIVE);
    }
    
    public Optional<LeaveType> getLeaveTypeById(Long id) {
        return leaveTypeRepository.findById(id);
    }
    
    public Optional<LeaveType> getLeaveTypeByCode(String code) {
        return leaveTypeRepository.findByCode(code);
    }
    
    public LeaveType createLeaveType(LeaveType leaveType) {
        if (leaveType.getStatus() == null) {
            leaveType.setStatus(LeaveTypeStatus.ACTIVE);
        }
        return leaveTypeRepository.save(leaveType);
    }
    
    public LeaveType updateLeaveType(LeaveType leaveType) {
        return leaveTypeRepository.save(leaveType);
    }
    
    public LeaveType updateLeaveTypeStatus(Long id, LeaveTypeStatus status) {
        LeaveType leaveType = leaveTypeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Leave type not found with id: " + id));
        leaveType.setStatus(status);
        return leaveTypeRepository.save(leaveType);
    }
    
    public void deleteLeaveType(Long id) {
        leaveTypeRepository.deleteById(id);
    }
    
    public boolean existsByCode(String code) {
        return leaveTypeRepository.findByCode(code).isPresent();
    }
}