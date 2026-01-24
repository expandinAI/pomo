---
type: story
status: done
priority: p0
effort: 5
feature: year-view
created: 2026-01-20
updated: 2026-01-20
done_date: 2026-01-24
tags: [year-view, grid, visualization, p0]
---

# POMO-111: Year Grid Component – Das Herzstück

## User Story

> Als **Particle-Nutzer**
> möchte ich **mein Jahr als visuelles Grid aus 365 Punkten sehen**,
> damit **ich auf einen Blick mein Lebenswerk erfassen kann**.

## Kontext

Link zum Feature: [[features/year-view]]

Abhängigkeit: [[stories/backlog/POMO-110-year-view-data]]

Das Grid ist das emotionale Zentrum der Year View. 365 kleine Punkte, jeder repräsentiert einen Tag deines Lebens. Die Helligkeit erzählt die Geschichte deiner Produktivität. Wenn jemand dieses Grid sieht, soll der erste Gedanke sein: *"Wow. Das habe ich geschaffen."*

## Akzeptanzkriterien

### Grid-Struktur
- [ ] **Given** ein Jahr, **When** das Grid rendert, **Then** zeigt es 7 Reihen (Wochentage) × 52-53 Spalten (Wochen)
- [ ] **Given** das Grid, **When** ich es sehe, **Then** beginnt es am 1. Januar des Jahres
- [ ] **Given** ein unvollständiges Jahr (aktuelles Jahr), **When** ich es sehe, **Then** sind zukünftige Tage nicht angezeigt oder extrem dunkel

### Monats-Labels
- [ ] **Given** das Grid, **When** ich es sehe, **Then** sind Monats-Labels über dem Grid (Jan, Feb, Mar...)
- [ ] **Given** ein Monat, **When** er beginnt, **Then** steht das Label über der entsprechenden Woche

### Wochentag-Labels
- [ ] **Given** das Grid, **When** ich es sehe, **Then** sind Wochentag-Labels links (Mo, Di, Mi... oder Mon, Tue, Wed...)
- [ ] **Given** die Einstellung "Wochenstart Montag", **When** ich das Grid sehe, **Then** ist Mo oben
- [ ] **Given** die Einstellung "Wochenstart Sonntag", **When** ich das Grid sehe, **Then** ist So oben

### Brightness (Helligkeit)
- [ ] **Given** ein Tag mit 0 Partikeln, **When** ich die Zelle sehe, **Then** hat sie Brightness ~0.08 (kaum sichtbar)
- [ ] **Given** ein Tag mit Partikeln, **When** ich die Zelle sehe, **Then** ist die Brightness relativ zum persönlichen Maximum
- [ ] **Given** der Peak Day, **When** ich die Zelle sehe, **Then** hat sie Brightness 1.0 (strahlend weiß)

### Responsive
- [ ] **Given** ein Desktop-Viewport, **When** ich das Grid sehe, **Then** passt es auf den Bildschirm
- [ ] **Given** ein Mobile-Viewport, **When** ich das Grid sehe, **Then** kann ich horizontal scrollen

## Technische Details

### Grid-Layout Berechnung

```typescript
// src/lib/year-view/grid.ts

interface GridCell {
  date: Date;
  weekIndex: number;        // Spalte (0-52)
  dayIndex: number;         // Reihe (0-6)
  monthLabel?: string;      // "Jan" wenn erster Tag des Monats in dieser Woche
  particleCount: number;
  brightness: number;
  isPeakDay: boolean;
  isFuture: boolean;
}

export function generateYearGrid(
  yearData: YearViewData,
  weekStartsOnMonday: boolean = true
): GridCell[][] {
  const grid: GridCell[][] = Array.from({ length: 7 }, () => []);

  const startDate = new Date(yearData.year, 0, 1);
  const today = new Date();

  for (const dayData of yearData.days) {
    const weekIndex = getWeekIndex(dayData.date, weekStartsOnMonday);
    const dayIndex = getDayIndex(dayData.date, weekStartsOnMonday);

    const cell: GridCell = {
      date: dayData.date,
      weekIndex,
      dayIndex,
      particleCount: dayData.particleCount,
      brightness: calculateBrightness(dayData.particleCount, yearData.personalMax),
      isPeakDay: dayData.isPeakDay,
      isFuture: dayData.date > today,
      monthLabel: isFirstWeekdayOfMonth(dayData.date, weekStartsOnMonday)
        ? getMonthLabel(dayData.date)
        : undefined,
    };

    grid[dayIndex].push(cell);
  }

  return grid;
}
```

