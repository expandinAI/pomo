---
type: feature
status: ready
priority: p0
effort: m
business_value: critical
origin: "[[ideas/first-run-intro-experience]]"
stories:
  - "[[stories/backlog/POMO-170-intro-foundation]]"
  - "[[stories/backlog/POMO-171-particle-genesis]]"
  - "[[stories/backlog/POMO-172-intro-typography]]"
  - "[[stories/backlog/POMO-173-particle-convergence]]"
  - "[[stories/backlog/POMO-174-intro-transition]]"
  - "[[stories/backlog/POMO-175-intro-replay]]"
created: 2026-01-27
updated: 2026-01-27
tags: [intro, experience, iconic, branding, animation, first-impression]
---

# First-Run Intro Experience

> *"Der erste Eindruck ist der Moment, den die meisten Apps verschenken."*

---

## Die Vision

Ein Moment, der bleibt.

Wenn jemand Particle zum ersten Mal öffnet, soll etwas passieren, das man nicht vergisst. Kein Tutorial. Keine Feature-Tour. Nur ein Moment der Stille, ein Partikel, und eine Wahrheit.

**Das Ziel:** Gänsehaut. Screenshot-würdig. Die DNA von Particle in 12 Sekunden.

---

## Der Text

```

        Große Werke entstehen nicht
        aus großen Momenten.

        Sie entstehen aus vielen kleinen.

        Bereit?

```

Drei Sätze. Eine Wahrheit. Eine Einladung.

---

## Die Choreografie

### Akt 1: Die Stille (0:00 – 2:00)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Was passiert:** Nichts. Absolut schwarz. Keine Ladeanimation. Keine Logo. Nur Schwarz.

**Warum:** Die Stille vor dem ersten Ton. Spannung aufbauen. Der Nutzer fragt sich: "Lädt das noch?"

**Dauer:** 2 Sekunden

**Technisch:**
- `background: #000000` (echtes Schwarz)
- Kein Cursor sichtbar
- Kein UI-Element

---

### Akt 2: Die Genesis (2:00 – 3:50)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                            ·                                │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Was passiert:**

1. **2:00** – Ein einzelner weißer Punkt erscheint. Nicht plötzlich – er faded in, wie ein Stern, der am Nachthimmel sichtbar wird.

2. **2:00 – 3:50** – Der Punkt beginnt zu atmen. Sanft. Wie ein Herzschlag. Nicht mechanisch – organisch. Die Bewegung ist subtil: ±2% Größenänderung, 4 Sekunden pro Zyklus.

**Das Gefühl:** Etwas ist entstanden. Etwas Lebendiges.

**Technisch:**
```typescript
// Der erste Partikel
const genesis = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: [1, 1.02, 1, 0.98, 1], // Breathing
  },
  transition: {
    opacity: { duration: 1.5, ease: "easeOut" },
    scale: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};
```

**Der Partikel:**
- Größe: 6px Durchmesser
- Farbe: `#FFFFFF` (reines Weiß)
- Kanten: Leicht soft (0.5px blur für organisches Gefühl)
- Position: Exakt zentriert

---

### Akt 3: Die erste Wahrheit (3:50 – 6:50)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│                 Große Werke entstehen nicht                 │
│                    aus großen Momenten.                     │
│                            ·                                │
│                                                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Was passiert:**

1. **3:50** – Der Text erscheint oberhalb des Partikels. Nicht Buchstabe für Buchstabe (zu verspielt), sondern als Ganzes – aber mit einem sanften Fade, der von der Mitte nach außen fließt.

2. **3:50 – 6:50** – Der Text steht. Der Partikel atmet weiter. Zeit zum Lesen. Zeit zum Verstehen.

**Der Text:**
```
Große Werke entstehen nicht
aus großen Momenten.
```

**Typografie:**
- Font: Inter (wie die App)
- Größe: 24px (Desktop), 18px (Mobile)
- Gewicht: 400 (Regular)
- Farbe: `#FFFFFF`
- Letter-spacing: -0.01em
- Line-height: 1.6
- Zentriert

