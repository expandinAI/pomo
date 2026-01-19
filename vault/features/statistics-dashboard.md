---
type: feature
status: ready
priority: p0
effort: l
business_value: high
origin: "[[ideas/ui-transformation]]"
stories:
  - "[[stories/backlog/POMO-083-focus-score]]"
  - "[[stories/backlog/POMO-084-deep-work-tracking]]"
  - "[[stories/backlog/POMO-085-peak-hours-heatmap]]"
  - "[[stories/backlog/POMO-086-streak-tracking]]"
  - "[[stories/backlog/POMO-087-session-timeline]]"
  - "[[stories/backlog/POMO-088-weekly-report]]"
  - "[[stories/backlog/POMO-089-dashboard-layout]]"
created: 2026-01-19
updated: 2026-01-19
tags: [ui-transformation, analytics, insights, p0, mvp]
---

# Statistics Dashboard

## Zusammenfassung

> Umfassende Überarbeitung des Statistics-Bereichs mit Focus Score, verbesserter Visualisierung, Peak Hours Heatmap und aussagekräftigen Insights. Ziel: Nutzer verstehen ihre Produktivitätsmuster und werden motiviert.

## Kontext & Problem

### Ausgangssituation
Aktuelle Stats sind basic; Nutzer verstehen nicht, ob sie sich verbessern.

### Betroffene Nutzer
Datengetriebene Nutzer die ihre Produktivität optimieren wollen.

### Auswirkung
Ohne aussagekräftige Stats fehlt Motivation und Verständnis der eigenen Muster.

## Ziele

### Muss erreicht werden (P0)
- [ ] Focus Score (0-100)
- [ ] Deep Work Zeit Tracking mit Chart
- [ ] Streak Tracking
- [ ] Session History Timeline
- [ ] Dashboard Layout

### Sollte erreicht werden (P1)
- [ ] Peak Hours Heatmap
- [ ] Weekly Report

### Nicht im Scope
- Export (CSV, PDF)
- Email Reports
- Achievements / Badges

## Lösung

### Focus Score

Score von 0-100 basierend auf:
- Completion Rate (40%)
- Interruption Penalty (30%)
- Streak Bonus (20%)
- Consistency Bonus (10%)

```typescript
const calculateFocusScore = (sessions, planned) => {
  return Math.round(
    completionRate * 40 +
    (1 - interruptionPenalty) * 30 +
    streakBonus * 20 +
    consistencyBonus * 10
  );
};
```

### Dashboard Layout

```
┌─────────────────────────────────────────────────┐
│  Statistics                   [D] [W] [M] [All]│
├─────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Focus    │ │ Deep Work│ │ Streak   │       │
│  │ Score    │ │ Time     │ │          │       │
│  │   87     │ │  4h 32m  │ │ 🔥 7     │       │
│  └──────────┘ └──────────┘ └──────────┘       │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │         Weekly Deep Work Chart          │   │
│  │  ▁▂▃▅▇▅▃▂▁▂▃▄▅▆▇                       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │         Session History                 │   │
│  │  Today · 4 sessions · 1h 40m           │   │
│  │  09:15  API Integration      25m ✓     │   │
│  │  09:50  API Integration      25m ✓     │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Technische Überlegungen

**Chart Library:** recharts oder chart.js

**Datenstruktur:**
```typescript
interface DailyStats {
  date: string;
  deepWorkMinutes: number;
  shallowWorkMinutes: number;
  totalSessions: number;
  completedSessions: number;
}
```

## Akzeptanzkriterien

**P0:**
- [ ] Focus Score prominent angezeigt mit Trend
- [ ] Deep Work Chart zeigt 7 Tage
- [ ] Streak Counter mit Longest Streak
- [ ] Session Timeline mit Filter
- [ ] Time Range Selector (Day/Week/Month)

**P1:**
- [ ] Peak Hours Heatmap mit Empfehlung
- [ ] Weekly Report automatisch generiert

## Metriken & Erfolgsmessung

- **Primäre Metrik:** 70% der Nutzer checken Stats wöchentlich
- **Sekundäre Metrik:** Engagement mit Charts > 50%
- **Messzeitraum:** 4 Wochen nach Launch

## Stories

**P0:**
1. [[stories/backlog/POMO-089-dashboard-layout]] - Dashboard Layout (5 SP)
2. [[stories/backlog/POMO-087-session-timeline]] - Session History (3 SP)
3. [[stories/backlog/POMO-084-deep-work-tracking]] - Deep Work Chart (5 SP)
4. [[stories/backlog/POMO-086-streak-tracking]] - Streak Tracking (3 SP)
5. [[stories/backlog/POMO-083-focus-score]] - Focus Score (5 SP)

**P1:**
6. [[stories/backlog/POMO-085-peak-hours-heatmap]] - Heatmap (5 SP)
7. [[stories/backlog/POMO-088-weekly-report]] - Weekly Report (5 SP)

**P0 Gesamt: 21 Story Points**
**P1 Gesamt: 10 Story Points**

## Changelog

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2026-01-19 | Migriert aus backlog/epics | Claude |
