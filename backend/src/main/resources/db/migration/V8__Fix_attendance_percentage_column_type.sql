-- Fix attendance_percentage column type to match entity expectation

ALTER TABLE registrations 
ALTER COLUMN attendance_percentage TYPE DOUBLE PRECISION;