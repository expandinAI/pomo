---
type: story
status: backlog
priority: p0
effort: 3
feature: year-view
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [year-view, data, aggregation, p0]
---

# POMO-110: Year View Data Aggregation

## User Story

> Als **Particle-Nutzer**
> möchte ich **meine Partikel eines ganzen Jahres aggregiert abrufen können**,
> damit **ich mein Lebenswerk visualisiert sehen kann**.

## Kontext

Link zum Feature: [[features/year-view]]

Dies ist die Daten-Foundation für die Year View. Ohne diese Aggregation gibt es nichts zu visualisieren. Die Daten müssen performant sein – 365 Tage mit allen Details dürfen nicht länger als 100ms zum Laden brauchen.

## Akzeptanzkriterien

### Daten-Aggregation
- [ ] **Given** Partikel existieren, **When** ich `getYearViewData(2025)` aufrufe, **Then** erhalte ich Daten für alle 365/366 Tage
- [ ] **Given** ein Tag hat Partikel, **When** ich die Daten sehe, **Then** enthält er: particleCount, totalDuration, topTask, topProject
- [ ] **Given** ein Tag hat 0 Partikel, **When** ich die Daten sehe, **Then** ist particleCount = 0 und die anderen Felder leer/null

### Persönliches Maximum
- [ ] **Given** ich rufe Jahresdaten ab, **When** die Daten geladen sind, **Then** enthält das Ergebnis das `personalMax` (höchster Tageswert)
- [ ] **Given** mehrere Tage mit gleichem Maximum, **When** ich das Maximum sehe, **Then** wird der erste (chronologisch) als Peak markiert

### Summary Stats
- [ ] **Given** ich rufe Jahresdaten ab, **When** die Daten geladen sind, **Then** enthält das Ergebnis: totalParticles, totalDuration, longestStreak, activeDays
- [ ] **Given** Streak-Berechnung, **When** ein Tag ≥1 Partikel hat, **Then** zählt er zur Streak
- [ ] **Given** ein Tag mit 0 Partikeln, **When** er zwischen aktiven Tagen liegt, **Then** unterbricht er die Streak

### Projekt-Filter (Vorbereitung)
- [ ] **Given** ein optionaler projectId Parameter, **When** ich ihn übergebe, **Then** werden nur Partikel dieses Projekts gezählt

### Performance
- [ ] **Given** ein Jahr mit vielen Partikeln, **When** ich die Daten lade, **Then** dauert es <100ms

## Technische Details

### Datenstrukturen

```typescript
// src/lib/year-view/types.ts

export interface YearViewDay {
  date: Date;
  particleCount: number;
  totalDuration: number;        // in Minuten
  topTask?: string;             // Task mit meister Zeit an dem Tag
  topProject?: {
    id: string;
    name: string;
  };
  isPeakDay: boolean;           // Ist dies der produktivste Tag?
}

export interface YearViewSummary {
  totalParticles: number;
  totalDuration: number;        // in Minuten
  longestStreak: number;        // Tage in Folge
  activeDays: number;           // Tage mit ≥1 Partikel
  averagePerActiveDay: number;  // Durchschnitt an aktiven Tagen
}

export interface YearViewData {
  year: number;
  days: YearViewDay[];          // 365 oder 366 Einträge
  summary: YearViewSummary;
  personalMax: number;          // Höchste Partikel-Anzahl an einem Tag
  peakDate: Date;               // Datum des produktivsten Tages
}
```

### API-Funktion

```typescript
// src/lib/year-view/data.ts

export async function getYearViewData(
  year: number,
  projectId?: string | null
): Promise<YearViewData> {
  // 1. Alle Partikel des Jahres laden
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  const particles = await getParticlesInRange(startOfYear, endOfYear, projectId);

  // 2. Nach Tag gruppieren
  const dayMap = groupParticlesByDay(particles);

  // 3. Alle 365/366 Tage generieren (auch leere)
  const days = generateAllDaysOfYear(year, dayMap);

  // 4. Personal Max finden
  const { personalMax, peakDate } = findPeakDay(days);

  // 5. Peak Day markieren
  days.forEach(d => {
    d.isPeakDay = isSameDay(d.date, peakDate);
  });

  // 6. Summary berechnen
  const summary = calculateSummary(days);

  return { year, days, summary, personalMax, peakDate };
}
```

