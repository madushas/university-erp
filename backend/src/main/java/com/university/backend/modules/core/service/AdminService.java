package com.university.backend.modules.core.service;

import com.university.backend.dto.request.CreateUserRequest;
import com.university.backend.dto.request.UpdateUserRequest;
import com.university.backend.dto.response.UserResponse;
import com.university.backend.modules.core.entity.Role;
import com.university.backend.modules.core.entity.User;
import com.university.backend.modules.core.entity.UserStatus;
import com.university.backend.modules.core.entity.UserType;
import com.university.backend.modules.academic.entity.Department;
import com.university.backend.modules.academic.entity.DepartmentStatus;
import com.university.backend.modules.academic.entity.Course;
import com.university.backend.modules.academic.entity.CourseStatus;
import com.university.backend.modules.academic.entity.Registration;
import com.university.backend.modules.academic.entity.RegistrationStatus;
import com.university.backend.modules.academic.entity.PaymentStatus;
import com.university.backend.exception.UserAlreadyExistsException;
import com.university.backend.exception.UserNotFoundException;
import com.university.backend.exception.DepartmentAlreadyExistsException;
import com.university.backend.exception.DepartmentNotFoundException;
import com.university.backend.exception.CourseNotFoundException;
import com.university.backend.exception.RegistrationNotFoundException;
import com.university.backend.modules.core.repository.UserRepository;
import com.university.backend.modules.academic.repository.DepartmentRepository;
import com.university.backend.modules.academic.repository.CourseRepository;
import com.university.backend.modules.academic.repository.RegistrationRepository;
import com.university.backend.util.InputSanitizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final RegistrationRepository registrationRepository;
    private final PasswordEncoder passwordEncoder;
    private final InputSanitizer inputSanitizer;

    // User Management
    public Page<User> getAllUsers(Pageable pageable, String role, String status) {
        if (role != null && status != null) {
            return userRepository.findByRoleAndStatus(
                Role.valueOf(role.toUpperCase()), 
                UserStatus.valueOf(status.toUpperCase()), 
                pageable);
        } else if (role != null) {
            return userRepository.findByRole(Role.valueOf(role.toUpperCase()), pageable);
        } else if (status != null) {
            return userRepository.findByStatus(UserStatus.valueOf(status.toUpperCase()), pageable);
        } else {
            return userRepository.findAll(pageable);
        }
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }

    public User createUser(CreateUserRequest request) {
        // Validate and sanitize input - reject dangerous content and emojis
        if (inputSanitizer.containsDangerousContent(request.getUsername()) ||
            inputSanitizer.containsDangerousContent(request.getFirstName()) ||
            inputSanitizer.containsDangerousContent(request.getLastName()) ||
            inputSanitizer.containsDangerousContent(request.getPassword())) {
            throw new IllegalArgumentException("Input contains unsafe content");
        }
        
        // Reject emojis in names and username
        if (inputSanitizer.containsEmojis(request.getUsername()) ||
            inputSanitizer.containsEmojis(request.getFirstName()) ||
            inputSanitizer.containsEmojis(request.getLastName())) {
            throw new IllegalArgumentException("Input contains emojis which are not allowed");
        }
        
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists: " + request.getUsername());
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists: " + request.getEmail());
        }

        // Check if employee ID already exists (for instructors and admins)
        if (request.getEmployeeId() != null && !request.getEmployeeId().isEmpty()) {
            if (userRepository.existsByEmployeeId(request.getEmployeeId())) {
                throw new UserAlreadyExistsException("Employee ID already exists: " + request.getEmployeeId());
            }
        }

        // Check if student ID already exists (for students)
        if (request.getStudentId() != null && !request.getStudentId().isEmpty()) {
            if (userRepository.existsByStudentId(request.getStudentId())) {
                throw new UserAlreadyExistsException("Student ID already exists: " + request.getStudentId());
            }
        }

        // Sanitize input fields
        String sanitizedFirstName = inputSanitizer.sanitize(request.getFirstName());
        String sanitizedLastName = inputSanitizer.sanitize(request.getLastName());
        
        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstName(sanitizedFirstName)
            .lastName(sanitizedLastName)
            .role(request.getRole())
            .userType(request.getUserType() != null ? request.getUserType() : 
                (request.getRole() == Role.STUDENT ? UserType.STUDENT : 
                 UserType.FACULTY))
            .employeeType(request.getEmployeeType())
            .academicLevel(request.getAcademicLevel())
            .status(request.getStatus() != null ? request.getStatus() : UserStatus.ACTIVE)
            .employeeId(request.getEmployeeId())
            .studentId(request.getStudentId())
            .phoneNumber(request.getPhoneNumber())
            .dateOfBirth(request.getDateOfBirth())
            .address(request.getAddress())
            .city(request.getCity())
            .state(request.getState())
            .postalCode(request.getPostalCode())
            .country(request.getCountry())
            .department(request.getDepartment())
            .yearOfStudy(request.getYearOfStudy())
            .gpa(request.getGpa())
            .enrollmentDate(request.getEnrollmentDate() != null ? request.getEnrollmentDate() : 
                (request.getRole() == Role.STUDENT ? LocalDate.now() : null))
            .graduationDate(request.getGraduationDate())
            .admissionDate(request.getAdmissionDate())
            .expectedGraduationDate(request.getExpectedGraduationDate())
            .emergencyContactName(request.getEmergencyContactName())
            .emergencyContactPhone(request.getEmergencyContactPhone())
            .emergencyContactRelationship(request.getEmergencyContactRelationship())
            .profilePictureUrl(request.getProfilePictureUrl())
            .preferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : "en")
            .timezone(request.getTimezone() != null ? request.getTimezone() : "UTC")
            .build();

        try {
            User savedUser = userRepository.save(user);
            log.info("User created successfully with id: {}", savedUser.getId());
            return savedUser;
        } catch (Exception e) {
            log.error("Error creating user: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid user data: " + e.getMessage());
        }
    }

    public User updateUser(Long id, UpdateUserRequest request) {
        User user = getUserById(id);

        // Check if username already exists (excluding current user)
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty() &&
            !user.getUsername().equals(request.getUsername()) && 
            userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists: " + request.getUsername());
        }

        // Check if email already exists (excluding current user)
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() &&
            !user.getEmail().equals(request.getEmail()) && 
            userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists: " + request.getEmail());
        }

        // Check if employee ID already exists (excluding current user)
        if (request.getEmployeeId() != null && !request.getEmployeeId().isEmpty() &&
            !request.getEmployeeId().equals(user.getEmployeeId()) &&
            userRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new UserAlreadyExistsException("Employee ID already exists: " + request.getEmployeeId());
        }

        // Check if student ID already exists (excluding current user)
        if (request.getStudentId() != null && !request.getStudentId().isEmpty() &&
            !request.getStudentId().equals(user.getStudentId()) &&
            userRepository.existsByStudentId(request.getStudentId())) {
            throw new UserAlreadyExistsException("Student ID already exists: " + request.getStudentId());
        }

        // Update user fields (only if provided)
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            user.setUsername(request.getUsername());
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            user.setEmail(request.getEmail());
        }
        if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
            user.setLastName(request.getLastName());
        }
        user.setRole(request.getRole());
        user.setUserType(request.getUserType());
        user.setEmployeeType(request.getEmployeeType());
        user.setAcademicLevel(request.getAcademicLevel());
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        user.setEmployeeId(request.getEmployeeId());
        user.setStudentId(request.getStudentId());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setAddress(request.getAddress());
        user.setCity(request.getCity());
        user.setState(request.getState());
        user.setPostalCode(request.getPostalCode());
        user.setCountry(request.getCountry());
        user.setDepartment(request.getDepartment());
        user.setYearOfStudy(request.getYearOfStudy());
        user.setGpa(request.getGpa());
        user.setEnrollmentDate(request.getEnrollmentDate());
        user.setGraduationDate(request.getGraduationDate());
        user.setAdmissionDate(request.getAdmissionDate());
        user.setExpectedGraduationDate(request.getExpectedGraduationDate());
        user.setEmergencyContactName(request.getEmergencyContactName());
        user.setEmergencyContactPhone(request.getEmergencyContactPhone());
        user.setEmergencyContactRelationship(request.getEmergencyContactRelationship());
        user.setProfilePictureUrl(request.getProfilePictureUrl());
        if (request.getPreferredLanguage() != null) {
            user.setPreferredLanguage(request.getPreferredLanguage());
        }
        if (request.getTimezone() != null) {
            user.setTimezone(request.getTimezone());
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated successfully with id: {}", updatedUser.getId());
        return updatedUser;
    }

    public void deleteUser(Long id) {
        User user = getUserById(id);
        
        // Check if user has any active registrations
        if (!user.getRegistrations().isEmpty()) {
            throw new IllegalStateException("Cannot delete user with active registrations");
        }

        userRepository.delete(user);
        log.info("User deleted successfully with id: {}", id);
    }

    public User updateUserStatus(Long id, String status) {
        User user = getUserById(id);
        user.setStatus(UserStatus.valueOf(status.toUpperCase()));
        
        User updatedUser = userRepository.save(user);
        log.info("User status updated successfully for id: {} to status: {}", id, status);
        return updatedUser;
    }

    // Department Management
    public List<com.university.backend.dto.response.DepartmentResponse> getAllDepartments() {
        var departments = departmentRepository.findAll();
        return departments.stream()
            .map(this::convertToDepartmentResponse)
            .toList();
    }

    public com.university.backend.dto.response.DepartmentResponse createDepartment(
            com.university.backend.dto.request.CreateDepartmentRequest request) {
        
        // Check if department code already exists
        if (departmentRepository.existsByCode(request.getCode())) {
            throw new DepartmentAlreadyExistsException("Department with code " + request.getCode() + " already exists");
        }

        Department department = Department.builder()
            .name(request.getName())
            .code(request.getCode())
            .description(request.getDescription())
            .headOfDepartment(request.getHeadOfDepartment())
            .headEmail(request.getHeadEmail())
            .building(request.getBuilding())
            .roomNumber(request.getRoomNumber())
            .phoneNumber(request.getPhoneNumber())
            .email(request.getEmail())
            .website(request.getWebsite())
            .budgetAllocation(request.getBudgetAllocation())
            .status(request.getStatus() != null ? request.getStatus() : DepartmentStatus.ACTIVE)
            .build();

        Department savedDepartment = departmentRepository.save(department);
        log.info("Department created successfully with id: {}", savedDepartment.getId());
        return convertToDepartmentResponse(savedDepartment);
    }

    public com.university.backend.dto.response.DepartmentResponse updateDepartment(
            Long id, com.university.backend.dto.request.UpdateDepartmentRequest request) {
        
        Department department = departmentRepository.findById(id)
            .orElseThrow(() -> new DepartmentNotFoundException("Department not found with id: " + id));

        // Check if department code already exists (excluding current department)
        if (request.getCode() != null && !request.getCode().trim().isEmpty() &&
            !department.getCode().equals(request.getCode()) && 
            departmentRepository.existsByCode(request.getCode())) {
            throw new DepartmentAlreadyExistsException("Department with code " + request.getCode() + " already exists");
        }

        // Only update fields that are provided (not null or empty)
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            department.setName(request.getName());
        }
        if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
            department.setCode(request.getCode());
        }
        if (request.getDescription() != null) {
            department.setDescription(request.getDescription());
        }
        if (request.getHeadOfDepartment() != null && !request.getHeadOfDepartment().trim().isEmpty()) {
            department.setHeadOfDepartment(request.getHeadOfDepartment());
        }
        if (request.getHeadEmail() != null && !request.getHeadEmail().trim().isEmpty()) {
            department.setHeadEmail(request.getHeadEmail());
        }
        if (request.getBuilding() != null && !request.getBuilding().trim().isEmpty()) {
            department.setBuilding(request.getBuilding());
        }
        if (request.getRoomNumber() != null && !request.getRoomNumber().trim().isEmpty()) {
            department.setRoomNumber(request.getRoomNumber());
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            department.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            department.setEmail(request.getEmail());
        }
        if (request.getWebsite() != null && !request.getWebsite().trim().isEmpty()) {
            department.setWebsite(request.getWebsite());
        }
        if (request.getBudgetAllocation() != null) {
            department.setBudgetAllocation(request.getBudgetAllocation());
        }
        if (request.getStatus() != null) {
            department.setStatus(request.getStatus());
        }

        Department updatedDepartment = departmentRepository.save(department);
        log.info("Department updated successfully with id: {}", updatedDepartment.getId());
        return convertToDepartmentResponse(updatedDepartment);
    }

    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
            .orElseThrow(() -> new DepartmentNotFoundException("Department not found with id: " + id));
        
        // Check if department has any users
        if (userRepository.existsByDepartment(department.getCode())) {
            throw new IllegalStateException("Cannot delete department with existing users");
        }

        // Check if department has any courses
        if (courseRepository.existsByDepartment(department.getCode())) {
            throw new IllegalStateException("Cannot delete department with existing courses");
        }

        departmentRepository.delete(department);
        log.info("Department deleted successfully with id: {}", id);
    }

    // Course Management
    public List<com.university.backend.dto.response.CourseResponse> getAllCoursesForAdmin(Pageable pageable) {
        Page<Course> courses = courseRepository.findAll(pageable);
        return courses.getContent().stream()
            .map(this::convertToCourseResponse)
            .toList();
    }

    public com.university.backend.dto.response.CourseResponse updateCourseStatus(Long id, String status) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new CourseNotFoundException("Course not found with id: " + id));
        
        course.setStatus(CourseStatus.valueOf(status.toUpperCase()));
        Course updatedCourse = courseRepository.save(course);
        
        log.info("Course status updated successfully for id: {} to status: {}", id, status);
        return convertToCourseResponse(updatedCourse);
    }

    // Registration Management
    public List<com.university.backend.dto.response.RegistrationResponse> getAllRegistrations(
            Pageable pageable, String status, String paymentStatus) {
        
        if (status != null && paymentStatus != null) {
            Page<Registration> registrations = registrationRepository.findByStatusAndPaymentStatus(
                RegistrationStatus.valueOf(status.toUpperCase()), 
                PaymentStatus.valueOf(paymentStatus.toUpperCase()), 
                pageable);
            return registrations.getContent().stream()
                .map(this::convertToRegistrationResponse)
                .toList();
        } else if (status != null) {
            Page<Registration> registrations = registrationRepository.findByStatus(
                RegistrationStatus.valueOf(status.toUpperCase()), 
                pageable);
            return registrations.getContent().stream()
                .map(this::convertToRegistrationResponse)
                .toList();
        } else if (paymentStatus != null) {
            Page<Registration> registrations = registrationRepository.findByPaymentStatus(
                PaymentStatus.valueOf(paymentStatus.toUpperCase()), 
                pageable);
            return registrations.getContent().stream()
                .map(this::convertToRegistrationResponse)
                .toList();
        } else {
            Page<Registration> registrations = registrationRepository.findAll(pageable);
            return registrations.getContent().stream()
                .map(this::convertToRegistrationResponse)
                .toList();
        }
    }

    public com.university.backend.dto.response.RegistrationResponse updatePaymentStatus(
            Long id, String paymentStatus) {
        Registration registration = registrationRepository.findById(id)
            .orElseThrow(() -> new RegistrationNotFoundException("Registration not found with id: " + id));
        
        registration.setPaymentStatus(PaymentStatus.valueOf(paymentStatus.toUpperCase()));
        Registration updatedRegistration = registrationRepository.save(registration);
        
        log.info("Payment status updated successfully for registration id: {} to status: {}", id, paymentStatus);
        return convertToRegistrationResponse(updatedRegistration);
    }

    public com.university.backend.dto.response.RegistrationResponse updateGrade(Long id, String grade) {
        Registration registration = registrationRepository.findById(id)
            .orElseThrow(() -> new RegistrationNotFoundException("Registration not found with id: " + id));
        
        registration.setGrade(grade);
        // Calculate grade points based on grade
        registration.setGradePoints(calculateGradePoints(grade));
        Registration updatedRegistration = registrationRepository.save(registration);
        
        log.info("Grade updated successfully for registration id: {} to grade: {}", id, grade);
        return convertToRegistrationResponse(updatedRegistration);
    }

    public com.university.backend.dto.response.RegistrationResponse updateRegistrationStatus(Long id, String status) {
        Registration registration = registrationRepository.findById(id)
            .orElseThrow(() -> new RegistrationNotFoundException("Registration not found with id: " + id));
        
        try {
            RegistrationStatus registrationStatus = RegistrationStatus.valueOf(status.toUpperCase());
            registration.setStatus(registrationStatus);
            Registration updatedRegistration = registrationRepository.save(registration);
            
            log.info("Registration status updated successfully for registration id: {} to status: {}", id, status);
            return convertToRegistrationResponse(updatedRegistration);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid registration status: " + status);
        }
    }

    public void unenrollStudent(Long registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
            .orElseThrow(() -> new RegistrationNotFoundException("Registration not found with id: " + registrationId));
        
        registrationRepository.delete(registration);
        log.info("Student unenrolled successfully for registration id: {}", registrationId);
    }

    // Reports
    public com.university.backend.dto.response.FinancialReportResponse getFinancialReport(
            String startDate, String endDate) {
        
        com.university.backend.dto.response.FinancialReportResponse report = 
            new com.university.backend.dto.response.FinancialReportResponse();
        
        // Calculate total revenue
        Double totalRevenue = registrationRepository.getTotalRevenue();
        report.setTotalRevenue(totalRevenue != null ? BigDecimal.valueOf(totalRevenue) : BigDecimal.ZERO);
        
        // Calculate pending amount
        var unpaidRegistrations = registrationRepository.findUnpaidRegistrations();
        report.setTotalPending(BigDecimal.valueOf(unpaidRegistrations.size() * 100.0)); // Simplified calculation
        
        // Count of paid vs unpaid registrations
        long paidCount = registrationRepository.countByPaymentStatus(PaymentStatus.PAID);
        report.setTotalPaid(BigDecimal.valueOf(paidCount * 100.0)); // Simplified calculation
        
        report.setTotalTransactions((int) registrationRepository.count());
        report.setReportGeneratedAt(LocalDateTime.now());
        
        log.info("Financial report generated successfully");
        return report;
    }

    public com.university.backend.dto.response.AcademicReportResponse getAcademicReport() {
        com.university.backend.dto.response.AcademicReportResponse report = 
            new com.university.backend.dto.response.AcademicReportResponse();
        
        // Count students by status
        long totalStudents = userRepository.countActiveStudents();
        report.setTotalStudents((int) totalStudents);
        
        // Count instructors
        long totalInstructors = userRepository.countActiveFaculty();
        report.setTotalInstructors((int) totalInstructors);
        
        // Count courses
        long totalCourses = courseRepository.count();
        report.setTotalCourses((int) totalCourses);
        
        // Count departments
        long totalDepartments = departmentRepository.count();
        report.setTotalDepartments((int) totalDepartments);
        
        // Calculate completion rate
        long totalRegistrations = registrationRepository.count();
        long completedRegistrations = registrationRepository.countRegistrationsByStatus(RegistrationStatus.COMPLETED);
        double completionRate = totalRegistrations > 0 ? (double) completedRegistrations / totalRegistrations * 100 : 0;
        report.setAverageCompletionRate(completionRate);
        
        report.setReportGeneratedAt(LocalDateTime.now());
        
        log.info("Academic report generated successfully");
        return report;
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
            .city(user.getCity())
            .state(user.getState())
            .postalCode(user.getPostalCode())
            .country(user.getCountry())
            .enrollmentDate(user.getEnrollmentDate())
            .graduationDate(user.getGraduationDate())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }

    private com.university.backend.dto.response.DepartmentResponse convertToDepartmentResponse(Department department) {
        com.university.backend.dto.response.DepartmentResponse response = new com.university.backend.dto.response.DepartmentResponse();
        response.setId(department.getId());
        response.setName(department.getName());
        response.setCode(department.getCode());
        response.setDescription(department.getDescription());
        response.setHeadOfDepartment(department.getHeadOfDepartment());
        response.setStatus(department.getStatus().name());
        response.setCreatedAt(department.getCreatedAt());
        response.setUpdatedAt(department.getCreatedAt()); // Using createdAt as updatedAt since Department doesn't have updatedAt
        return response;
    }

    private com.university.backend.dto.response.CourseResponse convertToCourseResponse(Course course) {
        return com.university.backend.dto.response.CourseResponse.builder()
            .id(course.getId())
            .code(course.getCode())
            .title(course.getTitle())
            .description(course.getDescription())
            .instructor(course.getInstructor())
            .schedule(course.getSchedule())
            .credits(course.getCredits())
            .maxStudents(course.getMaxStudents())
            .enrolledStudents(course.getRegistrations() != null ? course.getRegistrations().size() : 0)
            .createdAt(course.getCreatedAt())
            .updatedAt(course.getUpdatedAt())
            .build();
    }

    private com.university.backend.dto.response.RegistrationResponse convertToRegistrationResponse(Registration registration) {
        return com.university.backend.dto.response.RegistrationResponse.builder()
            .id(registration.getId())
            .user(convertToUserResponse(registration.getUser()))
            .course(convertToCourseResponse(registration.getCourse()))
            .registrationDate(registration.getRegistrationDate())
            .grade(registration.getGrade())
            .status(registration.getStatus().name())
            .build();
    }

    private Double calculateGradePoints(String grade) {
        if (grade == null || grade.isEmpty()) {
            return null;
        }
        
        return switch (grade.toUpperCase()) {
            case "A" -> 4.0;
            case "A-" -> 3.7;
            case "B+" -> 3.3;
            case "B" -> 3.0;
            case "B-" -> 2.7;
            case "C+" -> 2.3;
            case "C" -> 2.0;
            case "C-" -> 1.7;
            case "D+" -> 1.3;
            case "D" -> 1.0;
            case "F" -> 0.0;
            default -> null;
        };
    }
}
