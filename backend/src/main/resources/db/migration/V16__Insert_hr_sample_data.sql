-- V16__Insert_hr_sample_data.sql
-- Insert sample data for Human Resources schema

-- =====================================================
-- INSERT SAMPLE ORGANIZATIONAL UNITS
-- =====================================================

INSERT INTO organizational_units (code, name, description, unit_type, budget_code, cost_center, location, phone, email, established_date) VALUES
('ADMIN', 'Administration', 'Central administration office', 'OFFICE', 'ADM001', 'CC001', 'Admin Building, Floor 1', '+1-555-0100', 'admin@university.edu', '2020-01-01'),
('HR', 'Human Resources', 'Human resources department', 'DEPARTMENT', 'HR001', 'CC002', 'Admin Building, Floor 2', '+1-555-0200', 'hr@university.edu', '2020-01-01'),
('IT', 'Information Technology', 'IT services and support', 'DEPARTMENT', 'IT001', 'CC003', 'Tech Building, Floor 1', '+1-555-0300', 'it@university.edu', '2020-01-01'),
('FINANCE', 'Finance Department', 'Financial operations and accounting', 'DEPARTMENT', 'FIN001', 'CC004', 'Admin Building, Floor 3', '+1-555-0400', 'finance@university.edu', '2020-01-01'),
('ACADEMIC', 'Academic Affairs', 'Academic administration and support', 'DIVISION', 'ACA001', 'CC005', 'Academic Building, Floor 1', '+1-555-0500', 'academic@university.edu', '2020-01-01');

-- =====================================================
-- INSERT SAMPLE EMPLOYEE RECORDS
-- =====================================================

-- First, let's get some existing users to create employee records for
-- We'll create employee records for users who are faculty or admin

INSERT INTO employee_records (user_id, employee_number, hire_date, employment_type, employment_status, job_title, department, salary, benefits_eligible, tenure_track, contract_start_date, office_location, office_phone)
SELECT 
    u.id,
    'EMP' || LPAD(u.id::text, 6, '0'),
    CASE 
        WHEN u.role = 'ADMIN' THEN '2020-01-15'::date
        WHEN u.role = 'FACULTY' THEN '2021-08-01'::date
        ELSE '2022-01-01'::date
    END,
    CASE 
        WHEN u.role = 'ADMIN' THEN 'FULL_TIME'
        WHEN u.role = 'FACULTY' THEN 'FULL_TIME'
        ELSE 'PART_TIME'
    END,
    'ACTIVE',
    CASE 
        WHEN u.role = 'ADMIN' THEN 'System Administrator'
        WHEN u.role = 'FACULTY' THEN 'Professor'
        ELSE 'Staff Member'
    END,
    CASE 
        WHEN u.role = 'ADMIN' THEN 'Information Technology'
        WHEN u.role = 'FACULTY' THEN u.department
        ELSE 'Administration'
    END,
    CASE 
        WHEN u.role = 'ADMIN' THEN 75000.00
        WHEN u.role = 'FACULTY' THEN 85000.00
        ELSE 45000.00
    END,
    true,
    CASE WHEN u.role = 'FACULTY' THEN true ELSE false END,
    CASE 
        WHEN u.role = 'ADMIN' THEN '2020-01-15'::date
        WHEN u.role = 'FACULTY' THEN '2021-08-01'::date
        ELSE '2022-01-01'::date
    END,
    CASE 
        WHEN u.role = 'ADMIN' THEN 'Tech Building, Room 101'
        WHEN u.role = 'FACULTY' THEN 'Faculty Building, Room ' || (200 + u.id % 50)
        ELSE 'Admin Building, Room ' || (100 + u.id % 30)
    END,
    '+1-555-' || LPAD((1000 + u.id % 9000)::text, 4, '0')
FROM users u 
WHERE u.role IN ('ADMIN', 'FACULTY')
AND u.status = 'ACTIVE'
LIMIT 10;

-- =====================================================
-- INSERT SAMPLE EMPLOYEE QUALIFICATIONS
-- =====================================================

