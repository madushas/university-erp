-- V3__Enhance_core_entities.sql
-- Enhance existing entities and add core academic structure entities

-- =====================================================
-- ENHANCE EXISTING USERS TABLE
-- =====================================================

-- Add new columns to users table for comprehensive profile management
ALTER TABLE users 
ADD COLUMN user_type VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
ADD COLUMN employee_type VARCHAR(50),
ADD COLUMN academic_level VARCHAR(50),
ADD COLUMN employee_id VARCHAR(50) UNIQUE,
ADD COLUMN student_id VARCHAR(50) UNIQUE,
ADD COLUMN phone_number VARCHAR(50),
ADD COLUMN date_of_birth DATE,
ADD COLUMN address TEXT,
ADD COLUMN city VARCHAR(100),
ADD COLUMN state VARCHAR(100),
ADD COLUMN postal_code VARCHAR(20),
ADD COLUMN country VARCHAR(100) DEFAULT 'United States',
ADD COLUMN department VARCHAR(100),
ADD COLUMN year_of_study INTEGER,
ADD COLUMN gpa DECIMAL(4,3),
ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN enrollment_date DATE,
ADD COLUMN graduation_date DATE,
ADD COLUMN admission_date DATE,
ADD COLUMN expected_graduation_date DATE,
ADD COLUMN emergency_contact_name VARCHAR(255),
ADD COLUMN emergency_contact_phone VARCHAR(50),
ADD COLUMN emergency_contact_relationship VARCHAR(100),
ADD COLUMN profile_picture_url VARCHAR(500),
ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en',
ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN last_login_at TIMESTAMP,
ADD COLUMN password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN account_locked_until TIMESTAMP,
ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;

-- Update the role column to support more user types
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('STUDENT', 'FACULTY', 'STAFF', 'ADMIN', 'PARENT', 'ALUMNI'));

-- Add constraints for user types
ALTER TABLE users ADD CONSTRAINT users_user_type_check 
CHECK (user_type IN ('STUDENT', 'FACULTY', 'STAFF', 'ADMIN', 'PARENT', 'ALUMNI'));

ALTER TABLE users ADD CONSTRAINT users_employee_type_check 
CHECK (employee_type IS NULL OR employee_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'ADJUNCT'));

ALTER TABLE users ADD CONSTRAINT users_academic_level_check 
CHECK (academic_level IS NULL OR academic_level IN ('UNDERGRADUATE', 'GRADUATE', 'DOCTORAL', 'CERTIFICATE'));

ALTER TABLE users ADD CONSTRAINT users_status_check 
CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED', 'TERMINATED'));

-- =====================================================
-- ENHANCE EXISTING COURSES TABLE
-- =====================================================

-- Add comprehensive course management fields
ALTER TABLE courses 
ADD COLUMN instructor_email VARCHAR(255),
ADD COLUMN department VARCHAR(100),
ADD COLUMN course_level VARCHAR(50) DEFAULT 'UNDERGRADUATE',
ADD COLUMN classroom VARCHAR(100),
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE,
ADD COLUMN start_time TIME,
ADD COLUMN end_time TIME,
ADD COLUMN days_of_week VARCHAR(50),
ADD COLUMN min_students INTEGER DEFAULT 1,
ADD COLUMN course_fee DECIMAL(10,2),
ADD COLUMN prerequisites TEXT,
ADD COLUMN status VARCHAR(50) DEFAULT 'DRAFT',
ADD COLUMN syllabus_url VARCHAR(500),
ADD COLUMN textbook TEXT,
ADD COLUMN passing_grade VARCHAR(5) DEFAULT 'D';

-- Add constraints for courses
ALTER TABLE courses ADD CONSTRAINT courses_course_level_check 
CHECK (course_level IN ('UNDERGRADUATE', 'GRADUATE', 'DOCTORAL', 'CERTIFICATE'));

ALTER TABLE courses ADD CONSTRAINT courses_status_check 
CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'CANCELLED', 'COMPLETED'));

-- =====================================================
-- ENHANCE EXISTING REGISTRATIONS TABLE
-- =====================================================

-- Add comprehensive registration tracking fields
ALTER TABLE registrations 
ADD COLUMN grade_points DECIMAL(4,3),
ADD COLUMN attendance_percentage DECIMAL(5,2),
ADD COLUMN midterm_grade VARCHAR(5),
ADD COLUMN final_grade VARCHAR(5),
ADD COLUMN assignment_grades TEXT, -- JSON string for multiple assignments
ADD COLUMN exam_grades TEXT, -- JSON string for multiple exams
ADD COLUMN course_fee_paid DECIMAL(10,2),
ADD COLUMN payment_status VARCHAR(50) DEFAULT 'PENDING',
ADD COLUMN payment_date TIMESTAMP,
ADD COLUMN payment_method VARCHAR(50),
ADD COLUMN transcript_released BOOLEAN DEFAULT FALSE,
ADD COLUMN completion_date TIMESTAMP,
ADD COLUMN certificate_issued BOOLEAN DEFAULT FALSE,
ADD COLUMN notes TEXT;

-- Update status constraint for registrations
ALTER TABLE registrations DROP CONSTRAINT registrations_status_check;
ALTER TABLE registrations ADD CONSTRAINT registrations_status_check 
CHECK (status IN ('ENROLLED', 'COMPLETED', 'DROPPED', 'WITHDRAWN', 'FAILED', 'INCOMPLETE'));

