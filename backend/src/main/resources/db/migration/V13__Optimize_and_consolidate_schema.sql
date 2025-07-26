-- V13__Optimize_and_consolidate_schema.sql
-- Optimize database schema and consolidate improvements

-- =====================================================
-- OPTIMIZE TABLE STRUCTURES
-- =====================================================

-- Add missing NOT NULL constraints where appropriate
ALTER TABLE users ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE users ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE courses ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE courses ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE registrations ALTER COLUMN updated_at SET NOT NULL;

-- =====================================================
-- ADD MISSING DEFAULT VALUES
-- =====================================================

-- Set default values for columns that should have them
ALTER TABLE users ALTER COLUMN preferred_language SET DEFAULT 'en';
ALTER TABLE users ALTER COLUMN timezone SET DEFAULT 'UTC';
ALTER TABLE users ALTER COLUMN failed_login_attempts SET DEFAULT 0;
ALTER TABLE users ALTER COLUMN password_changed_at SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE courses ALTER COLUMN min_students SET DEFAULT 1;
ALTER TABLE courses ALTER COLUMN passing_grade SET DEFAULT 'D';

ALTER TABLE registrations ALTER COLUMN transcript_released SET DEFAULT FALSE;
ALTER TABLE registrations ALTER COLUMN certificate_issued SET DEFAULT FALSE;

-- =====================================================
-- OPTIMIZE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Drop redundant indexes if they exist
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_email;

-- Create optimized composite indexes
CREATE INDEX IF NOT EXISTS idx_users_username_status ON users(username, status) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_users_email_status ON users(email, status) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_users_student_id_status ON users(student_id, status) WHERE student_id IS NOT NULL AND status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_users_employee_id_status ON users(employee_id, status) WHERE employee_id IS NOT NULL AND status = 'ACTIVE';

-- Optimize course indexes
CREATE INDEX IF NOT EXISTS idx_courses_code_status ON courses(code, status) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_courses_department_status ON courses(department, status) WHERE department IS NOT NULL AND status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_courses_instructor_status ON courses(instructor, status) WHERE status = 'ACTIVE';

-- Optimize registration indexes
CREATE INDEX IF NOT EXISTS idx_registrations_user_status ON registrations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_registrations_course_status ON registrations(course_id, status);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status) WHERE payment_status != 'PAID';

-- Optimize financial indexes
CREATE INDEX IF NOT EXISTS idx_student_accounts_student_status ON student_accounts(student_id, account_status) WHERE account_status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_billing_statements_student_status ON billing_statements(student_account_id, status) WHERE status != 'PAID';
CREATE INDEX IF NOT EXISTS idx_payments_student_status ON payments(student_account_id, status) WHERE status = 'COMPLETED';

-- =====================================================
-- ADD PERFORMANCE-OPTIMIZED PARTIAL INDEXES
-- =====================================================

-- Index only active/relevant records for better performance
CREATE INDEX IF NOT EXISTS idx_billing_statements_due_date ON billing_statements(due_date) WHERE status IN ('PENDING', 'PARTIAL', 'OVERDUE');
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date) WHERE status = 'COMPLETED';
CREATE INDEX IF NOT EXISTS idx_late_fees_assessment_date ON late_fees(assessment_date) WHERE status = 'ASSESSED';
CREATE INDEX IF NOT EXISTS idx_refunds_request_date ON refunds(request_date) WHERE status IN ('REQUESTED', 'PENDING_APPROVAL');

