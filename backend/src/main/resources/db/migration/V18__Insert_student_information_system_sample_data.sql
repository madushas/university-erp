-- V18__Insert_student_information_system_sample_data.sql
-- Sample data for Student Information System

-- Insert sample applications
INSERT INTO applications (
    application_number, applicant_id, academic_program_id, academic_year_id, academic_semester_id,
    application_type, application_date, application_deadline, expected_entry_date,
    status, review_status, preferred_contact_method, phone_number, alternate_email,
    previous_institution, previous_gpa, graduation_date, degree_obtained, major_field,
    personal_statement, statement_of_purpose, research_interests, career_goals,
    financial_aid_requested, estimated_family_contribution, scholarship_requested,
    application_fee_amount, application_fee_paid, application_fee_waived,
    submitted_date, created_at, updated_at
) VALUES 
-- Application 1: Undergraduate Computer Science
('APP-2025-000001', 
 (SELECT id FROM users WHERE email = 'john@university.com' LIMIT 1),
 (SELECT id FROM academic_programs WHERE name = 'Bachelor of Science in Computer Science' LIMIT 1),
 (SELECT id FROM academic_years WHERE name = 'Academic Year 2025-2026' LIMIT 1),
 (SELECT id FROM academic_semesters WHERE name = 'Fall Semester 2025' LIMIT 1),
 'UNDERGRADUATE', '2025-01-15', '2025-03-01', '2025-08-15',
 'SUBMITTED', 'IN_PROGRESS', 'EMAIL', '+1-555-0101', 'john.alt@email.com',
 'Springfield High School', 3.85, '2024-06-15', 'High School Diploma', 'Science',
 'I am passionate about computer science and technology...', 
 'My goal is to become a software engineer...', 
 'Artificial Intelligence, Machine Learning, Web Development',
 'To work at a top technology company and eventually start my own tech startup',
 true, 25000.00, true, 50.00, true, false,
 '2025-01-20 10:30:00', '2025-01-15 09:00:00', '2025-01-20 10:30:00'),

-- Application 2: Graduate Business Administration
('APP-2025-000002',
 (SELECT id FROM users WHERE email = 'jane@university.com' LIMIT 1),
 (SELECT id FROM academic_programs WHERE name = 'Bachelor of Science in Business Administration' LIMIT 1),
 (SELECT id FROM academic_years WHERE name = 'Academic Year 2025-2026' LIMIT 1),
 (SELECT id FROM academic_semesters WHERE name = 'Fall Semester 2025' LIMIT 1),
 'GRADUATE', '2025-01-20', '2025-04-15', '2025-08-15',
 'UNDER_REVIEW', 'IN_PROGRESS', 'EMAIL', '+1-555-0102', 'jane.alt@email.com',
 'State University', 3.92, '2023-05-20', 'Bachelor of Arts', 'Economics',
 'My undergraduate experience in economics has prepared me...', 
 'I aim to pursue an MBA to enhance my business acumen...', 
 'Financial Management, Strategic Planning, Leadership',
 'To become a senior executive in a Fortune 500 company',
 false, 0.00, false, 75.00, true, false,
 '2025-01-25 14:15:00', '2025-01-20 11:00:00', '2025-01-25 14:15:00'),

-- Application 3: Undergraduate Mathematics  
('APP-2025-000003',
 (SELECT id FROM users WHERE email = 'jane@university.com' LIMIT 1), -- Reusing Jane as we only have 2 users
 (SELECT id FROM academic_programs WHERE name = 'Bachelor of Science in Mathematics' LIMIT 1),
 (SELECT id FROM academic_years WHERE name = 'Academic Year 2025-2026' LIMIT 1),
 (SELECT id FROM academic_semesters WHERE name = 'Fall Semester 2025' LIMIT 1),
 'UNDERGRADUATE', '2025-01-18', '2025-04-01', '2025-08-15',
 'ACCEPTED', 'COMPLETED', 'PHONE', '+1-555-0103', 'bob.alt@email.com',
 'Tech High School', 3.78, '2024-06-10', 'High School Diploma', 'Mathematics',
 'Engineering has always fascinated me...', 
 'I want to design sustainable infrastructure...', 
 'Structural Engineering, Environmental Engineering, Renewable Energy',
 'To work on major infrastructure projects that benefit society',
 true, 15000.00, true, 50.00, true, false,
 '2025-01-22 16:45:00', '2025-01-18 13:20:00', '2025-01-22 16:45:00');

