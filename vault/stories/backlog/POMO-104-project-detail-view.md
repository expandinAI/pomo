---
type: story
status: backlog
priority: p0
effort: 3
feature: project-tracking
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [projects, view, detail, stats, p0]
---

# POMO-104: Project Detail View

## User Story

> Als **Particle-Nutzer**
> möchte ich **die Details eines Projekts mit allen zugehörigen Partikeln sehen**,
> damit **ich verstehe, wie viel Fokuszeit ich in dieses Projekt investiert habe**.

## Kontext

Link zum Feature: [[features/project-tracking]]

Abhängigkeiten:
- [[stories/backlog/POMO-100-project-data-model]]
- [[stories/backlog/POMO-103-project-list-view]]

Der Detail View zeigt alle Statistiken und Sessions für ein einzelnes Projekt. Er ist das "Deep Dive" in ein Kapitel des Lebenswerks.

## Akzeptanzkriterien

### Navigation
- [ ] **Given** ich bin in der Project List, **When** ich Enter auf einem Projekt drücke, **Then** öffnet sich der Detail View
- [ ] **Given** ich bin im Detail View, **When** ich `Escape` oder Backspace drücke, **Then** gehe ich zurück zur Liste

### Header
- [ ] **Given** ich bin im Detail View, **When** ich das Projekt sehe, **Then** zeigt der Header den Projektnamen
- [ ] **Given** ich bin im Detail View, **When** ich `E` drücke, **Then** öffnet sich das Edit Modal

### Partikel-Visualisierung
- [ ] **Given** das Projekt hat Partikel, **When** ich den View sehe, **Then** sehe ich eine visuelle Darstellung (Dots/Grid)
- [ ] **Given** die Visualisierung, **When** ich sie sehe, **Then** zeigt sie die Brightness des Projekts

### Statistiken
- [ ] **Given** das Projekt hat Partikel, **When** ich den View sehe, **Then** sehe ich "Total Partikel" und "Total Focus Time"
- [ ] **Given** das Projekt hat Partikel, **When** ich den View sehe, **Then** sehe ich Breakdown: This Week / This Month / All Time
- [ ] **Given** das Projekt hat keine Partikel, **When** ich den View sehe, **Then** zeigt es "0 Partikel" (kein Empty State)

### Session History
- [ ] **Given** das Projekt hat Partikel, **When** ich den View sehe, **Then** sehe ich eine Liste der Recent Sessions
- [ ] **Given** die Session-Liste, **When** ich eine Session sehe, **Then** zeigt sie Datum, Dauer und Task-Name

## Technische Details

### Betroffene Dateien
```
src/
├── components/
│   └── projects/
│       ├── ProjectDetail.tsx         # NEU: Hauptkomponente
│       ├── ProjectStatsCards.tsx     # NEU: Week/Month/Total Cards
│       ├── ProjectParticleViz.tsx    # NEU: Partikel-Visualisierung
│       ├── ProjectSessionList.tsx    # NEU: Session History
│       └── index.ts
└── app/
    └── projects/
        └── [id]/
            └── page.tsx              # NEU: Route /projects/:id
```

### Implementierungshinweise

**Daten laden:**
```typescript
interface ProjectDetailData {
  project: Project;
  stats: {
    total: { particles: number; duration: number };
    thisWeek: { particles: number; duration: number };
    thisMonth: { particles: number; duration: number };
  };
  recentSessions: Particle[]; // Last 20
}

async function getProjectDetail(id: string): Promise<ProjectDetailData>;
```

**Partikel-Visualisierung:**
```typescript
// Simple grid of dots representing particles
// Each dot uses project.brightness for opacity
// Responsive: wraps based on container width

interface ProjectParticleVizProps {
  particleCount: number;
  brightness: number;
  maxVisible?: number; // Default: 100
}
```

**Session List:**
```typescript
interface ProjectSessionListProps {
  sessions: Particle[];
  maxItems?: number; // Default: 20
}

// Grouped by date: "Today", "Yesterday", "January 18"
```

## UI/UX

### Project Detail View

