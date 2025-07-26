-- Fix grade_points column type to match entity expectation

ALTER TABLE registrations 
ALTER COLUMN grade_points TYPE DOUBLE PRECISION;