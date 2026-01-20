---
type: story
status: backlog
priority: p1
effort: 1
feature: year-view
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [year-view, settings, weekstart, i18n, p1]
---

# POMO-117: Wochenstart-Einstellung

## User Story

> Als **Particle-Nutzer**
> möchte ich **einstellen können, ob meine Woche am Montag oder Sonntag beginnt**,
> damit **das Grid meiner kulturellen Gewohnheit entspricht**.

## Kontext

Link zum Feature: [[features/year-view]]

Abhängigkeit: [[stories/backlog/POMO-111-year-grid]]

In Europa beginnt die Woche am Montag, in den USA am Sonntag. Diese Einstellung betrifft nicht nur die Year View, sondern alle Kalender-bezogenen Ansichten. Sie ist Teil der App-Einstellungen.

**Priorität P1:** Nicht kritisch für Launch, aber wichtig für internationale User.

## Akzeptanzkriterien

### Einstellung
- [ ] **Given** die Settings-Seite, **When** ich sie öffne, **Then** sehe ich eine Option "Wochenstart"
- [ ] **Given** die Option, **When** ich sie sehe, **Then** kann ich zwischen "Montag" und "Sonntag" wählen
- [ ] **Given** ein neuer User, **When** die App startet, **Then** ist "Montag" der Default

### Year View Integration
- [ ] **Given** Wochenstart = Montag, **When** ich die Year View sehe, **Then** ist "Mo" die erste Reihe
- [ ] **Given** Wochenstart = Sonntag, **When** ich die Year View sehe, **Then** ist "So" die erste Reihe
- [ ] **Given** ich ändere die Einstellung, **When** ich zur Year View gehe, **Then** ist das Grid entsprechend aktualisiert

### Persistenz
- [ ] **Given** ich setze Wochenstart = Sonntag, **When** ich die App neu lade, **Then** bleibt die Einstellung erhalten

## Technische Details

### Settings State

```typescript
// src/lib/settings/types.ts

interface AppSettings {
  // ... existing settings ...
  weekStartsOnMonday: boolean; // true = Montag, false = Sonntag
}

const defaultSettings: AppSettings = {
  // ...
  weekStartsOnMonday: true, // EU Default
};
```

### Settings Hook

```typescript
// src/lib/settings/hooks.ts

export function useWeekStart(): {
  weekStartsOnMonday: boolean;
  setWeekStart: (monday: boolean) => void;
} {
  const [settings, setSettings] = useSettings();

  return {
    weekStartsOnMonday: settings.weekStartsOnMonday,
    setWeekStart: (monday) =>
      setSettings({ ...settings, weekStartsOnMonday: monday }),
  };
}
```

### Settings UI

```typescript
// src/components/settings/WeekStartSetting.tsx

export function WeekStartSetting() {
  const { weekStartsOnMonday, setWeekStart } = useWeekStart();

  return (
    <div className="setting-row">
      <div className="setting-label">
        <span className="setting-title">Wochenstart</span>
        <span className="setting-description">
          Erster Tag der Woche in Kalenderansichten
        </span>
      </div>
      <div className="setting-control">
        <SegmentedControl
          value={weekStartsOnMonday ? 'monday' : 'sunday'}
          onChange={(v) => setWeekStart(v === 'monday')}
          options={[
            { value: 'monday', label: 'Montag' },
            { value: 'sunday', label: 'Sonntag' },
          ]}
        />
      </div>
    </div>
  );
}
```

### Year View Integration

```typescript
// src/components/year-view/YearView.tsx

export function YearView() {
  const { weekStartsOnMonday } = useWeekStart();

  return (
    <YearGrid
      data={data}
      weekStartsOnMonday={weekStartsOnMonday}
    />
  );
}
```

### Grid Calculation Update

```typescript
// src/lib/year-view/grid.ts

export function getDayIndex(date: Date, weekStartsOnMonday: boolean): number {
  const jsDay = date.getDay(); // 0 = Sonntag, 6 = Samstag

  if (weekStartsOnMonday) {
    // Montag = 0, Sonntag = 6
    return jsDay === 0 ? 6 : jsDay - 1;
  } else {
    // Sonntag = 0, Samstag = 6 (JS Default)
    return jsDay;
  }
}

export function getWeekdayLabels(weekStartsOnMonday: boolean): string[] {
  if (weekStartsOnMonday) {
    return ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  } else {
    return ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  }
}
```

