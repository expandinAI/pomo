---
type: story
status: done
priority: p1
effort: 5
feature: "[[features/statistics-dashboard]]"
created: 2026-01-19
updated: 2026-01-20
done_date: 2026-01-20
tags: [analytics, report, p1]
---

# POMO-088: Weekly Report

## User Story

> Als **User**
> möchte ich **einen Wochenbericht sehen**,
> damit **ich meine Produktivität auf einen Blick verstehe**.

## Kontext

Link zum Feature: [[features/statistics-dashboard]]

**Priorität: P1** - Nice-to-have für Analytics.

## Akzeptanzkriterien

- [ ] **Given** Woche endet, **When** Report generiert, **Then** automatisch
- [ ] **Given** Report, **When** Inhalt, **Then** Total Deep Work, Sessions, Focus Score, Streak
- [ ] **Given** Report, **When** Vergleich, **Then** vs. Vorwoche
- [ ] **Given** Report, **When** Top Tasks, **Then** Top 3 der Woche
- [ ] **Given** Report, **When** produktivster Tag, **Then** angezeigt

## Technische Details

### Report Struktur
```typescript
interface WeeklyReport {
  weekStart: Date;
  weekEnd: Date;
  totalDeepWorkMinutes: number;
  totalSessions: number;
  completedSessions: number;
  avgFocusScore: number;
  currentStreak: number;
  topTasks: { name: string; minutes: number }[];
  mostProductiveDay: { day: string; minutes: number };
  comparison: {
    deepWorkChange: number;
    sessionsChange: number;
    scoreChange: number;
  };
}

const generateWeeklyReport = (sessions: Session[]): WeeklyReport => {
  const thisWeek = sessions.filter(s => isThisWeek(new Date(s.completedAt)));
  const lastWeek = sessions.filter(s => isLastWeek(new Date(s.completedAt)));
  // ... calculate metrics
};
```

### UI
```
┌─────────────────────────────────────────────────┐
│  Week of Jan 13-19, 2026                        │
├─────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 18h 32m  │ │    32    │ │    87    │       │
│  │ Deep Work│ │ Sessions │ │ Avg Score│       │
│  │  ↑ 2h    │ │   ↑ 5    │ │   ↑ 12%  │       │
│  └──────────┘ └──────────┘ └──────────┘       │
│                                                 │
│  Top Tasks                                      │
│  1. API Integration         6h 20m              │
│  2. Code Review             3h 45m              │
│  3. Documentation           2h 10m              │
│                                                 │
│  🏆 Most productive: Wednesday (4h 12m)        │
└─────────────────────────────────────────────────┘
```

## Testing

### Manuell zu testen
- [ ] Report generiert korrekt
- [ ] Vergleich mit Vorwoche
- [ ] Top Tasks korrekt
- [ ] Produktivster Tag korrekt

## Definition of Done

- [ ] Report-Generierung
- [ ] UI Komponente
- [ ] Vergleichs-Logik
- [ ] Top Tasks Aggregation
