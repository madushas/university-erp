package com.university.backend.controller;

import com.university.backend.entity.BillingStatement;
import com.university.backend.entity.StudentAccount;
import com.university.backend.service.FinancialService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financial")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class FinancialController {

    private final FinancialService financialService;

    @GetMapping("/student-account")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentAccount> getMyStudentAccount(Authentication authentication) {
        log.info("Fetching student account for user: {}", authentication.getName());
        StudentAccount account = financialService.getStudentAccountByUsername(authentication.getName());
        return ResponseEntity.ok(account);
    }

    @GetMapping("/billing-statements/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<BillingStatement>> getMyBillingStatements(Authentication authentication) {
        log.info("Fetching billing statements for user: {}", authentication.getName());
        List<BillingStatement> statements = financialService.getBillingStatementsByUsername(authentication.getName());
        return ResponseEntity.ok(statements);
    }

    @GetMapping("/billing-statements/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<BillingStatement> getBillingStatement(
            @PathVariable Long id,
            Authentication authentication) {
        log.info("Fetching billing statement {} for user: {}", id, authentication.getName());
        BillingStatement statement = financialService.getBillingStatementByIdAndUsername(id, authentication.getName());
        return ResponseEntity.ok(statement);
    }
}