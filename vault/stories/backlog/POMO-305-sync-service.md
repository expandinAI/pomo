---
type: story
status: backlog
priority: p0
effort: 8
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-29
done_date: null
tags: [infrastructure, sync, core, offline]
---

# POMO-305: Sync Service mit Offline Queue

## User Story

> Als **Nutzer mit Account**
> möchte ich **dass meine Daten automatisch synchronisiert werden**,
> damit **ich auf allen Geräten den aktuellen Stand habe ohne manuell syncen zu müssen**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

**Vorgänger:** POMO-304 (Upgrade Flow)

Der Sync Service ist das Herzstück der Multi-Device-Experience. Er:
- Pusht lokale Änderungen sofort zu Supabase
- Pullt Server-Änderungen alle 30 Sekunden
- Queued Änderungen wenn offline
- Processed die Queue wenn wieder online

**Wichtig:** Der Sync Service startet nur für eingeloggte User (Particle/Flow).

**Reihenfolge:** POMO-304 → **POMO-305** → POMO-306 → ...

## Akzeptanzkriterien

- [ ] **Given** ein neuer Partikel, **When** er lokal gespeichert wird, **Then** wird er async zu Supabase gepusht
- [ ] **Given** der Pull-Interval, **When** 30s vergangen sind, **Then** werden neue Server-Daten geholt
- [ ] **Given** die App im Hintergrund, **When** sie in den Vordergrund kommt, **Then** wird sofort gesynct
- [ ] **Given** Offline-Status, **When** Änderungen gemacht werden, **Then** werden sie gequeued
- [ ] **Given** Online-Status wieder hergestellt, **When** Queue nicht leer, **Then** werden Einträge abgearbeitet

## Technische Details

### Dateistruktur

```
src/lib/sync/
├── index.ts              # NEU: Public exports
├── sync-service.ts       # NEU: Haupt-Service
├── sync-context.tsx      # NEU: React Context
├── push.ts               # NEU: Push-Logik
├── pull.ts               # NEU: Pull-Logik
├── offline-queue.ts      # NEU: Offline Queue Management
├── types.ts              # NEU: Sync Types
└── initial-upload.ts     # Aus POMO-304
```

### Types

```typescript
// src/lib/sync/types.ts

import type { DBSession, DBProject, SyncableEntity } from '@/lib/db';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

export type EntityType = 'sessions' | 'projects';

export interface SyncResult {
  sessions: number;
  projects: number;
  errors: string[];
}

export interface QueuedChange {
  id: string;
  entityType: EntityType;
  entityId: string;
  operation: 'upsert' | 'delete';
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
  lastError?: string;
  nextRetryAt?: string;
}

export interface SyncServiceConfig {
  pullIntervalMs: number;
  maxRetries: number;
  retryBackoffMs: number;
}

export const DEFAULT_CONFIG: SyncServiceConfig = {
  pullIntervalMs: 30_000,    // 30 Sekunden
  maxRetries: 5,
  retryBackoffMs: 60_000,    // 1 Minute Basis
};
```

### Offline Queue

