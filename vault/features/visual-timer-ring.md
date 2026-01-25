# Feature: Visual Timer (Progress Ring)

**Datum:** 2025-01-25
**Status:** Konzept
**Priorität:** Hoch
**Zielgruppe:** ADHD-Nutzer, visuelle Lerner

---

## Vision

> Zeit ist für viele Menschen unsichtbar. Der Visual Timer macht sie greifbar.

Für Menschen mit ADHD ist "Time Blindness" ein Kernsymptom. Zahlen wie "14:32" sind abstrakt und erfordern kognitive Verarbeitung. Ein visueller Ring hingegen kommuniziert sofort: "So viel ist noch übrig."

**Das Ziel:** Zeit fühlbar machen, nicht nur lesbar.

---

## Das Problem

### Time Blindness bei ADHD
- Zahlen erfordern aktive Interpretation
- "14 Minuten" fühlen sich gleich an wie "4 Minuten"
- Keine intuitive Dringlichkeitswahrnehmung
- Ständiges mentales Rechnen: "Wie viel ist das noch?"

### Die Lösung
Ein **Progress Ring**, der visuell schrumpft:
- Sofortiges Verstehen ohne Nachdenken
- Natürliche Dringlichkeit durch visuelle Verkleinerung
- "At a glance" Zeitwahrnehmung

---

## Design-Konzept

### Progress Ring mit integriertem Countdown

```
            ╭────────────────────╮
           ╱                      ╲
          ╱   ┌──────────────┐     ╲
         │    │              │      │
         │    │    14:32     │      │
         │    │              │      │
         │    └──────────────┘      │
          ╲                        ╱
           ╲ ════════════════════ ╱
            ╰────────────────────╯
                     ↑
            depletierte Sektion
```

### Warum Progress Ring (nicht Pie-Chart)

| Aspekt | Pie-Chart | Progress Ring |
|--------|-----------|---------------|
| Ästhetik | Gefüllt, klobig | Minimal, elegant |
| Particle-Fit | Fremd | Passt zur Dot-Sprache |
| Countdown-Integration | Schwierig | Natürlich im Zentrum |
| Premium-Gefühl | Nein | Ja (Apple Watch-Style) |

---

## Zwei Display-Modi

### Modus 1: Classic (Default)

```
                 25:00
                  min
```

- Aktuelles Verhalten
- Große, zentrale Zahlen
- Für Nutzer, die Zahlen bevorzugen

### Modus 2: Visual Timer

```
            ╭────────────────────╮
           ╱ ░░░░░░░░░░░░░░░░░░░░ ╲
          ╱ ░░                  ░░ ╲
         │ ░░      14:32       ░░  │
         │ ░░                  ░░  │
          ╲ ░░                ░░  ╱
           ╲ ░░░░░░░░░░░░░░░░░░ ╱
            ╰══════════════════╯
```

- Ring zeigt verbleibende Zeit visuell
- Countdown kleiner, aber gut lesbar im Zentrum
- Ring depletes im Uhrzeigersinn (12 Uhr → 12 Uhr)

---

## Technische Spezifikation

### Ring-Geometrie

```typescript
interface RingConfig {
  diameter: 200,        // px
  strokeWidth: 6,       // px
  startAngle: -90,      // Grad (12 Uhr Position)
  direction: 'clockwise',
}
```

### SVG-Struktur

```tsx
<svg viewBox="0 0 200 200">
  {/* Background Ring (full circle, dimmed) */}
  <circle
    cx="100" cy="100" r="94"
    fill="none"
    stroke="rgba(255,255,255,0.1)"
    strokeWidth="6"
  />

  {/* Milestone Markers (25%, 50%, 75%) */}
  {[0.25, 0.5, 0.75].map((milestone) => {
    const angle = -90 + (milestone * 360); // Start from 12 o'clock
    const x = 100 + 94 * Math.cos((angle * Math.PI) / 180);
    const y = 100 + 94 * Math.sin((angle * Math.PI) / 180);
    return (
      <circle
        key={milestone}
        cx={x} cy={y} r="2"
        fill="rgba(255,255,255,0.3)"
      />
    );
  })}

  {/* Progress Ring (animated) */}
  <motion.circle
    cx="100" cy="100" r="94"
    fill="none"
    stroke="rgba(255,255,255,0.9)"
    strokeWidth={strokeWidth}  // Animated: 6 → 7 → 8 in final minutes
    strokeLinecap="round"
    strokeDasharray={circumference}
    strokeDashoffset={offset}
    transform="rotate(-90 100 100)"
    animate={{ strokeDashoffset: offset, strokeWidth }}
    transition={{ duration: 0.3, ease: "linear" }}
  />
</svg>
```