### Brightness Calculation

```typescript
// src/lib/year-view/brightness.ts

export function calculateBrightness(
  particleCount: number,
  personalMax: number
): number {
  // 0 Partikel = fast unsichtbar
  if (particleCount === 0) return 0.08;

  // Edge case: personalMax ist 0 (sollte nicht passieren)
  if (personalMax === 0) return 0.08;

  // Logarithmische Skala für natürlichere Verteilung
  const logCount = Math.log(particleCount + 1);
  const logMax = Math.log(personalMax + 1);

  // Normalisieren auf 0-1
  const normalized = logCount / logMax;

  // Auf Brightness-Range mappen: 0.15 (dunkel) bis 1.0 (strahlend)
  return 0.15 + normalized * 0.85;
}
```

### YearGrid Component

```typescript
// src/components/year-view/YearGrid.tsx

interface YearGridProps {
  data: YearViewData;
  weekStartsOnMonday: boolean;
  onCellHover: (cell: GridCell | null) => void;
  onCellClick?: (cell: GridCell) => void;
}

export function YearGrid({
  data,
  weekStartsOnMonday,
  onCellHover,
  onCellClick,
}: YearGridProps) {
  const grid = useMemo(
    () => generateYearGrid(data, weekStartsOnMonday),
    [data, weekStartsOnMonday]
  );

  const monthLabels = useMemo(
    () => extractMonthLabels(grid),
    [grid]
  );

  return (
    <div className="year-grid-container">
      {/* Wochentag-Labels */}
      <div className="weekday-labels">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i} className="weekday-label">{label}</span>
        ))}
      </div>

      {/* Monat-Labels */}
      <div className="month-labels">
        {monthLabels.map((label, i) => (
          <span
            key={i}
            className="month-label"
            style={{ gridColumn: label.weekIndex + 2 }}
          >
            {label.name}
          </span>
        ))}
      </div>

      {/* Das Grid selbst */}
      <div className="year-grid">
        {grid.map((row, dayIndex) => (
          <div key={dayIndex} className="grid-row">
            {row.map((cell) => (
              <YearGridCell
                key={cell.date.toISOString()}
                cell={cell}
                onHover={onCellHover}
                onClick={onCellClick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### YearGridCell Component

```typescript
// src/components/year-view/YearGridCell.tsx

interface YearGridCellProps {
  cell: GridCell;
  onHover: (cell: GridCell | null) => void;
  onClick?: (cell: GridCell) => void;
}

export function YearGridCell({ cell, onHover, onClick }: YearGridCellProps) {
  return (
    <div
      className={cn(
        "grid-cell",
        cell.isPeakDay && "peak-day",
        cell.isFuture && "future-day"
      )}
      style={{
        opacity: cell.isFuture ? 0.3 : 1,
        backgroundColor: `rgba(255, 255, 255, ${cell.brightness})`,
      }}
      onMouseEnter={() => onHover(cell)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick?.(cell)}
      role="gridcell"
      aria-label={`${formatDate(cell.date)}: ${cell.particleCount} Partikel`}
    />
  );
}
```

### Styling

```css
/* src/components/year-view/year-grid.css */

.year-grid-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  overflow-x: auto;
  padding: var(--space-4);
}

.weekday-labels {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-right: var(--space-2);
  font-size: 11px;
  color: var(--text-muted);
}

.month-labels {
  display: flex;
  gap: 3px;
  margin-left: 28px; /* Breite der Weekday-Labels */
  margin-bottom: var(--space-1);
  font-size: 11px;
  color: var(--text-secondary);
}

.year-grid {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.grid-row {
  display: flex;
  gap: 3px;
}

.grid-cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  cursor: pointer;
  transition: transform 100ms ease-out;
}

.grid-cell:hover {
  transform: scale(1.3);
}

