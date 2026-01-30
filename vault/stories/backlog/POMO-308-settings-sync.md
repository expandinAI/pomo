---
type: story
status: backlog
priority: p1
effort: 2
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-29
done_date: null
tags: [feature, sync, settings]
---

# POMO-308: Workflow Settings Sync

## User Story

> Als **Nutzer mit mehreren Geräten**
> möchte ich **dass meine Workflow-Einstellungen synchronisiert werden**,
> damit **ich auf jedem Gerät die gleiche Timer-Konfiguration habe**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

**Vorgänger:** POMO-307 (Trial Management)

Settings-Sync verbessert die Multi-Device-Experience signifikant. Wer seine 52-Minuten-Sessions auf dem Mac konfiguriert, will das auch auf dem iPad.

### Was wird gesynct? (Workflow Settings)

| Setting | Grund |
|---------|-------|
| Timer-Dauern | Kernfunktion |
| Sessions bis Long Break | Workflow |
| Custom Preset | Workflow |
| Overflow aktiviert | Workflow |
| Daily Goal | Workflow |
| Auto-Start Einstellungen | Workflow |

### Was wird NICHT gesynct? (Device Settings)

| Setting | Grund |
|---------|-------|
| Sound On/Off | Gerät hat evtl. andere Speaker-Situation |
| Sound Volume | Geräteabhängig |
| Ambient Sounds | Geräteabhängig |
| Theme | Nutzer hat evtl. unterschiedliche Präferenzen pro Device |
| System-Benachrichtigungen | OS-spezifisch |
| Keyboard Hints | Geräteklasse (Desktop vs. Mobile) |

**Reihenfolge:** POMO-307 → **POMO-308** → Feature complete

## Akzeptanzkriterien

- [ ] **Given** Workflow-Settings geändert, **When** Sync, **Then** werden Settings hochgeladen
- [ ] **Given** neues Gerät, **When** Login, **Then** werden Workflow-Settings runtergeladen
- [ ] **Given** Settings auf beiden Geräten geändert, **When** Sync, **Then** neuere gewinnt (LWW)
- [ ] **Given** Device-Settings geändert, **When** Sync, **Then** werden sie NICHT hochgeladen

## Technische Details

### Dateistruktur

```
src/lib/sync/
├── settings-sync.ts      # NEU: Settings Sync Logik
└── types.ts              # ÄNDERN: SyncedSettings Type
```

### Types

```typescript
// In src/lib/sync/types.ts erweitern:

/**
 * Settings die zwischen Geräten synchronisiert werden.
 * Nur Workflow-relevante Einstellungen.
 */
export interface SyncedSettings {
  // Timer-Dauern
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;

  // Custom Preset (JSON)
  customPreset: {
    name: string;
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsUntilLongBreak: number;
  } | null;

  // Workflow
  overflowEnabled: boolean;
  dailyGoal: number;

  // Auto-Start
  autoStartEnabled: boolean;
  autoStartDelay: number;
  autoStartMode: 'breaks' | 'all';
}

/**
 * Mapping von lokalen Setting-Keys zu SyncedSettings.
 */
export const SYNCED_SETTINGS_KEYS: (keyof SyncedSettings)[] = [
  'workDuration',
  'shortBreakDuration',
  'longBreakDuration',
  'sessionsUntilLongBreak',
  'customPreset',
  'overflowEnabled',
  'dailyGoal',
  'autoStartEnabled',
  'autoStartDelay',
  'autoStartMode',
];
```

### Settings Sync Service

