package com.university.backend.modules.financial.repository;

import com.university.backend.modules.financial.entity.StudentAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentAccountRepository extends JpaRepository<StudentAccount, Long> {
    Optional<StudentAccount> findByStudentId(Long studentId);
    Optional<StudentAccount> findByAccountNumber(String accountNumber);
}