.grid-cell.peak-day {
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
}

.grid-cell.future-day {
  cursor: default;
}

/* Mobile: Horizontal Scroll */
@media (max-width: 768px) {
  .year-grid-container {
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
  }
}
```

### Betroffene Dateien

```
src/
├── components/
│   └── year-view/
│       ├── YearGrid.tsx
│       ├── YearGridCell.tsx
│       └── year-grid.css
└── lib/
    └── year-view/
        ├── grid.ts
        └── brightness.ts
```

## UI/UX

### Das Grid

```
         Jan    Feb    Mar    Apr    May    Jun    Jul    Aug    Sep    Oct    Nov    Dec
    Mo   · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
    Tu   · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
    We   · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
    Th   · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
    Fr   · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
    Sa   · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
    Su   · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·
```

Aber mit Brightness:
- Dunkle Punkte (░) = wenig/keine Aktivität
- Helle Punkte (●) = hohe Aktivität
- Strahlend weiß mit Glow = Peak Day

### Zellen-Details

| Eigenschaft | Wert |
|-------------|------|
| Größe | 12 × 12 px |
| Gap | 3px |
| Border-Radius | 2px |
| Hover | scale(1.3) |
| Peak Day | box-shadow Glow |

### Responsive Verhalten

- **Desktop (>768px):** Volle Ansicht, alles sichtbar
- **Mobile (<768px):** Horizontal scrollen, Wochentag-Labels bleiben links fixiert

## Testing

### Manuell zu testen
- [ ] Grid zeigt 365 Tage (oder 366 in Schaltjahren)
- [ ] Monats-Labels sind korrekt positioniert
- [ ] Wochentag-Labels sind sichtbar
- [ ] Brightness variiert basierend auf Partikel-Count
- [ ] Peak Day hat Glow
- [ ] Hover vergrößert Zelle
- [ ] Zukünftige Tage sind ausgegraut
- [ ] Mobile: Horizontal Scroll funktioniert
- [ ] Wochenstart Montag vs. Sonntag funktioniert

### Automatisierte Tests

```typescript
describe('YearGrid', () => {
  it('renders 365 cells for a non-leap year', () => {
    render(<YearGrid data={mockYearData2025} />);
    expect(screen.getAllByRole('gridcell')).toHaveLength(365);
  });

  it('applies correct brightness to cells', () => {
    const data = mockYearDataWithPeak(10);
    render(<YearGrid data={data} />);

    const peakCell = screen.getByLabelText(/10 Partikel/);
    expect(peakCell).toHaveStyle({ backgroundColor: 'rgba(255, 255, 255, 1)' });
  });

  it('highlights peak day with glow', () => {
    render(<YearGrid data={mockYearDataWithPeak()} />);
    const peakCell = screen.getByLabelText(/Dein produktivster Tag/);
    expect(peakCell).toHaveClass('peak-day');
  });

  it('calls onCellHover when hovering', () => {
    const onHover = vi.fn();
    render(<YearGrid data={mockYearData} onCellHover={onHover} />);

    fireEvent.mouseEnter(screen.getAllByRole('gridcell')[0]);
    expect(onHover).toHaveBeenCalled();
  });
});
```

## Definition of Done

- [ ] Grid Component implementiert
- [ ] 365/366 Zellen werden gerendert
- [ ] Monats-Labels korrekt positioniert
- [ ] Wochentag-Labels sichtbar
- [ ] Brightness-Berechnung funktioniert
- [ ] Peak Day Highlight (Glow)
- [ ] Hover-Effekt (scale)
- [ ] Responsive (Mobile horizontal scroll)
- [ ] Accessibility (aria-labels)
- [ ] Tests geschrieben & grün
- [ ] Performance: <16ms render (60fps)
- [ ] Code reviewed

## Notizen

**Performance-Tipps:**
- `useMemo` für Grid-Berechnung
- CSS-only Animationen (keine JS für Hover)
- Keine Re-Renders bei Hover (nur CSS-Transformation)

**Accessibility:**
- Jede Zelle hat aria-label mit Datum + Partikel-Count
- Grid hat role="grid"
- Keyboard-Navigation (später, optional)

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