INSERT INTO employee_qualifications (employee_id, qualification_type, institution, field_of_study, degree_level, completion_date, verification_status)
SELECT 
    er.id,
    'DEGREE',
    CASE (er.id % 4)
        WHEN 0 THEN 'Stanford University'
        WHEN 1 THEN 'MIT'
        WHEN 2 THEN 'Harvard University'
        ELSE 'University of California, Berkeley'
    END,
    CASE 
        WHEN er.job_title LIKE '%Professor%' THEN 
            CASE (er.id % 3)
                WHEN 0 THEN 'Computer Science'
                WHEN 1 THEN 'Mathematics'
                ELSE 'Engineering'
            END
        WHEN er.job_title LIKE '%Administrator%' THEN 'Information Systems'
        ELSE 'Business Administration'
    END,
    CASE 
        WHEN er.job_title LIKE '%Professor%' THEN 'DOCTORAL'
        WHEN er.job_title LIKE '%Administrator%' THEN 'MASTER'
        ELSE 'BACHELOR'
    END,
    er.hire_date - INTERVAL '2 years',
    'VERIFIED'
FROM employee_records er
LIMIT 10;

-- Add some certifications
INSERT INTO employee_qualifications (employee_id, qualification_type, institution, field_of_study, degree_level, completion_date, verification_status)
SELECT 
    er.id,
    'CERTIFICATION',
    CASE (er.id % 3)
        WHEN 0 THEN 'Microsoft'
        WHEN 1 THEN 'Oracle'
        ELSE 'Cisco'
    END,
    CASE 
        WHEN er.job_title LIKE '%Administrator%' THEN 'System Administration'
        WHEN er.job_title LIKE '%Professor%' THEN 'Teaching Excellence'
        ELSE 'Professional Development'
    END,
    'CERTIFICATE',
    er.hire_date + INTERVAL '6 months',
    'VERIFIED'
FROM employee_records er
WHERE er.job_title LIKE '%Administrator%' OR er.job_title LIKE '%Professor%'
LIMIT 5;

-- =====================================================
-- INSERT SAMPLE EMPLOYEE POSITIONS
-- =====================================================

INSERT INTO employee_positions (employee_id, organizational_unit_id, position_title, position_type, start_date, fte_percentage, is_primary_position)
SELECT 
    er.id,
    ou.id,
    er.job_title,
    'PRIMARY',
    er.hire_date,
    100.00,
    true
FROM employee_records er
CROSS JOIN organizational_units ou
WHERE (
    (er.job_title LIKE '%Administrator%' AND ou.code = 'IT') OR
    (er.job_title LIKE '%Professor%' AND ou.code = 'ACADEMIC') OR
    (er.job_title NOT LIKE '%Administrator%' AND er.job_title NOT LIKE '%Professor%' AND ou.code = 'ADMIN')
)
LIMIT 10;

-- =====================================================
-- INSERT SAMPLE PERFORMANCE REVIEW CYCLE
-- =====================================================

INSERT INTO performance_review_cycles (cycle_name, cycle_year, review_type, start_date, end_date, self_assessment_deadline, manager_review_deadline, final_review_deadline, status, description)
VALUES 
('Annual Review 2024', 2024, 'ANNUAL', '2024-01-01', '2024-12-31', '2024-11-15', '2024-12-01', '2024-12-15', 'COMPLETED', 'Annual performance review cycle for 2024'),
('Annual Review 2025', 2025, 'ANNUAL', '2025-01-01', '2025-12-31', '2025-11-15', '2025-12-01', '2025-12-15', 'ACTIVE', 'Annual performance review cycle for 2025');

-- =====================================================
-- INSERT SAMPLE PERFORMANCE REVIEWS
-- =====================================================

