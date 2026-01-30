---
type: feature
status: draft
priority: p0
effort: l
business_value: high
origin: "Architecture Decision: Multi-Platform Sync"
decisions:
  - "[[decisions/ADR-001-multi-platform-architecture]]"
  - "[[decisions/ADR-002-schema-evolution]]"
  - "[[decisions/ADR-003-sync-strategy]]"
stories:
  - "[[stories/backlog/POMO-200-indexeddb-setup]]"
  - "[[stories/backlog/POMO-201-session-migration]]"
  - "[[stories/backlog/POMO-202-project-migration]]"
  - "[[stories/backlog/POMO-203-settings-migration]]"
  - "[[stories/backlog/POMO-204-sync-metadata]]"
  - "[[stories/backlog/POMO-205-offline-queue]]"
  - "[[stories/backlog/POMO-206-migration-ui]]"
created: 2026-01-28
updated: 2026-01-28
tags: [infrastructure, sync, local-first, p0, foundation]
---

# Local-First Persistence

## Zusammenfassung

> Upgrade von localStorage zu IndexedDB als Fundament für Multi-Device-Sync. Alle Daten werden lokal persistent gespeichert mit Sync-Metadaten, die später den nahtlosen Übergang zu Cloud-Sync ermöglichen.

## Kontext & Problem

### Ausgangssituation

Aktuell speichert Particle alle Daten in localStorage:
- `particle_sessions` – Abgeschlossene Sessions
- `particle_projects` – Projekte
- `particle_recent_tasks` – Task-Autocomplete
- `particle_settings` – User-Einstellungen
- `particle_timer_state` – Timer-Zustand

**Probleme mit localStorage:**
- 5MB Limit pro Domain (bei intensiver Nutzung schnell erreicht)
- Keine strukturierten Queries möglich
- Synchrones API blockiert UI
- Keine Transaction-Unterstützung
- Keine Versionierung/Migration

### Betroffene Nutzer

- **Power User:** Sammeln hunderte/tausende Partikel, stoßen an Limits
- **Multi-Device User:** Wollen später synchronisieren
- **Alle Nutzer:** Profitieren von besserer Performance

### Auswirkung

Ohne dieses Upgrade:
- Cloud-Sync nicht sauber implementierbar
- Datenverlust bei localStorage-Limit
- Keine Offline-Queue für spätere Synchronisation
- Migration wird mit wachsender Nutzerbasis schwieriger

## Ziele

### Muss erreicht werden

- [ ] IndexedDB als primärer Speicher für Sessions, Projects, Tasks
- [ ] Automatische Migration von localStorage zu IndexedDB
- [ ] Sync-Metadaten auf allen Entities (`syncStatus`, `localUpdatedAt`)
- [ ] Offline-Queue für pending Changes
- [ ] Abwärtskompatibilität: localStorage-Fallback für sehr alte Browser
- [ ] Zero Data Loss bei Migration

### Sollte erreicht werden

- [ ] Dexie.js als IndexedDB-Wrapper (bessere DX)
- [ ] Schema-Versionierung für zukünftige Migrationen
- [ ] Performance-Verbesserung bei großen Datenmengen

### Nicht im Scope

- Cloud-Sync Implementation (separates Feature)
- Clerk/Supabase Integration (separates Feature)
- Native App Storage (SQLite kommt später)
- Data Export/Import

## Lösung

### Übersicht

Wir ersetzen die direkte localStorage-Nutzung durch eine Abstraktionsschicht mit IndexedDB (via Dexie.js). Bestehende Daten werden beim ersten App-Start automatisch migriert. Alle Entities erhalten Sync-Metadaten als Vorbereitung für Cloud-Sync.

### Datenmodell

**Erweiterte Base-Entity mit Sync-Metadaten:**

