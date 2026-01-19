---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/statistics-dashboard]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [analytics, streak, motivation, p0]
---

# POMO-086: Streak Tracking

## User Story

> Als **User**
> möchte ich **meinen aktuellen Streak (Tage in Folge) sehen**,
> damit **ich motiviert bin, die Kette nicht zu unterbrechen**.

## Kontext

Link zum Feature: [[features/statistics-dashboard]]

Motivierender Streak-Counter ohne Guilt-Mechanik.

## Akzeptanzkriterien

- [ ] **Given** Stats, **When** angezeigt, **Then** aktueller Streak prominent
- [ ] **Given** Streak, **When** mit Longest verglichen, **Then** Longest als Referenz
- [ ] **Given** Tag, **When** 1+ Session abgeschlossen, **Then** Streak zählt
- [ ] **Given** Visual, **When** angezeigt, **Then** Flammen-Icon oder Kalender-Dots
- [ ] **Given** Reset, **When** Mitternacht, **Then** Timezone-aware

## Technische Details

### Berechnung
```typescript
const calculateStreak = (sessions: Session[]): number => {
  const today = startOfDay(new Date());
  let streak = 0;
  let currentDate = today;

  // Check if today has sessions (streak might be ongoing)
  const todayHasSessions = sessions.some(s =>
    isSameDay(new Date(s.completedAt), today) && s.completed
  );

  if (!todayHasSessions) {
    // Check yesterday - if no sessions, streak is 0
    currentDate = subDays(today, 1);
    const yesterdayHasSessions = sessions.some(s =>
      isSameDay(new Date(s.completedAt), currentDate) && s.completed
    );
    if (!yesterdayHasSessions) return 0;
  }

  while (true) {
    const hasSessions = sessions.some(s =>
      isSameDay(new Date(s.completedAt), currentDate) && s.completed
    );

    if (hasSessions) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
  }

  return streak;
};

const getLongestStreak = (sessions: Session[]): number => {
  // Calculate longest historical streak
};
```

### UI
```
┌───────────────┐
│  🔥 7 days    │
│    streak     │
│  Best: 23     │
└───────────────┘
```

### Streak Warning (optional, abends)
```
Don't break your 7-day streak!
Complete at least one session today.
```

## Testing

### Manuell zu testen
- [ ] Streak berechnet korrekt
- [ ] Longest Streak korrekt
- [ ] Reset um Mitternacht
- [ ] Flammen-Icon angezeigt

## Definition of Done

- [ ] Streak-Berechnung
- [ ] Longest Streak
- [ ] UI Komponente
- [ ] Timezone-aware