INSERT INTO performance_reviews (employee_id, reviewer_id, review_cycle_id, review_period_start, review_period_end, review_type, overall_rating, goals_achievement_rating, professional_development_rating, strengths, areas_for_improvement, manager_comments, status, due_date, completed_date)
SELECT 
    er.id,
    (SELECT u.id FROM users u WHERE u.role = 'ADMIN' LIMIT 1),
    (SELECT prc.id FROM performance_review_cycles prc WHERE prc.cycle_year = 2024 LIMIT 1),
    '2024-01-01'::date,
    '2024-12-31'::date,
    'ANNUAL',
    CASE (er.id % 3)
        WHEN 0 THEN 'EXCEEDS_EXPECTATIONS'
        WHEN 1 THEN 'MEETS_EXPECTATIONS'
        ELSE 'MEETS_EXPECTATIONS'
    END,
    CASE (er.id % 3)
        WHEN 0 THEN 'EXCEEDS_EXPECTATIONS'
        WHEN 1 THEN 'MEETS_EXPECTATIONS'
        ELSE 'MEETS_EXPECTATIONS'
    END,
    'MEETS_EXPECTATIONS',
    CASE (er.id % 3)
        WHEN 0 THEN 'Excellent technical skills, strong leadership, proactive problem solving'
        WHEN 1 THEN 'Reliable performance, good collaboration, meets deadlines consistently'
        ELSE 'Strong work ethic, attention to detail, positive attitude'
    END,
    CASE (er.id % 3)
        WHEN 0 THEN 'Could improve delegation skills and strategic planning'
        WHEN 1 THEN 'Would benefit from additional training in new technologies'
        ELSE 'Could enhance communication skills and take more initiative'
    END,
    'Overall solid performance with room for growth in identified areas.',
    'COMPLETED',
    '2024-12-01'::date,
    '2024-12-15'::date
FROM employee_records er
LIMIT 5;

-- =====================================================
-- INSERT SAMPLE PERFORMANCE GOALS
-- =====================================================

INSERT INTO performance_goals (employee_id, goal_title, goal_description, goal_category, target_completion_date, weight_percentage, status, progress_percentage, achievement_rating, manager_notes)
SELECT 
    er.id,
    CASE (er.id % 4)
        WHEN 0 THEN 'Improve System Performance'
        WHEN 1 THEN 'Complete Professional Certification'
        WHEN 2 THEN 'Enhance Team Leadership'
        ELSE 'Develop New Skills'
    END,
    CASE (er.id % 4)
        WHEN 0 THEN 'Optimize system performance and reduce response times by 20%'
        WHEN 1 THEN 'Complete relevant professional certification in area of expertise'
        WHEN 2 THEN 'Take on additional leadership responsibilities and mentor junior staff'
        ELSE 'Develop new technical or soft skills relevant to role'
    END,
    CASE (er.id % 4)
        WHEN 0 THEN 'TECHNICAL'
        WHEN 1 THEN 'PROFESSIONAL_DEVELOPMENT'
        WHEN 2 THEN 'LEADERSHIP'
        ELSE 'PROFESSIONAL_DEVELOPMENT'
    END,
    '2025-12-31'::date,
    25.00,
    CASE (er.id % 3)
        WHEN 0 THEN 'COMPLETED'
        WHEN 1 THEN 'ACTIVE'
        ELSE 'ACTIVE'
    END,
    CASE (er.id % 3)
        WHEN 0 THEN 100.00
        WHEN 1 THEN 65.00
        ELSE 30.00
    END,
    CASE (er.id % 3)
        WHEN 0 THEN 'EXCEEDS_EXPECTATIONS'
        WHEN 1 THEN NULL
        ELSE NULL
    END,
    CASE (er.id % 3)
        WHEN 0 THEN 'Goal completed ahead of schedule with excellent results'
        WHEN 1 THEN 'Good progress, on track to meet deadline'
        ELSE 'Early stages, needs more focus and effort'
    END
FROM employee_records er
LIMIT 8;

-- =====================================================
-- INSERT SAMPLE EMPLOYEE LEAVE BALANCES
-- =====================================================

INSERT INTO employee_leave_balances (employee_id, leave_type_id, year, allocated_days, used_days, pending_days, carried_over_days)
SELECT 
    er.id,
    lt.id,
    2025,
    CASE lt.code
        WHEN 'ANNUAL' THEN 25.00
        WHEN 'SICK' THEN 15.00
        WHEN 'PERSONAL' THEN 5.00
        ELSE 0.00
    END,
    CASE lt.code
        WHEN 'ANNUAL' THEN (er.id % 10) + 2.0
        WHEN 'SICK' THEN (er.id % 5) + 1.0
        WHEN 'PERSONAL' THEN (er.id % 3) + 0.5
        ELSE 0.00
    END,
    0.00,
    CASE lt.code
        WHEN 'ANNUAL' THEN (er.id % 3) + 1.0
        ELSE 0.00
    END
