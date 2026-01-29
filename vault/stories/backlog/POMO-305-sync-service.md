---
type: story
status: backlog
priority: p0
effort: 8
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-28
done_date: null
tags: [infrastructure, sync, core]
---

# Sync Service Implementation

## User Story

> Als **Nutzer mit Account**
> möchte ich **dass meine Daten automatisch synchronisiert werden**,
> damit **ich auf allen Geräten den aktuellen Stand habe ohne manuell syncen zu müssen**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

Der Sync Service ist das Herzstück der Multi-Device-Experience. Er synchronisiert Änderungen im Hintergrund - push bei lokalen Änderungen, pull alle 30 Sekunden.

## Akzeptanzkriterien

- [ ] **Given** ein neuer Partikel, **When** er lokal gespeichert wird, **Then** wird er async zu Supabase gepusht
- [ ] **Given** der Pull-Interval, **When** 30s vergangen sind, **Then** werden neue Server-Daten geholt
- [ ] **Given** die App im Hintergrund, **When** sie in Vordergrund kommt, **Then** wird sofort gesynct
- [ ] **Given** Offline-Status, **When** Änderungen gemacht werden, **Then** werden sie gequeued

## Technische Details

### Betroffene Dateien
```
src/lib/sync/
├── sync-service.ts           # NEU: Haupt-Service
├── sync-context.tsx          # NEU: React Context
├── push.ts                   # NEU: Push-Logik
├── pull.ts                   # NEU: Pull-Logik
└── types.ts                  # NEU: Sync Types
```

### Sync Service Architektur

```typescript
// src/lib/sync/sync-service.ts

export class SyncService {
  private pullInterval: NodeJS.Timeout | null = null;
  private lastPullAt: string | null = null;
  private isOnline: boolean = true;

  constructor(
    private supabase: SupabaseClient,
    private db: ParticleDB,
    private userId: string
  ) {
    this.setupNetworkListener();
  }

  // Start syncing
  async start(): Promise<void> {
    // Initial pull
    await this.pull();

    // Process any queued changes
    await this.processQueue();

    // Start periodic pull
    this.pullInterval = setInterval(() => {
      this.pull();
    }, 30000);

    // Sync on focus
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', this.handleFocus);
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  stop(): void {
    if (this.pullInterval) {
      clearInterval(this.pullInterval);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', this.handleFocus);
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  // Push a single entity
  async push<T extends SyncableEntity>(
    entity: T,
    type: 'sessions' | 'projects'
  ): Promise<void> {
    if (!this.isOnline) {
      await this.enqueue(entity, type, 'upsert');
      return;
    }

    try {
      const { error } = await this.supabase
        .from(type)
        .upsert(this.toServerFormat(entity, type), {
          onConflict: 'user_id,client_id',
        });

      if (error) throw error;

      await this.db[type].update(entity.id, {
        syncStatus: 'synced',
        syncedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error(`Sync push failed for ${type}/${entity.id}:`, e);
      await this.enqueue(entity, type, 'upsert');
    }
  }

  // Pull all changes since last sync
  async pull(): Promise<SyncResult> {
    if (!this.isOnline) return { sessions: 0, projects: 0 };

    const result: SyncResult = { sessions: 0, projects: 0 };
    const since = this.lastPullAt || '1970-01-01T00:00:00Z';

    try {
      // Pull projects
      const { data: projects } = await this.supabase
        .from('projects')
        .select('*')
        .gt('updated_at', since)
        .is('deleted_at', null);

      for (const project of projects || []) {
        await this.mergeProject(project);
        result.projects++;
      }

      // Pull sessions
      const { data: sessions } = await this.supabase
        .from('sessions')
        .select('*')
        .gt('updated_at', since)
        .is('deleted_at', null);

      for (const session of sessions || []) {
        await this.mergeSession(session);
        result.sessions++;
      }

      this.lastPullAt = new Date().toISOString();
      localStorage.setItem('particle_last_sync', this.lastPullAt);
    } catch (e) {
      console.error('Sync pull failed:', e);
    }

    return result;
  }

  // Merge server data with local
  private async mergeSession(remote: ServerSession): Promise<void> {
    const local = await this.db.sessions
      .where('id')
      .equals(remote.client_id)
      .first();

    if (!local) {
      // New from server
      await this.db.sessions.add(this.toLocalFormat(remote, 'sessions'));
    } else if (new Date(remote.updated_at) > new Date(local.localUpdatedAt)) {
      // Server is newer - update local
      await this.db.sessions.update(local.id, {
        ...this.toLocalFormat(remote, 'sessions'),
        syncStatus: 'synced',
      });
    }
    // If local is newer, it will be pushed on next change
  }

  private async processQueue(): Promise<void> {
    const queue = await this.db.syncQueue
      .orderBy('createdAt')
      .limit(50)
      .toArray();

    for (const item of queue) {
      try {
        await this.supabase
          .from(item.entityType)
          .upsert(item.payload);

        await this.db.syncQueue.delete(item.id);
      } catch (e) {
        // Will be retried later
      }
    }
  }

  private handleFocus = (): void => {
    this.pull();
  };

  private handleOnline = (): void => {
    this.isOnline = true;
    this.processQueue();
  };

  private handleOffline = (): void => {
    this.isOnline = false;
  };
}
```

### React Context

```typescript
// src/lib/sync/sync-context.tsx

const SyncContext = createContext<SyncService | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const { user, getToken } = useAuth();
  const [syncService, setSyncService] = useState<SyncService | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  useEffect(() => {
    if (!user) {
      setSyncService(null);
      return;
    }

    const initSync = async () => {
      const token = await getToken({ template: 'supabase' });
      const supabase = createSupabaseClient(token);
      const service = new SyncService(supabase, getDB(), user.id);

      service.on('status', setSyncStatus);
      await service.start();

      setSyncService(service);
    };

    initSync();

    return () => {
      syncService?.stop();
    };
  }, [user]);

  return (
    <SyncContext.Provider value={{ service: syncService, status: syncStatus }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  return useContext(SyncContext);
}
```

## Testing

### Manuell zu testen
- [ ] Session erstellen → erscheint in Supabase innerhalb 1s
- [ ] Auf anderem Gerät: Session erscheint nach max 30s
- [ ] Offline gehen → Session erstellen → Online gehen → Session synct
- [ ] App in Hintergrund → Anderes Gerät ändert Daten → App in Vordergrund → Daten aktualisiert

### Automatisierte Tests
- [ ] Unit Test: Push-Logik mit Mock Supabase
- [ ] Unit Test: Pull-Logik mit Merge
- [ ] Unit Test: Queue Processing
- [ ] Integration Test: End-to-End Sync zwischen zwei Clients

## Definition of Done

- [ ] SyncService implementiert
- [ ] Push bei Änderungen funktioniert
- [ ] Pull alle 30s funktioniert
- [ ] Focus-Sync funktioniert
- [ ] Offline-Queue funktioniert
- [ ] React Context bereitgestellt
