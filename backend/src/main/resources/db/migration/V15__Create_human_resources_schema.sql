-- V15__Create_human_resources_schema.sql
-- Create comprehensive Human Resources management schema

-- =====================================================
-- EMPLOYEE RECORDS AND MANAGEMENT
-- =====================================================

-- Employee Records - Core employee information
CREATE TABLE employee_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    hire_date DATE NOT NULL,
    employment_type VARCHAR(50) NOT NULL, -- FULL_TIME, PART_TIME, CONTRACT, ADJUNCT
    employment_status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL, -- ACTIVE, INACTIVE, TERMINATED, RETIRED
    job_title VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    supervisor_id BIGINT REFERENCES users(id),
    salary DECIMAL(12,2),
    hourly_rate DECIMAL(8,2),
    benefits_eligible BOOLEAN DEFAULT true,
    tenure_track BOOLEAN DEFAULT false,
    tenure_date DATE,
    contract_start_date DATE,
    contract_end_date DATE,
    office_location VARCHAR(255),
    office_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_employment_type CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'ADJUNCT')),
    CONSTRAINT chk_employment_status CHECK (employment_status IN ('ACTIVE', 'INACTIVE', 'TERMINATED', 'RETIRED')),
    CONSTRAINT chk_salary_or_hourly CHECK (
        (employment_type IN ('FULL_TIME', 'PART_TIME') AND salary IS NOT NULL) OR
        (employment_type IN ('CONTRACT', 'ADJUNCT') AND hourly_rate IS NOT NULL) OR
        (salary IS NOT NULL OR hourly_rate IS NOT NULL)
    )
);

-- Employee Qualifications and Certifications
CREATE TABLE employee_qualifications (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE,
    qualification_type VARCHAR(100) NOT NULL, -- DEGREE, CERTIFICATION, LICENSE
    institution VARCHAR(255),
    field_of_study VARCHAR(255),
    degree_level VARCHAR(50), -- BACHELOR, MASTER, DOCTORAL, CERTIFICATE
    completion_date DATE,
    expiry_date DATE,
    verification_status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    document_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_qualification_type CHECK (qualification_type IN ('DEGREE', 'CERTIFICATION', 'LICENSE')),
    CONSTRAINT chk_degree_level CHECK (degree_level IN ('BACHELOR', 'MASTER', 'DOCTORAL', 'CERTIFICATE', 'DIPLOMA', 'ASSOCIATE')),
    CONSTRAINT chk_verification_status CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'))
);

-- =====================================================
-- ORGANIZATIONAL HIERARCHY AND REPORTING
-- =====================================================

-- Organizational Units (Departments, Divisions, etc.)
CREATE TABLE organizational_units (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_type VARCHAR(50) NOT NULL, -- DEPARTMENT, DIVISION, COLLEGE, SCHOOL, OFFICE
    parent_unit_id BIGINT REFERENCES organizational_units(id),
    head_employee_id BIGINT REFERENCES employee_records(id),
    budget_code VARCHAR(50),
    cost_center VARCHAR(50),
    location VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    established_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_unit_type CHECK (unit_type IN ('DEPARTMENT', 'DIVISION', 'COLLEGE', 'SCHOOL', 'OFFICE')),
    CONSTRAINT chk_org_unit_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'DISSOLVED'))
);

