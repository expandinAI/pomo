# POMO-308: Workflow Settings Sync

**Status:** Done
**Type:** Feature
**Priority:** Medium

---

## Zusammenfassung

Workflow-Settings (Timer, Daily Goal, Auto-Start, Overflow) werden zwischen Geräten synchronisiert. Device-Settings (Sound, Theme) bleiben lokal.

---

## Implementierte Änderungen

### Neue Dateien
- `supabase/migrations/003_settings_sync.sql` - DB Migration
- `src/lib/sync/settings-sync.ts` - Push/Pull Service
- `src/lib/sync/use-settings-sync.ts` - Automatischer Sync Hook
- `src/lib/sync/use-settings-sync-actions.ts` - Manuelle Sync-Aktionen
- `src/lib/sync/__tests__/settings-sync.test.ts` - Unit Tests
- `src/app/settings-sync-test/page.tsx` - Debug-Seite
- `vitest.config.ts` - Test-Konfiguration

### Geänderte Dateien
- `supabase/schema.sql` - Neue Spalten
- `src/lib/supabase/types.ts` - TypeScript-Typen
- `src/lib/sync/types.ts` - Sync-Typen
- `src/lib/sync/sync-context.tsx` - Hook-Integration
- `src/lib/sync/index.ts` - Exports
- `src/components/settings/TimerSettings.tsx` - Sync bei Open/Close

### Sync-Timing

| Trigger | Aktion |
|---------|--------|
| **Settings öffnen** | → `pullNow()` - Neueste Settings vom Server holen |
| **Settings schließen** | → `pushNow()` - Aktuelle Settings zum Server senden |
| **Login** | → Initial Pull (nach 500ms) |
| **localStorage-Änderung** | → Debounced Push (2s Fallback) |

### Hooks

- `useSettingsSync()` - Automatischer Sync (läuft im SyncProvider)
- `useSettingsSyncActions()` - Manuelle `pullNow()` / `pushNow()` für Komponenten

---

## Was wird gesynct

| Setting | localStorage Key | Supabase Column |
|---------|------------------|-----------------|
| Timer Preset | `particle_timer_settings` | `settings_json.presetId` |
| Custom Preset | `particle_custom_preset` | `settings_json.customPreset` |
| Work Duration | (aus Preset) | `work_duration_seconds` |
| Short Break | (aus Preset) | `break_duration_seconds` |
| Long Break | (aus Preset) | `long_break_duration_seconds` |
| Sessions until Long | (aus Preset) | `sessions_until_long_break` |
| Overflow | `particle_overflow_enabled` | `overflow_enabled` |
| Daily Goal | `particle_daily_goal` | `daily_goal` |
| Auto-Start Enabled | `particle_auto_start_enabled` | `auto_start_breaks` + `auto_start_work` |
| Auto-Start Delay | `particle_auto_start_delay` | `auto_start_delay` |
| Auto-Start Mode | `particle_auto_start_mode` | `auto_start_mode` |

## Was NICHT gesynct wird (bleibt lokal)

- Sound Settings
- Theme (light/dark/system)
- Keyboard Hints
- Celebration Settings
- Ambient Sounds
- Night Mode
- Visual Timer
- Break Breathing
- Wellbeing Hints

---

## Test-Anleitung

### Voraussetzungen

1. **Migration ausführen:**
   ```sql
   -- In Supabase Dashboard → SQL Editor
   -- Inhalt von supabase/migrations/003_settings_sync.sql einfügen und ausführen
   ```

2. **Dev-Server starten:**
   ```bash
   pnpm dev
   ```

### Test-Szenarien

#### Szenario 1: Initial Push

1. Öffne `http://localhost:3000/settings-sync-test`
2. Melde dich mit Clerk an
3. Warte bis "Supabase User ID" angezeigt wird
4. Klicke "↑ Push Local → Remote"
5. **Erwartung:** Remote Settings werden befüllt, Diff zeigt "in sync"

#### Szenario 2: Cross-Device Sync

1. Öffne die App in **Browser A** (normales Fenster)
2. Öffne die App in **Browser B** (Inkognito oder anderer Browser)
3. Melde dich in beiden mit demselben Account an
4. In **Browser A**: Gehe zu Settings, ändere Timer auf "Deep Work" (52 min)
5. In **Browser B**: Öffne `/settings-sync-test`
6. **Erwartung:** Remote zeigt "deepWork", Local zeigt alte Einstellung
7. Klicke "↓ Pull Remote → Local"
8. **Erwartung:** Beide Settings synchron, Timer zeigt 52 min

#### Szenario 3: Auto-Sync bei Login

1. Logge aus
2. Öffne `/settings-sync-test`
3. Ändere lokale Settings (z.B. Daily Goal auf 6)
4. Logge ein
5. **Erwartung:** Nach ~0.5s wird automatisch gesynct

#### Szenario 4: Debounced Push

1. Öffne App + `/settings-sync-test` nebeneinander
2. Ändere in der App schnell mehrere Settings (Preset, Overflow, Daily Goal)
3. **Erwartung:** Nur ein Push nach 2 Sekunden (nicht pro Änderung)
4. Prüfe in `/settings-sync-test` → Refresh

#### Szenario 5: Last-Write-Wins

1. Öffne App in zwei Browsern
2. In Browser A: Setze Daily Goal = 4
3. Warte 3 Sekunden
4. In Browser B: Setze Daily Goal = 7
5. Warte 3 Sekunden
6. In Browser A: Refresh `/settings-sync-test`
7. **Erwartung:** Remote zeigt Daily Goal = 7 (neuerer Timestamp gewinnt)

#### Szenario 6: Device-Settings bleiben lokal

1. In Browser A: Ändere Sound-Lautstärke und Theme
2. In Browser B: Logge ein
3. **Erwartung:** Sound und Theme in Browser B bleiben unverändert

---

## Unit Tests

```bash
# Nur Settings-Sync Tests
pnpm test src/lib/sync/__tests__/settings-sync.test.ts --run

# Alle Tests
pnpm test --run
```

**Coverage:**
- `extractSyncedSettings` - 10 Tests
- `applySyncedSettings` - 7 Tests
- Roundtrip - 2 Tests

---

## Bekannte Limitierungen

1. **Kein Offline-Queue:** Settings werden nur bei Online-Verbindung gepusht
2. **Kein Real-Time Sync:** Polling alle 30s oder bei Focus
3. **Keine Merge-Strategie:** Last-Write-Wins kann theoretisch Settings verlieren

---

## Nächste Schritte

- [ ] Real-time Sync via Supabase Realtime (optional)
- [ ] Sync-Indicator in der UI
- [ ] Konflikt-Benachrichtigung bei parallelen Änderungen
