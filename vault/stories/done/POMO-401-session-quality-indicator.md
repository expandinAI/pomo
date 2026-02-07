---
type: story
status: done
priority: p1
effort: 2
feature: null
created: 2026-02-07
updated: 2026-02-07
done_date: 2026-02-07
tags: [coach, timeline, celebration, delight]
---

# POMO-401: Session Quality Indicator

## User Story

> Als **Particle-User**
> möchte ich **nach einer Session ein subtiles Qualitäts-Label sehen**,
> damit **meine Particles individuelle Bedeutung bekommen und Deep Work sichtbar gefeiert wird**.

## Kontext

Jedes Particle ist gleich — egal ob 10 Minuten E-Mails oder 90 Minuten Deep Work. Ein Quality Indicator gibt herausragenden Sessions eine subtile Auszeichnung. Keine Bewertung, keine Schuld — nur Anerkennung für besondere Momente.

Quelle: 10x Session 2 — "Subtle delight, zero risk"

## Design-Entscheidungen

### 3 Quality-Typen (feste Thresholds, nicht konfigurierbar)

| Typ | Bedingung | Icon | Label | Philosophie |
|-----|-----------|------|-------|-------------|
| **Deep Work** | `duration >= 2700` (45+ min) | `Flame` | "Deep Work" | Lange, konzentrierte Arbeit würdigen |
| **Quick Focus** | `duration < 900` (< 15 min) | `Zap` | "Quick Focus" | Schnelle, gezielte Bursts anerkennen |
| **Overflow Champion** | `overflowDuration > 0 && duration > estimatedDuration * 1.5` | `Trophy` | "Overflow Champion" | Über das Ziel hinaus — Flow-State |

**Priorität bei Overlap:** Overflow Champion > Deep Work > Quick Focus
(Eine 60-Min-Session mit 150% Overflow ist "Overflow Champion", nicht "Deep Work")

**Nur für Work-Sessions.** Breaks bekommen keinen Quality Indicator.

### Visuell: Icon + Text

- Lucide-Icons (`Flame`, `Zap`, `Trophy`)
- Monochrome (`text-tertiary`, kein Gold/Farbe)
- Dezent, nicht dominant — Information, nicht Dekoration

## Akzeptanzkriterien

- [ ] **Given** Work-Session >= 45 min, **When** Session completed, **Then** "Deep Work" Badge mit Flame-Icon in Celebration, Timeline-Tooltip und ParticleDetailOverlay
- [ ] **Given** Work-Session < 15 min, **When** Session completed, **Then** "Quick Focus" Badge mit Zap-Icon
- [ ] **Given** Work-Session mit Overflow > 150% der geplanten Dauer, **When** Session completed, **Then** "Overflow Champion" Badge mit Trophy-Icon
- [ ] **Given** Work-Session 15-44 min ohne Overflow, **When** Session completed, **Then** kein Quality Badge (normales Particle)
- [ ] **Given** Break-Session beliebiger Dauer, **When** Session completed, **Then** kein Quality Badge
- [ ] **Given** Session ohne `estimatedDuration`, **When** Overflow-Check, **Then** Overflow Champion nicht möglich (nur Deep Work / Quick Focus)

## Technische Details

### Betroffene Dateien

```
src/
├── lib/
│   └── session-quality.ts              # NEU: Pure function getSessionQuality()
├── components/
│   ├── timer/
│   │   ├── Timer.tsx                   # Quality in Celebration-Moment anzeigen
│   │   └── ParticleDetailOverlay.tsx   # Quality Badge Sektion
│   └── timeline/
│       └── TimelineBlock.tsx           # Quality im Tooltip
├── hooks/
│   └── useTimelineData.ts             # TimelineSession um quality erweitern
└── styles/
    └── design-tokens.ts               # (optional) Quality-Icon Mapping
```

### Implementierungshinweise

#### 1. Pure Quality Function (`src/lib/session-quality.ts`)

```typescript
import { Flame, Zap, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SessionQuality = 'deep_work' | 'quick_focus' | 'overflow_champion';

export interface SessionQualityInfo {
  type: SessionQuality;
  label: string;
  icon: LucideIcon;
}

const DEEP_WORK_THRESHOLD = 2700;      // 45 min in seconds
const QUICK_FOCUS_THRESHOLD = 900;     // 15 min in seconds
const OVERFLOW_CHAMPION_RATIO = 1.5;   // 150% of planned

export function getSessionQuality(
  duration: number,
  estimatedDuration?: number,
  overflowDuration?: number,
): SessionQualityInfo | null {
  // Overflow Champion (highest priority)
  if (
    overflowDuration &&
    overflowDuration > 0 &&
    estimatedDuration &&
    duration > estimatedDuration * OVERFLOW_CHAMPION_RATIO
  ) {
    return { type: 'overflow_champion', label: 'Overflow Champion', icon: Trophy };
  }

  // Deep Work
  if (duration >= DEEP_WORK_THRESHOLD) {
    return { type: 'deep_work', label: 'Deep Work', icon: Flame };
  }

  // Quick Focus
  if (duration < QUICK_FOCUS_THRESHOLD) {
    return { type: 'quick_focus', label: 'Quick Focus', icon: Zap };
  }

  // Normal session — no badge
  return null;
}
```

