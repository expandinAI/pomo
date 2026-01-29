---
type: story
status: backlog
priority: p1
effort: 2
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-28
done_date: null
tags: [feature, sync, settings]
---

# Settings Synchronisation

## User Story

> Als **Nutzer mit mehreren Geräten**
> möchte ich **dass meine Einstellungen synchronisiert werden**,
> damit **ich auf jedem Gerät die gleiche Timer-Konfiguration habe**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

Settings-Sync ist "nice to have" aber verbessert die Experience signifikant. Wer seine 52-Minuten-Sessions auf dem Mac konfiguriert, will das auch auf iOS.

## Akzeptanzkriterien

- [ ] **Given** Settings geändert, **When** Sync, **Then** werden Settings hochgeladen
- [ ] **Given** neues Gerät, **When** Login, **Then** werden Settings runtergeladen
- [ ] **Given** Settings auf beiden Geräten geändert, **When** Sync, **Then** neuere gewinnt

## Technische Details

### Synchronisierte Settings

```typescript
interface SyncedSettings {
  // Timer
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;

  // Behavior
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;

  // Notifications
  soundEnabled: boolean;
  notificationEnabled: boolean;

  // UI Preferences (optional)
  theme?: string;
  compactMode?: boolean;
}
```

### Implementation

```typescript
// src/lib/sync/settings-sync.ts

export async function pushSettings(settings: SyncedSettings): Promise<void> {
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      ...settings,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) throw error;
}

export async function pullSettings(): Promise<SyncedSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .single();

  if (error || !data) return null;

  return {
    workDuration: data.work_duration,
    shortBreakDuration: data.short_break_duration,
    // ... map all fields
  };
}

// Auto-sync when settings change
export function useSettingsSync() {
  const { settings, setSettings } = useSettings();

  // Pull on mount
  useEffect(() => {
    pullSettings().then((remote) => {
      if (remote && isNewer(remote, settings)) {
        setSettings(remote);
      }
    });
  }, []);

  // Push on change (debounced)
  const debouncedPush = useMemo(
    () => debounce((s: SyncedSettings) => pushSettings(s), 2000),
    []
  );

  useEffect(() => {
    debouncedPush(settings);
  }, [settings]);
}
```

### Merge Strategy

Bei Settings verwenden wir auch Last-Write-Wins. Da Settings atomar sind (ein Objekt), gibt es keine Feld-Level-Konflikte.

## Testing

### Manuell zu testen
- [ ] Timer-Duration ändern → in Supabase sichtbar
- [ ] Auf anderem Gerät einloggen → Settings sind da
- [ ] Beide Geräte ändern Settings → Neuere gewinnt

### Automatisierte Tests
- [ ] Unit Test: Settings Push/Pull
- [ ] Integration Test: Settings Sync zwischen Geräten

## Definition of Done

- [ ] Settings-Sync implementiert
- [ ] Debounced Push (nicht bei jedem Keystroke)
- [ ] Pull bei App-Start
- [ ] Conflict Resolution funktioniert
