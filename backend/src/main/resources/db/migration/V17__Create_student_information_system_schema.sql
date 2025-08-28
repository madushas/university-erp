-- V17__Create_student_information_system_schema.sql
-- Create Student Information System tables for admissions, academic records, and transcripts

-- =====================================================
-- CREATE ADMISSIONS TABLES
-- =====================================================

-- Application Type Enum: UNDERGRADUATE, GRADUATE, TRANSFER, VISITING
-- Application Status Enum: DRAFT, SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED, WAITLISTED, WITHDRAWN, EXPIRED

CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    application_number VARCHAR(50) UNIQUE NOT NULL,
    applicant_id BIGINT NOT NULL REFERENCES users(id),
    academic_program_id BIGINT NOT NULL REFERENCES academic_programs(id),
    academic_year_id BIGINT NOT NULL REFERENCES academic_years(id),
    academic_semester_id BIGINT NOT NULL REFERENCES academic_semesters(id),
    
    -- Application Details
    application_type VARCHAR(50) NOT NULL DEFAULT 'UNDERGRADUATE',
    application_date DATE NOT NULL DEFAULT CURRENT_DATE,
    application_deadline DATE NOT NULL,
    expected_entry_date DATE,
    
    -- Application Status
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    review_status VARCHAR(50) DEFAULT 'PENDING',
    decision_date DATE,
    decision_reason TEXT,
    
    -- Contact Information
    preferred_contact_method VARCHAR(50) DEFAULT 'EMAIL',
    phone_number VARCHAR(20),
    alternate_email VARCHAR(255),
    
    -- Academic Background
    previous_institution VARCHAR(255),
    previous_gpa DECIMAL(3,2),
    graduation_date DATE,
    degree_obtained VARCHAR(100),
    major_field VARCHAR(100),
    
    -- Application Essays and Documents
    personal_statement TEXT,
    statement_of_purpose TEXT,
    research_interests TEXT,
    career_goals TEXT,
    
    -- Financial Information
    financial_aid_requested BOOLEAN DEFAULT FALSE,
    estimated_family_contribution DECIMAL(10,2),
    scholarship_requested BOOLEAN DEFAULT FALSE,
    
    -- Application Fees
    application_fee_amount DECIMAL(8,2) DEFAULT 50.00,
    application_fee_paid BOOLEAN DEFAULT FALSE,
    application_fee_payment_date TIMESTAMP,
    application_fee_waived BOOLEAN DEFAULT FALSE,
    application_fee_waiver_reason TEXT,
    
    -- System Fields
    submitted_date TIMESTAMP,
    last_reviewed_date TIMESTAMP,
    reviewed_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT applications_type_check CHECK (application_type IN ('UNDERGRADUATE', 'GRADUATE', 'TRANSFER', 'VISITING', 'INTERNATIONAL', 'READMISSION')),
    CONSTRAINT applications_status_check CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WAITLISTED', 'WITHDRAWN', 'EXPIRED')),
    CONSTRAINT applications_review_status_check CHECK (review_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DEFERRED')),
    CONSTRAINT applications_contact_method_check CHECK (preferred_contact_method IN ('EMAIL', 'PHONE', 'MAIL', 'TEXT')),
    CONSTRAINT applications_gpa_check CHECK (previous_gpa IS NULL OR (previous_gpa >= 0.0 AND previous_gpa <= 4.0))
);

-- Application Documents Table
CREATE TABLE application_documents (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_date TIMESTAMP,
    verified_by BIGINT REFERENCES users(id),
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    verification_notes TEXT,
    is_required BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT doc_verification_status_check CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'MISSING'))
);

