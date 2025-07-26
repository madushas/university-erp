package com.university.backend.repository;

import com.university.backend.entity.BillingStatement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillingStatementRepository extends JpaRepository<BillingStatement, Long> {
    List<BillingStatement> findByStudentAccountIdOrderByBillingDateDesc(Long studentAccountId);
    Optional<BillingStatement> findByIdAndStudentAccountId(Long id, Long studentAccountId);
    Optional<BillingStatement> findByStatementNumber(String statementNumber);
}