```typescript
// src/lib/sync/settings-sync.ts

import type { SupabaseClient } from '@supabase/supabase-js';
import { getDB } from '@/lib/db';
import type { SyncedSettings } from './types';

const DEBOUNCE_MS = 2000;

/**
 * Pusht Workflow-Settings zu Supabase.
 */
export async function pushSettings(
  supabase: SupabaseClient,
  userId: string,
  settings: SyncedSettings
): Promise<void> {
  const { error } = await supabase.from('user_settings').upsert(
    {
      user_id: userId,
      work_duration: settings.workDuration,
      short_break_duration: settings.shortBreakDuration,
      long_break_duration: settings.longBreakDuration,
      sessions_until_long_break: settings.sessionsUntilLongBreak,
      custom_preset: settings.customPreset,
      overflow_enabled: settings.overflowEnabled,
      daily_goal: settings.dailyGoal,
      auto_start_enabled: settings.autoStartEnabled,
      auto_start_delay: settings.autoStartDelay,
      auto_start_mode: settings.autoStartMode,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) throw error;
}

/**
 * Pullt Workflow-Settings von Supabase.
 */
export async function pullSettings(
  supabase: SupabaseClient,
  userId: string
): Promise<SyncedSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  return {
    workDuration: data.work_duration,
    shortBreakDuration: data.short_break_duration,
    longBreakDuration: data.long_break_duration,
    sessionsUntilLongBreak: data.sessions_until_long_break,
    customPreset: data.custom_preset,
    overflowEnabled: data.overflow_enabled,
    dailyGoal: data.daily_goal,
    autoStartEnabled: data.auto_start_enabled,
    autoStartDelay: data.auto_start_delay,
    autoStartMode: data.auto_start_mode,
  };
}

/**
 * Prüft ob Remote-Settings neuer sind als lokale.
 */
export async function isRemoteNewer(
  supabase: SupabaseClient,
  userId: string,
  localUpdatedAt: string
): Promise<boolean> {
  const { data } = await supabase
    .from('user_settings')
    .select('updated_at')
    .eq('user_id', userId)
    .single();

  if (!data?.updated_at) return false;

  return new Date(data.updated_at) > new Date(localUpdatedAt);
}

/**
 * Extrahiert syncbare Settings aus lokalen Settings.
 */
export function extractSyncedSettings(localSettings: Record<string, unknown>): SyncedSettings {
  return {
    workDuration: (localSettings.workDuration as number) ?? 1500,
    shortBreakDuration: (localSettings.shortBreakDuration as number) ?? 300,
    longBreakDuration: (localSettings.longBreakDuration as number) ?? 900,
    sessionsUntilLongBreak: (localSettings.sessionsUntilLongBreak as number) ?? 4,
    customPreset: (localSettings.customPreset as SyncedSettings['customPreset']) ?? null,
    overflowEnabled: (localSettings.overflowEnabled as boolean) ?? false,
    dailyGoal: (localSettings.dailyGoal as number) ?? 4,
    autoStartEnabled: (localSettings.autoStartEnabled as boolean) ?? false,
    autoStartDelay: (localSettings.autoStartDelay as number) ?? 5,
    autoStartMode: (localSettings.autoStartMode as 'breaks' | 'all') ?? 'breaks',
  };
}

/**
 * Merged Remote-Settings in lokale Settings.
 * Überschreibt nur die syncbaren Felder.
 */
export function mergeSyncedSettings(
  local: Record<string, unknown>,
  remote: SyncedSettings
): Record<string, unknown> {
  return {
    ...local,
    workDuration: remote.workDuration,
    shortBreakDuration: remote.shortBreakDuration,
    longBreakDuration: remote.longBreakDuration,
    sessionsUntilLongBreak: remote.sessionsUntilLongBreak,
    customPreset: remote.customPreset,
    overflowEnabled: remote.overflowEnabled,
    dailyGoal: remote.dailyGoal,
    autoStartEnabled: remote.autoStartEnabled,
    autoStartDelay: remote.autoStartDelay,
    autoStartMode: remote.autoStartMode,
  };
}
```

### React Hook für Settings Sync

