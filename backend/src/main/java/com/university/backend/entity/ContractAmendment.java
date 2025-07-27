package com.university.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contract_amendments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class ContractAmendment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    @NotNull
    private EmploymentContract contract;

    @Column(name = "amendment_number", nullable = false)
    @Size(max = 50)
    @NotNull
    private String amendmentNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "amendment_type", nullable = false)
    @NotNull
    private AmendmentType amendmentType;

    @Column(name = "effective_date", nullable = false)
    @NotNull
    private LocalDate effectiveDate;

    @Column(name = "previous_value", columnDefinition = "TEXT")
    private String previousValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    @NotNull
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "approved_date")
    private LocalDate approvedDate;

    @Column(name = "document_url")
    @Size(max = 500)
    private String documentUrl;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}