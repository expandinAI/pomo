---
type: story
status: backlog
priority: p0
effort: 2
feature: "[[features/local-first-persistence]]"
created: 2026-01-28
updated: 2026-01-28
done_date: null
tags: [infrastructure, migration, settings]
---

# Settings & Tasks Migration

## User Story

> Als **bestehender Nutzer**
> möchte ich **dass meine Einstellungen und Recent Tasks migriert werden**,
> damit **meine personalisierte Erfahrung erhalten bleibt**.

## Kontext

Link zum Feature: [[features/local-first-persistence]]

Settings und Recent Tasks sind weniger kritisch als Sessions, aber wichtig für die User Experience.

## Akzeptanzkriterien

- [ ] **Given** Settings in localStorage, **When** die App startet, **Then** werden sie zu IndexedDB migriert
- [ ] **Given** Recent Tasks in localStorage, **When** die App startet, **Then** werden sie zu IndexedDB migriert
- [ ] **Given** Task-Autocomplete, **When** nach Migration genutzt, **Then** zeigt es die migrierten Tasks

## Technische Details

### Betroffene Dateien
```
src/lib/storage/
├── migrations/
│   ├── v1-settings.ts        # NEU
│   └── v1-recent-tasks.ts    # NEU
├── settings.ts               # ÄNDERN: Neue async API
└── recent-tasks.ts           # ÄNDERN: Neue async API
```

### Implementierungshinweise

```typescript
// src/lib/storage/migrations/v1-settings.ts

export async function migrateSettingsV1(): Promise<MigrationResult> {
  const MIGRATION_KEY = 'particle_migration_settings_v1';

  if (localStorage.getItem(MIGRATION_KEY)) {
    return { skipped: true };
  }

  // Collect all settings from various localStorage keys
  const settings = {
    workDuration: parseInt(localStorage.getItem('particle_work_duration') || '1500'),
    shortBreakDuration: parseInt(localStorage.getItem('particle_short_break') || '300'),
    longBreakDuration: parseInt(localStorage.getItem('particle_long_break') || '900'),
    autoStartBreaks: localStorage.getItem('particle_auto_start_breaks') === 'true',
    soundEnabled: localStorage.getItem('particle_sound') !== 'false',
    // ... other settings
  };

  const db = getDB();
  await db.settings.put({ key: 'user', ...settings });

  localStorage.setItem(MIGRATION_KEY, Date.now().toString());
  return { skipped: false };
}

// src/lib/storage/migrations/v1-recent-tasks.ts

export async function migrateRecentTasksV1(): Promise<MigrationResult> {
  const MIGRATION_KEY = 'particle_migration_tasks_v1';

  if (localStorage.getItem(MIGRATION_KEY)) {
    return { skipped: true, count: 0 };
  }

  const oldTasks = JSON.parse(
    localStorage.getItem('particle_recent_tasks') || '[]'
  );

  const db = getDB();
  let migrated = 0;

  for (const task of oldTasks) {
    await db.recentTasks.put(task);
    migrated++;
  }

  localStorage.setItem(MIGRATION_KEY, Date.now().toString());
  return { skipped: false, count: migrated };
}
```

## Testing

### Manuell zu testen
- [ ] Timer-Einstellungen bleiben nach Migration gleich
- [ ] Task-Autocomplete zeigt bisherige Tasks
- [ ] Sound-Einstellung wird korrekt übernommen

### Automatisierte Tests
- [ ] Unit Test: Settings Migration
- [ ] Unit Test: Recent Tasks Migration

## Definition of Done

- [ ] Code implementiert
- [ ] Tests grün
- [ ] User Experience unverändert nach Migration