**Technisch:**
```typescript
const textReveal = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 1.2,
    ease: [0.33, 1, 0.68, 1] // Custom ease-out
  }
};
```

---

### Akt 4: Die zweite Wahrheit (6:50 – 9:00)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                 Große Werke entstehen nicht                 │
│                    aus großen Momenten.                     │
│                                                             │
│                            ·                                │
│                                                             │
│               Sie entstehen aus vielen kleinen.             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Was passiert:**

1. **6:50** – Der zweite Satz erscheint unterhalb des Partikels. Gleiche Animation wie der erste.

2. **7:50 – 9:00** – Beide Sätze stehen. Der Partikel ist in der Mitte. Das Bild ist komplett.

**Der Text:**
```
Sie entstehen aus vielen kleinen.
```

**Position:** Unterhalb des Partikels, gespiegelt zum ersten Text.

---

### Akt 5: Die Zellteilung (9:00 – 10:50)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                 Große Werke entstehen nicht                 │
│                    aus großen Momenten.                     │
│                                                             │
│                      ·    ·    ·                            │
│                        ·    ·                               │
│               Sie entstehen aus vielen kleinen.             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Was passiert:**

1. **9:00** – Der Partikel teilt sich. Nicht explosiv – organisch. Wie eine Zelle, die sich teilt. Erst zwei, dann drei, dann fünf, dann sieben.

2. **9:00 – 10:50** – Die neuen Partikel driften langsam auseinander. Jeder hat seine eigene Geschwindigkeit, seine eigene Richtung. Aber sie bleiben nah beieinander. Eine Familie.

**Die Physik:**

```typescript
// Zellteilung
const cellDivision = {
  // Der Ursprungs-Partikel teilt sich
  split: (parent: Particle): Particle[] => {
    const children = [];
    const count = random(2, 3); // 2-3 pro Teilung

    for (let i = 0; i < count; i++) {
      children.push({
        x: parent.x + random(-20, 20),
        y: parent.y + random(-20, 20),
        vx: random(-0.3, 0.3), // Sehr langsame Drift
        vy: random(-0.3, 0.3),
        scale: parent.scale * random(0.8, 1.0),
        opacity: 1,
      });
    }
    return children;
  }
};

// Drift-Verhalten
const drift = {
  friction: 0.98, // Langsames Abbremsen
  maxSpeed: 0.5,  // Nie zu schnell
  attraction: 0.001, // Leichte gegenseitige Anziehung
};
```

**Anzahl Partikel:**
- Start: 1
- Nach Teilung 1: 3
- Nach Teilung 2: 7
- Final: 7 Partikel (magische Zahl, nicht zu viele)

**Das Gefühl:** Die Philosophie wird sichtbar. Aus einem werden viele. Das ist Particle.

---

### Akt 6: Die Einladung (10:50 – 11:50)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                      ·    ·    ·                            │
│                        ·    ·                               │
│                                                             │
│                          Bereit?                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Was passiert:**

1. **10:50** – Die beiden Textblöcke faden sanft aus.

2. **11:00** – Ein neues Wort erscheint: "Bereit?"

3. **11:00 – 11:50** – Die Partikel driften weiter. Das Wort steht.

**Der Text:**
```
Bereit?
```

**Typografie:**
- Gleiche Font, gleiche Größe
- Position: Unterhalb der Partikel-Wolke
- Das Fragezeichen ist keine Frage – es ist eine ausgestreckte Hand

**Wichtig:** Kein Button. Kein "Weiter". Nur das Wort. Der nächste Akt beginnt automatisch.

---

### Akt 7: Die Konvergenz (11:50 – 13:00)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                           ·····                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Was passiert:**

1. **11:50** – "Bereit?" faded aus.

2. **11:50 – 12:50** – Die Partikel werden angezogen. Wie Magnete. Wie ein Einatmen. Sie bewegen sich aufeinander zu – erst langsam, dann schneller, dann verlangsamen sie kurz vor dem Zusammentreffen.