```typescript
// src/lib/sync/offline-queue.ts

import { getDB } from '@/lib/db';
import type { QueuedChange, EntityType } from './types';

/**
 * Fügt eine Änderung zur Queue hinzu.
 */
export async function enqueue(
  entityType: EntityType,
  entityId: string,
  operation: 'upsert' | 'delete',
  payload: Record<string, unknown>
): Promise<void> {
  const db = getDB();

  await db.syncQueue.add({
    id: crypto.randomUUID(),
    entityType,
    entityId,
    operation,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });
}

/**
 * Holt die nächste Batch von Queue-Einträgen.
 */
export async function getNextBatch(limit = 50): Promise<QueuedChange[]> {
  const db = getDB();
  const now = new Date().toISOString();

  // Hole Einträge ohne nextRetryAt oder mit abgelaufenem nextRetryAt
  const all = await db.syncQueue.toArray();

  return all
    .filter((c) => !c.nextRetryAt || c.nextRetryAt <= now)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(0, limit);
}

/**
 * Markiert einen Queue-Eintrag als erfolgreich verarbeitet.
 */
export async function markProcessed(id: string): Promise<void> {
  const db = getDB();
  await db.syncQueue.delete(id);
}

/**
 * Markiert einen Queue-Eintrag als fehlgeschlagen.
 * Setzt Retry-Zeitpunkt mit exponential backoff.
 */
export async function markFailed(
  id: string,
  error: string,
  maxRetries: number,
  backoffMs: number
): Promise<boolean> {
  const db = getDB();
  const change = await db.syncQueue.get(id);

  if (!change) return false;

  if (change.retryCount >= maxRetries) {
    // Permanent failed - remove from queue
    console.error(`[SyncQueue] Item ${id} failed permanently:`, error);
    await db.syncQueue.delete(id);
    return false;
  }

  // Exponential backoff: 1min, 2min, 4min, 8min, 16min
  const backoff = Math.pow(2, change.retryCount) * backoffMs;

  await db.syncQueue.update(id, {
    retryCount: change.retryCount + 1,
    lastError: error,
    nextRetryAt: new Date(Date.now() + backoff).toISOString(),
  });

  return true;
}

/**
 * Gibt Queue-Statistiken zurück.
 */
export async function getQueueStats(): Promise<{
  total: number;
  pending: number;
  retrying: number;
}> {
  const db = getDB();
  const all = await db.syncQueue.toArray();

  return {
    total: all.length,
    pending: all.filter((c) => c.retryCount === 0).length,
    retrying: all.filter((c) => c.retryCount > 0).length,
  };
}

/**
 * Leert die gesamte Queue (für Testing/Reset).
 */
export async function clearQueue(): Promise<void> {
  const db = getDB();
  await db.syncQueue.clear();
}
```

### Sync Service