### Final Minutes Intensivierung

```typescript
// Berechnung der Intensität basierend auf verbleibender Zeit
function getRingIntensity(timeRemaining: number): {
  strokeWidth: number;
  opacity: number;
  glow: boolean;
  pulsing: boolean;
} {
  if (timeRemaining <= 60) {
    // < 1 min: Pulsing
    return { strokeWidth: 8, opacity: 1, glow: true, pulsing: true };
  }
  if (timeRemaining <= 120) {
    // < 2 min: Sehr intensiv
    return { strokeWidth: 8, opacity: 1, glow: true, pulsing: false };
  }
  if (timeRemaining <= 300) {
    // < 5 min: Intensiv
    return { strokeWidth: 7, opacity: 1, glow: false, pulsing: false };
  }
  // Normal
  return { strokeWidth: 6, opacity: 0.9, glow: false, pulsing: false };
}
```

### Animation

```typescript
// Berechnung des Offsets
const circumference = 2 * Math.PI * radius;
const progress = timeRemaining / totalDuration;
const offset = circumference * (1 - progress);

// Framer Motion für smooth updates
<motion.circle
  animate={{ strokeDashoffset: offset }}
  transition={{ duration: 0.3, ease: "linear" }}
/>
```

---

## Visuelle Zustände

### 1. Idle (Timer nicht gestartet)

```
Ring: 100% gefüllt (voller Kreis)
Farbe: Weiß, normale Opacity
Countdown: Zeigt volle Dauer
```

### 2. Running (Timer läuft)

```
Ring: Depletes smooth im Uhrzeigersinn
Farbe: Weiß
Animation: Kontinuierlich (nicht chunky)
```

### 3. Paused

```
Ring: Gestoppt bei aktuellem Stand
Animation: Ring pulsiert subtil (breathing)
Countdown: Zeigt verbleibende Zeit
```

### 4. Final Minutes (< 5 min)

```
Ring: Wird dünner oder intensiver
Optional: Subtiler Farbshift (wärmer)
Countdown: Bleibt gleich
```

### 5. Overflow (> 0:00)

```
Ring: Beginnt sich wieder zu füllen (andere Richtung)
      ODER pulsiert rhythmisch
Farbe: Leicht anders (z.B. höhere Opacity)
Countdown: Zeigt +00:00 aufwärts
```

### 6. Celebration (Session Complete)

```
Ring: Kurze "Complete" Animation
      → Flash/Glow → Fade to full
Countdown: Zeit
```

---

## Größen & Proportionen

### Visual Timer Modus

```
┌─────────────────────────────────────────┐
│                                         │
│         ╭──────────────────╮            │
│        ╱                    ╲           │
│       │                      │          │
│       │       14:32          │  ← 32px  │
│       │                      │          │
│        ╲                    ╱           │
│         ╰──────────────────╯            │
│              ← 200px →                  │
│                                         │
│         Endet um 14:35                  │  ← End Time (wenn aktiv)
│                                         │
└─────────────────────────────────────────┘
```

### Responsive Verhalten

| Viewport | Ring-Größe | Countdown-Font |
|----------|------------|----------------|
| Mobile (<640px) | 180px | 28px |
| Desktop (>640px) | 200px | 32px |

---

## Komponenten-Architektur

### Neue Komponenten

