---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/local-first-persistence]]"
created: 2026-01-28
updated: 2026-01-28
done_date: null
tags: [infrastructure, migration, sessions]
---

# Session Storage Migration

## User Story

> Als **bestehender Nutzer**
> möchte ich **dass meine Sessions automatisch zu IndexedDB migriert werden**,
> damit **ich keine Daten verliere und von der neuen Storage-Architektur profitiere**.

## Kontext

Link zum Feature: [[features/local-first-persistence]]

Sessions sind die wichtigsten Daten - jeder Partikel ist eine Session. Die Migration muss 100% zuverlässig sein.

## Akzeptanzkriterien

- [ ] **Given** Sessions in localStorage, **When** die App startet, **Then** werden alle Sessions zu IndexedDB migriert
- [ ] **Given** Migration erfolgt, **When** sie abgeschlossen ist, **Then** haben alle Sessions Sync-Metadaten
- [ ] **Given** eine Session existiert bereits in IndexedDB, **When** Migration läuft, **Then** wird sie übersprungen (idempotent)
- [ ] **Given** Migration-Fehler bei einer Session, **When** Migration läuft, **Then** wird der Fehler geloggt und die anderen Sessions migriert

## Technische Details

### Betroffene Dateien
```
src/lib/storage/
├── migrations/
│   ├── index.ts              # NEU: Migration Runner
│   └── v1-sessions.ts        # NEU: Session Migration
├── sessions.ts               # ÄNDERN: Neue async API
└── session-storage.ts        # LEGACY: Später entfernen
```

### Implementierungshinweise

1. Migration-Runner prüft `localStorage.getItem('particle_migration_sessions_v1')`
2. Alle Sessions aus localStorage laden
3. Sync-Metadaten hinzufügen (`syncStatus: 'local'`, `localUpdatedAt`)
4. In IndexedDB schreiben (Batch für Performance)
5. Flag setzen nach erfolgreicher Migration

### Code-Beispiel

```typescript
// src/lib/storage/migrations/v1-sessions.ts

export async function migrateSessionsV1(): Promise<MigrationResult> {
  const MIGRATION_KEY = 'particle_migration_sessions_v1';

  if (localStorage.getItem(MIGRATION_KEY)) {
    return { skipped: true, count: 0 };
  }

  const oldSessions = JSON.parse(
    localStorage.getItem('particle_sessions') || '[]'
  );

  const db = getDB();
  let migrated = 0;
  const errors: string[] = [];

  await db.transaction('rw', db.sessions, async () => {
    for (const session of oldSessions) {
      try {
        const exists = await db.sessions.get(session.id);
        if (exists) continue;

        await db.sessions.add({
          ...session,
          syncStatus: 'local',
          localUpdatedAt: session.completedAt,
        });
        migrated++;
      } catch (e) {
        errors.push(`${session.id}: ${e}`);
      }
    }
  });

  localStorage.setItem(MIGRATION_KEY, Date.now().toString());

  return { skipped: false, count: migrated, errors };
}
```

### Neue Session API

```typescript
// src/lib/storage/sessions.ts

export async function loadSessions(): Promise<Session[]> {
  return getDB().sessions.toArray();
}

export async function saveSession(
  data: Omit<Session, 'id' | 'syncStatus' | 'localUpdatedAt'>
): Promise<Session> {
  const session: Session = {
    ...data,
    id: generateSessionId(),
    syncStatus: 'local',
    localUpdatedAt: new Date().toISOString(),
  };

  await getDB().sessions.add(session);
  return session;
}

export async function getSessionsByDateRange(
  start: string,
  end: string
): Promise<Session[]> {
  return getDB().sessions
    .where('completedAt')
    .between(start, end)
    .toArray();
}
```

## Testing

### Manuell zu testen
- [ ] App mit bestehenden localStorage-Sessions starten
- [ ] Nach Reload: Sessions sind in IndexedDB (DevTools prüfen)
- [ ] Alle Session-Daten sind intakt (count, dates, tasks)
- [ ] Migration läuft nur einmal (Flag wird gesetzt)

### Automatisierte Tests
- [ ] Unit Test: Migration mit leeren localStorage
- [ ] Unit Test: Migration mit 100 Sessions
- [ ] Unit Test: Idempotenz (zweimal ausführen)
- [ ] Unit Test: Fehler bei einer Session stoppt nicht die anderen

## Definition of Done

- [ ] Code implementiert
- [ ] Tests geschrieben & grün
- [ ] Code reviewed
- [ ] Lokal getestet mit echten Daten
- [ ] Performance bei >1000 Sessions akzeptabel (<2s)
