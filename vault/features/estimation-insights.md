# Feature Spec: Estimation Insights

> **Spezifikation für POMO-143** – Überarbeitet für Particle-Philosophie

---

## Das Problem mit der ursprünglichen Story

Die ursprüngliche POMO-143 Story ist **Llama Life-inspiriert**, aber nicht **Particle-nativ**:

| Ursprünglich | Problem |
|--------------|---------|
| "Du unterschätzt Tasks um ~20%" | Klingt nach Kritik/Schuld |
| Grün/Rot Farbkodierung | Widerspricht S/W-Prinzip |
| Charts mit Linien | Zu viel visueller Noise |
| Filter-Buttons (7/30/Alle) | UI-Clutter |
| "Tipp: Füge 20% Buffer hinzu" | Belehrend, nicht inspirierend |

**Die Prüffrage:** "Würde ein weißer Punkt auf schwarzem Grund stolz sein, Teil davon zu sein?"

→ **Antwort: Nein.** Das Feature braucht ein Redesign.

---

## Die Particle-Version: "Dein Rhythmus"

### Philosophie

Statt Fehler aufzuzeigen, zeigen wir **Muster** – wie ein Spiegel.

> **"Particle ist kein Spiel. Particle ist ein Spiegel."**
> – VISION.md

Der Nutzer soll nicht denken: "Ich mache etwas falsch."
Der Nutzer soll denken: "Oh, interessant – so arbeite ich also."

### Naming

| Alt | Neu |
|-----|-----|
| Estimation Trend Analytics | **Dein Rhythmus** |
| "Du unterschätzt..." | "Deine Partikel wachsen..." |
| Accuracy | Flow-Muster |

---

## User Story (überarbeitet)

> Als **Mensch, der sein Arbeitsverhalten verstehen will**
> möchte ich **sehen, wie meine Partikel tatsächlich aussehen**,
> damit **ich mich selbst besser kennenlernen kann – ohne Schuld oder Druck**.

---

## Design-Konzept

### Ansatz: Minimal Insight Card

Keine Charts. Keine Filter. **Eine einzige, elegante Aussage.**

```
┌─────────────────────────────────────────────┐
│                                             │
│            Dein Rhythmus                    │
│                                             │
│     Deine Partikel dauern                   │
│     durchschnittlich 32 min                 │
│                                             │
│     ○ ○ ○ ○ ○ ○ ○ ● ● ● ● ● ●              │
│     ↑                                       │
│     geschätzt        tatsächlich            │
│                                             │
│     Du nimmst dir mehr Zeit als geplant.    │
│     Das ist kein Fehler – das ist Flow.     │
│                                             │
└─────────────────────────────────────────────┘
```

### Elemente

1. **Titel:** "Dein Rhythmus" (nicht "Schätzungs-Trend")
2. **Kernaussage:** "Deine Partikel dauern durchschnittlich X min"
3. **Visualisierung:** Partikel-Dots (S/W), keine Linien-Charts
4. **Interpretation:** Neutral bis positiv, nie kritisch

---

## Die drei Rhythmus-Typen

### 1. Flow-Typ (tatsächlich > geschätzt)

**Muster:** Partikel wachsen über die Schätzung hinaus.

```
○ ○ ○ ○ ○ ● ● ● ● ● ● ●
geschätzt     tatsächlich

"Du nimmst dir mehr Zeit als geplant.
Das ist kein Fehler – das ist Flow."
```

**Insight (optional, versteckt):**
> Wenn du planst, rechne mit +20% für realistischere Erwartungen.

### 2. Struktur-Typ (tatsächlich < geschätzt)

**Muster:** Partikel sind kompakter als erwartet.

```
● ● ● ● ● ● ○ ○ ○ ○
tatsächlich   geschätzt

"Du arbeitest fokussierter als du denkst.
Deine Puffer sind eingebaut."
```

**Insight (optional, versteckt):**
> Du könntest kürzere Sessions planen – oder den Puffer genießen.

### 3. Präzisions-Typ (tatsächlich ≈ geschätzt)

**Muster:** Partikel entsprechen der Schätzung.

```
● ● ● ● ● ● ● ●
geschätzt = tatsächlich

"Dein innerer Timer ist präzise.
Du kennst deinen Rhythmus."
```

---

## Platzierung im UI

### Option A: In Statistics Dashboard (versteckt)

- Teil der erweiterten Stats
- Nutzer muss aktiv danach suchen
- Kein prominenter Platz im Hauptflow

### Option B: Particle Detail Overlay

