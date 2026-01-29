---
type: story
status: backlog
priority: p0
effort: 2
feature: "[[features/local-first-persistence]]"
created: 2026-01-28
updated: 2026-01-29
done_date: null
tags: [infrastructure, migration, projects]
---

# POMO-202: Project Migration – Kapitel retten

## User Story

> Als **bestehender Nutzer mit Projekten**
> möchte ich **dass meine Projekte automatisch zu IndexedDB migriert werden**,
> damit **ich weiterhin meine Partikel nach Lebenskapiteln organisieren kann**.

## Kontext

Link zum Feature: [[features/local-first-persistence]]

**Vorgänger:** POMO-201 (Session Migration)

Projekte sind die Kapitel deines Lebenswerks. Die Projekt-IDs müssen erhalten bleiben, da Sessions (Partikel) über `projectId` darauf referenzieren.

**Reihenfolge:** POMO-200 → POMO-201 → **POMO-202** → POMO-203

## Akzeptanzkriterien

- [ ] **Given** Projekte in localStorage, **When** die App startet, **Then** werden alle Projekte zu IndexedDB migriert
- [ ] **Given** Migration erfolgt, **When** sie abgeschlossen ist, **Then** haben alle Projekte Sync-Metadaten
- [ ] **Given** Session mit `projectId`, **When** Projekt migriert wurde, **Then** bleibt die Verknüpfung intakt
- [ ] **Given** ein bereits migriertes Projekt (gleiche ID), **When** Migration läuft, **Then** wird es übersprungen
- [ ] **Given** Migration erfolgreich, **When** sie abgeschlossen ist, **Then** wird Flag gesetzt

## Technische Details

### Aktueller Storage (localStorage)

```typescript
// src/lib/projects/storage.ts
const STORAGE_KEY = 'particle_projects';

// Bestehendes Interface (src/lib/projects/types.ts):
export interface Project {
  id: string;                    // z.B. 'proj_1706439600000-abc123'
  name: string;                  // Max 50 Zeichen
  brightness: number;            // 0.3 - 1.0
  archived: boolean;
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}
```

### Dateistruktur

```
src/lib/db/
└── migrations/
    ├── index.ts                  # Migration Runner (erweitern)
    └── projects.ts               # NEU: Project Migration
```

### Project Migration

```typescript
// src/lib/db/migrations/projects.ts

import { getDB } from '../database';
import type { DBProject } from '../types';

const MIGRATION_KEY = 'particle_migration_projects_v1';
const LEGACY_STORAGE_KEY = 'particle_projects';

interface LegacyProject {
  id: string;
  name: string;
  brightness: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMigrationResult {
  skipped: boolean;
  migrated: number;
  errors: string[];
}

/**
 * Migriert alle Projekte von localStorage zu IndexedDB
 */
export async function migrateProjectsV1(): Promise<ProjectMigrationResult> {
  // Bereits migriert?
  if (localStorage.getItem(MIGRATION_KEY)) {
    return { skipped: true, migrated: 0, errors: [] };
  }

  // Legacy-Daten laden
  const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacyData) {
    localStorage.setItem(MIGRATION_KEY, Date.now().toString());
    return { skipped: false, migrated: 0, errors: [] };
  }

  let legacyProjects: LegacyProject[];
  try {
    legacyProjects = JSON.parse(legacyData);
  } catch (e) {
    console.error('[Migration] Failed to parse legacy projects:', e);
    localStorage.setItem(MIGRATION_KEY, Date.now().toString());
    return { skipped: false, migrated: 0, errors: ['Failed to parse legacy data'] };
  }

  if (!Array.isArray(legacyProjects) || legacyProjects.length === 0) {
    localStorage.setItem(MIGRATION_KEY, Date.now().toString());
    return { skipped: false, migrated: 0, errors: [] };
  }

  const db = getDB();
  let migrated = 0;
  const errors: string[] = [];

  await db.transaction('rw', db.projects, async () => {
    for (const legacy of legacyProjects) {
      try {
        // Idempotenz-Check
        const existing = await db.projects.get(legacy.id);
        if (existing) {
          continue;
        }

        const dbProject: DBProject = {
          // Bestehende Felder (WICHTIG: ID bleibt!)
          id: legacy.id,
          name: legacy.name,
          brightness: legacy.brightness,
          archived: legacy.archived,
          createdAt: legacy.createdAt,
          updatedAt: legacy.updatedAt,

          // Neue Sync-Metadaten
          syncStatus: 'local',
          localUpdatedAt: legacy.updatedAt || legacy.createdAt,
        };

        await db.projects.add(dbProject);
        migrated++;
      } catch (e) {
        const errorMsg = `Project ${legacy.id}: ${e instanceof Error ? e.message : String(e)}`;
        errors.push(errorMsg);
        console.error('[Migration]', errorMsg);
      }
    }
  });

  localStorage.setItem(MIGRATION_KEY, Date.now().toString());
  console.log(`[Migration] Projects: ${migrated} migrated, ${errors.length} errors`);

  return { skipped: false, migrated, errors };
}
```

