---
type: story
status: backlog
priority: p0
effort: 5
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-29
done_date: null
tags: [infrastructure, database, supabase]
---

# POMO-301: Supabase Schema & RLS

## User Story

> Als **Entwickler**
> möchte ich **das Supabase-Schema mit Row Level Security einrichten**,
> damit **jeder Nutzer nur seine eigenen Daten sehen kann**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

**Vorgänger:** POMO-300 (Clerk Setup)

Supabase ist unser Backend. RLS (Row Level Security) stellt sicher, dass Nutzer nur auf ihre eigenen Daten zugreifen können - auch wenn sie direkt die API anrufen.

**Schema muss mit IndexedDB (POMO-200) übereinstimmen!**

**Reihenfolge:** POMO-300 → **POMO-301** → POMO-302 → ...

## Akzeptanzkriterien

- [ ] **Given** das Schema, **When** deployed, **Then** existieren alle Tables
- [ ] **Given** RLS Policies, **When** ein Nutzer Daten abfragt, **Then** sieht er nur seine eigenen
- [ ] **Given** ein Query ohne Auth, **When** ausgeführt, **Then** werden keine Daten zurückgegeben
- [ ] **Given** Indexes, **When** Queries laufen, **Then** sind sie performant

## Technische Details

### Supabase Setup

1. Projekt erstellen: https://supabase.com
2. **Region: EU (Frankfurt)** für DSGVO
3. Database Password sicher speichern

### Vollständiges Schema

```sql
-- ============================================
-- USERS
-- Jeder Clerk-User bekommt einen Eintrag
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,

  -- Tier: 'plus' (kostenlos) oder 'flow' (bezahlt)
  -- Kein 'free' - ohne Account = kein DB-Eintrag
  tier TEXT DEFAULT 'plus' CHECK (tier IN ('plus', 'flow')),

  -- Trial Management
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,

  -- Subscription Status
  subscription_status TEXT DEFAULT 'none' CHECK (
    subscription_status IN ('none', 'trialing', 'active', 'cancelled', 'past_due')
  ),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SESSIONS (Partikel)
-- Gespiegelt von IndexedDB DBSession
-- ============================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  client_id TEXT NOT NULL,              -- ID aus IndexedDB (für Sync)

  -- Session-Daten (identisch zu DBSession)
  type TEXT NOT NULL CHECK (type IN ('work', 'short_break', 'long_break')),
  duration INTEGER NOT NULL,            -- Sekunden
  completed_at TIMESTAMPTZ NOT NULL,
  task TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  preset_id TEXT,                       -- Welches Preset wurde verwendet
  estimated_pomodoros INTEGER,
  overflow_duration INTEGER,            -- Überlauf-Zeit in Sekunden
  estimated_duration INTEGER,           -- Geschätzte Dauer (für Overflow)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,               -- Soft-Delete für Sync

  -- Client-ID muss pro User einzigartig sein
  UNIQUE(user_id, client_id)
);

-- ============================================
-- PROJECTS
-- Gespiegelt von IndexedDB DBProject
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  client_id TEXT NOT NULL,              -- ID aus IndexedDB (für Sync)

  -- Project-Daten (identisch zu DBProject)
  name TEXT NOT NULL,
  brightness NUMERIC DEFAULT 0.7 CHECK (brightness >= 0.3 AND brightness <= 1.0),
  archived BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,               -- Soft-Delete für Sync

  UNIQUE(user_id, client_id)
);

-- ============================================
-- USER SETTINGS
-- Nur Workflow-Settings werden gesynct
-- ============================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Timer Settings
  work_duration INTEGER DEFAULT 1500,           -- Sekunden
  short_break_duration INTEGER DEFAULT 300,
  long_break_duration INTEGER DEFAULT 900,
  sessions_until_long_break INTEGER DEFAULT 4,

  -- Custom Preset (JSON für Flexibilität)
  custom_preset JSONB,

  -- Workflow Settings
  overflow_enabled BOOLEAN DEFAULT FALSE,
  daily_goal INTEGER DEFAULT 4,
  auto_start_enabled BOOLEAN DEFAULT FALSE,
  auto_start_delay INTEGER DEFAULT 5,           -- Sekunden
  auto_start_mode TEXT DEFAULT 'breaks' CHECK (auto_start_mode IN ('breaks', 'all')),

  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Helper: User-ID aus Clerk JWT extrahieren
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: Prüfen ob JWT vorhanden
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN AS $$
  SELECT auth.jwt() IS NOT NULL
$$ LANGUAGE sql SECURITY DEFINER;

-- Users: Nur eigenen Record sehen/bearbeiten
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (clerk_id = auth.jwt()->>'sub');

-- Sessions: CRUD nur für eigene
CREATE POLICY "Users can CRUD own sessions"
  ON sessions FOR ALL
  USING (user_id = get_user_id());

-- Projects: CRUD nur für eigene
CREATE POLICY "Users can CRUD own projects"
  ON projects FOR ALL
  USING (user_id = get_user_id());

-- Settings: CRUD nur für eigene
CREATE POLICY "Users can CRUD own settings"
  ON user_settings FOR ALL
  USING (user_id = get_user_id());

-- ============================================
-- INDEXES für Performance
-- ============================================

-- Users
CREATE INDEX idx_users_clerk ON users(clerk_id);

-- Sessions
CREATE INDEX idx_sessions_user_completed ON sessions(user_id, completed_at DESC);
CREATE INDEX idx_sessions_user_updated ON sessions(user_id, updated_at DESC);
CREATE INDEX idx_sessions_project ON sessions(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_sessions_client ON sessions(user_id, client_id);

-- Projects
CREATE INDEX idx_projects_user ON projects(user_id, archived);
CREATE INDEX idx_projects_client ON projects(user_id, client_id);

-- ============================================
-- TRIGGERS für updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FUNCTION: User bei erstem Login erstellen
-- ============================================
CREATE OR REPLACE FUNCTION create_user_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (clerk_id, email)
  VALUES (NEW.clerk_id, NEW.email)
  ON CONFLICT (clerk_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Clerk JWT Integration

In Supabase Dashboard → Settings → API → JWT Settings:

```
JWT Secret: (von Clerk kopieren)
JWKS URL: https://<your-clerk-domain>/.well-known/jwks.json
```

### TypeScript Types generieren

```bash
# Nach Schema-Deployment:
npx supabase gen types typescript --project-id <project-id> > src/lib/supabase/types.ts
```

### Supabase Client Setup

```typescript
// src/lib/supabase/client.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase Client mit Clerk JWT
 */
