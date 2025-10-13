-- Migration: Add bank_account column to users table
-- Run this if you already have the database set up

-- Add bank_account column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account TEXT;

-- Add comment
COMMENT ON COLUMN users.bank_account IS 'Bank account number for invoice payments';

