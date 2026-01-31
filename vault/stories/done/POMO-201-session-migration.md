---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/local-first-persistence]]"
created: 2026-01-28
updated: 2026-01-29
done_date: null
tags: [infrastructure, migration, sessions]
---

# POMO-201: Session Migration – Partikel retten

## User Story

> Als **bestehender Nutzer**
> möchte ich **dass meine Sessions automatisch zu IndexedDB migriert werden**,
> damit **ich keine Partikel verliere und von der neuen Storage-Architektur profitiere**.

## Kontext

Link zum Feature: [[features/local-first-persistence]]

**Vorgänger:** POMO-200 (Dexie.js Setup)

Sessions sind die wichtigsten Daten – jeder Partikel ist eine Session. Die Migration muss 100% zuverlässig sein. Ein verlorener Partikel ist ein verlorener Moment der Arbeit.

**Reihenfolge:** POMO-200 → **POMO-201** → POMO-202 → POMO-203

## Akzeptanzkriterien

- [ ] **Given** Sessions in localStorage, **When** die App startet, **Then** werden alle Sessions zu IndexedDB migriert
- [ ] **Given** Migration erfolgt, **When** sie abgeschlossen ist, **Then** haben alle Sessions Sync-Metadaten (`syncStatus: 'local'`, `localUpdatedAt`)
- [ ] **Given** eine Session existiert bereits in IndexedDB (gleiche ID), **When** Migration läuft, **Then** wird sie übersprungen (idempotent)
- [ ] **Given** ein Fehler bei einer Session, **When** Migration läuft, **Then** wird der Fehler geloggt und die anderen Sessions werden trotzdem migriert
- [ ] **Given** Migration erfolgreich, **When** sie abgeschlossen ist, **Then** wird ein Flag gesetzt und die Migration läuft nicht erneut
- [ ] **Given** die neue API, **When** Sessions geladen werden, **Then** kommen sie aus IndexedDB

## Technische Details

### Aktueller Storage (localStorage)

```typescript
// src/lib/session-storage.ts
const STORAGE_KEY = 'particle_session_history';

// Bestehendes Interface:
export interface CompletedSession {
  id: string;
  type: SessionType;              // 'work' | 'short_break' | 'long_break'
  duration: number;               // Sekunden
  completedAt: string;            // ISO timestamp
  task?: string;
  projectId?: string;
  presetId?: string;
  estimatedPomodoros?: number;
  overflowDuration?: number;
  estimatedDuration?: number;
}
```

### Dateistruktur

```
src/lib/db/
├── index.ts                      # Exports (aus POMO-200)
├── database.ts                   # Dexie Setup (aus POMO-200)
├── types.ts                      # Entity Types (aus POMO-200)
├── feature-detection.ts          # IndexedDB Check (aus POMO-200)
└── migrations/
    ├── index.ts                  # NEU: Migration Runner
    └── sessions.ts               # NEU: Session Migration
```

### Migration Runner

```typescript
// src/lib/db/migrations/index.ts

export interface MigrationResult {
  name: string;
  skipped: boolean;
  migrated: number;
  errors: string[];
  duration: number;
}

export interface MigrationProgress {
  current: string;
  total: number;
  completed: number;
}

type ProgressCallback = (progress: MigrationProgress) => void;

/**
 * Führt alle Migrationen aus
 * Jede Migration läuft nur einmal (Flag in localStorage)
 */
export async function runMigrations(
  onProgress?: ProgressCallback
): Promise<MigrationResult[]> {
  const migrations = [
    { name: 'sessions-v1', run: migrateSessionsV1 },
    // Später: projects-v1, tasks-v1, settings-v1
  ];

  const results: MigrationResult[] = [];

  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i];

    onProgress?.({
      current: migration.name,
      total: migrations.length,
      completed: i,
    });

    const startTime = Date.now();
    const result = await migration.run();

    results.push({
      ...result,
      name: migration.name,
      duration: Date.now() - startTime,
    });
  }

  return results;
}

/**
 * Prüft ob Migrationen ausstehen
 */
export function hasPendingMigrations(): boolean {
  const MIGRATION_FLAGS = [
    'particle_migration_sessions_v1',
    // Später: projects, tasks, settings
  ];

  return MIGRATION_FLAGS.some(flag => !localStorage.getItem(flag));
}

/**
 * Zählt zu migrierende Einträge (für Progress-UI Entscheidung)
 */
export function countPendingEntries(): number {
  let count = 0;

  // Sessions
  if (!localStorage.getItem('particle_migration_sessions_v1')) {
    const sessions = JSON.parse(localStorage.getItem('particle_session_history') || '[]');
    count += sessions.length;
  }

  // Später: Projects, Tasks

  return count;
}
```

