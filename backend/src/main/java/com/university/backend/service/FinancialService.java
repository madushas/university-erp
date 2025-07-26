package com.university.backend.service;

import com.university.backend.dto.request.CreateBillingStatementRequest;
import com.university.backend.dto.response.BillingStatementResponse;
import com.university.backend.entity.*;
import com.university.backend.exception.UserNotFoundException;
import com.university.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FinancialService {

    private final UserRepository userRepository;
    private final StudentAccountRepository studentAccountRepository;
    private final BillingStatementRepository billingStatementRepository;
    private final BillingLineItemRepository billingLineItemRepository;

    public StudentAccount getStudentAccountByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + username));
        
        return studentAccountRepository.findByStudentId(user.getId())
                .orElseGet(() -> createStudentAccount(user));
    }

    public List<BillingStatement> getBillingStatementsByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + username));
        
        StudentAccount account = getStudentAccountByUsername(username);
        return billingStatementRepository.findByStudentAccountIdOrderByBillingDateDesc(account.getId());
    }

    public BillingStatement getBillingStatementByIdAndUsername(Long id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + username));
        
        StudentAccount account = getStudentAccountByUsername(username);
        return billingStatementRepository.findByIdAndStudentAccountId(id, account.getId())
                .orElseThrow(() -> new RuntimeException("Billing statement not found"));
    }

    public Page<BillingStatementResponse> getAllBillingStatements(Pageable pageable) {
        Page<BillingStatement> statements = billingStatementRepository.findAll(pageable);
        List<BillingStatementResponse> responses = statements.getContent().stream()
                .map(this::convertToBillingStatementResponse)
                .collect(Collectors.toList());
        
        return new PageImpl<>(responses, pageable, statements.getTotalElements());
    }

    public BillingStatement generateBillingStatement(CreateBillingStatementRequest request) {
        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new UserNotFoundException("Student not found"));
        
        StudentAccount account = studentAccountRepository.findByStudentId(student.getId())
                .orElseGet(() -> createStudentAccount(student));

        BillingStatement statement = BillingStatement.builder()
                .studentAccount(account)
                .statementNumber(generateStatementNumber())
                .billingDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(30))
                .subtotalAmount(request.getAmount())
                .totalAmount(request.getAmount())
                .balanceAmount(request.getAmount())
                .status(BillingStatus.PENDING)
                .build();

        return billingStatementRepository.save(statement);
    }

    public BillingStatement updateBillingStatementStatus(Long id, BillingStatus status) {
        BillingStatement statement = billingStatementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Billing statement not found"));
        
        statement.setStatus(status);
        return billingStatementRepository.save(statement);
    }

    public BillingLineItem addLineItemToBillingStatement(Long statementId, BillingLineItem lineItem) {
        BillingStatement statement = billingStatementRepository.findById(statementId)
                .orElseThrow(() -> new RuntimeException("Billing statement not found"));
        
        lineItem.setBillingStatement(statement);
        lineItem.setLineNumber(getNextLineNumber(statementId));
        
        BillingLineItem savedItem = billingLineItemRepository.save(lineItem);
        
        // Update statement totals
        updateStatementTotals(statement);
        
        return savedItem;
    }

    public List<BillingLineItem> getBillingStatementLineItems(Long statementId) {
        return billingLineItemRepository.findByBillingStatementIdOrderByLineNumber(statementId);
    }

    private StudentAccount createStudentAccount(User student) {
        String accountNumber = generateAccountNumber(student);
        
        StudentAccount account = StudentAccount.builder()
                .student(student)
                .accountNumber(accountNumber)
                .currentBalance(BigDecimal.ZERO)
                .creditLimit(BigDecimal.valueOf(1000))
                .holdAmount(BigDecimal.ZERO)
                .accountStatus(AccountStatus.ACTIVE)
                .build();
        
        return studentAccountRepository.save(account);
    }

    private String generateAccountNumber(User student) {
        return "SA-" + LocalDate.now().getYear() + "-" + String.format("%06d", student.getId());
    }

    private String generateStatementNumber() {
        return "STMT-" + LocalDate.now().getYear() + "-" + System.currentTimeMillis();
    }

    private Integer getNextLineNumber(Long statementId) {
        return billingLineItemRepository.findMaxLineNumberByStatementId(statementId)
                .map(max -> max + 1)
                .orElse(1);
    }

    private void updateStatementTotals(BillingStatement statement) {
        List<BillingLineItem> lineItems = billingLineItemRepository
                .findByBillingStatementIdOrderByLineNumber(statement.getId());
        
        BigDecimal subtotal = lineItems.stream()
                .map(BillingLineItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        statement.setSubtotalAmount(subtotal);
        statement.setTotalAmount(subtotal.add(statement.getTaxAmount()).subtract(statement.getDiscountAmount()));
        statement.setBalanceAmount(statement.getTotalAmount().subtract(statement.getPaidAmount()));
        
        billingStatementRepository.save(statement);
    }

    private BillingStatementResponse convertToBillingStatementResponse(BillingStatement statement) {
        return BillingStatementResponse.builder()
                .id(statement.getId())
                .statementNumber(statement.getStatementNumber())
                .studentName(statement.getStudentAccount().getStudent().getFirstName() + " " + 
                           statement.getStudentAccount().getStudent().getLastName())
                .studentId(statement.getStudentAccount().getStudent().getStudentId())
                .billingDate(statement.getBillingDate())
                .dueDate(statement.getDueDate())
                .totalAmount(statement.getTotalAmount())
                .balanceAmount(statement.getBalanceAmount())
                .status(statement.getStatus())
                .build();
    }
}