FROM employee_records er
CROSS JOIN leave_types lt
WHERE lt.code IN ('ANNUAL', 'SICK', 'PERSONAL')
LIMIT 30;

-- =====================================================
-- INSERT SAMPLE LEAVE REQUESTS
-- =====================================================

INSERT INTO leave_requests (employee_id, leave_type_id, request_number, start_date, end_date, total_days, reason, status, requested_by, approved_by, approved_date)
SELECT 
    er.id,
    lt.id,
    'LR' || LPAD((er.id * 100 + lt.id)::text, 8, '0'),
    '2025-03-15'::date + (er.id % 30) * INTERVAL '1 day',
    '2025-03-17'::date + (er.id % 30) * INTERVAL '1 day',
    3.00,
    CASE lt.code
        WHEN 'ANNUAL' THEN 'Family vacation'
        WHEN 'SICK' THEN 'Medical appointment'
        WHEN 'PERSONAL' THEN 'Personal matters'
        ELSE 'Other'
    END,
    CASE (er.id % 3)
        WHEN 0 THEN 'APPROVED'
        WHEN 1 THEN 'PENDING'
        ELSE 'COMPLETED'
    END,
    er.user_id,
    CASE (er.id % 3)
        WHEN 0 THEN (SELECT u.id FROM users u WHERE u.role = 'ADMIN' LIMIT 1)
        WHEN 1 THEN NULL
        ELSE (SELECT u.id FROM users u WHERE u.role = 'ADMIN' LIMIT 1)
    END,
    CASE (er.id % 3)
        WHEN 0 THEN CURRENT_TIMESTAMP - INTERVAL '5 days'
        WHEN 1 THEN NULL
        ELSE CURRENT_TIMESTAMP - INTERVAL '10 days'
    END
FROM employee_records er
CROSS JOIN leave_types lt
WHERE lt.code IN ('ANNUAL', 'SICK')
LIMIT 10;

-- =====================================================
-- INSERT SAMPLE EMPLOYMENT CONTRACTS
-- =====================================================

INSERT INTO employment_contracts (employee_id, contract_number, contract_type, start_date, end_date, salary, job_title, department, termination_notice_period_days, probation_period_months, renewal_eligible, status, signed_by_employee_date, signed_by_employer_date)
SELECT 
    er.id,
    'CONTRACT' || LPAD(er.id::text, 6, '0'),
    CASE er.employment_type
        WHEN 'FULL_TIME' THEN 'PERMANENT'
        WHEN 'PART_TIME' THEN 'FIXED_TERM'
        WHEN 'CONTRACT' THEN 'FIXED_TERM'
        ELSE 'PERMANENT'
    END,
    er.hire_date,
    CASE er.employment_type
        WHEN 'FULL_TIME' THEN NULL
        ELSE er.hire_date + INTERVAL '2 years'
    END,
    er.salary,
    er.job_title,
    er.department,
    CASE er.employment_type
        WHEN 'FULL_TIME' THEN 30
        ELSE 14
    END,
    CASE er.employment_type
        WHEN 'FULL_TIME' THEN 6
        ELSE 3
    END,
    CASE er.employment_type
        WHEN 'FULL_TIME' THEN true
        ELSE false
    END,
    'ACTIVE',
    er.hire_date + INTERVAL '1 day',
    er.hire_date + INTERVAL '2 days'
FROM employee_records er
LIMIT 8;

-- =====================================================
-- UPDATE ORGANIZATIONAL UNITS WITH HEAD EMPLOYEES
-- =====================================================

-- Update organizational units to have head employees
UPDATE organizational_units 
SET head_employee_id = (
    SELECT er.id 
    FROM employee_records er 
    WHERE er.job_title LIKE '%Administrator%' 
    LIMIT 1
)
WHERE code = 'IT';

UPDATE organizational_units 
SET head_employee_id = (
    SELECT er.id 
    FROM employee_records er 
    WHERE er.job_title LIKE '%Professor%' 
    LIMIT 1
)
WHERE code = 'ACADEMIC';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'HR sample data inserted successfully' as status;