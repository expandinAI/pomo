---
type: story
status: backlog
priority: p1
effort: 2
feature: "[[features/extended-presets]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [presets, analytics, p1]
---

# POMO-071: Preset Statistiken

## User Story

> Als **User**
> möchte ich **sehen, welche Presets ich am meisten nutze**,
> damit **ich verstehe, welcher Rhythmus für mich funktioniert**.

## Kontext

Link zum Feature: [[features/extended-presets]]

**Priorität: P1** - Nice-to-have für Analytics.

## Akzeptanzkriterien

- [ ] **Given** Stats, **When** angezeigt, **Then** Verteilung Pomodoro vs Deep Work vs Ultradian
- [ ] **Given** Preset, **When** Stats, **Then** Completion Rate pro Preset
- [ ] **Given** Preset, **When** Stats, **Then** durchschnittliche Fokuszeit pro Preset
- [ ] **Given** Weekly Report, **When** generiert, **Then** Preset-Stats enthalten

## Technische Details

### Analytics erweitern
```typescript
interface SessionAnalytics {
  byPreset: {
    [presetId: string]: {
      totalSessions: number;
      completedSessions: number;
      totalMinutes: number;
    };
  };
}
```

### Stats UI
```
┌─────────────────────────────────────────────────┐
│ Preset Usage                                    │
├─────────────────────────────────────────────────┤
│ Pomodoro (25m)     ████████████░░  65%         │
│ Deep Work (52m)    ████░░░░░░░░░░  25%         │
│ 90-Min Block       ██░░░░░░░░░░░░  10%         │
│                                                 │
│ Best Completion: Deep Work (92%)                │
└─────────────────────────────────────────────────┘
```

## Testing

### Manuell zu testen
- [ ] Verteilung wird berechnet
- [ ] Completion Rate korrekt
- [ ] In Weekly Report

## Definition of Done

- [ ] Analytics erweitert
- [ ] Stats UI
- [ ] In Weekly Report