-- Insert application documents
INSERT INTO application_documents (
    application_id, document_type, document_name, file_path,
    mime_type, file_size, verification_status, is_required,
    verification_notes, uploaded_date
) VALUES
((SELECT id FROM applications WHERE application_number = 'APP-2025-000001'),
 'TRANSCRIPT', 'Official High School Transcript', 
 '/documents/applications/2025/APP-2025-000001/transcript_john_doe.pdf', 
 'application/pdf', 245760, 'VERIFIED', true,
 'Official transcript from Springfield High School - Verified by registrar office', 
 '2025-01-16 10:00:00'),

((SELECT id FROM applications WHERE application_number = 'APP-2025-000001'),
 'RECOMMENDATION_LETTER', 'Teacher Recommendation',
 '/documents/applications/2025/APP-2025-000001/recommendation_math_teacher.pdf',
 'application/pdf', 186420, 'VERIFIED', true,
 'Recommendation from Math teacher - Strong academic recommendation', 
 '2025-01-17 14:30:00'),

((SELECT id FROM applications WHERE application_number = 'APP-2025-000002'),
 'TRANSCRIPT', 'Official University Transcript',
 '/documents/applications/2025/APP-2025-000002/transcript_jane_smith.pdf',
 'application/pdf', 298567, 'VERIFIED', true,
 'Official transcript from State University - Bachelor degree transcript verified', 
 '2025-01-21 09:15:00'),

((SELECT id FROM applications WHERE application_number = 'APP-2025-000002'),
 'RECOMMENDATION_LETTER', 'Professional Reference',
 '/documents/applications/2025/APP-2025-000002/recommendation_supervisor.pdf',
 'application/pdf', 201845, 'VERIFIED', true,
 'Professional recommendation from work supervisor - Excellent professional reference', 
 '2025-01-22 11:00:00');

-- Insert application reviews
INSERT INTO application_reviews (
    application_id, reviewer_id, review_type, review_date, rating,
    comments, recommendation, department_approval, is_final_review
) VALUES
((SELECT id FROM applications WHERE application_number = 'APP-2025-000001'),
 (SELECT id FROM users WHERE email = 'admin@university.com' LIMIT 1),
 'GENERAL', '2025-01-25 10:30:00', 8.5,
 'Excellent candidate with strong academic background and clear career goals. Strong GPA, clear career direction, good personal statement. Limited work experience, but typical for undergraduate applicant. Would be a great addition to the Computer Science program.',
 'ACCEPT', 'APPROVED', true),

((SELECT id FROM applications WHERE application_number = 'APP-2025-000002'),
 (SELECT id FROM users WHERE email = 'admin@university.com' LIMIT 1),
 'GENERAL', '2025-01-28 14:20:00', 9.2,
 'Outstanding candidate with exceptional academic record and relevant work experience. Excellent GPA, relevant work experience, outstanding recommendations. Perfect fit for our MBA program with strong leadership potential.',
 'ACCEPT', 'APPROVED', true);

-- Insert student academic records
INSERT INTO student_academic_records (
    student_id, academic_program_id, academic_year_id, academic_semester_id,
    academic_level, class_level, enrollment_status, academic_standing,
    semester_gpa, cumulative_gpa, major_gpa, total_credits_attempted, 
    total_credits_earned, total_quality_points, degree_progress_percentage,
    credits_remaining, expected_graduation_date, graduation_application_date,
    graduation_eligibility_verified, probation_status, deans_list_eligible,
    honors_designation, record_date, effective_date
) VALUES
((SELECT id FROM users WHERE email = 'john@university.com' LIMIT 1),
 (SELECT id FROM academic_programs WHERE name = 'Bachelor of Science in Computer Science' LIMIT 1),
 (SELECT id FROM academic_years WHERE name = 'Academic Year 2025-2026' LIMIT 1),
 (SELECT id FROM academic_semesters WHERE name = 'Fall Semester 2025' LIMIT 1),
 'UNDERGRADUATE', 'JUNIOR', 'ACTIVE', 'GOOD_STANDING',
 3.75, 3.68, 3.82, 90, 87, 320.16, 72.50,
 33, '2026-05-15', null, false, 'NONE', true,
 null, '2024-12-15', '2024-12-15'),

