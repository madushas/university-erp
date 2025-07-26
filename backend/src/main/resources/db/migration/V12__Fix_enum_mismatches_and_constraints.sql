-- V12__Fix_enum_mismatches_and_constraints.sql
-- Fix all enum mismatches and constraint violations

-- =====================================================
-- FIX ROLE ENUM MISMATCHES
-- =====================================================

-- Drop the role constraint temporarily to allow updates
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Update FACULTY role to INSTRUCTOR (closest match)
UPDATE users SET role = 'INSTRUCTOR' WHERE role = 'FACULTY';

-- Recreate the role constraint with correct values
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('STUDENT', 'INSTRUCTOR', 'ADMIN'));

-- =====================================================
-- FIX SEMESTER STATUS ENUM MISMATCHES
-- =====================================================

-- Drop the semester status constraint temporarily to allow updates
ALTER TABLE academic_semesters DROP CONSTRAINT IF EXISTS semesters_status_check;

-- Update INACTIVE status to PLANNING (as per V7 migration)
UPDATE academic_semesters SET status = 'PLANNING' WHERE status = 'INACTIVE';

-- Recreate the semester status constraint with correct values
ALTER TABLE academic_semesters ADD CONSTRAINT semesters_status_check 
CHECK (status IN ('PLANNING', 'REGISTRATION_OPEN', 'ACTIVE', 'FINALS_PERIOD', 'GRADES_DUE', 'COMPLETED', 'ARCHIVED'));

-- =====================================================
-- FIX REGISTRATION STATUS ENUM MISMATCHES
-- =====================================================

-- Drop the registration status constraint temporarily to allow updates
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_status_check;

-- Ensure all registration statuses are valid
UPDATE registrations SET status = 'ENROLLED' 
WHERE status NOT IN ('ENROLLED', 'COMPLETED', 'DROPPED');

-- Recreate the registration status constraint with correct values
ALTER TABLE registrations ADD CONSTRAINT registrations_status_check 
CHECK (status IN ('ENROLLED', 'COMPLETED', 'DROPPED'));

-- =====================================================
-- FIX USER STATUS ENUM MISMATCHES
-- =====================================================

-- Drop the user status constraint temporarily to allow updates
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;

-- Update any invalid user statuses
UPDATE users SET status = 'ACTIVE' 
WHERE status NOT IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED', 'PENDING_APPROVAL');

-- Recreate the user status constraint with correct values
ALTER TABLE users ADD CONSTRAINT users_status_check 
CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED', 'PENDING_APPROVAL'));

-- =====================================================
-- FIX PAYMENT STATUS ENUM MISMATCHES
-- =====================================================

-- Drop the payment status constraint temporarily to allow updates
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_payment_status_check;

-- Update payment statuses to match enum
UPDATE registrations SET payment_status = 'PENDING' 
WHERE payment_status NOT IN ('PENDING', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'REFUNDED', 'CANCELLED', 'COMPLETED', 'PROCESSING', 'FAILED');

-- Recreate the payment status constraint with correct values
ALTER TABLE registrations ADD CONSTRAINT registrations_payment_status_check 
CHECK (payment_status IN ('PENDING', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'REFUNDED', 'CANCELLED', 'COMPLETED', 'PROCESSING', 'FAILED'));

-- =====================================================
-- FIX CONSTRAINT VIOLATIONS IN STUDENT ACCOUNTS
-- =====================================================

-- Fix negative balance constraint violations
-- Update accounts where current_balance is less than negative credit_limit
UPDATE student_accounts 
SET current_balance = credit_limit * -1 
WHERE current_balance < (credit_limit * -1);

-- Fix hold amount constraint violations
UPDATE student_accounts 
SET hold_amount = 0 
WHERE hold_amount < 0;

-- =====================================================
-- FIX CONSTRAINT VIOLATIONS IN BILLING STATEMENTS
-- =====================================================

-- Fix negative amount constraints
UPDATE billing_statements 
SET subtotal_amount = 0 
WHERE subtotal_amount < 0;

UPDATE billing_statements 
SET tax_amount = 0 
WHERE tax_amount < 0;