```typescript
interface SyncableEntity {
  id: string;                    // Lokale ID (z.B. "sess_1706...")
  syncStatus: 'local' | 'pending' | 'synced' | 'conflict';
  localUpdatedAt: string;        // ISO Timestamp
  syncedAt?: string;             // Wann zuletzt mit Server abgeglichen
  serverId?: string;             // ID in Supabase (nach erstem Sync)
  deleted?: boolean;             // Soft-Delete für Sync
}
```

**Session (erweitert):**

```typescript
interface Session extends SyncableEntity {
  type: 'work' | 'short_break' | 'long_break';
  duration: number;
  completedAt: string;
  task?: string;
  estimatedPomodoros?: number;
  presetId?: string;
  projectId?: string;
  overflowDuration?: number;
  estimatedDuration?: number;
}
```

**Project (erweitert):**

```typescript
interface Project extends SyncableEntity {
  name: string;
  brightness: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Offline Queue:**

```typescript
interface QueuedChange {
  id: string;
  entityType: 'session' | 'project' | 'settings';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload: unknown;
  createdAt: string;
  retryCount: number;
}
```

### IndexedDB Schema (Dexie.js)

```typescript
import Dexie, { Table } from 'dexie';

class ParticleDB extends Dexie {
  sessions!: Table<Session>;
  projects!: Table<Project>;
  recentTasks!: Table<RecentTask>;
  settings!: Table<UserSettings>;
  syncQueue!: Table<QueuedChange>;

  constructor() {
    super('ParticleDB');

    this.version(1).stores({
      sessions: 'id, completedAt, projectId, syncStatus, type',
      projects: 'id, name, archived, syncStatus',
      recentTasks: 'text, lastUsed',
      settings: 'key',
      syncQueue: 'id, entityType, createdAt'
    });
  }
}

export const db = new ParticleDB();
```

### Migration Strategy

**Beim App-Start:**

```typescript
async function initializeStorage(): Promise<void> {
  const migrationDone = localStorage.getItem('particle_migration_v1');

  if (!migrationDone) {
    await migrateFromLocalStorage();
    localStorage.setItem('particle_migration_v1', Date.now().toString());
  }
}

async function migrateFromLocalStorage(): Promise<MigrationResult> {
  const result: MigrationResult = {
    sessions: 0,
    projects: 0,
    tasks: 0,
    errors: []
  };

  // 1. Sessions migrieren
  const oldSessions = JSON.parse(
    localStorage.getItem('particle_sessions') || '[]'
  );

  for (const session of oldSessions) {
    try {
      await db.sessions.add({
        ...session,
        syncStatus: 'local',
        localUpdatedAt: session.completedAt,
      });
      result.sessions++;
    } catch (e) {
      result.errors.push(`Session ${session.id}: ${e}`);
    }
  }

  // 2. Projects migrieren
  const oldProjects = JSON.parse(
    localStorage.getItem('particle_projects') || '[]'
  );

  for (const project of oldProjects) {
    try {
      await db.projects.add({
        ...project,
        syncStatus: 'local',
        localUpdatedAt: project.updatedAt || project.createdAt,
      });
      result.projects++;
    } catch (e) {
      result.errors.push(`Project ${project.id}: ${e}`);
    }
  }

  // 3. Recent Tasks migrieren
  const oldTasks = JSON.parse(
    localStorage.getItem('particle_recent_tasks') || '[]'
  );

  for (const task of oldTasks) {
    try {
      await db.recentTasks.add(task);
      result.tasks++;
    } catch (e) {
      result.errors.push(`Task: ${e}`);
    }
  }

  return result;
}
```

### Storage Abstraction Layer

**Bestehende API-Kompatibilität:**

```typescript
// src/lib/storage/sessions.ts

import { db } from './db';

export async function loadSessions(): Promise<Session[]> {
  return db.sessions.toArray();
}

export async function saveSession(session: Omit<Session, 'syncStatus' | 'localUpdatedAt'>): Promise<Session> {
  const fullSession: Session = {
    ...session,
    syncStatus: 'local',
    localUpdatedAt: new Date().toISOString(),
  };

  await db.sessions.add(fullSession);

  // Queue für späteren Sync
  await queueChange('session', fullSession.id, 'create', fullSession);

  return fullSession;
}

