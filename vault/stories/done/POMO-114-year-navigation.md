---
type: story
status: done
priority: p0
effort: 2
feature: year-view
created: 2026-01-20
updated: 2026-01-20
done_date: 2026-01-24
tags: [year-view, navigation, selector, keyboard, p0]
---

# POMO-114: Jahr-Selector & Navigation

## User Story

> Als **Particle-Nutzer**
> möchte ich **zwischen verschiedenen Jahren wechseln können**,
> damit **ich mein gesamtes Lebenswerk über die Zeit betrachten kann**.

## Kontext

Link zum Feature: [[features/year-view]]

Abhängigkeiten:
- [[stories/backlog/POMO-110-year-view-data]]
- [[stories/backlog/POMO-111-year-grid]]

Die Jahr-Navigation ermöglicht Zeitreisen durch dein Lebenswerk. Von 2024 zu 2025 zu 2026 – jedes Jahr ein neues Kapitel. Die Navigation muss smooth sein, keyboard-accessible und sich magisch anfühlen.

## Akzeptanzkriterien

### Globale Navigation
- [ ] **Given** ich bin irgendwo in der App, **When** ich `G Y` drücke, **Then** öffne ich die Year View
- [ ] **Given** ich bin in der Year View, **When** ich `Escape` drücke, **Then** gehe ich zurück

### Jahr-Selector
- [ ] **Given** die Year View, **When** ich sie sehe, **Then** zeigt sie das aktuelle Jahr als Titel
- [ ] **Given** ältere Jahre mit Daten existieren, **When** ich die View sehe, **Then** kann ich zu ihnen navigieren
- [ ] **Given** zukünftige Jahre, **When** ich navigieren will, **Then** sind sie nicht auswählbar

### Keyboard Navigation
- [ ] **Given** ich bin in der Year View, **When** ich `←` oder `H` drücke, **Then** wechsle ich zum Vorjahr
- [ ] **Given** ich bin in der Year View, **When** ich `→` oder `L` drücke, **Then** wechsle ich zum nächsten Jahr
- [ ] **Given** ich bin im ältesten Jahr mit Daten, **When** ich `←` drücke, **Then** passiert nichts (keine Navigation)
- [ ] **Given** ich bin im aktuellen Jahr, **When** ich `→` drücke, **Then** passiert nichts (Zukunft nicht wählbar)

### Button Navigation
- [ ] **Given** die Year View, **When** ich sie sehe, **Then** gibt es [←] und [→] Buttons
- [ ] **Given** ich bin im ältesten Jahr, **When** ich den [←] Button sehe, **Then** ist er disabled
- [ ] **Given** ich bin im aktuellen Jahr, **When** ich den [→] Button sehe, **Then** ist er disabled

### Animation beim Wechsel
- [ ] **Given** ich wechsle zum Vorjahr, **When** das Grid wechselt, **Then** animiert es nach rechts (altes raus, neues rein)
- [ ] **Given** ich wechsle zum nächsten Jahr, **When** das Grid wechselt, **Then** animiert es nach links

## Technische Details

### YearSelector Component

```typescript
// src/components/year-view/YearSelector.tsx

interface YearSelectorProps {
  currentYear: number;
  availableYears: number[];
  onYearChange: (year: number) => void;
}

export function YearSelector({
  currentYear,
  availableYears,
  onYearChange,
}: YearSelectorProps) {
  const minYear = Math.min(...availableYears);
  const maxYear = new Date().getFullYear();

  const canGoPrev = currentYear > minYear;
  const canGoNext = currentYear < maxYear;

  const handlePrev = () => {
    if (canGoPrev) onYearChange(currentYear - 1);
  };

  const handleNext = () => {
    if (canGoNext) onYearChange(currentYear + 1);
  };

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'h') {
        handlePrev();
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentYear, canGoPrev, canGoNext]);

  return (
    <div className="year-selector">
      <button
        className="year-nav-button"
        onClick={handlePrev}
        disabled={!canGoPrev}
        aria-label="Vorheriges Jahr"
      >
        <ChevronLeft />
      </button>

      <h1 className="year-title">{currentYear}</h1>

      <button
        className="year-nav-button"
        onClick={handleNext}
        disabled={!canGoNext}
        aria-label="Nächstes Jahr"
      >
        <ChevronRight />
      </button>
    </div>
  );
}
```

### Available Years Logic

```typescript
// src/lib/year-view/years.ts

export async function getAvailableYears(): Promise<number[]> {
  // Finde das älteste Partikel
  const oldestParticle = await getOldestParticle();

  if (!oldestParticle) {
    // Keine Daten: Nur aktuelles Jahr
    return [new Date().getFullYear()];
  }

  const oldestYear = oldestParticle.completedAt.getFullYear();
  const currentYear = new Date().getFullYear();

  // Alle Jahre von ältestem bis aktuellem
  const years: number[] = [];
  for (let y = oldestYear; y <= currentYear; y++) {
    years.push(y);
  }

  return years;
}
```

### Year View Page mit Animation

