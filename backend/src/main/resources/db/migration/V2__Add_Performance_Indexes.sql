-- V2__Add_Performance_Indexes_and_Sample_Data.sql
-- Performance optimization indexes and sample data

-- =====================================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- =====================================================

-- User table indexes (additional ones not in V1)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Course table indexes (additional ones not in V1)
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor);
CREATE INDEX IF NOT EXISTS idx_courses_title ON courses(title);
-- Note: department column is added in V3, so index will be created there

-- Registration table indexes (additional ones not in V1)
CREATE INDEX IF NOT EXISTS idx_registrations_user_course ON registrations(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_registrations_grade ON registrations(grade);

-- Note: Basic indexes (username, email, code, user_id, course_id, status) are already created in V1
-- Note: Additional indexes for other tables will be created in later migrations after those tables are created

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert admin user (password: 'password' encoded with BCrypt)
INSERT INTO users (username, email, password, first_name, last_name, role)
VALUES ('admin', 'admin@university.com', '$2a$10$aj4fc8CeHHCJOveX1HQpH.uFvvQ58kDD6kYsCk1wmYQwRfyFbbLLS', 'Admin', 'User', 'ADMIN');

-- Insert sample students
INSERT INTO users (username, email, password, first_name, last_name, role)
VALUES
    ('john_doe', 'john@university.com', '$2a$10$aj4fc8CeHHCJOveX1HQpH.uFvvQ58kDD6kYsCk1wmYQwRfyFbbLLS', 'John', 'Doe', 'STUDENT'),
    ('jane_smith', 'jane@university.com', '$2a$10$aj4fc8CeHHCJOveX1HQpH.uFvvQ58kDD6kYsCk1wmYQwRfyFbbLLS', 'Jane', 'Smith', 'STUDENT');

-- Insert sample courses
INSERT INTO courses (code, title, description, instructor, schedule, credits, max_students)
VALUES
    ('CS101', 'Introduction to Computer Science', 'Basic programming concepts and problem-solving techniques using Python. Topics include variables, control structures, functions, and data structures.', 'Dr. Robert Smith', 'Mon/Wed/Fri 10:00-11:00', 3, 30),
    ('CS102', 'Data Structures and Algorithms', 'Study of fundamental data structures including arrays, linked lists, stacks, queues, trees, and graphs. Introduction to algorithm analysis.', 'Dr. Lisa Johnson', 'Tue/Thu 14:00-15:30', 4, 25),
    ('MATH201', 'Calculus I', 'Introduction to differential and integral calculus. Topics include limits, derivatives, integrals, and their applications.', 'Prof. Michael Williams', 'Mon/Wed/Fri 09:00-10:00', 4, 40),
    ('PHYS101', 'Physics I', 'Introduction to mechanics, waves, and thermodynamics. Laboratory sessions included.', 'Dr. Sarah Davis', 'Tue/Thu 11:00-12:30', 4, 35),
    ('ENG101', 'English Composition', 'Development of writing skills through practice in various forms of composition. Emphasis on critical thinking and analysis.', 'Prof. Emily Brown', 'Mon/Wed 13:00-14:30', 3, 25);

-- Insert sample registrations
INSERT INTO registrations (user_id, course_id, grade, status)
VALUES
    (2, 1, 'A', 'COMPLETED'),  -- John enrolled in CS101
    (2, 3, NULL, 'ENROLLED'),  -- John enrolled in MATH201
    (3, 1, 'B+', 'COMPLETED'), -- Jane enrolled in CS101
    (3, 2, NULL, 'ENROLLED'),  -- Jane enrolled in CS102
    (3, 5, 'A-', 'COMPLETED'); -- Jane enrolled in ENG101