-- =====================================================
-- OPTIMIZE FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Ensure all foreign key constraints have proper indexes
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_course_id ON registrations(course_id);
CREATE INDEX IF NOT EXISTS idx_student_accounts_student_id ON student_accounts(student_id);
CREATE INDEX IF NOT EXISTS idx_billing_statements_student_account_id ON billing_statements(student_account_id);
CREATE INDEX IF NOT EXISTS idx_billing_statements_academic_year_id ON billing_statements(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_billing_statements_semester_id ON billing_statements(semester_id);
CREATE INDEX IF NOT EXISTS idx_billing_line_items_billing_statement_id ON billing_line_items(billing_statement_id);
CREATE INDEX IF NOT EXISTS idx_billing_line_items_course_id ON billing_line_items(course_id) WHERE course_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_student_account_id ON payments(student_account_id);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_payment_id ON payment_allocations(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_billing_statement_id ON payment_allocations(billing_statement_id);
CREATE INDEX IF NOT EXISTS idx_financial_aid_student_id ON financial_aid(student_id);
CREATE INDEX IF NOT EXISTS idx_financial_aid_disbursements_financial_aid_id ON financial_aid_disbursements(financial_aid_id);

-- =====================================================
-- ADD COMPUTED COLUMNS FOR BETTER PERFORMANCE
-- =====================================================

-- Add computed column for available balance (if not exists)
-- This is already handled in the entity as a calculated field

-- =====================================================
-- OPTIMIZE TABLE STORAGE
-- =====================================================

-- Update table statistics for query optimizer
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
ANALYZE payment_plans;
ANALYZE payment_plan_installments;
ANALYZE late_fees;
ANALYZE refunds;
ANALYZE financial_transactions_log;

-- =====================================================
-- ADD HELPFUL VIEWS FOR COMMON QUERIES
-- =====================================================

-- Create view for active student registrations
CREATE OR REPLACE VIEW active_student_registrations AS
SELECT 
    r.id,
    r.user_id,
    r.course_id,
    u.username,
    u.first_name,
    u.last_name,
    u.student_id,
    c.code as course_code,
    c.title as course_title,
    c.instructor,
    r.grade,
    r.status,
    r.registration_date
FROM registrations r
JOIN users u ON r.user_id = u.id
JOIN courses c ON r.course_id = c.id
WHERE r.status = 'ENROLLED' 
  AND u.status = 'ACTIVE' 
  AND c.status = 'ACTIVE';

-- Create view for student account summary
CREATE OR REPLACE VIEW student_account_summary AS
SELECT 
    sa.id as account_id,
    sa.account_number,
    u.id as student_id,
    u.username,
    u.first_name,
    u.last_name,
    u.student_id as student_number,
    sa.current_balance,
    sa.credit_limit,
    sa.hold_amount,
    (sa.current_balance - sa.hold_amount) as available_balance,
    sa.account_status,
    COUNT(bs.id) as total_statements,
    COALESCE(SUM(CASE WHEN bs.status = 'PENDING' THEN bs.balance_amount ELSE 0 END), 0) as pending_balance,
    COALESCE(SUM(CASE WHEN bs.status = 'OVERDUE' THEN bs.balance_amount ELSE 0 END), 0) as overdue_balance
FROM student_accounts sa
JOIN users u ON sa.student_id = u.id
LEFT JOIN billing_statements bs ON sa.id = bs.student_account_id
WHERE u.status = 'ACTIVE'
GROUP BY sa.id, sa.account_number, u.id, u.username, u.first_name, u.last_name, 
         u.student_id, sa.current_balance, sa.credit_limit, sa.hold_amount, sa.account_status;

-- Create view for course enrollment summary
CREATE OR REPLACE VIEW course_enrollment_summary AS
SELECT 
    c.id as course_id,
    c.code,
    c.title,
    c.instructor,
    c.max_students,
    c.min_students,
    COUNT(r.id) as enrolled_count,
    (c.max_students - COUNT(r.id)) as available_spots,
    CASE 
        WHEN COUNT(r.id) >= c.max_students THEN 'FULL'
        WHEN COUNT(r.id) < c.min_students THEN 'UNDER_ENROLLED'
        ELSE 'AVAILABLE'
    END as enrollment_status,
    c.status as course_status
FROM courses c
LEFT JOIN registrations r ON c.id = r.course_id AND r.status = 'ENROLLED'
WHERE c.status = 'ACTIVE'
GROUP BY c.id, c.code, c.title, c.instructor, c.max_students, c.min_students, c.status;

-- =====================================================
-- ADD HELPFUL FUNCTIONS FOR COMMON CALCULATIONS
-- =====================================================

-- Function to calculate student GPA
CREATE OR REPLACE FUNCTION calculate_student_gpa(student_user_id BIGINT)
RETURNS DECIMAL(4,3) AS $$
DECLARE
    calculated_gpa DECIMAL(4,3);
BEGIN
    SELECT COALESCE(AVG(r.grade_points), 0.0)
    INTO calculated_gpa
    FROM registrations r
    JOIN courses c ON r.course_id = c.id
    WHERE r.user_id = student_user_id
      AND r.status = 'COMPLETED'
      AND r.grade_points IS NOT NULL;
    
    RETURN calculated_gpa;
END;
$$ LANGUAGE plpgsql;

-- Function to get student account balance
CREATE OR REPLACE FUNCTION get_student_balance(student_user_id BIGINT)
RETURNS DECIMAL(12,2) AS $$
DECLARE
    account_balance DECIMAL(12,2);
BEGIN
    SELECT COALESCE(current_balance, 0.0)
    INTO account_balance
    FROM student_accounts
    WHERE student_id = student_user_id;
    
    RETURN COALESCE(account_balance, 0.0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FINAL CLEANUP AND OPTIMIZATION
-- =====================================================

-- Remove any duplicate indexes that might have been created
-- PostgreSQL will ignore CREATE INDEX IF NOT EXISTS for duplicates

-- Update all table statistics one final time
-- Note: VACUUM ANALYZE is non-transactional and should be run separately if needed

-- Log completion
-- SELECT 'Schema optimization completed successfully' as status;