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
import com.university.backend.modules.core.entity.User;
import com.university.backend.security.SecurityContextService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/financial")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class FinancialController {

    private final FinancialService financialService;
    private final SecurityContextService securityContextService;

    @GetMapping("/student-account")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentAccountDto> getMyStudentAccount() {
        User currentUser = securityContextService.getCurrentUserOrThrow();
        log.info("Fetching student account for user: {}", currentUser.getUsername());
        
        try {
            // Validate that current user is a student
            if (!securityContextService.isCurrentUserStudent()) {
                throw new SecurityException("Access denied: Only students can access student accounts");
            }
            
            StudentAccountDto account = financialService.getStudentAccountDtoByUsername(currentUser.getUsername());
            return ResponseEntity.ok(account);
        } catch (Exception e) {
            log.error("Error fetching student account for user: {}", currentUser.getUsername(), e);
            throw e;
        }
    }

    @GetMapping("/accounts/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentAccountDto> getMyAccount() {
        User currentUser = securityContextService.getCurrentUserOrThrow();
        log.info("Fetching student account for user: {}", currentUser.getUsername());
        
        // Validate that current user is a student
        if (!securityContextService.isCurrentUserStudent()) {
            throw new SecurityException("Access denied: Only students can access student accounts");
        }
        
        StudentAccountDto account = financialService.getStudentAccountDtoByUsername(currentUser.getUsername());
        return ResponseEntity.ok(account);
    }

    @GetMapping("/billing-statements/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<BillingStatementDto>> getMyBillingStatements() {
        User currentUser = securityContextService.getCurrentUserOrThrow();
        log.info("Fetching billing statements for user: {}", currentUser.getUsername());
        
        // Validate that current user is a student
        if (!securityContextService.isCurrentUserStudent()) {
            throw new SecurityException("Access denied: Only students can access billing statements");
        }
        
        List<BillingStatementDto> statements = financialService
                .getBillingStatementsDtoByUsername(currentUser.getUsername());
        return ResponseEntity.ok(statements);
    }

    @GetMapping("/billing-statements/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('FINANCIAL_STAFF')")
    public ResponseEntity<BillingStatement> getBillingStatement(@PathVariable Long id) {
        User currentUser = securityContextService.getCurrentUserOrThrow();
        log.info("Fetching billing statement {} for user: {}", id, currentUser.getUsername());
        
        // Students can only access their own billing statements
        // Admin and financial staff can access any billing statement
        if (securityContextService.isCurrentUserStudent()) {
            BillingStatement statement = financialService.getBillingStatementByIdAndUsername(id, currentUser.getUsername());
            return ResponseEntity.ok(statement);
        } else if (securityContextService.isCurrentUserAdmin()) {
            // Admin can access any billing statement - would need a different service method
            BillingStatement statement = financialService.getBillingStatementByIdAndUsername(id, currentUser.getUsername());
            return ResponseEntity.ok(statement);
        } else {
            throw new SecurityException("Access denied: Insufficient privileges to access billing statement");
        }
    }
}