-- Application Reviews and Notes
CREATE TABLE application_reviews (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    reviewer_id BIGINT NOT NULL REFERENCES users(id),
    review_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rating DECIMAL(3,2),
    comments TEXT,
    recommendation VARCHAR(50),
    department_approval VARCHAR(50),
    is_final_review BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT review_rating_check CHECK (rating IS NULL OR (rating >= 0.0 AND rating <= 10.0)),
    CONSTRAINT review_recommendation_check CHECK (recommendation IN ('ACCEPT', 'REJECT', 'WAITLIST', 'CONDITIONAL_ACCEPT', 'DEFER')),
    CONSTRAINT review_department_approval_check CHECK (department_approval IN ('APPROVED', 'REJECTED', 'PENDING'))
);

-- =====================================================
-- CREATE ACADEMIC RECORDS TABLES
-- =====================================================

-- Student Academic Records - comprehensive tracking
CREATE TABLE student_academic_records (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id),
    academic_program_id BIGINT REFERENCES academic_programs(id),
    academic_year_id BIGINT REFERENCES academic_years(id),
    academic_semester_id BIGINT REFERENCES academic_semesters(id),
    
    -- Academic Standing
    academic_level VARCHAR(50) NOT NULL DEFAULT 'UNDERGRADUATE',
    class_level VARCHAR(50), -- FRESHMAN, SOPHOMORE, JUNIOR, SENIOR, GRADUATE
    enrollment_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    academic_standing VARCHAR(50) DEFAULT 'GOOD_STANDING',
    
    -- GPA Calculations
    semester_gpa DECIMAL(4,3),
    cumulative_gpa DECIMAL(4,3),
    major_gpa DECIMAL(4,3),
    total_credits_attempted INTEGER DEFAULT 0,
    total_credits_earned INTEGER DEFAULT 0,
    total_quality_points DECIMAL(8,3) DEFAULT 0.0,
    
    -- Degree Progress
    degree_progress_percentage DECIMAL(5,2) DEFAULT 0.0,
    credits_remaining INTEGER,
    expected_graduation_date DATE,
    graduation_application_date DATE,
    graduation_eligibility_verified BOOLEAN DEFAULT FALSE,
    
    -- Academic Warnings and Actions
    probation_status VARCHAR(50),
    probation_start_date DATE,
    probation_end_date DATE,
    suspension_status VARCHAR(50),
    readmission_conditions TEXT,
    
    -- Dean's List and Honors
    deans_list_eligible BOOLEAN DEFAULT FALSE,
    honors_designation VARCHAR(100),
    latin_honors VARCHAR(50),
    
    -- Record Dates
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT academic_level_check CHECK (academic_level IN ('UNDERGRADUATE', 'GRADUATE', 'DOCTORAL', 'CERTIFICATE', 'NON_DEGREE')),
    CONSTRAINT class_level_check CHECK (class_level IN ('FRESHMAN', 'SOPHOMORE', 'JUNIOR', 'SENIOR', 'GRADUATE', 'DOCTORAL')),
    CONSTRAINT enrollment_status_check CHECK (enrollment_status IN ('ACTIVE', 'INACTIVE', 'GRADUATED', 'WITHDRAWN', 'SUSPENDED', 'LEAVE_OF_ABSENCE')),
    CONSTRAINT academic_standing_check CHECK (academic_standing IN ('GOOD_STANDING', 'ACADEMIC_PROBATION', 'ACADEMIC_SUSPENSION', 'ACADEMIC_DISMISSAL', 'DEANS_LIST')),
    CONSTRAINT probation_status_check CHECK (probation_status IN ('NONE', 'FIRST_WARNING', 'PROBATION', 'FINAL_WARNING')),
    CONSTRAINT suspension_status_check CHECK (suspension_status IN ('NONE', 'SUSPENDED', 'DISMISSED')),
    CONSTRAINT latin_honors_check CHECK (latin_honors IN ('CUM_LAUDE', 'MAGNA_CUM_LAUDE', 'SUMMA_CUM_LAUDE')),
    CONSTRAINT gpa_range_check CHECK (
        (semester_gpa IS NULL OR (semester_gpa >= 0.0 AND semester_gpa <= 4.0)) AND
        (cumulative_gpa IS NULL OR (cumulative_gpa >= 0.0 AND cumulative_gpa <= 4.0)) AND
        (major_gpa IS NULL OR (major_gpa >= 0.0 AND major_gpa <= 4.0))
    )
);

