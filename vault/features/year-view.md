---
type: feature
status: ready
priority: p1
effort: m
business_value: high
origin: "Competitor Analysis: Pomofocus + GitHub Inspiration"
stories:
  - "[[stories/backlog/POMO-110-year-view-data]]"
  - "[[stories/backlog/POMO-111-year-grid]]"
  - "[[stories/backlog/POMO-112-year-tooltip]]"
  - "[[stories/backlog/POMO-113-year-summary]]"
  - "[[stories/backlog/POMO-114-year-navigation]]"
  - "[[stories/backlog/POMO-115-year-animation]]"
  - "[[stories/backlog/POMO-116-peak-day]]"
  - "[[stories/backlog/POMO-117-weekstart-setting]]"
  - "[[stories/backlog/POMO-118-project-filter]]"
created: 2026-01-20
updated: 2026-01-20
tags: [visualization, stats, premium, emotional, p1]
---

# Year View – Das Lebenswerk eines Jahres

## Die Vision

> **Ein Jahr deines Lebens. 365 Tage. Tausende von Partikeln. Ein einziges, atemberaubendes Bild.**

Die Year View ist nicht einfach eine Statistik. Sie ist ein **Kunstwerk**. Ein Moment des Stolzes. Wenn jemand `G Y` drückt und sein Jahr sieht, soll der erste Gedanke sein:

*"Das habe ich geschaffen."*

Nicht "Hier sind meine Daten." Sondern: **"Das ist mein Lebenswerk dieses Jahres."**

---

## Zusammenfassung

> Die Year View zeigt 365 Tage als monochromes Grid – inspiriert von GitHubs Contribution Graph, aber emotionaler, persönlicher, schöner. Jeder Tag ist ein Punkt. Je heller der Punkt, desto mehr Fokuszeit. Das Ergebnis: Eine visuelle Signatur deiner Produktivität.

## Kontext & Problem

### Ausgangssituation
Nutzer haben Wochen- und Monatsansichten, aber keinen Blick auf das große Ganze. Nach einem Jahr harter Arbeit gibt es keinen Moment der Reflexion, kein "Wow, schau was ich geschafft habe."

### Betroffene Nutzer
- Knowledge Worker, die ihr Jahr reflektieren wollen
- Freelancer, die ihre Arbeit visualisieren wollen
- Alle, die Stolz statt Zahlen suchen

### Auswirkung
Ohne Year View:
- Kein emotionaler Höhepunkt
- Keine langfristige Motivation
- Keine "Share-worthy" Visualisierung
- Verpasste Premium-Conversion-Chance

## Ziele

### Muss erreicht werden
- [ ] 365 Tage als Grid visualisieren
- [ ] Helligkeit = Fokusintensität (mehr Partikel = heller)
- [ ] Hover zeigt Tag-Details
- [ ] Navigation via `G Y`
- [ ] Jahr-Selector (2024, 2025, 2026...)
- [ ] Responsive (Desktop-first, aber Mobile-tauglich)

### Sollte erreicht werden
- [ ] Smooth Einblend-Animation beim Öffnen
- [ ] Projekt-Filter ("Zeige nur Projekt X")
- [ ] Monats-Labels am Grid
- [ ] Wochentag-Labels (Mo, Di, Mi...)

### Nice to Have
- [ ] Share-Funktion (als Bild exportieren)
- [ ] Vergleich mit Vorjahr
- [ ] Heatmap-Themes (verschiedene Graustufen-Paletten)

### Nicht im Scope
- Interaktive Drill-Down (Click → Tagesdetail)
- Animierte Zeitraffer ("Watch your year grow")
- Gamification-Elemente

---

## Das Design

### Die Philosophie

**GitHub zeigt Commits. Wir zeigen ein Leben.**

GitHub's Graph ist funktional, technisch, grün. Unserer ist:
- **Monochrom** – Schwarz und Weiß, wie alles bei Particle
- **Emotional** – Es fühlt sich an wie ein Gemälde
- **Persönlich** – Es ist DEIN Jahr, nicht eine Metrik

