---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-28
done_date: null
tags: [infrastructure, sync, conflict]
---

# Conflict Resolution Logic

## User Story

> Als **Nutzer mit mehreren Geräten**
> möchte ich **dass Konflikte automatisch gelöst werden**,
> damit **ich mir keine Sorgen um Datenverlust machen muss**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

Konflikte können entstehen, wenn dasselbe Entity auf zwei Geräten gleichzeitig geändert wird, während beide offline sind. Unsere Strategie: Last-Write-Wins (LWW).

## Akzeptanzkriterien

- [ ] **Given** lokale Änderung neuer als Server, **When** Sync, **Then** lokale Version gewinnt
- [ ] **Given** Server-Änderung neuer als lokal, **When** Sync, **Then** Server-Version gewinnt
- [ ] **Given** gleicher Timestamp (sehr selten), **When** Sync, **Then** Server gewinnt (deterministisch)

## Technische Details

### Last-Write-Wins Implementation

```typescript
// src/lib/sync/conflict-resolution.ts

export function resolveConflict<T extends SyncableEntity>(
  local: T,
  remote: ServerEntity
): 'keep_local' | 'use_remote' {
  const localTime = new Date(local.localUpdatedAt).getTime();
  const remoteTime = new Date(remote.updated_at).getTime();

  if (localTime > remoteTime) {
    return 'keep_local';
  }

  if (remoteTime > localTime) {
    return 'use_remote';
  }

  // Same timestamp (very rare) - server wins for determinism
  return 'use_remote';
}

// In Sync Service:
async function mergeEntity(remote: ServerEntity, type: EntityType): Promise<void> {
  const local = await db[type].get(remote.client_id);

  if (!local) {
    // No local version - just insert
    await db[type].add(toLocalFormat(remote));
    return;
  }

  const resolution = resolveConflict(local, remote);

  if (resolution === 'use_remote') {
    await db[type].update(local.id, {
      ...toLocalFormat(remote),
      syncStatus: 'synced',
      syncedAt: new Date().toISOString(),
    });
  }
  // If keep_local, do nothing - local will be pushed on next sync
}
```

### Soft-Delete Handling

```typescript
// Gelöschte Entities müssen auch synchronisiert werden

export async function softDelete(id: string, type: EntityType): Promise<void> {
  await db[type].update(id, {
    deleted: true,
    syncStatus: 'pending',
    localUpdatedAt: new Date().toISOString(),
  });
}

// Beim Pull: Gelöschte Entities auch lokal löschen
if (remote.deleted_at) {
  await db[type].delete(remote.client_id);
  return;
}
```

### Edge Cases

| Szenario | Verhalten |
|----------|-----------|
| Create auf A, Create auf B (gleiche ID) | Unmöglich (UUID) |
| Update auf A, Delete auf B | Neueres Timestamp gewinnt |
| Offline für Wochen, dann Sync | Alle Änderungen werden gesynct |

## Testing

### Manuell zu testen
- [ ] Gerät A offline → Session editieren → Online → Sync
- [ ] Gerät B hatte auch editiert → Neueres gewinnt
- [ ] Keine Daten gehen verloren

### Automatisierte Tests
- [ ] Unit Test: `resolveConflict()` mit verschiedenen Timestamps
- [ ] Unit Test: Gleicher Timestamp → Server gewinnt
- [ ] Integration Test: Zwei Clients, gleichzeitige Änderungen

## Definition of Done

- [ ] Last-Write-Wins implementiert
- [ ] Soft-Delete Sync funktioniert
- [ ] Deterministische Conflict Resolution
- [ ] Tests grün