UPDATE billing_statements 
SET discount_amount = 0 
WHERE discount_amount < 0;

UPDATE billing_statements 
SET paid_amount = 0 
WHERE paid_amount < 0;

UPDATE billing_statements 
SET balance_amount = 0 
WHERE balance_amount < 0;

-- Recalculate billing statement totals
UPDATE billing_statements 
SET total_amount = subtotal_amount + tax_amount - discount_amount,
    balance_amount = subtotal_amount + tax_amount - discount_amount - paid_amount;

-- =====================================================
-- FIX CONSTRAINT VIOLATIONS IN PAYMENTS
-- =====================================================

-- Fix negative payment amounts (except for refunds/reversals)
UPDATE payments 
SET amount = ABS(amount) 
WHERE amount < 0 AND payment_type NOT IN ('REFUND', 'REVERSAL');

-- Fix processing fees
UPDATE payments 
SET processing_fee = 0 
WHERE processing_fee < 0;

-- =====================================================
-- FIX CONSTRAINT VIOLATIONS IN LATE FEES
-- =====================================================

-- Fix negative late fee amounts
UPDATE late_fees 
SET original_amount = ABS(original_amount) 
WHERE original_amount < 0;

UPDATE late_fees 
SET calculated_fee = ABS(calculated_fee) 
WHERE calculated_fee < 0;

UPDATE late_fees 
SET assessed_fee = ABS(assessed_fee) 
WHERE assessed_fee < 0;

UPDATE late_fees 
SET waived_amount = ABS(waived_amount) 
WHERE waived_amount < 0;

-- =====================================================
-- FIX CONSTRAINT VIOLATIONS IN REFUNDS
-- =====================================================

-- Fix negative refund amounts
UPDATE refunds 
SET amount = ABS(amount) 
WHERE amount < 0;

-- =====================================================
-- FIX CONSTRAINT VIOLATIONS IN PAYMENT PLANS
-- =====================================================

-- Fix negative payment plan amounts
UPDATE payment_plans 
SET total_amount = ABS(total_amount) 
WHERE total_amount <= 0;

UPDATE payment_plans 
SET installment_amount = ABS(installment_amount) 
WHERE installment_amount <= 0;

UPDATE payment_plans 
SET number_of_installments = 1 
WHERE number_of_installments <= 0;

-- =====================================================
-- FIX CONSTRAINT VIOLATIONS IN PAYMENT PLAN INSTALLMENTS
-- =====================================================

-- Fix negative installment amounts
UPDATE payment_plan_installments 
SET scheduled_amount = ABS(scheduled_amount) 
WHERE scheduled_amount <= 0;

UPDATE payment_plan_installments 
SET paid_amount = ABS(paid_amount) 
WHERE paid_amount < 0;

-- =====================================================
-- FIX CONSTRAINT VIOLATIONS IN FINANCIAL AID
-- =====================================================

-- Fix negative financial aid amounts
UPDATE financial_aid 
SET awarded_amount = ABS(awarded_amount) 
WHERE awarded_amount <= 0;

UPDATE financial_aid 
SET disbursed_amount = ABS(disbursed_amount) 
WHERE disbursed_amount < 0;

-- Ensure disbursed amount doesn't exceed awarded amount
UPDATE financial_aid 
SET disbursed_amount = awarded_amount 
WHERE disbursed_amount > awarded_amount;

-- =====================================================
-- FIX CONSTRAINT VIOLATIONS IN FINANCIAL AID DISBURSEMENTS
-- =====================================================

-- Fix negative disbursement amounts
UPDATE financial_aid_disbursements 
SET amount = ABS(amount) 
WHERE amount <= 0;

-- =====================================================
-- FIX DATE CONSTRAINT VIOLATIONS
-- =====================================================

-- Fix academic years where end_date <= start_date
UPDATE academic_years 
SET end_date = start_date + INTERVAL '1 year' 
WHERE end_date <= start_date;

-- Fix academic semesters where end_date <= start_date
UPDATE academic_semesters 
SET end_date = start_date + INTERVAL '4 months' 
WHERE end_date <= start_date;

