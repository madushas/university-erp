-- Fix duplicate student accounts
-- First, identify and remove duplicate student accounts, keeping the one with the lowest ID

-- Create a temporary table to identify duplicates
CREATE TEMPORARY TABLE duplicate_accounts AS
SELECT student_id, MIN(id) as keep_id
FROM student_accounts 
GROUP BY student_id 
HAVING COUNT(*) > 1;

-- Update foreign key references to point to the account we're keeping (only for existing tables)
-- Update financial_aid_disbursements if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'financial_aid_disbursements') THEN
        UPDATE financial_aid_disbursements 
        SET student_account_id = da.keep_id
        FROM duplicate_accounts da
        WHERE student_account_id IN (
            SELECT sa.id 
            FROM student_accounts sa
            WHERE sa.student_id = da.student_id AND sa.id != da.keep_id
        );
    END IF;
END $$;

-- Update billing_statements if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'billing_statements') THEN
        UPDATE billing_statements 
        SET student_account_id = da.keep_id
        FROM duplicate_accounts da
        WHERE student_account_id IN (
            SELECT sa.id 
            FROM student_accounts sa
            WHERE sa.student_id = da.student_id AND sa.id != da.keep_id
        );
    END IF;
END $$;

-- Update payments if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
        UPDATE payments 
        SET student_account_id = da.keep_id
        FROM duplicate_accounts da
        WHERE student_account_id IN (
            SELECT sa.id 
            FROM student_accounts sa
            WHERE sa.student_id = da.student_id AND sa.id != da.keep_id
        );
    END IF;
END $$;

-- Now delete duplicate student accounts (keep the one with lowest ID)
DELETE FROM student_accounts 
WHERE id IN (
    SELECT sa.id 
    FROM student_accounts sa
    INNER JOIN duplicate_accounts da ON sa.student_id = da.student_id
    WHERE sa.id != da.keep_id
);

-- Add unique constraint to prevent future duplicates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'uk_student_accounts_student_id'
    ) THEN
        ALTER TABLE student_accounts 
        ADD CONSTRAINT uk_student_accounts_student_id UNIQUE (student_id);
    END IF;
END $$;