---
type: story
status: backlog
priority: p0
effort: 2
feature: "[[features/local-first-persistence]]"
created: 2026-01-28
updated: 2026-01-28
done_date: null
tags: [infrastructure, indexeddb, dexie]
---

# Dexie.js Setup & Schema

## User Story

> Als **Entwickler**
> möchte ich **IndexedDB via Dexie.js als Storage-Layer einrichten**,
> damit **wir eine solide Grundlage für lokale Persistenz und späteren Sync haben**.

## Kontext

Link zum Feature: [[features/local-first-persistence]]

Dies ist die erste Story der Local-First Migration. Dexie.js bietet eine elegante API über IndexedDB mit automatischer Versionierung, Transaktionen und TypeScript-Support.

## Akzeptanzkriterien

- [ ] **Given** die App startet, **When** IndexedDB verfügbar ist, **Then** wird die Dexie-Datenbank initialisiert
- [ ] **Given** IndexedDB nicht verfügbar, **When** die App startet, **Then** fällt sie auf localStorage zurück
- [ ] **Given** das Schema, **When** die DB initialisiert wird, **Then** werden alle Tables korrekt angelegt
- [ ] **Given** TypeScript, **When** auf die DB zugegriffen wird, **Then** sind alle Types korrekt

## Technische Details

### Betroffene Dateien
```
src/lib/storage/
├── db.ts                 # NEU: Dexie Setup
├── types.ts              # NEU: Shared Types
└── index.ts              # NEU: Public Exports
```

### Implementierungshinweise

1. Dexie.js installieren: `npm install dexie`
2. Database-Klasse mit Schema definieren
3. Singleton-Pattern für DB-Instanz
4. Feature Detection für IndexedDB

### Code-Beispiel

```typescript
// src/lib/storage/db.ts
import Dexie, { Table } from 'dexie';
import type { Session, Project, RecentTask, QueuedChange } from './types';

export class ParticleDB extends Dexie {
  sessions!: Table<Session>;
  projects!: Table<Project>;
  recentTasks!: Table<RecentTask>;
  syncQueue!: Table<QueuedChange>;

  constructor() {
    super('ParticleDB');

    this.version(1).stores({
      sessions: 'id, completedAt, projectId, syncStatus, type',
      projects: 'id, name, archived, syncStatus',
      recentTasks: 'text, lastUsed',
      syncQueue: 'id, entityType, createdAt'
    });
  }
}

// Singleton
let dbInstance: ParticleDB | null = null;

export function getDB(): ParticleDB {
  if (!dbInstance) {
    dbInstance = new ParticleDB();
  }
  return dbInstance;
}

// Feature Detection
export function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined';
  } catch {
    return false;
  }
}
```

## Testing

### Manuell zu testen
- [ ] App startet ohne Fehler
- [ ] IndexedDB wird im Browser DevTools angelegt (Application > IndexedDB)
- [ ] Alle Tables sind vorhanden: sessions, projects, recentTasks, syncQueue

### Automatisierte Tests
- [ ] Unit Test: `isIndexedDBAvailable()` gibt korrekten Boolean
- [ ] Unit Test: `getDB()` gibt immer dieselbe Instanz zurück

## Definition of Done

- [ ] Code implementiert
- [ ] Tests geschrieben & grün
- [ ] Code reviewed (selbst oder AI)
- [ ] Lokal getestet
- [ ] Keine console.errors im Browser

## Notizen

- Dexie Docs: https://dexie.org/docs/Tutorial/Getting-started
- Version 1 ist das initiale Schema - spätere Migrationen erhöhen die Version
