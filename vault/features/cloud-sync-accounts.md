---
type: feature
status: draft
priority: p0
effort: xl
business_value: critical
origin: "Architecture Decision: Multi-Platform Sync"
decisions:
  - "[[decisions/ADR-001-multi-platform-architecture]]"
  - "[[decisions/ADR-002-schema-evolution]]"
  - "[[decisions/ADR-003-sync-strategy]]"
strategy:
  - "[[strategy/tier-feature-strategy]]"
stories:
  - "[[stories/backlog/POMO-300-clerk-setup]]"
  - "[[stories/backlog/POMO-301-supabase-schema]]"
  - "[[stories/backlog/POMO-302-auth-ui]]"
  - "[[stories/backlog/POMO-303-account-tiers]]"
  - "[[stories/backlog/POMO-304-upgrade-flow]]"
  - "[[stories/backlog/POMO-305-sync-service]]"
  - "[[stories/backlog/POMO-306-conflict-resolution]]"
  - "[[stories/backlog/POMO-307-trial-management]]"
  - "[[stories/backlog/POMO-308-settings-sync]]"
created: 2026-01-28
updated: 2026-01-30
tags: [infrastructure, sync, accounts, auth, supabase, clerk, p0, monetization]
---

# Cloud Sync & Accounts

## Zusammenfassung

> Account-System mit drei Tiers (Lokal, Particle, Particle Flow) und Near-Time Cloud-Sync über Supabase. Nutzer können ohne Account lokal arbeiten, später upgraden und ihre Daten nahtlos synchronisieren.

**Wichtig:** Die vollständige Feature-Strategie und Tier-Aufteilung ist dokumentiert in [[strategy/tier-feature-strategy]] – das ist die Single Source of Truth für alle Feature-Entscheidungen.

## Kontext & Problem

### Ausgangssituation

Particle funktioniert aktuell komplett lokal. Nutzer können:
- Keine Daten zwischen Geräten synchronisieren
- Keine Backups in der Cloud haben
- Die App nicht auf der geplanten Mac/iOS App nutzen

Geplante Account-Tiers:

| Tier | Account | Speicherung | Preis |
|------|---------|-------------|-------|
| **Lokal** | Nein | Nur lokal | Kostenlos |
| **Particle** | Ja (kostenlos) | Lokal + Sync | Kostenlos |
| **Particle Flow** | Ja (bezahlt) | Lokal + Sync + Premium | 9€/Monat |

