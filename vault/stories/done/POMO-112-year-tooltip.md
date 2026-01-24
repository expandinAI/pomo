---
type: story
status: done
priority: p0
effort: 3
feature: year-view
created: 2026-01-20
updated: 2026-01-20
done_date: 2026-01-24
tags: [year-view, tooltip, hover, interaction, p0]
---

# POMO-112: Hover Tooltip – Die Geschichte eines Tages

## User Story

> Als **Particle-Nutzer**
> möchte ich **beim Hover über einen Tag Details sehen**,
> damit **ich mich erinnern kann, was ich an diesem Tag geschaffen habe**.

## Kontext

Link zum Feature: [[features/year-view]]

Abhängigkeit: [[stories/backlog/POMO-111-year-grid]]

Der Tooltip ist der Moment der Reflexion. Ein kleines Fenster in einen Tag deines Lebens. Was hast du an diesem Dienstag im März gemacht? Der Tooltip erzählt es dir – nicht mit kalten Zahlen, sondern mit Wärme und Stolz.

## Akzeptanzkriterien

### Erscheinen
- [ ] **Given** ich hover über eine Zelle, **When** 100ms vergangen sind, **Then** erscheint der Tooltip
- [ ] **Given** der Tooltip ist sichtbar, **When** ich die Maus wegbewege, **Then** verschwindet er sofort
- [ ] **Given** ich bewege die Maus schnell über mehrere Zellen, **When** ich stoppe, **Then** zeigt nur die letzte Zelle einen Tooltip

### Inhalt – Aktiver Tag (≥1 Partikel)
- [ ] **Given** ein Tag mit Partikeln, **When** ich den Tooltip sehe, **Then** zeigt er das Datum (ausgeschrieben)
- [ ] **Given** ein Tag mit Partikeln, **When** ich den Tooltip sehe, **Then** zeigt er Partikel als Dots + Zahl
- [ ] **Given** ein Tag mit Partikeln, **When** ich den Tooltip sehe, **Then** zeigt er die Fokuszeit
- [ ] **Given** ein Tag mit einem Top Task, **When** ich den Tooltip sehe, **Then** zeigt er den Task-Namen
- [ ] **Given** ein Tag mit einem Projekt, **When** ich den Tooltip sehe, **Then** zeigt er den Projekt-Namen

### Inhalt – Ruhetag (0 Partikel)
- [ ] **Given** ein Tag mit 0 Partikeln, **When** ich den Tooltip sehe, **Then** zeigt er das Datum
- [ ] **Given** ein Tag mit 0 Partikeln, **When** ich den Tooltip sehe, **Then** zeigt er "Ein Tag der Ruhe." (keine Zahlen, keine Schuld)

### Inhalt – Peak Day
- [ ] **Given** der Peak Day, **When** ich den Tooltip sehe, **Then** zeigt er zusätzlich "🏆 Dein produktivster Tag"

### Inhalt – Heute
- [ ] **Given** der heutige Tag, **When** ich den Tooltip sehe, **Then** zeigt er "Heute" statt dem Datum

### Positionierung
- [ ] **Given** eine Zelle am oberen Rand, **When** der Tooltip erscheint, **Then** erscheint er unterhalb
- [ ] **Given** eine Zelle am unteren Rand, **When** der Tooltip erscheint, **Then** erscheint er oberhalb
- [ ] **Given** eine Zelle am linken Rand, **When** der Tooltip erscheint, **Then** ist er nicht abgeschnitten
- [ ] **Given** eine Zelle am rechten Rand, **When** der Tooltip erscheint, **Then** ist er nicht abgeschnitten

## Technische Details

### Tooltip Component

