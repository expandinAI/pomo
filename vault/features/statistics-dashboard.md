---
type: feature
status: done
priority: p0
effort: l
business_value: high
origin: "[[ideas/ui-transformation]]"
stories:
  - "[[stories/done/POMO-083-focus-score]]"
  - "[[stories/done/POMO-084-deep-work-tracking]]"
  - "[[stories/done/POMO-085-peak-hours-heatmap]]"
  - "[[stories/done/POMO-086-streak-tracking]]"
  - "[[stories/done/POMO-087-session-timeline]]"
  - "[[stories/done/POMO-088-weekly-report]]"
  - "[[stories/done/POMO-089-dashboard-layout]]"
created: 2026-01-19
updated: 2026-01-21
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
- [x] Focus Score (0-100)
- [x] Deep Work Zeit Tracking mit Chart
- [x] Streak Tracking
- [x] Session History Timeline
- [x] Dashboard Layout

### Sollte erreicht werden (P1)
- [x] Peak Hours Heatmap
- [x] Weekly Report

### Nicht im Scope
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

**Chart Library:** Custom SVG (kein externes Library nötig)

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

## Implementierte Komponenten

| Komponente | Datei | Beschreibung |
|------------|-------|--------------|
| StatisticsDashboard | `src/components/insights/StatisticsDashboard.tsx` | Hauptmodal mit G S Shortcut |
| MetricCard | `src/components/insights/MetricCard.tsx` | Focus Score, Deep Work, Streak Cards |
| WeeklyBarChart | `src/components/insights/WeeklyBarChart.tsx` | 7-Tage Chart mit Goal Line |
| SessionTimeline | `src/components/insights/SessionTimeline.tsx` | Chronologische Session-Liste |
| TimeRangeSelector | `src/components/insights/TimeRangeSelector.tsx` | Day/Week/Month/All Filter |
| FocusHeatmap | `src/components/insights/FocusHeatmap.tsx` | Peak Hours Heatmap Modal |
| HeatmapGrid | `src/components/insights/HeatmapGrid.tsx` | 24h x 30d Heatmap Grid |
| WeeklyReportSummary | `src/components/insights/WeeklyReportSummary.tsx` | Top Tasks, Best Day |
| TotalHoursCounter | `src/components/insights/TotalHoursCounter.tsx` | Lifetime Stats |
| ExportButton | `src/components/insights/ExportButton.tsx` | CSV Export |

## Akzeptanzkriterien

**P0:**
- [x] Focus Score prominent angezeigt mit Trend
- [x] Deep Work Chart zeigt 7 Tage
- [x] Streak Counter mit Longest Streak
- [x] Session Timeline mit Filter
- [x] Time Range Selector (Day/Week/Month)

**P1:**
- [x] Peak Hours Heatmap mit Empfehlung
- [x] Weekly Report automatisch generiert

## Metriken & Erfolgsmessung

- **Primäre Metrik:** 70% der Nutzer checken Stats wöchentlich
- **Sekundäre Metrik:** Engagement mit Charts > 50%
- **Messzeitraum:** 4 Wochen nach Launch

## Stories

**P0:**
1. [[stories/done/POMO-089-dashboard-layout]] - Dashboard Layout (5 SP) ✅
2. [[stories/done/POMO-087-session-timeline]] - Session History (3 SP) ✅
3. [[stories/done/POMO-084-deep-work-tracking]] - Deep Work Chart (5 SP) ✅
4. [[stories/done/POMO-086-streak-tracking]] - Streak Tracking (3 SP) ✅
5. [[stories/done/POMO-083-focus-score]] - Focus Score (5 SP) ✅

**P1:**
6. [[stories/done/POMO-085-peak-hours-heatmap]] - Heatmap (5 SP) ✅
7. [[stories/done/POMO-088-weekly-report]] - Weekly Report (5 SP) ✅

**P0 Gesamt: 21 Story Points - ✅ Done**
**P1 Gesamt: 10 Story Points - ✅ Done**
**Total: 31 Story Points (7 Stories) - ✅ All Done**

## Changelog

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2026-01-19 | Migriert aus backlog/epics | Claude |
| 2026-01-21 | Feature abgeschlossen - alle 7 Stories implementiert | Claude |
