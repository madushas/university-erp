package com.university.backend.modules.financial.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.university.backend.modules.financial.dto.BillingStatementDto;
import com.university.backend.modules.financial.dto.StudentAccountDto;
import com.university.backend.modules.financial.entity.BillingStatement;
import com.university.backend.modules.financial.service.FinancialService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/financial")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class FinancialController {

    private final FinancialService financialService;

    @GetMapping("/student-account")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentAccountDto> getMyStudentAccount(Authentication authentication) {
        log.info("Fetching student account for user: {}", authentication.getName());
        try {
            StudentAccountDto account = financialService.getStudentAccountDtoByUsername(authentication.getName());
            return ResponseEntity.ok(account);
        } catch (Exception e) {
            log.error("Error fetching student account for user: {}", authentication.getName(), e);
            throw e;
        }
    }

    @GetMapping("/accounts/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentAccountDto> getMyAccount(Authentication authentication) {
        log.info("Fetching student account for user: {}", authentication.getName());
        StudentAccountDto account = financialService.getStudentAccountDtoByUsername(authentication.getName());
        return ResponseEntity.ok(account);
    }

    @GetMapping("/billing-statements/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<BillingStatementDto>> getMyBillingStatements(Authentication authentication) {
        log.info("Fetching billing statements for user: {}", authentication.getName());
        List<BillingStatementDto> statements = financialService
                .getBillingStatementsDtoByUsername(authentication.getName());
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