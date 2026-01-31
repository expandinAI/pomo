---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/local-first-persistence]]"
created: 2026-01-28
updated: 2026-01-29
done_date: null
tags: [infrastructure, migration, settings, tasks]
---

# POMO-203: Settings & Tasks Migration – Präferenzen retten

## User Story

> Als **bestehender Nutzer**
> möchte ich **dass meine Einstellungen und Recent Tasks migriert werden**,
> damit **meine personalisierte Erfahrung erhalten bleibt**.

## Kontext

Link zum Feature: [[features/local-first-persistence]]

**Vorgänger:** POMO-202 (Project Migration)

Settings und Recent Tasks sind wichtig für die User Experience. Ohne sie muss der Nutzer alles neu konfigurieren.

**Reihenfolge:** POMO-200 → POMO-201 → POMO-202 → **POMO-203**

## Akzeptanzkriterien

- [ ] **Given** Settings in localStorage, **When** die App startet, **Then** werden sie zu IndexedDB migriert
- [ ] **Given** Recent Tasks in localStorage, **When** die App startet, **Then** werden sie zu IndexedDB migriert
- [ ] **Given** Task-Autocomplete, **When** nach Migration genutzt, **Then** zeigt es die migrierten Tasks
- [ ] **Given** alle Timer-Settings, **When** nach Migration genutzt, **Then** haben sie die gleichen Werte
- [ ] **Given** alle Sound-Settings, **When** nach Migration genutzt, **Then** haben sie die gleichen Werte

## Technische Details

### Vollständiges localStorage Key-Inventar

Die App nutzt **viele** verteilte localStorage-Keys. Diese müssen alle migriert werden:

#### Timer & Session Settings
| Key | Typ | Beschreibung |
|-----|-----|--------------|
| `particle_timer_settings` | JSON Object | Basis-Timer Durationen |
| `particle_custom_preset` | JSON Object | Custom Preset (durations, sessionsUntilLong) |
| `particle_overflow_enabled` | boolean | Overflow-Modus aktiv |
| `particle_daily_goal` | number | Tägliches Partikel-Ziel |
| `particle_auto_start_enabled` | boolean | Auto-Start aktiviert |
| `particle_auto_start_delay` | number | Verzögerung in Sekunden |
| `particle_auto_start_mode` | string | 'breaks' | 'all' |
| `particle_show_end_time` | boolean | End-Zeit anzeigen |
| `particle_visual_timer` | boolean | Visueller Timer-Ring |

#### Celebration & Wellbeing
| Key | Typ | Beschreibung |
|-----|-----|--------------|
| `particle_celebration_enabled` | boolean | Feier-Animation aktiv |
| `particle_celebration_trigger` | string | 'first' | 'every' |
| `particle_celebration_intensity` | string | 'subtle' | 'normal' | 'epic' |
| `particle_break_breathing_enabled` | boolean | Atem-Übung in Pausen |
| `particle_wellbeing_hints_enabled` | boolean | Wellbeing-Tipps |
| `particle_night_mode_enabled` | boolean | Nachtmodus |

#### Sound Settings
| Key | Typ | Beschreibung |
|-----|-----|--------------|
| `particle_sound_settings` | string | Sound-Auswahl |
| `particle_sound_volume` | number | 0-1 |
| `particle_sound_muted` | boolean | Global Mute |
| `particle_completion_sound_enabled` | boolean | Completion Chime |
| `particle_ui_sounds_enabled` | boolean | UI Sounds |
| `particle_transition_sounds_enabled` | boolean | Transition Sounds |
| `particle_transition_intensity` | string | 'subtle' | 'moderate' | 'immersive' |

#### Ambient & Visual
| Key | Typ | Beschreibung |
|-----|-----|--------------|
| `particle_ambient_type` | string | Ambient Sound Type |
| `particle_ambient_volume` | number | 0-1 |
| `particle_ambient_effects_enabled` | boolean | Visuelle Ambient-Effekte |
| `particle_style` | string | Particle Style |
| `particle_parallax` | boolean | Parallax-Effekt |
| `particle_pace` | string | Animation Pace |
| `particle_visual_mode` | string | Quality Mode |

