-- Migration: Add trial columns to users table
-- POMO-307: Trial Management for Flow tier

-- Add 'flow' to the tier check constraint
-- Need to drop and recreate the constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tier_check;
ALTER TABLE users ADD CONSTRAINT users_tier_check
  CHECK (tier IN ('free', 'flow', 'pro', 'lifetime'));

-- Add trial tracking columns
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Create index for efficient trial expiration queries
-- Only indexes users currently in trial status
CREATE INDEX IF NOT EXISTS idx_users_trial_ends_at
  ON users(trial_ends_at)
  WHERE subscription_status = 'trialing';

-- Add comments for documentation
COMMENT ON COLUMN users.trial_started_at IS 'When the Flow trial was started (null if never trialed)';
COMMENT ON COLUMN users.trial_ends_at IS 'When the Flow trial expires (null if never trialed or converted to paid)';
