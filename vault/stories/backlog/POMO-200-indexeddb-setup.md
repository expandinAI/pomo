---
type: story
status: backlog
priority: p0
effort: 2
feature: "[[features/local-first-persistence]]"
created: 2026-01-28
updated: 2026-01-29
done_date: null
tags: [infrastructure, indexeddb, dexie, foundation]
---

# POMO-200: Dexie.js Setup & Schema

## User Story

> Als **Entwickler**
> möchte ich **IndexedDB via Dexie.js als Storage-Layer einrichten**,
> damit **wir eine solide Grundlage für lokale Persistenz und späteren Cloud-Sync haben**.

## Kontext

Link zum Feature: [[features/local-first-persistence]]

Dies ist Story 1 von 5 der Local-First Migration. Dexie.js bietet eine elegante API über IndexedDB mit automatischer Schema-Versionierung, Transaktionen und TypeScript-Support.

**Reihenfolge:** POMO-200 → POMO-201 → POMO-202 → POMO-203 → POMO-206

## Akzeptanzkriterien

- [ ] **Given** die App startet, **When** IndexedDB verfügbar ist, **Then** wird die Dexie-Datenbank `ParticleDB` initialisiert
- [ ] **Given** IndexedDB nicht verfügbar (z.B. privater Modus Safari), **When** die App startet, **Then** wird ein Fallback-Flag gesetzt (localStorage bleibt aktiv)
- [ ] **Given** das Schema v1, **When** die DB initialisiert wird, **Then** werden alle Tables korrekt angelegt
- [ ] **Given** TypeScript, **When** auf die DB zugegriffen wird, **Then** sind alle Types strikt typisiert

## Technische Details

### Installation

```bash
pnpm add dexie
```

### Dateistruktur

```
src/lib/db/
├── index.ts              # Public exports
├── database.ts           # Dexie Setup & Schema
├── types.ts              # Entity Types mit Sync-Metadaten
└── feature-detection.ts  # IndexedDB Verfügbarkeit
```

### Entity Types

```typescript
// src/lib/db/types.ts

import type { SessionType } from '@/styles/design-tokens';

/**
 * Sync Status für spätere Cloud-Integration
 * - local: Nur lokal vorhanden
 * - pending: Geändert, wartet auf Sync
 * - synced: Mit Server synchronisiert
 * - conflict: Konflikt erkannt
 */
export type SyncStatus = 'local' | 'pending' | 'synced' | 'conflict';

/**
 * Basis-Interface für alle sync-fähigen Entities
 */
export interface SyncableEntity {
  id: string;
  syncStatus: SyncStatus;
  localUpdatedAt: string;      // ISO timestamp der letzten lokalen Änderung
  syncedAt?: string;           // ISO timestamp des letzten erfolgreichen Syncs
  serverId?: string;           // ID in der Cloud-DB (später)
  deleted?: boolean;           // Soft-delete Flag für Sync
}

/**
 * Session = Ein Partikel
 */
export interface DBSession extends SyncableEntity {
  type: SessionType;
  duration: number;            // Sekunden
  completedAt: string;         // ISO timestamp
  task?: string;
  projectId?: string;
  estimatedPomodoros?: number;
  presetId?: string;
  overflowDuration?: number;
  estimatedDuration?: number;
}

/**
 * Projekt zur Organisation von Sessions
 */
export interface DBProject extends SyncableEntity {
  name: string;
  brightness: number;          // 0.3 - 1.0
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Kürzlich verwendete Tasks für Autocomplete
 */
export interface DBRecentTask {
  text: string;                // Primary key
  lastUsed: string;            // ISO timestamp
  estimatedPomodoros?: number;
}

/**
 * User Settings (Key-Value Store)
 */
export interface DBSettings {
  key: string;                 // Primary key, z.B. 'timer', 'sound', 'visual'
  value: Record<string, unknown>;
  localUpdatedAt: string;
}

// ============================================
// Sync Metadata Helper Functions
// ============================================

/**
 * Fügt Sync-Metadaten zu einem neuen Entity hinzu
 */
export function withSyncMetadata<T extends object>(
  data: T,
  status: SyncStatus = 'local'
): T & Pick<SyncableEntity, 'syncStatus' | 'localUpdatedAt'> {
  return {
    ...data,
    syncStatus: status,
    localUpdatedAt: new Date().toISOString(),
  };
}

/**
 * Markiert ein Entity als lokal aktualisiert
 * Ändert syncStatus von 'synced' zu 'pending'
 */
export function markAsUpdated<T extends SyncableEntity>(entity: T): T {
  return {
    ...entity,
    syncStatus: entity.syncStatus === 'synced' ? 'pending' : entity.syncStatus,
    localUpdatedAt: new Date().toISOString(),
  };
}

/**
 * Markiert ein Entity als erfolgreich synchronisiert
 */
export function markAsSynced<T extends SyncableEntity>(
  entity: T,
  serverId?: string
): T {
  return {
    ...entity,
    syncStatus: 'synced' as SyncStatus,
    syncedAt: new Date().toISOString(),
    serverId: serverId || entity.serverId,
  };
}

/**
 * Markiert ein Entity als gelöscht (Soft-Delete)
 */
export function markAsDeleted<T extends SyncableEntity>(entity: T): T {
  return {
    ...entity,
    deleted: true,
    syncStatus: entity.syncStatus === 'synced' ? 'pending' : entity.syncStatus,
    localUpdatedAt: new Date().toISOString(),
  };
}
```