```
src/components/timer/
├── TimerDisplay.tsx        # Bestehend (erweitern)
├── ProgressRing.tsx        # NEU: SVG Ring Komponente
└── VisualTimerDisplay.tsx  # NEU: Ring + Countdown kombiniert
```

### ProgressRing Props

```typescript
interface ProgressRingProps {
  /** Progress 0-1 (1 = full, 0 = empty) */
  progress: number;
  /** Ring diameter in px */
  size?: number;
  /** Stroke width in px */
  strokeWidth?: number;
  /** Whether timer is running */
  isRunning?: boolean;
  /** Whether timer is paused (show breathing animation) */
  isPaused?: boolean;
  /** Whether in overflow mode */
  isOverflow?: boolean;
  /** Children rendered in center (countdown) */
  children?: React.ReactNode;
}
```

### TimerDisplay Integration

```typescript
// In TimerDisplay.tsx
const { visualTimerEnabled } = useTimerSettingsContext();

return visualTimerEnabled ? (
  <VisualTimerDisplay
    timeRemaining={timeRemaining}
    totalDuration={sessionDuration}
    isRunning={isRunning}
    // ... other props
  />
) : (
  <ClassicTimerDisplay
    timeRemaining={timeRemaining}
    // ... current implementation
  />
);
```

---

## Settings Integration

### Neues Setting

```typescript
// In TimerSettingsContext.tsx
const VISUAL_TIMER_KEY = 'particle_visual_timer';
const DEFAULT_VISUAL_TIMER = false;

interface TimerSettingsContextValue {
  // ... existing
  visualTimerEnabled: boolean;
  setVisualTimerEnabled: (enabled: boolean) => void;
}
```

### Settings UI

```
Timer Display
┌───────────────────────────────────────┐
│  ◷  Visual Timer                      │
│     Show progress ring around         │
│     countdown                    [○]  │
└───────────────────────────────────────┘
```

**Beschreibung:** "Show progress ring around countdown"
**Icon:** Clock oder CircleDot
**Default:** Off (Classic mode)

---

## Animationen

### Ring Depletion

```typescript
// Smooth linear animation
transition: {
  strokeDashoffset: {
    duration: 1,      // 1 Sekunde pro Update
    ease: "linear"
  }
}
```

### Pause Breathing

```typescript
// Subtiles Pulsieren wenn pausiert
animate: {
  opacity: [0.9, 0.7, 0.9],
  scale: [1, 1.01, 1],
}
transition: {
  duration: 2,
  repeat: Infinity,
  ease: "easeInOut"
}
```

### Completion Flash

```typescript
// Kurzer Glow bei Fertigstellung
animate: {
  opacity: [1, 0.5, 1],
  strokeWidth: [6, 8, 6],
}
transition: {
  duration: 0.5,
}
```

---

## Accessibility

### Screen Reader

```tsx
<svg role="progressbar"
     aria-valuenow={timeRemaining}
     aria-valuemin={0}
     aria-valuemax={totalDuration}
     aria-label={`${minutes} minutes ${seconds} seconds remaining`}
>
```

### Reduced Motion

```typescript
const prefersReducedMotion = useReducedMotion();

// Bei reduced motion: Keine smooth animation
// Stattdessen: Direkte Sprünge
transition: prefersReducedMotion
  ? { duration: 0 }
  : { duration: 1, ease: "linear" }
```

### Farbenblindheit

- Keine Farb-basierte Information
- Nur Helligkeit/Opacity für Zustände
- Kontrast WCAG AA+ konform

---

## Edge Cases

### 1. Sehr kurze Sessions (< 5 min)
- Ring depletes schneller
- Funktioniert normal

### 2. Sehr lange Sessions (> 60 min)
- Ring depletes langsamer
- Millisekunden-Precision nicht nötig

### 3. Zeit-Anpassung während Pause
- Ring springt zu neuem Wert
- Keine Animation (direkt)

### 4. One-Off Duration (Smart Input)
- Ring nutzt custom Duration als 100%
- Funktioniert transparent

### 5. Mode Switch (Work → Break)
- Ring resettet zu 100%
- Smooth transition