#### UI & Misc
| Key | Typ | Beschreibung |
|-----|-----|--------------|
| `particle:keyboard-hints-visible` | boolean | Keyboard Hints |
| `particle:contextual-hints` | JSON Object | Gezeigte Hints |
| `particle:daily-intention-enabled` | boolean | Daily Intention |
| `particle:rhythm-onboarding-completed` | boolean | Onboarding done |
| `particle:intro-seen` | boolean | Intro gesehen |
| `particle_haptics_enabled` | boolean | Haptics |
| `particle-week-start` | string | 'sunday' | 'monday' |
| `theme` | string | 'dark' | 'light' | 'system' |

#### Recent Tasks
| Key | Typ | Beschreibung |
|-----|-----|--------------|
| `particle_recent_tasks` | JSON Array | Kürzlich verwendete Tasks |

### Dateistruktur

```
src/lib/db/
└── migrations/
    ├── index.ts              # Migration Runner (erweitern)
    ├── settings.ts           # NEU: Settings Migration
    └── recent-tasks.ts       # NEU: Recent Tasks Migration
```

### Settings Migration

```typescript
// src/lib/db/migrations/settings.ts

import { getDB } from '../database';
import type { DBSettings } from '../types';

const MIGRATION_KEY = 'particle_migration_settings_v1';

/**
 * Alle Settings-Keys und ihre Defaults
 */
const SETTINGS_KEYS = {
  // Timer
  'particle_timer_settings': { type: 'json', default: null },
  'particle_custom_preset': { type: 'json', default: null },
  'particle_overflow_enabled': { type: 'boolean', default: false },
  'particle_daily_goal': { type: 'number', default: 4 },
  'particle_auto_start_enabled': { type: 'boolean', default: false },
  'particle_auto_start_delay': { type: 'number', default: 5 },
  'particle_auto_start_mode': { type: 'string', default: 'breaks' },
  'particle_show_end_time': { type: 'boolean', default: true },
  'particle_visual_timer': { type: 'boolean', default: true },

  // Celebration & Wellbeing
  'particle_celebration_enabled': { type: 'boolean', default: true },
  'particle_celebration_trigger': { type: 'string', default: 'first' },
  'particle_celebration_intensity': { type: 'string', default: 'normal' },
  'particle_break_breathing_enabled': { type: 'boolean', default: true },
  'particle_wellbeing_hints_enabled': { type: 'boolean', default: true },
  'particle_night_mode_enabled': { type: 'boolean', default: false },

  // Sound
  'particle_sound_settings': { type: 'string', default: 'default' },
  'particle_sound_volume': { type: 'number', default: 0.7 },
  'particle_sound_muted': { type: 'boolean', default: false },
  'particle_completion_sound_enabled': { type: 'boolean', default: true },
  'particle_ui_sounds_enabled': { type: 'boolean', default: false },
  'particle_transition_sounds_enabled': { type: 'boolean', default: true },
  'particle_transition_intensity': { type: 'string', default: 'moderate' },

  // Ambient & Visual
  'particle_ambient_type': { type: 'string', default: null },
  'particle_ambient_volume': { type: 'number', default: 0.5 },
  'particle_ambient_effects_enabled': { type: 'boolean', default: true },
  'particle_style': { type: 'string', default: 'classic' },
  'particle_parallax': { type: 'boolean', default: true },
  'particle_pace': { type: 'string', default: 'normal' },
  'particle_visual_mode': { type: 'string', default: 'auto' },

  // UI & Misc
  'particle:keyboard-hints-visible': { type: 'boolean', default: true },
  'particle:contextual-hints': { type: 'json', default: {} },
  'particle:daily-intention-enabled': { type: 'boolean', default: false },
  'particle:rhythm-onboarding-completed': { type: 'boolean', default: false },
  'particle:intro-seen': { type: 'boolean', default: false },
  'particle_haptics_enabled': { type: 'boolean', default: true },
  'particle-week-start': { type: 'string', default: 'monday' },
  'theme': { type: 'string', default: 'dark' },
} as const;

type SettingType = 'string' | 'number' | 'boolean' | 'json';

function parseValue(value: string | null, type: SettingType): unknown {
  if (value === null) return null;

  switch (type) {
    case 'boolean':
      return value === 'true';
    case 'number':
      return parseFloat(value);
    case 'json':
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    default:
      return value;
  }
}

export interface SettingsMigrationResult {
  skipped: boolean;
  migrated: number;
}

/**
 * Migriert alle Settings von localStorage zu IndexedDB
 *
 * Strategy: Ein großes Settings-Objekt pro Kategorie
 * - timer: Timer-bezogene Settings
 * - celebration: Celebration & Wellbeing
 * - sound: Sound Settings
 * - visual: Visual & Ambient
 * - ui: UI Preferences
 */
export async function migrateSettingsV1(): Promise<SettingsMigrationResult> {
  if (localStorage.getItem(MIGRATION_KEY)) {
    return { skipped: true, migrated: 0 };
  }

  const db = getDB();
  const now = new Date().toISOString();
  let migrated = 0;

  // Alle Settings sammeln
  const allSettings: Record<string, unknown> = {};

  for (const [key, config] of Object.entries(SETTINGS_KEYS)) {
    const rawValue = localStorage.getItem(key);
    const value = parseValue(rawValue, config.type as SettingType);

    // Nur nicht-null Werte speichern (sonst Default)
    if (value !== null) {
      allSettings[key] = value;
      migrated++;
    }
  }

  // Als einzelnes Settings-Dokument speichern
  if (Object.keys(allSettings).length > 0) {
    await db.settings.put({
      key: 'user-settings',
      value: allSettings,
      localUpdatedAt: now,
    });
  }

  localStorage.setItem(MIGRATION_KEY, Date.now().toString());
  console.log(`[Migration] Settings: ${migrated} values migrated`);

  return { skipped: false, migrated };
}

/**
 * Lädt ein Setting aus IndexedDB (mit Fallback auf localStorage während Übergang)
 */
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const db = getDB();
  const settings = await db.settings.get('user-settings');

  if (settings?.value && key in (settings.value as Record<string, unknown>)) {
    return (settings.value as Record<string, unknown>)[key] as T;
  }

  // Fallback auf localStorage (für Übergangszeit)
  const rawValue = localStorage.getItem(key);
  if (rawValue !== null) {
    const config = SETTINGS_KEYS[key as keyof typeof SETTINGS_KEYS];
    if (config) {
      return parseValue(rawValue, config.type as SettingType) as T ?? defaultValue;
    }
  }

  return defaultValue;
}

/**
 * Speichert ein Setting in IndexedDB
 */
export async function setSetting(key: string, value: unknown): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();

  const existing = await db.settings.get('user-settings');
  const currentSettings = (existing?.value as Record<string, unknown>) || {};

  await db.settings.put({
    key: 'user-settings',
    value: {
      ...currentSettings,
      [key]: value,
    },
    localUpdatedAt: now,
  });
}
```