### Session Migration

```typescript
// src/lib/db/migrations/sessions.ts

import { getDB } from '../database';
import type { DBSession } from '../types';

const MIGRATION_KEY = 'particle_migration_sessions_v1';
const LEGACY_STORAGE_KEY = 'particle_session_history';

interface LegacySession {
  id: string;
  type: 'work' | 'short_break' | 'long_break';
  duration: number;
  completedAt: string;
  task?: string;
  projectId?: string;
  presetId?: string;
  estimatedPomodoros?: number;
  overflowDuration?: number;
  estimatedDuration?: number;
}

export interface SessionMigrationResult {
  skipped: boolean;
  migrated: number;
  errors: string[];
}

/**
 * Migriert alle Sessions von localStorage zu IndexedDB
 *
 * - Idempotent: Läuft nur einmal (Flag-basiert)
 * - Fehlerresistent: Ein Fehler stoppt nicht die anderen
 * - Verlustfrei: Alle Felder werden übernommen
 */
export async function migrateSessionsV1(): Promise<SessionMigrationResult> {
  // Bereits migriert?
  if (localStorage.getItem(MIGRATION_KEY)) {
    return { skipped: true, migrated: 0, errors: [] };
  }

  // Legacy-Daten laden
  const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacyData) {
    // Keine alten Daten → Flag setzen und fertig
    localStorage.setItem(MIGRATION_KEY, Date.now().toString());
    return { skipped: false, migrated: 0, errors: [] };
  }

  let legacySessions: LegacySession[];
  try {
    legacySessions = JSON.parse(legacyData);
  } catch (e) {
    // Korrupte Daten → loggen aber nicht crashen
    console.error('[Migration] Failed to parse legacy sessions:', e);
    localStorage.setItem(MIGRATION_KEY, Date.now().toString());
    return { skipped: false, migrated: 0, errors: ['Failed to parse legacy data'] };
  }

  if (!Array.isArray(legacySessions) || legacySessions.length === 0) {
    localStorage.setItem(MIGRATION_KEY, Date.now().toString());
    return { skipped: false, migrated: 0, errors: [] };
  }

  const db = getDB();
  let migrated = 0;
  const errors: string[] = [];

  // Batch-Migration in einer Transaktion
  await db.transaction('rw', db.sessions, async () => {
    for (const legacy of legacySessions) {
      try {
        // Bereits migriert? (Idempotenz)
        const existing = await db.sessions.get(legacy.id);
        if (existing) {
          continue;
        }

        // Zu DBSession konvertieren
        const dbSession: DBSession = {
          // Bestehende Felder
          id: legacy.id,
          type: legacy.type,
          duration: legacy.duration,
          completedAt: legacy.completedAt,
          task: legacy.task,
          projectId: legacy.projectId,
          presetId: legacy.presetId,
          estimatedPomodoros: legacy.estimatedPomodoros,
          overflowDuration: legacy.overflowDuration,
          estimatedDuration: legacy.estimatedDuration,

          // Neue Sync-Metadaten
          syncStatus: 'local',
          localUpdatedAt: legacy.completedAt, // Beste Näherung
        };

        await db.sessions.add(dbSession);
        migrated++;
      } catch (e) {
        const errorMsg = `Session ${legacy.id}: ${e instanceof Error ? e.message : String(e)}`;
        errors.push(errorMsg);
        console.error('[Migration]', errorMsg);
      }
    }
  });

  // Flag setzen
  localStorage.setItem(MIGRATION_KEY, Date.now().toString());

  console.log(`[Migration] Sessions: ${migrated} migrated, ${errors.length} errors`);

  return { skipped: false, migrated, errors };
}
```

### Neue Session API

