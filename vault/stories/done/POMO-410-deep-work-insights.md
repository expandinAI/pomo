---
type: story
status: done
priority: p1
effort: 5
feature: null
created: 2026-02-08
updated: 2026-02-08
done_date: 2026-02-08
tags: [insights, deep-work, overflow, dashboard, analytics]
---

# POMO-410: Deep Work Insights

## User Story

> Als **Particle-User**
> möchte ich **sehen, wie viel meiner Fokuszeit echtes Deep Work war und wie oft ich im Flow über die geplante Zeit hinausgegangen bin**,
> damit **ich meine Konzentrationsfähigkeit über die Zeit verstehe und bewusst mehr Deep Work anstrebe**.

## Kontext

Particle speichert bereits alle nötigen Daten: `duration`, `overflowDuration`, `estimatedDuration`. POMO-401 hat die Qualitäts-Labels eingeführt (Deep Work >= 45min, Quick Focus < 15min, Overflow Champion >= 150%). Aber diese Daten werden bisher nur pro Session angezeigt — nie aggregiert. POMO-410 macht die Daten als Dashboard-Insights sichtbar.

Quelle: 10x Roadmap — "Overflow data → user-facing"

### Philosophie

Deep Work Insights zeigen dem User ein Bild seiner Fokusqualität — **ohne zu bewerten**. Kein "Du musst mehr Deep Work machen". Stattdessen: "Das ist dein Profil. So fokussierst du." Stolz statt Schuld. Bewusstsein statt Druck.

## Design-Entscheidungen

### Was wir zeigen

| Metrik | Berechnung | Warum |
|--------|-----------|-------|
| **Deep Work Ratio** | % der Work-Sessions >= 45 min | Kernmetrik: Wie viel ist echtes Deep Work? |
| **Avg Session Duration** | Durchschnitt aller Work-Sessions | Kontext für die Ratio |
| **Flow Sessions** | Anzahl Sessions mit Overflow > 0 | Wie oft gehst du über die geplante Zeit hinaus? |
| **Total Overflow Time** | Summe aller `overflowDuration` | Die "geschenkte" Extrazeit in Flow |
| **Quality Breakdown** | Mini-Bar: Deep Work / Normal / Quick Focus | Visuelles Profil auf einen Blick |

### Was wir NICHT zeigen

- **Kein Score** — Keine Zahl von 0-100 die "bewertet"
- **Kein Vergleich mit "Ideal"** — Kein "Du solltest 60% Deep Work haben"
- **Keine Streak** — Kein "5 Tage in Folge Deep Work"
- **Keine Tages-Aufschlüsselung** — Dashboard-Kontext reicht (TimeRange-Filter gibt es schon)

### Visual Approach: Stacked Bar

Statt Zahlen dominiert eine horizontale Stacked Bar, die das Verhältnis der drei Qualitätstypen zeigt. Das ist auf einen Blick erfassbar und braucht keine Legende — die Farben/Abstufungen sprechen für sich.

## Akzeptanzkriterien

- [x] **Given** Sessions im gewählten TimeRange, **When** Dashboard öffne, **Then** sehe ich eine Deep Work Insights Card mit Stacked Bar und Metriken
- [x] **Given** Keine Work-Sessions im TimeRange, **When** Dashboard öffne, **Then** Card ist hidden (return null)
- [x] **Given** Sessions mit overflowDuration > 0, **When** Card angezeigt, **Then** sehe ich "X flow sessions" und die Total Overflow Time
- [x] **Given** Alle Sessions < 45 min, **When** Card angezeigt, **Then** Deep Work Ratio zeigt 0% und Bar zeigt nur Normal/Quick Focus
- [x] **Given** TimeRange wechsle, **When** neuer Range selektiert, **Then** Metriken aktualisieren sich
- [x] **Given** Nur 1 Work-Session, **When** Card angezeigt, **Then** Metriken sind korrekt (kein Division-by-zero, Bar zeigt 100% für den entsprechenden Typ)
- [x] **Given** Sessions ohne `estimatedDuration`, **When** Overflow berechnet, **Then** Overflow Champion wird korrekt ignoriert (nur Deep Work / Quick Focus)

