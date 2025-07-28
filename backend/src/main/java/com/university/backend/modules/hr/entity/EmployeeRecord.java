package com.university.backend.modules.hr.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.university.backend.modules.core.entity.User;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employee_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EmployeeRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull
    private User user;

    @Column(name = "employee_number", unique = true, nullable = false)
    @Size(max = 50)
    @NotNull
    private String employeeNumber;

    @Column(name = "hire_date", nullable = false)
    @NotNull
    private LocalDate hireDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false)
    @NotNull
    private EmploymentType employmentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_status", nullable = false)
    @Builder.Default
    private EmploymentStatus employmentStatus = EmploymentStatus.ACTIVE;

    @Column(name = "job_title", nullable = false)
    @Size(max = 255)
    @NotNull
    private String jobTitle;

    @Column(name = "department")
    @Size(max = 255)
    private String department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    private User supervisor;

    @Column(name = "salary", precision = 12, scale = 2)
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal salary;

    @Column(name = "hourly_rate", precision = 8, scale = 2)
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal hourlyRate;

    @Column(name = "benefits_eligible")
    @Builder.Default
    private Boolean benefitsEligible = true;

    @Column(name = "tenure_track")
    @Builder.Default
    private Boolean tenureTrack = false;

    @Column(name = "tenure_date")
    private LocalDate tenureDate;

    @Column(name = "contract_start_date")
    private LocalDate contractStartDate;

    @Column(name = "contract_end_date")
    private LocalDate contractEndDate;

    @Column(name = "office_location")
    @Size(max = 255)
    private String officeLocation;

    @Column(name = "office_phone")
    @Size(max = 50)
    private String officePhone;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<EmployeeQualification> qualifications = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<PerformanceReview> performanceReviews = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<LeaveRequest> leaveRequests = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<EmploymentContract> contracts = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<EmployeePosition> positions = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<EmployeeLeaveBalance> leaveBalances = new ArrayList<>();
}