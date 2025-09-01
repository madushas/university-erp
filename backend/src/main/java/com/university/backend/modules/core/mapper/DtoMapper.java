package com.university.backend.modules.core.mapper;

import com.university.backend.modules.core.entity.User;
import com.university.backend.modules.academic.entity.Course;
import com.university.backend.modules.academic.entity.Registration;
import com.university.backend.modules.academic.entity.Department;
import com.university.backend.modules.academic.entity.RegistrationStatus;
import com.university.backend.modules.core.dto.UserDto;
import com.university.backend.dto.response.UserResponse;
import com.university.backend.modules.academic.dto.CourseDto;
import com.university.backend.modules.academic.dto.RegistrationDto;
import com.university.backend.modules.academic.dto.DepartmentDto;
import com.university.backend.modules.financial.entity.StudentAccount;
import com.university.backend.modules.financial.entity.BillingStatement;
import com.university.backend.modules.financial.dto.StudentAccountDto;
import com.university.backend.modules.financial.dto.BillingStatementDto;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class DtoMapper {

    // User mapping
    public UserDto toUserDto(User user) {
        if (user == null) return null;
        
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .userType(user.getUserType())
                .employeeType(user.getEmployeeType())
                .academicLevel(user.getAcademicLevel())
                .status(user.getStatus())
                .employeeId(user.getEmployeeId())
                .studentId(user.getStudentId())
                .phoneNumber(user.getPhoneNumber())
                .dateOfBirth(user.getDateOfBirth())
                .address(user.getAddress())
                .city(user.getCity())
                .state(user.getState())
                .postalCode(user.getPostalCode())
                .country(user.getCountry())
                .department(user.getDepartment())
                .yearOfStudy(user.getYearOfStudy())
                .gpa(user.getGpa())
                .enrollmentDate(user.getEnrollmentDate())
                .graduationDate(user.getGraduationDate())
                .admissionDate(user.getAdmissionDate())
                .expectedGraduationDate(user.getExpectedGraduationDate())
                .emergencyContactName(user.getEmergencyContactName())
                .emergencyContactPhone(user.getEmergencyContactPhone())
                .emergencyContactRelationship(user.getEmergencyContactRelationship())
                .profilePictureUrl(user.getProfilePictureUrl())
                .preferredLanguage(user.getPreferredLanguage())
                .timezone(user.getTimezone())
                .lastLoginAt(user.getLastLoginAt())
                .passwordChangedAt(user.getPasswordChangedAt())
                .accountLockedUntil(user.getAccountLockedUntil())
                .failedLoginAttempts(user.getFailedLoginAttempts())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    // Course mapping
    public CourseDto toCourseDto(Course course) {
        if (course == null) return null;
        
        return CourseDto.builder()
                .id(course.getId())
                .code(course.getCode())
                .title(course.getTitle())
                .description(course.getDescription())
                .instructor(course.getInstructor())
                .instructorEmail(course.getInstructorEmail())
                .department(course.getDepartment())
                .courseLevel(course.getCourseLevel())
                .schedule(course.getSchedule())
                .classroom(course.getClassroom())
                .startDate(course.getStartDate())
                .endDate(course.getEndDate())
                .startTime(course.getStartTime())
                .endTime(course.getEndTime())
                .daysOfWeek(course.getDaysOfWeek())
                .credits(course.getCredits())
                .maxStudents(course.getMaxStudents())
                .minStudents(course.getMinStudents())
                .courseFee(course.getCourseFee())
                .prerequisites(course.getPrerequisites())
                .status(course.getStatus())
                .syllabusUrl(course.getSyllabusUrl())
                .textbook(course.getTextbook())
                .passingGrade(course.getPassingGrade())
                .enrolledStudents(calculateEnrolledStudents(course))
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }

    // Registration mapping
    public RegistrationDto toRegistrationDto(Registration registration) {
        if (registration == null) return null;
        
        return RegistrationDto.builder()
                .id(registration.getId())
                .user(toUserDto(registration.getUser()))
                .course(toCourseDto(registration.getCourse()))
                .registrationDate(registration.getRegistrationDate())
                .grade(registration.getGrade())
                .gradePoints(registration.getGradePoints())
                .status(registration.getStatus())
                .attendancePercentage(registration.getAttendancePercentage())
                .midtermGrade(registration.getMidtermGrade())
                .finalGrade(registration.getFinalGrade())
                .courseFeePaid(registration.getCourseFeePaid())
                .paymentStatus(registration.getPaymentStatus())
                .paymentDate(registration.getPaymentDate())
                .paymentMethod(registration.getPaymentMethod())
                .transcriptReleased(registration.getTranscriptReleased())
                .completionDate(registration.getCompletionDate())
                .certificateIssued(registration.getCertificateIssued())
                .notes(registration.getNotes())
                .updatedAt(registration.getUpdatedAt())
                .build();
    }

    // Department mapping
    public DepartmentDto toDepartmentDto(Department department) {
        if (department == null) return null;
        
        return DepartmentDto.builder()
                .id(department.getId())
                .code(department.getCode())
                .name(department.getName())
                .description(department.getDescription())
                .headOfDepartment(department.getHeadOfDepartment())
                .headEmail(department.getHeadEmail())
                .headId(department.getHead() != null ? department.getHead().getId() : null)
                .building(department.getBuilding())
                .roomNumber(department.getRoomNumber())
                .phoneNumber(department.getPhoneNumber())
                .email(department.getEmail())
                .website(department.getWebsite())
                .budgetAllocation(department.getBudgetAllocation())
                .status(department.getStatus())
                .collegeId(department.getCollege() != null ? department.getCollege().getId() : null)
                .collegeName(department.getCollege() != null ? department.getCollege().getName() : null)
                .createdAt(department.getCreatedAt())
                .updatedAt(department.getUpdatedAt())
                .build();
    }

    // Financial mappings
    public StudentAccountDto toStudentAccountDto(StudentAccount account) {
        if (account == null) return null;
        
        return StudentAccountDto.builder()
                .id(account.getId())
                .student(toUserDto(account.getStudent()))
                .accountNumber(account.getAccountNumber())
                .currentBalance(account.getCurrentBalance())
                .creditLimit(account.getCreditLimit())
                .status(account.getAccountStatus())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }

    public BillingStatementDto toBillingStatementDto(BillingStatement statement) {
        if (statement == null) return null;
        
        return BillingStatementDto.builder()
                .id(statement.getId())
                .studentAccount(toStudentAccountDto(statement.getStudentAccount()))
                .statementNumber(statement.getStatementNumber())
                .billingDate(statement.getBillingDate())
                .dueDate(statement.getDueDate())
                .totalAmount(statement.getTotalAmount())
                .paidAmount(statement.getPaidAmount())
                .outstandingAmount(statement.getBalanceAmount()) // Use balanceAmount instead of outstandingAmount
                .status(statement.getStatus())
                .paymentTerms(statement.getPaymentTerms())
                .notes(statement.getNotes())
                .createdAt(statement.getCreatedAt())
                .updatedAt(statement.getUpdatedAt())
                .build();
    }
    
    // Simplified mappings - will be expanded as entities are properly migrated
    
    // TODO: Add other entity mappings as they are migrated to modules

    // List mapping utilities
    public List<UserDto> toUserDtoList(List<User> users) {
        return users != null ? users.stream().map(this::toUserDto).collect(Collectors.toList()) : null;
    }

    public List<CourseDto> toCourseDtoList(List<Course> courses) {
        return courses != null ? courses.stream().map(this::toCourseDto).collect(Collectors.toList()) : null;
    }

    public List<RegistrationDto> toRegistrationDtoList(List<Registration> registrations) {
        return registrations != null ? registrations.stream().map(this::toRegistrationDto).collect(Collectors.toList()) : null;
    }

    public List<DepartmentDto> toDepartmentDtoList(List<Department> departments) {
        return departments != null ? departments.stream().map(this::toDepartmentDto).collect(Collectors.toList()) : null;
    }

    public List<BillingStatementDto> toBillingStatementDtoList(List<BillingStatement> statements) {
        return statements != null ? statements.stream().map(this::toBillingStatementDto).collect(Collectors.toList()) : null;
    }

    // Helper method to calculate enrolled students count
    private Integer calculateEnrolledStudents(Course course) {
        if (course.getRegistrations() == null) {
            return 0;
        }
        
        return (int) course.getRegistrations().stream()
                .filter(registration -> registration.getStatus() == RegistrationStatus.ENROLLED)
                .count();
    }

    // User to UserResponse mapping
    public UserResponse toUserResponse(User user) {
        if (user == null) return null;
        
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .employeeId(user.getEmployeeId())
                .studentId(user.getStudentId())
                .phoneNumber(user.getPhoneNumber())
                .dateOfBirth(user.getDateOfBirth())
                .address(user.getAddress())
                .city(user.getCity())
                .state(user.getState())
                .postalCode(user.getPostalCode())
                .country(user.getCountry())
                .department(user.getDepartment())
                .yearOfStudy(user.getYearOfStudy())
                .gpa(user.getGpa())
                .status(user.getStatus())
                .enrollmentDate(user.getEnrollmentDate())
                .graduationDate(user.getGraduationDate())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}