3. **12:50 – 13:00** – Die Partikel bilden eine horizontale Linie. Die Linie *ist* der Timer. Die Linie *ist* Particle.

**Die Physik:**

```typescript
// Konvergenz
const convergence = {
  // Alle Partikel werden zum Zentrum gezogen
  attract: (particle: Particle, center: Point, progress: number) => {
    const easeProgress = easeInOutCubic(progress);
    const force = 0.05 + (easeProgress * 0.15);

    particle.vx += (center.x - particle.x) * force;
    particle.vy += (center.y - particle.y) * force;

    // Abbremsen kurz vor dem Ziel (organisch!)
    if (distance(particle, center) < 50) {
      particle.vx *= 0.9;
      particle.vy *= 0.9;
    }
  }
};
```

**Das Gefühl:** Die vielen kleinen Momente werden eins. Das ist der Timer. Das ist dein Fokus.

---

### Akt 8: Der Übergang (13:00 – 13:50)

**Was passiert:**

1. **13:00 – 13:50** – Die Partikel-Linie transformiert sich in den echten Timer. Die UI faded ein. Sanft. Nahtlos. Als wäre sie immer da gewesen.

**Technisch:**

```typescript
// Nahtloser Übergang
const transition = {
  // Intro faded out
  intro: {
    opacity: { from: 1, to: 0, duration: 0.5 }
  },
  // App faded in
  app: {
    opacity: { from: 0, to: 1, duration: 0.5, delay: 0.3 }
  }
};
```

**Wichtig:** Die Partikel im Intro werden zu den Partikeln in der App. Sie verschwinden nicht – sie sind angekommen.

---

## Gesamttiming

| Zeit | Akt | Dauer |
|------|-----|-------|
| 0:00 – 2:00 | Stille | 2.0s |
| 2:00 – 3:50 | Genesis (Partikel erscheint) | 1.5s |
| 3:50 – 6:50 | Erste Wahrheit | 3.0s |
| 6:50 – 9:00 | Zweite Wahrheit | 2.5s |
| 9:00 – 10:50 | Zellteilung | 1.5s |
| 10:50 – 11:50 | Einladung ("Bereit?") | 1.0s |
| 11:50 – 13:00 | Konvergenz | 1.0s |
| 13:00 – 13:50 | Übergang zur App | 0.5s |

**Gesamt: ~14 Sekunden**

---

## Interaktion

### Skip-Verhalten

| Aktion | Ergebnis |
|--------|----------|
| **Click/Tap** (vor Akt 5) | Springt zu Akt 7 (Konvergenz), dann Übergang |
| **Click/Tap** (ab Akt 5) | Springt direkt zum Übergang |
| **Space/Enter** | Wie Click |
| **Esc** | Wie Click |

**Wichtig:**
- Kein sichtbarer Skip-Button
- Der Skip ist für Wiederkehrer (z.B. nach Cache-Clear)
- Die meisten Menschen werden es ansehen – weil es schön ist

### Wiederholung

- Das Intro erscheint **nur beim allerersten Start**
- LocalStorage: `particle-intro-seen: true`
- Im Settings: "Intro erneut ansehen" (für Fans)

---

## Sound (Optional, Phase 2)

| Moment | Sound |
|--------|-------|
| Genesis (Partikel erscheint) | Ein einzelner, warmer Ton. Wie eine Glocke in der Ferne. |
| Zellteilung | Sanftes, organisches "Plopp". Kaum hörbar. |
| Konvergenz | Ein tiefes Summen, das lauter wird. |
| Übergang | Stille. |

**Prinzip:** Weniger ist mehr. Im Zweifel: Kein Sound.

---

## Responsive Verhalten

### Desktop (>1024px)
- Text: 24px
- Partikel: 6px
- Drift-Radius: 80px

### Tablet (768px – 1024px)
- Text: 20px
- Partikel: 5px
- Drift-Radius: 60px

