---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/extended-presets]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [presets, timer, ui, p0]
---

# POMO-066: Preset Selector UI

## User Story

> Als **User**
> möchte ich **zwischen verschiedenen Timer-Presets wählen können**,
> damit **ich die für mich optimale Fokus-Strategie nutzen kann**.

## Kontext

Link zum Feature: [[features/extended-presets]]

Tabs über dem Timer für schnellen Preset-Wechsel.

## Akzeptanzkriterien

- [ ] **Given** Timer, **When** angezeigt, **Then** Preset-Tabs prominent: 25m | 52m | 90m | Custom
- [ ] **Given** Preset aktiv, **When** angezeigt, **Then** visuell hervorgehoben
- [ ] **Given** Preset-Wechsel, **When** durchgeführt, **Then** kurze Konfiguration angezeigt
- [ ] **Given** Timer pausiert, **When** Preset gewechselt, **Then** Timer resettet
- [ ] **Given** Timer läuft, **When** Preset-Wechsel, **Then** Warnung angezeigt
- [ ] **Given** Shortcuts 1-4, **When** gedrückt, **Then** entsprechendes Preset

## Technische Details

### Neue Komponente
```
src/components/timer/PresetSelector.tsx
```

### Presets Definition
```typescript
const PRESETS = {
  pomodoro: {
    id: 'pomodoro',
    name: 'Pomodoro',
    shortcut: '1',
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    sessionsUntilLong: 4,
  },
  deepWork: {
    id: 'deepWork',
    name: 'Deep Work',
    shortcut: '2',
    work: 52 * 60,
    shortBreak: 17 * 60,
    longBreak: 30 * 60,
    sessionsUntilLong: 2,
  },
  ultradian: {
    id: 'ultradian',
    name: '90-Min Block',
    shortcut: '3',
    work: 90 * 60,
    shortBreak: 20 * 60,
    longBreak: 30 * 60,
    sessionsUntilLong: 2,
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    shortcut: '4',
  },
};
```

## UI/UX

```
┌─────────────────────────────────────────────────┐
│    ┌─────┬─────┬─────┬────────┐                │
│    │ 25m │ 52m │ 90m │ Custom │                │
│    └─────┴─────┴─────┴────────┘                │
│                                                 │
│                   52:00                         │
│                                                 │
│         Deep Work · 17min Break                 │
└─────────────────────────────────────────────────┘
```

## Testing

### Manuell zu testen
- [ ] Tabs sichtbar
- [ ] Aktives Preset hervorgehoben
- [ ] Shortcuts 1-4 funktionieren
- [ ] Reset bei Wechsel (pausiert)
- [ ] Warnung bei Wechsel (läuft)

## Definition of Done

- [ ] PresetSelector Komponente
- [ ] Presets Definition
- [ ] Keyboard Shortcuts
- [ ] Wechsel-Warnung
