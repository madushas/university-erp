package com.university.backend.entity;

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
@Table(name = "employment_contracts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class EmploymentContract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @NotNull
    private EmployeeRecord employee;

    @Column(name = "contract_number", unique = true, nullable = false)
    @Size(max = 50)
    @NotNull
    private String contractNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "contract_type", nullable = false)
    @NotNull
    private ContractType contractType;

    @Column(name = "start_date", nullable = false)
    @NotNull
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "salary", precision = 12, scale = 2)
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal salary;

    @Column(name = "hourly_rate", precision = 8, scale = 2)
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal hourlyRate;

    @Column(name = "working_hours_per_week", precision = 5, scale = 2)
    @DecimalMin(value = "0.01")
    @DecimalMax(value = "168.00")
    private BigDecimal workingHoursPerWeek;

    @Column(name = "job_title", nullable = false)
    @Size(max = 255)
    @NotNull
    private String jobTitle;

    @Column(name = "department")
    @Size(max = 255)
    private String department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporting_manager_id")
    private EmployeeRecord reportingManager;

    @Column(name = "contract_terms", columnDefinition = "TEXT")
    private String contractTerms;

    @Column(name = "benefits_included", columnDefinition = "TEXT")
    private String benefitsIncluded;

    @Column(name = "termination_notice_period_days")
    private Integer terminationNoticePeriodDays;

    @Column(name = "probation_period_months")
    private Integer probationPeriodMonths;

    @Column(name = "renewal_eligible")
    @Builder.Default
    private Boolean renewalEligible = false;

    @Column(name = "auto_renewal")
    @Builder.Default
    private Boolean autoRenewal = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ContractStatus status = ContractStatus.DRAFT;

    @Column(name = "signed_by_employee_date")
    private LocalDate signedByEmployeeDate;

    @Column(name = "signed_by_employer_date")
    private LocalDate signedByEmployerDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hr_approved_by")
    private User hrApprovedBy;

    @Column(name = "hr_approved_date")
    private LocalDate hrApprovedDate;

    @Column(name = "document_url")
    @Size(max = 500)
    private String documentUrl;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ContractAmendment> amendments = new ArrayList<>();
}