## Technische Details

### Betroffene Dateien

```
src/
├── lib/
│   ├── deep-work-insights.ts                    # NEU: Pure functions
│   └── __tests__/
│       └── deep-work-insights.test.ts           # NEU: Unit Tests
├── components/
│   └── insights/
│       ├── DeepWorkInsightsCard.tsx              # NEU: Dashboard Card
│       └── OverviewTab.tsx                       # MODIFY: Card einfügen
```

### Implementierungshinweise

#### 1. Pure Functions (`src/lib/deep-work-insights.ts`)

```typescript
import type { CompletedSession } from '@/lib/session-storage';
import { getSessionQuality } from '@/lib/session-quality';

export interface DeepWorkBreakdown {
  deepWork: number;     // Anzahl Sessions >= 45 min
  normal: number;       // Anzahl Sessions 15-44 min
  quickFocus: number;   // Anzahl Sessions < 15 min
  overflow: number;     // Anzahl Sessions mit overflowDuration > 0
}

export interface DeepWorkInsights {
  totalWorkSessions: number;
  breakdown: DeepWorkBreakdown;
  deepWorkRatio: number;           // 0-1 (Anteil Deep Work Sessions)
  avgSessionDuration: number;      // Durchschnittliche Dauer in Sekunden
  flowSessions: number;            // Sessions mit Overflow > 0
  totalOverflowSeconds: number;    // Summe aller overflowDuration
}

export function buildDeepWorkInsights(
  sessions: CompletedSession[]
): DeepWorkInsights | null;
```

**Wichtig:** Nutzt `getSessionQuality()` aus `session-quality.ts` für konsistente Thresholds. Keine eigenen Magic Numbers.

#### 2. Dashboard Card (`src/components/insights/DeepWorkInsightsCard.tsx`)

```typescript
interface DeepWorkInsightsCardProps {
  sessions: CompletedSession[];  // filteredSessions (respects TimeRange)
}
```

- Ruft `buildDeepWorkInsights(sessions)` via `useMemo` auf
- Returns `null` wenn keine Work-Sessions
- Styling konsistent mit `TaskIntelligenceCard` und `MonthlyRecapCard`
- Stacked Bar als zentrales Element
- Metriken darunter in kompaktem Layout

#### 3. Integration in OverviewTab

Einfügen zwischen MonthlyRecapCard und Projects Breakdown:

```tsx
{/* Deep Work Insights */}
<DeepWorkInsightsCard sessions={filteredSessions} />
```

**Nutzt `filteredSessions`** (nicht `sessions`), damit die Card den TimeRange-Filter respektiert. Im Gegensatz zu MonthlyRecapCard, die immer den aktuellen Monat zeigt, passt sich Deep Work Insights dem gewählten Zeitraum an.

### Datenbank-Änderungen

Keine. Alle Daten werden aus bestehenden Session-Feldern berechnet.

### API-Änderungen

Keine.

## UI/UX

### Card Layout

```
┌──────────────────────────────────────┐
│  Focus Profile                       │
│                                      │
│  ┌──────────────────────────────┐    │
│  │████████████▒▒▒▒▒▒▒░░░░░░░░░│    │  ← Stacked Bar
│  └──────────────────────────────┘    │
│  Deep Work     Normal    Quick       │
│                                      │
│  42% deep work  ·  Ø 38m            │
│                                      │
│  5 flow sessions  ·  +47m overflow   │
└──────────────────────────────────────┘
```

### Stacked Bar Details

| Segment | Bedingung | Darstellung |
|---------|-----------|-------------|
| Deep Work | `getSessionQuality() → deep_work` | `bg-primary light:bg-primary-dark` (hell) |
| Normal | `getSessionQuality() → null` | `bg-tertiary/30 light:bg-tertiary-dark/30` |
| Quick Focus | `getSessionQuality() → quick_focus` | `bg-tertiary/10 light:bg-tertiary-dark/10` (subtilster) |

**Keine Farben** — Schwarz/Weiß-Abstufungen. Deep Work ist am sichtbarsten, Quick Focus am subtilsten. Monochrom, Particle-treu.

### Metriken-Zeile

