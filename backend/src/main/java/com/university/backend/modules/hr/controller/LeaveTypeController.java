package com.university.backend.modules.hr.controller;

import com.university.backend.modules.hr.entity.LeaveType;
import com.university.backend.modules.hr.entity.LeaveTypeStatus;
import com.university.backend.modules.hr.service.LeaveTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/hr/leave/types")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LeaveTypeController {
    
    private final LeaveTypeService leaveTypeService;
    
    @GetMapping
    public ResponseEntity<List<LeaveType>> getAllLeaveTypes() {
        List<LeaveType> leaveTypes = leaveTypeService.getActiveLeaveTypes();
        return ResponseEntity.ok(leaveTypes);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<LeaveType> getLeaveTypeById(@PathVariable Long id) {
        return leaveTypeService.getLeaveTypeById(id)
            .map(leaveType -> ResponseEntity.ok(leaveType))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/code/{code}")
    public ResponseEntity<LeaveType> getLeaveTypeByCode(@PathVariable String code) {
        return leaveTypeService.getLeaveTypeByCode(code)
            .map(leaveType -> ResponseEntity.ok(leaveType))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<LeaveType> createLeaveType(@Valid @RequestBody LeaveType leaveType) {
        try {
            if (leaveTypeService.existsByCode(leaveType.getCode())) {
                return ResponseEntity.badRequest().build();
            }
            
            LeaveType createdLeaveType = leaveTypeService.createLeaveType(leaveType);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdLeaveType);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<LeaveType> updateLeaveType(
            @PathVariable Long id, 
            @Valid @RequestBody LeaveType leaveType) {
        try {
            if (!leaveTypeService.getLeaveTypeById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            leaveType.setId(id);
            LeaveType updatedLeaveType = leaveTypeService.updateLeaveType(leaveType);
            return ResponseEntity.ok(updatedLeaveType);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<LeaveType> updateLeaveTypeStatus(
            @PathVariable Long id, 
            @RequestParam LeaveTypeStatus status) {
        try {
            LeaveType updatedLeaveType = leaveTypeService.updateLeaveTypeStatus(id, status);
            return ResponseEntity.ok(updatedLeaveType);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLeaveType(@PathVariable Long id) {
        try {
            if (!leaveTypeService.getLeaveTypeById(id).isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            leaveTypeService.deleteLeaveType(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}