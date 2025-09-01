package com.university.backend.modules.financial.repository;

import com.university.backend.modules.financial.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByPaymentNumber(String paymentNumber);
    List<Payment> findByStudentAccountIdOrderByPaymentDateDesc(Long studentAccountId);
}