((SELECT id FROM users WHERE email = 'jane@university.com' LIMIT 1),
 (SELECT id FROM academic_programs WHERE name = 'Bachelor of Science in Business Administration' LIMIT 1),
 (SELECT id FROM academic_years WHERE name = 'Academic Year 2025-2026' LIMIT 1),
 (SELECT id FROM academic_semesters WHERE name = 'Fall Semester 2025' LIMIT 1),
 'GRADUATE', 'GRADUATE', 'ACTIVE', 'DEANS_LIST',
 3.95, 3.92, 3.94, 36, 36, 141.12, 60.00,
 24, '2026-12-15', null, false, 'NONE', true,
 'Dean''s List Recognition', '2024-12-15', '2024-12-15');

-- Insert degree audits
INSERT INTO degree_audits (
    student_id, academic_program_id, audit_type, audit_date, 
    total_credits_required, credits_completed, credits_remaining,
    minimum_gpa_required, current_gpa, gpa_requirement_met,
    core_requirements_met, major_requirements_met, elective_requirements_met,
    eligible_for_graduation, degree_completion_percentage, projected_graduation_date,
    audited_by, audit_notes
) VALUES
((SELECT id FROM users WHERE email = 'jane@university.com' LIMIT 1),
 (SELECT id FROM academic_programs WHERE name LIKE '%Business%' LIMIT 1),
 'PROGRESS', '2024-12-01', 
 60, 36, 24, 2.0, 3.92, true,
 true, true, false, false, 60.00, '2026-12-15',
 (SELECT id FROM users WHERE email = 'admin@university.com' LIMIT 1),
 'Student is progressing well. Need to complete remaining electives.');

-- Insert degree requirement items
INSERT INTO degree_requirement_items (
    degree_audit_id, requirement_category, requirement_description,
    credits_required, credits_completed, requirement_met,
    courses_required, courses_completed, grade_requirement, notes
) VALUES
((SELECT id FROM degree_audits WHERE student_id = (SELECT id FROM users WHERE email = 'jane@university.com' LIMIT 1)),
 'CORE', 'Core Business Courses', 36, 36, true,
 '["BUS101", "BUS201", "BUS301", "BUS401"]', '["BUS101", "BUS201", "BUS301", "BUS401"]',
 'C', 'All core business courses completed successfully'),

((SELECT id FROM degree_audits WHERE student_id = (SELECT id FROM users WHERE email = 'jane@university.com' LIMIT 1)),
 'ELECTIVE', 'Business Electives', 24, 0, false,
 '["BUS450", "BUS460", "BUS470", "BUS480"]', '[]',
 'C', 'Need to complete 8 elective courses'),

((SELECT id FROM degree_audits WHERE student_id = (SELECT id FROM users WHERE email = 'jane@university.com' LIMIT 1)),
 'CAPSTONE', 'Master''s Thesis', 0, 0, false,
 '["BUS599"]', '[]',
 'B', 'Capstone project required for graduation');

-- Insert transcripts
INSERT INTO transcripts (
    student_id, transcript_type, transcript_number, issue_date, effective_date,
    academic_year_start, student_name, student_number, program_of_study,
    total_credits_attempted, total_credits_earned, cumulative_gpa,
    status, released_date, released_to, release_method,
    security_code, generated_by
) VALUES
((SELECT id FROM users WHERE email = 'jane@university.com' LIMIT 1),
 'OFFICIAL', 'TR-2024-001', '2024-11-15', '2024-11-15',
 (SELECT id FROM academic_years WHERE name = 'Academic Year 2025-2026' LIMIT 1),
 'Jane Smith', 'STU001', 'Bachelor of Science in Business Administration',
 36, 36, 3.92,
 'RELEASED', '2024-11-15 10:30:00', 'Graduate School Applications', 'EMAIL',
 'VERIFY-TR-001-2024', (SELECT id FROM users WHERE email = 'admin@university.com' LIMIT 1));

-- Insert transcript requests
INSERT INTO transcript_requests (
    student_id, request_number, transcript_type, request_date, urgency_level,
    recipient_name, delivery_method, delivery_email, status,
    processing_fee, total_fee, payment_status, processed_date,
    tracking_number, special_instructions
) VALUES
((SELECT id FROM users WHERE email = 'john@university.com' LIMIT 1),
 'REQ-2024-001', 'OFFICIAL', '2024-12-01 14:20:00', 'STANDARD',
 'John Doe', 'EMAIL', 'john@university.com', 'DELIVERED',
 10.00, 10.00, 'PAID', '2024-12-03 09:15:00',
 'REQ-2024-001', 'For personal use');

-- Note: Grade history data would be inserted here once course registrations are established
-- INSERT INTO grade_history (...) VALUES (...);

-- SIS sample data insertion completed successfully