```typescript
// src/components/year-view/YearTooltip.tsx

interface YearTooltipProps {
  cell: GridCell | null;
  dayData: YearViewDay | null;
  position: { x: number; y: number };
  isVisible: boolean;
}

export function YearTooltip({ cell, dayData, position, isVisible }: YearTooltipProps) {
  if (!isVisible || !cell || !dayData) return null;

  const isRestDay = dayData.particleCount === 0;
  const isToday = isSameDay(cell.date, new Date());
  const isPeakDay = dayData.isPeakDay;

  return (
    <motion.div
      className="year-tooltip"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {/* Datum */}
      <div className="tooltip-date">
        {isToday ? 'Heute' : formatDateLong(cell.date)}
      </div>

      {isRestDay ? (
        /* Ruhetag */
        <div className="tooltip-rest">
          Ein Tag der Ruhe.
        </div>
      ) : (
        /* Aktiver Tag */
        <>
          {/* Partikel Visualisierung */}
          <div className="tooltip-particles">
            <ParticleDots count={dayData.particleCount} max={12} />
            <span className="particle-count">{dayData.particleCount} Partikel</span>
          </div>

          {/* Fokuszeit */}
          <div className="tooltip-duration">
            {formatDuration(dayData.totalDuration)} Fokuszeit
          </div>

          {/* Top Task */}
          {dayData.topTask && (
            <div className="tooltip-task">
              <span className="label">Top Task:</span>
              <span className="value">"{dayData.topTask}"</span>
            </div>
          )}

          {/* Projekt */}
          {dayData.topProject && (
            <div className="tooltip-project">
              Projekt: {dayData.topProject.name}
            </div>
          )}

          {/* Peak Day Badge */}
          {isPeakDay && (
            <div className="tooltip-peak">
              🏆 Dein produktivster Tag
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
```

### ParticleDots Component

```typescript
// Visuelle Darstellung der Partikel als Punkte

interface ParticleDotsProps {
  count: number;
  max: number; // Max anzuzeigende Dots
}

function ParticleDots({ count, max }: ParticleDotsProps) {
  const visibleCount = Math.min(count, max);
  const hasMore = count > max;

  return (
    <div className="particle-dots">
      {Array.from({ length: visibleCount }).map((_, i) => (
        <span key={i} className="dot">●</span>
      ))}
      {hasMore && <span className="more">+{count - max}</span>}
    </div>
  );
}
```

### Positioning Logic

```typescript
// src/lib/year-view/tooltip-position.ts

interface TooltipPosition {
  x: number;
  y: number;
  anchor: 'top' | 'bottom';
}

export function calculateTooltipPosition(
  cellRect: DOMRect,
  tooltipSize: { width: number; height: number },
  containerRect: DOMRect
): TooltipPosition {
  const OFFSET = 8;
  const TOOLTIP_WIDTH = 220;
  const TOOLTIP_HEIGHT = 160;

  // Horizontal: Zentriert über der Zelle
  let x = cellRect.left + cellRect.width / 2 - TOOLTIP_WIDTH / 2;

  // Nicht über den linken Rand hinaus
  x = Math.max(containerRect.left + OFFSET, x);

  // Nicht über den rechten Rand hinaus
  x = Math.min(containerRect.right - TOOLTIP_WIDTH - OFFSET, x);

  // Vertikal: Über oder unter der Zelle
  const spaceAbove = cellRect.top - containerRect.top;
  const spaceBelow = containerRect.bottom - cellRect.bottom;

  let y: number;
  let anchor: 'top' | 'bottom';

  if (spaceBelow >= TOOLTIP_HEIGHT + OFFSET || spaceBelow > spaceAbove) {
    // Unter der Zelle
    y = cellRect.bottom + OFFSET;
    anchor = 'top';
  } else {
    // Über der Zelle
    y = cellRect.top - TOOLTIP_HEIGHT - OFFSET;
    anchor = 'bottom';
  }

  return { x, y, anchor };
}
```

### Styling

```css
/* src/components/year-view/year-tooltip.css */

.year-tooltip {
  position: fixed;
  z-index: 1000;
  width: 220px;
  padding: var(--space-4);
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

.tooltip-date {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.tooltip-particles {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.particle-dots {
  display: flex;
  gap: 2px;
}

.particle-dots .dot {
  font-size: 8px;
  color: var(--text-primary);
}

.particle-count {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.tooltip-duration {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
}

.tooltip-task {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.tooltip-task .label {
  color: var(--text-muted);
}

.tooltip-task .value {
  color: var(--text-primary);
  font-style: italic;
}

.tooltip-project {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: var(--space-3);
}

.tooltip-peak {
  font-size: 12px;
  color: var(--accent);
  font-weight: 500;
  padding-top: var(--space-2);
  border-top: 1px solid var(--border);
}

.tooltip-rest {
  font-size: 13px;
  color: var(--text-secondary);
  font-style: italic;
}
```