-- Grade History for tracking grade changes
CREATE TABLE grade_history (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT NOT NULL REFERENCES registrations(id),
    student_id BIGINT NOT NULL REFERENCES users(id),
    course_id BIGINT NOT NULL REFERENCES courses(id),
    academic_semester_id BIGINT REFERENCES academic_semesters(id),
    
    -- Grade Information
    original_grade VARCHAR(5),
    new_grade VARCHAR(5),
    grade_change_reason VARCHAR(255),
    grade_change_type VARCHAR(50),
    
    -- Credit and Quality Points
    credit_hours DECIMAL(3,1),
    quality_points DECIMAL(6,3),
    grade_point_value DECIMAL(3,2),
    
    -- Administrative
    changed_by BIGINT NOT NULL REFERENCES users(id),
    approved_by BIGINT REFERENCES users(id),
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP,
    change_notes TEXT,
    
    CONSTRAINT grade_change_type_check CHECK (grade_change_type IN ('CORRECTION', 'INCOMPLETE_RESOLUTION', 'APPEAL', 'ADMINISTRATIVE'))
);

-- =====================================================
-- CREATE DEGREE AUDIT TABLES
-- =====================================================

-- Degree Audits for tracking graduation requirements
CREATE TABLE degree_audits (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id),
    academic_program_id BIGINT NOT NULL REFERENCES academic_programs(id),
    audit_type VARCHAR(50) NOT NULL DEFAULT 'PROGRESS',
    
    -- Audit Details
    audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    audit_semester_id BIGINT REFERENCES academic_semesters(id),
    total_credits_required INTEGER NOT NULL,
    credits_completed INTEGER DEFAULT 0,
    credits_in_progress INTEGER DEFAULT 0,
    credits_remaining INTEGER DEFAULT 0,
    
    -- GPA Requirements
    minimum_gpa_required DECIMAL(3,2) DEFAULT 2.0,
    current_gpa DECIMAL(4,3),
    gpa_requirement_met BOOLEAN DEFAULT FALSE,
    
    -- Requirement Categories
    core_requirements_met BOOLEAN DEFAULT FALSE,
    major_requirements_met BOOLEAN DEFAULT FALSE,
    minor_requirements_met BOOLEAN DEFAULT FALSE,
    elective_requirements_met BOOLEAN DEFAULT FALSE,
    general_education_met BOOLEAN DEFAULT FALSE,
    
    -- Graduation Eligibility
    eligible_for_graduation BOOLEAN DEFAULT FALSE,
    projected_graduation_date DATE,
    degree_completion_percentage DECIMAL(5,2) DEFAULT 0.0,
    
    -- Administrative
    audited_by BIGINT REFERENCES users(id),
    approved_by BIGINT REFERENCES users(id),
    audit_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT audit_type_check CHECK (audit_type IN ('PROGRESS', 'GRADUATION', 'TRANSFER_CREDIT', 'DEGREE_CHANGE'))
);

-- Degree Requirement Items
CREATE TABLE degree_requirement_items (
    id BIGSERIAL PRIMARY KEY,
    degree_audit_id BIGINT NOT NULL REFERENCES degree_audits(id) ON DELETE CASCADE,
    requirement_category VARCHAR(100) NOT NULL,
    requirement_description TEXT NOT NULL,
    credits_required INTEGER NOT NULL DEFAULT 0,
    credits_completed INTEGER DEFAULT 0,
    requirement_met BOOLEAN DEFAULT FALSE,
    courses_required TEXT, -- JSON array of required course codes
    courses_completed TEXT, -- JSON array of completed course codes
    grade_requirement VARCHAR(10), -- Minimum grade required
    notes TEXT
);

-- =====================================================
-- CREATE TRANSCRIPT TABLES
-- =====================================================