### Recent Tasks Migration

```typescript
// src/lib/db/migrations/recent-tasks.ts

import { getDB } from '../database';
import type { DBRecentTask } from '../types';

const MIGRATION_KEY = 'particle_migration_tasks_v1';
const LEGACY_STORAGE_KEY = 'particle_recent_tasks';

interface LegacyTask {
  text: string;
  lastUsed: string;
  estimatedPomodoros?: number;
}

export interface TasksMigrationResult {
  skipped: boolean;
  migrated: number;
  errors: string[];
}

/**
 * Migriert Recent Tasks von localStorage zu IndexedDB
 */
export async function migrateRecentTasksV1(): Promise<TasksMigrationResult> {
  if (localStorage.getItem(MIGRATION_KEY)) {
    return { skipped: true, migrated: 0, errors: [] };
  }

  const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacyData) {
    localStorage.setItem(MIGRATION_KEY, Date.now().toString());
    return { skipped: false, migrated: 0, errors: [] };
  }

  let legacyTasks: LegacyTask[];
  try {
    legacyTasks = JSON.parse(legacyData);
  } catch (e) {
    console.error('[Migration] Failed to parse legacy tasks:', e);
    localStorage.setItem(MIGRATION_KEY, Date.now().toString());
    return { skipped: false, migrated: 0, errors: ['Failed to parse legacy data'] };
  }

  if (!Array.isArray(legacyTasks) || legacyTasks.length === 0) {
    localStorage.setItem(MIGRATION_KEY, Date.now().toString());
    return { skipped: false, migrated: 0, errors: [] };
  }

  const db = getDB();
  let migrated = 0;
  const errors: string[] = [];

  for (const legacy of legacyTasks) {
    try {
      // Idempotenz: text ist Primary Key
      const existing = await db.recentTasks.get(legacy.text);
      if (existing) {
        continue;
      }

      const dbTask: DBRecentTask = {
        text: legacy.text,
        lastUsed: legacy.lastUsed,
        estimatedPomodoros: legacy.estimatedPomodoros,
      };

      await db.recentTasks.add(dbTask);
      migrated++;
    } catch (e) {
      const errorMsg = `Task "${legacy.text}": ${e instanceof Error ? e.message : String(e)}`;
      errors.push(errorMsg);
    }
  }

  localStorage.setItem(MIGRATION_KEY, Date.now().toString());
  console.log(`[Migration] Recent Tasks: ${migrated} migrated, ${errors.length} errors`);

  return { skipped: false, migrated, errors };
}
```