> Für die vollständige Feature-Matrix siehe [[strategy/tier-feature-strategy#Feature-Matrix]]

### Betroffene Nutzer

- **Alle Nutzer:** Wollen Daten sicher in der Cloud
- **Multi-Device Nutzer:** Brauchen Sync zwischen Web, Mac, iOS
- **Power User:** Wollen Premium-Features (Particle Flow)
- **Datenschutz-Bewusste:** Wollen auch ohne Account arbeiten können

### Auswirkung

Ohne dieses Feature:
- Keine Monetarisierung möglich
- Keine Multi-Device Experience
- Kein Wachstum über Web hinaus (Mac App, iOS App)
- Datenverlust bei Browser-Clear

## Ziele

### Muss erreicht werden

- [ ] Clerk-Integration für Auth (Apple, Google, Email)
- [ ] Supabase-Backend mit Row Level Security
- [ ] Drei Account-Tiers: Lokal, Particle, Flow
- [ ] Nahtloser Upgrade-Flow: Lokal → Particle (lokale Daten hochladen)
- [ ] Near-Time Sync (Event-basiert + periodisch)
- [ ] 14-Tage Trial für Particle Flow
- [ ] Offline-First: App funktioniert immer, Sync im Hintergrund

### Sollte erreicht werden

- [ ] Apple Sign-In als primäre Option (für spätere iOS App)
- [ ] Settings-Sync (Timer-Einstellungen über Geräte)
- [ ] Sync-Status Indicator im UI
- [ ] Account-Management (Tier anzeigen, Upgrade-Option)

### Nicht im Scope

- Payment-Integration (Stripe) – separates Feature
- Native Mac/iOS App Implementation
- Team-Features / Shared Workspaces
- Data Export API
- GDPR Data Deletion UI (kommt später)

## Lösung

### Übersicht

**Tech Stack:**
- **Clerk:** Auth Provider (Apple, Google, Email Magic Link)
- **Supabase:** PostgreSQL + Row Level Security + Edge Functions
- **Sync:** Event-basiert (bei Änderungen) + Periodic Pull (alle 30s)

**Architektur:**

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 IndexedDB (Local)                    │    │
│  │   Sessions, Projects, Tasks, Settings, Queue        │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  Sync Service                        │    │
│  │   - Push: Bei Änderungen sofort                     │    │
│  │   - Pull: Alle 30s + bei App-Focus                  │    │
│  │   - Conflict Resolution: Last-Write-Wins            │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
         ┌──────────────────┴──────────────────┐
         │                                      │
         ▼                                      ▼
┌─────────────────┐                   ┌─────────────────┐
│      Clerk      │                   │    Supabase     │
│   (Auth Only)   │                   │   (Database)    │
│                 │                   │                 │
│ - Apple Sign-In │                   │ - PostgreSQL    │
│ - Google OAuth  │                   │ - RLS Policies  │
│ - Email Magic   │                   │ - Edge Funcs    │
│ - JWT Tokens    │                   │                 │
└─────────────────┘                   └─────────────────┘
```

### Account Tiers im Detail

> **Vollständige Feature-Matrix:** Siehe [[strategy/tier-feature-strategy#Feature-Matrix]] für die aktuelle Aufteilung aller Features.

#### Lokal (Kein Account)

- Kein Account erforderlich
- Daten nur lokal im Browser
- Timer, Projekte (max 5 aktive), Basic Stats
- History: 30 Tage

#### Particle (Kostenloser Account)

- Kostenloser Account mit Cloud-Sync
- DB-Wert: `'free'`
- Daten lokal + Cloud Backup
- Projekte: max 5 aktive
- History: Unbegrenzt

#### Particle Flow (Premium)

- Bezahlter Account (9€/Monat)
- DB-Wert: `'flow'`
- Alle Features aus Particle +
- Unbegrenzte Projekte
- Year View, Advanced Stats
- Alle Ambient Sounds & Themes
- 14-Tage Trial ohne Kreditkarte

### Supabase Schema

```sql
-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'flow')),
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
  client_id TEXT NOT NULL,              -- Lokale ID vom Client

  -- Session Data
  type TEXT NOT NULL CHECK (type IN ('work', 'short_break', 'long_break')),
  duration INTEGER NOT NULL,            -- Sekunden
  completed_at TIMESTAMPTZ NOT NULL,
  task TEXT,
  estimated_pomodoros INTEGER,
  preset_id TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  overflow_duration INTEGER,
  estimated_duration INTEGER,

  -- Sync Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,               -- Soft Delete

  UNIQUE(user_id, client_id)
);

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  client_id TEXT NOT NULL,

  -- Project Data
  name TEXT NOT NULL,
  brightness NUMERIC DEFAULT 0.7 CHECK (brightness >= 0.3 AND brightness <= 1.0),
  archived BOOLEAN DEFAULT FALSE,

  -- Sync Metadata
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

  -- Timer Settings
  work_duration INTEGER DEFAULT 1500,           -- 25 min
  short_break_duration INTEGER DEFAULT 300,     -- 5 min
  long_break_duration INTEGER DEFAULT 900,      -- 15 min
  sessions_until_long_break INTEGER DEFAULT 4,

  -- UI Settings
  auto_start_breaks BOOLEAN DEFAULT FALSE,
  auto_start_pomodoros BOOLEAN DEFAULT FALSE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  notification_enabled BOOLEAN DEFAULT TRUE,

  -- Sync Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own data
