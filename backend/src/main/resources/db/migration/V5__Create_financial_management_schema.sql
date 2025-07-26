-- V5__Create_financial_management_schema.sql
-- Create comprehensive financial management schema for ERP system

-- =====================================================
-- STUDENT ACCOUNTS TABLE
-- =====================================================

CREATE TABLE student_accounts (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    current_balance DECIMAL(12,2) DEFAULT 0.00,
    credit_limit DECIMAL(12,2) DEFAULT 0.00,
    hold_amount DECIMAL(12,2) DEFAULT 0.00,
    available_balance DECIMAL(12,2) GENERATED ALWAYS AS (current_balance - hold_amount) STORED,
    last_statement_date DATE,
    account_status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT student_accounts_status_check CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'CLOSED', 'HOLD')),
    CONSTRAINT student_accounts_balance_check CHECK (current_balance >= (credit_limit * -1)),
    CONSTRAINT student_accounts_hold_check CHECK (hold_amount >= 0)
);

-- =====================================================
-- FEE STRUCTURES TABLE
-- =====================================================

CREATE TABLE fee_structures (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    academic_year_id BIGINT REFERENCES academic_years(id),
    program_id BIGINT REFERENCES academic_programs(id),
    student_type VARCHAR(50) NOT NULL,
    residency_status VARCHAR(50) DEFAULT 'DOMESTIC',
    enrollment_status VARCHAR(50) DEFAULT 'FULL_TIME',
    
    -- Base fees
    base_tuition DECIMAL(10,2) DEFAULT 0.00,
    tuition_per_credit DECIMAL(10,2) DEFAULT 0.00,
    
    -- Standard fees
    technology_fee DECIMAL(10,2) DEFAULT 0.00,
    activity_fee DECIMAL(10,2) DEFAULT 0.00,
    library_fee DECIMAL(10,2) DEFAULT 0.00,
    lab_fee DECIMAL(10,2) DEFAULT 0.00,
    parking_fee DECIMAL(10,2) DEFAULT 0.00,
    health_fee DECIMAL(10,2) DEFAULT 0.00,
    recreation_fee DECIMAL(10,2) DEFAULT 0.00,
    student_union_fee DECIMAL(10,2) DEFAULT 0.00,
    graduation_fee DECIMAL(10,2) DEFAULT 0.00,
    
    -- Additional fees
    application_fee DECIMAL(10,2) DEFAULT 0.00,
    registration_fee DECIMAL(10,2) DEFAULT 0.00,
    late_registration_fee DECIMAL(10,2) DEFAULT 0.00,
    transcript_fee DECIMAL(10,2) DEFAULT 0.00,
    
    effective_date DATE NOT NULL,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fee_structures_student_type_check CHECK (student_type IN ('UNDERGRADUATE', 'GRADUATE', 'DOCTORAL', 'CERTIFICATE', 'CONTINUING_EDUCATION')),
    CONSTRAINT fee_structures_residency_check CHECK (residency_status IN ('DOMESTIC', 'INTERNATIONAL', 'RESIDENT', 'NON_RESIDENT')),
    CONSTRAINT fee_structures_enrollment_check CHECK (enrollment_status IN ('FULL_TIME', 'PART_TIME', 'AUDIT')),
    CONSTRAINT fee_structures_status_check CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    CONSTRAINT fee_structures_date_check CHECK (expiry_date IS NULL OR expiry_date > effective_date)
);

-- =====================================================
-- BILLING STATEMENTS TABLE
-- =====================================================

CREATE TABLE billing_statements (
    id BIGSERIAL PRIMARY KEY,
    student_account_id BIGINT NOT NULL REFERENCES student_accounts(id) ON DELETE CASCADE,
    statement_number VARCHAR(50) UNIQUE NOT NULL,
    billing_date DATE NOT NULL,
    due_date DATE NOT NULL,
    academic_year_id BIGINT REFERENCES academic_years(id),
    semester_id BIGINT REFERENCES academic_semesters(id),
    
    -- Amount calculations
    subtotal_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0.00,
    balance_amount DECIMAL(12,2) NOT NULL,
    
    -- Payment terms
    payment_terms VARCHAR(100),
    late_fee_rate DECIMAL(5,4) DEFAULT 0.0150, -- 1.5% per month
    minimum_payment DECIMAL(10,2) DEFAULT 0.00,
    
    -- Status and tracking
    status VARCHAR(50) DEFAULT 'PENDING',
    payment_plan_id BIGINT,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT billing_statements_status_check CHECK (status IN ('PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED', 'REFUNDED')),
    CONSTRAINT billing_statements_amount_check CHECK (total_amount >= 0 AND paid_amount >= 0 AND balance_amount >= 0),
    CONSTRAINT billing_statements_date_check CHECK (due_date >= billing_date)
);