```typescript
// src/lib/db/sessions.ts

import { getDB } from './database';
import type { DBSession, SyncStatus } from './types';

/**
 * Alle Sessions laden (sortiert nach completedAt DESC)
 */
export async function loadSessions(): Promise<DBSession[]> {
  const db = getDB();
  return db.sessions
    .orderBy('completedAt')
    .reverse()
    .toArray();
}

/**
 * Sessions für einen Zeitraum laden
 */
export async function getSessionsByDateRange(
  startDate: string,
  endDate: string
): Promise<DBSession[]> {
  const db = getDB();
  return db.sessions
    .where('completedAt')
    .between(startDate, endDate, true, true)
    .toArray();
}

/**
 * Sessions für einen Tag laden
 */
export async function getSessionsForDate(date: Date): Promise<DBSession[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return getSessionsByDateRange(
    startOfDay.toISOString(),
    endOfDay.toISOString()
  );
}

/**
 * Session nach ID laden
 */
export async function getSession(id: string): Promise<DBSession | undefined> {
  return getDB().sessions.get(id);
}

/**
 * Neue Session speichern
 */
export async function saveSession(
  data: Omit<DBSession, 'id' | 'syncStatus' | 'localUpdatedAt'>
): Promise<DBSession> {
  const session: DBSession = {
    ...data,
    id: generateSessionId(),
    syncStatus: 'local',
    localUpdatedAt: new Date().toISOString(),
  };

  await getDB().sessions.add(session);
  return session;
}

/**
 * Session aktualisieren
 */
export async function updateSession(
  id: string,
  updates: Partial<Omit<DBSession, 'id' | 'syncStatus' | 'localUpdatedAt'>>
): Promise<DBSession | undefined> {
  const db = getDB();
  const existing = await db.sessions.get(id);

  if (!existing) return undefined;

  const updated: DBSession = {
    ...existing,
    ...updates,
    // Sync-Status aktualisieren
    syncStatus: existing.syncStatus === 'synced' ? 'pending' : existing.syncStatus,
    localUpdatedAt: new Date().toISOString(),
  };

  await db.sessions.put(updated);
  return updated;
}

/**
 * Session löschen (Soft-Delete für Sync)
 */
export async function deleteSession(id: string): Promise<boolean> {
  const db = getDB();
  const existing = await db.sessions.get(id);

  if (!existing) return false;

  // Soft-Delete: Markieren statt wirklich löschen
  await db.sessions.update(id, {
    deleted: true,
    syncStatus: existing.syncStatus === 'synced' ? 'pending' : existing.syncStatus,
    localUpdatedAt: new Date().toISOString(),
  });

  return true;
}

/**
 * Sessions für ein Projekt laden
 */
export async function getSessionsByProject(projectId: string): Promise<DBSession[]> {
  return getDB().sessions
    .where('projectId')
    .equals(projectId)
    .reverse()
    .sortBy('completedAt');
}

/**
 * Session-ID generieren
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Legacy-API Adapter (für schrittweise Migration der Aufrufer)
 * TODO: Nach vollständiger Migration entfernen
 */
export function createLegacyAdapter() {
  return {
    getSessions: loadSessions,
    addSession: saveSession,
    updateSession,
    deleteSession,
  };
}
```

### Integration in App

```typescript
// In src/app/layout.tsx oder einem Provider

import { runMigrations, hasPendingMigrations } from '@/lib/db/migrations';
import { isIndexedDBAvailable } from '@/lib/db';

// Beim App-Start
useEffect(() => {
  async function initStorage() {
    // IndexedDB verfügbar?
    if (!isIndexedDBAvailable()) {
      console.warn('[Storage] IndexedDB not available, using localStorage fallback');
      return;
    }

    // Migrationen ausführen
    if (hasPendingMigrations()) {
      const results = await runMigrations();
      console.log('[Storage] Migrations completed:', results);
    }
  }

  initStorage();
}, []);
```

## Testing

### Manuell zu testen

- [ ] App mit bestehenden localStorage-Sessions starten
- [ ] DevTools > Application > IndexedDB > ParticleDB > sessions prüfen
- [ ] Alle Session-Daten sind intakt (count, dates, tasks, projects)
- [ ] Migration läuft nur einmal (Flag `particle_migration_sessions_v1` wird gesetzt)
- [ ] Bei erneutem Reload: Keine erneute Migration
- [ ] Neue Sessions werden in IndexedDB gespeichert

### Automatisierte Tests

