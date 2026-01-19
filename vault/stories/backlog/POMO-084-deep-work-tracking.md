---
type: story
status: backlog
priority: p0
effort: 5
feature: "[[features/statistics-dashboard]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [analytics, chart, deep-work, p0]
---

# POMO-084: Deep Work Zeit Tracking

## User Story

> Als **User**
> möchte ich **sehen wie viel Deep Work Zeit ich täglich/wöchentlich habe**,
> damit **ich Cal Newport's Empfehlung von 4h/Tag verfolgen kann**.

## Kontext

Link zum Feature: [[features/statistics-dashboard]]

Balkendiagramm mit Ziellinie für tägliche/wöchentliche Deep Work Zeit.

## Akzeptanzkriterien

- [ ] **Given** Stats, **When** Chart angezeigt, **Then** Balken pro Tag
- [ ] **Given** Chart, **When** Vergleich, **Then** vs. Vorwoche möglich
- [ ] **Given** Ziel, **When** angezeigt, **Then** Linie bei 4h (konfigurierbar)
- [ ] **Given** Deep/Shallow Tag, **When** vorhanden, **Then** Unterscheidung im Chart
- [ ] **Given** Durchschnitt, **When** angezeigt, **Then** letzte 7/30 Tage
- [ ] **Given** Trend, **When** berechnet, **Then** Indikator angezeigt

## Technische Details

### Chart Library
```bash
pnpm add recharts
```

### Datenstruktur
```typescript
interface DailyStats {
  date: string;
  deepWorkMinutes: number;
  shallowWorkMinutes: number;
  totalSessions: number;
  completedSessions: number;
}

const getDailyStats = (days: number): DailyStats[] => {
  // Aggregate sessions by day
};
```

### Chart Komponente
```tsx
import { BarChart, Bar, XAxis, YAxis, ReferenceLine, Tooltip } from 'recharts';

const DeepWorkChart = ({ data, goal = 4 * 60 }) => (
  <BarChart data={data}>
    <XAxis dataKey="date" />
    <YAxis />
    <ReferenceLine y={goal} stroke="#4F6EF7" label="Goal" />
    <Bar dataKey="deepWorkMinutes" fill="#4F6EF7" />
    <Bar dataKey="shallowWorkMinutes" fill="#666" />
    <Tooltip />
  </BarChart>
);
```

### UI
```
Deep Work Time
┌─────────────────────────────────────────────┐
│  4h ──────────────────────────────── Goal   │
│     ▁▂▃▅▇▅▃▂▁▂▃▄▅▆▇                        │
│     Mo Di Mi Do Fr Sa So                    │
│                                             │
│  This week: 18h 32m  ↑ 2h from last week   │
└─────────────────────────────────────────────┘
```

## Testing

### Manuell zu testen
- [ ] Chart rendert korrekt
- [ ] Ziellinie sichtbar
- [ ] Hover zeigt Details
- [ ] Vergleich mit Vorwoche

## Definition of Done

- [ ] recharts integriert
- [ ] DailyStats Aggregation
- [ ] Chart Komponente
- [ ] Ziellinie konfigurierbar
