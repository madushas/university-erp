-- V6__Insert_financial_sample_data.sql
-- Insert comprehensive sample data for financial management system

-- =====================================================
-- INSERT SAMPLE FEE STRUCTURES
-- =====================================================

INSERT INTO fee_structures (
    name, description, academic_year_id, student_type, residency_status, enrollment_status,
    base_tuition, tuition_per_credit, technology_fee, activity_fee, library_fee, lab_fee,
    parking_fee, health_fee, recreation_fee, student_union_fee, graduation_fee,
    application_fee, registration_fee, late_registration_fee, transcript_fee,
    effective_date, expiry_date, status
) VALUES
-- Undergraduate Domestic Full-Time
('Undergraduate Domestic Full-Time 2024-2025', 'Standard fee structure for domestic undergraduate full-time students', 
 2, 'UNDERGRADUATE', 'DOMESTIC', 'FULL_TIME',
 12000.00, 400.00, 150.00, 75.00, 50.00, 100.00,
 200.00, 300.00, 100.00, 125.00, 150.00,
 50.00, 100.00, 150.00, 25.00,
 '2024-08-01', '2025-07-31', 'ACTIVE'),

-- Undergraduate International Full-Time
('Undergraduate International Full-Time 2024-2025', 'Fee structure for international undergraduate full-time students',
 2, 'UNDERGRADUATE', 'INTERNATIONAL', 'FULL_TIME',
 24000.00, 800.00, 150.00, 75.00, 50.00, 100.00,
 200.00, 500.00, 100.00, 125.00, 150.00,
 100.00, 100.00, 150.00, 25.00,
 '2024-08-01', '2025-07-31', 'ACTIVE'),

-- Graduate Domestic Full-Time
('Graduate Domestic Full-Time 2024-2025', 'Fee structure for domestic graduate full-time students',
 2, 'GRADUATE', 'DOMESTIC', 'FULL_TIME',
 15000.00, 500.00, 200.00, 50.00, 75.00, 150.00,
 200.00, 300.00, 100.00, 125.00, 200.00,
 75.00, 150.00, 200.00, 30.00,
 '2024-08-01', '2025-07-31', 'ACTIVE'),

-- Part-Time Undergraduate
('Undergraduate Part-Time 2024-2025', 'Fee structure for part-time undergraduate students',
 2, 'UNDERGRADUATE', 'DOMESTIC', 'PART_TIME',
 0.00, 450.00, 75.00, 35.00, 25.00, 50.00,
 100.00, 150.00, 50.00, 60.00, 150.00,
 50.00, 75.00, 100.00, 25.00,
 '2024-08-01', '2025-07-31', 'ACTIVE');

-- =====================================================
-- INSERT SAMPLE STUDENT ACCOUNTS
-- =====================================================

INSERT INTO student_accounts (
    student_id, account_number, current_balance, credit_limit, hold_amount, account_status
) VALUES
-- John Doe's account (balance within credit limit)
((SELECT id FROM users WHERE username = 'john_doe'), 'SA-2024-001', -800.00, 1000.00, 0.00, 'ACTIVE'),

-- Jane Smith's account (balance within credit limit)
((SELECT id FROM users WHERE username = 'jane_smith'), 'SA-2024-002', -900.00, 1000.00, 250.00, 'ACTIVE'),

-- Additional student accounts for testing
((SELECT id FROM users WHERE student_id = 'STU001' LIMIT 1), 'SA-2024-003', 0.00, 500.00, 0.00, 'ACTIVE'),
((SELECT id FROM users WHERE student_id = 'STU002' LIMIT 1), 'SA-2024-004', -1200.00, 1500.00, 0.00, 'ACTIVE');

-- =====================================================
-- INSERT SAMPLE BILLING STATEMENTS
-- =====================================================

INSERT INTO billing_statements (
    student_account_id, statement_number, billing_date, due_date, 
    academic_year_id, semester_id, subtotal_amount, tax_amount, discount_amount,
    total_amount, paid_amount, balance_amount, payment_terms, status
) VALUES
-- John Doe Fall 2024 Statement
(1, 'BILL-2024-F-001', '2024-08-01', '2024-08-31', 2, 3, 
 12825.00, 0.00, 500.00, 12325.00, 9825.00, 2500.00, 'Payment due within 30 days', 'PARTIAL'),

