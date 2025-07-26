-- V4__Insert_enhanced_sample_data.sql
-- Insert sample data for enhanced entities

-- =====================================================
-- INSERT SAMPLE COLLEGES
-- =====================================================

INSERT INTO colleges (code, name, description, established_date, website, status) VALUES
('CEAS', 'College of Engineering and Applied Sciences', 'Leading college for engineering, computer science, and applied sciences programs', '1965-09-01', 'https://ceas.university.edu', 'ACTIVE'),
('CAS', 'College of Arts and Sciences', 'Liberal arts and sciences education with diverse academic programs', '1950-09-01', 'https://cas.university.edu', 'ACTIVE'),
('COB', 'College of Business', 'Business education and entrepreneurship programs', '1970-09-01', 'https://business.university.edu', 'ACTIVE'),
('COE', 'College of Education', 'Teacher preparation and educational leadership programs', '1955-09-01', 'https://education.university.edu', 'ACTIVE');

-- =====================================================
-- INSERT SAMPLE DEPARTMENTS
-- =====================================================

INSERT INTO departments (college_id, code, name, description, head_of_department, head_email, building, phone_number, email, website, status) VALUES
-- Engineering and Applied Sciences Departments
(1, 'CS', 'Computer Science', 'Computer Science and Software Engineering programs', 'Dr. Robert Smith', 'rsmith@university.edu', 'Engineering Building', '555-0101', 'cs@university.edu', 'https://cs.university.edu', 'ACTIVE'),
(1, 'EE', 'Electrical Engineering', 'Electrical and Electronics Engineering programs', 'Dr. Maria Garcia', 'mgarcia@university.edu', 'Engineering Building', '555-0102', 'ee@university.edu', 'https://ee.university.edu', 'ACTIVE'),
(1, 'ME', 'Mechanical Engineering', 'Mechanical and Manufacturing Engineering programs', 'Dr. James Wilson', 'jwilson@university.edu', 'Engineering Building', '555-0103', 'me@university.edu', 'https://me.university.edu', 'ACTIVE'),

-- Arts and Sciences Departments
(2, 'MATH', 'Mathematics', 'Mathematics and Statistics programs', 'Prof. Michael Williams', 'mwilliams@university.edu', 'Science Building', '555-0201', 'math@university.edu', 'https://math.university.edu', 'ACTIVE'),
(2, 'PHYS', 'Physics', 'Physics and Astronomy programs', 'Dr. Sarah Davis', 'sdavis@university.edu', 'Science Building', '555-0202', 'physics@university.edu', 'https://physics.university.edu', 'ACTIVE'),
(2, 'CHEM', 'Chemistry', 'Chemistry and Biochemistry programs', 'Dr. Lisa Johnson', 'ljohnson@university.edu', 'Science Building', '555-0203', 'chemistry@university.edu', 'https://chemistry.university.edu', 'ACTIVE'),
(2, 'ENG', 'English', 'English Literature and Composition programs', 'Prof. Emily Brown', 'ebrown@university.edu', 'Liberal Arts Building', '555-0204', 'english@university.edu', 'https://english.university.edu', 'ACTIVE'),

-- Business Departments
(3, 'ACCT', 'Accounting', 'Accounting and Financial Management programs', 'Dr. David Miller', 'dmiller@university.edu', 'Business Building', '555-0301', 'accounting@university.edu', 'https://accounting.university.edu', 'ACTIVE'),
(3, 'MGMT', 'Management', 'Business Management and Leadership programs', 'Dr. Jennifer Taylor', 'jtaylor@university.edu', 'Business Building', '555-0302', 'management@university.edu', 'https://management.university.edu', 'ACTIVE'),

-- Education Departments
(4, 'EDUC', 'Education', 'Teacher Education and Educational Leadership programs', 'Dr. Patricia Anderson', 'panderson@university.edu', 'Education Building', '555-0401', 'education@university.edu', 'https://education.university.edu', 'ACTIVE');

