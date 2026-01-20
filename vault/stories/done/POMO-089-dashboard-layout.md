---
type: story
status: done
priority: p0
effort: 5
feature: "[[features/statistics-dashboard]]"
created: 2026-01-19
updated: 2026-01-20
done_date: 2026-01-20
tags: [analytics, dashboard, layout, p0]
---

# POMO-089: Statistics Dashboard Layout

## User Story

> Als **User**
> möchte ich **alle Stats in einem übersichtlichen Dashboard sehen**,
> damit **ich schnell verstehe wie ich performe**.

## Kontext

Link zum Feature: [[features/statistics-dashboard]]

Container-Layout für alle Statistics-Komponenten. Sollte als erstes implementiert werden.

## Akzeptanzkriterien

- [ ] **Given** Stats Page, **When** angezeigt, **Then** responsive Grid Layout
- [ ] **Given** Time Range, **When** Selector, **Then** Day / Week / Month / All Time
- [ ] **Given** Key Metrics, **When** oben, **Then** Focus Score, Deep Work, Streak Cards
- [ ] **Given** Charts, **When** darunter, **Then** Daily Chart, (Heatmap P1)
- [ ] **Given** History, **When** unten, **Then** Session Timeline
- [ ] **Given** Export, **When** Button, **Then** CSV Option (P1)

## Technische Details

### Layout
```
┌─────────────────────────────────────────────────┐
│  Statistics                   [D] [W] [M] [All]│
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Focus    │ │ Deep Work│ │ Streak   │       │  ← Metrics Row
│  │ Score    │ │ Time     │ │          │       │
│  │   87     │ │  4h 32m  │ │ 🔥 7     │       │
│  └──────────┘ └──────────┘ └──────────┘       │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │         Weekly Deep Work Chart          │   │  ← Main Chart
│  │  ▁▂▃▅▇▅▃▂▁▂▃▄▅▆▇                       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────┐ ┌─────────────────────┐  │
│  │   Peak Hours    │ │   Weekly Report     │  │  ← Secondary (P1)
│  │   Heatmap       │ │   Summary           │  │
│  └─────────────────┘ └─────────────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │         Session History                 │   │  ← History
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Time Range State
```typescript
type TimeRange = 'day' | 'week' | 'month' | 'all';

const [timeRange, setTimeRange] = useState<TimeRange>('week');

const filteredSessions = useMemo(() => {
  switch (timeRange) {
    case 'day': return sessions.filter(s => isToday(new Date(s.completedAt)));
    case 'week': return sessions.filter(s => isThisWeek(new Date(s.completedAt)));
    case 'month': return sessions.filter(s => isThisMonth(new Date(s.completedAt)));
    case 'all': return sessions;
  }
}, [sessions, timeRange]);
```

### Grid Layout (Tailwind)
```tsx
<div className="space-y-6">
  {/* Header with Time Range */}
  <div className="flex justify-between items-center">
    <h1>Statistics</h1>
    <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
  </div>

  {/* Metrics Cards */}
  <div className="grid grid-cols-3 gap-4">
    <FocusScoreCard />
    <DeepWorkCard />
    <StreakCard />
  </div>

  {/* Main Chart */}
  <DeepWorkChart data={dailyStats} />

  {/* Secondary Row (P1) */}
  <div className="grid grid-cols-2 gap-4">
    <PeakHoursHeatmap />
    <WeeklyReportSummary />
  </div>

  {/* History */}
  <SessionTimeline sessions={filteredSessions} />
</div>
```

## Testing

### Manuell zu testen
- [ ] Layout responsive
- [ ] Time Range Filter funktioniert
- [ ] Alle Komponenten rendern
- [ ] Mobile Layout angepasst

## Definition of Done

- [ ] Grid Layout
- [ ] Time Range Selector
- [ ] Responsive Design
- [ ] Alle Komponenten integriert
