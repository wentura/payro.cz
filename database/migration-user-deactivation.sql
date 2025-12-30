/**
 * User Deactivation Migration
 * 
 * Adds user deactivation functionality to users table
 * Allows admin to deactivate/reactivate user accounts
 * 
 * Created: 2025-01-27
 */

-- Add deactivated_at column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_deactivated_at 
  ON users(deactivated_at);

-- Add comment for documentation
COMMENT ON COLUMN users.deactivated_at IS 'Timestamp when user account was deactivated. NULL means account is active.';