-- =====================================================
-- BILLING LINE ITEMS TABLE
-- =====================================================

CREATE TABLE billing_line_items (
    id BIGSERIAL PRIMARY KEY,
    billing_statement_id BIGINT NOT NULL REFERENCES billing_statements(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    
    -- Item details
    description VARCHAR(500) NOT NULL,
    item_type VARCHAR(100) NOT NULL,
    item_category VARCHAR(100),
    
    -- Pricing
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    
    -- References
    course_id BIGINT REFERENCES courses(id),
    fee_structure_id BIGINT REFERENCES fee_structures(id),
    
    -- Dates
    service_period_start DATE,
    service_period_end DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT billing_line_items_type_check CHECK (item_type IN ('TUITION', 'FEE', 'PENALTY', 'REFUND', 'ADJUSTMENT', 'DISCOUNT', 'TAX')),
    CONSTRAINT billing_line_items_category_check CHECK (item_category IN ('ACADEMIC', 'ADMINISTRATIVE', 'FACILITY', 'TECHNOLOGY', 'HEALTH', 'RECREATION', 'OTHER')),
    CONSTRAINT billing_line_items_amount_check CHECK (quantity > 0 AND amount = quantity * unit_price),
    UNIQUE(billing_statement_id, line_number)
);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    student_account_id BIGINT NOT NULL REFERENCES student_accounts(id) ON DELETE CASCADE,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Payment details
    payment_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_type VARCHAR(50) DEFAULT 'REGULAR',
    
    -- External references
    reference_number VARCHAR(100),
    check_number VARCHAR(50),
    gateway_transaction_id VARCHAR(255),
    authorization_code VARCHAR(100),
    
    -- Banking details
    bank_name VARCHAR(255),
    account_last_four VARCHAR(4),
    routing_number VARCHAR(20),
    
    -- Processing details
    processed_date TIMESTAMP,
    processed_by BIGINT REFERENCES users(id),
    processing_fee DECIMAL(8,2) DEFAULT 0.00,
    
    -- Status and tracking
    status VARCHAR(50) DEFAULT 'PENDING',
    failure_reason TEXT,
    reconciliation_date DATE,
    reconciled_by BIGINT REFERENCES users(id),
    
    -- Additional information
    notes TEXT,
    receipt_sent BOOLEAN DEFAULT FALSE,
    receipt_sent_date TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT payments_method_check CHECK (payment_method IN ('CASH', 'CHECK', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'ACH', 'WIRE', 'FINANCIAL_AID', 'SCHOLARSHIP', 'EMPLOYER', 'THIRD_PARTY')),
    CONSTRAINT payments_type_check CHECK (payment_type IN ('REGULAR', 'REFUND', 'REVERSAL', 'ADJUSTMENT')),
    CONSTRAINT payments_status_check CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'DISPUTED')),
    CONSTRAINT payments_amount_check CHECK (amount > 0 OR payment_type IN ('REFUND', 'REVERSAL'))
);

-- =====================================================
-- PAYMENT ALLOCATIONS TABLE
-- =====================================================

CREATE TABLE payment_allocations (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    billing_statement_id BIGINT REFERENCES billing_statements(id),
    billing_line_item_id BIGINT REFERENCES billing_line_items(id),
    
    allocated_amount DECIMAL(10,2) NOT NULL,
    allocation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    CONSTRAINT payment_allocations_amount_check CHECK (allocated_amount > 0)
);

-- =====================================================
-- PAYMENT PLANS TABLE
-- =====================================================

