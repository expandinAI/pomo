-- Particle Supabase Schema
-- Deploy this in Supabase Dashboard → SQL Editor

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Get the current user's Clerk ID from the JWT
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is authenticated
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_id() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Tables
-- ============================================================================

-- Users table: Maps Clerk users to Supabase, stores subscription info
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'lifetime')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing')),
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects table (must be created before sessions due to foreign key)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  local_id TEXT NOT NULL, -- Original client-side ID for sync
  name TEXT NOT NULL,
  color TEXT, -- Hex color
  icon TEXT, -- Emoji or icon name
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  deleted_at TIMESTAMPTZ, -- Soft delete for sync
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint for sync: one local_id per user
  UNIQUE(user_id, local_id)
);

-- Sessions table: Particles (focus sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  local_id TEXT NOT NULL, -- Original client-side ID for sync
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('work', 'break', 'longBreak')),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  task TEXT,
  is_overflow BOOLEAN DEFAULT FALSE,
  overflow_seconds INTEGER DEFAULT 0,
  deleted_at TIMESTAMPTZ, -- Soft delete for sync
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint for sync: one local_id per user
  UNIQUE(user_id, local_id)
);

-- User Settings table: Workflow preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  work_duration_seconds INTEGER DEFAULT 1500, -- 25 minutes
  break_duration_seconds INTEGER DEFAULT 300, -- 5 minutes
  long_break_duration_seconds INTEGER DEFAULT 900, -- 15 minutes
  sessions_until_long_break INTEGER DEFAULT 4,
  auto_start_breaks BOOLEAN DEFAULT FALSE,
  auto_start_work BOOLEAN DEFAULT FALSE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  notification_enabled BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  keyboard_hints_visible BOOLEAN DEFAULT TRUE,
  settings_json JSONB DEFAULT '{}', -- Extensible settings
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_project_id ON sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_started ON sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions(updated_at);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);

-- User Settings
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- ============================================================================
-- Updated At Triggers
-- ============================================================================

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users policies: Users can only access their own record
CREATE POLICY "Users can view own record"
  ON users FOR SELECT
  USING (clerk_id = get_user_id());

CREATE POLICY "Users can update own record"
  ON users FOR UPDATE
  USING (clerk_id = get_user_id());

-- Note: INSERT for users is handled by service role during user creation

-- Sessions policies: Users can only access their own sessions
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = get_user_id()));

CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = get_user_id()));

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = get_user_id()));

CREATE POLICY "Users can delete own sessions"
  ON sessions FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = get_user_id()));

-- Projects policies: Users can only access their own projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = get_user_id()));

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = get_user_id()));

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = get_user_id()));

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = get_user_id()));

-- User Settings policies: Users can only access their own settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = get_user_id()));

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = get_user_id()));

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = get_user_id()));

-- ============================================================================
-- Service Role Policies (for user creation)
-- ============================================================================

-- Allow service role to insert users (used during signup)
CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE users IS 'Clerk user mapping with subscription information';
COMMENT ON TABLE sessions IS 'Focus sessions (Particles) - synced from client';
COMMENT ON TABLE projects IS 'User projects - synced from client';
COMMENT ON TABLE user_settings IS 'User workflow preferences - synced from client';

COMMENT ON FUNCTION get_user_id() IS 'Extracts Clerk user ID from JWT claims';
COMMENT ON FUNCTION is_authenticated() IS 'Returns true if user is authenticated';
