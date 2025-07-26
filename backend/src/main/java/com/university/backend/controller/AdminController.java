package com.university.backend.controller;

import com.university.backend.dto.request.CreateUserRequest;
import com.university.backend.dto.request.UpdateUserRequest;
import com.university.backend.dto.response.UserResponse;
import com.university.backend.entity.User;
import com.university.backend.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // User Management
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : 
            Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<User> users = adminService.getAllUsers(pageable, role, status);
        List<UserResponse> userResponses = users.getContent().stream()
            .map(this::convertToUserResponse)
            .toList();
        
        return ResponseEntity.ok(userResponses);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User user = adminService.getUserById(id);
        return ResponseEntity.ok(convertToUserResponse(user));
    }

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        User user = adminService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(convertToUserResponse(user));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id, 
            @Valid @RequestBody UpdateUserRequest request) {
        User user = adminService.updateUser(id, request);
        return ResponseEntity.ok(convertToUserResponse(user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        User user = adminService.updateUserStatus(id, status);
        return ResponseEntity.ok(convertToUserResponse(user));
    }

    // Department Management
    @GetMapping("/departments")
    public ResponseEntity<List<com.university.backend.dto.response.DepartmentResponse>> getAllDepartments() {
        List<com.university.backend.dto.response.DepartmentResponse> departments = 
            adminService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }

    @PostMapping("/departments")
    public ResponseEntity<com.university.backend.dto.response.DepartmentResponse> createDepartment(
            @Valid @RequestBody com.university.backend.dto.request.CreateDepartmentRequest request) {
        com.university.backend.dto.response.DepartmentResponse department = 
            adminService.createDepartment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(department);
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<com.university.backend.dto.response.DepartmentResponse> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody com.university.backend.dto.request.UpdateDepartmentRequest request) {
        com.university.backend.dto.response.DepartmentResponse department = 
            adminService.updateDepartment(id, request);
        return ResponseEntity.ok(department);
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        adminService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    // Course Management
    @GetMapping("/courses")
    public ResponseEntity<List<com.university.backend.dto.response.CourseResponse>> getAllCoursesForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<com.university.backend.dto.response.CourseResponse> courses = 
            adminService.getAllCoursesForAdmin(pageable);
        return ResponseEntity.ok(courses);
    }

    @PatchMapping("/courses/{id}/status")
    public ResponseEntity<com.university.backend.dto.response.CourseResponse> updateCourseStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        com.university.backend.dto.response.CourseResponse course = 
            adminService.updateCourseStatus(id, status);
        return ResponseEntity.ok(course);
    }

    // Registration Management
    @GetMapping("/registrations")
    public ResponseEntity<List<com.university.backend.dto.response.RegistrationResponse>> getAllRegistrations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus) {
        Pageable pageable = PageRequest.of(page, size);
        List<com.university.backend.dto.response.RegistrationResponse> registrations = 
            adminService.getAllRegistrations(pageable, status, paymentStatus);
        return ResponseEntity.ok(registrations);
    }

    @PatchMapping("/registrations/{id}/payment-status")
    public ResponseEntity<com.university.backend.dto.response.RegistrationResponse> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam String paymentStatus) {
        com.university.backend.dto.response.RegistrationResponse registration = 
            adminService.updatePaymentStatus(id, paymentStatus);
        return ResponseEntity.ok(registration);
    }

    @PatchMapping("/registrations/{id}/grade")
    public ResponseEntity<com.university.backend.dto.response.RegistrationResponse> updateGrade(
            @PathVariable Long id,
            @RequestParam String grade) {
        com.university.backend.dto.response.RegistrationResponse registration = 
            adminService.updateGrade(id, grade);
        return ResponseEntity.ok(registration);
    }

    // Analytics and Reports
    @GetMapping("/reports/financial")
    public ResponseEntity<com.university.backend.dto.response.FinancialReportResponse> getFinancialReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        com.university.backend.dto.response.FinancialReportResponse report = 
            adminService.getFinancialReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports/academic")
    public ResponseEntity<com.university.backend.dto.response.AcademicReportResponse> getAcademicReport() {
        com.university.backend.dto.response.AcademicReportResponse report = 
            adminService.getAcademicReport();
        return ResponseEntity.ok(report);
    }

    private UserResponse convertToUserResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .role(user.getRole())
            .employeeId(user.getEmployeeId())
            .studentId(user.getStudentId())
            .department(user.getDepartment())
            .yearOfStudy(user.getYearOfStudy())
            .gpa(user.getGpa())
            .status(user.getStatus())
            .phoneNumber(user.getPhoneNumber())
            .dateOfBirth(user.getDateOfBirth())
            .address(user.getAddress())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
}