### Migration Runner finalisieren

```typescript
// src/lib/db/migrations/index.ts (vollständig)

import { migrateSessionsV1 } from './sessions';
import { migrateProjectsV1 } from './projects';
import { migrateSettingsV1 } from './settings';
import { migrateRecentTasksV1 } from './recent-tasks';

export interface MigrationResult {
  name: string;
  skipped: boolean;
  migrated: number;
  errors: string[];
  duration: number;
}

export interface MigrationProgress {
  current: string;
  total: number;
  completed: number;
}

type ProgressCallback = (progress: MigrationProgress) => void;

/**
 * Führt alle Migrationen aus
 */
export async function runMigrations(
  onProgress?: ProgressCallback
): Promise<MigrationResult[]> {
  const migrations = [
    { name: 'sessions-v1', run: migrateSessionsV1 },
    { name: 'projects-v1', run: migrateProjectsV1 },
    { name: 'settings-v1', run: migrateSettingsV1 },
    { name: 'recent-tasks-v1', run: migrateRecentTasksV1 },
  ];

  const results: MigrationResult[] = [];

  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i];

    onProgress?.({
      current: migration.name,
      total: migrations.length,
      completed: i,
    });

    const startTime = Date.now();
    try {
      const result = await migration.run();

      results.push({
        name: migration.name,
        skipped: result.skipped,
        migrated: result.migrated ?? 0,
        errors: 'errors' in result ? result.errors : [],
        duration: Date.now() - startTime,
      });
    } catch (e) {
      console.error(`[Migration] ${migration.name} failed:`, e);
      results.push({
        name: migration.name,
        skipped: false,
        migrated: 0,
        errors: [e instanceof Error ? e.message : String(e)],
        duration: Date.now() - startTime,
      });
    }
  }

  return results;
}

const MIGRATION_FLAGS = [
  'particle_migration_sessions_v1',
  'particle_migration_projects_v1',
  'particle_migration_settings_v1',
  'particle_migration_tasks_v1',
];

/**
 * Prüft ob Migrationen ausstehen
 */
export function hasPendingMigrations(): boolean {
  return MIGRATION_FLAGS.some(flag => !localStorage.getItem(flag));
}

/**
 * Zählt zu migrierende Einträge
 */
export function countPendingEntries(): number {
  let count = 0;

  // Sessions
  if (!localStorage.getItem('particle_migration_sessions_v1')) {
    const sessions = JSON.parse(localStorage.getItem('particle_session_history') || '[]');
    count += Array.isArray(sessions) ? sessions.length : 0;
  }

  // Projects
  if (!localStorage.getItem('particle_migration_projects_v1')) {
    const projects = JSON.parse(localStorage.getItem('particle_projects') || '[]');
    count += Array.isArray(projects) ? projects.length : 0;
  }

  // Settings (zählen als 1, da ein Block)
  if (!localStorage.getItem('particle_migration_settings_v1')) {
    count += 1;
  }

  // Recent Tasks
  if (!localStorage.getItem('particle_migration_tasks_v1')) {
    const tasks = JSON.parse(localStorage.getItem('particle_recent_tasks') || '[]');
    count += Array.isArray(tasks) ? tasks.length : 0;
  }

  return count;
}

/**
 * Migration Summary für UI
 */
export interface MigrationSummary {
  sessions: number;
  projects: number;
  tasks: number;
  totalTime: number;
  errors: string[];
}

export function summarizeMigration(results: MigrationResult[]): MigrationSummary {
  return {
    sessions: results.find(r => r.name === 'sessions-v1')?.migrated ?? 0,
    projects: results.find(r => r.name === 'projects-v1')?.migrated ?? 0,
    tasks: results.find(r => r.name === 'recent-tasks-v1')?.migrated ?? 0,
    totalTime: results.reduce((sum, r) => sum + r.duration, 0),
    errors: results.flatMap(r => r.errors),
  };
}
```