- Wenn man einen Partikel öffnet, sieht man seinen "Rhythmus"
- Kontextuell: "Dieser Partikel sollte 25 min dauern. Er wurde 32 min."
- Aggregiert über Zeit: Link zu "Dein Rhythmus insgesamt"

### Empfehlung: **Option B** (kontextuell, nicht aufdringlich)

---

## Berechnung

### Datengrundlage

```typescript
interface ParticleRhythm {
  estimated: number;  // Geplante Dauer in Sekunden
  actual: number;     // Tatsächliche Dauer in Sekunden
}

// Nur Partikel mit expliziter Schätzung zählen
// (Smart Input: "Meeting 30" → estimated = 1800)
// Preset-Sessions ohne Custom-Zeit werden ignoriert
```

### Logik

```typescript
interface RhythmResult {
  type: 'flow' | 'structure' | 'precision';
  averageEstimated: number;
  averageActual: number;
  ratio: number;  // actual/estimated (1.0 = präzise)
  hasEnoughData: boolean;
}

const calculateRhythm = (particles: ParticleRhythm[]): RhythmResult => {
  const MIN_DATA_POINTS = 5;

  if (particles.length < MIN_DATA_POINTS) {
    return { hasEnoughData: false, ... };
  }

  const avgEstimated = average(particles.map(p => p.estimated));
  const avgActual = average(particles.map(p => p.actual));
  const ratio = avgActual / avgEstimated;

  let type: RhythmResult['type'];
  if (ratio > 1.1) {
    type = 'flow';       // >10% länger als geplant
  } else if (ratio < 0.9) {
    type = 'structure';  // >10% kürzer als geplant
  } else {
    type = 'precision';  // ±10% = präzise
  }

  return {
    type,
    averageEstimated: avgEstimated,
    averageActual: avgActual,
    ratio,
    hasEnoughData: true,
  };
};
```

---

## Texte (Voice & Tone)

### Particle-konform

| Typ | Aussage |
|-----|---------|
| Flow | "Du nimmst dir mehr Zeit als geplant. Das ist kein Fehler – das ist Flow." |
| Struktur | "Du arbeitest fokussierter als du denkst. Deine Puffer sind eingebaut." |
| Präzision | "Dein innerer Timer ist präzise. Du kennst deinen Rhythmus." |

### NICHT verwenden

- "Du unterschätzt/überschätzt Tasks" ❌
- "Fehler in deiner Planung" ❌
- "Tipp: Du solltest..." ❌
- Prozentangaben prominent anzeigen ❌

---

## Was wir NICHT bauen (v1)

1. **Keine Charts** – zu viel visueller Noise
2. **Keine Filter** – 7/30/All verkompliziert
3. **Keine Farbkodierung** – Schwarz und Weiß only
4. **Keine "Tipps"** – belehrend, nicht Particle
5. **Keine Notifications** – "Dein Schätzverhalten..." ❌

---

## Akzeptanzkriterien (überarbeitet)

### Must Have
- [ ] Rhythmus-Berechnung basierend auf Partikeln mit Schätzung
- [ ] Anzeige im ParticleDetailOverlay (oder Stats)
- [ ] Drei Typen: Flow, Struktur, Präzision
- [ ] Texte sind Particle-konform (kein Schuld-Framing)
- [ ] Partikel-Dot-Visualisierung (S/W)

### Nice to Have
- [ ] "Details"-Expander für konkrete Zahlen (versteckt)
- [ ] Animation: Dots verschieben sich von geschätzt zu tatsächlich

### Nicht in v1
- [ ] Charts
- [ ] Filter nach Zeitraum
- [ ] Export
- [ ] Vergleich mit "anderen Nutzern"

---

## Definition of Done

- [ ] Rhythmus-Berechnung in `src/lib/rhythm.ts`
- [ ] UI-Komponente `RhythmInsight.tsx`
- [ ] Integration in ParticleDetailOverlay oder Stats
- [ ] Texte abgestimmt mit Brand Guidelines
- [ ] Keine Farben außer S/W
- [ ] Code Review
- [ ] **Die Prüffrage bestanden**

---

## Offene Fragen zur Diskussion

1. **Platzierung:** Stats-Dashboard oder Particle-Detail-Overlay?
2. **Trigger:** Wann wird Rhythmus angezeigt? (Immer? Ab X Partikeln?)
3. **Granularität:** Rhythmus pro Projekt? Oder nur global?
4. **"Details":** Soll man die konkreten Zahlen sehen können (versteckt)?

---

*"Particle ist ein Spiegel, kein Richter."*
