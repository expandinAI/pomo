---
type: story
status: done
priority: p2
effort: 1
feature: particle-legacy
created: 2026-02-05
updated: 2026-02-05
done_date: 2026-02-05
tags: [legacy, account, emotional, enhancement]
---

# POMO-370: Particle Age im Account-Menu

## User Story

> As a **logged-in Particle user**,
> I want **to see how long I've been collecting particles**,
> so that **I feel a sense of journey and commitment that only grows**.

## Context

Das AccountMenu zeigt aktuell: E-Mail, Tier-Badge, Appearance-Mode, Settings, Library, Sign Out. Kein Gefuehl fuer die "Reise". Die Infrastruktur existiert bereits:

- `getLifetimeStats()` in `src/lib/session-analytics.ts` liefert `firstSessionDate`
- `TotalHoursCounter` in Statistics zeigt bereits "Since {date}" — aber versteckt im Dashboard

Dieses Feature bringt die Information an einen sichtbaren, emotionalen Ort: das AccountMenu.

### Was es NICHT ist

- Kein Streak (Streaks brechen, das erzeugt Schuld)
- Kein Counter der sinkt (nur wachsen)
- Keine Gamification ("Level 5 User!")

## Acceptance Criteria

### Display

- [ ] Im AccountMenu unter der E-Mail/Tier-Zeile: `"Collecting since {date}"` (z.B. "Collecting since Jan 5, 2026")
- [ ] Nur sichtbar wenn `firstSessionDate` existiert (mindestens 1 Partikel)
- [ ] Neuer User ohne Sessions: Zeile nicht anzeigen

### Datenquelle

- [ ] `getLifetimeStats()` aus `src/lib/session-analytics.ts` verwenden
- [ ] `formatFirstSessionDate()` fuer konsistente Datumsformatierung
- [ ] Kein neuer API-Call — Daten aus bestehender Session-Liste

### Styling

- [ ] Text: `text-xs text-tertiary` — subtil, nicht dominant
- [ ] Unter E-Mail, ueber den Menu-Items
- [ ] Kein Icon noetig — die Einfachheit ist das Design

## Technical Details

### Betroffene Datei

```
src/components/auth/AccountMenu.tsx
```

### Implementierung

```typescript
// Im AccountMenu, unter der E-Mail-Zeile:
import { getLifetimeStats, formatFirstSessionDate } from '@/lib/session-analytics';

// In der Komponente:
const stats = useMemo(() => getLifetimeStats(), []);
const collectingSince = stats.firstSessionDate
  ? formatFirstSessionDate(stats.firstSessionDate)
  : null;

// Im JSX, unter E-Mail + TierBadge:
{collectingSince && (
  <p className="text-xs text-tertiary light:text-tertiary-dark">
    Collecting since {collectingSince}
  </p>
)}
```

## Testing

- [ ] User mit Sessions: "Collecting since Jan 5, 2026" sichtbar
- [ ] Neuer User ohne Sessions: Zeile nicht sichtbar
- [ ] Datum formatiert sich korrekt (Locale)
- [ ] Light + Dark Mode testen

## Definition of Done

- [ ] Zeile im AccountMenu sichtbar fuer User mit Sessions
- [ ] Korrekte Datumsformatierung
- [ ] Typecheck + Lint bestanden
