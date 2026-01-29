---
type: story
status: icebox
priority: p2
effort: 3
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-29
done_date: null
tags: [infrastructure, sync, offline, cloud]
---

# POMO-205: Offline Queue System (Cloud Sync)

> **⚠️ ICEBOX**: Diese Story gehört zur Cloud-Sync Serie (POMO-300+), nicht zur localStorage-Migration (POMO-200+). Sie wird relevant, wenn wir Cloud-Accounts implementieren.

## User Story

> Als **Nutzer mit instabiler Verbindung**
> möchte ich **dass meine Änderungen gequeued werden**,
> damit **sie später synchronisiert werden, wenn ich wieder online bin**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

**Voraussetzungen:**
- POMO-300 (Clerk Setup)
- POMO-301 (Supabase Schema)
- POMO-305 (Sync Service)

Die Offline Queue speichert alle Änderungen, die noch nicht mit dem Server synchronisiert wurden. Sie wird vom Sync-Service abgearbeitet, sobald der User online und eingeloggt ist.

## Akzeptanzkriterien

- [ ] **Given** eine neue Session, **When** sie erstellt wird, **Then** wird ein Queue-Eintrag angelegt
- [ ] **Given** die Queue, **When** Einträge verarbeitet werden sollen, **Then** werden sie FIFO abgearbeitet
- [ ] **Given** ein erfolgreicher Sync, **When** der Eintrag verarbeitet wurde, **Then** wird er aus der Queue entfernt
- [ ] **Given** ein Sync-Fehler, **When** der Retry-Count < 5, **Then** wird der Eintrag für Retry markiert

## Technische Details

### Betroffene Dateien
```
src/lib/storage/
├── types.ts              # ÄNDERN: QueuedChange Interface
├── sync-queue.ts         # NEU: Queue Management
└── db.ts                 # ÄNDERN: syncQueue Table
```

### Implementierungshinweise

```typescript
// src/lib/storage/types.ts

export interface QueuedChange {
  id: string;
  entityType: 'session' | 'project' | 'settings';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload: unknown;
  createdAt: string;
  retryCount: number;
  lastError?: string;
  nextRetryAt?: string;
}
```

### Queue-Service

```typescript
// src/lib/storage/sync-queue.ts

export async function enqueue(change: Omit<QueuedChange, 'id' | 'createdAt' | 'retryCount'>): Promise<void> {
  const db = getDB();
  await db.syncQueue.add({
    ...change,
    id: generateId(),
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });
}

export async function getNextBatch(limit = 50): Promise<QueuedChange[]> {
  const db = getDB();
  const now = new Date().toISOString();

  return db.syncQueue
    .filter(c => !c.nextRetryAt || c.nextRetryAt <= now)
    .limit(limit)
    .sortBy('createdAt');
}

export async function markProcessed(id: string): Promise<void> {
  await getDB().syncQueue.delete(id);
}

export async function markFailed(id: string, error: string): Promise<void> {
  const db = getDB();
  const change = await db.syncQueue.get(id);

  if (!change) return;

  if (change.retryCount >= 5) {
    // Move to dead letter queue or notify user
    console.error(`Queue item ${id} failed permanently:`, error);
    await db.syncQueue.delete(id);
    return;
  }

  // Exponential backoff: 1min, 2min, 4min, 8min, 16min
  const backoffMs = Math.pow(2, change.retryCount) * 60 * 1000;

  await db.syncQueue.update(id, {
    retryCount: change.retryCount + 1,
    lastError: error,
    nextRetryAt: new Date(Date.now() + backoffMs).toISOString(),
  });
}

export async function getQueueStats(): Promise<QueueStats> {
  const db = getDB();
  const all = await db.syncQueue.toArray();

  return {
    total: all.length,
    pending: all.filter(c => !c.nextRetryAt).length,
    retrying: all.filter(c => c.retryCount > 0).length,
    oldestAt: all[0]?.createdAt,
  };
}
```

## Testing

### Manuell zu testen
- [ ] Session erstellen → Queue-Eintrag erscheint in IndexedDB
- [ ] Queue Stats zeigen korrekte Anzahl
- [ ] Nach "Sync" (später): Queue-Eintrag verschwindet

### Automatisierte Tests
- [ ] Unit Test: `enqueue()` fügt Eintrag hinzu
- [ ] Unit Test: `getNextBatch()` sortiert nach createdAt
- [ ] Unit Test: `markFailed()` erhöht retryCount und setzt nextRetryAt
- [ ] Unit Test: Nach 5 Fehlern wird Eintrag gelöscht

## Definition of Done

- [ ] Code implementiert
- [ ] Queue-Einträge werden bei allen Schreiboperationen erstellt
- [ ] Tests grün
- [ ] Exponential Backoff funktioniert korrekt