### Database Setup

```typescript
// src/lib/db/database.ts

import Dexie, { type Table } from 'dexie';
import type { DBSession, DBProject, DBRecentTask, DBSettings } from './types';

export class ParticleDB extends Dexie {
  sessions!: Table<DBSession, string>;
  projects!: Table<DBProject, string>;
  recentTasks!: Table<DBRecentTask, string>;
  settings!: Table<DBSettings, string>;

  constructor() {
    super('ParticleDB');

    // Schema v1 - Initial Setup
    this.version(1).stores({
      // Sessions: indexed by id, completedAt (für Datum-Queries), projectId, syncStatus
      sessions: 'id, completedAt, projectId, syncStatus, type',

      // Projects: indexed by id, archived, syncStatus
      projects: 'id, archived, syncStatus',

      // Recent Tasks: indexed by text (unique), lastUsed
      recentTasks: 'text, lastUsed',

      // Settings: key-value store
      settings: 'key',
    });
  }
}

// Singleton instance
let db: ParticleDB | null = null;

/**
 * Get the database instance (lazy initialization)
 */
export function getDB(): ParticleDB {
  if (!db) {
    db = new ParticleDB();
  }
  return db;
}

/**
 * Close the database (for testing/cleanup)
 */
export async function closeDB(): Promise<void> {
  if (db) {
    db.close();
    db = null;
  }
}
```

### Feature Detection

```typescript
// src/lib/db/feature-detection.ts

let _isAvailable: boolean | null = null;

/**
 * Check if IndexedDB is available
 * Caches result after first check
 */
export function isIndexedDBAvailable(): boolean {
  if (_isAvailable !== null) return _isAvailable;

  try {
    // Check if indexedDB exists
    if (typeof indexedDB === 'undefined') {
      _isAvailable = false;
      return false;
    }

    // Try to open a test database (catches Safari private mode)
    const testDB = indexedDB.open('__test__');
    testDB.onerror = () => {
      _isAvailable = false;
    };
    testDB.onsuccess = () => {
      indexedDB.deleteDatabase('__test__');
      _isAvailable = true;
    };

    // Assume available until proven otherwise
    _isAvailable = true;
    return true;
  } catch {
    _isAvailable = false;
    return false;
  }
}

/**
 * Storage mode - IndexedDB or localStorage fallback
 */
export type StorageMode = 'indexeddb' | 'localstorage';

export function getStorageMode(): StorageMode {
  return isIndexedDBAvailable() ? 'indexeddb' : 'localstorage';
}
```

### Public Exports