-- =====================================================
-- INSERT SAMPLE ACADEMIC PROGRAMS
-- =====================================================

INSERT INTO academic_programs (code, name, description, department_id, program_type, degree_type, credit_requirements, duration_semesters, admission_requirements, graduation_requirements, status) VALUES
-- Computer Science Programs
('CS-BS', 'Bachelor of Science in Computer Science', 'Comprehensive undergraduate program in computer science and software engineering', 1, 'UNDERGRADUATE', 'Bachelor of Science', 120, 8, 'High school diploma, SAT/ACT scores, Math prerequisites', 'Complete all core courses, maintain 2.0 GPA, capstone project', 'ACTIVE'),
('CS-MS', 'Master of Science in Computer Science', 'Advanced graduate program in computer science research and development', 1, 'GRADUATE', 'Master of Science', 36, 4, 'Bachelor degree in CS or related field, GRE scores, 3.0 GPA', 'Complete all core courses, maintain 3.0 GPA, thesis or project', 'ACTIVE'),

-- Mathematics Programs
('MATH-BS', 'Bachelor of Science in Mathematics', 'Comprehensive undergraduate program in pure and applied mathematics', 4, 'UNDERGRADUATE', 'Bachelor of Science', 120, 8, 'High school diploma, strong math background, SAT/ACT scores', 'Complete all core courses, maintain 2.0 GPA, comprehensive exam', 'ACTIVE'),

-- Physics Programs
('PHYS-BS', 'Bachelor of Science in Physics', 'Undergraduate program in theoretical and experimental physics', 5, 'UNDERGRADUATE', 'Bachelor of Science', 120, 8, 'High school diploma, strong math and science background', 'Complete all core courses, maintain 2.0 GPA, senior research project', 'ACTIVE'),

-- English Programs
('ENG-BA', 'Bachelor of Arts in English', 'Liberal arts program focusing on literature, writing, and critical analysis', 7, 'UNDERGRADUATE', 'Bachelor of Arts', 120, 8, 'High school diploma, strong writing skills, SAT/ACT scores', 'Complete all core courses, maintain 2.0 GPA, senior portfolio', 'ACTIVE'),

-- Business Programs
('BUS-BS', 'Bachelor of Science in Business Administration', 'Comprehensive business program with management focus', 9, 'UNDERGRADUATE', 'Bachelor of Science', 120, 8, 'High school diploma, SAT/ACT scores, basic math skills', 'Complete all core courses, maintain 2.0 GPA, internship requirement', 'ACTIVE');

-- =====================================================
-- INSERT SAMPLE ACADEMIC YEARS
-- =====================================================

INSERT INTO academic_years (code, name, start_date, end_date, status) VALUES
('2023-2024', 'Academic Year 2023-2024', '2023-08-15', '2024-05-15', 'ARCHIVED'),
('2024-2025', 'Academic Year 2024-2025', '2024-08-15', '2025-05-15', 'ACTIVE'),
('2025-2026', 'Academic Year 2025-2026', '2025-08-15', '2026-05-15', 'INACTIVE');

-- =====================================================
-- INSERT SAMPLE ACADEMIC SEMESTERS
-- =====================================================

INSERT INTO academic_semesters (academic_year_id, code, name, start_date, end_date, registration_start_date, registration_end_date, add_drop_deadline, withdrawal_deadline, final_exam_start_date, final_exam_end_date, status) VALUES
-- 2023-2024 Academic Year
(1, 'FALL2023', 'Fall Semester 2023', '2023-08-15', '2023-12-15', '2023-07-01', '2023-08-10', '2023-08-25', '2023-11-01', '2023-12-10', '2023-12-15', 'COMPLETED'),
(1, 'SPRING2024', 'Spring Semester 2024', '2024-01-15', '2024-05-15', '2023-11-01', '2024-01-10', '2024-01-25', '2024-04-01', '2024-05-10', '2024-05-15', 'COMPLETED'),