```typescript
// src/lib/sync/sync-service.ts

import type { SupabaseClient } from '@supabase/supabase-js';
import { getDB, type ParticleDB, type SyncableEntity } from '@/lib/db';
import {
  enqueue,
  getNextBatch,
  markProcessed,
  markFailed,
} from './offline-queue';
import type { SyncStatus, SyncResult, SyncServiceConfig, EntityType } from './types';
import { DEFAULT_CONFIG } from './types';

type StatusListener = (status: SyncStatus) => void;

export class SyncService {
  private pullInterval: ReturnType<typeof setInterval> | null = null;
  private lastPullAt: string | null = null;
  private isOnline: boolean = true;
  private statusListeners: Set<StatusListener> = new Set();
  private status: SyncStatus = 'idle';

  constructor(
    private supabase: SupabaseClient,
    private db: ParticleDB,
    private userId: string,
    private config: SyncServiceConfig = DEFAULT_CONFIG
  ) {
    // Initialer Online-Status
    if (typeof navigator !== 'undefined') {
      this.isOnline = navigator.onLine;
    }

    // Last pull aus localStorage
    this.lastPullAt = localStorage.getItem('particle_last_sync');
  }

  /**
   * Startet den Sync Service.
   */
  async start(): Promise<void> {
    console.log('[SyncService] Starting...');

    // Event Listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', this.handleFocus);
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }

    // Initial sync
    if (this.isOnline) {
      await this.pull();
      await this.processQueue();
    }

    // Periodic pull
    this.pullInterval = setInterval(() => {
      if (this.isOnline) {
        this.pull();
      }
    }, this.config.pullIntervalMs);

    console.log('[SyncService] Started');
  }

  /**
   * Stoppt den Sync Service.
   */
  stop(): void {
    console.log('[SyncService] Stopping...');

    if (this.pullInterval) {
      clearInterval(this.pullInterval);
      this.pullInterval = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', this.handleFocus);
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }

    this.statusListeners.clear();
    console.log('[SyncService] Stopped');
  }

  /**
   * Registriert einen Status-Listener.
   */
  onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  /**
   * Pusht ein einzelnes Entity zu Supabase.
   * Queued bei Offline oder Fehler.
   */
  async push<T extends SyncableEntity>(
    entity: T,
    type: EntityType
  ): Promise<void> {
    const payload = this.toServerFormat(entity, type);

    if (!this.isOnline) {
      await enqueue(type, entity.id, 'upsert', payload);
      return;
    }

    try {
      this.setStatus('syncing');

      const { error } = await this.supabase
        .from(type)
        .upsert(payload, { onConflict: 'user_id,client_id' });

      if (error) throw error;

      // Lokal als synced markieren
      await this.db[type].update(entity.id, {
        syncStatus: 'synced',
        syncedAt: new Date().toISOString(),
      });

      this.setStatus('idle');
    } catch (e) {
      console.error(`[SyncService] Push failed for ${type}/${entity.id}:`, e);
      await enqueue(type, entity.id, 'upsert', payload);
      this.setStatus('error');
    }
  }

  /**
   * Pusht eine Löschung.
   */
  async pushDelete(entityId: string, type: EntityType): Promise<void> {
    if (!this.isOnline) {
      await enqueue(type, entityId, 'delete', { client_id: entityId });
      return;
    }

    try {
      this.setStatus('syncing');

      // Soft-delete auf Server
      const { error } = await this.supabase
        .from(type)
        .update({ deleted_at: new Date().toISOString() })
        .eq('client_id', entityId)
        .eq('user_id', this.userId);

      if (error) throw error;

      this.setStatus('idle');
    } catch (e) {
      console.error(`[SyncService] Delete failed for ${type}/${entityId}:`, e);
      await enqueue(type, entityId, 'delete', { client_id: entityId });
      this.setStatus('error');
    }
  }

  /**
   * Pullt alle Änderungen seit dem letzten Sync.
   */
  async pull(): Promise<SyncResult> {
    if (!this.isOnline) {
      return { sessions: 0, projects: 0, errors: [] };
    }

    const result: SyncResult = { sessions: 0, projects: 0, errors: [] };
    const since = this.lastPullAt || '1970-01-01T00:00:00Z';

    try {
      this.setStatus('syncing');

      // Pull projects
      const { data: projects, error: projectsError } = await this.supabase
        .from('projects')
        .select('*')
        .eq('user_id', this.userId)
        .gt('updated_at', since);

      if (projectsError) throw projectsError;

      for (const project of projects || []) {
        await this.mergeProject(project);
        result.projects++;
      }

      // Pull sessions
      const { data: sessions, error: sessionsError } = await this.supabase
        .from('sessions')
        .select('*')
        .eq('user_id', this.userId)
        .gt('updated_at', since);

      if (sessionsError) throw sessionsError;

      for (const session of sessions || []) {
        await this.mergeSession(session);
        result.sessions++;
      }

      // Update last pull timestamp
      this.lastPullAt = new Date().toISOString();
      localStorage.setItem('particle_last_sync', this.lastPullAt);

      this.setStatus('idle');
    } catch (e) {
      console.error('[SyncService] Pull failed:', e);
      result.errors.push(e instanceof Error ? e.message : String(e));
      this.setStatus('error');
    }

    return result;
  }

  /**
   * Verarbeitet die Offline-Queue.
   */
  async processQueue(): Promise<void> {
    if (!this.isOnline) return;

    const batch = await getNextBatch();
    if (batch.length === 0) return;

    console.log(`[SyncService] Processing ${batch.length} queued changes`);

    for (const change of batch) {
      try {
        if (change.operation === 'delete') {
          const { error } = await this.supabase
            .from(change.entityType)
            .update({ deleted_at: new Date().toISOString() })
            .eq('client_id', change.entityId)
            .eq('user_id', this.userId);

          if (error) throw error;
        } else {
          const { error } = await this.supabase
            .from(change.entityType)
            .upsert(change.payload, { onConflict: 'user_id,client_id' });

          if (error) throw error;

          // Mark as synced locally
          await this.db[change.entityType].update(change.entityId, {
            syncStatus: 'synced',
            syncedAt: new Date().toISOString(),
          });
        }

        await markProcessed(change.id);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await markFailed(
          change.id,
          msg,
          this.config.maxRetries,
          this.config.retryBackoffMs
        );
      }
    }
  }

  // --- Private Methods ---

  private async mergeProject(remote: Record<string, unknown>): Promise<void> {
    const clientId = remote.client_id as string;

    // Gelöschte Projekte lokal löschen
    if (remote.deleted_at) {
      await this.db.projects.delete(clientId);
      return;
    }

    const local = await this.db.projects.get(clientId);

    if (!local) {
      // Neu vom Server
      await this.db.projects.add({
        id: clientId,
        name: remote.name as string,
        brightness: remote.brightness as number,
        archived: remote.archived as boolean,
        createdAt: remote.created_at as string,
        updatedAt: remote.updated_at as string,
        syncStatus: 'synced',
        syncedAt: new Date().toISOString(),
        serverId: remote.id as string,
        localUpdatedAt: remote.updated_at as string,
      });
    } else {
      // Conflict Resolution: LWW
      const remoteTime = new Date(remote.updated_at as string).getTime();
      const localTime = new Date(local.localUpdatedAt).getTime();

      if (remoteTime > localTime) {
        await this.db.projects.update(clientId, {
          name: remote.name as string,
          brightness: remote.brightness as number,
          archived: remote.archived as boolean,
          updatedAt: remote.updated_at as string,
          syncStatus: 'synced',
          syncedAt: new Date().toISOString(),
          localUpdatedAt: remote.updated_at as string,
        });
      }
      // Wenn lokal neuer → wird beim nächsten push gesynct
    }
  }

  private async mergeSession(remote: Record<string, unknown>): Promise<void> {
    const clientId = remote.client_id as string;

    // Gelöschte Sessions lokal löschen
    if (remote.deleted_at) {
      await this.db.sessions.delete(clientId);
      return;
    }

    const local = await this.db.sessions.get(clientId);

    if (!local) {
      // Neu vom Server
      await this.db.sessions.add({
        id: clientId,
        type: remote.type as 'work' | 'short_break' | 'long_break',
        duration: remote.duration as number,
        completedAt: remote.completed_at as string,
        task: (remote.task as string) || undefined,
        projectId: (remote.project_id as string) || undefined,
        presetId: (remote.preset_id as string) || undefined,
        estimatedPomodoros: (remote.estimated_pomodoros as number) || undefined,
        overflowDuration: (remote.overflow_duration as number) || undefined,
        estimatedDuration: (remote.estimated_duration as number) || undefined,
        syncStatus: 'synced',
        syncedAt: new Date().toISOString(),
        serverId: remote.id as string,
        localUpdatedAt: remote.updated_at as string,
      });
    } else {
      // Conflict Resolution: LWW
      const remoteTime = new Date(remote.updated_at as string).getTime();
      const localTime = new Date(local.localUpdatedAt).getTime();

      if (remoteTime > localTime) {
        await this.db.sessions.update(clientId, {
          type: remote.type as 'work' | 'short_break' | 'long_break',
          duration: remote.duration as number,
          task: (remote.task as string) || undefined,
          projectId: (remote.project_id as string) || undefined,
          syncStatus: 'synced',
          syncedAt: new Date().toISOString(),
          localUpdatedAt: remote.updated_at as string,
        });
      }
    }
  }

  private toServerFormat(
    entity: SyncableEntity,
    type: EntityType
  ): Record<string, unknown> {
    const base = {
      user_id: this.userId,
      client_id: entity.id,
      updated_at: entity.localUpdatedAt,
    };

    if (type === 'sessions') {
      const session = entity as import('@/lib/db').DBSession;
      return {
        ...base,
        type: session.type,
        duration: session.duration,
        completed_at: session.completedAt,
        task: session.task || null,
        project_id: session.projectId || null,
        preset_id: session.presetId || null,
        estimated_pomodoros: session.estimatedPomodoros || null,
        overflow_duration: session.overflowDuration || null,
        estimated_duration: session.estimatedDuration || null,
      };
    }

    if (type === 'projects') {
      const project = entity as import('@/lib/db').DBProject;
      return {
        ...base,
        name: project.name,
        brightness: project.brightness,
        archived: project.archived,
        created_at: project.createdAt,
      };
    }

    return base;
  }

  private setStatus(status: SyncStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.statusListeners.forEach((listener) => listener(status));
    }
  }

  private handleFocus = (): void => {
    if (this.isOnline) {
      this.pull();
      this.processQueue();
    }
  };

  private handleOnline = (): void => {
    console.log('[SyncService] Online');
    this.isOnline = true;
    this.setStatus('idle');
    this.processQueue();
  };

  private handleOffline = (): void => {
    console.log('[SyncService] Offline');
    this.isOnline = false;
    this.setStatus('offline');
  };
}
```

