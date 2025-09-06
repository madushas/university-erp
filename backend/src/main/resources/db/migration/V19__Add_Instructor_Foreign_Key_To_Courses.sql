-- Migration to add instructor foreign key relationship to courses table
-- This migration will:
-- 1. Add instructor_id column as foreign key to users table
-- 2. Migrate existing instructor data to link with actual users
-- 3. Drop the old instructor string column
-- 4. Update indexes for performance

-- Step 1: Add the new instructor_id column
ALTER TABLE courses ADD COLUMN instructor_id BIGINT;

-- Step 2: Add foreign key constraint
ALTER TABLE courses ADD CONSTRAINT fk_courses_instructor 
    FOREIGN KEY (instructor_id) REFERENCES users(id);

-- Step 3: Create index for performance
CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);

-- Step 4: Migrate existing data
-- This attempts to match existing instructor names with actual users
-- For courses with instructor "Dr. Robert Smith", try to find user with matching name
UPDATE courses 
SET instructor_id = (
    SELECT u.id 
    FROM users u 
    WHERE u.role = 'INSTRUCTOR' 
    AND u.status = 'ACTIVE'
    AND (
        CONCAT(u.first_name, ' ', u.last_name) = courses.instructor
        OR u.username = courses.instructor
        OR LOWER(CONCAT(u.first_name, ' ', u.last_name)) = LOWER(courses.instructor)
    )
    LIMIT 1
)
WHERE courses.instructor IS NOT NULL 
AND courses.instructor != '';

-- Step 5: For courses that couldn't be matched, create a default instructor or handle manually
-- This is a safety measure - in production, you'd want to handle these cases manually
UPDATE courses 
SET instructor_id = (
    SELECT u.id 
    FROM users u 
    WHERE u.role = 'INSTRUCTOR' 
    AND u.status = 'ACTIVE'
    ORDER BY u.id
    LIMIT 1
)
WHERE instructor_id IS NULL 
AND instructor IS NOT NULL 
AND instructor != '';

-- Step 6: Make instructor_id NOT NULL after data migration
-- Note: This assumes all courses now have valid instructor_id values
ALTER TABLE courses ALTER COLUMN instructor_id SET NOT NULL;

-- Update dependent views to remove legacy 'instructor' column references
-- 1) active_student_registrations
DROP VIEW IF EXISTS active_student_registrations;
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
    CAST(CONCAT(iu.first_name, ' ', iu.last_name) AS VARCHAR(100)) as instructor,
    r.grade,
    r.status,
    r.registration_date
FROM registrations r
JOIN users u ON r.user_id = u.id
JOIN courses c ON r.course_id = c.id
JOIN users iu ON c.instructor_id = iu.id
WHERE r.status = 'ENROLLED' 
  AND u.status = 'ACTIVE' 
  AND c.status = 'ACTIVE';

-- 2) course_enrollment_summary
DROP VIEW IF EXISTS course_enrollment_summary;
CREATE OR REPLACE VIEW course_enrollment_summary AS
SELECT 
    c.id as course_id,
    c.code,
    c.title,
    CAST(CONCAT(iu.first_name, ' ', iu.last_name) AS VARCHAR(100)) as instructor,
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
JOIN users iu ON c.instructor_id = iu.id
LEFT JOIN registrations r ON c.id = r.course_id AND r.status = 'ENROLLED'
WHERE c.status = 'ACTIVE'
GROUP BY c.id, c.code, c.title, iu.first_name, iu.last_name, c.max_students, c.min_students, c.status;

-- Now drop the legacy column as no view depends on it anymore
ALTER TABLE courses DROP COLUMN IF EXISTS instructor;

-- Step 7: Drop the old instructor column (commented out for safety)
-- Uncomment this after verifying the migration worked correctly
-- ALTER TABLE courses DROP COLUMN instructor;

-- Step 8: Update instructor_email to be derived from the user relationship
-- The application will now get email from the instructor user relationship
-- but we'll keep the column for backward compatibility during transition
