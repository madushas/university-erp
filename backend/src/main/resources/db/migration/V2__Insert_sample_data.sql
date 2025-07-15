-- Insert admin user (password: 'password' encoded with BCrypt)
INSERT INTO users (username, email, password, first_name, last_name, role)
VALUES ('admin', 'admin@university.com', '$2a$08$UdxACAC38Oz3geurL2eDjO40..Jwh.cFncSrQhrANe81T3/lwMxXe', 'Admin', 'User', 'ADMIN');

-- Insert sample students
INSERT INTO users (username, email, password, first_name, last_name, role)
VALUES 
    ('john_doe', 'john@university.com', '$2a$08$UdxACAC38Oz3geurL2eDjO40..Jwh.cFncSrQhrANe81T3/lwMxXe', 'John', 'Doe', 'STUDENT'),
    ('jane_smith', 'jane@university.com', '$2a$08$UdxACAC38Oz3geurL2eDjO40..Jwh.cFncSrQhrANe81T3/lwMxXe', 'Jane', 'Smith', 'STUDENT');

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