### Hilfsfunktionen

```typescript
// Partikel nach Tag gruppieren
function groupParticlesByDay(particles: Particle[]): Map<string, DayAggregation> {
  const map = new Map();

  for (const p of particles) {
    const key = formatDateKey(p.completedAt); // "2025-01-15"
    const existing = map.get(key) || { particles: [], totalDuration: 0 };
    existing.particles.push(p);
    existing.totalDuration += p.duration;
    map.set(key, existing);
  }

  return map;
}

// Top Task eines Tages finden
function findTopTask(particles: Particle[]): string | undefined {
  if (particles.length === 0) return undefined;

  const taskDurations = new Map<string, number>();
  for (const p of particles) {
    if (p.task) {
      const current = taskDurations.get(p.task) || 0;
      taskDurations.set(p.task, current + p.duration);
    }
  }

  let topTask: string | undefined;
  let maxDuration = 0;
  taskDurations.forEach((duration, task) => {
    if (duration > maxDuration) {
      maxDuration = duration;
      topTask = task;
    }
  });

  return topTask;
}

// Streak berechnen
function calculateLongestStreak(days: YearViewDay[]): number {
  let longest = 0;
  let current = 0;

  for (const day of days) {
    if (day.particleCount > 0) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}
```

### Betroffene Dateien

```
src/
└── lib/
    └── year-view/
        ├── types.ts              # Interfaces
        ├── data.ts               # getYearViewData
        ├── aggregation.ts        # Hilfsfunktionen
        └── index.ts              # Exports
```

## Testing

### Manuell zu testen
- [ ] Leeres Jahr (keine Partikel) → 365 Tage mit 0
- [ ] Jahr mit Daten → Korrekte Counts pro Tag
- [ ] Top Task wird korrekt ermittelt
- [ ] Top Project wird korrekt ermittelt
- [ ] Personal Max ist korrekt
- [ ] Peak Day ist markiert
- [ ] Streak-Berechnung ist korrekt
- [ ] Summary-Zahlen stimmen
- [ ] Projekt-Filter funktioniert
- [ ] Performance <100ms

### Automatisierte Tests

```typescript
describe('getYearViewData', () => {
  it('returns 365 days for a non-leap year', async () => {
    const data = await getYearViewData(2025);
    expect(data.days).toHaveLength(365);
  });

  it('returns 366 days for a leap year', async () => {
    const data = await getYearViewData(2024);
    expect(data.days).toHaveLength(366);
  });

  it('correctly identifies peak day', async () => {
    // Setup: Create particles with known max
    await createParticle({ date: '2025-03-15', count: 10 });
    await createParticle({ date: '2025-06-20', count: 5 });

    const data = await getYearViewData(2025);
    expect(data.personalMax).toBe(10);
    expect(data.peakDate).toEqual(new Date(2025, 2, 15));
  });

  it('calculates streak correctly', async () => {
    // 5 consecutive days
    for (let i = 0; i < 5; i++) {
      await createParticle({ date: `2025-01-${10 + i}` });
    }

    const data = await getYearViewData(2025);
    expect(data.summary.longestStreak).toBe(5);
  });

  it('filters by project when projectId provided', async () => {
    await createParticle({ projectId: 'proj-1' });
    await createParticle({ projectId: 'proj-2' });

    const data = await getYearViewData(2025, 'proj-1');
    expect(data.summary.totalParticles).toBe(1);
  });

  it('completes in under 100ms', async () => {
    const start = performance.now();
    await getYearViewData(2025);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });
});
```

## Definition of Done

- [ ] TypeScript Interfaces definiert
- [ ] getYearViewData Funktion implementiert
- [ ] Alle Hilfsfunktionen implementiert
- [ ] Projekt-Filter funktioniert
- [ ] Performance <100ms
- [ ] Tests geschrieben & grün
- [ ] Code reviewed

## Notizen

**Performance-Optimierung:**
- Partikel nur einmal aus DB laden
- In-Memory Aggregation
- Keine redundanten Berechnungen

**Schaltjahr:**
- 2024 ist ein Schaltjahr (366 Tage)
- 2025, 2026, 2027 sind keine (365 Tage)
- Formel: `(year % 4 === 0 && year % 100 !== 0) || year % 400 === 0`

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
