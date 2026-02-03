/**
 * User Deletion Migration
 *
 * Adds deletion lifecycle timestamps to users table
 */

ALTER TABLE users
ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_deletion_requested_at
  ON users(deletion_requested_at);

CREATE INDEX IF NOT EXISTS idx_users_deleted_at
  ON users(deleted_at);

COMMENT ON COLUMN users.deletion_requested_at IS 'Timestamp when user requested account deletion.';
COMMENT ON COLUMN users.deleted_at IS 'Timestamp when user data was anonymized or deleted.';