```typescript
// src/lib/db/index.ts

export { getDB, closeDB, ParticleDB } from './database';
export { isIndexedDBAvailable, getStorageMode, type StorageMode } from './feature-detection';
export {
  // Types
  type SyncStatus,
  type SyncableEntity,
  type DBSession,
  type DBProject,
  type DBRecentTask,
  type DBSettings,
  // Helper Functions
  withSyncMetadata,
  markAsUpdated,
  markAsSynced,
  markAsDeleted,
} from './types';
```

## Testing

### Manuell zu testen

- [ ] App startet ohne Fehler
- [ ] Browser DevTools > Application > IndexedDB zeigt `ParticleDB`
- [ ] Alle Tables sind vorhanden: sessions, projects, recentTasks, settings
- [ ] In Safari Private Mode: App funktioniert weiter (Fallback)

### Automatisierte Tests

```typescript
// src/lib/db/__tests__/database.test.ts

import { getDB, closeDB } from '../database';
import { isIndexedDBAvailable } from '../feature-detection';

describe('ParticleDB', () => {
  afterEach(async () => {
    await closeDB();
  });

  it('returns singleton instance', () => {
    const db1 = getDB();
    const db2 = getDB();
    expect(db1).toBe(db2);
  });

  it('has all required tables', () => {
    const db = getDB();
    expect(db.sessions).toBeDefined();
    expect(db.projects).toBeDefined();
    expect(db.recentTasks).toBeDefined();
    expect(db.settings).toBeDefined();
  });

  it('can perform basic CRUD operations', async () => {
    const db = getDB();

    // Create
    const id = 'test-session-1';
    await db.sessions.add({
      id,
      type: 'work',
      duration: 1500,
      completedAt: new Date().toISOString(),
      syncStatus: 'local',
      localUpdatedAt: new Date().toISOString(),
    });

    // Read
    const session = await db.sessions.get(id);
    expect(session).toBeDefined();
    expect(session?.duration).toBe(1500);

    // Delete
    await db.sessions.delete(id);
    const deleted = await db.sessions.get(id);
    expect(deleted).toBeUndefined();
  });
});

describe('Feature Detection', () => {
  it('returns boolean for isIndexedDBAvailable', () => {
    const result = isIndexedDBAvailable();
    expect(typeof result).toBe('boolean');
  });
});
```

## Definition of Done

- [ ] Dexie.js installiert (`pnpm add dexie`)
- [ ] `src/lib/db/` Ordner mit allen Dateien erstellt
- [ ] ParticleDB Klasse mit Schema v1
- [ ] Feature Detection für IndexedDB
- [ ] TypeScript Types für alle Entities
- [ ] Sync-Metadata Helper Functions (`withSyncMetadata`, `markAsUpdated`, etc.)
- [ ] Singleton-Pattern für DB-Instanz
- [ ] Unit Tests geschrieben & grün
- [ ] Lokal getestet (Chrome, Firefox, Safari)
- [ ] Keine console.errors

## Notizen

**Warum Dexie.js?**
- Elegante Promise-basierte API
- Automatische Schema-Migrationen
- Exzellenter TypeScript-Support
- Battle-tested (>1M weekly downloads)
- Nur ~20KB gzipped

**Schema-Versionierung:**
- Aktuelle Version: 1
- Bei Schema-Änderungen: `this.version(2).stores({...}).upgrade(...)`
- Dexie handhabt Migrationen automatisch

---

## Arbeitsverlauf

### Gestartet:
2026-01-30: Implementierung gestartet

### Erledigt:
- [x] Dexie.js installiert (`pnpm add dexie`)
- [x] `src/lib/db/` Ordner mit allen Dateien erstellt
- [x] ParticleDB Klasse mit Schema v1
- [x] Feature Detection für IndexedDB
- [x] TypeScript Types für alle Entities
- [x] Sync-Metadata Helper Functions
- [x] Singleton-Pattern für DB-Instanz
- [x] Unit Tests geschrieben & grün (13/13)
- [x] fake-indexeddb für Tests installiert
- [x] TypeScript check passed
- [x] Build passed