---

## Implementierungs-Phasen

### Phase 1: Core Ring
- [ ] ProgressRing.tsx Komponente erstellen
- [ ] SVG mit strokeDasharray Animation
- [ ] Basic Props (progress, size, strokeWidth)
- [ ] Milestone-Marker (25%, 50%, 75%)

### Phase 2: Timer Integration
- [ ] VisualTimerDisplay.tsx Komponente
- [ ] Countdown im Zentrum des Rings
- [ ] TimerDisplay Conditional Rendering (Classic vs Visual)

### Phase 3: Settings
- [ ] visualTimerEnabled Setting in Context
- [ ] VisualTimerSettings.tsx Component
- [ ] Settings UI Integration

### Phase 4: Final Minutes Intensivierung
- [ ] getRingIntensity() Funktion
- [ ] strokeWidth Animation (6 → 7 → 8)
- [ ] Opacity-Steigerung
- [ ] Subtle Glow-Effekt (< 2 min)
- [ ] Pulsing Animation (< 1 min)

### Phase 5: Polish
- [ ] Pause Breathing Animation
- [ ] Overflow Handling (Ring füllt sich wieder)
- [ ] Celebration Animation
- [ ] Responsive Sizing (Mobile/Desktop)

### Phase 6: Accessibility
- [ ] ARIA Attributes (progressbar role)
- [ ] Reduced Motion Support
- [ ] Screen Reader Testing

---

## Definition of Done

- [ ] Progress Ring zeigt verbleibende Zeit visuell
- [ ] Countdown ist im Zentrum des Rings lesbar
- [ ] Ring depletes smooth im Uhrzeigersinn
- [ ] Milestone-Marker bei 25%, 50%, 75%
- [ ] Final Minutes Intensivierung (< 5 min → < 2 min → < 1 min)
- [ ] Setting zum Aktivieren/Deaktivieren
- [ ] Funktioniert für Work UND Break Sessions
- [ ] Overflow-Modus wird korrekt dargestellt
- [ ] Pause zeigt Breathing Animation
- [ ] Responsive auf Mobile und Desktop
- [ ] Accessibility: ARIA, Reduced Motion
- [ ] TypeScript strict mode
- [ ] Keine Performance-Regression

---

## Entscheidungen

### Milestone-Marker: JA

Kleine Punkte bei 25%, 50%, 75% auf dem Ring:

```
            ╭────────────────────╮
           ╱          ·          ╲      ← 25% Marker
          ╱                       ╲
         ·                         ·    ← 50% Marker (links), 75% (rechts wäre hier)
         │        14:32            │
         │                         │
          ╲                       ╱
           ╲                     ╱
            ╰────────────────────╯
```

**Implementierung:**
- Kleine Kreise (2-3px) auf dem Ring-Pfad
- Opacity: 0.3 (subtle, nicht dominant)
- Helfen bei der Orientierung: "Bin ich im ersten oder zweiten Viertel?"

### Final Minutes Intensivierung: JA (Monochrom)

In den letzten 5 Minuten wird der Ring intensiver, aber bleibt monochrom:

| Zeit | Effekt |
|------|--------|
| > 5 min | Normal: opacity 0.9, strokeWidth 6px |
| < 5 min | Intensiv: opacity 1.0, strokeWidth 7px |
| < 2 min | Sehr intensiv: strokeWidth 8px, subtle glow |
| < 1 min | Pulsing beginnt (breathing animation) |

**Keine Farbe** – nur Helligkeit, Stärke und Animation kommunizieren Dringlichkeit.

### Audio-Cue Halbzeit: NEIN

Nicht implementieren. Unnötige Ablenkung.

---

## Referenzen

- **LlamaLife:** Pie-Chart Timer (Inspiration)
- **Apple Watch:** Activity Rings (Ästhetik)
- **Time Timer:** Klassischer visueller Timer (Konzept)
- **Pomodoro Apps:** Diverse Ring-Implementierungen

---

*"Zeit sichtbar machen – für alle, die sie nicht fühlen können."*