CREATE TABLE payment_plans (
    id BIGSERIAL PRIMARY KEY,
    student_account_id BIGINT NOT NULL REFERENCES student_accounts(id) ON DELETE CASCADE,
    plan_name VARCHAR(255) NOT NULL,
    
    -- Plan details
    total_amount DECIMAL(12,2) NOT NULL,
    down_payment DECIMAL(10,2) DEFAULT 0.00,
    number_of_installments INTEGER NOT NULL,
    installment_amount DECIMAL(10,2) NOT NULL,
    setup_fee DECIMAL(8,2) DEFAULT 0.00,
    
    -- Dates
    start_date DATE NOT NULL,
    first_payment_date DATE NOT NULL,
    payment_frequency VARCHAR(20) DEFAULT 'MONTHLY',
    
    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE',
    auto_pay_enabled BOOLEAN DEFAULT FALSE,
    
    -- Terms
    late_fee_amount DECIMAL(8,2) DEFAULT 25.00,
    grace_period_days INTEGER DEFAULT 10,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    
    CONSTRAINT payment_plans_frequency_check CHECK (payment_frequency IN ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY')),
    CONSTRAINT payment_plans_status_check CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'DEFAULTED', 'SUSPENDED')),
    CONSTRAINT payment_plans_amount_check CHECK (total_amount > 0 AND installment_amount > 0 AND number_of_installments > 0)
);

-- =====================================================
-- PAYMENT PLAN INSTALLMENTS TABLE
-- =====================================================

CREATE TABLE payment_plan_installments (
    id BIGSERIAL PRIMARY KEY,
    payment_plan_id BIGINT NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    
    -- Amount and dates
    scheduled_amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    paid_date DATE,
    
    -- Late fees
    late_fee_assessed DECIMAL(8,2) DEFAULT 0.00,
    late_fee_waived DECIMAL(8,2) DEFAULT 0.00,
    
    -- Status
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    payment_id BIGINT REFERENCES payments(id),
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT installments_status_check CHECK (status IN ('SCHEDULED', 'PAID', 'LATE', 'MISSED', 'WAIVED')),
    CONSTRAINT installments_amount_check CHECK (scheduled_amount > 0 AND paid_amount >= 0),
    UNIQUE(payment_plan_id, installment_number)
);

-- =====================================================
-- FINANCIAL AID TABLE
-- =====================================================

CREATE TABLE financial_aid (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    academic_year_id BIGINT REFERENCES academic_years(id),
    
    -- Aid details
    aid_type VARCHAR(100) NOT NULL,
    aid_category VARCHAR(50) NOT NULL,
    aid_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Amounts
    awarded_amount DECIMAL(12,2) NOT NULL,
    disbursed_amount DECIMAL(12,2) DEFAULT 0.00,
    remaining_amount DECIMAL(12,2) GENERATED ALWAYS AS (awarded_amount - disbursed_amount) STORED,
    
    -- Eligibility and requirements
    eligibility_criteria TEXT,
    gpa_requirement DECIMAL(4,3),
    enrollment_requirement VARCHAR(50),
    renewal_requirements TEXT,
    
    -- Dates and status
    award_date DATE NOT NULL,
    effective_date DATE,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'AWARDED',
    
    -- External references
    external_reference VARCHAR(100),
    funding_source VARCHAR(255),
    
    -- Tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    awarded_by BIGINT REFERENCES users(id),
    
    CONSTRAINT financial_aid_type_check CHECK (aid_type IN ('GRANT', 'SCHOLARSHIP', 'LOAN', 'WORK_STUDY', 'FELLOWSHIP', 'ASSISTANTSHIP')),
    CONSTRAINT financial_aid_category_check CHECK (aid_category IN ('FEDERAL', 'STATE', 'INSTITUTIONAL', 'PRIVATE', 'EXTERNAL')),
    CONSTRAINT financial_aid_status_check CHECK (status IN ('AWARDED', 'ACCEPTED', 'DECLINED', 'DISBURSED', 'COMPLETED', 'CANCELLED', 'SUSPENDED')),
    CONSTRAINT financial_aid_enrollment_check CHECK (enrollment_requirement IS NULL OR enrollment_requirement IN ('FULL_TIME', 'PART_TIME', 'HALF_TIME')),
    CONSTRAINT financial_aid_amount_check CHECK (awarded_amount > 0 AND disbursed_amount >= 0)
);