### React Context

```typescript
// src/lib/sync/sync-context.tsx

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@clerk/nextjs';
import { SyncService } from './sync-service';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getDB } from '@/lib/db';
import type { SyncStatus } from './types';

interface SyncContextValue {
  service: SyncService | null;
  status: SyncStatus;
  isOnline: boolean;
}

const SyncContext = createContext<SyncContextValue>({
  service: null,
  status: 'idle',
  isOnline: true,
});

export function SyncProvider({ children }: { children: ReactNode }) {
  const { userId, getToken } = useAuth();
  const [service, setService] = useState<SyncService | null>(null);
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (!userId) {
      // Nicht eingeloggt - kein Sync
      setService(null);
      return;
    }

    let syncService: SyncService | null = null;

    async function initSync() {
      const token = await getToken({ template: 'supabase' });
      if (!token) return;

      const supabase = createSupabaseClient(token);
      const db = getDB();

      syncService = new SyncService(supabase, db, userId!);

      // Status-Updates
      const unsubscribe = syncService.onStatus(setStatus);

      await syncService.start();
      setService(syncService);

      return unsubscribe;
    }

    const cleanup = initSync();

    // Online/Offline Status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      cleanup.then((unsub) => unsub?.());
      syncService?.stop();
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [userId, getToken]);

  return (
    <SyncContext.Provider value={{ service, status, isOnline }}>
      {children}
    </SyncContext.Provider>
  );
}

/**
 * Hook für Sync-Service Zugriff.
 */
export function useSync() {
  return useContext(SyncContext);
}

/**
 * Hook nur für Sync-Status.
 */
export function useSyncStatus(): SyncStatus {
  return useContext(SyncContext).status;
}
```