export function createSupabaseClient(token: string | null) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });
}

/**
 * Hook für authentifizierten Supabase Client
 */
export function useSupabase() {
  const getToken = useSupabaseToken();
  const [client, setClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    getToken().then((token) => {
      if (token) {
        setClient(createSupabaseClient(token));
      }
    });
  }, [getToken]);

  return client;
}
```

## Testing

### Manuell zu testen

- [ ] Tables existieren in Supabase Dashboard
- [ ] RLS ist aktiv (grünes Schloss-Icon)
- [ ] Query ohne Auth → leere Response
- [ ] Query mit Auth → nur eigene Daten
- [ ] User A kann User B Daten nicht sehen

### SQL Test-Queries

```sql
-- Als authentifizierter User (mit JWT):
SELECT * FROM sessions;  -- Nur eigene Sessions

-- Versuch fremde Daten zu lesen (sollte 0 Rows zurückgeben):
SELECT * FROM sessions WHERE user_id = 'anderer-user-id';

-- Insert mit falscher user_id (sollte fehlschlagen):
INSERT INTO sessions (user_id, client_id, type, duration, completed_at)
VALUES ('fremde-id', 'test', 'work', 1500, NOW());
```

### Automatisierte Tests

```typescript
describe('Supabase RLS', () => {
  it('prevents access without auth', async () => {
    const anonClient = createSupabaseClient(null);

    const { data, error } = await anonClient
      .from('sessions')
      .select('*');

    expect(data).toEqual([]);
  });

  it('allows access to own data only', async () => {
    const userAClient = createSupabaseClient(userAToken);
    const userBClient = createSupabaseClient(userBToken);

    // User A creates session
    await userAClient.from('sessions').insert({
      client_id: 'test-1',
      type: 'work',
      duration: 1500,
      completed_at: new Date().toISOString(),
    });

    // User B should not see it
    const { data } = await userBClient
      .from('sessions')
      .select('*')
      .eq('client_id', 'test-1');

    expect(data).toEqual([]);
  });
});
```

## Definition of Done

- [ ] Supabase Projekt erstellt (EU Region)
- [ ] Schema deployed (alle Tables)
- [ ] RLS Policies aktiv und getestet
- [ ] Indexes angelegt
- [ ] Clerk JWT Integration funktioniert
- [ ] TypeScript Types generiert
- [ ] Supabase Client Hook erstellt

## Notizen

**Schema-Alignment mit IndexedDB:**
- `client_id` in Supabase = `id` in IndexedDB
- Supabase `id` ist server-generierte UUID
- Mapping: IndexedDB.id ↔ Supabase.client_id

**Warum JSONB für custom_preset?**
- Flexibel für zukünftige Preset-Erweiterungen
- Keine Schema-Migration bei neuen Feldern

**Soft-Delete:**
- `deleted_at` statt echtem DELETE
- Ermöglicht Sync von Löschungen
- Cleanup-Job kann später alte Daten entfernen

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
