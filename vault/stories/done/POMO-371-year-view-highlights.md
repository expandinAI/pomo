---
type: story
status: done
priority: p1
effort: 3
feature: particle-legacy
created: 2026-02-05
updated: 2026-02-05
done_date: 2026-02-05
tags: [legacy, year-view, narrative, emotional, enhancement]
---

# POMO-371: Year View Highlights — Narrativ unter dem Grid

## User Story

> As a **Particle user looking at my Year View**,
> I want **to see meaningful highlights of my year in words**,
> so that **the numbers become a story I connect with emotionally**.

## Context

Die Year View (`G Y`) zeigt aktuell:
- 365-Tage-Grid mit Brightness
- Summary Stats: Particles, Focus Time, Longest Streak, Active Days

Was fehlt: **Kontext und Narrative.** Die Zahlen sind korrekt, aber erzeugen keinen "Wow"-Moment. "1.247 Partikel" sagt weniger als "Dein produktivster Tag: 23. Maerz mit 12 Partikeln an Website Redesign."

### Bestehende Daten die wir nutzen

Alles existiert bereits in `YearViewData` und `YearViewDay[]`:

| Highlight | Datenquelle | Bereits vorhanden |
|-----------|-------------|-------------------|
| Peak Day | `peakDate` + `personalMax` | Ja, in `YearViewData` |
| Top Project | `topProject` auf `YearViewDay` | Ja, aggregierbar |
| Average per Day | `averagePerActiveDay` in `YearViewSummary` | Ja |
| Laengster Flow | `overflowDuration` auf Sessions | Ja, muss aggregiert werden |
| Aktivste Woche | `YearViewDay[]` gruppiert | Ja, berechenbar |

## Acceptance Criteria

### Highlights-Sektion

- [ ] Neue `YearHighlights` Komponente unter `YearSummary`
- [ ] Maximal 3-4 Highlights anzeigen (nicht ueberfluten)
- [ ] Stagger-Animation wie bestehende Year View Elemente

### Highlight-Typen (Prioritaet)

1. **Peak Day** (immer anzeigen wenn > 0 Partikel):
   - "Your best day: {date} with {count} particles"
   - Wenn `topTask` vorhanden: "working on {task}"

2. **Top Project** (anzeigen wenn Projekt-Daten vorhanden):
   - "{count} particles on {projectName}"
   - Berechnung: Projekt mit den meisten Partikeln im Jahr

3. **Consistency** (anzeigen wenn activeDays > 30):
   - "Active on {activeDays} of 365 days"
   - Oder: "{percentage}% of the year"

4. **Average** (immer anzeigen):
   - "~{avg} particles on active days"

### Styling

- [ ] Unter YearSummary, getrennt durch subtilen Divider
- [ ] Text-Style: `text-sm text-secondary` — lesbar aber nicht dominant
- [ ] Jeder Highlight als eigene Zeile mit dezenter Formatierung
- [ ] Keine Icons — reiner Text, Particle-Reduktion

### Beispiel-Output

```
Your best day           Mar 23 — 12 particles on "Website Redesign"
Most focused project    Website Redesign — 427 particles
Active days             187 of 365 (51%)
Average                 ~6.7 particles on active days
```

## Technical Details

### Neue Datei

```
src/components/year-view/YearHighlights.tsx
```

### Aggregations-Erweiterung

In `src/lib/year-view/aggregation.ts` oder direkt in der Komponente:

```typescript
interface YearHighlightsData {
  peakDay: { date: Date; count: number; topTask?: string } | null;
  topProject: { name: string; count: number } | null;
  activeDaysPercent: number;
  averagePerActiveDay: number;
}

function calculateHighlights(days: YearViewDay[], summary: YearViewSummary): YearHighlightsData {
  // Peak Day: aus YearViewData.peakDate + personalMax
  // Top Project: Iteriere ueber days, zaehle Partikel pro topProject
  // Active %: summary.activeDays / 365 (oder 366)
  // Average: summary.averagePerActiveDay
}
```

### Props

```typescript
interface YearHighlightsProps {
  days: YearViewDay[];
  summary: YearViewSummary;
  peakDate: Date;
  personalMax: number;
  year: number;
}
```

### Integration in YearViewModal

Nach `<YearSummary>`:
```tsx
<YearHighlights
  days={yearData.days}
  summary={yearData.summary}
  peakDate={yearData.peakDate}
  personalMax={yearData.personalMax}
  year={yearData.year}
/>
```

## Edge Cases

- Neuer User (< 7 Tage Daten): Nur Peak Day + Average zeigen
- Keine Projekte zugeordnet: Top Project Highlight weglassen
- Alle Tage gleich (immer 1 Partikel): Peak Day zeigt trotzdem den ersten
- Year mit 0 Partikeln: Keine Highlights anzeigen

## Testing

- [ ] Highlights zeigen korrekte Daten
- [ ] Peak Day stimmt mit YearGrid Peak-Marker ueberein
- [ ] Top Project Berechnung korrekt
- [ ] Light + Dark Mode
- [ ] Reduced Motion: Stagger-Animation deaktiviert
- [ ] Leeres Jahr: Highlights-Sektion komplett ausgeblendet

## Definition of Done

- [ ] `YearHighlights` Komponente implementiert
- [ ] In `YearViewModal` integriert
- [ ] 3-4 Highlights mit korrekten Daten
- [ ] Konsistent mit Year View Design
- [ ] Typecheck + Lint bestanden