```
42% deep work  ·  Ø 38m
```

- Deep Work Ratio als Prozent (gerundet, keine Nachkommastellen)
- Durchschnittliche Session-Dauer in Minuten

### Flow-Zeile (nur wenn Overflow-Sessions existieren)

```
5 flow sessions  ·  +47m overflow
```

- Anzahl Sessions mit overflowDuration > 0
- Summe aller Overflow-Minuten
- **Nur anzeigen wenn `flowSessions > 0`** — sonst Zeile weglassen

### Responsive

- Stacked Bar hat `min-h` von 8px, `rounded-full`
- Labels unter der Bar in `text-xs text-tertiary`
- Segmente haben 1px Gap (wie Timeline-Blocks)

## Testing

### Manuell zu testen

- [x] 5+ Deep Work Sessions → Bar zeigt dominantes Deep Work Segment
- [x] Nur Quick Focus Sessions → Bar zeigt nur Quick Focus, Ratio = 0%
- [x] Mix aus allen Typen → Bar spiegelt Verhältnis wider
- [x] Sessions mit Overflow → Flow-Zeile sichtbar
- [x] Keine Overflow-Sessions → Flow-Zeile hidden
- [x] TimeRange auf "Day" mit 0 Sessions → Card hidden
- [x] TimeRange wechseln → Metriken aktualisieren
- [x] Light + Dark Mode korrekt
- [x] 1 Session → Kein Division-by-zero, Bar zeigt 100%

### Automatisierte Tests (`src/lib/__tests__/deep-work-insights.test.ts`)

- [x] `buildDeepWorkInsights` mit leerer Liste → null
- [x] `buildDeepWorkInsights` mit nur Breaks → null
- [x] Korrekte Breakdown: Deep Work / Normal / Quick Focus Counts
- [x] Deep Work Ratio korrekt berechnet
- [x] Avg Session Duration korrekt
- [x] Flow Sessions: Zählung von Sessions mit `overflowDuration > 0`
- [x] Total Overflow Seconds: Summe aller `overflowDuration`
- [x] Sessions ohne `overflowDuration` → flowSessions = 0, totalOverflow = 0
- [x] Nur 1 Session → Insights korrekt (kein NaN)
- [x] Overflow Champion Sessions werden als `overflow` im Breakdown gezählt (nicht doppelt)

## Definition of Done

- [x] `buildDeepWorkInsights()` pure function mit Unit Tests
- [x] `DeepWorkInsightsCard` Component mit Stacked Bar
- [x] Card in OverviewTab integriert (zwischen MonthlyRecap und Projects)
- [x] Card respektiert TimeRange-Filter
- [x] Card hidden wenn keine Work-Sessions
- [x] Stacked Bar monochrom, keine Farben
- [x] Flow-Zeile nur sichtbar wenn Overflow-Sessions existieren
- [x] `pnpm typecheck` bestanden
- [x] `pnpm lint` bestanden
- [x] `pnpm test` bestanden
- [x] Light + Dark Mode getestet

## Notizen

- **Baut auf POMO-401 auf:** Nutzt `getSessionQuality()` für konsistente Thresholds (45 min Deep Work, 15 min Quick Focus, 150% Overflow Champion)
- **Kein neues DB-Feld** — alles abgeleitet aus `duration`, `overflowDuration`, `estimatedDuration`
- **Overflow Champion ist ein Subset von Flow Sessions** — Overflow Champion braucht 150% der geplanten Zeit, Flow Sessions brauchen nur `overflowDuration > 0`. In der Breakdown zählt Overflow Champion als eigener Bucket, in der Flow-Zeile zählen alle Sessions mit Overflow.
- **`detectSessionLengthPattern()` in `coach/patterns.ts`** macht bereits ähnliche Berechnungen (Avg actual vs estimated), aber für den Coach-Kontext. Deep Work Insights ist die user-facing Version davon.
- **Stacked Bar statt Pie Chart** — horizontale Bars sind schneller erfassbar, brauchen weniger Platz, und passen besser zum linearen Particle-Design.

---

## Arbeitsverlauf

### Gestartet:
2026-02-08

### Erledigt:
2026-02-08
