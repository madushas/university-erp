package com.university.backend.modules.financial.controller;

import com.university.backend.dto.request.CreateBillingStatementRequest;
import com.university.backend.dto.request.UpdateBillingStatusRequest;
import com.university.backend.dto.response.BillingStatementResponse;
import com.university.backend.modules.financial.entity.BillingLineItem;
import com.university.backend.modules.financial.entity.BillingStatement;
import com.university.backend.modules.financial.entity.StudentAccount;
import com.university.backend.modules.financial.service.FinancialService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/financial")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AdminFinancialController {

    private final FinancialService financialService;

    // Student Account Management
    @GetMapping("/accounts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StudentAccount>> getAllStudentAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        log.info("Admin {} fetching all student accounts", authentication.getName());
        // For now, return empty list - implement when StudentAccount service is ready
        return ResponseEntity.ok(java.util.Collections.emptyList());
    }

    @GetMapping("/accounts/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentAccount> getStudentAccount(
            @PathVariable Long id,
            Authentication authentication) {
        log.info("Admin {} fetching student account: {}", authentication.getName(), id);
        // For now, return 404 - implement when StudentAccount service is ready
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/accounts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentAccount> createStudentAccount(
            @RequestBody com.university.backend.dto.request.CreateStudentAccountRequest request,
            Authentication authentication) {
        log.info("Admin {} creating student account", authentication.getName());
        // For now, return 501 - implement when StudentAccount service is ready
        return ResponseEntity.status(501).build();
    }

    @PatchMapping("/accounts/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentAccount> updateAccountStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) {
        log.info("Admin {} updating account {} status to: {}", authentication.getName(), id, status);
        // For now, return 501 - implement when StudentAccount service is ready
        return ResponseEntity.status(501).build();
    }

    // Fee Structure Management
    @GetMapping("/fee-structures")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Object>> getAllFeeStructures(Authentication authentication) {
        log.info("Admin {} fetching all fee structures", authentication.getName());
        // For now, return empty list - implement when FeeStructure service is ready
        return ResponseEntity.ok(java.util.Collections.emptyList());
    }

    @GetMapping("/fee-structures/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> getFeeStructure(
            @PathVariable Long id,
            Authentication authentication) {
        log.info("Admin {} fetching fee structure: {}", authentication.getName(), id);
        // For now, return 404 - implement when FeeStructure service is ready
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/fee-structures")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> createFeeStructure(
            @RequestBody Object request,
            Authentication authentication) {
        log.info("Admin {} creating fee structure", authentication.getName());
        // For now, return 501 - implement when FeeStructure service is ready
        return ResponseEntity.status(501).build();
    }

    @PutMapping("/fee-structures/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> updateFeeStructure(
            @PathVariable Long id,
            @RequestBody Object request,
            Authentication authentication) {
        log.info("Admin {} updating fee structure: {}", authentication.getName(), id);
        // For now, return 501 - implement when FeeStructure service is ready
        return ResponseEntity.status(501).build();
    }

    @GetMapping("/billing-statements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<BillingStatementResponse>> getAllBillingStatements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        log.info("Admin {} fetching all billing statements", authentication.getName());
        Pageable pageable = PageRequest.of(page, size);
        Page<BillingStatementResponse> statements = financialService.getAllBillingStatements(pageable);
        return ResponseEntity.ok(statements);
    }

    @PostMapping("/billing-statements/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BillingStatement> generateBillingStatement(
            @RequestBody CreateBillingStatementRequest request,
            Authentication authentication) {
        log.info("Admin {} generating billing statement for student: {}", 
                authentication.getName(), request.getStudentId());
        BillingStatement statement = financialService.generateBillingStatement(request);
        return ResponseEntity.ok(statement);
    }

    @PutMapping("/billing-statements/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BillingStatement> updateBillingStatementStatus(
            @PathVariable Long id,
            @RequestBody UpdateBillingStatusRequest request,
            Authentication authentication) {
        log.info("Admin {} updating billing statement {} status to: {}", 
                authentication.getName(), id, request.getStatus());
        BillingStatement statement = financialService.updateBillingStatementStatus(id, request.getStatus());
        return ResponseEntity.ok(statement);
    }

    @PatchMapping("/billing-statements/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> patchBillingStatementStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) {
        log.info("Admin {} updating billing statement {} status to: {}", 
                authentication.getName(), id, status);
        // For now, return success message - implement when billing status service is ready
        return ResponseEntity.ok("Status update not implemented yet");
    }

    @PostMapping("/billing-statements/{id}/line-items")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BillingLineItem> addLineItem(
            @PathVariable Long id,
            @RequestBody BillingLineItem lineItem,
            Authentication authentication) {
        log.info("Admin {} adding line item to billing statement: {}", authentication.getName(), id);
        BillingLineItem addedItem = financialService.addLineItemToBillingStatement(id, lineItem);
        return ResponseEntity.ok(addedItem);
    }

    @GetMapping("/billing-statements/{id}/line-items")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BillingLineItem>> getBillingStatementLineItems(
            @PathVariable Long id,
            Authentication authentication) {
        log.info("Admin {} fetching line items for billing statement: {}", authentication.getName(), id);
        List<BillingLineItem> lineItems = financialService.getBillingStatementLineItems(id);
        return ResponseEntity.ok(lineItems);
    }
}