---
type: story
status: backlog
priority: p0
effort: 2
feature: project-tracking
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [projects, stats, dashboard, p0]
---

# POMO-105: Project Stats Integration

## User Story

> Als **Particle-Nutzer**
> möchte ich **in meinen globalen Statistiken sehen, wie sich meine Zeit auf Projekte verteilt**,
> damit **ich verstehe, wo mein Fokus hingeht**.

## Kontext

Link zum Feature: [[features/project-tracking]]

Abhängigkeiten:
- [[stories/backlog/POMO-100-project-data-model]]
- [[features/statistics-dashboard]] (bestehend)

Diese Story integriert Projekt-Daten in das bestehende Statistics Dashboard. Es fügt einen "By Project" Breakdown hinzu, ohne das bestehende Layout zu stören.

## Akzeptanzkriterien

### Neuer Section: "By Project"
- [ ] **Given** ich bin im Statistics View (`G S`), **When** ich scrolle, **Then** sehe ich einen "By Project" Section
- [ ] **Given** die "By Project" Section, **When** Projekte mit Partikeln existieren, **Then** sehe ich eine Breakdown-Liste
- [ ] **Given** die Breakdown-Liste, **When** ich sie sehe, **Then** zeigt jedes Projekt: Name, Partikel-Count, Prozent, Bar-Visualisierung

### Zeitraum-Filter
- [ ] **Given** der Stats View zeigt "This Week", **When** ich "By Project" sehe, **Then** zeigt es nur Partikel dieser Woche
- [ ] **Given** der Stats View zeigt "This Month", **When** ich "By Project" sehe, **Then** zeigt es nur Partikel dieses Monats
- [ ] **Given** der Stats View zeigt "All Time", **When** ich "By Project" sehe, **Then** zeigt es alle Partikel

### Sortierung & Darstellung
- [ ] **Given** mehrere Projekte, **When** ich die Liste sehe, **Then** sind sie nach Partikel-Count sortiert (highest first)
- [ ] **Given** ein Projekt hat 0 Partikel im Zeitraum, **When** ich die Liste sehe, **Then** erscheint es nicht
- [ ] **Given** "No Project" Partikel existieren, **When** ich die Liste sehe, **Then** erscheint "No Project" als letzter Eintrag

### Klickbarkeit
- [ ] **Given** ich sehe ein Projekt in der Liste, **When** ich darauf klicke, **Then** navigiere ich zum Project Detail View

## Technische Details

### Betroffene Dateien
```
src/
├── components/
│   ├── stats/
│   │   ├── StatsProjectBreakdown.tsx  # NEU
│   │   └── StatsDashboard.tsx         # Erweitern
│   └── projects/
│       └── index.ts
└── lib/
    └── stats/
        └── project-stats.ts           # NEU: Aggregation Logic
```

### Implementierungshinweise

**Aggregation Function:**
```typescript
interface ProjectBreakdown {
  projectId: string | null;
  projectName: string;
  particleCount: number;
  percentage: number;
  totalDuration: number;
}

async function getProjectBreakdown(
  timeRange: 'week' | 'month' | 'all'
): Promise<ProjectBreakdown[]> {
  // 1. Filter particles by timeRange
  // 2. Group by projectId
  // 3. Calculate counts and percentages
  // 4. Sort by particleCount DESC
  // 5. Add "No Project" at end if exists
}
```

**StatsProjectBreakdown Component:**
```typescript
interface StatsProjectBreakdownProps {
  breakdown: ProjectBreakdown[];
  onProjectClick: (projectId: string | null) => void;
}
```

**Integration in StatsDashboard:**
```typescript
// In StatsDashboard.tsx
// After existing stats sections:

<StatsProjectBreakdown
  breakdown={projectBreakdown}
  onProjectClick={handleProjectClick}
/>
```

## UI/UX

### Stats Dashboard mit Project Breakdown

```
+-----------------------------------------------------------+
|  Statistics                              [D] [W] [M] [Y]  |
+-----------------------------------------------------------+
|                                                           |
|  ... existing stats (Focus Score, Total Time, etc.) ...   |
|                                                           |
|  ---------------------------------------------------------|
|                                                           |
|  By Project                                               |
|                                                           |
|  Website Redesign                                         |
|  ================---------------- 12 Partikel (48%)       |
|                                                           |
|  Mobile App                                               |
|  =========------------------------ 8 Partikel (32%)       |
|                                                           |
|  Freelance: Client A                                      |
|  ====---------------------------- 3 Partikel (12%)        |
|                                                           |
|  No Project                                               |
|  ==------------------------------- 2 Partikel (8%)        |
|                                                           |
+-----------------------------------------------------------+
```

### Visual Details

**Bar-Visualisierung:**
- Horizontal Bar, monochrom
- Filled portion = Prozent der gesamten Partikel
- Breite: 100% des Containers
- Höhe: 8px
- Border-radius: 4px

**Projekt-Zeile:**
```
Project Name
[===========-----------------] 12 Partikel (48%)
```

- Project Name: Primary Text
- Bar: Unter dem Namen, volle Breite
- Count + Percent: Rechts aligned, Secondary Text

**"No Project":**
- Separator (dünne Linie) darüber
- Leicht anders gestylt (z.B. italic oder lighter)

### Interactions

- **Hover:** Leichte Elevation/Highlight
- **Click:** Navigiert zu `/projects/:id` oder `/projects/no-project`
- **Keyboard:** Nicht in dieser Section (optional für später)

### Empty State

Wenn keine Partikel im Zeitraum:
```
By Project

No focus sessions in this period.
```

## Testing

### Manuell zu testen
- [ ] "By Project" Section erscheint im Stats View
- [ ] Breakdown zeigt korrekte Projekte
- [ ] Partikel-Counts sind korrekt
- [ ] Prozentzahlen summieren sich auf 100%
- [ ] Bar-Breiten entsprechen Prozenten
- [ ] Zeitraum-Filter (D/W/M/Y) aktualisiert die Daten
- [ ] Click navigiert zum Project Detail
- [ ] "No Project" erscheint wenn relevant
- [ ] Sortierung: Highest count first
- [ ] Projekte mit 0 Partikeln erscheinen nicht

### Automatisierte Tests
- [ ] Unit Test: getProjectBreakdown aggregation
- [ ] Unit Test: Percentage calculation
- [ ] Unit Test: Sorting by count
- [ ] Component Test: StatsProjectBreakdown renders
- [ ] Component Test: Click handler fires
- [ ] Integration Test: Filters by timeRange

## Definition of Done

- [ ] Code implementiert
- [ ] StatsProjectBreakdown Component fertig
- [ ] Integration in StatsDashboard
- [ ] Zeitraum-Filter funktioniert
- [ ] Bar-Visualisierung korrekt
- [ ] Click-Navigation funktioniert
- [ ] "No Project" Handling
- [ ] Tests geschrieben & grün
- [ ] Code reviewed

## Notizen

**Design-Entscheidung:**
- Bars statt Pie Chart (passt besser zu monochrom, besser lesbar)
- Max 10 Projekte anzeigen, dann "Show all →"

**Performance:**
- Breakdown wird bei Mount berechnet, nicht live
- Bei Zeitraum-Wechsel: Neu berechnen

**Abhängigkeiten:**
- Bestehende Stats-Infrastruktur nutzen (Zeitraum-Filter)
- Bestehende Navigation-Patterns nutzen

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
