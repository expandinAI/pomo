---
type: story
status: backlog
priority: p0
effort: 3
feature: year-view
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [year-view, animation, wave, wow-moment, p0]
---

# POMO-115: Einblend-Animation – Der Wow-Moment

## User Story

> Als **Particle-Nutzer**
> möchte ich **beim Öffnen der Year View eine beeindruckende Animation sehen**,
> damit **der Moment der Offenbarung meines Lebenswerks magisch ist**.

## Kontext

Link zum Feature: [[features/year-view]]

Abhängigkeit: [[stories/backlog/POMO-111-year-grid]]

Dies ist DER emotionale Moment. Du drückst `G Y` und siehst: Nichts. Dann, wie eine Welle, erscheinen die Punkte von links nach rechts. Woche für Woche enthüllt sich dein Jahr. Am Ende siehst du das vollständige Bild und denkst: *"Wow."*

**Das ist keine Animation. Das ist Magie.**

## Akzeptanzkriterien

### Initiale Animation
- [ ] **Given** ich öffne die Year View, **When** die Seite lädt, **Then** erscheint das Grid mit einer Wellen-Animation
- [ ] **Given** die Animation startet, **When** ich zusehe, **Then** erscheinen die Spalten (Wochen) von links nach rechts
- [ ] **Given** die Animation, **When** sie läuft, **Then** dauert sie ca. 600-800ms total
- [ ] **Given** die Animation, **When** sie endet, **Then** sind alle Punkte sichtbar

### Timing
- [ ] **Given** die Page ist geladen, **When** die Animation startet, **Then** beginnt sie nach 100ms Delay (Zeit für Layout)
- [ ] **Given** 52 Wochen-Spalten, **When** die Animation läuft, **Then** hat jede Spalte ~12ms Delay zur vorherigen
- [ ] **Given** die Summary Stats, **When** das Grid fertig animiert ist, **Then** faden sie mit 200ms Delay ein

### Reduced Motion
- [ ] **Given** `prefers-reduced-motion: reduce`, **When** ich die View öffne, **Then** erscheint alles sofort (keine Animation)

### Jahr-Wechsel
- [ ] **Given** ich wechsle das Jahr, **When** das neue Grid erscheint, **Then** spielt die Wellen-Animation erneut

## Technische Details

### Animation Orchestration

```typescript
// src/components/year-view/YearGridAnimated.tsx

interface YearGridAnimatedProps {
  data: YearViewData;
  weekStartsOnMonday: boolean;
  onCellHover: (cell: GridCell | null) => void;
}

export function YearGridAnimated(props: YearGridAnimatedProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isAnimating, setIsAnimating] = useState(true);

  // Animation Variants für Framer Motion
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.012, // 12ms zwischen Spalten
      },
    },
  };

  const columnVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.15,
        ease: 'easeOut',
      },
    },
  };

  if (prefersReducedMotion) {
    // Keine Animation
    return <YearGrid {...props} />;
  }

  return (
    <motion.div
      className="year-grid-animated"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onAnimationComplete={() => setIsAnimating(false)}
    >
      {weeks.map((week, weekIndex) => (
        <motion.div
          key={weekIndex}
          className="grid-column"
          variants={columnVariants}
        >
          {week.map((cell) => (
            <YearGridCell
              key={cell.date.toISOString()}
              cell={cell}
              onHover={props.onCellHover}
            />
          ))}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Summary Fade-In nach Grid

```typescript
// src/components/year-view/YearView.tsx

export function YearView() {
  const [gridAnimationComplete, setGridAnimationComplete] = useState(false);

  return (
    <div className="year-view">
      <YearGridAnimated
        data={data}
        onAnimationComplete={() => setGridAnimationComplete(true)}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={gridAnimationComplete ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <YearSummary summary={data.summary} />
      </motion.div>
    </div>
  );
}
```

### Animation Timeline

```
0ms     100ms    200ms    400ms    600ms    800ms    1000ms
|        |        |        |        |        |        |
         [=== Grid Wave Animation ===========]
                                              [Summary]
                                              [ Fade  ]
```

**Breakdown:**
- 0-100ms: Initial delay (Layout settles)
- 100-750ms: Grid columns stagger in (52 × 12ms = 624ms + 150ms last column)
- 800-1000ms: Summary fades in

### CSS für Animation Baseline

```css
/* src/components/year-view/year-grid-animated.css */

.year-grid-animated {
  display: flex;
  gap: 3px;
}

.grid-column {
  display: flex;
  flex-direction: column;
  gap: 3px;
  will-change: opacity, transform;
}

/* Subtle glow während Animation für Extra-Magic */
.grid-column[data-animating="true"] .grid-cell {
  filter: brightness(1.1);
}
```

### Performance Optimierung

```typescript
// Wichtig: GPU-Acceleration erzwingen

const columnVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    // GPU-accelerated properties
    transform: 'scale(0.8)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    transform: 'scale(1)',
    transition: {
      duration: 0.15,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
    },
  },
};
```

### Betroffene Dateien

```
src/
└── components/
    └── year-view/
        ├── YearGridAnimated.tsx    # Animierte Version
        ├── year-grid-animated.css
        └── YearView.tsx            # Integration