-- Add payment status constraint
ALTER TABLE registrations ADD CONSTRAINT registrations_payment_status_check 
CHECK (payment_status IN ('PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'WAIVED', 'REFUNDED'));

-- =====================================================
-- CREATE COLLEGES TABLE
-- =====================================================

CREATE TABLE colleges (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    dean_id BIGINT REFERENCES users(id),
    established_date DATE,
    accreditation_info TEXT,
    website VARCHAR(500),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT colleges_status_check CHECK (status IN ('ACTIVE', 'INACTIVE', 'MERGED', 'DISSOLVED'))
);

-- =====================================================
-- CREATE DEPARTMENTS TABLE (Enhanced)
-- =====================================================

CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    college_id BIGINT REFERENCES colleges(id),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    head_of_department VARCHAR(255),
    head_email VARCHAR(255),
    head_id BIGINT REFERENCES users(id),
    building VARCHAR(100),
    room_number VARCHAR(50),
    phone_number VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(500),
    budget_allocation DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT departments_status_check CHECK (status IN ('ACTIVE', 'INACTIVE', 'MERGED', 'DISSOLVED'))
);

-- =====================================================
-- CREATE ACADEMIC PROGRAMS TABLE
-- =====================================================

CREATE TABLE academic_programs (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department_id BIGINT REFERENCES departments(id),
    program_type VARCHAR(50) NOT NULL,
    degree_type VARCHAR(100),
    credit_requirements INTEGER NOT NULL,
    duration_semesters INTEGER NOT NULL,
    admission_requirements TEXT,
    graduation_requirements TEXT,
    accreditation_info TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT programs_type_check CHECK (program_type IN ('UNDERGRADUATE', 'GRADUATE', 'DOCTORAL', 'CERTIFICATE')),
    CONSTRAINT programs_status_check CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DISCONTINUED'))
);

-- =====================================================
-- CREATE ACADEMIC YEARS TABLE
-- =====================================================

CREATE TABLE academic_years (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT academic_years_status_check CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    CONSTRAINT academic_years_date_check CHECK (end_date > start_date)
);

-- =====================================================
-- CREATE ACADEMIC SEMESTERS TABLE (Enhanced)
-- =====================================================

CREATE TABLE academic_semesters (
    id BIGSERIAL PRIMARY KEY,
    academic_year_id BIGINT REFERENCES academic_years(id),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_start_date DATE,
    registration_end_date DATE,
    add_drop_deadline DATE,
    withdrawal_deadline DATE,
    final_exam_start_date DATE,
    final_exam_end_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT semesters_status_check CHECK (status IN ('ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT semesters_date_check CHECK (end_date > start_date),
    UNIQUE(academic_year_id, code)
);

-- =====================================================
-- CREATE COURSE PREREQUISITES TABLE
-- =====================================================

CREATE TABLE course_prerequisites (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
    prerequisite_course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
    prerequisite_type VARCHAR(50) DEFAULT 'REQUIRED',
    minimum_grade VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT prerequisites_type_check CHECK (prerequisite_type IN ('REQUIRED', 'RECOMMENDED', 'COREQUISITE')),
    UNIQUE(course_id, prerequisite_course_id)
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Users table indexes
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_employee_id ON users(employee_id) WHERE employee_id IS NOT NULL;
CREATE INDEX idx_users_student_id ON users(student_id) WHERE student_id IS NOT NULL;
CREATE INDEX idx_users_department ON users(department) WHERE department IS NOT NULL;
CREATE INDEX idx_users_last_login ON users(last_login_at);

-- Courses table indexes
CREATE INDEX idx_courses_department ON courses(department) WHERE department IS NOT NULL;
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_level ON courses(course_level);
CREATE INDEX idx_courses_dates ON courses(start_date, end_date);

-- Registrations table indexes
CREATE INDEX idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX idx_registrations_completion_date ON registrations(completion_date);

-- New tables indexes
CREATE INDEX idx_colleges_status ON colleges(status);
CREATE INDEX idx_colleges_dean ON colleges(dean_id);

CREATE INDEX idx_departments_college ON departments(college_id);
CREATE INDEX idx_departments_status ON departments(status);
CREATE INDEX idx_departments_head ON departments(head_id);

CREATE INDEX idx_programs_department ON academic_programs(department_id);
CREATE INDEX idx_programs_type ON academic_programs(program_type);
CREATE INDEX idx_programs_status ON academic_programs(status);

CREATE INDEX idx_academic_years_status ON academic_years(status);
CREATE INDEX idx_academic_years_dates ON academic_years(start_date, end_date);

CREATE INDEX idx_semesters_academic_year ON academic_semesters(academic_year_id);
CREATE INDEX idx_semesters_status ON academic_semesters(status);
CREATE INDEX idx_semesters_dates ON academic_semesters(start_date, end_date);

CREATE INDEX idx_prerequisites_course ON course_prerequisites(course_id);
CREATE INDEX idx_prerequisites_prereq_course ON course_prerequisites(prerequisite_course_id);

-- =====================================================
-- ADD FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign key from courses to departments (if department exists)
-- Note: This will be added after we populate departments

-- Add foreign key from users to departments (if needed)
-- Note: This will be handled through department name for now

-- =====================================================
-- UPDATE EXISTING DATA TO MATCH NEW SCHEMA
-- =====================================================

-- Update existing users to have proper user_type based on role
UPDATE users SET user_type = role WHERE user_type = 'STUDENT';

-- Set default values for existing courses
UPDATE courses SET 
    course_level = 'UNDERGRADUATE',
    status = 'ACTIVE',
    min_students = 1
WHERE course_level IS NULL;

-- Set default values for existing registrations
UPDATE registrations SET 
    payment_status = 'PAID'
WHERE payment_status IS NULL AND status = 'COMPLETED';

UPDATE registrations SET 
    payment_status = 'PENDING'
WHERE payment_status IS NULL AND status = 'ENROLLED';