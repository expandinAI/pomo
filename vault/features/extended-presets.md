---
type: feature
status: ready
priority: p0
effort: m
business_value: high
origin: "[[ideas/ui-transformation]]"
stories:
  - "[[stories/backlog/POMO-066-preset-selector]]"
  - "[[stories/backlog/POMO-067-deep-work-preset]]"
  - "[[stories/backlog/POMO-068-ultradian-preset]]"
  - "[[stories/backlog/POMO-069-custom-preset]]"
  - "[[stories/backlog/POMO-070-session-counter]]"
  - "[[stories/backlog/POMO-071-preset-stats]]"
created: 2026-01-19
updated: 2026-01-19
tags: [ui-transformation, timer, presets, p0, mvp]
---

# Extended Timer Presets

## Zusammenfassung

> Erweiterung des Timer-Systems um wissenschaftlich fundierte Presets (52/17 Deep Work, 90-Min Ultradian) zusätzlich zum klassischen Pomodoro. Ermöglicht es Nutzern, die für sie optimale Fokus-Strategie zu wählen.

## Kontext & Problem

### Ausgangssituation
Nicht alle Menschen arbeiten optimal mit 25-Minuten-Blöcken; manche brauchen längere Fokusphasen.

### Betroffene Nutzer
Deep Work Practitioners, Entwickler, Kreative mit unterschiedlichen Fokus-Bedürfnissen.

### Auswirkung
Mit nur einem Preset verliert Particle Nutzer, die andere Methoden bevorzugen.

## Ziele

### Muss erreicht werden
- [ ] Preset Selector UI mit 4 Optionen
- [ ] 52/17 Deep Work Preset
- [ ] 90-Min Ultradian Preset
- [ ] Custom Preset Editor

### Sollte erreicht werden
- [ ] Session Counter bis zur langen Pause

### Nicht im Scope
- Automatische Preset-Empfehlung basierend auf Tageszeit
- Preset Sharing/Import

## Lösung

### Wissenschaftliche Grundlagen

| Preset | Quelle | Beschreibung |
|--------|--------|--------------|
| **25/5 Pomodoro** | Francesco Cirillo | Klassische Technik, gut für Einsteiger |
| **52/17 Deep Work** | DeskTime Studie | Top 10% produktivste Mitarbeiter |
| **90-Min Ultradian** | Nathaniel Kleitman | Biologischer 90-120 Min Zyklus |

### UI/UX Konzept

```
┌─────────────────────────────────────────────────┐
│    ┌─────┬─────┬─────┬────────┐                │
│    │ 25m │ 52m │ 90m │ Custom │                │
│    └─────┴─────┴─────┴────────┘                │
│                                                 │
│                   52:00                         │
│              ━━━━━━━━━━░░░░░░                   │
│                                                 │
│         Deep Work · 17min Break                 │
│              1/2 Sessions                       │
└─────────────────────────────────────────────────┘
```

### Technische Überlegungen

**Presets Definition:**
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
};
```

## Akzeptanzkriterien

- [ ] Preset-Tabs prominent über Timer
- [ ] Shortcuts 1-4 wechseln Presets
- [ ] Preset-Wechsel resettet Timer (wenn pausiert)
- [ ] Session Counter zeigt Fortschritt
- [ ] Custom Preset mit Slidern editierbar
- [ ] Werte werden persistent gespeichert

## Metriken & Erfolgsmessung

- **Primäre Metrik:** 40% nutzen alternatives Preset mindestens 1x
- **Sekundäre Metrik:** Custom Preset Nutzung > 20%
- **Messzeitraum:** 4 Wochen nach Launch

## Stories

1. [[stories/backlog/POMO-066-preset-selector]] - Preset Selector UI (3 SP) - P0
2. [[stories/backlog/POMO-067-deep-work-preset]] - 52/17 Deep Work (1 SP) - P0
3. [[stories/backlog/POMO-068-ultradian-preset]] - 90-Min Ultradian (2 SP) - P0
4. [[stories/backlog/POMO-070-session-counter]] - Session Counter (1 SP) - P0
5. [[stories/backlog/POMO-069-custom-preset]] - Custom Preset Editor (3 SP) - P0
6. [[stories/backlog/POMO-071-preset-stats]] - Preset Statistiken (2 SP) - P1

**P0 Gesamt: 10 Story Points**

## Changelog

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2026-01-19 | Migriert aus backlog/epics | Claude |