### Visual Concept

```
+-------------------------------------------------------------------+
|                                                                   |
|  2025                                           <- [2024] [2026]  |
|                                                                   |
|  +---------------------------------------------------------------+|
|  |                                                               ||
|  |     Jan    Feb    Mar    Apr    May    Jun    Jul    ...      ||
|  |                                                               ||
|  |  Mo  · · · · · · · · · · · · · · · · · · · · · · · · · · ·    ||
|  |  Tu  · · · · · · · · · · · · · · · · · · · · · · · · · · ·    ||
|  |  We  · · · · · · · · · · · · · · · · · · · · · · · · · · ·    ||
|  |  Th  · · · · · · · · · · · · · · · · · · · · · · · · · · ·    ||
|  |  Fr  · · · · · · · · · · · · · · · · · · · · · · · · · · ·    ||
|  |  Sa  · · · · · · · · · · · · · · · · · · · · · · · · · · ·    ||
|  |  Su  · · · · · · · · · · · · · · · · · · · · · · · · · · ·    ||
|  |                                                               ||
|  +---------------------------------------------------------------+|
|                                                                   |
|  ┌─────────────────────────────────────────────────────────────┐ |
|  │                                                             │ |
|  │   1,247 Partikel  ·  521 Stunden  ·  Längste Streak: 23 d  │ |
|  │                                                             │ |
|  └─────────────────────────────────────────────────────────────┘ |
|                                                                   |
+-------------------------------------------------------------------+
```

### Die Punkte (Cells)

Jeder Tag ist ein Punkt. Die Helligkeit zeigt die Intensität:

| Partikel | Brightness | Visuell |
|----------|------------|---------|
| 0 | 0.1 | ░ (kaum sichtbar) |
| 1-2 | 0.3 | ▒ (dunkelgrau) |
| 3-5 | 0.5 | ▓ (mittelgrau) |
| 6-9 | 0.7 | █ (hellgrau) |
| 10+ | 1.0 | ● (weiß, strahlend) |

**Design-Details:**
- Punkt-Größe: 12x12px
- Gap zwischen Punkten: 3px
- Border-Radius: 2px (leicht gerundet, nicht rund)
- Hover: Leichter Glow-Effekt

### Hover-State: Der magische Moment

Wenn die Maus über einen Tag fährt, erscheint ein Tooltip:

```
         ┌─────────────────────────────┐
         │  Montag, 15. Januar 2025    │
         │                             │
         │  ●●●●●●●●  8 Partikel       │
         │  3h 20m Fokuszeit           │
         │                             │
         │  Top Task:                  │
         │  "API Integration"          │
         │                             │
         │  Projekt: Website Redesign  │
         └─────────────────────────────┘
              ▼
         [Punkt im Grid]
```

**Tooltip-Inhalt:**
- Datum (ausgeschrieben, freundlich)
- Partikel-Count als Dots + Zahl
- Fokuszeit in Stunden/Minuten
- Top Task (die meiste Zeit an dem Tag)
- Projekt (wenn vorhanden)

**Wenn 0 Partikel:**
```
         ┌─────────────────────────────┐
         │  Sonntag, 12. Januar 2025   │
         │                             │
         │  Ein Tag der Ruhe.          │
         │                             │
         └─────────────────────────────┘
```

Keine Schuld. Keine "0 Sessions". Nur: "Ein Tag der Ruhe."

### Summary Stats

Unter dem Grid: Die wichtigsten Zahlen des Jahres.

