---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-29
done_date: null
tags: [infrastructure, sync, conflict]
---

# POMO-306: Conflict Resolution (Last-Write-Wins)

## User Story

> Als **Nutzer mit mehreren Geräten**
> möchte ich **dass Konflikte automatisch gelöst werden**,
> damit **ich mir keine Sorgen um Datenverlust machen muss**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

**Vorgänger:** POMO-305 (Sync Service)

Konflikte können entstehen, wenn dasselbe Entity auf zwei Geräten gleichzeitig geändert wird, während beide offline sind. Unsere Strategie: **Last-Write-Wins (LWW)**.

**Warum LWW?**
- Einfach zu verstehen und zu implementieren
- Deterministisch (gleiche Inputs → gleiches Ergebnis)
- Keine User-Intervention nötig
- Für Pomodoro-Daten ausreichend (kein kollaboratives Editing)

**Reihenfolge:** POMO-305 → **POMO-306** → POMO-307 → ...

## Akzeptanzkriterien

- [ ] **Given** lokale Änderung neuer als Server, **When** Sync, **Then** lokale Version gewinnt (wird gepusht)
- [ ] **Given** Server-Änderung neuer als lokal, **When** Sync, **Then** Server-Version gewinnt (wird lokal überschrieben)
- [ ] **Given** gleicher Timestamp (sehr selten), **When** Sync, **Then** Server gewinnt (deterministisch)
- [ ] **Given** gelöschtes Entity auf Server, **When** Sync, **Then** wird lokal gelöscht

## Technische Details

### Dateistruktur

```
src/lib/sync/
├── conflict-resolution.ts    # NEU: Conflict Resolution Logik
└── sync-service.ts           # ÄNDERN: Integration
```

### Conflict Resolution

```typescript
// src/lib/sync/conflict-resolution.ts

import type { SyncableEntity } from '@/lib/db';

export type ConflictResolution = 'keep_local' | 'use_remote';

/**
 * Löst einen Konflikt zwischen lokaler und Server-Version.
 * Strategie: Last-Write-Wins (LWW)
 *
 * @param local - Lokale Entity-Version
 * @param remoteUpdatedAt - Server updated_at Timestamp
 * @returns 'keep_local' wenn lokal neuer, 'use_remote' wenn Server neuer
 */
export function resolveConflict(
  local: SyncableEntity,
  remoteUpdatedAt: string
): ConflictResolution {
  const localTime = new Date(local.localUpdatedAt).getTime();
  const remoteTime = new Date(remoteUpdatedAt).getTime();

  if (localTime > remoteTime) {
    return 'keep_local';
  }

  if (remoteTime > localTime) {
    return 'use_remote';
  }

  // Gleicher Timestamp (sehr selten): Server gewinnt für Determinismus
  // Dies sorgt dafür, dass alle Clients zum gleichen Ergebnis kommen
  return 'use_remote';
}

/**
 * Prüft ob eine Server-Version neuer ist als die lokale.
 * Utility-Funktion für einfache Checks.
 */
export function isRemoteNewer(
  localUpdatedAt: string,
  remoteUpdatedAt: string
): boolean {
  return new Date(remoteUpdatedAt).getTime() >= new Date(localUpdatedAt).getTime();
}

/**
 * Prüft ob ein Entity als gelöscht markiert wurde.
 */
export function isDeleted(remote: Record<string, unknown>): boolean {
  return remote.deleted_at !== null && remote.deleted_at !== undefined;
}
```

### Integration in Sync Service

Die Conflict Resolution ist bereits in POMO-305 (Sync Service) integriert. Hier die relevanten Stellen:

```typescript
// In sync-service.ts mergeSession/mergeProject:

private async mergeSession(remote: Record<string, unknown>): Promise<void> {
  const clientId = remote.client_id as string;

  // 1. Gelöschte Sessions lokal löschen
  if (isDeleted(remote)) {
    await this.db.sessions.delete(clientId);
    return;
  }

  const local = await this.db.sessions.get(clientId);

  if (!local) {
    // 2. Neu vom Server → Einfach einfügen
    await this.db.sessions.add(this.toLocalSession(remote));
    return;
  }

  // 3. Conflict Resolution
  const resolution = resolveConflict(local, remote.updated_at as string);

  if (resolution === 'use_remote') {
    // Server gewinnt → Lokal überschreiben
    await this.db.sessions.update(clientId, {
      ...this.toLocalSession(remote),
      syncStatus: 'synced',
      syncedAt: new Date().toISOString(),
    });
  }
  // Wenn 'keep_local': Nichts tun - wird beim nächsten Push gesynct
}
```

### Edge Cases

| Szenario | Verhalten |
|----------|-----------|
| Create auf A, Create auf B (gleiche ID) | Unmöglich (UUID sind global unique) |
| Update auf A, Update auf B (gleichzeitig) | Neuerer Timestamp gewinnt |
| Update auf A, Delete auf B | Neuerer Timestamp gewinnt |
| Delete auf A, Delete auf B | Beide löschen → kein Konflikt |
| Offline für Wochen, dann Sync | Alle Änderungen werden gesynct, LWW entscheidet |

### Soft-Delete Handling

