---
type: story
status: done
priority: p1
effort: 5
feature: "[[features/statistics-dashboard]]"
created: 2026-01-19
updated: 2026-01-20
done_date: 2026-01-20
tags: [analytics, heatmap, p1]
---

# POMO-085: Peak Hours Heatmap

## User Story

> Als **User**
> möchte ich **sehen zu welchen Tageszeiten ich am produktivsten bin**,
> damit **ich meine wichtigste Arbeit in diese Zeiten legen kann**.

## Kontext

Link zum Feature: [[features/statistics-dashboard]]

**Priorität: P1** - Komplexe Visualisierung für v2.

## Akzeptanzkriterien

- [ ] **Given** Stats, **When** Heatmap angezeigt, **Then** 24h (Y) x 7 Tage (X)
- [ ] **Given** Slot, **When** mehr Fokuszeit, **Then** dunklere Farbe
- [ ] **Given** Slot, **When** Hover, **Then** Details "Tuesday 9-10am: 2.5h total"
- [ ] **Given** wenig Daten, **When** < 7 Tage, **Then** Placeholder angezeigt
- [ ] **Given** Empfehlung, **When** genug Daten, **Then** "Your peak hours are 9-11am"

## Technische Details

### Datenstruktur
```typescript
type HeatmapData = {
  [day: number]: { // 0-6 (Sunday-Saturday)
    [hour: number]: number; // Minuten in diesem Slot
  };
};

const buildHeatmapData = (sessions: Session[]): HeatmapData => {
  const data: HeatmapData = {};

  sessions.forEach(session => {
    const date = new Date(session.startedAt);
    const day = date.getDay();
    const hour = date.getHours();

    if (!data[day]) data[day] = {};
    if (!data[day][hour]) data[day][hour] = 0;
    data[day][hour] += session.duration / 60;
  });

  return data;
};
```

### UI
```
Peak Hours
┌─────────────────────────────────────────────┐
│     Mo Tu We Th Fr Sa Su                    │
│  6  ░░ ██ ██ ██ ░░ ░░ ░░                   │
│  9  ██ ██ ██ ██ ██ ░░ ░░                   │
│ 12  ░░ ░░ ░░ ░░ ░░ ░░ ░░                   │
│ 15  ██ ██ ██ ██ ░░ ░░ ░░                   │
│ 18  ░░ ██ ░░ ██ ░░ ░░ ░░                   │
│ 21  ░░ ░░ ░░ ░░ ░░ ░░ ░░                   │
│                                             │
│  💡 Your peak hours: Tue-Thu, 9-11am       │
└─────────────────────────────────────────────┘
```

### Peak Detection
```typescript
const detectPeakHours = (data: HeatmapData): string => {
  // Find top 3 hour slots
  // Return human-readable string
};
```

## Testing

### Manuell zu testen
- [ ] Heatmap rendert
- [ ] Farben korrekt skaliert
- [ ] Hover zeigt Details
- [ ] Empfehlung sinnvoll

## Definition of Done

- [ ] Heatmap Komponente
- [ ] Daten-Aggregation
- [ ] Peak Detection
- [ ] Placeholder bei wenig Daten
