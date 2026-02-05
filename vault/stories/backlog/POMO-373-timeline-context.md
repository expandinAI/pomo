---
type: story
status: backlog
priority: p2
effort: 2
feature: particle-legacy
created: 2026-02-05
updated: 2026-02-05
done_date: null
tags: [legacy, timeline, context, enhancement]
---

# POMO-373: Timeline Kontext — Vergleich mit Durchschnitt

## User Story

> As a **Particle user browsing my timeline**,
> I want **to see how today compares to my average**,
> so that **I have neutral context without judgment**.

## Context

Die Timeline (`G T`) zeigt aktuell pro Tag:
- Partikel-Count
- Fokuszeit (gesamt)
- Aktive Stunden (erste Session → letzte Session)

Was fehlt: **Kontext.** "6 Partikel" — ist das viel? Wenig? Normal? Ohne Vergleich sind die Zahlen bedeutungslos.

### Bestehende Daten

- `averagePerActiveDay` existiert in `YearViewSummary` (nur Jahr-Ebene)
- `getLifetimeStats()` liefert `totalSessions` und `totalSeconds`
- Sessions pro Tag sind ueber `getSessionsForDate()` verfuegbar
- Tages-Durchschnitt laesst sich aus `totalSessions / activeDays` berechnen

### Was es NICHT ist

- Kein Gruen/Rot ("gut"/"schlecht")
- Kein Ranking oder Bewertung
- Kein Streak-Hinweis
- Nur neutraler Kontext: "Your average: ~5/day"

## Acceptance Criteria

### Kontext-Zeile in TimelineStats

- [ ] Neue Zeile in `TimelineStats`: `"avg ~{n}/day"` (z.B. "avg ~5/day")
- [ ] Nur anzeigen wenn genuegend Daten (mindestens 7 aktive Tage)
- [ ] Positionierung: Als viertes Stat-Element neben den bestehenden drei

### Berechnung

- [ ] Durchschnitt = `totalWorkSessions / activeDays` (nur Tage mit >= 1 Session)
- [ ] Auf eine Dezimalstelle runden (z.B. "~4.2/day")
- [ ] Ganze Zahlen ohne Dezimalstelle (z.B. "~5/day" statt "~5.0/day")

### Styling

- [ ] Identisch zu bestehenden TimelineStats-Elementen
- [ ] Grosse Zahl: `text-2xl font-light text-primary tabular-nums`
- [ ] Label: `text-xs text-tertiary`
- [ ] Divider zwischen den bestehenden Stats und dem neuen Element

### Beispiel

```
  6            1h 30m         09:15 - 17:15       ~4.2
particles    focus time      active hours        avg/day
```

## Technical Details

### Betroffene Dateien

```
src/components/timeline/TimelineStats.tsx    # Neues Stat-Element
src/hooks/useTimelineData.ts                 # Durchschnitt berechnen
```

### Option A: Berechnung im Hook (bevorzugt)

```typescript
// In useTimelineData.ts — neues Feld:
interface UseTimelineDataReturn {
  // ... bestehende Felder ...
  averageParticlesPerDay: number | null; // null wenn < 7 aktive Tage
}

// Berechnung mit bestehenden Daten:
const allSessions = sessions; // Aus SessionStore
const workSessions = allSessions.filter(s => s.type === 'work');

// Tage mit mindestens 1 Work-Session zaehlen
const activeDays = new Set(
  workSessions.map(s => s.completedAt.split('T')[0])
).size;

const averageParticlesPerDay = activeDays >= 7
  ? workSessions.length / activeDays
  : null;
```

### Option B: Berechnung in der Komponente

```typescript
// In TimelineStats.tsx — neues Prop:
interface TimelineStatsProps {
  // ... bestehende Props ...
  averagePerDay?: number | null;
}
```

### TimelineStats Erweiterung

```tsx
{/* Average context */}
{averagePerDay !== null && averagePerDay !== undefined && (
  <>
    <motion.div
      variants={itemVariants}
      className="hidden sm:block w-px h-10 bg-tertiary/20 light:bg-tertiary-dark/20"
    />
    <motion.div variants={itemVariants} className="...">
      <p className="text-2xl font-light text-primary light:text-primary-dark tabular-nums">
        ~{Number.isInteger(averagePerDay) ? averagePerDay : averagePerDay.toFixed(1)}
      </p>
      <p className="text-xs text-tertiary light:text-tertiary-dark">
        avg/day
      </p>
    </motion.div>
  </>
)}
```

## Edge Cases

- Neuer User (< 7 aktive Tage): Durchschnitt nicht anzeigen
- User mit genau 1 aktivem Tag: Nicht anzeigen (Durchschnitt = irrelevant)
- Vergangene Tage ohne Session: Nicht in Durchschnitt einbeziehen (nur aktive Tage)
- Durchschnitt genau 0: Nicht anzeigen

## Testing

- [ ] Durchschnitt wird korrekt berechnet (nur aktive Tage)
- [ ] Bei < 7 aktiven Tagen: Durchschnitt nicht sichtbar
- [ ] Formatierung: "~5" fuer ganze Zahlen, "~4.2" fuer Dezimal
- [ ] Layout: Passt in bestehende Stats-Reihe
- [ ] Responsive: Mobile + Desktop korrekt
- [ ] Light + Dark Mode

## Definition of Done

- [ ] Durchschnitts-Berechnung implementiert
- [ ] Viertes Stat-Element in TimelineStats
- [ ] Nur sichtbar bei genuegend Daten (>= 7 aktive Tage)
- [ ] Konsistentes Design mit bestehenden Stats
- [ ] Typecheck + Lint bestanden