-- Official Transcripts
CREATE TABLE transcripts (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id),
    transcript_type VARCHAR(50) NOT NULL DEFAULT 'OFFICIAL',
    
    -- Transcript Details
    transcript_number VARCHAR(50) UNIQUE NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    academic_year_start BIGINT REFERENCES academic_years(id),
    academic_year_end BIGINT REFERENCES academic_years(id),
    
    -- Student Information (at time of transcript)
    student_name VARCHAR(255) NOT NULL,
    student_number VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    program_of_study VARCHAR(255),
    degree_conferred VARCHAR(255),
    graduation_date DATE,
    
    -- Academic Summary
    total_credits_attempted INTEGER DEFAULT 0,
    total_credits_earned INTEGER DEFAULT 0,
    cumulative_gpa DECIMAL(4,3),
    class_rank INTEGER,
    class_size INTEGER,
    academic_honors TEXT,
    
    -- Transcript Status
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    released_date TIMESTAMP,
    released_to VARCHAR(255),
    release_method VARCHAR(50),
    
    -- Security and Verification
    security_code VARCHAR(100),
    digital_signature TEXT,
    verification_url VARCHAR(500),
    holds_preventing_release TEXT,
    
    -- Administrative
    generated_by BIGINT REFERENCES users(id),
    approved_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT transcript_type_check CHECK (transcript_type IN ('OFFICIAL', 'UNOFFICIAL', 'ENROLLMENT_VERIFICATION', 'DEGREE_VERIFICATION')),
    CONSTRAINT transcript_status_check CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'RELEASED', 'CANCELLED')),
    CONSTRAINT release_method_check CHECK (release_method IN ('EMAIL', 'MAIL', 'PICKUP', 'ELECTRONIC', 'THIRD_PARTY'))
);

-- Transcript Courses - detailed course listings for transcripts
CREATE TABLE transcript_courses (
    id BIGSERIAL PRIMARY KEY,
    transcript_id BIGINT NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
    registration_id BIGINT REFERENCES registrations(id),
    
    -- Course Information
    course_code VARCHAR(20) NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    credit_hours DECIMAL(3,1) NOT NULL,
    grade VARCHAR(5),
    quality_points DECIMAL(6,3),
    
    -- Academic Period
    academic_year VARCHAR(20) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    
    -- Course Details
    instructor_name VARCHAR(255),
    course_level VARCHAR(50),
    transfer_credit BOOLEAN DEFAULT FALSE,
    transfer_institution VARCHAR(255),
    
    -- Display Order
    semester_order INTEGER,
    course_order INTEGER,
    
    CONSTRAINT transcript_course_level_check CHECK (course_level IN ('UNDERGRADUATE', 'GRADUATE', 'DOCTORAL'))
);