### Betroffene Dateien

```
src/
└── components/
    └── year-view/
        ├── YearTooltip.tsx
        ├── ParticleDots.tsx
        ├── year-tooltip.css
        └── index.ts
```

## UI/UX

### Aktiver Tag

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
```

### Peak Day

```
┌─────────────────────────────┐
│  Mittwoch, 23. März 2025    │
│                             │
│  ●●●●●●●●●●●● 12 Partikel   │
│  5h 0m Fokuszeit            │
│                             │
│  Top Task:                  │
│  "Feature Launch"           │
│                             │
│  ─────────────────────────  │
│  🏆 Dein produktivster Tag  │
└─────────────────────────────┘
```

### Ruhetag

```
┌─────────────────────────────┐
│  Sonntag, 12. Januar 2025   │
│                             │
│  Ein Tag der Ruhe.          │
│                             │
└─────────────────────────────┘
```

### Animation

- **Erscheinen:** fade + scale (100ms)
- **Verschwinden:** instant (keine Animation)
- **Debounce:** 100ms bevor Tooltip erscheint

## Testing

### Manuell zu testen
- [ ] Tooltip erscheint nach kurzem Hover
- [ ] Tooltip verschwindet bei Mouseout
- [ ] Schnelles Bewegen: kein Flackern
- [ ] Aktiver Tag: alle Infos korrekt
- [ ] Ruhetag: zeigt "Ein Tag der Ruhe."
- [ ] Peak Day: zeigt 🏆 Badge
- [ ] Heute: zeigt "Heute" statt Datum
- [ ] Positionierung: nicht abgeschnitten an Rändern
- [ ] Partikel Dots: max 12, dann "+X"

### Automatisierte Tests

```typescript
describe('YearTooltip', () => {
  it('shows particle count and duration for active day', () => {
    render(<YearTooltip dayData={mockActiveDay} isVisible />);

    expect(screen.getByText('8 Partikel')).toBeInTheDocument();
    expect(screen.getByText('3h 20m Fokuszeit')).toBeInTheDocument();
  });

  it('shows rest message for zero-particle day', () => {
    render(<YearTooltip dayData={mockRestDay} isVisible />);

    expect(screen.getByText('Ein Tag der Ruhe.')).toBeInTheDocument();
    expect(screen.queryByText(/Partikel/)).not.toBeInTheDocument();
  });

  it('shows peak badge for peak day', () => {
    render(<YearTooltip dayData={mockPeakDay} isVisible />);

    expect(screen.getByText(/produktivster Tag/)).toBeInTheDocument();
  });

  it('shows "Heute" for today', () => {
    const today = { ...mockActiveDay, date: new Date() };
    render(<YearTooltip dayData={today} isVisible />);

    expect(screen.getByText('Heute')).toBeInTheDocument();
  });
});
```

## Definition of Done

- [ ] YearTooltip Component implementiert
- [ ] ParticleDots Component implementiert
- [ ] Positioning Logic funktioniert
- [ ] Alle Inhalts-Varianten (aktiv, ruhe, peak, heute)
- [ ] Debounce bei schnellem Hover
- [ ] Smooth Animation (Framer Motion)
- [ ] Nicht abgeschnitten an Rändern
- [ ] Tests geschrieben & grün
- [ ] Code reviewed

## Notizen

**Messaging:**
- "Ein Tag der Ruhe." – Keine Schuld, keine "0 Sessions"
- "Dein produktivster Tag" – Feier, nicht Statistik
- Fokuszeit, nicht Arbeitszeit

**UX-Detail:**
- Debounce verhindert Flackern
- Instant hide (kein fade-out) fühlt sich snappier an
- Partikel als Dots ist visueller als nur Zahl

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