```
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│    1,247            521h 35m           23 Tage          187       │
│   Partikel         Fokuszeit      Längste Serie    Aktive Tage   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Metriken:**
- **Partikel** – Total des Jahres
- **Fokuszeit** – Summe aller Sessions
- **Längste Serie** – Max consecutive days with ≥1 Partikel
- **Aktive Tage** – Tage mit ≥1 Partikel

### Die Animation: Der Wow-Moment

Beim Öffnen der Year View (`G Y`):

1. **Fade In** (0-200ms): Der Hintergrund erscheint
2. **Grid Reveal** (200-800ms): Die Punkte erscheinen von links nach rechts, wie eine Welle
3. **Summary Pop** (800-1000ms): Die Zahlen unten faden ein

```
Frame 0:    [                                    ]
Frame 10:   [· ·                                 ]
Frame 20:   [· · · · ·                           ]
Frame 30:   [· · · · · · · · ·                   ]
...
Frame 50:   [· · · · · · · · · · · · · · · · · · ]
```

**Timing:** Die Welle dauert ~600ms. Nicht zu schnell (sonst sieht man nichts), nicht zu langsam (sonst nervt's).

**reduced-motion:** Bei `prefers-reduced-motion` → Instant, keine Animation.

---

## User Flows

### Flow 1: Year View öffnen

**Trigger:** `G Y` von überall ODER Navigation über Stats

```
User drückt G Y
    ↓
Year View öffnet sich (mit Animation)
    ↓
Aktuelles Jahr wird angezeigt
    ↓
User sieht sein Lebenswerk
```

### Flow 2: Zwischen Jahren wechseln

```
+-------------------------------------------------------------------+
|  2025                                           [< 2024] [2026 >] |
+-------------------------------------------------------------------+
```

- `←` / `→` Pfeiltasten wechseln Jahre
- Nur Jahre mit Daten sind auswählbar
- Animation: Slide left/right beim Wechsel

### Flow 3: Projekt filtern (Optional)

```
+-------------------------------------------------------------------+
|  2025                    [Alle Projekte ▼]      [< 2024] [2026 >] |
+-------------------------------------------------------------------+
```

Dropdown zeigt:
- "Alle Projekte"
- "Website Redesign"
- "Mobile App"
- etc.

Bei Auswahl: Grid zeigt nur Partikel dieses Projekts.

---

## Akzeptanzkriterien

### Must Have

- [ ] `G Y` öffnet Year View
- [ ] 365 Tage als Grid (7 Reihen × 52-53 Spalten)
- [ ] Helligkeit entspricht Partikel-Count
- [ ] Monats-Labels über dem Grid
- [ ] Wochentag-Labels links (Mo, Di, Mi...)
- [ ] Hover zeigt Tooltip mit Tag-Details
- [ ] Jahr-Selector (Pfeiltasten + Buttons)
- [ ] Summary Stats unter dem Grid
- [ ] Einblend-Animation (Wellen-Effekt)
- [ ] `prefers-reduced-motion` Support
- [ ] `Escape` schließt / geht zurück

### Should Have

- [ ] Projekt-Filter Dropdown
- [ ] Smooth Jahr-Wechsel Animation
- [ ] "Heute" Marker (leichter Glow/Border)
- [ ] Tooltip zeigt Top Task + Projekt

### Nice to Have

- [ ] Export als Bild (PNG)
- [ ] Share Button
- [ ] Comparison Mode (2024 vs 2025)

---

## Technische Details

### Daten-Aggregation

```typescript
interface YearViewDay {
  date: Date;
  particleCount: number;
  totalDuration: number; // in minutes
  topTask?: string;
  topProject?: {
    id: string;
    name: string;
  };
}

interface YearViewData {
  year: number;
  days: YearViewDay[]; // 365 or 366 items
  summary: {
    totalParticles: number;
    totalDuration: number;
    longestStreak: number;
    activeDays: number;
  };
}

async function getYearViewData(year: number, projectId?: string): Promise<YearViewData>;
```

### Grid-Layout Berechnung

```typescript
// GitHub-style: Wochen als Spalten, Tage als Reihen
// Woche beginnt am Montag (europäisch) oder Sonntag (US) → Einstellung?

