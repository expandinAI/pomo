---
type: story
status: backlog
priority: p0
effort: 5
feature: "[[features/statistics-dashboard]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [analytics, score, p0]
---

# POMO-083: Focus Score

## User Story

> Als **User**
> möchte ich **einen Focus Score sehen der mir zeigt wie gut ich heute fokussiert habe**,
> damit **ich meine Fokus-Fähigkeit gamifiziert verbessern kann**.

## Kontext

Link zum Feature: [[features/statistics-dashboard]]

Zentraler Metrik-Wert basierend auf mehreren Faktoren.

## Akzeptanzkriterien

- [ ] **Given** Stats-View, **When** angezeigt, **Then** Score 0-100 prominent
- [ ] **Given** Score, **When** Hover/Tap, **Then** Berechnung transparent (Tooltip)
- [ ] **Given** Score, **When** vs. letzte Woche, **Then** Trend-Indikator (↑/↓/→)
- [ ] **Given** Score-Wert, **When** 0-40, **Then** rot; 41-70 gelb; 71-100 grün
- [ ] **Given** Session abgeschlossen, **When** Score, **Then** aktualisiert sich
- [ ] **Given** Time Range, **When** Day/Week/Month, **Then** Score entsprechend

## Technische Details

### Berechnung
```typescript
const calculateFocusScore = (sessions: Session[], planned: number): number => {
  if (sessions.length === 0) return 0;

  // Completion Rate (40%)
  const completed = sessions.filter(s => s.completed).length;
  const completionRate = Math.min(completed / Math.max(planned, 1), 1);

  // Interruption Penalty (30%)
  const totalInterruptions = sessions.reduce((sum, s) => sum + (s.interruptions || 0), 0);
  const avgInterruptions = totalInterruptions / sessions.length;
  const interruptionScore = Math.max(0, 1 - avgInterruptions * 0.2);

  // Streak Bonus (20%)
  const streakBonus = Math.min(getStreak() / 7, 1);

  // Consistency Bonus (10%)
  const consistencyScore = calculateConsistency(sessions);

  return Math.round(
    completionRate * 40 +
    interruptionScore * 30 +
    streakBonus * 20 +
    consistencyScore * 10
  );
};
```

### UI
```
┌─────────────────────┐
│        87           │  ← Große Zahl, Farbkodiert
│    Focus Score      │
│       ↑ 12%         │  ← Trend
│    ●●●●○            │  ← Optional: 5-Star Rating
└─────────────────────┘
```

### Tooltip
```
Focus Score Breakdown:
• Completion Rate: 85% → 34/40 pts
• Low Interruptions: 95% → 28.5/30 pts
• 7-day Streak: 100% → 20/20 pts
• Consistency: 45% → 4.5/10 pts
─────────────────────────
Total: 87/100
```

## Testing

### Manuell zu testen
- [ ] Score berechnet korrekt
- [ ] Farbkodierung funktioniert
- [ ] Trend-Indikator korrekt
- [ ] Tooltip zeigt Breakdown

## Definition of Done

- [ ] Berechnungslogik
- [ ] UI Komponente
- [ ] Farbkodierung
- [ ] Tooltip mit Breakdown
