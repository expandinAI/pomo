---
type: story
status: done
priority: p0
effort: 2
feature: "[[features/quick-task-system]]"
created: 2026-01-19
updated: 2026-01-19
done_date: 2026-01-19
tags: [tasks, estimate, p0]
---

# POMO-062: Pomodoro-Schätzung

## User Story

> Als **User**
> möchte ich **schätzen können, wie viele Pomodoros eine Aufgabe braucht**,
> damit **ich meinen Fortschritt tracken und meine Schätzfähigkeit verbessern kann**.

## Kontext

Link zum Feature: [[features/quick-task-system]]

Optionale Schätzung neben dem Task-Input für besseres Tracking.

## Akzeptanzkriterien

- [ ] **Given** Task Input, **When** angezeigt, **Then** Buttons/Dropdown für 1-8 Pomodoros
- [ ] **Given** Schätzung, **When** default, **Then** "nicht geschätzt" (kein Button aktiv)
- [ ] **Given** Darstellung, **When** angezeigt, **Then** kleine Tomaten-Icons oder Zahlen
- [ ] **Given** Schätzung, **When** gewählt, **Then** mit Task gespeichert
- [ ] **Given** Stats, **When** Task fertig, **Then** "Geschätzt vs. Tatsächlich" anzeigbar
- [ ] **Given** Task-Feld fokussiert, **When** Ziffer 1-8, **Then** Schätzung gesetzt

## Technische Details

### UI Design Optionen

**Option A: Buttons**
```
[ API Integration                    ] [1] [2] [3] [4+]
```

**Option B: Inline**
```
[ API Integration              ~3 🍅 ]
```

### State
```typescript
const [estimatedPomodoros, setEstimatedPomodoros] = useState<number | null>(null);
```

## Testing

### Manuell zu testen
- [ ] Schätzung auswählbar
- [ ] Default ist "nicht geschätzt"
- [ ] Mit Task gespeichert
- [ ] Ziffern-Shortcut funktioniert

## Definition of Done

- [ ] UI für Schätzung
- [ ] Keyboard Shortcuts
- [ ] In Session Storage
- [ ] In Stats anzeigbar
