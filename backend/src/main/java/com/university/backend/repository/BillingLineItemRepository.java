package com.university.backend.repository;

import com.university.backend.entity.BillingLineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillingLineItemRepository extends JpaRepository<BillingLineItem, Long> {
    List<BillingLineItem> findByBillingStatementIdOrderByLineNumber(Long billingStatementId);
    
    @Query("SELECT MAX(b.lineNumber) FROM BillingLineItem b WHERE b.billingStatement.id = :statementId")
    Optional<Integer> findMaxLineNumberByStatementId(@Param("statementId") Long statementId);
}