```typescript
// src/lib/db/migrations/__tests__/sessions.test.ts

import { migrateSessionsV1 } from '../sessions';
import { getDB, closeDB } from '../../database';
import 'fake-indexeddb/auto';

describe('Session Migration V1', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(async () => {
    await closeDB();
    localStorage.clear();
  });

  it('skips if already migrated', async () => {
    localStorage.setItem('particle_migration_sessions_v1', '1234567890');

    const result = await migrateSessionsV1();

    expect(result.skipped).toBe(true);
    expect(result.migrated).toBe(0);
  });

  it('migrates sessions from localStorage', async () => {
    const legacySessions = [
      {
        id: 'session_1',
        type: 'work',
        duration: 1500,
        completedAt: '2026-01-28T10:00:00.000Z',
        task: 'Test Task',
      },
      {
        id: 'session_2',
        type: 'short_break',
        duration: 300,
        completedAt: '2026-01-28T10:30:00.000Z',
      },
    ];
    localStorage.setItem('particle_session_history', JSON.stringify(legacySessions));

    const result = await migrateSessionsV1();

    expect(result.skipped).toBe(false);
    expect(result.migrated).toBe(2);
    expect(result.errors).toHaveLength(0);

    // Verify in IndexedDB
    const db = getDB();
    const sessions = await db.sessions.toArray();
    expect(sessions).toHaveLength(2);
    expect(sessions[0].syncStatus).toBe('local');
    expect(sessions[0].localUpdatedAt).toBeDefined();
  });

  it('is idempotent (skips existing sessions)', async () => {
    // First migration
    localStorage.setItem('particle_session_history', JSON.stringify([
      { id: 'session_1', type: 'work', duration: 1500, completedAt: '2026-01-28T10:00:00.000Z' },
    ]));
    await migrateSessionsV1();

    // Clear flag to simulate second run
    localStorage.removeItem('particle_migration_sessions_v1');

    // Second migration with same + new data
    localStorage.setItem('particle_session_history', JSON.stringify([
      { id: 'session_1', type: 'work', duration: 1500, completedAt: '2026-01-28T10:00:00.000Z' },
      { id: 'session_2', type: 'work', duration: 1500, completedAt: '2026-01-28T11:00:00.000Z' },
    ]));

    const result = await migrateSessionsV1();

    expect(result.migrated).toBe(1); // Only session_2

    const db = getDB();
    const sessions = await db.sessions.toArray();
    expect(sessions).toHaveLength(2);
  });

  it('handles corrupted localStorage gracefully', async () => {
    localStorage.setItem('particle_session_history', 'not valid json');

    const result = await migrateSessionsV1();

    expect(result.skipped).toBe(false);
    expect(result.migrated).toBe(0);
    expect(result.errors).toContain('Failed to parse legacy data');
  });

  it('continues on single session error', async () => {
    const legacySessions = [
      { id: 'session_1', type: 'work', duration: 1500, completedAt: '2026-01-28T10:00:00.000Z' },
      { id: null, type: 'work', duration: 1500, completedAt: '2026-01-28T11:00:00.000Z' }, // Invalid
      { id: 'session_3', type: 'work', duration: 1500, completedAt: '2026-01-28T12:00:00.000Z' },
    ];
    localStorage.setItem('particle_session_history', JSON.stringify(legacySessions));

    const result = await migrateSessionsV1();

    expect(result.migrated).toBe(2);
    expect(result.errors).toHaveLength(1);
  });

  it('handles empty localStorage', async () => {
    const result = await migrateSessionsV1();

    expect(result.skipped).toBe(false);
    expect(result.migrated).toBe(0);
    expect(localStorage.getItem('particle_migration_sessions_v1')).not.toBeNull();
  });
});

describe('New Session API', () => {
  beforeEach(async () => {
    localStorage.clear();
  });

  afterEach(async () => {
    await closeDB();
  });

  it('saves new session with sync metadata', async () => {
    const session = await saveSession({
      type: 'work',
      duration: 1500,
      completedAt: new Date().toISOString(),
    });

    expect(session.id).toMatch(/^session_/);
    expect(session.syncStatus).toBe('local');
    expect(session.localUpdatedAt).toBeDefined();
  });

  it('updates session and changes sync status', async () => {
    const session = await saveSession({
      type: 'work',
      duration: 1500,
      completedAt: new Date().toISOString(),
    });

    // Simulate synced state
    await getDB().sessions.update(session.id, { syncStatus: 'synced' });

    // Update
    const updated = await updateSession(session.id, { task: 'New Task' });

    expect(updated?.syncStatus).toBe('pending');
    expect(updated?.task).toBe('New Task');
  });

  it('soft-deletes session', async () => {
    const session = await saveSession({
      type: 'work',
      duration: 1500,
      completedAt: new Date().toISOString(),
    });

    await deleteSession(session.id);

    const deleted = await getSession(session.id);
    expect(deleted?.deleted).toBe(true);
  });
});
```

## Definition of Done

- [ ] Migration-Runner in `src/lib/db/migrations/index.ts`
- [ ] Session-Migration in `src/lib/db/migrations/sessions.ts`
- [ ] Neue Session API in `src/lib/db/sessions.ts`
- [ ] Unit Tests geschrieben & grün
- [ ] Lokal getestet mit echten Daten
- [ ] Performance bei >1000 Sessions akzeptabel (<2s)
- [ ] Keine console.errors in Production
- [ ] Migration läuft beim App-Start automatisch

## Notizen

**Warum Soft-Delete?**
- Bei späterem Cloud-Sync müssen gelöschte Sessions synchronisiert werden
- Der Server muss wissen, dass etwas gelöscht wurde
- Nach erfolgreichem Sync kann die Session endgültig entfernt werden

**Legacy-Code Cleanup (später):**
- `src/lib/session-storage.ts` kann nach vollständiger Migration entfernt werden
- Alle Aufrufer müssen vorher auf die neue API umgestellt werden
- Das ist eine separate Story (POMO-20X)

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
