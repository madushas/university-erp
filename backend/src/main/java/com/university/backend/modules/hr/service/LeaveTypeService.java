package com.university.backend.modules.hr.service;

import com.university.backend.modules.hr.entity.LeaveType;
import com.university.backend.modules.hr.entity.LeaveTypeStatus;
import com.university.backend.modules.hr.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class LeaveTypeService {

    private final LeaveTypeRepository leaveTypeRepository;

    @Transactional(readOnly = true)
    public List<LeaveType> getAllLeaveTypes() {
        try {
            log.debug("Retrieving all leave types");
            return leaveTypeRepository.findAll();
        } catch (Exception e) {
            log.error("Error retrieving all leave types: {}", e.getMessage());
            return List.of(); // Return empty list to prevent timeout
        }
    }

    @Cacheable("activeLeaveTypes")
    @Transactional(readOnly = true)
    public List<LeaveType> getActiveLeaveTypes() {
        try {
            log.debug("Retrieving active leave types");
            List<LeaveType> activeTypes = leaveTypeRepository.findByStatus(LeaveTypeStatus.ACTIVE);
            log.debug("Found {} active leave types", activeTypes.size());
            return activeTypes;
        } catch (Exception e) {
            log.error("Error retrieving active leave types: {}", e.getMessage());
            return List.of(); // Return empty list to prevent timeout
        }
    }

    @Cacheable("leaveTypes")
    @Transactional(readOnly = true)
    public Optional<LeaveType> getLeaveTypeById(Long id) {
        try {
            log.debug("Retrieving leave type by ID: {}", id);
            return leaveTypeRepository.findById(id);
        } catch (Exception e) {
            log.error("Error retrieving leave type by ID {}: {}", id, e.getMessage());
            return Optional.empty();
        }
    }

    @Cacheable("leaveTypesByCode")
    @Transactional(readOnly = true)
    public Optional<LeaveType> getLeaveTypeByCode(String code) {
        try {
            log.debug("Retrieving leave type by code: {}", code);
            return leaveTypeRepository.findByCode(code);
        } catch (Exception e) {
            log.error("Error retrieving leave type by code {}: {}", code, e.getMessage());
            return Optional.empty();
        }
    }

    @CacheEvict(value = { "activeLeaveTypes", "leaveTypes", "leaveTypesByCode" }, allEntries = true)
    public LeaveType createLeaveType(LeaveType leaveType) {
        try {
            log.info("Creating leave type: {}", leaveType.getName());
            if (leaveType.getStatus() == null) {
                leaveType.setStatus(LeaveTypeStatus.ACTIVE);
            }
            LeaveType saved = leaveTypeRepository.save(leaveType);
            log.info("Created leave type with ID: {}", saved.getId());
            return saved;
        } catch (Exception e) {
            log.error("Error creating leave type: {}", e.getMessage());
            throw new RuntimeException("Failed to create leave type", e);
        }
    }

    @CacheEvict(value = { "activeLeaveTypes", "leaveTypes", "leaveTypesByCode" }, allEntries = true)
    public LeaveType updateLeaveType(LeaveType leaveType) {
        try {
            log.info("Updating leave type: {}", leaveType.getId());
            LeaveType updated = leaveTypeRepository.save(leaveType);
            log.info("Updated leave type: {}", updated.getId());
            return updated;
        } catch (Exception e) {
            log.error("Error updating leave type: {}", e.getMessage());
            throw new RuntimeException("Failed to update leave type", e);
        }
    }

    @CacheEvict(value = { "activeLeaveTypes", "leaveTypes", "leaveTypesByCode" }, allEntries = true)
    public LeaveType updateLeaveTypeStatus(Long id, LeaveTypeStatus status) {
        try {
            log.info("Updating leave type {} status to: {}", id, status);
            LeaveType leaveType = leaveTypeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Leave type not found with id: " + id));
            leaveType.setStatus(status);
            LeaveType updated = leaveTypeRepository.save(leaveType);
            log.info("Updated leave type status: {}", updated.getId());
            return updated;
        } catch (Exception e) {
            log.error("Error updating leave type status: {}", e.getMessage());
            throw e;
        }
    }

    @CacheEvict(value = { "activeLeaveTypes", "leaveTypes", "leaveTypesByCode" }, allEntries = true)
    public void deleteLeaveType(Long id) {
        try {
            log.info("Deleting leave type: {}", id);
            leaveTypeRepository.deleteById(id);
            log.info("Deleted leave type: {}", id);
        } catch (Exception e) {
            log.error("Error deleting leave type {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to delete leave type", e);
        }
    }

    @Transactional(readOnly = true)
    public boolean existsByCode(String code) {
        try {
            return leaveTypeRepository.findByCode(code).isPresent();
        } catch (Exception e) {
            log.error("Error checking if leave type exists by code {}: {}", code, e.getMessage());
            return false;
        }
    }
}