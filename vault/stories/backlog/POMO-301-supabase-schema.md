---
type: story
status: backlog
priority: p0
effort: 5
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-28
done_date: null
tags: [infrastructure, database, supabase]
---

# Supabase Schema & RLS

## User Story

> Als **Entwickler**
> möchte ich **das Supabase-Schema mit Row Level Security einrichten**,
> damit **jeder Nutzer nur seine eigenen Daten sehen kann**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

Supabase ist unser Backend. RLS (Row Level Security) stellt sicher, dass Nutzer nur auf ihre eigenen Daten zugreifen können - auch wenn sie direkt die API anrufen.

## Akzeptanzkriterien

- [ ] **Given** das Schema, **When** deployed, **Then** existieren alle Tables
- [ ] **Given** RLS Policies, **When** ein Nutzer Daten abfragt, **Then** sieht er nur seine eigenen
- [ ] **Given** Indexes, **When** Queries laufen, **Then** sind sie performant

## Technische Details

### Supabase Setup

1. Projekt erstellen: https://supabase.com
2. Region: EU (Frankfurt) für DSGVO
3. Database Password sicher speichern

### Schema SQL

```sql
-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  tier TEXT DEFAULT 'plus' CHECK (tier IN ('plus', 'flow')),
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  subscription_status TEXT DEFAULT 'none' CHECK (
    subscription_status IN ('none', 'trialing', 'active', 'cancelled', 'past_due')
  ),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SESSIONS (Partikel)
-- ============================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  client_id TEXT NOT NULL,

  type TEXT NOT NULL CHECK (type IN ('work', 'short_break', 'long_break')),
  duration INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  task TEXT,
  estimated_pomodoros INTEGER,
  preset_id TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  overflow_duration INTEGER,
  estimated_duration INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(user_id, client_id)
);

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  client_id TEXT NOT NULL,

  name TEXT NOT NULL,
  brightness NUMERIC DEFAULT 0.7 CHECK (brightness >= 0.3 AND brightness <= 1.0),
  archived BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(user_id, client_id)
);

-- ============================================
-- USER SETTINGS
-- ============================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,

  work_duration INTEGER DEFAULT 1500,
  short_break_duration INTEGER DEFAULT 300,
  long_break_duration INTEGER DEFAULT 900,
  sessions_until_long_break INTEGER DEFAULT 4,

  auto_start_breaks BOOLEAN DEFAULT FALSE,
  auto_start_pomodoros BOOLEAN DEFAULT FALSE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  notification_enabled BOOLEAN DEFAULT TRUE,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to get user_id from Clerk JWT
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
$$ LANGUAGE sql SECURITY DEFINER;

-- Users: Can only see/edit own record
CREATE POLICY "Users own their data" ON users
  FOR ALL USING (clerk_id = auth.jwt()->>'sub');

-- Sessions: Users can only CRUD their own
CREATE POLICY "Users own their sessions" ON sessions
  FOR ALL USING (user_id = get_user_id());

-- Projects: Users can only CRUD their own
CREATE POLICY "Users own their projects" ON projects
  FOR ALL USING (user_id = get_user_id());

-- Settings: Users can only CRUD their own
CREATE POLICY "Users own their settings" ON user_settings
  FOR ALL USING (user_id = get_user_id());

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_users_clerk ON users(clerk_id);
CREATE INDEX idx_sessions_user_completed ON sessions(user_id, completed_at DESC);
CREATE INDEX idx_sessions_user_updated ON sessions(user_id, updated_at DESC);
CREATE INDEX idx_sessions_project ON sessions(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_projects_user ON projects(user_id, archived);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Clerk JWT Integration

In Supabase Dashboard → Settings → API → JWT Settings:
- JWKS URL: `https://<your-clerk-domain>/.well-known/jwks.json`

### TypeScript Types generieren

```bash
npx supabase gen types typescript --project-id <project-id> > src/lib/supabase/types.ts
```

## Testing

### Manuell zu testen
- [ ] Tables existieren in Supabase Dashboard
- [ ] RLS ist aktiv (grünes Schloss-Icon)
- [ ] Query ohne Auth → keine Daten
- [ ] Query mit Auth → nur eigene Daten

### Automatisierte Tests
- [ ] Integration Test: User A kann User B Daten nicht sehen

## Definition of Done

- [ ] Supabase Projekt erstellt
- [ ] Schema deployed
- [ ] RLS Policies aktiv
- [ ] Indexes angelegt
- [ ] TypeScript Types generiert
- [ ] Clerk JWT Integration getestet