export async function getSessionsByDateRange(
  startDate: string,
  endDate: string
): Promise<Session[]> {
  return db.sessions
    .where('completedAt')
    .between(startDate, endDate)
    .toArray();
}

export async function getSessionsByProject(projectId: string): Promise<Session[]> {
  return db.sessions
    .where('projectId')
    .equals(projectId)
    .toArray();
}
```

### User Flow

#### Flow 1: Automatische Migration (First Launch nach Update)

```
App startet
    │
    ▼
┌─────────────────────────────────┐
│ Check: Migration schon erfolgt? │
└─────────────────────────────────┘
    │
    ├── Ja → Normal starten
    │
    └── Nein ▼
              ┌─────────────────────────────────┐
              │     Migration in Progress       │
              │                                 │
              │     Deine Daten werden          │
              │     optimiert...                │
              │                                 │
              │     ████████████░░░░ 75%        │
              │                                 │
              │     127 Sessions                │
              │     12 Projekte                 │
              │                                 │
              └─────────────────────────────────┘
                          │
                          ▼
              ┌─────────────────────────────────┐
              │     Migration abgeschlossen     │
              │                                 │
              │     ✓ 127 Sessions migriert    │
              │     ✓ 12 Projekte migriert     │
              │     ✓ 34 Tasks migriert        │
              │                                 │
              │     Deine Daten sind jetzt      │
              │     bereit für Sync.            │
              │                                 │
              │           [Weiter]              │
              └─────────────────────────────────┘