function generateYearGrid(year: number): GridCell[][] {
  // Returns 7 rows (days) × 52-53 columns (weeks)
  // Each cell has: date, weekday, monthLabel (for first day of month)
}
```

### Brightness Calculation – Dynamisch & Persönlich

**Entscheidung:** Dynamische Skala basierend auf dem persönlichen Maximum des Users.

**Warum dynamisch?**
- Ein User mit max. 4 Partikeln/Tag sieht trotzdem ein schönes, kontrastreiches Bild
- Ein Power-User mit 15 Partikeln/Tag hat auch Nuancen sichtbar
- Das Jahr fühlt sich IMMER wie ein Lebenswerk an, egal ob Anfänger oder Pro

**Algorithmus:**

```typescript
function calculateBrightness(
  particleCount: number,
  personalMax: number
): number {
  // 0 Partikel = fast unsichtbar (aber nicht ganz weg)
  if (particleCount === 0) return 0.08;

  // Logarithmische Skala für natürlichere Verteilung
  // Log macht kleine Unterschiede sichtbarer (1→2 ist visuell größer als 10→11)
  const logCount = Math.log(particleCount + 1);
  const logMax = Math.log(personalMax + 1);

  // Normalisieren auf 0-1
  const normalized = logCount / logMax;

  // Auf Brightness-Range mappen: 0.15 (dunkel) bis 1.0 (strahlend weiß)
  return 0.15 + normalized * 0.85;
}
```

**Beispiel-Visualisierung:**

User A (Casual): Max 4 Partikel/Tag
```
0 Partikel  →  ░░░  (0.08)
1 Partikel  →  ▒▒▒  (0.45)
2 Partikel  →  ▓▓▓  (0.65)
3 Partikel  →  ███  (0.82)
4 Partikel  →  ●●●  (1.00) ← Persönlicher Peak!
```

User B (Power User): Max 12 Partikel/Tag
```
0 Partikel  →  ░░░  (0.08)
1 Partikel  →  ░▒░  (0.30)
3 Partikel  →  ▒▒▒  (0.52)
6 Partikel  →  ▓▓▓  (0.72)
9 Partikel  →  ███  (0.86)
12 Partikel →  ●●●  (1.00) ← Persönlicher Peak!
```

**Peak Day Highlight – Der strahlendste Tag:**

Der Tag mit dem persönlichen Maximum bekommt einen besonderen visuellen Marker:
- **Subtle Glow:** Ein sanfter weißer Schein um den Punkt
- **Tooltip:** "Dein produktivster Tag 🏆"

```
         ┌─────────────────────────────┐
         │  Mittwoch, 23. März 2025    │
         │                             │
         │  ●●●●●●●●●●●● 12 Partikel   │
         │  5h 0m Fokuszeit            │
         │                             │
         │  🏆 Dein produktivster Tag  │
         │                             │
         └─────────────────────────────┘
```

**Edge Cases:**
- Nur 1 Tag mit Daten → Dieser Tag = 100% Brightness
- Alle Tage gleich (z.B. immer 2 Partikel) → Alle gleich hell, aber das ist okay (Konsistenz!)
- Neuer User mit wenig Daten → Trotzdem schönes Bild, weil relativ

### Betroffene Dateien

```
src/
├── components/
│   └── year-view/
│       ├── YearView.tsx           # Hauptkomponente
│       ├── YearGrid.tsx           # Das Grid
│       ├── YearGridCell.tsx       # Einzelner Tag
│       ├── YearTooltip.tsx        # Hover-Tooltip
│       ├── YearSummary.tsx        # Stats unten
│       ├── YearSelector.tsx       # Jahr-Auswahl
│       └── index.ts
├── lib/
│   └── year-view/
│       ├── data.ts                # Daten-Aggregation
│       ├── grid.ts                # Grid-Berechnung
│       └── animations.ts          # Animation Configs
└── app/
    └── year/
        └── page.tsx               # Route /year
```

---

## Messaging (Brand Voice)

### Page Title
> "Dein Jahr in Partikeln"

### Empty State (neuer User, keine Daten)
```
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│                              ·                                    │
│                                                                   │
│                  Dein Jahr wartet darauf,                         │
│                   gefüllt zu werden.                              │
│                                                                   │
│               Starte deine erste Session und                      │
│               sieh zu, wie dein Lebenswerk wächst.                │
│                                                                   │
│                     [Zurück zum Timer]                            │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Tooltip für 0-Partikel-Tage
> "Ein Tag der Ruhe."

