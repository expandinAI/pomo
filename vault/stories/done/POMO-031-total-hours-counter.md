---
type: story
status: done
priority: p1
effort: 2
feature: analytics
created: 2026-01-18
updated: 2026-01-23
done_date: 2026-01-23
tags: [analytics, insights, premium]
---

# POMO-031: Total Hours Counter

## User Story

> Als **Pomo-Nutzer**
> möchte ich **meine gesamte Focus-Zeit auf einen Blick sehen**,
> damit **ich ein Gefühl für meine langfristige Produktivität bekomme**.

## Kontext

Ein prominenter "Lifetime Counter" zeigt die Gesamtzeit aller Focus-Sessions. Anders als der Weekly Report ist dies ein motivierendes "Achievement" - die Summe aller Bemühungen. Wichtig: Keine Guilt-Mechanik, rein positive Darstellung.

## Akzeptanzkriterien

- [ ] **Given** Sessions existieren, **When** Counter angezeigt, **Then** Total Hours aller Work-Sessions sichtbar
- [ ] **Given** Counter angezeigt, **When** neue Session abgeschlossen, **Then** Counter aktualisiert sich
- [ ] **Given** 0 Sessions, **When** Counter angezeigt, **Then** "0h 0m" mit ermutigender Message
- [ ] **Given** Counter sichtbar, **When** User interagiert, **Then** zeigt zusätzliche Stats (Sessions count, Streak-freie Info)
- [ ] **Given** reduced motion preference, **When** Counter animiert, **Then** Animation deaktiviert

## Technische Details

### Betroffene Dateien
```
src/
├── components/insights/
│   └── TotalHoursCounter.tsx  # NEW - Counter Component
├── lib/
│   └── session-analytics.ts   # Erweitern mit Lifetime-Funktionen
└── app/page.tsx               # Integration (evtl. in Header oder Footer)
```

### Implementierungshinweise
- Nutze existierende `loadSessions()` - keine Filterung nach Datum
- Nur Work-Sessions zählen (keine Breaks)
- Animation: Counting up effect mit Framer Motion (optional)
- Platzierung: Im Settings-Modal oder als Teil der Session History

### Neue Typen
```typescript
interface LifetimeStats {
  totalSeconds: number;
  totalSessions: number;
  firstSessionDate: string | null;
  averageSessionLength: number;
}
```

### Implementierung
```typescript
function getLifetimeStats(): LifetimeStats {
  const sessions = loadSessions();
  const workSessions = sessions.filter(s => s.type === 'work');

  return {
    totalSeconds: workSessions.reduce((sum, s) => sum + s.duration, 0),
    totalSessions: workSessions.length,
    firstSessionDate: workSessions.length > 0
      ? workSessions[workSessions.length - 1].completedAt
      : null,
    averageSessionLength: workSessions.length > 0
      ? totalSeconds / workSessions.length
      : 0
  };
}
```

## UI/UX

### Minimal View (Standard)
```
┌─────────────────────────┐
│     47h 23m             │
│   total focus time      │
└─────────────────────────┘
```

### Expanded View (on tap/click)
```
┌─────────────────────────────────────┐
│         47h 23m                     │
│      total focus time               │
│                                     │
│  📊 142 sessions completed          │
│  📅 Since Jan 5, 2026               │
│  ⏱️ ~20 min average session         │
│                                     │
│     Keep going! Every minute        │
│         counts. 🌱                  │
└─────────────────────────────────────┘
```

**Verhalten:**
- Default: Kompakte Ansicht (nur Total)
- Click/Tap: Expanded mit Details
- Keine Streak-Counter (Anti-Pattern für unser Konzept)
- Positive Micro-Copy: "Every session matters"

## Testing

### Manuell zu testen
- [ ] Counter mit 0 Sessions
- [ ] Counter mit wenigen Sessions (<1h total)
- [ ] Counter mit vielen Sessions (>100h total)
- [ ] Counter aktualisiert nach neuer Session
- [ ] Expand/Collapse funktioniert
- [ ] Dark/Light Mode

### Automatisierte Tests
- [ ] Unit Test: `getLifetimeStats()` mit verschiedenen Daten
- [ ] Unit Test: Formatierung großer Zahlen (1000+ Stunden)
- [ ] Unit Test: Average calculation mit 0 Sessions

## Definition of Done

- [ ] Code implementiert
- [ ] Tests geschrieben & grün
- [ ] Lokal getestet
- [ ] Dark/Light Mode funktioniert
- [ ] Animation smooth (60fps)
- [ ] Accessibility: Zahlen screen-reader-freundlich

## Notizen

- Überlegung: Counter auch auf Main Screen zeigen (dezent)?
- MAX_SESSIONS limit beachten - ggf. separater Counter in localStorage für Lifetime
- Formatierung: "47h 23m" nicht "47.38h"

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