-- Jane Smith Fall 2024 Statement
(2, 'BILL-2024-F-002', '2024-08-01', '2024-08-31', 2, 3,
 12825.00, 0.00, 0.00, 12825.00, 11025.00, 1800.00, 'Payment due within 30 days', 'PARTIAL'),

-- John Doe Spring 2025 Statement
(1, 'BILL-2025-S-001', '2025-01-01', '2025-01-31', 2, 4,
 12825.00, 0.00, 0.00, 12825.00, 0.00, 12825.00, 'Payment due within 30 days', 'PENDING'),

-- Student 3 Statement
(3, 'BILL-2024-F-003', '2024-08-01', '2024-08-31', 2, 3,
 6412.50, 0.00, 0.00, 6412.50, 6412.50, 0.00, 'Payment due within 30 days', 'PAID');

-- =====================================================
-- INSERT SAMPLE BILLING LINE ITEMS
-- =====================================================

INSERT INTO billing_line_items (
    billing_statement_id, line_number, description, item_type, item_category,
    quantity, unit_price, amount, course_id, service_period_start, service_period_end
) VALUES
-- John Doe Fall 2024 - Line Items
(1, 1, 'Fall 2024 Base Tuition', 'TUITION', 'ACADEMIC', 1, 12000.00, 12000.00, NULL, '2024-08-15', '2024-12-15'),
(1, 2, 'Technology Fee', 'FEE', 'TECHNOLOGY', 1, 150.00, 150.00, NULL, '2024-08-15', '2024-12-15'),
(1, 3, 'Activity Fee', 'FEE', 'ADMINISTRATIVE', 1, 75.00, 75.00, NULL, '2024-08-15', '2024-12-15'),
(1, 4, 'Library Fee', 'FEE', 'ACADEMIC', 1, 50.00, 50.00, NULL, '2024-08-15', '2024-12-15'),
(1, 5, 'Lab Fee - CS101', 'FEE', 'ACADEMIC', 1, 100.00, 100.00, 1, '2024-08-15', '2024-12-15'),
(1, 6, 'Parking Fee', 'FEE', 'FACILITY', 1, 200.00, 200.00, NULL, '2024-08-15', '2024-12-15'),
(1, 7, 'Health Fee', 'FEE', 'HEALTH', 1, 300.00, 300.00, NULL, '2024-08-15', '2024-12-15'),
(1, 8, 'Merit Scholarship', 'DISCOUNT', 'ACADEMIC', 1, -500.00, -500.00, NULL, '2024-08-15', '2024-12-15'),

-- Jane Smith Fall 2024 - Line Items
(2, 1, 'Fall 2024 Base Tuition', 'TUITION', 'ACADEMIC', 1, 12000.00, 12000.00, NULL, '2024-08-15', '2024-12-15'),
(2, 2, 'Technology Fee', 'FEE', 'TECHNOLOGY', 1, 150.00, 150.00, NULL, '2024-08-15', '2024-12-15'),
(2, 3, 'Activity Fee', 'FEE', 'ADMINISTRATIVE', 1, 75.00, 75.00, NULL, '2024-08-15', '2024-12-15'),
(2, 4, 'Library Fee', 'FEE', 'ACADEMIC', 1, 50.00, 50.00, NULL, '2024-08-15', '2024-12-15'),
(2, 5, 'Lab Fee - CS102', 'FEE', 'ACADEMIC', 1, 100.00, 100.00, 2, '2024-08-15', '2024-12-15'),
(2, 6, 'Parking Fee', 'FEE', 'FACILITY', 1, 200.00, 200.00, NULL, '2024-08-15', '2024-12-15'),
(2, 7, 'Health Fee', 'FEE', 'HEALTH', 1, 300.00, 300.00, NULL, '2024-08-15', '2024-12-15'),