```typescript
// Soft-Delete lokal markieren (wird dann gepusht)
export async function softDelete(
  db: ParticleDB,
  entityId: string,
  type: 'sessions' | 'projects'
): Promise<void> {
  await db[type].update(entityId, {
    deleted: true,
    syncStatus: 'pending',
    localUpdatedAt: new Date().toISOString(),
  });
}

// Beim Push: Soft-Delete an Server senden
async pushDelete(entityId: string, type: EntityType): Promise<void> {
  const { error } = await this.supabase
    .from(type)
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('client_id', entityId)
    .eq('user_id', this.userId);

  if (error) throw error;
}

// Beim Pull: Gelöschte Entities lokal entfernen
if (isDeleted(remote)) {
  await this.db[type].delete(remote.client_id);
  return;
}
```

### Timestamp-Präzision

```typescript
/**
 * Generiert einen präzisen ISO-Timestamp.
 * Nutzt Millisekunden-Präzision für bessere Konfliktauflösung.
 */
export function now(): string {
  return new Date().toISOString();
}

// Bei jeder lokalen Änderung:
entity.localUpdatedAt = now();
entity.syncStatus = entity.syncStatus === 'synced' ? 'pending' : entity.syncStatus;
```

## Testing

### Manuell zu testen

- [ ] Gerät A offline → Session editieren → Online → Session erscheint auf Server
- [ ] Gerät B hatte auch editiert → Neuerer Timestamp gewinnt
- [ ] Session auf A löschen, auf B editieren → Was neuerer ist, gewinnt
- [ ] Beide Geräte gleichzeitig offline, dann online → Kein Datenverlust

### Automatisierte Tests

```typescript
describe('Conflict Resolution', () => {
  it('keeps local when local is newer', () => {
    const local = {
      id: 'session-1',
      localUpdatedAt: '2024-01-15T12:00:00.000Z',
    } as SyncableEntity;

    const result = resolveConflict(local, '2024-01-15T11:00:00.000Z');

    expect(result).toBe('keep_local');
  });

  it('uses remote when remote is newer', () => {
    const local = {
      id: 'session-1',
      localUpdatedAt: '2024-01-15T11:00:00.000Z',
    } as SyncableEntity;

    const result = resolveConflict(local, '2024-01-15T12:00:00.000Z');

    expect(result).toBe('use_remote');
  });

  it('uses remote when timestamps are equal (determinism)', () => {
    const timestamp = '2024-01-15T12:00:00.000Z';
    const local = {
      id: 'session-1',
      localUpdatedAt: timestamp,
    } as SyncableEntity;

    const result = resolveConflict(local, timestamp);

    expect(result).toBe('use_remote');
  });

  it('detects deleted entities', () => {
    const remote = { deleted_at: '2024-01-15T12:00:00.000Z' };

    expect(isDeleted(remote)).toBe(true);
  });

  it('handles null deleted_at', () => {
    const remote = { deleted_at: null };

    expect(isDeleted(remote)).toBe(false);
  });
});

describe('Merge Integration', () => {
  it('overwrites local when server is newer', async () => {
    // Setup: lokale Session älter als Server
    await db.sessions.add({
      id: 'session-1',
      localUpdatedAt: '2024-01-15T11:00:00.000Z',
      task: 'Old Task',
      // ...
    });

    // Server hat neuere Version
    await syncService.mergeSession({
      client_id: 'session-1',
      updated_at: '2024-01-15T12:00:00.000Z',
      task: 'New Task',
      // ...
    });

    const session = await db.sessions.get('session-1');
    expect(session?.task).toBe('New Task');
  });

  it('keeps local when local is newer', async () => {
    await db.sessions.add({
      id: 'session-1',
      localUpdatedAt: '2024-01-15T12:00:00.000Z',
      task: 'Local Task',
      // ...
    });

    await syncService.mergeSession({
      client_id: 'session-1',
      updated_at: '2024-01-15T11:00:00.000Z',
      task: 'Server Task',
      // ...
    });

    const session = await db.sessions.get('session-1');
    expect(session?.task).toBe('Local Task');
  });

  it('deletes local when server is deleted', async () => {
    await db.sessions.add({
      id: 'session-1',
      localUpdatedAt: '2024-01-15T11:00:00.000Z',
      // ...
    });

    await syncService.mergeSession({
      client_id: 'session-1',
      deleted_at: '2024-01-15T12:00:00.000Z',
      // ...
    });

    const session = await db.sessions.get('session-1');
    expect(session).toBeUndefined();
  });
});
```

## Definition of Done

- [ ] `resolveConflict()` implementiert
- [ ] `isDeleted()` Helper implementiert
- [ ] Soft-Delete Sync funktioniert (lokal → Server, Server → lokal)
- [ ] Deterministische Conflict Resolution (gleicher Timestamp → Server gewinnt)
- [ ] Keine Datenverluste bei Konflikten
- [ ] Tests geschrieben & grün

## Notizen

**Warum Server gewinnt bei gleichem Timestamp?**
- Extrem selten (Millisekunden-Präzision)
- Determinismus wichtig: Alle Clients müssen zum gleichen Ergebnis kommen
- Server als "Single Source of Truth" bei Gleichstand

**Warum Soft-Delete?**
- Hard-Delete würde Sync-Konflikte verursachen
- Client weiß nicht, dass Entity gelöscht wurde
- Soft-Delete wird bei Pull erkannt und lokal ausgeführt
- Cleanup-Job kann später alte deleted Einträge entfernen

**Millisekunden-Präzision:**
- ISO 8601 mit Millisekunden: `2024-01-15T12:00:00.123Z`
- Reicht für Pomodoro-Timer (keine Echtzeit-Kollaboration)
- Bei echter Gleichzeitigkeit (< 1ms): Server gewinnt

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
