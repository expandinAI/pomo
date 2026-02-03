---
type: story
status: backlog
priority: p1
effort: 2
feature: "[[ideas/10x-particle-of-the-week]]"
created: 2026-02-03
updated: 2026-02-03
done_date: null
tags: [10x, quick-win, coach, celebration]
---

# POMO-338: Partikel of the Week

## User Story

> Als **Particle-User**
> möchte ich **wöchentlich mein besonderes Partikel gefeiert sehen**,
> damit **einzelne Sessions Bedeutung bekommen und ich stolz sein kann**.

## Kontext

Link zur Idee: [[ideas/10x-particle-of-the-week]]

Aktuell werden alle Partikel gleich behandelt. Keine Würdigung besonderer Leistungen. Der Coach könnte wöchentlich EIN Partikel hervorheben: "Dieses Partikel war besonders."

**10x-Analyse:** Minimaler Aufwand (ein Query, ein Badge, ein Insight), aber gibt einzelnen Sessions Bedeutung.

## Akzeptanzkriterien

- [ ] **Given** Woche vorbei, **When** User Coach öffnet, **Then** "Partikel of the Week" wird angezeigt
- [ ] **Given** Partikel of the Week ausgewählt, **Then** Kriterium wird erklärt ("Längste Session", "An wichtigstem Projekt", etc.)
- [ ] **Given** Partikel of the Week, **Then** Badge/Highlight auf dem Partikel in History/Timeline
- [ ] **Given** keine Sessions diese Woche, **Then** kein Partikel of the Week (kein Fake-Lob)
- [ ] Partikel of the Week ist teilbar (wenn Sharing implementiert)

## Technische Details

### Betroffene Dateien
```
src/
├── lib/coach/particle-of-week.ts        # NEU: Auswahl-Logik
├── components/coach/InsightCard.tsx     # POTW-Variante
├── components/coach/CoachView.tsx       # POTW anzeigen
├── components/timer/ParticleDetailOverlay.tsx  # Badge
└── api/coach/insights/route.ts          # POTW-Insight generieren
```

### Auswahl-Algorithmus
```typescript
// lib/coach/particle-of-week.ts
export function selectParticleOfWeek(sessions: CompletedSession[]): ParticleOfWeek | null {
  if (sessions.length === 0) return null;

  // Kriterien (Priorität):
  // 1. Längste Session (mit Overflow)
  // 2. An Projekt mit meisten Sessions (Konsistenz)
  // 3. Ungewöhnliche Zeit (Wochenende, früh morgens)

  const longest = sessions.reduce((max, s) =>
    s.actualDuration > max.actualDuration ? s : max
  );

  return {
    session: longest,
    reason: 'longest',
    description: `${formatDuration(longest.actualDuration)} am Stück`
  };
}
```

### Badge-Design
```tsx
// In ParticleDetailOverlay oder History
{session.isParticleOfWeek && (
  <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
    ★ Partikel der Woche
  </span>
)}
```

## UI/UX

**Coach-Insight (Montag morgens):**
```
┌─────────────────────────────────────────────────────────────────┐
│  ★ Partikel der Woche                                           │
│                                                                   │
│  Dieses Partikel war dein Held:                                  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  67 Minuten · Website Redesign                          │    │
│  │  Donnerstag, 30. Januar · 9:14 - 10:21                  │    │
│  │  "Design Review abgeschlossen"                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Du hast 42 Minuten länger fokussiert als geplant.              │
│  Das ist echter Flow.                                            │
│                                                                   │
│                                            [Teilen] (wenn impl.) │
└─────────────────────────────────────────────────────────────────┘
```

**Badge in History/Timeline:**
- Kleiner Stern (★) neben dem Partikel
- Subtle Highlight-Hintergrund
- Tooltip: "Partikel der Woche KW 5"

## Testing

### Manuell zu testen
- [ ] Coach zeigt POTW am Montag
- [ ] Richtiges Partikel ausgewählt (längstes)
- [ ] Badge erscheint in History
- [ ] Bei leerer Woche: Kein POTW
- [ ] Begründung ist sinnvoll

## Definition of Done

- [ ] Auswahl-Logik implementiert
- [ ] Coach-Insight zeigt POTW
- [ ] Badge in History/Timeline
- [ ] Lokal getestet

## Notizen

- Aufwand: ~2 Stunden
- Timing: Insight am Sonntag Abend oder Montag Morgen generieren
- Später: Mit Sharing kombinieren ("Mein Partikel der Woche teilen")
- Später: Mehr Kriterien (Konsistenz, Projekt-Fokus, etc.)

---

## Arbeitsverlauf

### Gestartet:
### Erledigt:
