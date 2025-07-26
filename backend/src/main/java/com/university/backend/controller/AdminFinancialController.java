package com.university.backend.controller;

import com.university.backend.dto.request.CreateBillingStatementRequest;
import com.university.backend.dto.request.UpdateBillingStatusRequest;
import com.university.backend.dto.response.BillingStatementResponse;
import com.university.backend.entity.BillingLineItem;
import com.university.backend.entity.BillingStatement;
import com.university.backend.service.FinancialService;
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
@RequestMapping("/api/admin/financial")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AdminFinancialController {

    private final FinancialService financialService;

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