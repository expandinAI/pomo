-- Migration: Add Workflow Settings Sync Columns (POMO-308)
-- Adds columns for syncing workflow settings between devices

-- Add overflow_enabled column
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS overflow_enabled BOOLEAN DEFAULT TRUE;

-- Add daily_goal column (1-9 particles, NULL = no goal)
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT NULL
    CHECK (daily_goal IS NULL OR (daily_goal >= 1 AND daily_goal <= 9));

-- Add auto_start_delay column (seconds: 3, 5, or 10)
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS auto_start_delay INTEGER DEFAULT 5
    CHECK (auto_start_delay IN (3, 5, 10));

-- Add auto_start_mode column ('all' or 'breaks-only')
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS auto_start_mode TEXT DEFAULT 'all'
    CHECK (auto_start_mode IN ('all', 'breaks-only'));

-- Note: custom_preset is stored in settings_json (already exists)
-- Example: {"customPreset": {"name": "Custom", "workDuration": 1500, ...}}

-- Add comment
COMMENT ON COLUMN user_settings.overflow_enabled IS 'Whether timer continues past 0:00';
COMMENT ON COLUMN user_settings.daily_goal IS 'Daily particle goal (1-9), NULL = no goal';
COMMENT ON COLUMN user_settings.auto_start_delay IS 'Seconds before auto-start (3, 5, or 10)';
COMMENT ON COLUMN user_settings.auto_start_mode IS 'Auto-start mode: all or breaks-only';
