/**
 * Email Verification Migration
 * 
 * Adds email verification functionality to users table
 * Creates email_verification_tokens table for magic links
 * 
 * Created: 2025-01-27
 */

-- Add activated_at column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;

-- Create email_verification_tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token 
  ON email_verification_tokens(token);
  
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id 
  ON email_verification_tokens(user_id);
  
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at 
  ON email_verification_tokens(expires_at);

-- Add comment for documentation
COMMENT ON TABLE email_verification_tokens IS 'Email verification tokens for user account activation';

-- Clean up expired tokens (optional - can be run periodically)
-- DELETE FROM email_verification_tokens WHERE expires_at < NOW();