```typescript
// src/lib/sync/use-settings-sync.ts

'use client';

import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSupabase } from '@/lib/supabase/client';
import { useSettings } from '@/hooks/useSettings';
import {
  pushSettings,
  pullSettings,
  extractSyncedSettings,
  mergeSyncedSettings,
} from './settings-sync';
import { debounce } from '@/lib/utils';

const DEBOUNCE_MS = 2000;

/**
 * Hook für automatische Settings-Synchronisation.
 * Pusht bei Änderungen (debounced), pullt bei Mount.
 */
export function useSettingsSync() {
  const { userId } = useAuth();
  const supabase = useSupabase();
  const { settings, updateSettings } = useSettings();
  const lastSyncedRef = useRef<string | null>(null);

  // Pull bei Mount (einmalig)
  useEffect(() => {
    if (!supabase || !userId) return;

    async function syncOnMount() {
      try {
        const remote = await pullSettings(supabase!, userId!);
        if (remote) {
          // Merge: Remote Workflow-Settings + lokale Device-Settings
          const merged = mergeSyncedSettings(settings, remote);
          updateSettings(merged);
          lastSyncedRef.current = new Date().toISOString();
        }
      } catch (e) {
        console.error('[SettingsSync] Pull failed:', e);
      }
    }

    syncOnMount();
  }, [supabase, userId]); // Nur bei Mount

  // Debounced Push bei Änderungen
  const debouncedPush = useMemo(
    () =>
      debounce(async (settings: Record<string, unknown>) => {
        if (!supabase || !userId) return;

        try {
          const synced = extractSyncedSettings(settings);
          await pushSettings(supabase, userId, synced);
          lastSyncedRef.current = new Date().toISOString();
        } catch (e) {
          console.error('[SettingsSync] Push failed:', e);
        }
      }, DEBOUNCE_MS),
    [supabase, userId]
  );

  // Push bei Settings-Änderungen
  useEffect(() => {
    if (!supabase || !userId) return;

    // Nur pushen wenn sich syncbare Settings geändert haben
    const synced = extractSyncedSettings(settings);
    debouncedPush(settings);

    return () => {
      debouncedPush.cancel?.();
    };
  }, [settings, debouncedPush, supabase, userId]);

  // Manual refresh
  const refresh = useCallback(async () => {
    if (!supabase || !userId) return;

    const remote = await pullSettings(supabase, userId);
    if (remote) {
      const merged = mergeSyncedSettings(settings, remote);
      updateSettings(merged);
    }
  }, [supabase, userId, settings, updateSettings]);

  return { refresh };
}
```

### Integration in SyncProvider

```typescript
// In src/lib/sync/sync-context.tsx erweitern:

import { useSettingsSync } from './use-settings-sync';

export function SyncProvider({ children }: { children: ReactNode }) {
  // ... existing code ...

  // Settings Sync Hook aktivieren
  useSettingsSync();

  return (
    <SyncContext.Provider value={{ service, status, isOnline }}>
      {children}
    </SyncContext.Provider>
  );
}
```

### Exports

```typescript
// In src/lib/sync/index.ts erweitern:

export {
  pushSettings,
  pullSettings,
  extractSyncedSettings,
  mergeSyncedSettings,
  isRemoteNewer,
} from './settings-sync';

export { useSettingsSync } from './use-settings-sync';

export { type SyncedSettings, SYNCED_SETTINGS_KEYS } from './types';
```

## Settings-Übersicht

### Gesynct (Workflow)

```typescript
// Diese Settings werden zwischen Geräten synchronisiert:
const syncedSettings = {
  // Timer
  workDuration: 1500,
  shortBreakDuration: 300,
  longBreakDuration: 900,
  sessionsUntilLongBreak: 4,

  // Custom Preset
  customPreset: { name: 'My Preset', ... },

  // Workflow
  overflowEnabled: false,
  dailyGoal: 4,

  // Auto-Start
  autoStartEnabled: false,
  autoStartDelay: 5,
  autoStartMode: 'breaks',
};
```

### Nicht gesynct (Device)

