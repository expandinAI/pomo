---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/extended-presets]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [presets, custom, settings, p0]
---

# POMO-069: Custom Preset Editor

## User Story

> Als **User**
> möchte ich **meine eigenen Timer-Werte definieren können**,
> damit **ich Pomo an meine individuellen Bedürfnisse anpassen kann**.

## Kontext

Link zum Feature: [[features/extended-presets]]

Editierbare Werte für das Custom Preset mit Slidern.

## Akzeptanzkriterien

- [ ] **Given** Custom Preset, **When** gewählt, **Then** editierbare Werte
- [ ] **Given** Work Duration, **When** Slider, **Then** 1-120 Minuten
- [ ] **Given** Short Break, **When** Slider, **Then** 1-30 Minuten
- [ ] **Given** Long Break, **When** Slider, **Then** 5-60 Minuten
- [ ] **Given** Sessions until Long, **When** Slider, **Then** 2-8
- [ ] **Given** Werte, **When** geändert, **Then** persistent gespeichert
- [ ] **Given** Reset Button, **When** geklickt, **Then** Standard-Werte

## Technische Details

### Settings UI
```
┌─────────────────────────────────────────────────┐
│ Custom Preset                                   │
├─────────────────────────────────────────────────┤
│ Work Duration        [━━━━━━●━━━] 45 min       │
│ Short Break          [━━●━━━━━━━] 10 min       │
│ Long Break           [━━━●━━━━━━] 20 min       │
│ Sessions until Long  [━━━━●━━━━━] 4            │
├─────────────────────────────────────────────────┤
│                        [Reset to Default]       │
└─────────────────────────────────────────────────┘
```

### LocalStorage
```typescript
const STORAGE_KEY = 'pomo-custom-preset';

interface CustomPreset {
  work: number;      // Sekunden
  shortBreak: number;
  longBreak: number;
  sessionsUntilLong: number;
}

const DEFAULT_CUSTOM: CustomPreset = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  sessionsUntilLong: 4,
};
```

### Slider Komponente
```tsx
<Slider
  min={1}
  max={120}
  step={1}
  value={workMinutes}
  onChange={setWorkMinutes}
/>
```

## Testing

### Manuell zu testen
- [ ] Slider funktionieren
- [ ] Werte werden gespeichert
- [ ] Reset setzt zurück
- [ ] Timer nutzt Custom-Werte

## Definition of Done

- [ ] Settings UI mit Slidern
- [ ] LocalStorage Persistenz
- [ ] Reset Funktion
- [ ] Timer Integration
