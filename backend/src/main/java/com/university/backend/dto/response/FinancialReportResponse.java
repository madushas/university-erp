package com.university.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class FinancialReportResponse {
    private BigDecimal totalRevenue;
    private BigDecimal totalPending;
    private BigDecimal totalPaid;
    private BigDecimal totalOverdue;
    private int totalTransactions;
    private LocalDateTime reportGeneratedAt;
    private List<DepartmentRevenue> departmentBreakdown;
    private List<MonthlyRevenue> monthlyTrend;
    
    // Constructors
    public FinancialReportResponse() {}
    
    public FinancialReportResponse(BigDecimal totalRevenue, BigDecimal totalPending, 
                                  BigDecimal totalPaid, BigDecimal totalOverdue, 
                                  int totalTransactions, LocalDateTime reportGeneratedAt,
                                  List<DepartmentRevenue> departmentBreakdown,
                                  List<MonthlyRevenue> monthlyTrend) {
        this.totalRevenue = totalRevenue;
        this.totalPending = totalPending;
        this.totalPaid = totalPaid;
        this.totalOverdue = totalOverdue;
        this.totalTransactions = totalTransactions;
        this.reportGeneratedAt = reportGeneratedAt;
        this.departmentBreakdown = departmentBreakdown;
        this.monthlyTrend = monthlyTrend;
    }
    
    // Getters and Setters
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    
    public BigDecimal getTotalPending() { return totalPending; }
    public void setTotalPending(BigDecimal totalPending) { this.totalPending = totalPending; }
    
    public BigDecimal getTotalPaid() { return totalPaid; }
    public void setTotalPaid(BigDecimal totalPaid) { this.totalPaid = totalPaid; }
    
    public BigDecimal getTotalOverdue() { return totalOverdue; }
    public void setTotalOverdue(BigDecimal totalOverdue) { this.totalOverdue = totalOverdue; }
    
    public int getTotalTransactions() { return totalTransactions; }
    public void setTotalTransactions(int totalTransactions) { this.totalTransactions = totalTransactions; }
    
    public LocalDateTime getReportGeneratedAt() { return reportGeneratedAt; }
    public void setReportGeneratedAt(LocalDateTime reportGeneratedAt) { this.reportGeneratedAt = reportGeneratedAt; }
    
    public List<DepartmentRevenue> getDepartmentBreakdown() { return departmentBreakdown; }
    public void setDepartmentBreakdown(List<DepartmentRevenue> departmentBreakdown) { this.departmentBreakdown = departmentBreakdown; }
    
    public List<MonthlyRevenue> getMonthlyTrend() { return monthlyTrend; }
    public void setMonthlyTrend(List<MonthlyRevenue> monthlyTrend) { this.monthlyTrend = monthlyTrend; }
    
    // Inner classes for nested data
    public static class DepartmentRevenue {
        private String departmentName;
        private BigDecimal revenue;
        private int enrollments;
        
        public DepartmentRevenue() {}
        
        public DepartmentRevenue(String departmentName, BigDecimal revenue, int enrollments) {
            this.departmentName = departmentName;
            this.revenue = revenue;
            this.enrollments = enrollments;
        }
        
        // Getters and Setters
        public String getDepartmentName() { return departmentName; }
        public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
        
        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
        
        public int getEnrollments() { return enrollments; }
        public void setEnrollments(int enrollments) { this.enrollments = enrollments; }
    }
    
    public static class MonthlyRevenue {
        private String month;
        private BigDecimal revenue;
        private int enrollments;
        
        public MonthlyRevenue() {}
        
        public MonthlyRevenue(String month, BigDecimal revenue, int enrollments) {
            this.month = month;
            this.revenue = revenue;
            this.enrollments = enrollments;
        }
        
        // Getters and Setters
        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }
        
        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
        
        public int getEnrollments() { return enrollments; }
        public void setEnrollments(int enrollments) { this.enrollments = enrollments; }
    }
}
