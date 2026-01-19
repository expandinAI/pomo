---
type: feature
status: ready
priority: p0
effort: m
business_value: high
origin: "[[ideas/ui-transformation]]"
stories:
  - "[[stories/backlog/POMO-061-task-input]]"
  - "[[stories/backlog/POMO-062-pomodoro-estimate]]"
  - "[[stories/backlog/POMO-063-recent-tasks]]"
  - "[[stories/backlog/POMO-064-task-history]]"
  - "[[stories/backlog/POMO-065-deep-shallow-tag]]"
created: 2026-01-19
updated: 2026-01-19
tags: [ui-transformation, tasks, productivity, p0, mvp]
---

# Quick Task System

## Zusammenfassung

> Minimales Task-System, das es Nutzern ermöglicht, vor einer Session zu dokumentieren, woran sie arbeiten. Kein vollwertiger Task-Manager, sondern ein fokussiertes "Was machst du gerade?"-Feld.

## Kontext & Problem

### Ausgangssituation
Nutzer starten Sessions ohne klares Ziel, was zu weniger Fokus führt. Sessions in der Historie sind nicht aussagekräftig.

### Betroffene Nutzer
Knowledge Worker die ihre Arbeit dokumentieren und verknüpfen wollen.

### Auswirkung
Ohne Task-Kontext ist die Session-Historie weniger wertvoll und Nutzer sind weniger fokussiert.

## Ziele

### Muss erreicht werden
- [ ] Task vor Session eingeben können
- [ ] Recent Tasks als Autocomplete
- [ ] Tasks in Session History anzeigen

### Sollte erreicht werden
- [ ] Pomodoro-Schätzung pro Task

### Nicht im Scope
- Vollständiger Task-Manager / Backlog
- Sub-Tasks
- Externe Integrationen (Linear, Notion) - später

## Lösung

### User Flow

1. User drückt `T` oder klickt ins Feld
2. Tippt "API Integration"
3. Wählt optional "~3 Pomodoros"
4. Drückt Enter oder startet Session mit Space
5. Task wird in Session-History gespeichert

### UI/UX Konzept

**Vor Session:**
```
┌─────────────────────────────────────────────────┐
│                   25:00                         │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ API Integr|                        ~3 🍅│   │
│  ├─────────────────────────────────────────┤   │
│  │ Recent:                                 │   │
│  │   API Integration                       │   │
│  │   Code Review                           │   │
│  └─────────────────────────────────────────┘   │
│                                    [Start]     │
└─────────────────────────────────────────────────┘
```

**Mit aktivem Task:**
```
┌─────────────────────────────────────────────────┐
│                   23:45                         │
│              ━━━━━━━━━━░░░░                     │
│                                                 │
│           API Integration  ~3 🍅                │
│           Work · 2/3 Sessions                   │
└─────────────────────────────────────────────────┘
```

### Technische Überlegungen

**Neue Komponente:** `src/components/task/QuickTaskInput.tsx`

**Timer State erweitern:**
```typescript
interface TimerState {
  currentTask: string;
  estimatedPomodoros: number;
}
```

**Session Storage erweitern:**
```typescript
interface Session {
  task?: string;
  estimatedPomodoros?: number;
  actualPomodoros?: number;
}
```

## Akzeptanzkriterien

- [ ] Textfeld "What are you working on?" unter Timer
- [ ] Max 100 Zeichen, optional
- [ ] Shortcut `T` fokussiert das Feld
- [ ] Enter im Feld startet Session
- [ ] Letzte 10 Tasks als Autocomplete
- [ ] Tasks in Session History sichtbar

## Metriken & Erfolgsmessung

- **Primäre Metrik:** 60% der Sessions haben einen Task
- **Sekundäre Metrik:** User Satisfaction mit History +20%
- **Messzeitraum:** 2 Wochen nach Launch

## Stories

1. [[stories/backlog/POMO-061-task-input]] - Task vor Session (3 SP) - P0
2. [[stories/backlog/POMO-064-task-history]] - Task in History (2 SP) - P0
3. [[stories/backlog/POMO-063-recent-tasks]] - Recent Tasks Autocomplete (3 SP) - P0
4. [[stories/backlog/POMO-062-pomodoro-estimate]] - Pomodoro-Schätzung (2 SP) - P0
5. [[stories/backlog/POMO-065-deep-shallow-tag]] - Deep/Shallow Tag (2 SP) - P1

**P0 Gesamt: 10 Story Points**

## Changelog

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2026-01-19 | Migriert aus backlog/epics | Claude |
