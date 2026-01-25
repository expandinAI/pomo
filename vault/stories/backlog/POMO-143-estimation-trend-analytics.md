---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/statistics-dashboard]]"
created: 2026-01-23
updated: 2026-01-23
done_date: null
tags: [analytics, estimation, time-tracking, llama-life-learning, p1]
---

# POMO-143: Estimation Trend Analytics

## User Story

> Als **Nutzer**
> möchte ich **sehen, wie genau meine Zeitschätzungen über Zeit sind**,
> damit **ich meine Planungsfähigkeit verbessern kann**.

## Kontext

Link zum Feature: [[features/statistics-dashboard]]

**Llama Life Learning:** Llama Life zeigt "Estimated vs Actual" nach jeder Session. Wir erweitern das um einen **Trend über Zeit**, damit Nutzer lernen können, besser zu schätzen.

**Hinweis:** Die Basis-Funktionalität (Estimated vs Actual pro Session) existiert bereits. Diese Story fokussiert auf die **Trend-Analyse**.

## Akzeptanzkriterien

### Trend-Berechnung
- [ ] **Given** Historie von Sessions, **When** Stats angezeigt, **Then** Trend-Prozent berechnet
- [ ] **Given** Trend, **When** User unterschätzt, **Then** "Du unterschätzt Tasks um ~20%"
- [ ] **Given** Trend, **When** User überschätzt, **Then** "Du überschätzt Tasks um ~15%"
- [ ] **Given** Trend, **When** User genau, **Then** "Deine Schätzungen sind sehr akkurat! ±5%"

### Zeitraum-Filter
- [ ] **Given** Trend-Ansicht, **When** Filter, **Then** "Letzte 7 Tage" / "30 Tage" / "Alle Zeit"
- [ ] **Given** Filter gewechselt, **When** neu berechnet, **Then** Trend aktualisiert sich

### Visualisierung
- [ ] **Given** Trend-Daten, **When** angezeigt, **Then** einfaches Chart (Linie oder Bar)
- [ ] **Given** Chart, **When** Datenpunkte, **Then** Estimated vs Actual pro Tag/Woche
- [ ] **Given** Trend positiv/negativ, **When** angezeigt, **Then** Farbkodierung (grün/rot)

### Insights
- [ ] **Given** genug Daten (>10 Sessions), **When** Stats, **Then** personalisierter Insight-Text
- [ ] **Given** wenig Daten, **When** <10 Sessions, **Then** "Mehr Daten nötig für Trend"

## Technische Details

### Berechnung

```typescript
interface SessionEstimate {
  estimated: number;  // in Minuten
  actual: number;     // in Minuten
  date: Date;
}

const calculateEstimationTrend = (sessions: SessionEstimate[]): TrendResult => {
  if (sessions.length < 5) {
    return { hasEnoughData: false, message: "Mehr Sessions nötig für Trend-Analyse" };
  }

  const totalEstimated = sessions.reduce((sum, s) => sum + s.estimated, 0);
  const totalActual = sessions.reduce((sum, s) => sum + s.actual, 0);

  const ratio = totalActual / totalEstimated;
  const percentDiff = Math.round((ratio - 1) * 100);

  if (Math.abs(percentDiff) <= 5) {
    return {
      hasEnoughData: true,
      trend: 'accurate',
      percent: percentDiff,
      message: "Deine Schätzungen sind sehr akkurat! ±5%",
    };
  } else if (percentDiff > 0) {
    return {
      hasEnoughData: true,
      trend: 'underestimate',
      percent: percentDiff,
      message: `Du unterschätzt Tasks um ~${percentDiff}%`,
    };
  } else {
    return {
      hasEnoughData: true,
      trend: 'overestimate',
      percent: Math.abs(percentDiff),
      message: `Du überschätzt Tasks um ~${Math.abs(percentDiff)}%`,
    };
  }
};
```

### UI Mockup

```
┌─────────────────────────────────────────────┐
│  📊 Schätzungs-Trend                        │
│  ───────────────────────────────────────    │
│                                             │
│  Du unterschätzt Tasks um ~18%              │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │     Estimated ─── Actual            │    │
│  │  ▲                                  │    │
│  │  │    ╱╲    ╱╲                      │    │
│  │  │   ╱  ╲  ╱  ╲   ╱                 │    │
│  │  │  ╱    ╲╱    ╲ ╱                  │    │
│  │  └──────────────────────────────►   │    │
│  │    Mo  Di  Mi  Do  Fr  Sa  So       │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  💡 Tipp: Füge 20% Buffer zu deinen         │
│     Schätzungen hinzu.                      │
│                                             │
│  [7 Tage] [30 Tage] [Alle Zeit]             │
└─────────────────────────────────────────────┘
```

### Insight-Texte

```typescript
const getInsightText = (trend: TrendResult): string => {
  switch (trend.trend) {
    case 'underestimate':
      if (trend.percent > 30) {
        return "Tipp: Verdopple deine Schätzungen für realistischere Planung.";
      }
      return `Tipp: Füge ${trend.percent}% Buffer zu deinen Schätzungen hinzu.`;

    case 'overestimate':
      return "Du planst konservativ. Das ist gut für Deadlines!";

    case 'accurate':
      return "Hervorragend! Deine Zeitplanung ist sehr präzise.";
  }
};
```

## Nicht im Scope (v1)

- Trend pro Projekt/Kategorie
- ML-basierte Schätzungsvorschläge
- Vergleich mit anderen Nutzern

## Testing

### Manuell zu testen
- [ ] Trend berechnet korrekt bei verschiedenen Daten
- [ ] Filter (7/30/Alle) funktioniert
- [ ] Chart zeigt korrekte Daten
- [ ] Insight-Text passt zum Trend
- [ ] Edge Case: Wenig Daten zeigt Hinweis

## Definition of Done

- [ ] Trend-Berechnung implementiert
- [ ] UI-Komponente mit Chart
- [ ] Filter-Funktionalität
- [ ] Insight-Texte
- [ ] Integration in Stats-Dashboard
- [ ] Code Review abgeschlossen
