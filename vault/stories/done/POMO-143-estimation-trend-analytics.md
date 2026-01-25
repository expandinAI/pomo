---
type: story
status: done
priority: p1
effort: 3
feature: "[[features/estimation-insights]]"
created: 2026-01-23
updated: 2026-01-25
done_date: 2026-01-25
tags: [analytics, rhythm, self-reflection, dashboard, p1]
---

# POMO-143: Dein Rhythmus – Estimation Insights

## User Story

> Als **Mensch, der sein Arbeitsverhalten verstehen will**
> möchte ich **sehen, wie meine Partikel tatsächlich aussehen**,
> damit **ich mich selbst besser kennenlernen kann – ohne Schuld oder Druck**.

## Kontext

Link zum Feature: [[features/estimation-insights]]

**Philosophie:** "Particle ist ein Spiegel, kein Richter."

Wir zeigen **Muster**, nicht **Fehler**. Der Nutzer soll denken: "Oh, interessant – so arbeite ich also" – nicht "Ich mache etwas falsch".

## Scope

### Neuer Navigations-Punkt: "Rhythmus"

```
Navigation:
● Timer
○ Timeline
○ Rhythmus    ← NEU
○ Projekte
```

### Rhythmus-View

```
┌─────────────────────────────────────────────┐
│  Dein Rhythmus                              │
│                                             │
│  [Alle Projekte ▾]                          │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  Deine Partikel dauern              │    │
│  │  durchschnittlich 32 min            │    │
│  │                                     │    │
│  │  ○ ○ ○ ○ ○ ● ● ● ● ● ● ●           │    │
│  │  geschätzt      tatsächlich         │    │
│  │                                     │    │
│  │  Du nimmst dir mehr Zeit als        │    │
│  │  geplant. Das ist Flow.             │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Pro Projekt:                               │
│  ───────────────────────────────────────    │
│  Design      ●●●●●●○○  Flow (+15%)          │
│  Code        ●●●●●●●●  Präzision            │
│  Meetings    ●●●○○○○○  Struktur (-20%)      │
│                                             │
└─────────────────────────────────────────────┘
```

## Akzeptanzkriterien

### Navigation

- [ ] **Given** App geöffnet, **When** Navigation, **Then** "Rhythmus" als eigener Punkt sichtbar
- [ ] **Given** Rhythmus-Tab, **When** Klick, **Then** Rhythmus-View öffnet sich
- [ ] **Given** Keyboard, **When** Shortcut (z.B. `G R`), **Then** Rhythmus-View öffnet

### Globaler Rhythmus

- [ ] **Given** Partikel mit Schätzung vorhanden, **When** Rhythmus-View, **Then** Globaler Rhythmus angezeigt
- [ ] **Given** <5 Partikel mit Schätzung, **When** Rhythmus-View, **Then** "Mehr Partikel nötig"
- [ ] **Given** Rhythmus berechnet, **When** Typ ermittelt, **Then** Passender Text (Flow/Struktur/Präzision)

### Projekt-Filter

- [ ] **Given** Rhythmus-View, **When** Filter-Dropdown, **Then** "Alle Projekte" + Liste aller Projekte
- [ ] **Given** Projekt ausgewählt, **When** Filter, **Then** Rhythmus nur für dieses Projekt
- [ ] **Given** Filter aktiv, **When** Zurück zu "Alle", **Then** Globaler Rhythmus wieder sichtbar

### Pro-Projekt-Übersicht

- [ ] **Given** Rhythmus-View, **When** unten, **Then** Alle Projekte mit eigenem Rhythmus gelistet
- [ ] **Given** Projekt in Liste, **When** angezeigt, **Then** Partikel-Dots + Typ-Label
- [ ] **Given** Projekt ohne genug Daten, **When** Liste, **Then** Projekt ausgeblendet oder "–"

### Visualisierung

