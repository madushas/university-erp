package com.university.backend.modules.financial.service;

import com.university.backend.dto.request.CreateBillingStatementRequest;
import com.university.backend.dto.response.BillingStatementResponse;
import com.university.backend.modules.financial.entity.*;
import com.university.backend.modules.financial.dto.*;
import com.university.backend.modules.core.entity.Role;
import com.university.backend.modules.core.entity.User;
import com.university.backend.modules.core.mapper.DtoMapper;
import com.university.backend.exception.UserNotFoundException;
import com.university.backend.modules.financial.repository.*;
import com.university.backend.modules.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
@Validated
public class FinancialService {

    private final UserRepository userRepository;
    private final StudentAccountRepository studentAccountRepository;
    private final BillingStatementRepository billingStatementRepository;
    private final BillingLineItemRepository billingLineItemRepository;
    private final DtoMapper dtoMapper;

    public StudentAccount getStudentAccountByUsername(@NotBlank(message = "Username is required") String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + username));
        
        // Only students should have student accounts
        if (user.getRole() != Role.STUDENT) {
            throw new RuntimeException("Only students can have student accounts");
        }
        
        return studentAccountRepository.findByStudentId(user.getId())
                .orElseGet(() -> createStudentAccount(user));
    }

    public List<BillingStatement> getBillingStatementsByUsername(@NotBlank(message = "Username is required") String username) {
        StudentAccount account = getStudentAccountByUsername(username);
        return billingStatementRepository.findByStudentAccountIdOrderByBillingDateDesc(account.getId());
    }

    public BillingStatement getBillingStatementByIdAndUsername(@NotNull(message = "Billing statement ID is required") Long id, 
                                                             @NotBlank(message = "Username is required") String username) {
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

    /**
     * Generate billing statement based on course registrations
     */
    public BillingStatement generateBillingFromRegistrations(Long studentId, List<Long> registrationIds) {
        log.info("Generating billing from registrations for student: {}", studentId);
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new UserNotFoundException("Student not found with ID: " + studentId));
        
        StudentAccount account = studentAccountRepository.findByStudentId(studentId)
                .orElseGet(() -> createStudentAccount(student));
        
        // Calculate total amount from registrations
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        // Create billing statement
        BillingStatement statement = BillingStatement.builder()
                .studentAccount(account)
                .statementNumber(generateStatementNumber())
                .billingDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(30))
                .subtotalAmount(totalAmount)
                .totalAmount(totalAmount)
                .balanceAmount(totalAmount)
                .status(BillingStatus.PENDING)
                .build();
        
        statement = billingStatementRepository.save(statement);
        
        // Create line items for each registration
        for (Long registrationId : registrationIds) {
            createBillingLineItemForRegistration(statement, registrationId);
        }
        
        // Update statement totals
        updateStatementTotals(statement);
        
        log.info("Generated billing statement {} for student {}", statement.getStatementNumber(), studentId);
        return statement;
    }
    
    /**
     * Create billing line item for a course registration
     */
    private void createBillingLineItemForRegistration(BillingStatement statement, Long registrationId) {
        // This would typically query the registration to get course fee information
        // For now, we'll create a basic line item
        
        BillingLineItem lineItem = BillingLineItem.builder()
                .billingStatement(statement)
                .lineNumber(getNextLineNumber(statement.getId()))
                .description("Course Registration Fee - Registration ID: " + registrationId)
                .itemType(ItemType.TUITION)
                .amount(BigDecimal.valueOf(500.00)) // Default course fee
                .quantity(1)
                .unitPrice(BigDecimal.valueOf(500.00))
                .build();
        
        billingLineItemRepository.save(lineItem);
    }
    
    /**
     * Generate semester billing for all student registrations
     */
    public BillingStatement generateSemesterBilling(Long studentId, Long semesterId) {
        log.info("Generating semester billing for student: {} in semester: {}", studentId, semesterId);
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new UserNotFoundException("Student not found with ID: " + studentId));
        
        StudentAccount account = studentAccountRepository.findByStudentId(studentId)
                .orElseGet(() -> createStudentAccount(student));
        
        // Create billing statement
        BillingStatement statement = BillingStatement.builder()
                .studentAccount(account)
                .statementNumber(generateStatementNumber())
                .billingDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(30))
                .subtotalAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .balanceAmount(BigDecimal.ZERO)
                .status(BillingStatus.PENDING)
                .build();
        
        statement = billingStatementRepository.save(statement);
        
        // Add tuition charges
        addTuitionCharges(statement, studentId, semesterId);
        
        // Add fee charges
        addFeeCharges(statement, studentId, semesterId);
        
        // Update statement totals
        updateStatementTotals(statement);
        
        log.info("Generated semester billing statement {} for student {}", statement.getStatementNumber(), studentId);
        return statement;
    }
    
    /**
     * Add tuition charges to billing statement
     */
    private void addTuitionCharges(BillingStatement statement, Long studentId, Long semesterId) {
        // This would typically calculate tuition based on credit hours and program
        // For now, we'll add a standard tuition charge
        
        BillingLineItem tuitionItem = BillingLineItem.builder()
                .billingStatement(statement)
                .lineNumber(getNextLineNumber(statement.getId()))
                .description("Tuition - Semester " + semesterId)
                .itemType(ItemType.TUITION)
                .amount(BigDecimal.valueOf(2500.00)) // Standard tuition
                .quantity(1)
                .unitPrice(BigDecimal.valueOf(2500.00))
                .build();
        
        billingLineItemRepository.save(tuitionItem);
    }
    
    /**
     * Add fee charges to billing statement
     */
    private void addFeeCharges(BillingStatement statement, Long studentId, Long semesterId) {
        // Add various fees
        String[] fees = {
            "Technology Fee:100.00",
            "Student Activity Fee:50.00",
            "Library Fee:25.00",
            "Health Services Fee:75.00"
        };
        
        for (String feeInfo : fees) {
            String[] parts = feeInfo.split(":");
            String description = parts[0];
            BigDecimal amount = new BigDecimal(parts[1]);
            
            BillingLineItem feeItem = BillingLineItem.builder()
                    .billingStatement(statement)
                    .lineNumber(getNextLineNumber(statement.getId()))
                    .description(description)
                    .itemType(ItemType.FEE)
                    .amount(amount)
                    .quantity(1)
                    .unitPrice(amount)
                    .build();
            
            billingLineItemRepository.save(feeItem);
        }
    }
    
    /**
     * Process payment for billing statement
     */
    public BillingStatement processPayment(Long statementId, BigDecimal paymentAmount, String paymentMethod) {
        log.info("Processing payment of {} for billing statement: {}", paymentAmount, statementId);
        
        BillingStatement statement = billingStatementRepository.findById(statementId)
                .orElseThrow(() -> new RuntimeException("Billing statement not found with ID: " + statementId));
        
        // Update payment information
        BigDecimal currentPaid = statement.getPaidAmount() != null ? statement.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal newPaidAmount = currentPaid.add(paymentAmount);
        
        statement.setPaidAmount(newPaidAmount);
        statement.setBalanceAmount(statement.getTotalAmount().subtract(newPaidAmount));
        
        // Update status based on payment
        if (statement.getBalanceAmount().compareTo(BigDecimal.ZERO) <= 0) {
            statement.setStatus(BillingStatus.PAID);
        } else if (newPaidAmount.compareTo(BigDecimal.ZERO) > 0) {
            statement.setStatus(BillingStatus.PARTIAL);
        }
        
        statement = billingStatementRepository.save(statement);
        
        log.info("Processed payment for billing statement: {}, new balance: {}", 
                statementId, statement.getBalanceAmount());
        
        return statement;
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

    // DTO Methods to prevent JSON serialization issues
    public StudentAccountDto getStudentAccountDtoByUsername(String username) {
        StudentAccount account = getStudentAccountByUsername(username);
        return dtoMapper.toStudentAccountDto(account);
    }

    public List<BillingStatementDto> getBillingStatementsDtoByUsername(String username) {
        List<BillingStatement> statements = getBillingStatementsByUsername(username);
        return statements.stream()
                .map(dtoMapper::toBillingStatementDto)
                .collect(Collectors.toList());
    }
}