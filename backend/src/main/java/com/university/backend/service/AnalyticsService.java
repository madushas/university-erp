package com.university.backend.service;

import com.university.backend.entity.PaymentStatus;
import com.university.backend.entity.RegistrationStatus;
import com.university.backend.entity.UserStatus;
import com.university.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AnalyticsService {
    
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final RegistrationRepository registrationRepository;
    private final DepartmentRepository departmentRepository;
    private final AcademicSemesterRepository academicSemesterRepository;

    public Map<String, Object> getDashboardAnalytics() {
        log.info("Generating dashboard analytics");
        
        Map<String, Object> analytics = new HashMap<>();
        
        // Student Statistics
        analytics.put("totalStudents", userRepository.countActiveStudents());
        analytics.put("totalFaculty", userRepository.countActiveFaculty());
        analytics.put("totalCourses", courseRepository.count());
        analytics.put("totalRegistrations", registrationRepository.count());
        analytics.put("totalDepartments", departmentRepository.count());
        
        // Registration Statistics
        analytics.put("activeRegistrations", registrationRepository.countRegistrationsByStatus(RegistrationStatus.ENROLLED));
        analytics.put("completedRegistrations", registrationRepository.countRegistrationsByStatus(RegistrationStatus.COMPLETED));
        analytics.put("droppedRegistrations", registrationRepository.countRegistrationsByStatus(RegistrationStatus.DROPPED));
        
        // Financial Statistics
        Double totalRevenue = registrationRepository.getTotalRevenue();
        analytics.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        
        long unpaidCount = registrationRepository.findUnpaidRegistrations().size();
        analytics.put("unpaidRegistrations", unpaidCount);
        
        // Academic Performance
        analytics.put("registrationsWithGrades", registrationRepository.findRegistrationsWithGrades().size());
        analytics.put("registrationsWithoutGrades", registrationRepository.findRegistrationsWithoutGrades().size());
        analytics.put("transcriptsNotReleased", registrationRepository.findCompletedRegistrationsWithoutTranscript().size());
        analytics.put("certificatesNotIssued", registrationRepository.findCompletedRegistrationsWithoutCertificate().size());
        
        // Course Availability
        analytics.put("availableCourses", courseRepository.findAvailableCourses().size());
        
        return analytics;
    }

    public Map<String, Object> getDepartmentAnalytics(String departmentCode) {
        log.info("Generating analytics for department: {}", departmentCode);
        
        Map<String, Object> analytics = new HashMap<>();
        
        // Department Courses
        var departmentCourses = courseRepository.findActiveCoursesByDepartment(departmentCode);
        analytics.put("totalCourses", departmentCourses.size());
        
        // Department Registrations
        var departmentRegistrations = registrationRepository.findRegistrationsByDepartment(departmentCode);
        analytics.put("totalRegistrations", departmentRegistrations.size());
        
        // Department Revenue
        Double departmentRevenue = registrationRepository.getTotalRevenueByDepartment(departmentCode);
        analytics.put("totalRevenue", departmentRevenue != null ? departmentRevenue : 0.0);
        
        // Average Course Fee
        Double avgCourseFee = courseRepository.getAverageCourseFeeByDepartment(departmentCode);
        analytics.put("averageCourseFee", avgCourseFee != null ? avgCourseFee : 0.0);
        
        // Department Students
        var departmentStudents = userRepository.findByDepartment(departmentCode);
        analytics.put("totalStudents", departmentStudents.size());
        
        return analytics;
    }

    public Map<String, Object> getCourseAnalytics(Long courseId) {
        log.info("Generating analytics for course: {}", courseId);
        
        Map<String, Object> analytics = new HashMap<>();
        
        // Course Enrollment
        Long enrolledCount = registrationRepository.countEnrolledStudentsByCourseId(courseId);
        analytics.put("enrolledStudents", enrolledCount);
        
        // Course Performance
        Double avgGradePoints = registrationRepository.getAverageGradePointsByCourse(courseId);
        analytics.put("averageGradePoints", avgGradePoints != null ? avgGradePoints : 0.0);
        
        // Course Registrations by Status
        var courseRegistrations = registrationRepository.findByCourseIdWithDetails(courseId);
        long enrolled = courseRegistrations.stream().mapToLong(r -> r.getStatus() == RegistrationStatus.ENROLLED ? 1 : 0).sum();
        long completed = courseRegistrations.stream().mapToLong(r -> r.getStatus() == RegistrationStatus.COMPLETED ? 1 : 0).sum();
        long dropped = courseRegistrations.stream().mapToLong(r -> r.getStatus() == RegistrationStatus.DROPPED ? 1 : 0).sum();
        
        analytics.put("enrolledCount", enrolled);
        analytics.put("completedCount", completed);
        analytics.put("droppedCount", dropped);
        analytics.put("totalRegistrations", courseRegistrations.size());
        
        // Attendance Analytics
        double avgAttendance = courseRegistrations.stream()
            .filter(r -> r.getAttendancePercentage() != null)
            .mapToDouble(r -> r.getAttendancePercentage())
            .average()
            .orElse(0.0);
        analytics.put("averageAttendance", avgAttendance);
        
        // Payment Analytics
        long paidCount = courseRegistrations.stream().mapToLong(r -> r.getPaymentStatus() == PaymentStatus.PAID ? 1 : 0).sum();
        long pendingCount = courseRegistrations.stream().mapToLong(r -> r.getPaymentStatus() == PaymentStatus.PENDING ? 1 : 0).sum();
        
        analytics.put("paidRegistrations", paidCount);
        analytics.put("pendingPayments", pendingCount);
        
        return analytics;
    }

    public Map<String, Object> getStudentAnalytics(Long studentId) {
        log.info("Generating analytics for student: {}", studentId);
        
        Map<String, Object> analytics = new HashMap<>();
        
        // Student Registrations
        var studentRegistrations = registrationRepository.findByUserIdWithDetails(studentId);
        analytics.put("totalRegistrations", studentRegistrations.size());
        
        // Academic Performance
        Double avgGradePoints = registrationRepository.getAverageGradePointsByStudent(studentId);
        analytics.put("currentGPA", avgGradePoints != null ? avgGradePoints : 0.0);
        
        // Registration Status Breakdown
        long activeRegistrations = studentRegistrations.stream().mapToLong(r -> r.getStatus() == RegistrationStatus.ENROLLED ? 1 : 0).sum();
        long completedRegistrations = studentRegistrations.stream().mapToLong(r -> r.getStatus() == RegistrationStatus.COMPLETED ? 1 : 0).sum();
        long droppedRegistrations = studentRegistrations.stream().mapToLong(r -> r.getStatus() == RegistrationStatus.DROPPED ? 1 : 0).sum();
        
        analytics.put("activeRegistrations", activeRegistrations);
        analytics.put("completedRegistrations", completedRegistrations);
        analytics.put("droppedRegistrations", droppedRegistrations);
        
        // Total Credits
        int totalCredits = studentRegistrations.stream()
            .filter(r -> r.getStatus() == RegistrationStatus.COMPLETED || r.getStatus() == RegistrationStatus.ENROLLED)
            .mapToInt(r -> r.getCourse().getCredits())
            .sum();
        analytics.put("totalCredits", totalCredits);
        
        // Financial Summary
        BigDecimal totalFeePaid = studentRegistrations.stream()
            .filter(r -> r.getCourseFeePaid() != null)
            .map(r -> r.getCourseFeePaid())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        analytics.put("totalFeePaid", totalFeePaid);
        
        // Outstanding Payments
        long outstandingPayments = studentRegistrations.stream()
            .mapToLong(r -> (r.getPaymentStatus() == PaymentStatus.PENDING || r.getPaymentStatus() == PaymentStatus.OVERDUE) ? 1 : 0)
            .sum();
        analytics.put("outstandingPayments", outstandingPayments);
        
        // Attendance Average
        double avgAttendance = studentRegistrations.stream()
            .filter(r -> r.getAttendancePercentage() != null)
            .mapToDouble(r -> r.getAttendancePercentage())
            .average()
            .orElse(0.0);
        analytics.put("averageAttendance", avgAttendance);
        
        return analytics;
    }

    public Map<String, Object> getRecentActivityAnalytics() {
        log.info("Generating recent activity analytics");
        
        Map<String, Object> analytics = new HashMap<>();
        
        LocalDateTime lastWeek = LocalDateTime.now().minusWeeks(1);
        LocalDateTime lastMonth = LocalDateTime.now().minusMonths(1);
        
        // Recent Registrations
        var recentRegistrations = registrationRepository.findRegistrationsByDateRange(lastWeek, LocalDateTime.now());
        analytics.put("recentRegistrations", recentRegistrations.size());
        
        var monthlyRegistrations = registrationRepository.findRegistrationsByDateRange(lastMonth, LocalDateTime.now());
        analytics.put("monthlyRegistrations", monthlyRegistrations.size());
        
        // Recent Grade Updates
        var gradedRegistrations = registrationRepository.findRegistrationsWithGrades();
        analytics.put("totalGradedRegistrations", gradedRegistrations.size());
        
        // Low Attendance Alerts
        var lowAttendanceRegistrations = registrationRepository.findRegistrationsWithLowAttendance(75.0);
        analytics.put("lowAttendanceAlerts", lowAttendanceRegistrations.size());
        
        return analytics;
    }

    public Map<String, Object> getFinancialAnalytics() {
        log.info("Generating financial analytics");
        
        Map<String, Object> analytics = new HashMap<>();
        
        // Total Revenue
        Double totalRevenue = registrationRepository.getTotalRevenue();
        analytics.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        
        // Payment Status Breakdown
        var unpaidRegistrations = registrationRepository.findUnpaidRegistrations();
        analytics.put("unpaidRegistrations", unpaidRegistrations.size());
        
        BigDecimal unpaidAmount = unpaidRegistrations.stream()
            .filter(r -> r.getCourse() != null && r.getCourse().getCourseFee() != null)
            .map(r -> r.getCourse().getCourseFee())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        analytics.put("unpaidAmount", unpaidAmount);
        
        // Revenue by Department
        Map<String, Double> revenueByDepartment = new HashMap<>();
        var departments = departmentRepository.findAll();
        for (var dept : departments) {
            Double deptRevenue = registrationRepository.getTotalRevenueByDepartment(dept.getCode());
            revenueByDepartment.put(dept.getName(), deptRevenue != null ? deptRevenue : 0.0);
        }
        analytics.put("revenueByDepartment", revenueByDepartment);
        
        return analytics;
    }
}
