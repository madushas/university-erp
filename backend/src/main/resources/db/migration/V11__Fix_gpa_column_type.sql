-- Fix gpa column type in users table to match entity expectation

ALTER TABLE users 
ALTER COLUMN gpa TYPE DOUBLE PRECISION;