-- 2024-2025 Academic Year (Current)
(2, 'FALL2024', 'Fall Semester 2024', '2024-08-15', '2024-12-15', '2024-07-01', '2024-08-10', '2024-08-25', '2024-11-01', '2024-12-10', '2024-12-15', 'ACTIVE'),
(2, 'SPRING2025', 'Spring Semester 2025', '2025-01-15', '2025-05-15', '2024-11-01', '2025-01-10', '2025-01-25', '2025-04-01', '2025-05-10', '2025-05-15', 'INACTIVE'),

-- 2025-2026 Academic Year
(3, 'FALL2025', 'Fall Semester 2025', '2025-08-15', '2025-12-15', '2025-07-01', '2025-08-10', '2025-08-25', '2025-11-01', '2025-12-10', '2025-12-15', 'INACTIVE'),
(3, 'SPRING2026', 'Spring Semester 2026', '2026-01-15', '2026-05-15', '2025-11-01', '2026-01-10', '2026-01-25', '2026-04-01', '2026-05-10', '2026-05-15', 'INACTIVE');

-- =====================================================
-- UPDATE EXISTING USERS WITH ENHANCED DATA
-- =====================================================

-- Update admin user
UPDATE users SET 
    user_type = 'ADMIN',
    employee_type = 'FULL_TIME',
    employee_id = 'EMP001',
    phone_number = '555-0001',
    department = 'Administration',
    status = 'ACTIVE',
    preferred_language = 'en',
    timezone = 'America/New_York'
WHERE username = 'admin';

-- Update student users with more comprehensive data
UPDATE users SET 
    user_type = 'STUDENT',
    student_id = 'STU001',
    phone_number = '555-1001',
    date_of_birth = '2000-05-15',
    address = '123 Student Lane',
    city = 'University City',
    state = 'State',
    postal_code = '12345',
    department = 'Computer Science',
    year_of_study = 3,
    gpa = 3.75,
    status = 'ACTIVE',
    enrollment_date = '2022-08-15',
    expected_graduation_date = '2026-05-15',
    emergency_contact_name = 'Mary Doe',
    emergency_contact_phone = '555-2001',
    emergency_contact_relationship = 'Mother',
    preferred_language = 'en',
    timezone = 'America/New_York'
WHERE username = 'john_doe';

UPDATE users SET 
    user_type = 'STUDENT',
    student_id = 'STU002',
    phone_number = '555-1002',
    date_of_birth = '1999-12-03',
    address = '456 College Ave',
    city = 'University City',
    state = 'State',
    postal_code = '12345',
    department = 'Computer Science',
    year_of_study = 4,
    gpa = 3.90,
    status = 'ACTIVE',
    enrollment_date = '2021-08-15',
    expected_graduation_date = '2025-05-15',
    emergency_contact_name = 'Robert Smith',
    emergency_contact_phone = '555-2002',
    emergency_contact_relationship = 'Father',
    preferred_language = 'en',
    timezone = 'America/New_York'
WHERE username = 'jane_smith';

-- =====================================================
-- INSERT ADDITIONAL FACULTY USERS
-- =====================================================