-- =====================================================
-- FINANCIAL AID DISBURSEMENTS TABLE
-- =====================================================

CREATE TABLE financial_aid_disbursements (
    id BIGSERIAL PRIMARY KEY,
    financial_aid_id BIGINT NOT NULL REFERENCES financial_aid(id) ON DELETE CASCADE,
    
    -- Disbursement details
    disbursement_number INTEGER NOT NULL,
    scheduled_date DATE NOT NULL,
    actual_date DATE,
    amount DECIMAL(10,2) NOT NULL,
    
    -- Processing
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    processed_by BIGINT REFERENCES users(id),
    
    -- Application to account
    applied_to_account BOOLEAN DEFAULT TRUE,
    student_account_id BIGINT REFERENCES student_accounts(id),
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT disbursements_status_check CHECK (status IN ('SCHEDULED', 'PROCESSED', 'CANCELLED', 'RETURNED')),
    CONSTRAINT disbursements_amount_check CHECK (amount > 0),
    UNIQUE(financial_aid_id, disbursement_number)
);

-- =====================================================
-- REFUNDS TABLE
-- =====================================================

CREATE TABLE refunds (
    id BIGSERIAL PRIMARY KEY,
    student_account_id BIGINT NOT NULL REFERENCES student_accounts(id) ON DELETE CASCADE,
    refund_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Refund details
    refund_type VARCHAR(50) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    
    -- Dates
    request_date DATE NOT NULL,
    approved_date DATE,
    processed_date DATE,
    
    -- Processing details
    refund_method VARCHAR(50),
    check_number VARCHAR(50),
    transaction_id VARCHAR(255),
    
    -- Status and approval
    status VARCHAR(50) DEFAULT 'REQUESTED',
    requested_by BIGINT REFERENCES users(id),
    approved_by BIGINT REFERENCES users(id),
    processed_by BIGINT REFERENCES users(id),
    
    -- References
    original_payment_id BIGINT REFERENCES payments(id),
    billing_statement_id BIGINT REFERENCES billing_statements(id),
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT refunds_type_check CHECK (refund_type IN ('OVERPAYMENT', 'WITHDRAWAL', 'COURSE_DROP', 'FEE_ADJUSTMENT', 'FINANCIAL_AID', 'ERROR_CORRECTION')),
    CONSTRAINT refunds_method_check CHECK (refund_method IS NULL OR refund_method IN ('CHECK', 'ACH', 'CREDIT_CARD_REVERSAL', 'WIRE', 'CASH')),
    CONSTRAINT refunds_status_check CHECK (status IN ('REQUESTED', 'PENDING_APPROVAL', 'APPROVED', 'PROCESSED', 'CANCELLED', 'REJECTED')),
    CONSTRAINT refunds_amount_check CHECK (amount > 0)
);

-- =====================================================
-- LATE FEES TABLE
-- =====================================================

CREATE TABLE late_fees (
    id BIGSERIAL PRIMARY KEY,
    student_account_id BIGINT NOT NULL REFERENCES student_accounts(id) ON DELETE CASCADE,
    billing_statement_id BIGINT REFERENCES billing_statements(id),
    
    -- Fee details
    fee_type VARCHAR(50) NOT NULL DEFAULT 'LATE_PAYMENT',
    original_amount DECIMAL(10,2) NOT NULL,
    fee_rate DECIMAL(5,4),
    calculated_fee DECIMAL(10,2) NOT NULL,
    assessed_fee DECIMAL(10,2) NOT NULL,
    waived_amount DECIMAL(10,2) DEFAULT 0.00,
    
    -- Dates
    due_date DATE NOT NULL,
    assessment_date DATE NOT NULL,
    waived_date DATE,
    
    -- Status and approval
    status VARCHAR(50) DEFAULT 'ASSESSED',
    waived_by BIGINT REFERENCES users(id),
    waiver_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT late_fees_type_check CHECK (fee_type IN ('LATE_PAYMENT', 'RETURNED_CHECK', 'PAYMENT_PLAN_DEFAULT')),
    CONSTRAINT late_fees_status_check CHECK (status IN ('ASSESSED', 'WAIVED', 'PAID')),
    CONSTRAINT late_fees_amount_check CHECK (original_amount > 0 AND calculated_fee >= 0 AND assessed_fee >= 0 AND waived_amount >= 0)
);

