---
type: story
status: backlog
priority: p0
effort: 2
feature: year-view
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [year-view, peak-day, glow, celebration, p0]
---

# POMO-116: Peak Day Highlight – Dein strahlendster Tag

## User Story

> Als **Particle-Nutzer**
> möchte ich **meinen produktivsten Tag des Jahres besonders hervorgehoben sehen**,
> damit **ich diesen Moment des Stolzes feiern kann**.

## Kontext

Link zum Feature: [[features/year-view]]

Abhängigkeiten:
- [[stories/backlog/POMO-110-year-view-data]]
- [[stories/backlog/POMO-111-year-grid]]
- [[stories/backlog/POMO-112-year-tooltip]]

Der Peak Day ist der Höhepunkt deines Jahres. Der Tag, an dem du am meisten geschaffen hast. Er verdient besondere Aufmerksamkeit – einen sanften Glow, der sagt: *"Das war dein bester Tag. Sei stolz."*

## Akzeptanzkriterien

### Visueller Highlight
- [ ] **Given** das Grid wird gerendert, **When** der Peak Day angezeigt wird, **Then** hat er einen weißen Glow-Effekt
- [ ] **Given** der Glow, **When** ich ihn sehe, **Then** ist er subtil aber erkennbar (nicht übertrieben)
- [ ] **Given** die Grid-Animation, **When** der Peak Day erscheint, **Then** erscheint der Glow mit leichtem Delay

### Tooltip Integration
- [ ] **Given** ich hovere über den Peak Day, **When** der Tooltip erscheint, **Then** zeigt er "🏆 Dein produktivster Tag"
- [ ] **Given** der Tooltip, **When** ich ihn sehe, **Then** steht die Trophäe am Ende (nach anderen Infos)

### Mehrere Peak Days
- [ ] **Given** zwei oder mehr Tage mit gleichem Maximum, **When** ich das Grid sehe, **Then** ist nur der erste (chronologisch) als Peak markiert

### Interaktion
- [ ] **Given** ich hovere über den Peak Day, **When** der Hover aktiv ist, **Then** verstärkt sich der Glow leicht

## Technische Details

### Peak Day in Data

```typescript
// Bereits in POMO-110 vorbereitet:

interface YearViewDay {
  // ...
  isPeakDay: boolean;  // Markiert den produktivsten Tag
}

interface YearViewData {
  // ...
  personalMax: number; // Höchste Partikel-Anzahl
  peakDate: Date;      // Datum des Peak Days
}
```

### Peak Day Styling

```typescript
// src/components/year-view/YearGridCell.tsx

export function YearGridCell({ cell, onHover }: YearGridCellProps) {
  return (
    <motion.div
      className={cn(
        "grid-cell",
        cell.isPeakDay && "peak-day"
      )}
      style={{
        backgroundColor: `rgba(255, 255, 255, ${cell.brightness})`,
      }}
      whileHover={cell.isPeakDay ? { scale: 1.4 } : { scale: 1.3 }}
      // ...
    />
  );
}
```

### CSS Glow Effect

```css
/* src/components/year-view/year-grid.css */

.grid-cell.peak-day {
  /* Subtiler weißer Glow */
  box-shadow:
    0 0 8px rgba(255, 255, 255, 0.5),
    0 0 16px rgba(255, 255, 255, 0.3),
    0 0 24px rgba(255, 255, 255, 0.1);

  /* Leichte Animation für "lebendigen" Effekt */
  animation: peak-glow 3s ease-in-out infinite;
}

@keyframes peak-glow {
  0%, 100% {
    box-shadow:
      0 0 8px rgba(255, 255, 255, 0.5),
      0 0 16px rgba(255, 255, 255, 0.3),
      0 0 24px rgba(255, 255, 255, 0.1);
  }
  50% {
    box-shadow:
      0 0 10px rgba(255, 255, 255, 0.6),
      0 0 20px rgba(255, 255, 255, 0.4),
      0 0 30px rgba(255, 255, 255, 0.15);
  }
}

.grid-cell.peak-day:hover {
  /* Verstärkter Glow bei Hover */
  box-shadow:
    0 0 12px rgba(255, 255, 255, 0.7),
    0 0 24px rgba(255, 255, 255, 0.5),
    0 0 36px rgba(255, 255, 255, 0.2);
}

/* Reduced Motion: Keine Animation, aber Glow bleibt */
@media (prefers-reduced-motion: reduce) {
  .grid-cell.peak-day {
    animation: none;
  }
}
```

### Glow Animation Delay (nach Grid-Animation)