-- John Doe Spring 2025 - Line Items
(3, 1, 'Spring 2025 Base Tuition', 'TUITION', 'ACADEMIC', 1, 12000.00, 12000.00, NULL, '2025-01-15', '2025-05-15'),
(3, 2, 'Technology Fee', 'FEE', 'TECHNOLOGY', 1, 150.00, 150.00, NULL, '2025-01-15', '2025-05-15'),
(3, 3, 'Activity Fee', 'FEE', 'ADMINISTRATIVE', 1, 75.00, 75.00, NULL, '2025-01-15', '2025-05-15'),
(3, 4, 'Library Fee', 'FEE', 'ACADEMIC', 1, 50.00, 50.00, NULL, '2025-01-15', '2025-05-15'),
(3, 5, 'Lab Fee - MATH201', 'FEE', 'ACADEMIC', 1, 100.00, 100.00, 3, '2025-01-15', '2025-05-15'),
(3, 6, 'Parking Fee', 'FEE', 'FACILITY', 1, 200.00, 200.00, NULL, '2025-01-15', '2025-05-15'),
(3, 7, 'Health Fee', 'FEE', 'HEALTH', 1, 300.00, 300.00, NULL, '2025-01-15', '2025-05-15'),

-- Student 3 - Paid in Full
(4, 1, 'Fall 2024 Part-Time Tuition (15 credits)', 'TUITION', 'ACADEMIC', 15, 400.00, 6000.00, NULL, '2024-08-15', '2024-12-15'),
(4, 2, 'Technology Fee', 'FEE', 'TECHNOLOGY', 1, 75.00, 75.00, NULL, '2024-08-15', '2024-12-15'),
(4, 3, 'Activity Fee', 'FEE', 'ADMINISTRATIVE', 1, 35.00, 35.00, NULL, '2024-08-15', '2024-12-15'),
(4, 4, 'Library Fee', 'FEE', 'ACADEMIC', 1, 25.00, 25.00, NULL, '2024-08-15', '2024-12-15'),
(4, 5, 'Lab Fee', 'FEE', 'ACADEMIC', 1, 50.00, 50.00, NULL, '2024-08-15', '2024-12-15'),
(4, 6, 'Parking Fee', 'FEE', 'FACILITY', 1, 100.00, 100.00, NULL, '2024-08-15', '2024-12-15'),
(4, 7, 'Health Fee', 'FEE', 'HEALTH', 1, 150.00, 150.00, NULL, '2024-08-15', '2024-12-15');

-- =====================================================
-- INSERT SAMPLE PAYMENTS
-- =====================================================

INSERT INTO payments (
    student_account_id, payment_number, payment_date, amount, payment_method,
    reference_number, gateway_transaction_id, status, processed_by, notes
) VALUES
-- John Doe Payments
(1, 'PAY-2024-001', '2024-08-15', 5000.00, 'CREDIT_CARD', 'CC-789123', 'TXN-ABC123DEF', 'COMPLETED', 1, 'Initial payment for Fall 2024'),
(1, 'PAY-2024-002', '2024-09-15', 2500.00, 'BANK_TRANSFER', 'ACH-456789', 'TXN-GHI456JKL', 'COMPLETED', 1, 'Second installment'),
(1, 'PAY-2024-003', '2024-10-15', 2325.00, 'CHECK', 'CHK-001234', NULL, 'COMPLETED', 1, 'Third installment'),

-- Jane Smith Payments
(2, 'PAY-2024-004', '2024-08-10', 8000.00, 'BANK_TRANSFER', 'ACH-987654', 'TXN-MNO789PQR', 'COMPLETED', 1, 'Partial payment for Fall 2024'),
(2, 'PAY-2024-005', '2024-09-10', 3025.00, 'CREDIT_CARD', 'CC-456789', 'TXN-STU012VWX', 'COMPLETED', 1, 'Balance payment'),

-- Student 3 Payment
(3, 'PAY-2024-006', '2024-08-05', 6412.50, 'FINANCIAL_AID', 'FA-2024-001', NULL, 'COMPLETED', 1, 'Full payment via financial aid'),

-- Failed payment example
(1, 'PAY-2024-007', '2024-11-15', 1000.00, 'CREDIT_CARD', 'CC-FAILED', 'TXN-FAILED123', 'FAILED', 1, 'Payment failed - insufficient funds');