Keine Schuld. Keine rote Zahl. Nur Akzeptanz.

### Summary Labels
- "Partikel" (nicht "Sessions")
- "Fokuszeit" (nicht "Arbeitszeit")
- "Längste Serie" (nicht "Streak" – deutsch, wärmer)
- "Aktive Tage" (positiv formuliert)

---

## Metriken & Erfolgsmessung

- **Primäre Metrik:** 30% der aktiven User öffnen Year View mind. 1x/Monat
- **Sekundäre Metrik:** 5% Share/Export ihre Year View
- **Sekundäre Metrik:** Premium Conversion +10% (Year View ist Premium)
- **Messzeitraum:** 8 Wochen nach Launch

---

## Entschiedene Fragen

- [x] **Wochenstart:** User-Einstellung, Default Montag (EU). Später: Auto-Detection via Browser-Locale.
- [x] **Brightness-Skala:** **Dynamisch basierend auf persönlichem Maximum** (siehe Details unten)
- [x] **Mobile:** Horizontal Scroll. User können Landscape nutzen für bessere Ansicht.

---

## Inspiration & Referenzen

### GitHub Contribution Graph
- Grid-Layout
- Hover-Tooltips
- Farb-Intensität = Aktivität

### Aber anders:
- Monochrom statt Grün
- Emotionaler Messaging
- Schönere Animation
- Keine "Less/More" Legende (selbsterklärend)

### Linear's Year in Review
- Emotionaler Tone
- Persönliche Stats
- Share-worthy Design

---

## Definition of Done

- [ ] `G Y` Navigation funktioniert
- [ ] Grid zeigt 365 Tage korrekt
- [ ] Brightness entspricht Partikel-Count
- [ ] Hover-Tooltips mit allen Infos
- [ ] Jahr-Wechsel funktioniert
- [ ] Summary Stats korrekt berechnet
- [ ] Einblend-Animation
- [ ] Reduced Motion Support
- [ ] Mobile-responsive (horizontal scroll)
- [ ] Empty State für neue User
- [ ] Tests geschrieben & grün
- [ ] Performance <100ms render
- [ ] Code reviewed

---

## Stories

| Story | Titel | SP | Prio | Status |
|-------|-------|---|------|--------|
| [[stories/backlog/POMO-110-year-view-data]] | Year View Data Aggregation | 3 | P0 | ✅ Created |
| [[stories/backlog/POMO-111-year-grid]] | Year Grid Component | 5 | P0 | ✅ Created |
| [[stories/backlog/POMO-112-year-tooltip]] | Hover Tooltip | 3 | P0 | ✅ Created |
| [[stories/backlog/POMO-113-year-summary]] | Year Summary Stats | 2 | P0 | ✅ Created |
| [[stories/backlog/POMO-114-year-navigation]] | Jahr-Selector & Navigation | 2 | P0 | ✅ Created |
| [[stories/backlog/POMO-115-year-animation]] | Einblend-Animation (Wellen-Effekt) | 3 | P0 | ✅ Created |
| [[stories/backlog/POMO-116-peak-day]] | Peak Day Highlight (Glow + Tooltip) | 2 | P0 | ✅ Created |
| [[stories/backlog/POMO-117-weekstart-setting]] | Wochenstart-Einstellung | 1 | P1 | ✅ Created |
| [[stories/backlog/POMO-118-project-filter]] | Projekt-Filter | 2 | P1 | ✅ Created |

**P0 Gesamt: 20 Story Points**
**P1 Gesamt: 3 Story Points**
**Total: 23 Story Points (9 Stories)**

---

## Changelog

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2026-01-20 | Initial Draft | Claude |

---

*"Ein Jahr deines Lebens. Tausende von Partikeln. Ein einziges, atemberaubendes Bild."*
