---
type: story
status: done
priority: p0
effort: 2
feature: "[[features/quick-task-system]]"
created: 2026-01-19
updated: 2026-01-19
done_date: 2026-01-19
tags: [tasks, history, p0]
---

# POMO-064: Task in Session History anzeigen

## User Story

> Als **User**
> möchte ich **in meiner Session-Historie sehen, woran ich gearbeitet habe**,
> damit **ich meine Arbeit nachvollziehen kann**.

## Kontext

Link zum Feature: [[features/quick-task-system]]

Task-Namen in der Session History für aussagekräftigere Übersicht.

## Akzeptanzkriterien

- [ ] **Given** Session History, **When** Task vorhanden, **Then** Task-Name angezeigt
- [ ] **Given** Session ohne Task, **When** angezeigt, **Then** "Untitled Session"
- [ ] **Given** History Filter, **When** aktiviert, **Then** nur Sessions mit Tasks
- [ ] **Given** Gruppierung, **When** gewählt, **Then** alle Sessions für einen Task zusammen
- [ ] **Given** Schätzung vorhanden, **When** angezeigt, **Then** Geschätzt vs. Tatsächlich

## Technische Details

### History UI Update
```
┌─────────────────────────────────────────────────┐
│ Today                                           │
├─────────────────────────────────────────────────┤
│ 09:15  API Integration          25m  ●●●○       │
│ 09:45  (Break)                   5m             │
│ 09:50  API Integration          25m  ●●●●       │
│ 10:20  Code Review              25m  ●          │
└─────────────────────────────────────────────────┘
```

### Filter Options
```typescript
type HistoryFilter = 'all' | 'with-task' | 'without-task';
```

### Gruppierung
```typescript
const groupedByTask = sessions.reduce((acc, session) => {
  const key = session.task || 'Untitled';
  if (!acc[key]) acc[key] = [];
  acc[key].push(session);
  return acc;
}, {});
```

## Testing

### Manuell zu testen
- [ ] Task-Name in History
- [ ] "Untitled Session" für leere
- [ ] Filter funktioniert
- [ ] Gruppierung funktioniert

## Definition of Done

- [ ] History zeigt Tasks
- [ ] Filter implementiert
- [ ] Gruppierung optional
- [ ] Geschätzt vs. Tatsächlich