-- =====================================================
-- INSERT SAMPLE PAYMENT ALLOCATIONS
-- =====================================================

INSERT INTO payment_allocations (
    payment_id, billing_statement_id, allocated_amount, notes
) VALUES
-- John Doe Payment Allocations
(1, 1, 5000.00, 'Applied to Fall 2024 statement'),
(2, 1, 2500.00, 'Applied to Fall 2024 statement'),
(3, 1, 2325.00, 'Applied to Fall 2024 statement'),

-- Jane Smith Payment Allocations
(4, 2, 8000.00, 'Applied to Fall 2024 statement'),
(5, 2, 3025.00, 'Applied to Fall 2024 statement'),

-- Student 3 Payment Allocation
(6, 4, 6412.50, 'Full payment applied');

-- =====================================================
-- INSERT SAMPLE PAYMENT PLANS
-- =====================================================

INSERT INTO payment_plans (
    student_account_id, plan_name, total_amount, down_payment, number_of_installments,
    installment_amount, setup_fee, start_date, first_payment_date, payment_frequency,
    status, auto_pay_enabled, late_fee_amount, grace_period_days, created_by
) VALUES
-- John Doe Spring 2025 Payment Plan
(1, 'Spring 2025 Payment Plan', 12825.00, 2825.00, 4, 2500.00, 25.00,
 '2025-01-01', '2025-02-01', 'MONTHLY', 'ACTIVE', TRUE, 25.00, 10, 1),

-- Jane Smith Future Payment Plan
(2, 'Fall 2025 Payment Plan', 13000.00, 3000.00, 5, 2000.00, 0.00,
 '2025-08-01', '2025-09-01', 'MONTHLY', 'ACTIVE', FALSE, 30.00, 5, 1);

-- =====================================================
-- INSERT SAMPLE PAYMENT PLAN INSTALLMENTS
-- =====================================================

INSERT INTO payment_plan_installments (
    payment_plan_id, installment_number, scheduled_amount, due_date, status
) VALUES
-- John Doe Spring 2025 Installments
(1, 1, 2500.00, '2025-02-01', 'SCHEDULED'),
(1, 2, 2500.00, '2025-03-01', 'SCHEDULED'),
(1, 3, 2500.00, '2025-04-01', 'SCHEDULED'),
(1, 4, 2500.00, '2025-05-01', 'SCHEDULED'),

-- Jane Smith Fall 2025 Installments
(2, 1, 2000.00, '2025-09-01', 'SCHEDULED'),
(2, 2, 2000.00, '2025-10-01', 'SCHEDULED'),
(2, 3, 2000.00, '2025-11-01', 'SCHEDULED'),
(2, 4, 2000.00, '2025-12-01', 'SCHEDULED'),
(2, 5, 2000.00, '2026-01-01', 'SCHEDULED');

-- =====================================================
-- INSERT SAMPLE FINANCIAL AID
-- =====================================================

INSERT INTO financial_aid (
    student_id, academic_year_id, aid_type, aid_category, aid_name, description,
    awarded_amount, disbursed_amount, eligibility_criteria, gpa_requirement,
    enrollment_requirement, award_date, effective_date, expiry_date, status,
    external_reference, funding_source, awarded_by
) VALUES
-- John Doe Financial Aid
((SELECT id FROM users WHERE username = 'john_doe'), 2, 'SCHOLARSHIP', 'INSTITUTIONAL', 
 'Merit Scholarship', 'Academic merit-based scholarship for outstanding students',
 2000.00, 1000.00, 'Minimum 3.5 GPA, Full-time enrollment', 3.50, 'FULL_TIME',
 '2024-06-01', '2024-08-15', '2025-05-15', 'DISBURSED', 'MERIT-2024-001', 'University Endowment', 1),

-- Jane Smith Financial Aid
((SELECT id FROM users WHERE username = 'jane_smith'), 2, 'GRANT', 'FEDERAL',
 'Pell Grant', 'Federal need-based grant for undergraduate students',
 3500.00, 1750.00, 'Demonstrated financial need, US Citizen', 2.00, 'HALF_TIME',
 '2024-07-01', '2024-08-15', '2025-05-15', 'DISBURSED', 'PELL-2024-002', 'US Department of Education', 1),

