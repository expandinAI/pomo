---
type: story
status: done
priority: p1
effort: 2
feature: "[[features/quick-task-system]]"
created: 2026-01-19
updated: 2026-01-19
done_date: 2026-01-19
tags: [tasks, deep-work, p1]
---

# POMO-065: Deep/Shallow Work Tag

## User Story

> Als **Cal Newport Follower**
> möchte ich **Tasks als "Deep" oder "Shallow" Work klassifizieren**,
> damit **ich sehe, wie viel echte fokussierte Arbeit ich leiste**.

## Kontext

Link zum Feature: [[features/quick-task-system]]

**Priorität: P1** - Nice-to-have für v1, nicht essentiell.

## Akzeptanzkriterien

- [ ] **Given** Task Input, **When** angezeigt, **Then** Toggle: Deep Work (default) / Shallow Work
- [ ] **Given** Deep/Shallow, **When** gewählt, **Then** unterschiedliche Farbe oder Icon
- [ ] **Given** Stats, **When** angezeigt, **Then** Deep vs Shallow Zeit aufgeschlüsselt
- [ ] **Given** Task-Feld fokussiert, **When** D gedrückt, **Then** toggled Deep/Shallow
- [ ] **Given** History, **When** Session angezeigt, **Then** Tag sichtbar

## Technische Details

### Task Interface erweitern
```typescript
interface Task {
  text: string;
  estimatedPomodoros?: number;
  type: 'deep' | 'shallow';
}
```

### UI
```
[ API Integration      ] [Deep ▼] [~3 🍅]
```

### Stats erweitern
```typescript
interface DailyStats {
  deepWorkMinutes: number;
  shallowWorkMinutes: number;
}
```

## Testing

### Manuell zu testen
- [ ] Toggle funktioniert
- [ ] D-Shortcut funktioniert
- [ ] Stats zeigen Aufteilung
- [ ] History zeigt Tag

## Definition of Done

- [ ] Toggle UI
- [ ] D-Shortcut
- [ ] In Session Storage
- [ ] Stats Integration
