---
type: story
status: backlog
priority: p0
effort: 2
feature: year-view
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [year-view, stats, summary, p0]
---

# POMO-113: Year Summary Stats – Die Zahlen deines Jahres

## User Story

> Als **Particle-Nutzer**
> möchte ich **die wichtigsten Zahlen meines Jahres auf einen Blick sehen**,
> damit **ich den Umfang meines Lebenswerks erfassen kann**.

## Kontext

Link zum Feature: [[features/year-view]]

Abhängigkeit: [[stories/backlog/POMO-110-year-view-data]]

Die Summary Stats sind der Moment der Erkenntnis. Nach dem visuellen Grid kommt die Bestätigung in Zahlen: "1.247 Partikel. 521 Stunden. Das habe ich geschaffen." Die Zahlen müssen groß, stolz und emotional sein – nicht wie ein Excel-Report.

## Akzeptanzkriterien

### Anzeige
- [ ] **Given** die Year View, **When** ich die Summary sehe, **Then** zeigt sie 4 Metriken in einer Reihe
- [ ] **Given** die Summary, **When** ich sie sehe, **Then** sind die Zahlen groß und prominent
- [ ] **Given** die Summary, **When** ich sie sehe, **Then** sind die Labels unter den Zahlen

### Metriken
- [ ] **Given** Partikel im Jahr, **When** ich die Summary sehe, **Then** zeigt "X Partikel" (Gesamtzahl)
- [ ] **Given** Fokuszeit im Jahr, **When** ich die Summary sehe, **Then** zeigt "Xh Ym Fokuszeit" (formatiert)
- [ ] **Given** aktive Tage, **When** ich die Summary sehe, **Then** zeigt "X Tage" mit Label "Längste Serie"
- [ ] **Given** aktive Tage insgesamt, **When** ich die Summary sehe, **Then** zeigt "X Aktive Tage"

### Formatierung
- [ ] **Given** Fokuszeit >100h, **When** ich die Zahl sehe, **Then** zeigt es "521h 35m" (keine Minuten bei glatten Stunden)
- [ ] **Given** Fokuszeit <1h, **When** ich die Zahl sehe, **Then** zeigt es "45m" (ohne Stunden)
- [ ] **Given** 0 Partikel, **When** ich die Summary sehe, **Then** zeigt es "0" ohne Negativität

### Responsive
- [ ] **Given** ein schmaler Viewport, **When** ich die Summary sehe, **Then** stacken die Metriken (2×2 Grid)

## Technische Details

### YearSummary Component

```typescript
// src/components/year-view/YearSummary.tsx

interface YearSummaryProps {
  summary: YearViewSummary;
}

export function YearSummary({ summary }: YearSummaryProps) {
  return (
    <div className="year-summary">
      <SummaryCard
        value={summary.totalParticles.toLocaleString('de-DE')}
        label="Partikel"
        icon="sparkles"
      />
      <SummaryCard
        value={formatDuration(summary.totalDuration)}
        label="Fokuszeit"
        icon="clock"
      />
      <SummaryCard
        value={`${summary.longestStreak} Tage`}
        label="Längste Serie"
        icon="flame"
      />
      <SummaryCard
        value={summary.activeDays.toString()}
        label="Aktive Tage"
        icon="calendar"
      />
    </div>
  );
}
```

### SummaryCard Component

```typescript
// src/components/year-view/SummaryCard.tsx

interface SummaryCardProps {
  value: string;
  label: string;
  icon?: string;
}

export function SummaryCard({ value, label, icon }: SummaryCardProps) {
  return (
    <div className="summary-card">
      <div className="summary-value">
        {value}
      </div>
      <div className="summary-label">
        {label}
      </div>
    </div>
  );
}
```

### Formatierung

```typescript
// src/lib/year-view/format.ts

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

// Beispiele:
// 45 → "45m"
// 60 → "1h"
// 125 → "2h 5m"
// 31295 → "521h 35m"
```