-- Student Work Study
((SELECT id FROM users WHERE student_id = 'STU001' LIMIT 1), 2, 'WORK_STUDY', 'FEDERAL',
 'Federal Work Study', 'Part-time employment program for students with financial need',
 2500.00, 625.00, 'Financial need, US Citizen or eligible non-citizen', 2.00, 'PART_TIME',
 '2024-07-15', '2024-08-15', '2025-05-15', 'ACCEPTED', 'FWS-2024-003', 'US Department of Education', 1),

-- Graduate Assistantship
((SELECT id FROM users WHERE role = 'STUDENT' AND user_type = 'STUDENT' LIMIT 1), 2, 'ASSISTANTSHIP', 'INSTITUTIONAL',
 'Graduate Teaching Assistantship', 'Teaching assistantship with tuition waiver and stipend',
 15000.00, 3750.00, 'Graduate student, Good academic standing', 3.00, 'FULL_TIME',
 '2024-05-01', '2024-08-15', '2025-05-15', 'DISBURSED', 'GTA-2024-004', 'Computer Science Department', 1);

-- =====================================================
-- INSERT SAMPLE FINANCIAL AID DISBURSEMENTS
-- =====================================================

INSERT INTO financial_aid_disbursements (
    financial_aid_id, disbursement_number, scheduled_date, actual_date, amount,
    status, processed_by, applied_to_account, student_account_id
) VALUES
-- John Doe Merit Scholarship Disbursements
(1, 1, '2024-08-15', '2024-08-15', 500.00, 'PROCESSED', 1, TRUE, 1),
(1, 2, '2025-01-15', '2025-01-15', 500.00, 'PROCESSED', 1, TRUE, 1),
(1, 3, '2025-08-15', NULL, 500.00, 'SCHEDULED', NULL, TRUE, 1),
(1, 4, '2026-01-15', NULL, 500.00, 'SCHEDULED', NULL, TRUE, 1),

-- Jane Smith Pell Grant Disbursements
(2, 1, '2024-08-15', '2024-08-15', 1750.00, 'PROCESSED', 1, TRUE, 2),
(2, 2, '2025-01-15', NULL, 1750.00, 'SCHEDULED', NULL, TRUE, 2),

-- Work Study Disbursements (quarterly)
(3, 1, '2024-09-30', '2024-09-30', 625.00, 'PROCESSED', 1, FALSE, NULL),
(3, 2, '2024-12-31', NULL, 625.00, 'SCHEDULED', NULL, FALSE, NULL),
(3, 3, '2025-03-31', NULL, 625.00, 'SCHEDULED', NULL, FALSE, NULL),
(3, 4, '2025-05-31', NULL, 625.00, 'SCHEDULED', NULL, FALSE, NULL),

-- Graduate Assistantship Disbursements (monthly)
(4, 1, '2024-08-31', '2024-08-31', 1250.00, 'PROCESSED', 1, TRUE, 3),
(4, 2, '2024-09-30', '2024-09-30', 1250.00, 'PROCESSED', 1, TRUE, 3),
(4, 3, '2024-10-31', '2024-10-31', 1250.00, 'PROCESSED', 1, TRUE, 3);

-- =====================================================
-- INSERT SAMPLE REFUNDS
-- =====================================================

INSERT INTO refunds (
    student_account_id, refund_number, refund_type, reason, amount,
    request_date, approved_date, processed_date, refund_method,
    status, requested_by, approved_by, processed_by, notes
) VALUES
-- Course Drop Refund
(2, 'REF-2024-001', 'COURSE_DROP', 'Dropped course within refund period', 400.00,
 '2024-09-01', '2024-09-02', '2024-09-05', 'CREDIT_CARD_REVERSAL',
 'PROCESSED', 2, 1, 1, 'Refund for CS301 course drop'),

-- Overpayment Refund
(3, 'REF-2024-002', 'OVERPAYMENT', 'Student overpaid tuition', 150.00,
 '2024-10-15', '2024-10-16', '2024-10-20', 'CHECK',
 'PROCESSED', 3, 1, 1, 'Overpayment refund processed via check'),

