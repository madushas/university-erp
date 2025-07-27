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
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_positions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class EmployeePosition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @NotNull
    private EmployeeRecord employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizational_unit_id", nullable = false)
    @NotNull
    private OrganizationalUnit organizationalUnit;

    @Column(name = "position_title", nullable = false)
    @Size(max = 255)
    @NotNull
    private String positionTitle;

    @Enumerated(EnumType.STRING)
    @Column(name = "position_type", nullable = false)
    @NotNull
    private PositionType positionType;

    @Column(name = "start_date", nullable = false)
    @NotNull
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "fte_percentage", precision = 5, scale = 2)
    @DecimalMin(value = "0.01")
    @DecimalMax(value = "100.00")
    @Builder.Default
    private BigDecimal ftePercentage = new BigDecimal("100.00");

    @Column(name = "is_primary_position")
    @Builder.Default
    private Boolean isPrimaryPosition = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporting_manager_id")
    private EmployeeRecord reportingManager;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}