**Wichtig:** Keine React-Imports in der Funktion nötig — Icons sind nur Typ-Referenzen. Die eigentliche Render-Logik nutzt die Info.

#### 2. Celebration-Moment (Timer.tsx)

Nach Session-Completion (StatusMessage-Bereich oder Celebration-Animation):

```tsx
const quality = getSessionQuality(sessionDuration, estimatedDuration, overflowDuration);

// Im StatusMessage oder Celebration:
{quality && (
  <span className="inline-flex items-center gap-1 text-xs text-tertiary">
    <quality.icon className="w-3 h-3" />
    {quality.label}
  </span>
)}
```

**Position:** Unter "Well done!" Text, als zusätzliche Zeile. Dezent, nicht dominant.

#### 3. Timeline-Tooltip (TimelineBlock.tsx)

Neben bestehendem Alignment-Badge:

```tsx
// Nach "· Aligned" / "· Reactive":
{quality && (
  <span className="flex items-center gap-1">
    <quality.icon className="w-3 h-3" />
    {quality.label}
  </span>
)}
```

**Datenfluss:** `TimelineSession` in `useTimelineData.ts` braucht kein neues Feld — Quality wird zur Render-Zeit berechnet aus bestehenden Feldern (`duration`, `estimatedDuration`, `overflowDuration`). Falls `overflowDuration` noch nicht in `TimelineSession` ist, muss es ergänzt werden.

#### 4. ParticleDetailOverlay

Neue Sektion zwischen Duration-Hero und Overflow-Badge:

```tsx
{quality && (
  <div className="flex items-center gap-2 text-sm text-tertiary">
    <quality.icon className="w-4 h-4" />
    <span>{quality.label}</span>
  </div>
)}
```

**Position:** Direkt unter der Duration-Anzeige, vor dem Overflow-Badge.

### Datenbank-Änderungen

Keine. Quality wird zur Render-Zeit berechnet — kein neues DB-Feld nötig.

### API-Änderungen

Keine.

## UI/UX

### Celebration Screen

```
┌─────────────────────────────────┐
│                                 │
│          Well done!             │
│                                 │
│        🔥 Deep Work             │  ← Quality Badge (nur wenn zutreffend)
│                                 │
│     [Timer resets to break]     │
│                                 │
└─────────────────────────────────┘
```

### Timeline Tooltip

```
┌──────────────────────────┐
│ Project Name  ●          │
│ Task description         │
│ 13:45 – 14:30            │
│ 45 min                   │
│ · Aligned                │
│ 🔥 Deep Work             │  ← Quality Badge
└──────────────────────────┘
```

### ParticleDetailOverlay

```
┌──────────────────────────────┐
│  ·  3rd particle  Feb 4      │
│                              │
│     13:45 → 14:30            │
│                              │
│        45 min                │
│     [-5] [-1] [+1] [+5]     │
│                              │
│  🔥 Deep Work                │  ← Quality Badge (NEU)
│                              │
│  ⚡ +12 overflow             │
│     25 planned → 37 actual   │
│                              │
│  What did you work on?       │
│  ...                         │
└──────────────────────────────┘
```

## Testing

### Manuell zu testen

- [ ] 10-min Work-Session → "Quick Focus" Badge überall
- [ ] 25-min Work-Session → Kein Badge
- [ ] 50-min Work-Session → "Deep Work" Badge überall
- [ ] 25-min Session mit 40-min tatsächlich (160%) → "Overflow Champion"
- [ ] 50-min Session mit 80-min tatsächlich (160%) → "Overflow Champion" (nicht Deep Work)
- [ ] Break-Session beliebiger Länge → Kein Badge
- [ ] Session ohne estimatedDuration, 50 min → Deep Work (nicht Overflow)

### Automatisierte Tests

- [ ] Unit Tests für `getSessionQuality()` — alle Typen, Edge Cases, Prioritäten
- [ ] Test: Overflow ohne estimatedDuration → null für Overflow
- [ ] Test: Break-Sessions werden nicht übergeben (Caller-Verantwortung)

## Definition of Done

- [ ] `getSessionQuality()` pure function mit Unit Tests
- [ ] Quality Badge in Celebration-Moment (Timer.tsx)
- [ ] Quality Badge in Timeline-Tooltip (TimelineBlock.tsx)
- [ ] Quality Badge in ParticleDetailOverlay
- [ ] `pnpm typecheck` bestanden
- [ ] `pnpm lint` bestanden
- [ ] `pnpm test` bestanden
- [ ] Lokal getestet (alle 3 Quality-Typen + kein Badge)

## Notizen

- **Kein neues DB-Feld** — Quality ist abgeleitet, nicht gespeichert. Das hält die Architektur sauber und erlaubt spätere Threshold-Anpassungen ohne Migration.
- **Keine Konfigurierbarkeit** — Feste Thresholds. Weniger Settings-Bloat, konsistentere UX.
- **Overflow Champion braucht estimatedDuration** — Sessions ohne Schätzung (z.B. alte Daten) können nur Deep Work oder Quick Focus sein.
- `TimelineSession` in `useTimelineData.ts` muss ggf. um `estimatedDuration` und `overflowDuration` erweitert werden (prüfen ob bereits vorhanden).

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