## Testing

### Manuell zu testen

- [ ] Timer-Einstellungen bleiben nach Migration gleich
- [ ] Sound-Einstellungen bleiben nach Migration gleich
- [ ] Task-Autocomplete zeigt bisherige Tasks
- [ ] Theme bleibt erhalten
- [ ] Custom Preset bleibt erhalten
- [ ] Onboarding-Status bleibt erhalten

### Automatisierte Tests

```typescript
describe('Settings Migration V1', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(async () => {
    await closeDB();
  });

  it('migrates all settings to single document', async () => {
    localStorage.setItem('particle_sound_volume', '0.8');
    localStorage.setItem('particle_celebration_enabled', 'false');
    localStorage.setItem('theme', 'light');

    const result = await migrateSettingsV1();

    expect(result.skipped).toBe(false);
    expect(result.migrated).toBe(3);

    // Verify in IndexedDB
    const db = getDB();
    const settings = await db.settings.get('user-settings');
    expect(settings?.value).toEqual({
      'particle_sound_volume': 0.8,
      'particle_celebration_enabled': false,
      'theme': 'light',
    });
  });

  it('handles JSON settings', async () => {
    localStorage.setItem('particle_timer_settings', JSON.stringify({
      work: 1500,
      shortBreak: 300,
    }));

    await migrateSettingsV1();

    const db = getDB();
    const settings = await db.settings.get('user-settings');
    expect((settings?.value as any)['particle_timer_settings']).toEqual({
      work: 1500,
      shortBreak: 300,
    });
  });
});

describe('Recent Tasks Migration V1', () => {
  it('migrates tasks with text as primary key', async () => {
    localStorage.setItem('particle_recent_tasks', JSON.stringify([
      { text: 'Write docs', lastUsed: '2026-01-28T10:00:00.000Z', estimatedPomodoros: 2 },
      { text: 'Review PR', lastUsed: '2026-01-28T11:00:00.000Z' },
    ]));

    const result = await migrateRecentTasksV1();

    expect(result.migrated).toBe(2);

    const db = getDB();
    const tasks = await db.recentTasks.toArray();
    expect(tasks).toHaveLength(2);

    const writeTask = await db.recentTasks.get('Write docs');
    expect(writeTask?.estimatedPomodoros).toBe(2);
  });
});
```

## Definition of Done

- [ ] Settings-Migration in `src/lib/db/migrations/settings.ts`
- [ ] Recent Tasks-Migration in `src/lib/db/migrations/recent-tasks.ts`
- [ ] Migration-Runner komplett (`runMigrations`, `hasPendingMigrations`, `countPendingEntries`)
- [ ] Alle 30+ Settings-Keys inventarisiert und migriert
- [ ] Unit Tests geschrieben & grün
- [ ] Lokal getestet: Nach Migration sind alle Einstellungen erhalten

## Notizen

**Warum ein großes Settings-Dokument?**
- Einfacher zu handhaben als 30+ separate Dokumente
- Bessere Performance (ein DB-Read statt vielen)
- Leichter zu synchronisieren (später)

**Settings-Hooks Umstellung (später):**
- Nach Migration müssen alle Hooks (`useTimerSettings`, `useSoundSettings`, etc.) auf IndexedDB umgestellt werden
- Das ist eine separate Story (POMO-20X)
- Während der Übergangszeit funktioniert der Fallback auf localStorage

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
