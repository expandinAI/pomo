---
type: story
status: backlog
priority: p0
effort: 1
feature: "[[features/extended-presets]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [presets, deep-work, p0]
---

# POMO-067: 52/17 Deep Work Preset

## User Story

> Als **Knowledge Worker**
> möchte ich **den wissenschaftlich fundierten 52/17-Rhythmus nutzen können**,
> damit **ich wie die produktivsten 10% arbeiten kann**.

## Kontext

Link zum Feature: [[features/extended-presets]]

Basiert auf DeskTime Studie: Top 10% produktivste Mitarbeiter arbeiten 52 Min, pausieren 17 Min.

## Akzeptanzkriterien

- [ ] **Given** Deep Work Preset, **When** gewählt, **Then** 52min Arbeit, 17min Pause
- [ ] **Given** Shortcut, **When** 2 gedrückt, **Then** Deep Work aktiviert
- [ ] **Given** 2 Zyklen, **When** abgeschlossen, **Then** lange Pause (30min)
- [ ] **Given** Preset, **When** Hover/Tap auf Info, **Then** Tooltip mit DeskTime Studie
- [ ] **Given** Command Palette, **When** gesucht, **Then** "Switch to Deep Work" verfügbar

## Technische Details

### Preset Konfiguration
```typescript
deepWork: {
  id: 'deepWork',
  name: 'Deep Work',
  shortcut: '2',
  work: 52 * 60,      // 52 Minuten
  shortBreak: 17 * 60, // 17 Minuten
  longBreak: 30 * 60,  // 30 Minuten
  sessionsUntilLong: 2,
  description: 'Based on DeskTime study: Top 10% work 52 min, break 17 min',
}
```

### Info Tooltip
```
┌─────────────────────────────────────────────────┐
│ Deep Work (52/17)                               │
│                                                 │
│ Based on DeskTime study: The most productive   │
│ 10% of workers work for 52 minutes, then       │
│ take a 17-minute break.                         │
└─────────────────────────────────────────────────┘
```

## Testing

### Manuell zu testen
- [ ] 52min Work Timer
- [ ] 17min Break Timer
- [ ] Shortcut 2 funktioniert
- [ ] Info Tooltip sichtbar

## Definition of Done

- [ ] Preset konfiguriert
- [ ] In Command Palette
- [ ] Tooltip mit Studie
