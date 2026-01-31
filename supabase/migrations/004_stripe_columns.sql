-- Migration: Add Stripe columns for payment integration
-- POMO-311: Stripe Setup & Checkout

-- Add Stripe-related columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_lifetime BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_queries_this_month INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_queries_reset_at TIMESTAMPTZ;

-- Index for efficient Stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

-- Index for subscription queries
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_id);

-- Comment the columns for documentation
COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe Customer ID (cus_xxx)';
COMMENT ON COLUMN users.subscription_id IS 'Stripe Subscription ID (sub_xxx) for active subscriptions';
COMMENT ON COLUMN users.is_lifetime IS 'True if user has lifetime access (one-time purchase)';
COMMENT ON COLUMN users.ai_queries_this_month IS 'Number of AI Coach queries used this month';
COMMENT ON COLUMN users.ai_queries_reset_at IS 'When the AI query counter was last reset';