-- Employee Positions and Assignments
CREATE TABLE employee_positions (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE,
    organizational_unit_id BIGINT NOT NULL REFERENCES organizational_units(id),
    position_title VARCHAR(255) NOT NULL,
    position_type VARCHAR(50) NOT NULL, -- PRIMARY, SECONDARY, TEMPORARY
    start_date DATE NOT NULL,
    end_date DATE,
    fte_percentage DECIMAL(5,2) DEFAULT 100.00, -- Full-time equivalent percentage
    is_primary_position BOOLEAN DEFAULT true,
    reporting_manager_id BIGINT REFERENCES employee_records(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_position_type CHECK (position_type IN ('PRIMARY', 'SECONDARY', 'TEMPORARY')),
    CONSTRAINT chk_fte_percentage CHECK (fte_percentage > 0 AND fte_percentage <= 100),
    CONSTRAINT chk_position_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- =====================================================
-- PERFORMANCE MANAGEMENT
-- =====================================================

-- Performance Review Cycles
CREATE TABLE performance_review_cycles (
    id BIGSERIAL PRIMARY KEY,
    cycle_name VARCHAR(255) NOT NULL,
    cycle_year INTEGER NOT NULL,
    review_type VARCHAR(50) NOT NULL, -- ANNUAL, PROBATIONARY, PROMOTION, MID_YEAR
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    self_assessment_deadline DATE,
    manager_review_deadline DATE,
    final_review_deadline DATE,
    status VARCHAR(50) DEFAULT 'PLANNED' NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_review_type CHECK (review_type IN ('ANNUAL', 'PROBATIONARY', 'PROMOTION', 'MID_YEAR')),
    CONSTRAINT chk_cycle_status CHECK (status IN ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT chk_cycle_dates CHECK (end_date >= start_date)
);

-- Performance Reviews
CREATE TABLE performance_reviews (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE,
    reviewer_id BIGINT NOT NULL REFERENCES users(id),
    review_cycle_id BIGINT REFERENCES performance_review_cycles(id),
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    review_type VARCHAR(50) NOT NULL, -- ANNUAL, PROBATIONARY, PROMOTION, MID_YEAR
    overall_rating VARCHAR(50),
    goals_achievement_rating VARCHAR(50),
    professional_development_rating VARCHAR(50),
    leadership_rating VARCHAR(50),
    communication_rating VARCHAR(50),
    technical_skills_rating VARCHAR(50),
    strengths TEXT,
    areas_for_improvement TEXT,
    goals_for_next_period TEXT,
    manager_comments TEXT,
    employee_comments TEXT,
    hr_comments TEXT,
    status VARCHAR(50) DEFAULT 'DRAFT' NOT NULL,
    due_date DATE,
    submitted_date DATE,
    completed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_perf_review_type CHECK (review_type IN ('ANNUAL', 'PROBATIONARY', 'PROMOTION', 'MID_YEAR')),
    CONSTRAINT chk_perf_rating CHECK (overall_rating IN ('EXCEEDS_EXPECTATIONS', 'MEETS_EXPECTATIONS', 'BELOW_EXPECTATIONS', 'UNSATISFACTORY')),
    CONSTRAINT chk_perf_status CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'COMPLETED')),
    CONSTRAINT chk_review_dates CHECK (review_period_end >= review_period_start)
);

-- Performance Goals
CREATE TABLE performance_goals (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE,
    performance_review_id BIGINT REFERENCES performance_reviews(id),
    goal_title VARCHAR(255) NOT NULL,
    goal_description TEXT NOT NULL,
    goal_category VARCHAR(100), -- PROFESSIONAL_DEVELOPMENT, PERFORMANCE, LEADERSHIP, TECHNICAL
    target_completion_date DATE,
    actual_completion_date DATE,
    weight_percentage DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    achievement_rating VARCHAR(50),
    manager_notes TEXT,
    employee_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_goal_category CHECK (goal_category IN ('PROFESSIONAL_DEVELOPMENT', 'PERFORMANCE', 'LEADERSHIP', 'TECHNICAL', 'ADMINISTRATIVE')),
    CONSTRAINT chk_goal_status CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'DEFERRED')),
    CONSTRAINT chk_progress_percentage CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    CONSTRAINT chk_weight_percentage CHECK (weight_percentage >= 0 AND weight_percentage <= 100)
);

-- =====================================================
-- LEAVE MANAGEMENT
-- =====================================================