-- Transcript Requests - for managing transcript orders
CREATE TABLE transcript_requests (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Request Details
    transcript_type VARCHAR(50) NOT NULL DEFAULT 'OFFICIAL',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    urgency_level VARCHAR(50) DEFAULT 'STANDARD',
    
    -- Delivery Information
    recipient_name VARCHAR(255) NOT NULL,
    recipient_organization VARCHAR(255),
    delivery_method VARCHAR(50) NOT NULL,
    delivery_address TEXT,
    delivery_email VARCHAR(255),
    delivery_phone VARCHAR(20),
    
    -- Processing Information
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    processing_fee DECIMAL(8,2) DEFAULT 10.00,
    expedite_fee DECIMAL(8,2) DEFAULT 0.00,
    total_fee DECIMAL(8,2) DEFAULT 10.00,
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    payment_date TIMESTAMP,
    
    -- Fulfillment
    processed_date TIMESTAMP,
    processed_by BIGINT REFERENCES users(id),
    shipped_date TIMESTAMP,
    tracking_number VARCHAR(100),
    delivery_confirmation TIMESTAMP,
    
    -- Special Instructions
    special_instructions TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT tr_urgency_check CHECK (urgency_level IN ('STANDARD', 'EXPEDITED', 'RUSH')),
    CONSTRAINT tr_delivery_method_check CHECK (delivery_method IN ('EMAIL', 'MAIL', 'PICKUP', 'ELECTRONIC_DELIVERY')),
    CONSTRAINT tr_status_check CHECK (status IN ('SUBMITTED', 'PROCESSING', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    CONSTRAINT tr_payment_status_check CHECK (payment_status IN ('PENDING', 'PAID', 'WAIVED', 'REFUNDED'))
);

-- =====================================================
-- CREATE ACADEMIC ADVISEMENT TABLES
-- =====================================================

-- Academic Advisors Assignment
CREATE TABLE academic_advisors (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id),
    advisor_id BIGINT NOT NULL REFERENCES users(id),
    advisor_type VARCHAR(50) NOT NULL DEFAULT 'ACADEMIC',
    
    -- Assignment Details
    assignment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    active_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    active_end_date DATE,
    is_primary_advisor BOOLEAN DEFAULT TRUE,
    
    -- Specialization
    specialization_area VARCHAR(255),
    advisor_role VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT advisor_type_check CHECK (advisor_type IN ('ACADEMIC', 'RESEARCH', 'THESIS', 'DISSERTATION', 'CAREER'))
);

-- Advisement Sessions
CREATE TABLE advisement_sessions (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id),
    advisor_id BIGINT NOT NULL REFERENCES users(id),
    
    -- Session Details
    session_date TIMESTAMP NOT NULL,
    session_type VARCHAR(50) DEFAULT 'REGULAR',
    session_duration_minutes INTEGER DEFAULT 30,
    session_location VARCHAR(255),
    
    -- Session Content
    topics_discussed TEXT,
    recommendations TEXT,
    action_items TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    
    -- Academic Planning
    courses_discussed TEXT, -- JSON array of course codes
    academic_goals TEXT,
    career_goals TEXT,
    
    -- Session Status
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    attendance_status VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT session_type_check CHECK (session_type IN ('REGULAR', 'URGENT', 'GRADUATION_PLANNING', 'COURSE_SELECTION', 'ACADEMIC_DIFFICULTY')),
    CONSTRAINT session_status_check CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED')),
    CONSTRAINT attendance_status_check CHECK (attendance_status IN ('ATTENDED', 'NO_SHOW', 'CANCELLED', 'RESCHEDULED'))
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Applications indexes
CREATE INDEX idx_applications_applicant ON applications(applicant_id);
CREATE INDEX idx_applications_program ON applications(academic_program_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_date ON applications(application_date);
CREATE INDEX idx_applications_number ON applications(application_number);

-- Application documents indexes
CREATE INDEX idx_app_docs_application ON application_documents(application_id);
CREATE INDEX idx_app_docs_type ON application_documents(document_type);
CREATE INDEX idx_app_docs_verification ON application_documents(verification_status);

-- Academic records indexes
CREATE INDEX idx_academic_records_student ON student_academic_records(student_id);
CREATE INDEX idx_academic_records_program ON student_academic_records(academic_program_id);
CREATE INDEX idx_academic_records_semester ON student_academic_records(academic_semester_id);
CREATE INDEX idx_academic_records_standing ON student_academic_records(academic_standing);
CREATE INDEX idx_academic_records_gpa ON student_academic_records(cumulative_gpa);

-- Grade history indexes
CREATE INDEX idx_grade_history_registration ON grade_history(registration_id);
CREATE INDEX idx_grade_history_student ON grade_history(student_id);
CREATE INDEX idx_grade_history_course ON grade_history(course_id);
CREATE INDEX idx_grade_history_date ON grade_history(change_date);

-- Degree audit indexes
CREATE INDEX idx_degree_audits_student ON degree_audits(student_id);
CREATE INDEX idx_degree_audits_program ON degree_audits(academic_program_id);
CREATE INDEX idx_degree_audits_type ON degree_audits(audit_type);
CREATE INDEX idx_degree_audits_date ON degree_audits(audit_date);

-- Transcript indexes
CREATE INDEX idx_transcripts_student ON transcripts(student_id);
CREATE INDEX idx_transcripts_number ON transcripts(transcript_number);
CREATE INDEX idx_transcripts_status ON transcripts(status);
CREATE INDEX idx_transcripts_date ON transcripts(issue_date);

-- Transcript courses indexes
CREATE INDEX idx_transcript_courses_transcript ON transcript_courses(transcript_id);
CREATE INDEX idx_transcript_courses_registration ON transcript_courses(registration_id);
CREATE INDEX idx_transcript_courses_semester ON transcript_courses(academic_year, semester);

-- Transcript requests indexes
CREATE INDEX idx_transcript_requests_student ON transcript_requests(student_id);
CREATE INDEX idx_transcript_requests_number ON transcript_requests(request_number);
CREATE INDEX idx_transcript_requests_status ON transcript_requests(status);
CREATE INDEX idx_transcript_requests_date ON transcript_requests(request_date);

-- Advisement indexes
CREATE INDEX idx_academic_advisors_student ON academic_advisors(student_id);
CREATE INDEX idx_academic_advisors_advisor ON academic_advisors(advisor_id);
CREATE INDEX idx_advisement_sessions_student ON advisement_sessions(student_id);
CREATE INDEX idx_advisement_sessions_advisor ON advisement_sessions(advisor_id);
CREATE INDEX idx_advisement_sessions_date ON advisement_sessions(session_date);

-- =====================================================
-- CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- Student Academic Overview
CREATE OR REPLACE VIEW student_academic_overview AS
SELECT 
    u.id as student_id,
    u.username,
    u.first_name,
    u.last_name,
    u.student_id as student_number,
    u.email,
    sar.academic_level,
    sar.class_level,
    sar.enrollment_status,
    sar.academic_standing,
    sar.cumulative_gpa,
    sar.total_credits_earned,
    sar.degree_progress_percentage,
    sar.expected_graduation_date,
    ap.name as program_name,
    ap.degree_type,
    d.name as department_name,
    c.name as college_name
FROM users u
LEFT JOIN student_academic_records sar ON u.id = sar.student_id 
    AND sar.id = (SELECT id FROM student_academic_records sar2 WHERE sar2.student_id = u.id ORDER BY sar2.record_date DESC LIMIT 1)
LEFT JOIN academic_programs ap ON sar.academic_program_id = ap.id
LEFT JOIN departments d ON ap.department_id = d.id
LEFT JOIN colleges c ON d.college_id = c.id
WHERE u.role = 'STUDENT' AND u.status = 'ACTIVE';

-- Application Summary View
CREATE OR REPLACE VIEW application_summary AS
SELECT 
    a.id,
    a.application_number,
    u.first_name || ' ' || u.last_name as applicant_name,
    u.email as applicant_email,
    ap.name as program_name,
    ap.degree_type,
    a.application_type,
    a.status,
    a.application_date,
    a.application_deadline,
    a.decision_date,
    ay.name as academic_year,
    asem.name as semester,
    d.name as department_name
FROM applications a
JOIN users u ON a.applicant_id = u.id
JOIN academic_programs ap ON a.academic_program_id = ap.id
JOIN academic_years ay ON a.academic_year_id = ay.id
JOIN academic_semesters asem ON a.academic_semester_id = asem.id
JOIN departments d ON ap.department_id = d.id;

-- Transcript Summary View
CREATE OR REPLACE VIEW transcript_summary AS
SELECT 
    t.id,
    t.transcript_number,
    t.student_name,
    t.student_number,
    t.transcript_type,
    t.status,
    t.issue_date,
    t.cumulative_gpa,
    t.total_credits_earned,
    t.degree_conferred,
    t.graduation_date,
    COUNT(tc.id) as course_count
FROM transcripts t
LEFT JOIN transcript_courses tc ON t.id = tc.transcript_id
GROUP BY t.id, t.transcript_number, t.student_name, t.student_number, 
         t.transcript_type, t.status, t.issue_date, t.cumulative_gpa, 
         t.total_credits_earned, t.degree_conferred, t.graduation_date;
