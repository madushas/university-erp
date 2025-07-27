package com.university.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_leave_balances", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "leave_type_id", "year"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeLeaveBalance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @NotNull
    private EmployeeRecord employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id", nullable = false)
    @NotNull
    private LeaveType leaveType;

    @Column(name = "year", nullable = false)
    @Min(2000)
    @Max(2100)
    @NotNull
    private Integer year;

    @Column(name = "allocated_days", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal allocatedDays = BigDecimal.ZERO;

    @Column(name = "used_days", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal usedDays = BigDecimal.ZERO;

    @Column(name = "pending_days", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal pendingDays = BigDecimal.ZERO;

    @Column(name = "carried_over_days", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal carriedOverDays = BigDecimal.ZERO;

    // Note: available_days is calculated in the database as a generated column
    // We can add a transient field for convenience in Java
    @Transient
    public BigDecimal getAvailableDays() {
        return allocatedDays.add(carriedOverDays).subtract(usedDays).subtract(pendingDays);
    }

    @Column(name = "last_updated", nullable = false)
    @Builder.Default
    private LocalDateTime lastUpdated = LocalDateTime.now();
}