-- =====================================================
-- FINANCIAL TRANSACTIONS LOG TABLE
-- =====================================================

CREATE TABLE financial_transactions_log (
    id BIGSERIAL PRIMARY KEY,
    student_account_id BIGINT NOT NULL REFERENCES student_accounts(id) ON DELETE CASCADE,
    
    -- Transaction details
    transaction_type VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(12,2) NOT NULL,
    balance_before DECIMAL(12,2) NOT NULL,
    balance_after DECIMAL(12,2) NOT NULL,
    
    -- References
    reference_type VARCHAR(50),
    reference_id BIGINT,
    reference_number VARCHAR(100),
    
    -- Description and tracking
    description TEXT NOT NULL,
    processed_by BIGINT REFERENCES users(id),
    
    CONSTRAINT transactions_log_type_check CHECK (transaction_type IN ('CHARGE', 'PAYMENT', 'REFUND', 'ADJUSTMENT', 'TRANSFER', 'FEE', 'WAIVER')),
    CONSTRAINT transactions_log_reference_check CHECK (reference_type IN ('BILLING_STATEMENT', 'PAYMENT', 'REFUND', 'ADJUSTMENT', 'FINANCIAL_AID', 'LATE_FEE'))
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Student Accounts indexes
CREATE INDEX idx_student_accounts_student_id ON student_accounts(student_id);
CREATE INDEX idx_student_accounts_account_number ON student_accounts(account_number);
CREATE INDEX idx_student_accounts_status ON student_accounts(account_status);

-- Fee Structures indexes
CREATE INDEX idx_fee_structures_academic_year ON fee_structures(academic_year_id);
CREATE INDEX idx_fee_structures_program ON fee_structures(program_id);
CREATE INDEX idx_fee_structures_type ON fee_structures(student_type, residency_status, enrollment_status);
CREATE INDEX idx_fee_structures_effective_date ON fee_structures(effective_date, expiry_date);

-- Billing Statements indexes
CREATE INDEX idx_billing_statements_student_account ON billing_statements(student_account_id);
CREATE INDEX idx_billing_statements_number ON billing_statements(statement_number);
CREATE INDEX idx_billing_statements_dates ON billing_statements(billing_date, due_date);
CREATE INDEX idx_billing_statements_status ON billing_statements(status);
CREATE INDEX idx_billing_statements_semester ON billing_statements(semester_id);

-- Billing Line Items indexes
CREATE INDEX idx_billing_line_items_statement ON billing_line_items(billing_statement_id);
CREATE INDEX idx_billing_line_items_type ON billing_line_items(item_type, item_category);
CREATE INDEX idx_billing_line_items_course ON billing_line_items(course_id) WHERE course_id IS NOT NULL;

-- Payments indexes
CREATE INDEX idx_payments_student_account ON payments(student_account_id);
CREATE INDEX idx_payments_number ON payments(payment_number);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(payment_method);
CREATE INDEX idx_payments_gateway_id ON payments(gateway_transaction_id) WHERE gateway_transaction_id IS NOT NULL;

-- Payment Allocations indexes
CREATE INDEX idx_payment_allocations_payment ON payment_allocations(payment_id);
CREATE INDEX idx_payment_allocations_statement ON payment_allocations(billing_statement_id);

-- Payment Plans indexes
CREATE INDEX idx_payment_plans_student_account ON payment_plans(student_account_id);
CREATE INDEX idx_payment_plans_status ON payment_plans(status);
CREATE INDEX idx_payment_plans_dates ON payment_plans(start_date, first_payment_date);

-- Payment Plan Installments indexes
CREATE INDEX idx_installments_payment_plan ON payment_plan_installments(payment_plan_id);
CREATE INDEX idx_installments_due_date ON payment_plan_installments(due_date);
CREATE INDEX idx_installments_status ON payment_plan_installments(status);

-- Financial Aid indexes
CREATE INDEX idx_financial_aid_student ON financial_aid(student_id);
CREATE INDEX idx_financial_aid_academic_year ON financial_aid(academic_year_id);
CREATE INDEX idx_financial_aid_type ON financial_aid(aid_type, aid_category);
CREATE INDEX idx_financial_aid_status ON financial_aid(status);
CREATE INDEX idx_financial_aid_dates ON financial_aid(award_date, effective_date, expiry_date);

-- Financial Aid Disbursements indexes
CREATE INDEX idx_disbursements_financial_aid ON financial_aid_disbursements(financial_aid_id);
CREATE INDEX idx_disbursements_dates ON financial_aid_disbursements(scheduled_date, actual_date);
CREATE INDEX idx_disbursements_status ON financial_aid_disbursements(status);

-- Refunds indexes
CREATE INDEX idx_refunds_student_account ON refunds(student_account_id);
CREATE INDEX idx_refunds_number ON refunds(refund_number);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_dates ON refunds(request_date, approved_date, processed_date);

-- Late Fees indexes
CREATE INDEX idx_late_fees_student_account ON late_fees(student_account_id);
CREATE INDEX idx_late_fees_billing_statement ON late_fees(billing_statement_id);
CREATE INDEX idx_late_fees_status ON late_fees(status);
CREATE INDEX idx_late_fees_dates ON late_fees(due_date, assessment_date);

-- Financial Transactions Log indexes
CREATE INDEX idx_transactions_log_student_account ON financial_transactions_log(student_account_id);
CREATE INDEX idx_transactions_log_date ON financial_transactions_log(transaction_date);
CREATE INDEX idx_transactions_log_type ON financial_transactions_log(transaction_type);
CREATE INDEX idx_transactions_log_reference ON financial_transactions_log(reference_type, reference_id);

-- =====================================================
-- CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update student account balance trigger
CREATE OR REPLACE FUNCTION update_student_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the student account balance and last statement date
    UPDATE student_accounts 
    SET current_balance = current_balance + NEW.total_amount,
        last_statement_date = NEW.billing_date,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.student_account_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_account_balance_on_billing
    AFTER INSERT ON billing_statements
    FOR EACH ROW
    EXECUTE FUNCTION update_student_account_balance();

-- Update billing statement totals trigger
CREATE OR REPLACE FUNCTION update_billing_statement_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE billing_statements 
    SET subtotal_amount = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM billing_line_items 
        WHERE billing_statement_id = COALESCE(NEW.billing_statement_id, OLD.billing_statement_id)
    ),
    total_amount = subtotal_amount + tax_amount - discount_amount,
    balance_amount = total_amount - paid_amount,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.billing_statement_id, OLD.billing_statement_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_billing_totals
    AFTER INSERT OR UPDATE OR DELETE ON billing_line_items
    FOR EACH ROW
    EXECUTE FUNCTION update_billing_statement_totals();

-- Log financial transactions trigger
CREATE OR REPLACE FUNCTION log_financial_transaction()
RETURNS TRIGGER AS $$
DECLARE
    balance_before DECIMAL(12,2);
    balance_after DECIMAL(12,2);
    transaction_desc TEXT;
BEGIN
    -- Get balance before transaction
    SELECT current_balance INTO balance_before 
    FROM student_accounts 
    WHERE id = NEW.student_account_id;
    
    -- Calculate balance after transaction
    balance_after := balance_before + NEW.amount;
    
    -- Create transaction description
    transaction_desc := 'Payment: ' || NEW.payment_method || ' - ' || NEW.payment_number;
    
    -- Insert transaction log
    INSERT INTO financial_transactions_log (
        student_account_id,
        transaction_type,
        amount,
        balance_before,
        balance_after,
        reference_type,
        reference_id,
        reference_number,
        description,
        processed_by
    ) VALUES (
        NEW.student_account_id,
        'PAYMENT',
        NEW.amount,
        balance_before,
        balance_after,
        'PAYMENT',
        NEW.id,
        NEW.payment_number,
        transaction_desc,
        NEW.processed_by
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_payment_transaction
    AFTER INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION log_financial_transaction();