INSERT INTO users (username, email, password, first_name, last_name, role, user_type, employee_type, employee_id, phone_number, department, status, preferred_language, timezone) VALUES
('dr_smith', 'robert.smith@university.edu', '$2a$10$aj4fc8CeHHCJOveX1HQpH.uFvvQ58kDD6kYsCk1wmYQwRfyFbbLLS', 'Robert', 'Smith', 'FACULTY', 'FACULTY', 'FULL_TIME', 'FAC001', '555-3001', 'Computer Science', 'ACTIVE', 'en', 'America/New_York'),
('dr_johnson', 'lisa.johnson@university.edu', '$2a$10$aj4fc8CeHHCJOveX1HQpH.uFvvQ58kDD6kYsCk1wmYQwRfyFbbLLS', 'Lisa', 'Johnson', 'FACULTY', 'FACULTY', 'FULL_TIME', 'FAC002', '555-3002', 'Chemistry', 'ACTIVE', 'en', 'America/New_York'),
('prof_williams', 'michael.williams@university.edu', '$2a$10$aj4fc8CeHHCJOveX1HQpH.uFvvQ58kDD6kYsCk1wmYQwRfyFbbLLS', 'Michael', 'Williams', 'FACULTY', 'FACULTY', 'FULL_TIME', 'FAC003', '555-3003', 'Mathematics', 'ACTIVE', 'en', 'America/New_York'),
('dr_davis', 'sarah.davis@university.edu', '$2a$10$aj4fc8CeHHCJOveX1HQpH.uFvvQ58kDD6kYsCk1wmYQwRfyFbbLLS', 'Sarah', 'Davis', 'FACULTY', 'FACULTY', 'FULL_TIME', 'FAC004', '555-3004', 'Physics', 'ACTIVE', 'en', 'America/New_York'),
('prof_brown', 'emily.brown@university.edu', '$2a$10$aj4fc8CeHHCJOveX1HQpH.uFvvQ58kDD6kYsCk1wmYQwRfyFbbLLS', 'Emily', 'Brown', 'FACULTY', 'FACULTY', 'FULL_TIME', 'FAC005', '555-3005', 'English', 'ACTIVE', 'en', 'America/New_York');

-- =====================================================
-- UPDATE EXISTING COURSES WITH ENHANCED DATA
-- =====================================================

-- Update CS101
UPDATE courses SET 
    instructor_email = 'robert.smith@university.edu',
    department = 'Computer Science',
    course_level = 'UNDERGRADUATE',
    classroom = 'ENG-101',
    start_date = '2024-08-15',
    end_date = '2024-12-15',
    start_time = '10:00:00',
    end_time = '11:00:00',
    days_of_week = 'MON,WED,FRI',
    course_fee = 150.00,
    status = 'ACTIVE',
    syllabus_url = 'https://courses.university.edu/cs101/syllabus.pdf',
    textbook = 'Introduction to Programming with Python, 3rd Edition'
WHERE code = 'CS101';

-- Update CS102
UPDATE courses SET 
    instructor_email = 'lisa.johnson@university.edu',
    department = 'Computer Science',
    course_level = 'UNDERGRADUATE',
    classroom = 'ENG-102',
    start_date = '2024-08-15',
    end_date = '2024-12-15',
    start_time = '14:00:00',
    end_time = '15:30:00',
    days_of_week = 'TUE,THU',
    course_fee = 175.00,
    prerequisites = 'CS101',
    status = 'ACTIVE',
    syllabus_url = 'https://courses.university.edu/cs102/syllabus.pdf',
    textbook = 'Data Structures and Algorithms in Java, 6th Edition'
WHERE code = 'CS102';

-- Update MATH201
UPDATE courses SET 
    instructor_email = 'michael.williams@university.edu',
    department = 'Mathematics',
    course_level = 'UNDERGRADUATE',
    classroom = 'SCI-201',
    start_date = '2024-08-15',
    end_date = '2024-12-15',
    start_time = '09:00:00',
    end_time = '10:00:00',
    days_of_week = 'MON,WED,FRI',
    course_fee = 125.00,
    status = 'ACTIVE',
    syllabus_url = 'https://courses.university.edu/math201/syllabus.pdf',
    textbook = 'Calculus: Early Transcendentals, 8th Edition'
WHERE code = 'MATH201';

-- Update PHYS101
UPDATE courses SET 
    instructor_email = 'sarah.davis@university.edu',
    department = 'Physics',
    course_level = 'UNDERGRADUATE',
    classroom = 'SCI-301',
    start_date = '2024-08-15',
    end_date = '2024-12-15',
    start_time = '11:00:00',
    end_time = '12:30:00',
    days_of_week = 'TUE,THU',
    course_fee = 200.00,
    status = 'ACTIVE',
    syllabus_url = 'https://courses.university.edu/phys101/syllabus.pdf',
    textbook = 'University Physics with Modern Physics, 15th Edition'
WHERE code = 'PHYS101';

