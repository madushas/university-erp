package com.university.backend.modules.hr.service;

import com.university.backend.modules.hr.entity.EmployeeRecord;
import com.university.backend.modules.hr.entity.EmploymentStatus;
import com.university.backend.modules.hr.entity.EmploymentType;
import com.university.backend.modules.hr.repository.EmployeeRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeRecordService {
    
    private final EmployeeRecordRepository employeeRecordRepository;
    
    public List<EmployeeRecord> getAllEmployees() {
        return employeeRecordRepository.findAll();
    }
    
    public Page<EmployeeRecord> getAllEmployees(Pageable pageable) {
        return employeeRecordRepository.findAll(pageable);
    }
    
    public Optional<EmployeeRecord> getEmployeeById(Long id) {
        return employeeRecordRepository.findById(id);
    }
    
    public Optional<EmployeeRecord> getEmployeeByNumber(String employeeNumber) {
        return employeeRecordRepository.findByEmployeeNumber(employeeNumber);
    }
    
    public Optional<EmployeeRecord> getEmployeeByUserId(Long userId) {
        return employeeRecordRepository.findByUserId(userId);
    }
    
    public List<EmployeeRecord> getEmployeesByStatus(EmploymentStatus status) {
        return employeeRecordRepository.findByEmploymentStatus(status);
    }
    
    public List<EmployeeRecord> getEmployeesByType(EmploymentType type) {
        return employeeRecordRepository.findByEmploymentType(type);
    }
    
    public List<EmployeeRecord> getEmployeesByDepartment(String department) {
        return employeeRecordRepository.findByDepartment(department);
    }
    
    public List<EmployeeRecord> getEmployeesBySupervisor(Long supervisorId) {
        return employeeRecordRepository.findBySupervisorId(supervisorId);
    }
    
    public List<EmployeeRecord> getEmployeesByHireDateRange(LocalDate startDate, LocalDate endDate) {
        return employeeRecordRepository.findByHireDateBetween(startDate, endDate);
    }
    
    public List<EmployeeRecord> getTenureTrackWithoutTenure() {
        return employeeRecordRepository.findTenureTrackWithoutTenure();
    }
    
    public EmployeeRecord createEmployee(EmployeeRecord employee) {
        return employeeRecordRepository.save(employee);
    }
    
    public EmployeeRecord updateEmployee(EmployeeRecord employee) {
        return employeeRecordRepository.save(employee);
    }
    
    public EmployeeRecord updateEmployeeStatus(Long id, EmploymentStatus status) {
        EmployeeRecord employee = employeeRecordRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        employee.setEmploymentStatus(status);
        return employeeRecordRepository.save(employee);
    }
    
    public void deleteEmployee(Long id) {
        employeeRecordRepository.deleteById(id);
    }
    
    public long countByStatus(EmploymentStatus status) {
        return employeeRecordRepository.countByEmploymentStatus(status);
    }
    
    public boolean existsByEmployeeNumber(String employeeNumber) {
        return employeeRecordRepository.findByEmployeeNumber(employeeNumber).isPresent();
    }
}