- [ ] **Given** Rhythmus, **When** angezeigt, **Then** Partikel-Dots (weiß = actual, outline = estimated)
- [ ] **Given** Dots, **When** Verhältnis, **Then** Visuell klar ob mehr/weniger/gleich
- [ ] **Given** Animation, **When** View öffnet, **Then** Dots animieren sanft rein

## Die drei Rhythmus-Typen

| Typ | Bedingung | Text |
|-----|-----------|------|
| **Flow** | actual > estimated (+10%) | "Du nimmst dir mehr Zeit als geplant. Das ist kein Fehler – das ist Flow." |
| **Struktur** | actual < estimated (-10%) | "Du arbeitest fokussierter als du denkst. Deine Puffer sind eingebaut." |
| **Präzision** | actual ≈ estimated (±10%) | "Dein innerer Timer ist präzise. Du kennst deinen Rhythmus." |

## Technische Details

### Datenmodell

```typescript
interface ParticleWithEstimate {
  id: string;
  projectId: string | null;
  estimated: number;  // Sekunden (aus Smart Input)
  actual: number;     // Sekunden (tatsächliche Dauer)
}

interface RhythmResult {
  type: 'flow' | 'structure' | 'precision';
  averageEstimated: number;
  averageActual: number;
  ratio: number;  // actual/estimated
  particleCount: number;
  hasEnoughData: boolean;
}

interface ProjectRhythm {
  projectId: string;
  projectName: string;
  rhythm: RhythmResult;
}
```

### Berechnung

```typescript
const MIN_PARTICLES = 5;

const calculateRhythm = (particles: ParticleWithEstimate[]): RhythmResult => {
  if (particles.length < MIN_PARTICLES) {
    return { hasEnoughData: false, ... };
  }

  const avgEstimated = average(particles.map(p => p.estimated));
  const avgActual = average(particles.map(p => p.actual));
  const ratio = avgActual / avgEstimated;

  let type: 'flow' | 'structure' | 'precision';
  if (ratio > 1.1) type = 'flow';
  else if (ratio < 0.9) type = 'structure';
  else type = 'precision';

  return {
    type,
    averageEstimated: avgEstimated,
    averageActual: avgActual,
    ratio,
    particleCount: particles.length,
    hasEnoughData: true,
  };
};
```

### Komponenten-Struktur

```
src/components/rhythm/
├── RhythmView.tsx          # Hauptansicht
├── RhythmCard.tsx          # Globale Rhythmus-Karte
├── RhythmDots.tsx          # Partikel-Dot-Visualisierung
├── ProjectRhythmList.tsx   # Pro-Projekt-Liste
└── ProjectRhythmItem.tsx   # Einzelnes Projekt in Liste

src/lib/
├── rhythm.ts               # Berechnung
└── rhythm-texts.ts         # Texte pro Typ
```

## Nicht im Scope (v1)

- Zeitraum-Filter (7/30/Alle) – zu viel UI-Clutter
- Charts mit Linien – widerspricht Reduktion
- Farbkodierung (grün/rot) – nur S/W
- "Tipps" oder Belehrungen – nicht Particle
- Export oder Sharing

## Testing

### Manuell zu testen

- [ ] Navigation zu Rhythmus funktioniert
- [ ] Globaler Rhythmus berechnet korrekt
- [ ] Projekt-Filter filtert korrekt
- [ ] Pro-Projekt-Liste zeigt alle Projekte
- [ ] Texte passen zum Rhythmus-Typ
- [ ] Edge Case: <5 Partikel zeigt Hinweis
- [ ] Edge Case: Keine Partikel mit Schätzung

## Definition of Done

- [ ] Navigation-Punkt "Rhythmus" hinzugefügt
- [ ] RhythmView mit globalem Rhythmus
- [ ] Projekt-Filter Dropdown
- [ ] Pro-Projekt-Übersicht
- [ ] Partikel-Dot-Visualisierung (S/W)
- [ ] Rhythmus-Berechnung in `src/lib/rhythm.ts`
- [ ] Texte Particle-konform
- [ ] Keyboard-Shortcut (G R)
- [ ] Code Review
- [ ] **Die Prüffrage bestanden**
