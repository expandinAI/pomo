---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/statistics-dashboard]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [analytics, history, timeline, p0]
---

# POMO-087: Session History Timeline

## User Story

> Als **User**
> möchte ich **meine Sessions als Timeline sehen**,
> damit **ich meinen Arbeitstag nachvollziehen kann**.

## Kontext

Link zum Feature: [[features/statistics-dashboard]]

Chronologische Session-Liste mit Filterung und Gruppierung.

## Akzeptanzkriterien

- [ ] **Given** History, **When** angezeigt, **Then** chronologische Liste
- [ ] **Given** Sessions, **When** gruppiert, **Then** nach Tag
- [ ] **Given** Session, **When** angezeigt, **Then** Startzeit, Dauer, Task, Preset, Status
- [ ] **Given** Filter, **When** "Nur Work", **Then** keine Breaks
- [ ] **Given** Filter, **When** "Nur abgeschlossen", **Then** keine Abbrüche
- [ ] **Given** Suche, **When** Task-Name, **Then** gefiltert
- [ ] **Given** viele Sessions, **When** Scroll, **Then** Infinite Scroll oder Pagination

## Technische Details

### UI
```
Session History
┌─────────────────────────────────────────────┐
│  [All ▼] [Completed ○] [🔍 Search...]      │
├─────────────────────────────────────────────┤
│  Today · 4 sessions · 1h 40m                │
├─────────────────────────────────────────────┤
│  09:15  API Integration          25m ✓     │
│  09:45  Break                     5m ✓     │
│  09:50  API Integration          25m ✓     │
│  10:20  Code Review              25m ✗     │
├─────────────────────────────────────────────┤
│  Yesterday · 8 sessions · 3h 20m           │
├─────────────────────────────────────────────┤
│  ...                                        │
└─────────────────────────────────────────────┘
```

### Filter State
```typescript
interface HistoryFilters {
  type: 'all' | 'work' | 'break';
  completed: 'all' | 'completed' | 'aborted';
  search: string;
}
```

### Gruppierung
```typescript
const groupSessionsByDay = (sessions: Session[]) => {
  return sessions.reduce((acc, session) => {
    const dateKey = format(new Date(session.startedAt), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        sessions: [],
        totalMinutes: 0,
      };
    }
    acc[dateKey].sessions.push(session);
    acc[dateKey].totalMinutes += session.duration / 60;
    return acc;
  }, {});
};
```

## Testing

### Manuell zu testen
- [ ] Sessions nach Tag gruppiert
- [ ] Filter funktionieren
- [ ] Suche funktioniert
- [ ] Scroll funktioniert

## Definition of Done

- [ ] Timeline Komponente
- [ ] Gruppierung nach Tag
- [ ] Filter implementiert
- [ ] Suche implementiert
