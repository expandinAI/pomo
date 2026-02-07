-- Migration: Intentions Cloud Sync (POMO-390)
-- Adds intentions table for daily intention sync between devices

-- ============================================================================
-- Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS intentions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  local_id TEXT NOT NULL,
  date DATE NOT NULL,
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'partial', 'deferred', 'skipped')),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  deferred_from DATE,
  particle_goal SMALLINT CHECK (particle_goal IS NULL OR (particle_goal >= 1 AND particle_goal <= 9)),
  completed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint for sync: one local_id per user
  UNIQUE(user_id, local_id)
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_intentions_user_id ON intentions(user_id);
CREATE INDEX IF NOT EXISTS idx_intentions_user_updated ON intentions(user_id, updated_at);
CREATE INDEX IF NOT EXISTS idx_intentions_user_date ON intentions(user_id, date);

-- ============================================================================
-- Updated At Trigger
-- ============================================================================

DROP TRIGGER IF EXISTS update_intentions_updated_at ON intentions;
CREATE TRIGGER update_intentions_updated_at
  BEFORE UPDATE ON intentions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE intentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own intentions"
  ON intentions FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = get_user_id()));

CREATE POLICY "Users can insert own intentions"
  ON intentions FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = get_user_id()));

CREATE POLICY "Users can update own intentions"
  ON intentions FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = get_user_id()));

CREATE POLICY "Users can delete own intentions"
  ON intentions FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = get_user_id()));

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE intentions IS 'Daily intentions - synced from client (POMO-390)';
COMMENT ON COLUMN intentions.local_id IS 'Original client-side ID for sync';
COMMENT ON COLUMN intentions.date IS 'Date the intention is for (YYYY-MM-DD)';
COMMENT ON COLUMN intentions.status IS 'active, completed, partial, deferred, or skipped';
COMMENT ON COLUMN intentions.deferred_from IS 'Original date if deferred from another day';
COMMENT ON COLUMN intentions.particle_goal IS 'Daily particle target (1-9)';
COMMENT ON COLUMN intentions.deleted_at IS 'Soft delete timestamp for sync';