### Public Exports

```typescript
// src/lib/sync/index.ts

export { SyncService } from './sync-service';
export { SyncProvider, useSync, useSyncStatus } from './sync-context';
export {
  enqueue,
  getNextBatch,
  markProcessed,
  markFailed,
  getQueueStats,
  clearQueue,
} from './offline-queue';
export {
  type SyncStatus,
  type SyncResult,
  type QueuedChange,
  type EntityType,
} from './types';
export {
  performInitialUpload,
  getLocalDataSummary,
  type UploadProgress,
  type UploadResult,
  type LocalDataSummary,
} from './initial-upload';
```

### Database Schema Update (für Queue)

```typescript
// In src/lib/db/database.ts erweitern:

import type { QueuedChange } from '@/lib/sync/types';

export class ParticleDB extends Dexie {
  // ... existing tables ...
  syncQueue!: Table<QueuedChange, string>;

  constructor() {
    super('ParticleDB');

    this.version(2).stores({
      // ... existing stores ...
      syncQueue: 'id, entityType, createdAt, nextRetryAt',
    });
  }
}
```

## Testing

### Manuell zu testen

- [ ] Session erstellen → erscheint in Supabase innerhalb 1s
- [ ] Auf anderem Gerät: Session erscheint nach max 30s
- [ ] Offline gehen → Session erstellen → Online gehen → Session synct
- [ ] App in Hintergrund → Anderes Gerät ändert Daten → App in Vordergrund → Daten aktualisiert
- [ ] Netzwerk-Fehler → Retry mit Backoff
- [ ] Queue-Stats zeigen korrekte Zahlen