### Betroffene Dateien

```
src/
├── lib/
│   ├── settings/
│   │   ├── types.ts           # Setting hinzufügen
│   │   └── hooks.ts           # useWeekStart Hook
│   └── year-view/
│       └── grid.ts            # getDayIndex anpassen
└── components/
    ├── settings/
    │   └── WeekStartSetting.tsx
    └── year-view/
        └── YearGrid.tsx       # Hook nutzen
```

## UI/UX

### Settings Page

```
┌───────────────────────────────────────────────────────────────────┐
│  Settings                                                         │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ... other settings ...                                           │
│                                                                   │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  Wochenstart                          [Montag] [Sonntag]          │
│  Erster Tag der Woche in                  ↑ selected             │
│  Kalenderansichten                                                │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Year View Unterschied

**Wochenstart Montag:**
```
    Mo  ░ ░ ░ ░ ░ ░ ░ ...
    Di  ░ ░ ░ ░ ░ ░ ░ ...
    Mi  ░ ░ ░ ░ ░ ░ ░ ...
    Do  ░ ░ ░ ░ ░ ░ ░ ...
    Fr  ░ ░ ░ ░ ░ ░ ░ ...
    Sa  ░ ░ ░ ░ ░ ░ ░ ...
    So  ░ ░ ░ ░ ░ ░ ░ ...
```

**Wochenstart Sonntag:**
```
    So  ░ ░ ░ ░ ░ ░ ░ ...
    Mo  ░ ░ ░ ░ ░ ░ ░ ...
    Di  ░ ░ ░ ░ ░ ░ ░ ...
    Mi  ░ ░ ░ ░ ░ ░ ░ ...
    Do  ░ ░ ░ ░ ░ ░ ░ ...
    Fr  ░ ░ ░ ░ ░ ░ ░ ...
    Sa  ░ ░ ░ ░ ░ ░ ░ ...
```

## Testing

### Manuell zu testen
- [ ] Setting ist in Settings-Page sichtbar
- [ ] Default ist Montag
- [ ] Wechsel auf Sonntag funktioniert
- [ ] Year View passt sich an
- [ ] Einstellung wird persistent gespeichert
- [ ] Nach Reload bleibt Einstellung

### Automatisierte Tests

```typescript
describe('WeekStartSetting', () => {
  it('defaults to Monday', () => {
    const settings = getDefaultSettings();
    expect(settings.weekStartsOnMonday).toBe(true);
  });

  it('persists setting change', async () => {
    const { result } = renderHook(() => useWeekStart());

    act(() => {
      result.current.setWeekStart(false);
    });

    // Reload
    const { result: reloaded } = renderHook(() => useWeekStart());
    expect(reloaded.current.weekStartsOnMonday).toBe(false);
  });
});

describe('getDayIndex', () => {
  it('returns 0 for Monday when weekStartsOnMonday', () => {
    const monday = new Date('2025-01-20'); // Montag
    expect(getDayIndex(monday, true)).toBe(0);
  });

  it('returns 1 for Monday when week starts on Sunday', () => {
    const monday = new Date('2025-01-20'); // Montag
    expect(getDayIndex(monday, false)).toBe(1);
  });
});
```

## Definition of Done

- [ ] Setting in Settings-Page
- [ ] Default = Montag
- [ ] Persistenz (localStorage)
- [ ] Year View nutzt Setting
- [ ] Grid-Berechnung korrekt
- [ ] Weekday-Labels passen sich an
- [ ] Tests geschrieben & grün
- [ ] Code reviewed

## Notizen

**Spätere Erweiterung:**
- Auto-Detection basierend auf Browser-Locale
- `navigator.language` → 'de-DE' → Montag, 'en-US' → Sonntag
- Aber: Explizite Einstellung überschreibt Auto-Detection

**Betroffene Views (später):**
- Year View ✅
- Wochen-Statistiken
- Kalender-Integration (wenn vorhanden)

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
