-- First, drop the existing constraint
ALTER TABLE academic_semesters 
DROP CONSTRAINT semesters_status_check;

-- Update existing status values to match the new enum
UPDATE academic_semesters SET status = 'PLANNING' WHERE status = 'INACTIVE';

-- Add the new constraint with updated values
ALTER TABLE academic_semesters 
ADD CONSTRAINT semesters_status_check CHECK (status IN ('PLANNING', 'REGISTRATION_OPEN', 'ACTIVE', 'COMPLETED', 'CANCELLED'));

-- Add missing columns to academic_semesters table
ALTER TABLE academic_semesters 
ADD COLUMN grade_submission_deadline DATE,
ADD COLUMN is_current BOOLEAN DEFAULT FALSE;