### Styling

```css
/* src/components/year-view/year-summary.css */

.year-summary {
  display: flex;
  justify-content: center;
  gap: var(--space-8);
  padding: var(--space-8) var(--space-4);
  margin-top: var(--space-8);
  border-top: 1px solid var(--border);
}

.summary-card {
  text-align: center;
  min-width: 120px;
}

.summary-value {
  font-size: 32px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.summary-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: var(--space-1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Responsive: 2x2 Grid auf Mobile */
@media (max-width: 640px) {
  .year-summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-6);
  }

  .summary-value {
    font-size: 28px;
  }
}
```

### Betroffene Dateien

```
src/
└── components/
    └── year-view/
        ├── YearSummary.tsx
        ├── SummaryCard.tsx
        ├── year-summary.css
        └── index.ts
```

## UI/UX

### Desktop Layout

```
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│    1,247            521h 35m           23 Tage          187       │
│   PARTIKEL         FOKUSZEIT      LÄNGSTE SERIE    AKTIVE TAGE   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (2×2)

```
┌─────────────────────────────────┐
│                                 │
│   1,247           521h 35m      │
│  PARTIKEL        FOKUSZEIT      │
│                                 │
│   23 Tage           187         │
│ LÄNGSTE SERIE   AKTIVE TAGE     │
│                                 │
└─────────────────────────────────┘
```

### Visual Details

| Eigenschaft | Wert |
|-------------|------|
| Value Font Size | 32px (Desktop), 28px (Mobile) |
| Value Font | Monospace |
| Value Weight | 700 |
| Label Font Size | 13px |
| Label Style | Uppercase, letter-spacing |
| Label Color | text-secondary |

### Emotional Design

- Große Zahlen = Stolz
- Monospace = Präzision, Klarheit
- Separator-Linie oben = Visual Break nach Grid
- Zentriert = Fokus auf die Zahlen

## Testing

### Manuell zu testen
- [ ] Alle 4 Metriken werden angezeigt
- [ ] Partikel-Zahl hat Tausender-Trennung
- [ ] Fokuszeit ist korrekt formatiert
- [ ] Längste Serie zeigt "X Tage"
- [ ] Aktive Tage stimmen
- [ ] Responsive: 2×2 auf Mobile
- [ ] Leeres Jahr zeigt "0" (nicht "keine Daten")

### Automatisierte Tests

```typescript
describe('YearSummary', () => {
  it('displays all four metrics', () => {
    render(<YearSummary summary={mockSummary} />);

    expect(screen.getByText('1.247')).toBeInTheDocument();
    expect(screen.getByText('521h 35m')).toBeInTheDocument();
    expect(screen.getByText('23 Tage')).toBeInTheDocument();
    expect(screen.getByText('187')).toBeInTheDocument();
  });

  it('formats large particle counts with thousand separators', () => {
    const summary = { ...mockSummary, totalParticles: 12345 };
    render(<YearSummary summary={summary} />);

    expect(screen.getByText('12.345')).toBeInTheDocument();
  });

  it('formats duration correctly', () => {
    expect(formatDuration(45)).toBe('45m');
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(125)).toBe('2h 5m');
  });
});
```

## Definition of Done

- [ ] YearSummary Component implementiert
- [ ] SummaryCard Component implementiert
- [ ] Alle 4 Metriken angezeigt
- [ ] Formatierung korrekt
- [ ] Tausender-Trennung
- [ ] Responsive Layout (2×2 Mobile)
- [ ] Tests geschrieben & grün
- [ ] Code reviewed

## Notizen

**Design-Philosophie:**
- Große Zahlen → Stolz
- Monospace → Tech-Ästhetik, passt zu Linear-Inspiration
- Keine Icons nötig – die Zahlen sprechen für sich

**Alternative Metriken (später):**
- Durchschnitt pro aktivem Tag
- Vergleich zum Vorjahr (+12%)
- Produktivster Monat

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