-- Fix billing statements where due_date < billing_date
UPDATE billing_statements 
SET due_date = billing_date + INTERVAL '30 days' 
WHERE due_date < billing_date;

-- =====================================================
-- FIX COURSE CONSTRAINT VIOLATIONS
-- =====================================================

-- Fix courses with invalid credit values
UPDATE courses 
SET credits = 1 
WHERE credits <= 0;

-- Fix courses with invalid max_students values
UPDATE courses 
SET max_students = 30 
WHERE max_students IS NULL OR max_students <= 0;

-- Fix courses with invalid min_students values
UPDATE courses 
SET min_students = 1 
WHERE min_students IS NULL OR min_students <= 0 OR min_students > max_students;

-- =====================================================
-- FIX USER CONSTRAINT VIOLATIONS
-- =====================================================

-- Fix users with invalid year_of_study
UPDATE users 
SET year_of_study = NULL 
WHERE year_of_study <= 0 OR year_of_study > 8;

-- Fix users with invalid GPA values
UPDATE users 
SET gpa = NULL 
WHERE gpa < 0.0 OR gpa > 4.0;

-- Fix users with invalid failed_login_attempts
UPDATE users 
SET failed_login_attempts = 0 
WHERE failed_login_attempts < 0;

-- =====================================================
-- CLEAN UP ORPHANED RECORDS
-- =====================================================

-- Remove payment allocations for non-existent payments
DELETE FROM payment_allocations 
WHERE payment_id NOT IN (SELECT id FROM payments);

-- Remove payment allocations for non-existent billing statements
DELETE FROM payment_allocations 
WHERE billing_statement_id IS NOT NULL 
  AND billing_statement_id NOT IN (SELECT id FROM billing_statements);

-- Remove billing line items for non-existent billing statements
DELETE FROM billing_line_items 
WHERE billing_statement_id NOT IN (SELECT id FROM billing_statements);

-- Remove financial aid disbursements for non-existent financial aid
DELETE FROM financial_aid_disbursements 
WHERE financial_aid_id NOT IN (SELECT id FROM financial_aid);

-- Remove payment plan installments for non-existent payment plans
DELETE FROM payment_plan_installments 
WHERE payment_plan_id NOT IN (SELECT id FROM payment_plans);

-- =====================================================
-- UPDATE STATISTICS AND REFRESH CONSTRAINTS
-- =====================================================

-- Update table statistics for better query performance
ANALYZE users;
ANALYZE courses;
ANALYZE registrations;
ANALYZE student_accounts;
ANALYZE billing_statements;
ANALYZE billing_line_items;
ANALYZE payments;
ANALYZE payment_allocations;
ANALYZE financial_aid;
ANALYZE financial_aid_disbursements;

-- =====================================================
-- ADD MISSING INDEXES FOR PERFORMANCE
-- =====================================================

-- Add indexes that might be missing
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_billing_statements_status ON billing_statements(status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_academic_semesters_status ON academic_semesters(status);

-- =====================================================
-- FINAL VALIDATION QUERIES
-- =====================================================

-- These queries should return 0 rows if all fixes are successful
-- Uncomment for debugging if needed

-- SELECT COUNT(*) as invalid_roles FROM users WHERE role NOT IN ('STUDENT', 'INSTRUCTOR', 'ADMIN');
-- SELECT COUNT(*) as invalid_semester_status FROM academic_semesters WHERE status NOT IN ('PLANNING', 'REGISTRATION_OPEN', 'ACTIVE', 'FINALS_PERIOD', 'GRADES_DUE', 'COMPLETED', 'ARCHIVED');
-- SELECT COUNT(*) as invalid_registration_status FROM registrations WHERE status NOT IN ('ENROLLED', 'COMPLETED', 'DROPPED');
-- SELECT COUNT(*) as invalid_user_status FROM users WHERE status NOT IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED', 'PENDING_APPROVAL');
-- SELECT COUNT(*) as negative_balances FROM student_accounts WHERE current_balance < (credit_limit * -1);
-- SELECT COUNT(*) as negative_amounts FROM billing_statements WHERE subtotal_amount < 0 OR tax_amount < 0 OR discount_amount < 0 OR paid_amount < 0 OR balance_amount < 0;