-- Leave Types
CREATE TABLE leave_types (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_paid BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT true,
    max_days_per_year INTEGER,
    max_consecutive_days INTEGER,
    accrual_rate DECIMAL(8,4), -- Days accrued per pay period
    carryover_allowed BOOLEAN DEFAULT false,
    max_carryover_days INTEGER,
    advance_notice_required_days INTEGER DEFAULT 0,
    documentation_required BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_leave_type_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- Employee Leave Balances
CREATE TABLE employee_leave_balances (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE,
    leave_type_id BIGINT NOT NULL REFERENCES leave_types(id),
    year INTEGER NOT NULL,
    allocated_days DECIMAL(8,2) DEFAULT 0.00,
    used_days DECIMAL(8,2) DEFAULT 0.00,
    pending_days DECIMAL(8,2) DEFAULT 0.00,
    carried_over_days DECIMAL(8,2) DEFAULT 0.00,
    available_days DECIMAL(8,2) GENERATED ALWAYS AS (
        allocated_days + carried_over_days - used_days - pending_days
    ) STORED,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(employee_id, leave_type_id, year),
    CONSTRAINT chk_leave_balance_year CHECK (year >= 2000 AND year <= 2100)
);

-- Leave Requests
CREATE TABLE leave_requests (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE,
    leave_type_id BIGINT NOT NULL REFERENCES leave_types(id),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(8,2) NOT NULL,
    reason TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    supporting_document_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    requested_by BIGINT NOT NULL REFERENCES users(id),
    approved_by BIGINT REFERENCES users(id),
    approved_date TIMESTAMP,
    rejection_reason TEXT,
    hr_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_leave_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED')),
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_total_days CHECK (total_days > 0)
);

-- Leave Request Approvals (for multi-level approval workflows)
CREATE TABLE leave_request_approvals (
    id BIGSERIAL PRIMARY KEY,
    leave_request_id BIGINT NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
    approver_id BIGINT NOT NULL REFERENCES users(id),
    approval_level INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    approved_date TIMESTAMP,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_approval_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    CONSTRAINT chk_approval_level CHECK (approval_level > 0)
);

-- =====================================================
-- CONTRACT TRACKING
-- =====================================================

-- Employment Contracts
CREATE TABLE employment_contracts (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    contract_type VARCHAR(50) NOT NULL, -- PERMANENT, FIXED_TERM, PROBATIONARY, CONSULTANT
    start_date DATE NOT NULL,
    end_date DATE,
    salary DECIMAL(12,2),
    hourly_rate DECIMAL(8,2),
    working_hours_per_week DECIMAL(5,2),
    job_title VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    reporting_manager_id BIGINT REFERENCES employee_records(id),
    contract_terms TEXT,
    benefits_included TEXT,
    termination_notice_period_days INTEGER,
    probation_period_months INTEGER,
    renewal_eligible BOOLEAN DEFAULT false,
    auto_renewal BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'DRAFT' NOT NULL,
    signed_by_employee_date DATE,
    signed_by_employer_date DATE,
    hr_approved_by BIGINT REFERENCES users(id),
    hr_approved_date DATE,
    document_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_contract_type CHECK (contract_type IN ('PERMANENT', 'FIXED_TERM', 'PROBATIONARY', 'CONSULTANT')),
    CONSTRAINT chk_contract_status CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED')),
    CONSTRAINT chk_contract_dates CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT chk_working_hours CHECK (working_hours_per_week > 0 AND working_hours_per_week <= 168)
);

-- Contract Amendments
CREATE TABLE contract_amendments (
    id BIGSERIAL PRIMARY KEY,
    contract_id BIGINT NOT NULL REFERENCES employment_contracts(id) ON DELETE CASCADE,
    amendment_number VARCHAR(50) NOT NULL,
    amendment_type VARCHAR(50) NOT NULL, -- SALARY_CHANGE, TITLE_CHANGE, EXTENSION, TERMINATION, OTHER
    effective_date DATE NOT NULL,
    previous_value TEXT,
    new_value TEXT,
    reason TEXT NOT NULL,
    approved_by BIGINT REFERENCES users(id),
    approved_date DATE,
    document_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_amendment_type CHECK (amendment_type IN ('SALARY_CHANGE', 'TITLE_CHANGE', 'EXTENSION', 'TERMINATION', 'DEPARTMENT_CHANGE', 'OTHER'))
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Employee Records indexes
CREATE INDEX idx_employee_records_user_id ON employee_records(user_id);
CREATE INDEX idx_employee_records_employee_number ON employee_records(employee_number);
CREATE INDEX idx_employee_records_supervisor_id ON employee_records(supervisor_id);
CREATE INDEX idx_employee_records_department ON employee_records(department);
CREATE INDEX idx_employee_records_employment_status ON employee_records(employment_status);
CREATE INDEX idx_employee_records_hire_date ON employee_records(hire_date);

-- Employee Qualifications indexes
CREATE INDEX idx_employee_qualifications_employee_id ON employee_qualifications(employee_id);
CREATE INDEX idx_employee_qualifications_type ON employee_qualifications(qualification_type);
CREATE INDEX idx_employee_qualifications_expiry_date ON employee_qualifications(expiry_date) WHERE expiry_date IS NOT NULL;

-- Organizational Units indexes
CREATE INDEX idx_organizational_units_parent_id ON organizational_units(parent_unit_id);
CREATE INDEX idx_organizational_units_head_employee ON organizational_units(head_employee_id);
CREATE INDEX idx_organizational_units_code ON organizational_units(code);
CREATE INDEX idx_organizational_units_status ON organizational_units(status);

-- Employee Positions indexes
CREATE INDEX idx_employee_positions_employee_id ON employee_positions(employee_id);
CREATE INDEX idx_employee_positions_org_unit_id ON employee_positions(organizational_unit_id);
CREATE INDEX idx_employee_positions_manager_id ON employee_positions(reporting_manager_id);
CREATE INDEX idx_employee_positions_primary ON employee_positions(is_primary_position) WHERE is_primary_position = true;

-- Performance Reviews indexes
CREATE INDEX idx_performance_reviews_employee_id ON performance_reviews(employee_id);
CREATE INDEX idx_performance_reviews_reviewer_id ON performance_reviews(reviewer_id);
CREATE INDEX idx_performance_reviews_cycle_id ON performance_reviews(review_cycle_id);
CREATE INDEX idx_performance_reviews_status ON performance_reviews(status);
CREATE INDEX idx_performance_reviews_due_date ON performance_reviews(due_date) WHERE status IN ('DRAFT', 'SUBMITTED');

-- Performance Goals indexes
CREATE INDEX idx_performance_goals_employee_id ON performance_goals(employee_id);
CREATE INDEX idx_performance_goals_review_id ON performance_goals(performance_review_id);
CREATE INDEX idx_performance_goals_status ON performance_goals(status);
CREATE INDEX idx_performance_goals_completion_date ON performance_goals(target_completion_date);

-- Leave Management indexes
CREATE INDEX idx_employee_leave_balances_employee_id ON employee_leave_balances(employee_id);
CREATE INDEX idx_employee_leave_balances_leave_type ON employee_leave_balances(leave_type_id);
CREATE INDEX idx_employee_leave_balances_year ON employee_leave_balances(year);

CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_leave_type ON leave_requests(leave_type_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_requests_approved_by ON leave_requests(approved_by);

CREATE INDEX idx_leave_request_approvals_request_id ON leave_request_approvals(leave_request_id);
CREATE INDEX idx_leave_request_approvals_approver_id ON leave_request_approvals(approver_id);
CREATE INDEX idx_leave_request_approvals_status ON leave_request_approvals(status);

-- Contract indexes
CREATE INDEX idx_employment_contracts_employee_id ON employment_contracts(employee_id);
CREATE INDEX idx_employment_contracts_contract_number ON employment_contracts(contract_number);
CREATE INDEX idx_employment_contracts_status ON employment_contracts(status);
CREATE INDEX idx_employment_contracts_dates ON employment_contracts(start_date, end_date);
CREATE INDEX idx_employment_contracts_manager_id ON employment_contracts(reporting_manager_id);

CREATE INDEX idx_contract_amendments_contract_id ON contract_amendments(contract_id);
CREATE INDEX idx_contract_amendments_effective_date ON contract_amendments(effective_date);
CREATE INDEX idx_contract_amendments_type ON contract_amendments(amendment_type);

-- =====================================================
-- INSERT DEFAULT LEAVE TYPES
-- =====================================================

INSERT INTO leave_types (code, name, description, is_paid, requires_approval, max_days_per_year, accrual_rate, carryover_allowed, max_carryover_days) VALUES
('ANNUAL', 'Annual Leave', 'Regular vacation time', true, true, 25, 2.08, true, 5),
('SICK', 'Sick Leave', 'Medical leave for illness', true, false, 15, 1.25, true, 10),
('PERSONAL', 'Personal Leave', 'Personal time off', true, true, 5, 0.42, false, 0),
('MATERNITY', 'Maternity Leave', 'Maternity leave for new mothers', true, true, 90, 0, false, 0),
('PATERNITY', 'Paternity Leave', 'Paternity leave for new fathers', true, true, 14, 0, false, 0),
('BEREAVEMENT', 'Bereavement Leave', 'Leave for family bereavement', true, true, 5, 0, false, 0),
('EMERGENCY', 'Emergency Leave', 'Emergency personal leave', false, true, 3, 0, false, 0),
('STUDY', 'Study Leave', 'Educational leave', false, true, 30, 0, false, 0),
('SABBATICAL', 'Sabbatical Leave', 'Extended leave for research/study', false, true, 365, 0, false, 0);

-- =====================================================
-- CREATE HELPFUL VIEWS
-- =====================================================

-- Employee Summary View
CREATE OR REPLACE VIEW employee_summary AS
SELECT 
    er.id as employee_record_id,
    er.employee_number,
    u.id as user_id,
    u.username,
    u.first_name,
    u.last_name,
    u.email,
    er.job_title,
    er.department,
    er.employment_type,
    er.employment_status,
    er.hire_date,
    er.salary,
    er.hourly_rate,
    supervisor.first_name || ' ' || supervisor.last_name as supervisor_name,
    er.office_location,
    er.office_phone
FROM employee_records er
JOIN users u ON er.user_id = u.id
LEFT JOIN users supervisor ON er.supervisor_id = supervisor.id
WHERE er.employment_status = 'ACTIVE';

-- Leave Balance Summary View
CREATE OR REPLACE VIEW employee_leave_summary AS
SELECT 
    elb.employee_id,
    er.employee_number,
    u.first_name || ' ' || u.last_name as employee_name,
    lt.name as leave_type_name,
    elb.year,
    elb.allocated_days,
    elb.used_days,
    elb.pending_days,
    elb.carried_over_days,
    elb.available_days
FROM employee_leave_balances elb
JOIN employee_records er ON elb.employee_id = er.id
JOIN users u ON er.user_id = u.id
JOIN leave_types lt ON elb.leave_type_id = lt.id
WHERE er.employment_status = 'ACTIVE'
  AND lt.status = 'ACTIVE'
  AND elb.year = EXTRACT(YEAR FROM CURRENT_DATE);

-- Performance Review Summary View
CREATE OR REPLACE VIEW performance_review_summary AS
SELECT 
    pr.id as review_id,
    er.employee_number,
    u.first_name || ' ' || u.last_name as employee_name,
    reviewer.first_name || ' ' || reviewer.last_name as reviewer_name,
    pr.review_type,
    pr.review_period_start,
    pr.review_period_end,
    pr.overall_rating,
    pr.status,
    pr.due_date,
    pr.completed_date
FROM performance_reviews pr
JOIN employee_records er ON pr.employee_id = er.id
JOIN users u ON er.user_id = u.id
JOIN users reviewer ON pr.reviewer_id = reviewer.id
WHERE er.employment_status = 'ACTIVE';

-- =====================================================
-- UPDATE TRIGGERS FOR TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_employee_records_updated_at
    BEFORE UPDATE ON employee_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizational_units_updated_at
    BEFORE UPDATE ON organizational_units
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_reviews_updated_at
    BEFORE UPDATE ON performance_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_goals_updated_at
    BEFORE UPDATE ON performance_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
    BEFORE UPDATE ON leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employment_contracts_updated_at
    BEFORE UPDATE ON employment_contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update leave balance timestamp
CREATE OR REPLACE FUNCTION update_leave_balance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employee_leave_balances_timestamp
    BEFORE UPDATE ON employee_leave_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_leave_balance_timestamp();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Log completion
SELECT 'Human Resources schema created successfully' as status;