package com.university.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "organizational_units")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class OrganizationalUnit {
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

    @Enumerated(EnumType.STRING)
    @Column(name = "unit_type", nullable = false)
    @NotNull
    private OrganizationalUnitType unitType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_unit_id")
    private OrganizationalUnit parentUnit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "head_employee_id")
    private EmployeeRecord headEmployee;

    @Column(name = "budget_code")
    @Size(max = 50)
    private String budgetCode;

    @Column(name = "cost_center")
    @Size(max = 50)
    private String costCenter;

    @Column(name = "location")
    @Size(max = 255)
    private String location;

    @Column(name = "phone")
    @Size(max = 50)
    private String phone;

    @Column(name = "email")
    @Email
    @Size(max = 255)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private OrganizationalUnitStatus status = OrganizationalUnitStatus.ACTIVE;

    @Column(name = "established_date")
    private LocalDate establishedDate;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "parentUnit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrganizationalUnit> childUnits = new ArrayList<>();

    @OneToMany(mappedBy = "organizationalUnit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<EmployeePosition> employeePositions = new ArrayList<>();
}