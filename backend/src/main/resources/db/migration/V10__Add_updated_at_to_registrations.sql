-- Add missing updated_at column to registrations table

ALTER TABLE registrations 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;