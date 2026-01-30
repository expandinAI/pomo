---
type: decision
status: accepted
date: 2026-01-28
superseded_by: null
tags: [architecture, sync, offline-first]
---

# ADR-003: Sync Strategy

## Status

**accepted**

## Kontext

Particle muss Daten zwischen Web, Mac und iOS synchronisieren. Die Anforderungen:

1. **Offline-First** – App funktioniert immer, auch ohne Verbindung
2. **Near-Time Sync** – Änderungen erscheinen innerhalb von Sekunden auf anderen Geräten
3. **Kein Realtime-Timer-Sync** – Timer müssen NICHT live zwischen Geräten synchronisiert werden
4. **Konflikt-Tolerant** – Parallele Änderungen auf verschiedenen Geräten dürfen nicht zu Datenverlust führen
5. **Ressourcen-Schonend** – Keine unnötige Last auf Client oder Server

### Typische Nutzungsszenarien

| Szenario | Anforderung |
|----------|-------------|
| Partikel auf iPhone abschließen | Push innerhalb von 1-3 Sekunden |
| Mac App öffnen nach iPhone-Nutzung | Neue Daten beim Start sichtbar |
| Beide Apps gleichzeitig offen | Daten innerhalb von 30s synchronisiert |
| Offline arbeiten | Alles lokal gespeichert, sync wenn online |

## Entscheidung

Wir werden **Near-Time Sync** mit **Event-basiertem Push** und **Periodic Pull** implementieren.

### Sync-Modell

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   UI Event   │───►│  Local DB    │───►│ Sync Queue   │   │
│  │ (z.B. Timer  │    │  (IndexedDB) │    │              │   │
│  │  completed)  │    │              │    │              │   │
│  └──────────────┘    └──────────────┘    └──────┬───────┘   │
│                                                  │           │
│                                          Push (sofort)      │
│                                                  │           │
└──────────────────────────────────────────────────┼───────────┘
                                                   │
                                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                        SUPABASE                              │
└─────────────────────────────────────────────────────────────┘
                                                   │
                                          Pull (alle 30s)     │
                                                   │           │
┌──────────────────────────────────────────────────┼───────────┐
│                         CLIENT                   │           │
│                                                  ▼           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │     UI       │◄───│  Local DB    │◄───│ Sync Service │   │
│  │  (Updates)   │    │  (IndexedDB) │    │              │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Drei Sync-Mechanismen

#### 1. Event-basierter Push (sofort)

Wenn ein Partikel abgeschlossen wird:
1. Sofort in lokale DB speichern
2. UI reagiert instant (optimistic)
3. Async: In Sync Queue einfügen
4. Async: An Supabase pushen
5. Bei Erfolg: Queue-Eintrag löschen
6. Bei Fehler: Retry mit Exponential Backoff

```typescript
async function completeSession(session: Session): Promise<void> {
  // 1. Lokal speichern (sofort)
  await db.sessions.add({
    ...session,
    syncStatus: 'pending',
    localUpdatedAt: new Date().toISOString(),
  });

  // 2. UI ist schon aktualisiert (optimistic)

  // 3. Async push
  syncService.pushSession(session).catch(err => {
    // Fehler werden von Queue gehandhabt
    console.warn('Push failed, will retry:', err);
  });
}
```

#### 2. Periodic Pull (alle 30 Sekunden)

Im Hintergrund wird regelmäßig nach neuen Daten gefragt:

```typescript
class SyncService {
  private lastSyncAt: string | null = null;

  async startPeriodicSync(): Promise<void> {
    // Initial sync
    await this.pull();

    // Dann alle 30 Sekunden
    setInterval(() => this.pull(), 30_000);
  }

  async pull(): Promise<SyncResult> {
    const since = this.lastSyncAt || '1970-01-01T00:00:00Z';

    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .gt('updated_at', since)
      .order('updated_at', { ascending: true });

    for (const remote of sessions || []) {
      await this.mergeSession(remote);
    }

    this.lastSyncAt = new Date().toISOString();
    return { count: sessions?.length || 0 };
  }
}
```

#### 3. Lifecycle Sync (bei App-Events)

Zusätzlicher Sync bei bestimmten Events:

| Event | Aktion |
|-------|--------|
| App Start | Full Pull |
| Tab/App Focus | Pull seit letztem Sync |
| Online nach Offline | Queue abarbeiten + Pull |
| Vor App Close | Pending Changes pushen |

```typescript
// Browser
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    syncService.pull();
  }
});

window.addEventListener('online', () => {
  syncService.processQueue();
  syncService.pull();
});

// iOS/Mac (Swift)
NotificationCenter.default.addObserver(
  forName: UIApplication.didBecomeActiveNotification
) { _ in
  Task { await syncService.pull() }
}
```

### Conflict Resolution: Last-Write-Wins

Da Partikel unabhängige Einheiten sind (keine Bearbeitung nach Erstellung), ist Last-Write-Wins ausreichend:

```typescript
async function mergeSession(remote: ServerSession): Promise<void> {
  const local = await db.sessions
    .where('id')
    .equals(remote.client_id)
    .first();

  if (!local) {
    // Neu vom Server → einfügen
    await db.sessions.add(toLocalFormat(remote));
    return;
  }

  const remoteTime = new Date(remote.updated_at).getTime();
  const localTime = new Date(local.localUpdatedAt).getTime();

  if (remoteTime > localTime) {
    // Server ist neuer → überschreiben
    await db.sessions.update(local.id, {
      ...toLocalFormat(remote),
      syncStatus: 'synced',
    });
  }
  // Sonst: Lokal ist neuer, wird beim nächsten Push hochgeladen
}
```

### Offline Queue

Änderungen werden in einer Queue gespeichert und bei Verbindung abgearbeitet:

```typescript
interface QueuedChange {
  id: string;
  entityType: 'session' | 'project' | 'settings';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload: unknown;
  createdAt: string;
  retryCount: number;
  nextRetryAt?: string;
}

// Queue Processing
async function processQueue(): Promise<void> {
  const pending = await db.syncQueue
    .filter(c => !c.nextRetryAt || c.nextRetryAt <= now())
    .toArray();

  for (const change of pending) {
    try {
      await pushChange(change);
      await db.syncQueue.delete(change.id);
    } catch (err) {
      await handleRetry(change, err);
    }
  }
}

// Exponential Backoff
async function handleRetry(change: QueuedChange, error: Error): Promise<void> {
  if (change.retryCount >= 5) {
    // Nach 5 Versuchen aufgeben (User benachrichtigen)
    await notifyUser('Sync fehlgeschlagen', change);
    await db.syncQueue.delete(change.id);
    return;
  }

  const backoffMs = Math.pow(2, change.retryCount) * 60_000;
  // 1min, 2min, 4min, 8min, 16min

  await db.syncQueue.update(change.id, {
    retryCount: change.retryCount + 1,
    nextRetryAt: new Date(Date.now() + backoffMs).toISOString(),
    lastError: error.message,
  });
}
```

## Optionen

### Option A: Realtime Sync (WebSockets)

**Beschreibung:** Supabase Realtime für instant Updates.

**Pro:**
- Änderungen erscheinen sofort (<100ms)
- Keine Polling-Last

**Contra:**
- Komplexer (WebSocket-Verbindung managen)
- Mehr Serverkosten
- Overkill für unseren Use Case
- Batterie-intensiver auf Mobile

### Option B: Polling Only (alle 10s)

**Beschreibung:** Nur periodisches Polling, kein Event-Push.

**Pro:**
- Sehr einfach
- Weniger Code

**Contra:**
- 10s Verzögerung bei eigenen Änderungen
- Unnötige Requests wenn nichts passiert
- Schlechte UX nach Partikel-Completion

### Option C: Event Push + Periodic Pull *(gewählt)*

**Beschreibung:** Sofortiger Push bei Änderungen, Polling nur für fremde Änderungen.

**Pro:**
- Eigene Änderungen sind sofort synchronisiert
- Fremde Änderungen kommen innerhalb von 30s
- Geringere Last als reines Polling
- Funktioniert offline (Queue)
- Einfacher als Realtime

**Contra:**
- Bis zu 30s Verzögerung für fremde Änderungen
- Zwei Mechanismen zu pflegen

## Konsequenzen

### Positive
- Sehr gute UX: Eigene Änderungen fühlen sich instant an
- Offline funktioniert komplett
- Skaliert gut (weniger Server-Load als Realtime)
- Einfach zu debuggen und zu testen
- Batterieschonend auf Mobile

### Negative
- 30s Verzögerung bei Sync zwischen Geräten
- Queue-Management nötig
- Edge Cases bei Offline → Online Transition

### Risiken
- Queue wächst bei langer Offline-Zeit → Queue-Limit setzen
- Retry-Logik kann komplex werden → Gute Abstraktion

## Sync-Status im UI

Der User sollte den Sync-Status sehen können:

```typescript
type SyncState =
  | 'synced'      // Alles synchronisiert
  | 'syncing'     // Sync läuft gerade
  | 'pending'     // Änderungen warten auf Sync
  | 'offline'     // Keine Verbindung
  | 'error';      // Sync fehlgeschlagen

// UI Indicator
function SyncIndicator() {
  const state = useSyncState();

  const icons = {
    synced: '✓',
    syncing: '↻',
    pending: '•',
    offline: '○',
    error: '!',
  };

  return <span className="sync-indicator">{icons[state]}</span>;
}
```

## Notizen

### Warum kein Realtime-Timer-Sync?

Wir haben explizit entschieden, dass Timer NICHT live zwischen Geräten synchronisiert werden:

1. **Use Case existiert nicht** – Niemand legt iPhone neben Mac und will identische Timer
2. **Komplexität** – Timer-State (running, paused) ist transient und schwer zu syncen
3. **Konflikte** – Was wenn auf beiden Geräten ein Timer läuft?
4. **Batterie** – Realtime wäre batterie-intensiv

Stattdessen: Jedes Gerät hat seinen eigenen Timer-State. Nur *abgeschlossene* Partikel werden synchronisiert.

### Referenzen
- [[ADR-001-multi-platform-architecture]] – Übergeordnete Architektur
- [[ADR-002-schema-evolution]] – Schema-Änderungen
- [[features/cloud-sync-accounts]] – Implementierungs-Details
- [[stories/backlog/POMO-305-sync-service]] – Sync Service Story