```

## UI/UX

### Die Animation visualisiert

```
Frame 0 (0ms):
[                                                              ]

Frame 1 (100ms):
[█                                                             ]

Frame 2 (200ms):
[████                                                          ]

Frame 3 (300ms):
[████████                                                      ]

Frame 4 (400ms):
[████████████████                                              ]

Frame 5 (500ms):
[██████████████████████████                                    ]

Frame 6 (600ms):
[████████████████████████████████████████                      ]

Frame 7 (700ms):
[████████████████████████████████████████████████████████████  ]

Frame 8 (800ms - Complete):
[████████████████████████████████████████████████████████████████]

Frame 9 (900ms):
                    1,247 Partikel · 521h · 23 Tage
                    ↑ Summary fades in
```

### Der emotionale Effekt

1. **Anticipation** (0-100ms): Kurze Pause baut Spannung auf
2. **Reveal** (100-750ms): Das Jahr enthüllt sich Woche für Woche
3. **Completion** (750ms): Das volle Bild erscheint
4. **Confirmation** (800-1000ms): Die Zahlen bestätigen das Gesehene

### Variationen (für später)

- **Schnellere Animation** bei wiederholtem Besuch (returning user)
- **Celebration Mode** bei besonders gutem Jahr (Confetti?)
- **Sound** bei Animation (optional, Endel-inspired)

## Testing

### Manuell zu testen
- [ ] Animation startet beim Öffnen der View
- [ ] Welle geht von links nach rechts
- [ ] Timing fühlt sich "richtig" an (~600-800ms)
- [ ] Summary faded nach Grid ein
- [ ] Reduced Motion: Keine Animation, alles sofort
- [ ] Jahr-Wechsel: Animation spielt erneut
- [ ] Performance: Keine Frame-Drops (60fps)

### Automatisierte Tests

```typescript
describe('YearGridAnimated', () => {
  it('animates columns from left to right', async () => {
    render(<YearGridAnimated data={mockData} />);

    // Initial: nichts sichtbar
    const columns = screen.getAllByTestId('grid-column');
    expect(columns[0]).toHaveStyle({ opacity: '0' });

    // Nach Animation: alles sichtbar
    await waitFor(() => {
      expect(columns[0]).toHaveStyle({ opacity: '1' });
    }, { timeout: 1000 });
  });

  it('skips animation with reduced motion', () => {
    // Mock prefers-reduced-motion
    mockReducedMotion(true);

    render(<YearGridAnimated data={mockData} />);

    // Sofort sichtbar
    const columns = screen.getAllByTestId('grid-column');
    expect(columns[0]).toHaveStyle({ opacity: '1' });
  });

  it('replays animation on year change', async () => {
    const { rerender } = render(<YearGridAnimated data={mockData2024} />);

    await waitForAnimation();

    // Jahr wechseln
    rerender(<YearGridAnimated data={mockData2025} />);

    // Animation startet erneut
    const columns = screen.getAllByTestId('grid-column');
    expect(columns[0]).toHaveStyle({ opacity: '0' });
  });
});
```

### Performance Test

```typescript
it('maintains 60fps during animation', async () => {
  const frameDrops = await measureFrameRate(() => {
    render(<YearGridAnimated data={mockLargeData} />);
  });

  expect(frameDrops).toBeLessThan(5);
});
```

## Definition of Done

- [ ] Wellen-Animation implementiert (links nach rechts)
- [ ] Timing: ~600-800ms total
- [ ] Stagger: ~12ms zwischen Spalten
- [ ] Summary fade-in nach Grid
- [ ] `prefers-reduced-motion` Support
- [ ] Animation bei Jahr-Wechsel
- [ ] Performance: 60fps, keine Frame-Drops
- [ ] GPU-Acceleration (transform, opacity)
- [ ] Tests geschrieben & grün
- [ ] Code reviewed

## Notizen

**Warum diese Animation?**
- Erzählt eine Geschichte: Zeit vergeht von links (Januar) nach rechts (Dezember)
- Baut Spannung auf: Was kommt als nächstes?
- Vermeidet "Daten-Dump": Nicht alles auf einmal
- Respektiert die Arbeit: Jede Woche bekommt ihren Moment

**Performance-Tipps:**
- Nur `opacity` und `transform` animieren
- `will-change` für GPU-Acceleration
- Keine Layout-Triggers (width, height, etc.)
- Stagger mit CSS-only wäre noch performanter (aber weniger flexibel)

**Alternatives Timing (falls zu langsam):**
- 8ms stagger = ~500ms total
- 6ms stagger = ~400ms total

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