### Automatisierte Tests

```typescript
describe('SyncService', () => {
  it('pushes entity to server', async () => {
    const service = new SyncService(mockSupabase, mockDB, 'user-123');

    await service.push(mockSession, 'sessions');

    expect(mockSupabase.from('sessions').upsert).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: mockSession.id }),
      expect.any(Object)
    );
  });

  it('queues changes when offline', async () => {
    const service = new SyncService(mockSupabase, mockDB, 'user-123');
    // Simulate offline
    Object.defineProperty(navigator, 'onLine', { value: false });

    await service.push(mockSession, 'sessions');

    const queue = await getNextBatch();
    expect(queue).toHaveLength(1);
    expect(queue[0].entityId).toBe(mockSession.id);
  });

  it('processes queue when coming online', async () => {
    // Seed queue
    await enqueue('sessions', 'session-1', 'upsert', mockPayload);

    const service = new SyncService(mockSupabase, mockDB, 'user-123');
    await service.start();

    // Simulate online event
    window.dispatchEvent(new Event('online'));

    await new Promise((r) => setTimeout(r, 100));

    const queue = await getNextBatch();
    expect(queue).toHaveLength(0);
  });
});

describe('Offline Queue', () => {
  it('marks failed with exponential backoff', async () => {
    await enqueue('sessions', 'session-1', 'upsert', {});

    const [item] = await getNextBatch();
    await markFailed(item.id, 'Network error', 5, 60000);

    const [updated] = await db.syncQueue.toArray();
    expect(updated.retryCount).toBe(1);
    expect(updated.nextRetryAt).toBeDefined();
  });

  it('removes item after max retries', async () => {
    await enqueue('sessions', 'session-1', 'upsert', {});

    // Simulate 5 failures
    for (let i = 0; i < 5; i++) {
      const [item] = await getNextBatch();
      if (item) {
        await markFailed(item.id, 'Error', 5, 1);
      }
    }

    const queue = await db.syncQueue.toArray();
    expect(queue).toHaveLength(0);
  });
});
```

## Definition of Done

- [ ] SyncService implementiert
- [ ] Push bei Änderungen funktioniert
- [ ] Pull alle 30s funktioniert
- [ ] Focus-Sync funktioniert
- [ ] Offline-Queue implementiert
- [ ] Queue Processing mit Exponential Backoff
- [ ] React Context bereitgestellt (`SyncProvider`, `useSync`)
- [ ] Database Schema für Queue erweitert (v2)
- [ ] Tests geschrieben & grün

## Notizen

**Sync-Strategie:**
- Push: Sofort bei jeder lokalen Änderung
- Pull: Alle 30 Sekunden + bei Focus
- Queue: Bei Offline oder Fehler

**Exponential Backoff:**
- 1. Retry: 1 Minute
- 2. Retry: 2 Minuten
- 3. Retry: 4 Minuten
- 4. Retry: 8 Minuten
- 5. Retry: 16 Minuten
- Danach: Permanent failed (aus Queue entfernt)

**Warum kein Realtime?**
- Supabase Realtime würde Kosten erhöhen
- 30s Polling ist für Pomodoro-Timer ausreichend
- Weniger Komplexität

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
