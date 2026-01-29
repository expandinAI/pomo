---
type: story
status: backlog
priority: p0
effort: 2
feature: "[[features/local-first-persistence]]"
created: 2026-01-28
updated: 2026-01-28
done_date: null
tags: [infrastructure, migration, projects]
---

# Project Storage Migration

## User Story

> Als **bestehender Nutzer mit Projekten**
> möchte ich **dass meine Projekte automatisch zu IndexedDB migriert werden**,
> damit **ich weiterhin meine Partikel nach Projekten organisieren kann**.

## Kontext

Link zum Feature: [[features/local-first-persistence]]

Analog zu Sessions müssen auch Projekte migriert werden. Die Projekt-IDs müssen erhalten bleiben, da Sessions darauf referenzieren.

## Akzeptanzkriterien

- [ ] **Given** Projekte in localStorage, **When** die App startet, **Then** werden alle Projekte zu IndexedDB migriert
- [ ] **Given** Migration erfolgt, **When** sie abgeschlossen ist, **Then** haben alle Projekte Sync-Metadaten
- [ ] **Given** Session mit projectId, **When** Projekt migriert wurde, **Then** bleibt die Verknüpfung intakt

## Technische Details

### Betroffene Dateien
```
src/lib/storage/
├── migrations/
│   └── v1-projects.ts        # NEU: Project Migration
├── projects.ts               # ÄNDERN: Neue async API
└── projects/storage.ts       # LEGACY: Später entfernen
```

### Implementierungshinweise

```typescript
// src/lib/storage/migrations/v1-projects.ts

export async function migrateProjectsV1(): Promise<MigrationResult> {
  const MIGRATION_KEY = 'particle_migration_projects_v1';

  if (localStorage.getItem(MIGRATION_KEY)) {
    return { skipped: true, count: 0 };
  }

  const oldProjects = JSON.parse(
    localStorage.getItem('particle_projects') || '[]'
  );

  const db = getDB();
  let migrated = 0;

  await db.transaction('rw', db.projects, async () => {
    for (const project of oldProjects) {
      const exists = await db.projects.get(project.id);
      if (exists) continue;

      await db.projects.add({
        ...project,
        syncStatus: 'local',
        localUpdatedAt: project.updatedAt || project.createdAt,
      });
      migrated++;
    }
  });

  localStorage.setItem(MIGRATION_KEY, Date.now().toString());
  return { skipped: false, count: migrated };
}
```

## Testing

### Manuell zu testen
- [ ] Projekte erscheinen in IndexedDB nach Migration
- [ ] Projekt-IDs bleiben gleich
- [ ] Sessions zeigen weiterhin korrektes Projekt

### Automatisierte Tests
- [ ] Unit Test: Migration mit 0 Projekten
- [ ] Unit Test: Migration mit Projekten
- [ ] Unit Test: Idempotenz

## Definition of Done

- [ ] Code implementiert
- [ ] Tests grün
- [ ] Projekt-Session-Verknüpfung intakt
