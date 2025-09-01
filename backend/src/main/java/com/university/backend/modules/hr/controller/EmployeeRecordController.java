package com.university.backend.modules.hr.controller;

import com.university.backend.modules.hr.dto.CreateEmployeeRequest;
import com.university.backend.modules.hr.dto.EmployeeRecordDto;
import com.university.backend.modules.core.entity.User;
import com.university.backend.modules.core.service.UserService;
import com.university.backend.modules.hr.entity.EmployeeRecord;
import com.university.backend.modules.hr.entity.EmploymentStatus;
import com.university.backend.modules.hr.entity.EmploymentType;
import com.university.backend.modules.hr.service.EmployeeRecordService;
import com.university.backend.modules.hr.mapper.HRMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/hr/employees")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmployeeRecordController {
    
    private final EmployeeRecordService employeeRecordService;
    private final HRMapper hrMapper;
    private final UserService userService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<EmployeeRecordDto>> getAllEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "employeeNumber") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<EmployeeRecord> employees = employeeRecordService.getAllEmployees(pageable);
        List<EmployeeRecordDto> employeeDtos = employees.getContent().stream()
            .map(hrMapper::toDto)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(employeeDtos);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<EmployeeRecordDto> getEmployeeById(@PathVariable Long id) {
        return employeeRecordService.getEmployeeById(id)
            .map(employee -> ResponseEntity.ok(hrMapper.toDto(employee)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/number/{employeeNumber}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<EmployeeRecord> getEmployeeByNumber(@PathVariable String employeeNumber) {
        return employeeRecordService.getEmployeeByNumber(employeeNumber)
            .map(employee -> ResponseEntity.ok(employee))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/my-record")
    @PreAuthorize("hasRole('FACULTY') or hasRole('STAFF')")
    public ResponseEntity<EmployeeRecord> getMyEmployeeRecord() {
        // TODO: Get current user ID from security context
        // For now, return a placeholder response
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/department/{department}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<EmployeeRecordDto>> getEmployeesByDepartment(
            @PathVariable String department,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        List<EmployeeRecord> employees = employeeRecordService.getEmployeesByDepartment(department);
        List<EmployeeRecordDto> employeeDtos = employees.stream()
            .map(hrMapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(employeeDtos);
    }
    
    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<EmployeeRecord>> getEmployeesByType(@PathVariable EmploymentType type) {
        List<EmployeeRecord> employees = employeeRecordService.getEmployeesByType(type);
        return ResponseEntity.ok(employees);
    }
    
    @GetMapping("/supervisor/{supervisorId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<EmployeeRecord>> getEmployeesBySupervisor(@PathVariable Long supervisorId) {
        List<EmployeeRecord> employees = employeeRecordService.getEmployeesBySupervisor(supervisorId);
        return ResponseEntity.ok(employees);
    }
    
    @GetMapping("/tenure-track-pending")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<EmployeeRecord>> getTenureTrackPending() {
        List<EmployeeRecord> employees = employeeRecordService.getTenureTrackWithoutTenure();
        return ResponseEntity.ok(employees);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<EmployeeRecordDto> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        try {
            if (employeeRecordService.existsByEmployeeNumber(request.getEmployeeNumber())) {
                return ResponseEntity.badRequest().build();
            }
            
            // Get the user
            User user = userService.getUserById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Get supervisor if provided
            User supervisor = null;
            if (request.getSupervisorId() != null) {
                supervisor = userService.getUserById(request.getSupervisorId())
                    .orElse(null);
            }
            
            // Create employee record
            EmployeeRecord employee = EmployeeRecord.builder()
                .user(user)
                .employeeNumber(request.getEmployeeNumber())
                .hireDate(request.getHireDate())
                .employmentType(request.getEmploymentType())
                .employmentStatus(request.getEmploymentStatus())
                .jobTitle(request.getJobTitle())
                .department(request.getDepartment())
                .supervisor(supervisor)
                .salary(request.getSalary())
                .hourlyRate(request.getHourlyRate())
                .benefitsEligible(request.getBenefitsEligible())
                .tenureTrack(request.getTenureTrack())
                .tenureDate(request.getTenureDate())
                .contractStartDate(request.getContractStartDate())
                .contractEndDate(request.getContractEndDate())
                .officeLocation(request.getOfficeLocation())
                .officePhone(request.getOfficePhone())
                .build();
            
            EmployeeRecord createdEmployee = employeeRecordService.createEmployee(employee);
            return ResponseEntity.status(HttpStatus.CREATED).body(hrMapper.toDto(createdEmployee));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<EmployeeRecord> updateEmployee(
            @PathVariable Long id, 
            @Valid @RequestBody EmployeeRecord employee) {
        try {
            if (!employeeRecordService.getEmployeeById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            employee.setId(id);
            EmployeeRecord updatedEmployee = employeeRecordService.updateEmployee(employee);
            return ResponseEntity.ok(updatedEmployee);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<EmployeeRecord> updateEmployeeStatus(
            @PathVariable Long id, 
            @RequestParam EmploymentStatus status) {
        try {
            EmployeeRecord updatedEmployee = employeeRecordService.updateEmployeeStatus(id, status);
            return ResponseEntity.ok(updatedEmployee);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        try {
            if (!employeeRecordService.getEmployeeById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            employeeRecordService.deleteEmployee(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Map<String, Object>> getEmployeeStatistics() {
        Map<String, Object> stats = Map.of(
            "totalActive", employeeRecordService.countByStatus(EmploymentStatus.ACTIVE),
            "totalInactive", employeeRecordService.countByStatus(EmploymentStatus.INACTIVE),
            "totalTerminated", employeeRecordService.countByStatus(EmploymentStatus.TERMINATED),
            "totalRetired", employeeRecordService.countByStatus(EmploymentStatus.RETIRED)
        );
        return ResponseEntity.ok(stats);
    }
}