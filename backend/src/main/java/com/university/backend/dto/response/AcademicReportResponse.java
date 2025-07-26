package com.university.backend.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class AcademicReportResponse {
    private int totalStudents;
    private int totalInstructors;
    private int totalCourses;
    private int totalDepartments;
    private double averageEnrollmentRate;
    private double averageCompletionRate;
    private LocalDateTime reportGeneratedAt;
    private List<DepartmentStats> departmentStatistics;
    private List<CourseStats> topCourses;
    private List<EnrollmentTrend> enrollmentTrends;
    
    // Constructors
    public AcademicReportResponse() {}
    
    public AcademicReportResponse(int totalStudents, int totalInstructors, int totalCourses,
                                 int totalDepartments, double averageEnrollmentRate,
                                 double averageCompletionRate, LocalDateTime reportGeneratedAt,
                                 List<DepartmentStats> departmentStatistics,
                                 List<CourseStats> topCourses,
                                 List<EnrollmentTrend> enrollmentTrends) {
        this.totalStudents = totalStudents;
        this.totalInstructors = totalInstructors;
        this.totalCourses = totalCourses;
        this.totalDepartments = totalDepartments;
        this.averageEnrollmentRate = averageEnrollmentRate;
        this.averageCompletionRate = averageCompletionRate;
        this.reportGeneratedAt = reportGeneratedAt;
        this.departmentStatistics = departmentStatistics;
        this.topCourses = topCourses;
        this.enrollmentTrends = enrollmentTrends;
    }
    
    // Getters and Setters
    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }
    
    public int getTotalInstructors() { return totalInstructors; }
    public void setTotalInstructors(int totalInstructors) { this.totalInstructors = totalInstructors; }
    
    public int getTotalCourses() { return totalCourses; }
    public void setTotalCourses(int totalCourses) { this.totalCourses = totalCourses; }
    
    public int getTotalDepartments() { return totalDepartments; }
    public void setTotalDepartments(int totalDepartments) { this.totalDepartments = totalDepartments; }
    
    public double getAverageEnrollmentRate() { return averageEnrollmentRate; }
    public void setAverageEnrollmentRate(double averageEnrollmentRate) { this.averageEnrollmentRate = averageEnrollmentRate; }
    
    public double getAverageCompletionRate() { return averageCompletionRate; }
    public void setAverageCompletionRate(double averageCompletionRate) { this.averageCompletionRate = averageCompletionRate; }
    
    public LocalDateTime getReportGeneratedAt() { return reportGeneratedAt; }
    public void setReportGeneratedAt(LocalDateTime reportGeneratedAt) { this.reportGeneratedAt = reportGeneratedAt; }
    
    public List<DepartmentStats> getDepartmentStatistics() { return departmentStatistics; }
    public void setDepartmentStatistics(List<DepartmentStats> departmentStatistics) { this.departmentStatistics = departmentStatistics; }
    
    public List<CourseStats> getTopCourses() { return topCourses; }
    public void setTopCourses(List<CourseStats> topCourses) { this.topCourses = topCourses; }
    
    public List<EnrollmentTrend> getEnrollmentTrends() { return enrollmentTrends; }
    public void setEnrollmentTrends(List<EnrollmentTrend> enrollmentTrends) { this.enrollmentTrends = enrollmentTrends; }
    
    // Inner classes for nested data
    public static class DepartmentStats {
        private String departmentName;
        private int totalCourses;
        private int totalStudents;
        private int totalInstructors;
        private double averageGPA;
        
        public DepartmentStats() {}
        
        public DepartmentStats(String departmentName, int totalCourses, int totalStudents, 
                              int totalInstructors, double averageGPA) {
            this.departmentName = departmentName;
            this.totalCourses = totalCourses;
            this.totalStudents = totalStudents;
            this.totalInstructors = totalInstructors;
            this.averageGPA = averageGPA;
        }
        
        // Getters and Setters
        public String getDepartmentName() { return departmentName; }
        public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
        
        public int getTotalCourses() { return totalCourses; }
        public void setTotalCourses(int totalCourses) { this.totalCourses = totalCourses; }
        
        public int getTotalStudents() { return totalStudents; }
        public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }
        
        public int getTotalInstructors() { return totalInstructors; }
        public void setTotalInstructors(int totalInstructors) { this.totalInstructors = totalInstructors; }
        
        public double getAverageGPA() { return averageGPA; }
        public void setAverageGPA(double averageGPA) { this.averageGPA = averageGPA; }
    }
    
    public static class CourseStats {
        private String courseName;
        private String courseCode;
        private int totalEnrollments;
        private double completionRate;
        private double averageGrade;
        
        public CourseStats() {}
        
        public CourseStats(String courseName, String courseCode, int totalEnrollments,
                          double completionRate, double averageGrade) {
            this.courseName = courseName;
            this.courseCode = courseCode;
            this.totalEnrollments = totalEnrollments;
            this.completionRate = completionRate;
            this.averageGrade = averageGrade;
        }
        
        // Getters and Setters
        public String getCourseName() { return courseName; }
        public void setCourseName(String courseName) { this.courseName = courseName; }
        
        public String getCourseCode() { return courseCode; }
        public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
        
        public int getTotalEnrollments() { return totalEnrollments; }
        public void setTotalEnrollments(int totalEnrollments) { this.totalEnrollments = totalEnrollments; }
        
        public double getCompletionRate() { return completionRate; }
        public void setCompletionRate(double completionRate) { this.completionRate = completionRate; }
        
        public double getAverageGrade() { return averageGrade; }
        public void setAverageGrade(double averageGrade) { this.averageGrade = averageGrade; }
    }
    
    public static class EnrollmentTrend {
        private String period;
        private int totalEnrollments;
        private int newStudents;
        private int graduatedStudents;
        
        public EnrollmentTrend() {}
        
        public EnrollmentTrend(String period, int totalEnrollments, int newStudents, int graduatedStudents) {
            this.period = period;
            this.totalEnrollments = totalEnrollments;
            this.newStudents = newStudents;
            this.graduatedStudents = graduatedStudents;
        }
        
        // Getters and Setters
        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }
        
        public int getTotalEnrollments() { return totalEnrollments; }
        public void setTotalEnrollments(int totalEnrollments) { this.totalEnrollments = totalEnrollments; }
        
        public int getNewStudents() { return newStudents; }
        public void setNewStudents(int newStudents) { this.newStudents = newStudents; }
        
        public int getGraduatedStudents() { return graduatedStudents; }
        public void setGraduatedStudents(int graduatedStudents) { this.graduatedStudents = graduatedStudents; }
    }
}