-- Pending Refund
(1, 'REF-2024-003', 'FEE_ADJUSTMENT', 'Lab fee adjustment for cancelled lab', 50.00,
 '2024-11-01', NULL, NULL, NULL,
 'PENDING_APPROVAL', 1, NULL, NULL, 'Awaiting approval for lab fee refund');

-- =====================================================
-- INSERT SAMPLE LATE FEES
-- =====================================================

INSERT INTO late_fees (
    student_account_id, billing_statement_id, fee_type, original_amount,
    fee_rate, calculated_fee, assessed_fee, due_date, assessment_date, status
) VALUES
-- John Doe Late Fee (waived)
(1, 1, 'LATE_PAYMENT', 2500.00, 0.0150, 37.50, 37.50,
 '2024-08-31', '2024-09-15', 'WAIVED'),

-- Jane Smith Late Fee
(2, 2, 'LATE_PAYMENT', 1800.00, 0.0150, 27.00, 27.00,
 '2024-08-31', '2024-09-15', 'ASSESSED'),

-- Returned Check Fee
(1, 1, 'RETURNED_CHECK', 2325.00, 0.0000, 35.00, 35.00,
 '2024-10-15', '2024-10-20', 'ASSESSED');

-- =====================================================
-- UPDATE BILLING STATEMENT TOTALS
-- =====================================================

-- Update billing statements with correct totals (triggers should handle this, but ensuring consistency)
UPDATE billing_statements SET
    subtotal_amount = (SELECT SUM(amount) FROM billing_line_items WHERE billing_statement_id = billing_statements.id),
    total_amount = subtotal_amount + tax_amount - discount_amount,
    balance_amount = total_amount - paid_amount,
    updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- UPDATE STUDENT ACCOUNT BALANCES
-- =====================================================

-- Update student account balances based on billing and payments
UPDATE student_accounts SET
    current_balance = (
        SELECT COALESCE(SUM(bs.total_amount), 0) - COALESCE(SUM(p.amount), 0)
        FROM billing_statements bs
        LEFT JOIN payments p ON p.student_account_id = student_accounts.id AND p.status = 'COMPLETED'
        WHERE bs.student_account_id = student_accounts.id
    ),
    updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- INSERT SAMPLE FINANCIAL TRANSACTIONS LOG
-- =====================================================

-- Note: These would normally be created by triggers, but adding some sample data
INSERT INTO financial_transactions_log (
    student_account_id, transaction_type, amount, balance_before, balance_after,
    reference_type, reference_id, reference_number, description, processed_by
) VALUES
-- John Doe Transaction History
(1, 'CHARGE', 12325.00, 0.00, 12325.00, 'BILLING_STATEMENT', 1, 'BILL-2024-F-001', 'Fall 2024 Billing Statement', 1),
(1, 'PAYMENT', -5000.00, 12325.00, 7325.00, 'PAYMENT', 1, 'PAY-2024-001', 'Credit Card Payment', 1),
(1, 'PAYMENT', -2500.00, 7325.00, 4825.00, 'PAYMENT', 2, 'PAY-2024-002', 'Bank Transfer Payment', 1),
(1, 'PAYMENT', -2325.00, 4825.00, 2500.00, 'PAYMENT', 3, 'PAY-2024-003', 'Check Payment', 1),

-- Jane Smith Transaction History
(2, 'CHARGE', 12825.00, 0.00, 12825.00, 'BILLING_STATEMENT', 2, 'BILL-2024-F-002', 'Fall 2024 Billing Statement', 1),
(2, 'PAYMENT', -8000.00, 12825.00, 4825.00, 'PAYMENT', 4, 'PAY-2024-004', 'Bank Transfer Payment', 1),
(2, 'PAYMENT', -3025.00, 4825.00, 1800.00, 'PAYMENT', 5, 'PAY-2024-005', 'Credit Card Payment', 1),
(2, 'REFUND', -400.00, 1800.00, 1400.00, 'REFUND', 1, 'REF-2024-001', 'Course Drop Refund', 1);