```typescript
// In YearGridAnimated.tsx

const cellVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: (isPeakDay: boolean) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
    // Peak Day: Glow startet nach Cell-Animation
    ...(isPeakDay && {
      transitionEnd: {
        boxShadow: '0 0 8px rgba(255, 255, 255, 0.5), ...',
      },
    }),
  }),
};
```

### Tooltip Peak Badge

```typescript
// In YearTooltip.tsx (bereits in POMO-112 vorbereitet)

{isPeakDay && (
  <div className="tooltip-peak">
    🏆 Dein produktivster Tag
  </div>
)}
```

### Betroffene Dateien

```
src/
└── components/
    └── year-view/
        ├── YearGridCell.tsx    # Peak Day Class
        ├── year-grid.css       # Glow Styling
        └── YearTooltip.tsx     # Peak Badge (bereits)
```

## UI/UX

### Der Glow-Effekt

```
Normaler Tag:          Peak Day:
┌────┐                 ┌────┐
│ ▓▓ │                 │ ░░ │ ← Glow um den Punkt
│ ▓▓ │                 │ ●● │ ← Hellster Punkt (1.0)
└────┘                 │ ░░ │
                       └────┘
                       (mit sanftem Pulsieren)
```

### Visual Details

| Eigenschaft | Normaler Tag | Peak Day |
|-------------|--------------|----------|
| Brightness | relativ (0.15-1.0) | 1.0 (maximum) |
| Glow | keiner | 3-Layer weißer Glow |
| Animation | keine | Sanftes Pulsieren (3s) |
| Hover Scale | 1.3 | 1.4 |

### Die subtile Magie

Der Glow soll:
- ✅ Erkennbar sein, wenn man hinsieht
- ✅ Nicht vom Rest ablenken
- ✅ Sich "besonders" anfühlen
- ❌ Nicht wie ein "Error" oder "Warning" aussehen
- ❌ Nicht übertrieben blinken

## Testing

### Manuell zu testen
- [ ] Peak Day hat sichtbaren Glow
- [ ] Glow pulsiert sanft
- [ ] Nur ein Peak Day im Grid (auch wenn mehrere Tage gleiches Max haben)
- [ ] Tooltip zeigt 🏆 Badge
- [ ] Hover verstärkt Glow
- [ ] Reduced Motion: Kein Pulsieren, aber statischer Glow
- [ ] Glow erscheint nach Grid-Animation (nicht vorher)

### Automatisierte Tests

```typescript
describe('Peak Day Highlight', () => {
  it('applies peak-day class to peak day cell', () => {
    render(<YearGrid data={mockDataWithPeak} />);

    const peakCell = screen.getByLabelText(/23. März 2025/);
    expect(peakCell).toHaveClass('peak-day');
  });

  it('shows trophy in tooltip for peak day', async () => {
    render(<YearView data={mockDataWithPeak} />);

    const peakCell = screen.getByLabelText(/23. März 2025/);
    fireEvent.mouseEnter(peakCell);

    await waitFor(() => {
      expect(screen.getByText(/produktivster Tag/)).toBeInTheDocument();
    });
  });

  it('marks only first day as peak when multiple days have same max', () => {
    // Zwei Tage mit je 10 Partikeln
    const data = createMockData([
      { date: '2025-03-15', particles: 10 },
      { date: '2025-06-20', particles: 10 },
    ]);

    render(<YearGrid data={data} />);

    const marchCell = screen.getByLabelText(/15. März/);
    const juneCell = screen.getByLabelText(/20. Juni/);

    expect(marchCell).toHaveClass('peak-day');
    expect(juneCell).not.toHaveClass('peak-day');
  });
});
```

## Definition of Done

- [ ] Peak Day hat Glow-Effekt
- [ ] Glow pulsiert sanft (3s cycle)
- [ ] Nur ein Peak Day markiert
- [ ] Tooltip zeigt 🏆 Badge
- [ ] Hover verstärkt Glow
- [ ] Reduced Motion Support
- [ ] Glow startet nach Grid-Animation
- [ ] Tests geschrieben & grün
- [ ] Code reviewed

## Notizen

**Design-Philosophie:**
- Der Glow ist eine Belohnung, keine Ablenkung
- Subtil genug, um nicht nervig zu sein
- Klar genug, um "besonders" zu wirken

**Alternative Ideen (für später):**
- Kleines 🏆 Icon neben dem Punkt
- Tooltip mit "Neuer persönlicher Rekord!" wenn kürzlich
- Sound bei Hover (optional)

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
