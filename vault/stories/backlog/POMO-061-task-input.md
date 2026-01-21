---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/quick-task-system]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [tasks, input, p0]
---

# POMO-061: Task vor Session eingeben

## User Story

> Als **User**
> möchte ich **vor dem Start einer Session angeben können, woran ich arbeite**,
> damit **ich fokussierter bin und meine Arbeit dokumentiert wird**.

## Kontext

Link zum Feature: [[features/quick-task-system]]

Minimales Task-Feld unter dem Timer. Kein vollwertiger Task-Manager.

## Akzeptanzkriterien

- [ ] **Given** Timer pausiert, **When** angezeigt, **Then** Textfeld "What are you working on?" sichtbar
- [ ] **Given** Textfeld, **When** fokussiert, **Then** Placeholder verschwindet
- [ ] **Given** Eingabe, **When** länger als 100 Zeichen, **Then** abgeschnitten
- [ ] **Given** Task, **When** optional, **Then** kann leer bleiben
- [ ] **Given** Session gestartet, **When** Task vorhanden, **Then** in History gespeichert
- [ ] **Given** Shortcut T, **When** gedrückt, **Then** Feld fokussiert
- [ ] **Given** Enter im Feld, **When** Timer pausiert, **Then** Session startet
- [ ] **Given** Timer läuft, **When** Feld angezeigt, **Then** readonly

## Technische Details

### Neue Komponente
```
src/components/task/QuickTaskInput.tsx
```

### Timer State erweitern
```typescript
interface TimerState {
  // ... existing
  currentTask: string;
  estimatedPomodoros: number;
}
```

### Session Storage erweitern
```typescript
interface Session {
  // ... existing
  task?: string;
  estimatedPomodoros?: number;
  actualPomodoros?: number;
}
```

## UI/UX

```
┌─────────────────────────────────────────────────┐
│                   25:00                         │
│                                                 │
│  What are you working on?          [Start]     │
└─────────────────────────────────────────────────┘
```

## Testing

### Manuell zu testen
- [ ] Textfeld sichtbar
- [ ] Max 100 Zeichen
- [ ] T-Shortcut fokussiert
- [ ] Enter startet Session
- [ ] Task in Session gespeichert

## Definition of Done

- [ ] QuickTaskInput Komponente
- [ ] Timer State erweitert
- [ ] Session Storage erweitert
- [ ] Keyboard Shortcuts