-- Update ENG101
UPDATE courses SET 
    instructor_email = 'emily.brown@university.edu',
    department = 'English',
    course_level = 'UNDERGRADUATE',
    classroom = 'LA-101',
    start_date = '2024-08-15',
    end_date = '2024-12-15',
    start_time = '13:00:00',
    end_time = '14:30:00',
    days_of_week = 'MON,WED',
    course_fee = 100.00,
    status = 'ACTIVE',
    syllabus_url = 'https://courses.university.edu/eng101/syllabus.pdf',
    textbook = 'The Norton Field Guide to Writing, 4th Edition'
WHERE code = 'ENG101';

-- =====================================================
-- INSERT COURSE PREREQUISITES
-- =====================================================

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, prerequisite_type, minimum_grade) VALUES
-- CS102 requires CS101
((SELECT id FROM courses WHERE code = 'CS102'), (SELECT id FROM courses WHERE code = 'CS101'), 'REQUIRED', 'C'),
-- PHYS101 recommends MATH201
((SELECT id FROM courses WHERE code = 'PHYS101'), (SELECT id FROM courses WHERE code = 'MATH201'), 'RECOMMENDED', 'C');

-- =====================================================
-- UPDATE EXISTING REGISTRATIONS WITH ENHANCED DATA
-- =====================================================

-- Update John's registrations
UPDATE registrations SET 
    grade_points = 4.0,
    attendance_percentage = 95.0,
    midterm_grade = 'A',
    final_grade = 'A',
    course_fee_paid = 150.00,
    payment_status = 'PAID',
    payment_date = '2024-08-01 10:00:00',
    payment_method = 'CREDIT_CARD',
    transcript_released = TRUE,
    completion_date = '2024-12-15 15:00:00',
    certificate_issued = TRUE
WHERE user_id = (SELECT id FROM users WHERE username = 'john_doe') 
  AND course_id = (SELECT id FROM courses WHERE code = 'CS101');

UPDATE registrations SET 
    attendance_percentage = 88.0,
    course_fee_paid = 125.00,
    payment_status = 'PAID',
    payment_date = '2024-08-01 10:00:00',
    payment_method = 'CREDIT_CARD'
WHERE user_id = (SELECT id FROM users WHERE username = 'john_doe') 
  AND course_id = (SELECT id FROM courses WHERE code = 'MATH201');

-- Update Jane's registrations
UPDATE registrations SET 
    grade_points = 3.3,
    attendance_percentage = 92.0,
    midterm_grade = 'B+',
    final_grade = 'B+',
    course_fee_paid = 150.00,
    payment_status = 'PAID',
    payment_date = '2024-08-01 10:00:00',
    payment_method = 'BANK_TRANSFER',
    transcript_released = TRUE,
    completion_date = '2024-12-15 15:00:00',
    certificate_issued = TRUE
WHERE user_id = (SELECT id FROM users WHERE username = 'jane_smith') 
  AND course_id = (SELECT id FROM courses WHERE code = 'CS101');

UPDATE registrations SET 
    attendance_percentage = 90.0,
    course_fee_paid = 175.00,
    payment_status = 'PAID',
    payment_date = '2024-08-01 10:00:00',
    payment_method = 'BANK_TRANSFER'
WHERE user_id = (SELECT id FROM users WHERE username = 'jane_smith') 
  AND course_id = (SELECT id FROM courses WHERE code = 'CS102');

UPDATE registrations SET 
    grade_points = 3.7,
    attendance_percentage = 96.0,
    midterm_grade = 'A-',
    final_grade = 'A-',
    course_fee_paid = 100.00,
    payment_status = 'PAID',
    payment_date = '2024-08-01 10:00:00',
    payment_method = 'BANK_TRANSFER',
    transcript_released = TRUE,
    completion_date = '2024-12-15 15:00:00',
    certificate_issued = TRUE
WHERE user_id = (SELECT id FROM users WHERE username = 'jane_smith') 
  AND course_id = (SELECT id FROM courses WHERE code = 'ENG101');