### Mobile (<768px)
- Text: 18px
- Partikel: 4px
- Drift-Radius: 40px

---

## Accessibility

- **Reduced Motion:** Bei `prefers-reduced-motion: reduce` → Vereinfachte Version ohne Zellteilung, nur Fade-In des Textes und direkter Übergang
- **Screen Reader:** Kompletter Text wird vorgelesen, dann "Particle App geladen"
- **Keyboard:** Space/Enter/Esc zum Überspringen

---

## Erfolgsmetriken

| Metrik | Ziel | Messung |
|--------|------|---------|
| Completion Rate | >70% sehen bis zum Ende | Anonymer Counter |
| Skip Rate | <30% | Anonymer Counter |
| Screenshot-Shares | Qualitativ | Social Media Monitoring |
| Erwähnungen "First impression" | Qualitativ | Reviews, Feedback |

---

## Replay & Teilen

> *"Ein Kunstwerk, das man nur einmal sehen kann, ist ein Kunstwerk im Keller."*

Das Intro ist zu schön, um es nur einmal zu zeigen. Es ist ein virales Asset – etwas, das Menschen ihren Freunden zeigen, auf Social Media teilen, und als Empfehlung weitergeben.

### Drei Wege zum Replay

#### 1. Command Palette (Offensichtlich)

```
⌘K → "Intro abspielen" / "Replay intro"
```

**Für:** Den Moment, wenn jemand fragt *"Was ist Particle eigentlich?"*

Direkt. Einfach. Keine Suche nötig.

#### 2. Easter Egg (Versteckt & Magisch)

```
Tippe "particle" auf der Tastatur
(ohne Fokus in einem Eingabefeld)
```

**Für:** Entdecker. Der Moment, wenn jemand auf Twitter schreibt: *"OMG, tippt mal 'particle' in der App..."*

Konami-Code-Style. Undokumentiert. Ein Geheimnis, das man weitererzählt.

**Technisch:**
```typescript
// Easter Egg Listener
const EASTER_EGG = 'particle';
let buffer = '';

document.addEventListener('keydown', (e) => {
  // Ignorieren wenn in Input/Textarea
  if (e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement) return;

  buffer += e.key.toLowerCase();
  buffer = buffer.slice(-EASTER_EGG.length);

  if (buffer === EASTER_EGG) {
    triggerIntro();
    buffer = '';
  }
});
```

#### 3. Record Mode (Für Creator)

```
⌘K → "Intro aufnehmen" / "Record intro"
```

**Für:** Content Creator, die das Intro auf TikTok, Instagram oder Twitter teilen wollen.

**Was ist anders:**
- Startet im echten Fullscreen (nicht Browser-Fullscreen)
- Am Ende: Dezentes Particle-Logo + URL (3 Sekunden)
- Optimierte Versionen:
  - **16:9** – YouTube, Twitter
  - **9:16** – TikTok, Instagram Stories, Reels
  - **1:1** – Instagram Feed

**Das Outro:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                                                             │
│                         particle                            │
│                                                             │
│                      useparticle.com                        │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Minimalistisch. Kein Call-to-Action. Nur der Name und die URL. Das Intro spricht für sich.

### Erfolgsmetriken (Replay)

| Metrik | Ziel | Messung |
|--------|------|---------|
| Replay Rate | >10% spielen es erneut ab | Event Tracking |
| Easter Egg Discovery | >5% entdecken es | Event Tracking |
| Social Shares | Qualitativ | Social Media Monitoring |
| "particle" Erwähnungen | Qualitativ | Twitter/TikTok Search |

---

## Die Prüffrage

Bevor wir shippen:

> *"Würde Steve Jobs nicken?"*

> *"Würde Jony Ive sagen: Das ist schön?"*

> *"Macht es Gänsehaut?"*

Wenn dreimal ja: Ship it.

---

*"Große Werke entstehen nicht aus großen Momenten. Sie entstehen aus vielen kleinen."*

*Das ist Particle.*
