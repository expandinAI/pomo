---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/local-first-persistence]]"
created: 2026-01-28
updated: 2026-01-28
done_date: null
tags: [infrastructure, sync, metadata]
---

# Sync-Metadaten Implementation

## User Story

> Als **System**
> möchte ich **Sync-Metadaten auf allen Entities tracken**,
> damit **wir später nahtlos Cloud-Sync implementieren können**.

## Kontext

Link zum Feature: [[features/local-first-persistence]]

Jede Entity (Session, Project) braucht Metadaten, die den Sync-Status tracken. Dies ist die Vorbereitung für Cloud-Sync.

## Akzeptanzkriterien

- [ ] **Given** eine neue Session, **When** sie erstellt wird, **Then** hat sie `syncStatus: 'local'` und `localUpdatedAt`
- [ ] **Given** eine Entity wird geändert, **When** das Update gespeichert wird, **Then** wird `localUpdatedAt` aktualisiert
- [ ] **Given** alle Storage-Funktionen, **When** sie Daten schreiben, **Then** setzen sie automatisch Sync-Metadaten

## Technische Details

### Betroffene Dateien
```
src/lib/storage/
├── types.ts              # ÄNDERN: SyncableEntity Interface
├── sessions.ts           # ÄNDERN: Sync-Metadaten bei CRUD
├── projects.ts           # ÄNDERN: Sync-Metadaten bei CRUD
└── utils.ts              # NEU: Helper für Sync-Metadaten
```

### Implementierungshinweise

```typescript
// src/lib/storage/types.ts

export type SyncStatus = 'local' | 'pending' | 'synced' | 'conflict';

export interface SyncableEntity {
  id: string;
  syncStatus: SyncStatus;
  localUpdatedAt: string;      // ISO timestamp
  syncedAt?: string;           // Wann zuletzt mit Server sync'd
  serverId?: string;           // ID in Supabase
  deleted?: boolean;           // Soft-delete für Sync
}

export interface Session extends SyncableEntity {
  type: 'work' | 'short_break' | 'long_break';
  duration: number;
  completedAt: string;
  task?: string;
  projectId?: string;
  // ... rest
}
```

### Helper-Funktionen

```typescript
// src/lib/storage/utils.ts

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

export function markAsUpdated<T extends SyncableEntity>(entity: T): T {
  return {
    ...entity,
    syncStatus: entity.syncStatus === 'synced' ? 'pending' : entity.syncStatus,
    localUpdatedAt: new Date().toISOString(),
  };
}

export function markAsSynced<T extends SyncableEntity>(
  entity: T,
  serverId?: string
): T {
  return {
    ...entity,
    syncStatus: 'synced',
    syncedAt: new Date().toISOString(),
    serverId: serverId || entity.serverId,
  };
}
```

## Testing

### Manuell zu testen
- [ ] Neue Session erstellen → hat syncStatus 'local'
- [ ] Neues Projekt erstellen → hat syncStatus 'local'
- [ ] localUpdatedAt ist valider ISO-String

### Automatisierte Tests
- [ ] Unit Test: `withSyncMetadata()` fügt korrekte Felder hinzu
- [ ] Unit Test: `markAsUpdated()` ändert Status von 'synced' zu 'pending'
- [ ] Unit Test: `markAsSynced()` setzt alle Sync-Felder korrekt

## Definition of Done

- [ ] Code implementiert
- [ ] Types exportiert und verwendbar
- [ ] Alle Storage-Funktionen nutzen Sync-Metadaten
- [ ] Tests grün