```typescript
// src/components/year-view/YearView.tsx

export function YearView() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const { data, isLoading } = useYearViewData(currentYear);
  const availableYears = useAvailableYears();

  const handleYearChange = (newYear: number) => {
    setDirection(newYear > currentYear ? 'left' : 'right');
    setCurrentYear(newYear);
  };

  return (
    <div className="year-view">
      <header className="year-header">
        <BackButton />
        <YearSelector
          currentYear={currentYear}
          availableYears={availableYears}
          onYearChange={handleYearChange}
        />
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentYear}
          initial={{ opacity: 0, x: direction === 'left' ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction === 'left' ? -100 : 100 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {isLoading ? (
            <YearGridSkeleton />
          ) : (
            <>
              <YearGrid data={data} />
              <YearSummary summary={data.summary} />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

### G Y Navigation Registration

```typescript
// src/lib/navigation.ts

// G-Prefix Navigation erweitern
const gPrefixRoutes = {
  't': '/',           // Timer
  's': '/stats',      // Statistics
  'h': '/history',    // History
  'p': '/projects',   // Projects
  'y': '/year',       // Year View ← NEU
};
```

### Styling

```css
/* src/components/year-view/year-selector.css */

.year-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}

.year-title {
  font-size: 48px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--text-primary);
  letter-spacing: -0.02em;
  min-width: 120px;
  text-align: center;
}

.year-nav-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 100ms ease-out;
}

.year-nav-button:hover:not(:disabled) {
  background: var(--surface-elevated);
  border-color: var(--text-muted);
  color: var(--text-primary);
}

.year-nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.year-nav-button svg {
  width: 20px;
  height: 20px;
}
```

### Betroffene Dateien

```
src/
├── components/
│   └── year-view/
│       ├── YearView.tsx           # Hauptkomponente erweitern
│       ├── YearSelector.tsx       # NEU
│       └── year-selector.css
├── lib/
│   ├── year-view/
│   │   └── years.ts               # Available years
│   └── navigation.ts              # G Y registrieren
└── app/
    └── year/
        └── page.tsx               # Route
```

## UI/UX

### Header mit Year Selector

```
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│  ← Zurück                                                         │
│                                                                   │
│                    [<]    2025    [>]                             │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Jahr-Wechsel Animation

```
2025 → 2024 (← drücken):
┌─────────────────────┐     ┌─────────────────────┐
│      2025           │ ──► │      2024           │
│  Grid animiert      │     │  Grid kommt von     │
│  nach rechts raus   │     │  links rein         │
└─────────────────────┘     └─────────────────────┘

2024 → 2025 (→ drücken):
┌─────────────────────┐     ┌─────────────────────┐
│      2024           │ ──► │      2025           │
│  Grid animiert      │     │  Grid kommt von     │
│  nach links raus    │     │  rechts rein        │
└─────────────────────┘     └─────────────────────┘
```

### Shortcut Hints

Im Help Modal:
```
Year View
G Y           Go to Year View
← / H         Previous year
→ / L         Next year
Escape        Go back
```

## Testing

### Manuell zu testen
- [ ] `G Y` öffnet Year View
- [ ] Aktuelles Jahr wird initial angezeigt
- [ ] ← Button wechselt zum Vorjahr
- [ ] → Button wechselt zum nächsten Jahr
- [ ] Keyboard: ← / H funktioniert
- [ ] Keyboard: → / L funktioniert
- [ ] Disabled State bei Grenzen
- [ ] Animation beim Wechsel
- [ ] Escape geht zurück
- [ ] Nur Jahre mit Daten (+ aktuelles) sind navigierbar

### Automatisierte Tests

```typescript
describe('YearSelector', () => {
  it('disables prev button at oldest year', () => {
    render(<YearSelector currentYear={2024} availableYears={[2024, 2025]} />);

    expect(screen.getByLabelText('Vorheriges Jahr')).toBeDisabled();
  });

  it('disables next button at current year', () => {
    const currentYear = new Date().getFullYear();
    render(<YearSelector currentYear={currentYear} availableYears={[2024, currentYear]} />);

    expect(screen.getByLabelText('Nächstes Jahr')).toBeDisabled();
  });

  it('calls onYearChange when navigating', () => {
    const onYearChange = vi.fn();
    render(<YearSelector currentYear={2025} availableYears={[2024, 2025, 2026]} onYearChange={onYearChange} />);

    fireEvent.click(screen.getByLabelText('Vorheriges Jahr'));
    expect(onYearChange).toHaveBeenCalledWith(2024);
  });
});
```

## Definition of Done

- [ ] YearSelector Component implementiert
- [ ] G Y Navigation registriert
- [ ] Keyboard Navigation (←/→, H/L)
- [ ] Button Navigation
- [ ] Disabled States bei Grenzen
- [ ] Jahr-Wechsel Animation (slide)
- [ ] Available Years Logic
- [ ] Escape geht zurück
- [ ] Tests geschrieben & grün
- [ ] Code reviewed

## Notizen

**UX-Details:**
- Vim-Style (H/L) zusätzlich zu Pfeiltasten für Power User
- Animation zeigt Richtung (mental model: Zeitstrahl)
- Große Jahr-Zahl = Fokus auf das Wesentliche

**Edge Case:**
- Neuer User ohne Daten: Nur aktuelles Jahr, beide Buttons disabled
- User mit nur 2025: Prev disabled, Next disabled

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