### Migration Runner erweitern

```typescript
// src/lib/db/migrations/index.ts (ergänzen)

import { migrateProjectsV1 } from './projects';

export async function runMigrations(
  onProgress?: ProgressCallback
): Promise<MigrationResult[]> {
  const migrations = [
    { name: 'sessions-v1', run: migrateSessionsV1 },
    { name: 'projects-v1', run: migrateProjectsV1 },  // NEU
    // Später: tasks-v1, settings-v1
  ];

  // ... rest bleibt gleich
}

export function hasPendingMigrations(): boolean {
  const MIGRATION_FLAGS = [
    'particle_migration_sessions_v1',
    'particle_migration_projects_v1',  // NEU
  ];

  return MIGRATION_FLAGS.some(flag => !localStorage.getItem(flag));
}

export function countPendingEntries(): number {
  let count = 0;

  // Sessions
  if (!localStorage.getItem('particle_migration_sessions_v1')) {
    const sessions = JSON.parse(localStorage.getItem('particle_session_history') || '[]');
    count += sessions.length;
  }

  // Projects (NEU)
  if (!localStorage.getItem('particle_migration_projects_v1')) {
    const projects = JSON.parse(localStorage.getItem('particle_projects') || '[]');
    count += projects.length;
  }

  return count;
}
```

### Neue Project API

