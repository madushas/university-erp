package com.university.backend.modules.hr.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "leave_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class LeaveType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", unique = true, nullable = false)
    @Size(max = 20)
    @NotNull
    private String code;

    @Column(name = "name", nullable = false)
    @Size(max = 255)
    @NotNull
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_paid")
    @Builder.Default
    private Boolean isPaid = true;

    @Column(name = "requires_approval")
    @Builder.Default
    private Boolean requiresApproval = true;

    @Column(name = "max_days_per_year")
    @Min(0)
    private Integer maxDaysPerYear;

    @Column(name = "max_consecutive_days")
    @Min(0)
    private Integer maxConsecutiveDays;

    @Column(name = "accrual_rate", precision = 8, scale = 4)
    private BigDecimal accrualRate;

    @Column(name = "carryover_allowed")
    @Builder.Default
    private Boolean carryoverAllowed = false;

    @Column(name = "max_carryover_days")
    @Min(0)
    private Integer maxCarryoverDays;

    @Column(name = "advance_notice_required_days")
    @Min(0)
    @Builder.Default
    private Integer advanceNoticeRequiredDays = 0;

    @Column(name = "documentation_required")
    @Builder.Default
    private Boolean documentationRequired = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private LeaveTypeStatus status = LeaveTypeStatus.ACTIVE;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Relationships
    @OneToMany(mappedBy = "leaveType", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<EmployeeLeaveBalance> leaveBalances = new ArrayList<>();

    @OneToMany(mappedBy = "leaveType", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<LeaveRequest> leaveRequests = new ArrayList<>();
}