CREATE POLICY "Users own their data" ON users
  FOR ALL USING (clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Users own their sessions" ON sessions
  FOR ALL USING (user_id = (
    SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
  ));

CREATE POLICY "Users own their projects" ON projects
  FOR ALL USING (user_id = (
    SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
  ));

CREATE POLICY "Users own their settings" ON user_settings
  FOR ALL USING (user_id = (
    SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
  ));

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_sessions_user_completed ON sessions(user_id, completed_at DESC);
CREATE INDEX idx_sessions_project ON sessions(project_id);
CREATE INDEX idx_sessions_sync ON sessions(user_id, updated_at DESC);
CREATE INDEX idx_projects_user ON projects(user_id, archived);
```

### User Flows

#### Flow 1: Erster Start (Local User)

```
App opens
    │
    ▼
┌─────────────────────────────────────────┐
│                                         │
│              Particle                   │
│                                         │
│         Focus. Collect. Grow.           │
│                                         │
│                                         │
│         [Get Started]                   │
│                                         │
│   ─────────────────────────────────────│
│                                         │
│   Already have an account?  [Sign In]   │
│                                         │
└─────────────────────────────────────────┘
```

→ Click "Get Started" → App startet im Local-Modus (kein Account nötig)
→ Click "Sign In" → Auth Flow (siehe Flow 2)

#### Flow 2: Account erstellen / Anmelden (→ Particle)

```
┌─────────────────────────────────────────┐
│                                         │
│         Sign in to Particle             │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │      Continue with Apple        │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │      Continue with Google       │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ─────────────────────────────────────│
│                                         │
│   Email address                         │
│   ┌─────────────────────────────────┐   │
│   │ name@example.com                │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │         Send Magic Link         │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Nach erfolgreicher Auth:**

1. Clerk gibt JWT zurück
2. Supabase User wird erstellt (oder gefunden)
3. Wenn lokale Daten vorhanden → Upgrade Flow (siehe Flow 3)
4. Wenn keine lokalen Daten → Normal starten

#### Flow 3: Upgrade Lokal → Particle (Daten hochladen)

```
┌─────────────────────────────────────────────┐
│                                             │
│         Welcome to Particle!                │
│                                             │
│   You have local data we can                │
│   synchronize:                              │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │  127 Particles                      │   │
│   │  12 Projects                        │   │
│   │  Your settings                      │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   These will be securely stored in the      │
│   cloud and available on all your           │
│   devices.                                  │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │         Sync Now                    │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   [Later]                                   │
│                                             │
└─────────────────────────────────────────────┘
```

**Sync Process:**

```
Syncing...
    │
    ▼
┌─────────────────────────────────────────────┐
│                                             │
│         Syncing your data                   │
│                                             │
│         ████████████░░░░░░ 65%              │
│                                             │
│         82 / 127 Particles                  │
│                                             │
└─────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────┐
│                                             │
│         ✓ Sync complete                     │
│                                             │
│         127 Particles synced                │
│         12 Projects synced                  │
│                                             │
│         Your data is now safely             │
│         stored in the cloud.                │
│                                             │
│         ┌─────────────────────────────┐     │
│         │          Continue           │     │
│         └─────────────────────────────┘     │
│                                             │
└─────────────────────────────────────────────┘
```

#### Flow 4: Start Particle Flow Trial

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              Particle Flow                      │
│                                                 │
│     14 days free access to all premium features │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │  ✓ Year View                            │   │
│   │  ✓ Advanced Statistics                  │   │
│   │  ✓ All Themes                           │   │
│   │  ✓ Unlimited Presets                    │   │
│   │  ✓ Priority Support                     │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   No credit card required.                      │
│   No automatic renewal.                         │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │       Start 14-Day Trial                │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   [Maybe Later]                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

**After Trial Ends:**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         Your trial has ended                    │
│                                                 │
│   Over the past 14 days with Particle Flow      │
│   you have:                                     │
│                                                 │
│   • Collected 89 Particles                      │
│   • Focused for 37 hours                        │
│   • Opened Year View 12 times                   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │       Keep Particle Flow                │   │
│   │       €9/month or €79/year              │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   [Continue with Particle]                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Flow 5: Laufender Sync (Near-Time)

```
Partikel abgeschlossen
    │
    ├── 1. Lokal speichern (IndexedDB)
    │       ↓ sofort
    │
    ├── 2. Sync Queue hinzufügen
    │       ↓ sofort
    │
    └── 3. Push zu Supabase (async)
            │
            ├── Erfolg → syncStatus = 'synced'
            │
            └── Fehler → Retry später

Alle 30 Sekunden (oder bei App-Focus):
    │
    ├── GET /sync?since=<lastSyncTimestamp>
    │
    ├── Neue/geänderte Daten von Server holen
    │
    └── Lokale DB aktualisieren
```

### Sync Service Implementation

```typescript
// src/lib/sync/sync-service.ts

export class SyncService {
  private syncInterval: number | null = null;
  private lastSyncAt: string | null = null;

  constructor(
    private supabase: SupabaseClient,
    private db: ParticleDB
  ) {}

  async start(): Promise<void> {
    // Initial sync
    await this.pull();

    // Periodic sync (every 30 seconds)
    this.syncInterval = setInterval(() => this.pull(), 30000);

    // Sync on window focus
    window.addEventListener('focus', () => this.pull());
  }

  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  // Push local changes to server
  async push(entity: SyncableEntity, type: EntityType): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(type)
        .upsert({
          client_id: entity.id,
          ...this.toServerFormat(entity),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,client_id'
        });

      if (error) throw error;

      // Mark as synced locally
      await this.db[type].update(entity.id, {
        syncStatus: 'synced',
        syncedAt: new Date().toISOString(),
      });
    } catch (e) {
      // Queue for retry
      await this.db.syncQueue.add({
        id: generateId(),
        entityType: type,
        entityId: entity.id,
        operation: 'upsert',
        payload: entity,
        createdAt: new Date().toISOString(),
        retryCount: 0,
      });
    }
  }

  // Pull remote changes
  async pull(): Promise<SyncResult> {
    const result: SyncResult = { sessions: 0, projects: 0 };

    // Get changes since last sync
    const since = this.lastSyncAt || '1970-01-01T00:00:00Z';

    // Fetch sessions
    const { data: sessions } = await this.supabase
      .from('sessions')
      .select('*')
      .gt('updated_at', since)
      .is('deleted_at', null);

    for (const session of sessions || []) {
      await this.mergeSession(session);
      result.sessions++;
    }

    // Fetch projects
    const { data: projects } = await this.supabase
      .from('projects')
      .select('*')
      .gt('updated_at', since)
      .is('deleted_at', null);

    for (const project of projects || []) {
      await this.mergeProject(project);
      result.projects++;
    }

    this.lastSyncAt = new Date().toISOString();
    return result;
  }

  private async mergeSession(remote: ServerSession): Promise<void> {
    const local = await this.db.sessions
      .where('id')
      .equals(remote.client_id)
      .first();

    if (!local) {
      // New from server
      await this.db.sessions.add(this.toLocalFormat(remote));
    } else if (new Date(remote.updated_at) > new Date(local.localUpdatedAt)) {
      // Server is newer
      await this.db.sessions.update(local.id, this.toLocalFormat(remote));
    }
    // Else: local is newer, will be pushed on next push cycle
  }
}
```

### Technische Überlegungen

**Clerk Setup:**

```typescript
// src/lib/auth/clerk.ts
import { ClerkProvider, useAuth } from '@clerk/nextjs';

export const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  afterSignInUrl: '/',
  afterSignUpUrl: '/welcome',
};

// Hook for checking tier
export function useUserTier(): Tier {
  const { user } = useAuth();

  if (!user) return 'local';

  // Tier is stored in Supabase, cached in Clerk public metadata
  return (user.publicMetadata.tier as Tier) || 'free';
}
```

**Supabase + Clerk Integration:**

```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';

export function useSupabase() {
  const { getToken } = useAuth();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return getToken({ template: 'supabase' });
      },
    }
  );

  return supabase;
}
```

**Komponenten-Struktur:**

```
src/
├── lib/
│   ├── auth/
│   │   ├── clerk.ts              # Clerk Config
│   │   ├── hooks.ts              # useUser, useUserTier
│   │   └── guards.tsx            # AuthGuard, TierGuard
│   ├── supabase/
│   │   ├── client.ts             # Supabase Client Setup
│   │   ├── schema.ts             # TypeScript Types from Schema
│   │   └── queries.ts            # Typed Queries
│   └── sync/
│       ├── sync-service.ts       # Sync Logic
│       ├── conflict-resolution.ts # Last-Write-Wins
│       └── queue-processor.ts    # Offline Queue
├── components/
│   ├── auth/
│   │   ├── SignInButton.tsx
│   │   ├── SignUpForm.tsx
│   │   ├── AccountMenu.tsx
│   │   └── TierBadge.tsx
│   └── sync/
│       ├── SyncIndicator.tsx     # Sync-Status im UI
│       └── UpgradeModal.tsx      # Free → Plus Upgrade
```

## Akzeptanzkriterien

### Must Have

- [ ] Clerk eingerichtet mit Apple Sign-In, Google, Email Magic Link
- [ ] Supabase Schema deployed mit RLS
- [ ] Clerk ↔ Supabase JWT Integration funktioniert
- [ ] Lokal User kann ohne Account arbeiten
- [ ] Account-Erstellung führt zu Particle (free tier)
- [ ] Lokale Daten werden bei Upgrade hochgeladen
- [ ] Near-Time Sync: Push bei Änderungen, Pull alle 30s
- [ ] Offline-First: App funktioniert ohne Verbindung
- [ ] Sync Queue verarbeitet pending Changes
- [ ] 14-Tage Trial für Particle Flow
- [ ] Tier-basierte Feature-Flags funktionieren

### Nice to Have

- [ ] Sync-Status Indicator im Header
- [ ] "Sync Now" Button für manuellen Sync
- [ ] Detailed Sync History (Debug-Zwecke)
- [ ] Graceful Degradation bei Supabase-Ausfall

## Edge Cases & Fehlerbehandlung

| Szenario | Erwartetes Verhalten |
|----------|---------------------|
| Clerk nicht erreichbar | Login fehlschlägt, lokale Nutzung weiter möglich |
| Supabase nicht erreichbar | Lokale Änderungen queuen, später syncen |
| Conflict (gleiches Entity auf 2 Geräten geändert) | Last-Write-Wins basierend auf `updatedAt` |
| Trial abgelaufen | Fallback auf Particle (free), Premium-Features disabled |
| User löscht Account | Supabase-Daten löschen, lokal behalten (mit Warning) |
| Quota exceeded | Warning anzeigen, älteste Sessions vorschlagen |
| Token expired | Silent refresh via Clerk, nahtlos |
| Migration-Fehler beim Upgrade | Retry-Option, Support-Link |

## Metriken & Erfolgsmessung

- **Primäre Metrik:** 30% der aktiven User haben Account (nach 4 Wochen)
- **Sekundäre Metrik:** Trial → Paid Conversion > 10%
- **Sekundäre Metrik:** Sync-Fehlerrate < 0.5%
- **Messzeitraum:** 4 Wochen nach Launch

## Risiken & Abhängigkeiten

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Clerk-Ausfall | niedrig | hoch | Lokale Nutzung weiter möglich |
| Supabase-Ausfall | niedrig | mittel | Offline-Queue überbrückt |
| DSGVO-Anforderungen | mittel | hoch | Data Export/Delete Features planen |
| Sync-Konflikte häufen sich | niedrig | mittel | Conflict UI für Edge Cases |
| Performance bei vielen Usern | mittel | mittel | Supabase Indexes optimieren |

**Abhängigkeiten:**

- [ ] **Local-First Persistence** (POMO-200) MUSS erst fertig sein
- [ ] Clerk Account benötigt (kostenlos für <10k MAU)
- [ ] Supabase Account benötigt (kostenlos für <500MB)

## Offene Fragen

- [ ] Welche Premium-Features genau in Particle Flow? → **Wird separat definiert**
- [ ] Preis für Particle Flow? → **Vorschlag: 9€/Monat oder 79€/Jahr**
- [ ] DSGVO: Wo werden Daten gehostet? → **Vorschlag: Supabase EU (Frankfurt)**
- [ ] Max. Geräte pro Account? → **Vorschlag: Unbegrenzt**

## Stories

| Story | Titel | Effort | Prio |
|-------|-------|--------|------|
| [[stories/backlog/POMO-300-clerk-setup]] | Clerk Integration Setup | 3 SP | P0 |
| [[stories/backlog/POMO-301-supabase-schema]] | Supabase Schema & RLS | 5 SP | P0 |
| [[stories/backlog/POMO-302-auth-ui]] | Auth UI (Sign In/Up, Account Menu) | 5 SP | P0 |
| [[stories/backlog/POMO-303-account-tiers]] | Tier System & Feature Flags | 3 SP | P0 |
| [[stories/backlog/POMO-304-upgrade-flow]] | Free → Plus Upgrade Flow | 5 SP | P0 |
| [[stories/backlog/POMO-305-sync-service]] | Sync Service Implementation | 8 SP | P0 |
| [[stories/backlog/POMO-306-conflict-resolution]] | Conflict Resolution Logic | 3 SP | P0 |
| [[stories/backlog/POMO-307-trial-management]] | Trial Start/End Flow | 3 SP | P1 |
| [[stories/backlog/POMO-308-settings-sync]] | Settings Synchronisation | 2 SP | P1 |

**P0 Gesamt: 32 Story Points**
**P1 Gesamt: 5 Story Points**
**Total: 37 Story Points**

## Changelog

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2026-01-30 | Tier-Naming aktualisiert (Plus → Particle), Strategy-Doc verlinkt | Claude |
| 2026-01-28 | Initial Draft für Multi-Platform Architecture | Claude |