```

**Regeln:**
- Migration läuft einmalig beim ersten Start nach Update
- Alte localStorage-Daten werden NICHT gelöscht (Fallback)
- Bei Fehlern: Detaillierte Logs, aber App startet trotzdem
- Progress-Anzeige nur bei >50 Einträgen

#### Flow 2: Normale Nutzung (nach Migration)

Keine sichtbaren Änderungen für den User. Alles funktioniert wie vorher, nur schneller und mit mehr Kapazität.

### Technische Überlegungen

**Architektur:**

```
src/lib/storage/
├── db.ts                 # Dexie.js Setup & Schema
├── migrations/
│   ├── index.ts          # Migration Runner
│   └── v1-localstorage.ts # localStorage → IndexedDB
├── sessions.ts           # Session CRUD (neu, async)
├── projects.ts           # Project CRUD (neu, async)
├── recent-tasks.ts       # Task CRUD (neu, async)
├── settings.ts           # Settings CRUD (neu, async)
├── sync-queue.ts         # Offline Queue Management
└── index.ts              # Public API Export
```

**Breaking Changes:**

Alle Storage-Funktionen werden `async`. Das bedeutet:
- Komponenten müssen auf `useEffect` oder React Query umstellen
- Hooks wie `useProjects()` brauchen Loading-States
- Server Components können nicht direkt zugreifen

**Vorgeschlagene Lösung:**

```typescript
// src/hooks/useProjects.ts

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadProjects()
      .then(setProjects)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { projects, loading, error };
}
```

Oder mit React Query / SWR für besseres Caching.

**Browser Support:**

| Browser | IndexedDB Support |
|---------|------------------|
| Chrome 23+ | ✓ |
| Firefox 10+ | ✓ |
| Safari 10+ | ✓ |
| Edge 12+ | ✓ |
| IE 10+ | ✓ (mit Einschränkungen) |

Fallback auf localStorage nur für sehr alte Browser (praktisch irrelevant für Particle-Zielgruppe).

## Akzeptanzkriterien

### Must Have

- [ ] Dexie.js installiert und konfiguriert
- [ ] IndexedDB Schema für Sessions, Projects, Tasks, Settings, Queue
- [ ] Automatische Migration von localStorage beim ersten Start
- [ ] Alle bestehenden Daten werden fehlerfrei migriert
- [ ] Sync-Metadaten (`syncStatus`, `localUpdatedAt`) auf allen Entities
- [ ] Bestehende Funktionalität bleibt erhalten (keine Regression)
- [ ] Offline Queue speichert pending Changes
- [ ] Migration-UI zeigt Fortschritt (bei >50 Einträgen)
- [ ] Error Handling: App startet auch bei Teil-Migration

### Nice to Have

- [ ] React Query Integration für besseres Caching
- [ ] IndexedDB DevTools-Logging im Development
- [ ] Bulk-Operations für bessere Performance
- [ ] Daten-Export als JSON (aus IndexedDB)

## Edge Cases & Fehlerbehandlung

| Szenario | Erwartetes Verhalten |
|----------|---------------------|
| localStorage leer | Keine Migration nötig, normale Initialisierung |
| localStorage korrupt | Warnung loggen, leere DB initialisieren |
| IndexedDB nicht verfügbar | Fallback auf localStorage (Legacy-Modus) |
| Migration-Abbruch (Tab geschlossen) | Beim nächsten Start: Cleanup + Neustart |
| Duplikate bei Migration | Skip mit Warning (idempotent) |
| Private/Incognito Mode | Funktioniert, aber Daten sind temporär |
| Storage Quota erreicht | Fehlermeldung, älteste Sessions vorschlagen zum Löschen |

## Metriken & Erfolgsmessung

- **Primäre Metrik:** 0 Datenverlust bei Migration (Error-Rate < 0.1%)
- **Sekundäre Metrik:** Ladezeit für Stats-View -30% (bei >100 Sessions)
- **Sekundäre Metrik:** Keine Support-Tickets wegen fehlender Daten
- **Messzeitraum:** 2 Wochen nach Rollout

## Risiken & Abhängigkeiten

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Datenverlust bei Migration | niedrig | kritisch | Backup in localStorage behalten |
| Performance-Regression | niedrig | mittel | Benchmarks vor/nach |
| Breaking Changes in Hooks | mittel | mittel | Schrittweise Migration der Komponenten |
| Browser-Inkompatibilität | sehr niedrig | niedrig | Feature Detection + Fallback |

**Abhängigkeiten:**
- [ ] Keine externen Abhängigkeiten
- [ ] Muss VOR Cloud-Sync Feature implementiert werden

## Offene Fragen

- [x] ~~Dexie.js vs. idb vs. raw IndexedDB?~~ → **Dexie.js** (beste DX)
- [ ] React Query einführen oder eigene Hooks? → **Vorschlag: Eigene Hooks für jetzt**
- [ ] localStorage nach erfolgreicher Migration löschen? → **Vorschlag: Nein, als Backup behalten**
- [ ] Migration-UI als Modal oder Full-Screen? → **Vorschlag: Modal mit Progress**

## Stories

| Story | Titel | Effort | Prio |
|-------|-------|--------|------|
| [[stories/backlog/POMO-200-indexeddb-setup]] | Dexie.js Setup & Schema | 2 SP | P0 |
| [[stories/backlog/POMO-201-session-migration]] | Session Storage Migration | 3 SP | P0 |
| [[stories/backlog/POMO-202-project-migration]] | Project Storage Migration | 2 SP | P0 |
| [[stories/backlog/POMO-203-settings-migration]] | Settings & Tasks Migration | 2 SP | P0 |
| [[stories/backlog/POMO-204-sync-metadata]] | Sync-Metadaten Implementation | 3 SP | P0 |
| [[stories/backlog/POMO-205-offline-queue]] | Offline Queue System | 3 SP | P0 |
| [[stories/backlog/POMO-206-migration-ui]] | Migration Progress UI | 2 SP | P1 |

**P0 Gesamt: 15 Story Points**
**P1 Gesamt: 2 Story Points**
**Total: 17 Story Points**

## Changelog

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2026-01-28 | Initial Draft für Multi-Platform Architecture | Claude |