```typescript
// src/lib/db/projects.ts

import { getDB } from './database';
import type { DBProject } from './types';

/**
 * Alle Projekte laden
 */
export async function loadProjects(): Promise<DBProject[]> {
  return getDB().projects
    .filter(p => !p.deleted)
    .toArray();
}

/**
 * Aktive (nicht-archivierte) Projekte laden
 */
export async function getActiveProjects(): Promise<DBProject[]> {
  return getDB().projects
    .where('archived')
    .equals(0) // Dexie nutzt 0/1 für boolean
    .filter(p => !p.deleted)
    .toArray();
}

/**
 * Archivierte Projekte laden
 */
export async function getArchivedProjects(): Promise<DBProject[]> {
  return getDB().projects
    .where('archived')
    .equals(1)
    .filter(p => !p.deleted)
    .toArray();
}

/**
 * Projekt nach ID laden
 */
export async function getProject(id: string): Promise<DBProject | undefined> {
  const project = await getDB().projects.get(id);
  if (project?.deleted) return undefined;
  return project;
}

/**
 * Neues Projekt erstellen
 */
export async function createProject(
  data: { name: string; brightness?: number }
): Promise<DBProject> {
  const now = new Date().toISOString();

  const project: DBProject = {
    id: generateProjectId(),
    name: data.name.trim(),
    brightness: data.brightness ?? 0.7,
    archived: false,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'local',
    localUpdatedAt: now,
  };

  await getDB().projects.add(project);
  return project;
}

/**
 * Projekt aktualisieren
 */
export async function updateProject(
  id: string,
  updates: Partial<{ name: string; brightness: number; archived: boolean }>
): Promise<DBProject | undefined> {
  const db = getDB();
  const existing = await db.projects.get(id);

  if (!existing || existing.deleted) return undefined;

  const now = new Date().toISOString();
  const updated: DBProject = {
    ...existing,
    ...updates,
    updatedAt: now,
    syncStatus: existing.syncStatus === 'synced' ? 'pending' : existing.syncStatus,
    localUpdatedAt: now,
  };

  await db.projects.put(updated);
  return updated;
}

/**
 * Projekt archivieren (Soft-Archive)
 */
export async function archiveProject(id: string): Promise<DBProject | undefined> {
  return updateProject(id, { archived: true });
}

/**
 * Archiviertes Projekt wiederherstellen
 */
export async function restoreProject(id: string): Promise<DBProject | undefined> {
  return updateProject(id, { archived: false });
}

/**
 * Projekt löschen (Soft-Delete für Sync)
 */
export async function deleteProject(id: string): Promise<boolean> {
  const db = getDB();
  const existing = await db.projects.get(id);

  if (!existing) return false;

  const now = new Date().toISOString();
  await db.projects.update(id, {
    deleted: true,
    syncStatus: existing.syncStatus === 'synced' ? 'pending' : existing.syncStatus,
    localUpdatedAt: now,
  });

  return true;
}

/**
 * Projekt-ID generieren
 */
function generateProjectId(): string {
  return `proj_${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
```

### DBProject Type (in types.ts ergänzen)

```typescript
// src/lib/db/types.ts (ergänzen)

/**
 * Projekt in IndexedDB
 */
export interface DBProject extends SyncableEntity {
  name: string;
  brightness: number;          // 0.3 - 1.0
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Testing

### Manuell zu testen

- [ ] Projekte erscheinen in IndexedDB nach Migration
- [ ] Projekt-IDs bleiben gleich (wichtig für Session-Verknüpfung!)
- [ ] Sessions zeigen weiterhin korrektes Projekt
- [ ] Archivierte Projekte werden korrekt migriert
- [ ] Migration läuft nur einmal

### Automatisierte Tests

```typescript
// src/lib/db/migrations/__tests__/projects.test.ts

import { migrateProjectsV1 } from '../projects';
import { getDB, closeDB } from '../../database';
import 'fake-indexeddb/auto';

describe('Project Migration V1', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(async () => {
    await closeDB();
    localStorage.clear();
  });

  it('skips if already migrated', async () => {
    localStorage.setItem('particle_migration_projects_v1', '1234567890');

    const result = await migrateProjectsV1();

    expect(result.skipped).toBe(true);
  });

  it('migrates projects from localStorage', async () => {
    const legacyProjects = [
      {
        id: 'proj_1',
        name: 'Work',
        brightness: 0.7,
        archived: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-28T10:00:00.000Z',
      },
      {
        id: 'proj_2',
        name: 'Side Project',
        brightness: 0.5,
        archived: true,
        createdAt: '2026-01-15T00:00:00.000Z',
        updatedAt: '2026-01-20T10:00:00.000Z',
      },
    ];
    localStorage.setItem('particle_projects', JSON.stringify(legacyProjects));

    const result = await migrateProjectsV1();

    expect(result.skipped).toBe(false);
    expect(result.migrated).toBe(2);

    // Verify in IndexedDB
    const db = getDB();
    const projects = await db.projects.toArray();
    expect(projects).toHaveLength(2);

    // Check IDs preserved
    const workProject = projects.find(p => p.id === 'proj_1');
    expect(workProject?.name).toBe('Work');
    expect(workProject?.syncStatus).toBe('local');

    // Check archived preserved
    const archived = projects.find(p => p.id === 'proj_2');
    expect(archived?.archived).toBe(true);
  });

  it('preserves project IDs for session references', async () => {
    // Setup: Session with projectId
    const sessionId = 'session_1';
    const projectId = 'proj_1';

    localStorage.setItem('particle_session_history', JSON.stringify([
      { id: sessionId, type: 'work', duration: 1500, completedAt: '2026-01-28T10:00:00.000Z', projectId },
    ]));
    localStorage.setItem('particle_projects', JSON.stringify([
      { id: projectId, name: 'Work', brightness: 0.7, archived: false, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-28T10:00:00.000Z' },
    ]));

    // Migrate both
    await migrateSessionsV1();
    await migrateProjectsV1();

    // Verify reference intact
    const db = getDB();
    const session = await db.sessions.get(sessionId);
    const project = await db.projects.get(projectId);

    expect(session?.projectId).toBe(projectId);
    expect(project?.id).toBe(projectId);
  });

  it('is idempotent', async () => {
    localStorage.setItem('particle_projects', JSON.stringify([
      { id: 'proj_1', name: 'Work', brightness: 0.7, archived: false, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-28T10:00:00.000Z' },
    ]));

    // First migration
    await migrateProjectsV1();

    // Clear flag, add more data
    localStorage.removeItem('particle_migration_projects_v1');
    localStorage.setItem('particle_projects', JSON.stringify([
      { id: 'proj_1', name: 'Work', brightness: 0.7, archived: false, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-28T10:00:00.000Z' },
      { id: 'proj_2', name: 'New', brightness: 0.5, archived: false, createdAt: '2026-01-28T00:00:00.000Z', updatedAt: '2026-01-28T10:00:00.000Z' },
    ]));

    // Second migration
    const result = await migrateProjectsV1();

    expect(result.migrated).toBe(1); // Only proj_2

    const db = getDB();
    const projects = await db.projects.toArray();
    expect(projects).toHaveLength(2);
  });
});
```

## Definition of Done

- [ ] Project-Migration in `src/lib/db/migrations/projects.ts`
- [ ] Migration-Runner erweitert
- [ ] Neue Project API in `src/lib/db/projects.ts`
- [ ] DBProject Type definiert
- [ ] Unit Tests geschrieben & grün
- [ ] Session-Project-Verknüpfung intakt verifiziert
- [ ] Lokal mit echten Daten getestet

## Notizen

**Warum ID-Erhalt kritisch ist:**
- Sessions referenzieren Projekte via `projectId`
- Wenn die ID sich ändert, verliert jede Session ihre Projekt-Zuordnung
- Die Migration MUSS die Original-IDs beibehalten

**Archived vs. Deleted:**
- `archived: true` = Projekt ist versteckt, aber Daten erhalten
- `deleted: true` = Soft-Delete für Sync (später permanent löschen)
- Archived-Status wird 1:1 migriert

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
