---
type: story
status: backlog
priority: p0
effort: 5
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-28
done_date: null
tags: [feature, upgrade, sync, onboarding]
---

# Free → Plus Upgrade Flow

## User Story

> Als **Free-Nutzer mit lokalen Daten**
> möchte ich **beim Erstellen eines Accounts meine Daten hochladen**,
> damit **ich meine bisherige Arbeit nicht verliere und auf allen Geräten Zugriff habe**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

Der kritischste Flow: Ein Nutzer hat vielleicht Monate lang ohne Account gearbeitet. Beim Upgrade zu Plus müssen alle lokalen Daten zuverlässig in die Cloud übertragen werden.

## Akzeptanzkriterien

- [ ] **Given** lokale Daten, **When** Account erstellt wird, **Then** zeigt UI die Daten-Summary
- [ ] **Given** Nutzer bestätigt, **When** Sync startet, **Then** werden alle Daten hochgeladen
- [ ] **Given** Upload läuft, **When** Fehler auftritt, **Then** kann Nutzer retry
- [ ] **Given** Upload abgeschlossen, **When** User auf anderem Gerät einloggt, **Then** sind Daten da

## Technische Details

### Betroffene Dateien
```
src/
├── components/
│   └── upgrade/
│       ├── UpgradeModal.tsx       # NEU
│       ├── DataSummary.tsx        # NEU
│       └── UploadProgress.tsx     # NEU
├── lib/
│   └── sync/
│       └── initial-upload.ts      # NEU
```

### User Flow

**Step 1: Daten-Summary**

```
┌─────────────────────────────────────────────┐
│                                             │
│      Willkommen bei Particle Plus!          │
│                                             │
│   Du hast lokale Daten, die wir             │
│   synchronisieren können:                   │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │  127 Partikel                       │   │
│   │  12 Projekte                        │   │
│   │  Deine Einstellungen                │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │       Jetzt synchronisieren         │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   [Später]                                  │
│                                             │
└─────────────────────────────────────────────┘
```

**Step 2: Upload Progress**

```
┌─────────────────────────────────────────────┐
│                                             │
│         Daten werden synchronisiert         │
│                                             │
│         ████████████░░░░░░ 65%              │
│                                             │
│         82 / 127 Partikel                   │
│         8 / 12 Projekte                     │
│                                             │
└─────────────────────────────────────────────┘
```

**Step 3: Erfolg**

```
┌─────────────────────────────────────────────┐
│                                             │
│     ✓ Synchronisation abgeschlossen         │
│                                             │
│     127 Partikel synchronisiert             │
│     12 Projekte synchronisiert              │
│                                             │
│     Deine Daten sind jetzt sicher           │
│     in der Cloud.                           │
│                                             │
│     ┌─────────────────────────────────┐     │
│     │          Weiter                 │     │
│     └─────────────────────────────────┘     │
│                                             │
└─────────────────────────────────────────────┘
```

### Implementierungshinweise

```typescript
// src/lib/sync/initial-upload.ts

export async function performInitialUpload(
  supabase: SupabaseClient,
  userId: string,
  onProgress: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const db = getDB();
  const result: UploadResult = {
    sessions: 0,
    projects: 0,
    errors: [],
  };

  // 1. Get local data counts
  const sessions = await db.sessions.toArray();
  const projects = await db.projects.toArray();
  const total = sessions.length + projects.length;
  let current = 0;

  // 2. Upload projects first (sessions reference them)
  const projectIdMap = new Map<string, string>(); // local -> server

  for (const project of projects) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .upsert({
          user_id: userId,
          client_id: project.id,
          name: project.name,
          brightness: project.brightness,
          archived: project.archived,
          created_at: project.createdAt,
        }, { onConflict: 'user_id,client_id' })
        .select()
        .single();

      if (error) throw error;

      projectIdMap.set(project.id, data.id);

      // Mark as synced locally
      await db.projects.update(project.id, {
        syncStatus: 'synced',
        syncedAt: new Date().toISOString(),
        serverId: data.id,
      });

      result.projects++;
    } catch (e) {
      result.errors.push(`Project ${project.name}: ${e}`);
    }

    current++;
    onProgress({
      phase: 'projects',
      current,
      total,
      detail: `${result.projects} / ${projects.length} Projekte`,
    });
  }

  // 3. Upload sessions
  for (const session of sessions) {
    try {
      const serverProjectId = session.projectId
        ? projectIdMap.get(session.projectId)
        : null;

      const { data, error } = await supabase
        .from('sessions')
        .upsert({
          user_id: userId,
          client_id: session.id,
          type: session.type,
          duration: session.duration,
          completed_at: session.completedAt,
          task: session.task,
          project_id: serverProjectId,
          overflow_duration: session.overflowDuration,
          estimated_duration: session.estimatedDuration,
        }, { onConflict: 'user_id,client_id' })
        .select()
        .single();

      if (error) throw error;

      await db.sessions.update(session.id, {
        syncStatus: 'synced',
        syncedAt: new Date().toISOString(),
        serverId: data.id,
      });

      result.sessions++;
    } catch (e) {
      result.errors.push(`Session ${session.id}: ${e}`);
    }

    current++;
    onProgress({
      phase: 'sessions',
      current,
      total,
      detail: `${result.sessions} / ${sessions.length} Partikel`,
    });
  }

  return result;
}
```

### Error Handling

```typescript
// Retry-Button wenn Fehler
if (result.errors.length > 0) {
  return (
    <UploadError
      errors={result.errors}
      onRetry={() => performInitialUpload(...)}
      onSkip={() => continueWithPartialSync()}
    />
  );
}
```

## Testing

### Manuell zu testen
- [ ] Modal erscheint nach erstem Login mit lokalen Daten
- [ ] Progress zeigt korrekte Zahlen
- [ ] Nach Upload: Daten in Supabase Dashboard sichtbar
- [ ] Auf anderem Gerät einloggen → Daten sind da
- [ ] Bei Netzwerk-Fehler: Retry funktioniert

### Automatisierte Tests
- [ ] Unit Test: `performInitialUpload()` mit Mock-Daten
- [ ] Integration Test: Upload → Verify in Supabase

## Definition of Done

- [ ] Modal designed und implementiert
- [ ] Upload-Logik robust mit Error Handling
- [ ] Progress-Anzeige accurate
- [ ] Retry-Mechanismus funktioniert
- [ ] Daten auf anderem Gerät verifiziert