```
+-----------------------------------------------------------+
|  <- Website Redesign                            [Edit]  E |
+-----------------------------------------------------------+
|                                                           |
|  +---------------------------------------------------------+
|  |                                                         |
|  |              47 Partikel                                |
|  |                                                         |
|  |              * * * * * * * * * * * * * * * * * * *     |
|  |              * * * * * * * * * * * * * * * * * *       |
|  |              * * * * * * * * * * *                     |
|  |                                                         |
|  |                                                         |
|  |              19h 35m total focus time                  |
|  |                                                         |
|  +---------------------------------------------------------+
|                                                           |
|  This Week          This Month          All Time          |
|  +-------------+    +-------------+    +-------------+    |
|  |     12      |    |     31      |    |     47      |    |
|  |  Partikel   |    |  Partikel   |    |  Partikel   |    |
|  |   5h 0m     |    |  12h 55m    |    |  19h 35m    |    |
|  +-------------+    +-------------+    +-------------+    |
|                                                           |
|  Recent Sessions                                          |
|  ---------------------------------------------------------|
|                                                           |
|  Today                                                    |
|    14:32    25min    API Integration                      |
|    11:15    52min    Database Schema                      |
|                                                           |
|  Yesterday                                                |
|    16:00    25min    Code Review                          |
|    14:30    25min    Bug Fixing                           |
|                                                           |
|  January 17                                               |
|    10:00    90min    Architecture Planning                |
|                                                           |
+-----------------------------------------------------------+
```

### Visual Details

**Partikel-Visualisierung:**
- Grid aus Punkten (●)
- Jeder Punkt = 1 Partikel
- Opacity basiert auf `project.brightness`
- Bei >100 Partikeln: "●●●● ... +47 more"
- Responsive: Wraps basierend auf Container-Breite

**Stats Cards:**
- Drei gleichgroße Cards nebeneinander
- Große Zahl (Partikel-Count)
- Label "Partikel"
- Kleinere Zahl (Fokuszeit)

**Session List:**
- Gruppiert nach Datum
- Datum als Section Header
- Zeit | Dauer | Task Name
- Max 20 Items, dann "Show all →"

### Animations

- On mount: Stats cards stagger in
- Partikel dots: Fade in mit leichtem stagger
- Session list: Standard list animation

## Testing

### Manuell zu testen
- [ ] Navigation von Project List → Detail (Enter)
- [ ] Back-Navigation (Escape, Backspace, Back-Button)
- [ ] Header zeigt Projektnamen
- [ ] Edit-Button (E) öffnet Modal
- [ ] Partikel-Count ist korrekt
- [ ] Partikel-Visualisierung zeigt richtige Anzahl
- [ ] Total Focus Time ist korrekt berechnet
- [ ] Stats Breakdown: Week/Month/Total korrekt
- [ ] Recent Sessions zeigen korrekte Daten
- [ ] Sessions sind nach Datum gruppiert
- [ ] Projekt ohne Partikel: zeigt "0 Partikel", keine Sessions

### Automatisierte Tests
- [ ] Component Test: ProjectDetail renders
- [ ] Component Test: Stats calculation correct
- [ ] Component Test: Session grouping by date
- [ ] Integration Test: Data loads correctly
- [ ] Integration Test: Navigation works

## Definition of Done

- [ ] Code implementiert
- [ ] Route /projects/:id existiert
- [ ] Header mit Name + Edit Button
- [ ] Partikel-Visualisierung
- [ ] Stats Cards (Week/Month/Total)
- [ ] Session History mit Datum-Gruppierung
- [ ] Keyboard Navigation (E für Edit, Escape für Back)
- [ ] Tests geschrieben & grün
- [ ] Responsive Layout
- [ ] Code reviewed

## Notizen

**"No Project" Detail View:**
- Spezialfall: Route /projects/no-project oder null handling
- Zeigt alle Partikel ohne projectId
- Kein Edit Button (kann nicht bearbeitet werden)
- Titel: "No Project" oder "Unassigned Particles"

**Performance:**
- Sessions: Nur letzte 20 laden, "Load more" für Rest
- Partikel-Count: Aggregiert, nicht alle laden

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