```typescript
// Diese Settings bleiben lokal:
const deviceSettings = {
  // Sound
  soundEnabled: true,
  soundVolume: 0.5,
  ambientSound: 'rain',
  ambientVolume: 0.3,

  // Visual
  theme: 'dark',
  keyboardHintsVisible: true,

  // Notifications
  notificationsEnabled: true,

  // Celebration
  celebrationEnabled: true,
  celebrationType: 'confetti',
};
```

## Testing

### Manuell zu testen

- [ ] Timer-Duration ändern → in Supabase sichtbar
- [ ] Auf anderem Gerät einloggen → Timer-Durations sind da
- [ ] Sound-Einstellung ändern → NICHT in Supabase
- [ ] Beide Geräte ändern Settings → Neuere gewinnt
- [ ] Debounce funktioniert (nicht bei jedem Keystroke)

### Automatisierte Tests

```typescript
describe('Settings Sync', () => {
  it('extracts only synced settings', () => {
    const local = {
      workDuration: 1500,
      soundEnabled: true, // Device Setting
      dailyGoal: 6,
    };

    const synced = extractSyncedSettings(local);

    expect(synced.workDuration).toBe(1500);
    expect(synced.dailyGoal).toBe(6);
    expect((synced as any).soundEnabled).toBeUndefined();
  });

  it('merges remote into local preserving device settings', () => {
    const local = {
      workDuration: 1500,
      soundEnabled: true,
      theme: 'light',
    };

    const remote: SyncedSettings = {
      workDuration: 3000,
      // ... other synced settings
    };

    const merged = mergeSyncedSettings(local, remote);

    expect(merged.workDuration).toBe(3000); // From remote
    expect(merged.soundEnabled).toBe(true); // Preserved
    expect(merged.theme).toBe('light'); // Preserved
  });

  it('debounces push on rapid changes', async () => {
    const { result } = renderHook(() => useSettingsSync());

    // Rapid updates
    act(() => updateSettings({ workDuration: 1500 }));
    act(() => updateSettings({ workDuration: 1800 }));
    act(() => updateSettings({ workDuration: 2100 }));

    // Should not have pushed yet
    expect(mockPushSettings).not.toHaveBeenCalled();

    // Wait for debounce
    await act(async () => {
      await new Promise((r) => setTimeout(r, 2100));
    });

    // Should have pushed once with final value
    expect(mockPushSettings).toHaveBeenCalledTimes(1);
    expect(mockPushSettings).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ workDuration: 2100 })
    );
  });
});
```

## Definition of Done

- [ ] `pushSettings()` implementiert (nur Workflow-Settings)
- [ ] `pullSettings()` implementiert
- [ ] `extractSyncedSettings()` filtert korrekt
- [ ] `mergeSyncedSettings()` erhält Device-Settings
- [ ] `useSettingsSync()` Hook funktioniert
- [ ] Debounced Push (2s)
- [ ] Pull bei App-Start
- [ ] Conflict Resolution (LWW) funktioniert
- [ ] Device-Settings werden NICHT gesynct
- [ ] Tests geschrieben & grün

## Notizen

**Warum separate Settings-Tables?**
- `user_settings` enthält nur syncbare Workflow-Settings
- Device-Settings bleiben in IndexedDB `settings` Table
- Klare Trennung zwischen "überall gleich" und "geräteabhängig"

**Debounce-Strategie:**
- 2 Sekunden Debounce
- Verhindert API-Spam bei Slider-Adjustments
- User merkt keine Verzögerung

**Conflict Resolution:**
- Last-Write-Wins wie bei anderen Entities
- Settings sind atomar (ein Objekt)
- Keine Feld-Level-Merges nötig

**Warum Sound nicht gesynct?**
- User A: MacBook mit Kopfhörern → Sound on
- User A: iPad im Büro → Sound off (Kollegen)
- Unterschiedliche Umgebungen → unterschiedliche Präferenzen

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
