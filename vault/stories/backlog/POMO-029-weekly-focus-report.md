---
type: story
status: backlog
priority: p1
effort: 5
feature: analytics
created: 2026-01-18
updated: 2026-01-18
done_date: null
tags: [analytics, insights, premium]
---

# POMO-029: Weekly Focus Report

## User Story

> Als **Pomo-Nutzer**
> möchte ich **eine wöchentliche Zusammenfassung meiner Focus-Zeit sehen**,
> damit **ich verstehe, wie produktiv ich war und Muster erkenne**.

## Kontext

Die Session History speichert bereits alle Daten. Der Weekly Report aggregiert diese in eine motivierende, nicht-überwältigende Zusammenfassung. Wichtig: Positive Verstärkung, keine Schuld-Mechanik.

## Akzeptanzkriterien

- [ ] **Given** Sessions existieren, **When** User öffnet Weekly Report, **Then** sieht er Total Focus Hours der Woche
- [ ] **Given** letzte Woche hatte auch Sessions, **When** Report angezeigt, **Then** Vergleich zur Vorwoche (+/- Stunden)
- [ ] **Given** Sessions der Woche, **When** Report angezeigt, **Then** Bar Chart mit Mo-So zeigt Focus pro Tag
- [ ] **Given** verschiedene Tage mit Focus, **When** Report angezeigt, **Then** "Best Day" wird highlighted
- [ ] **Given** keine Sessions diese Woche, **When** Report öffnen, **Then** freundliche Empty State Message
- [ ] **Given** reduced motion preference, **When** Chart animiert, **Then** Animation deaktiviert

## Technische Details

### Betroffene Dateien
```
src/
├── components/insights/
│   ├── WeeklyReport.tsx      # NEW - Hauptkomponente
│   └── WeeklyBarChart.tsx    # NEW - Bar Chart für Wochentage
├── lib/
│   └── session-analytics.ts  # NEW - Analytics Helper Functions
└── app/page.tsx              # Integration
```

### Implementierungshinweise
- Nutze existierende `loadSessions()` und `getSessionsFromDays(7)`
- Gruppiere nach Wochentag (Intl.DateTimeFormat für Locale-Support)
- Chart mit CSS/Framer Motion, kein externes Library
- Week starts on Monday (ISO standard)

### Neue Typen
```typescript
interface WeeklyStats {
  totalSeconds: number;
  sessionsCount: number;
  dailyStats: DailyStats[];
  bestDay: DailyStats | null;
  previousWeekTotal: number;
  trend: 'up' | 'down' | 'same';
}

interface DailyStats {
  date: string;        // YYYY-MM-DD
  dayName: string;     // "Mon", "Tue"...
  totalSeconds: number;
  sessionsCount: number;
}
```

### Daten-Berechnung
```typescript
function getWeeklyStats(weekOffset: number = 0): WeeklyStats {
  // weekOffset: 0 = this week, -1 = last week
  const sessions = loadSessions();
  // Filter to target week, group by day, calculate totals
}
```

## UI/UX

```
┌─────────────────────────────────────┐
│ Your Week in Focus                  │
├─────────────────────────────────────┤
│                                     │
│       12.5 hours                    │
│       of deep work                  │
│                                     │
│  Mo  Tu  We  Th  Fr  Sa  Su        │
│  ▄▄  ██  ▄▄  ██  ▄▄  ░░  ░░        │
│  1.5 3.0 2.0 3.5 2.5  0   0        │
│                                     │
│  ⭐ Best day: Thursday (3.5h)       │
│  📈 +2.5h from last week           │
│                                     │
└─────────────────────────────────────┘
```

**Verhalten:**
- Öffnet als Modal oder eigene View (TBD mit POMO-036)
- Bars animieren von 0 hoch (300ms, staggered)
- Hover auf Bar zeigt Details (sessions count)
- Positive Sprache: "Great progress!" nicht "You missed..."

## Testing

### Manuell zu testen
- [ ] Report mit 0 Sessions
- [ ] Report mit Sessions nur an 1 Tag
- [ ] Report mit Sessions jeden Tag
- [ ] Vergleich wenn letzte Woche leer war
- [ ] Dark/Light Mode
- [ ] Mobile Viewport

### Automatisierte Tests
- [ ] Unit Test: `getWeeklyStats()` mit Mock-Daten
- [ ] Unit Test: Week boundary calculation (Monday start)
- [ ] Unit Test: Trend calculation (+/- comparison)

## Definition of Done

- [ ] Code implementiert
- [ ] Tests geschrieben & grün
- [ ] Code reviewed (selbst oder AI)
- [ ] Lokal getestet (alle Szenarien)
- [ ] Dark/Light Mode funktioniert
- [ ] Accessibility: Screen reader beschreibt Chart
- [ ] Reduced motion respektiert
- [ ] Performance: Keine sichtbare Verzögerung

## Notizen

- Später: Option für Sunday-Start (US preference)
- Später: Report automatisch Sonntag Abend anzeigen
- Keine Notifications/Reminders über verpasste Tage

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
