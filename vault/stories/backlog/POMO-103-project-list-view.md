---
type: story
status: backlog
priority: p0
effort: 3
feature: project-tracking
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [projects, view, list, navigation, p0]
---

# POMO-103: Project List View (G P)

## User Story

> Als **Particle-Nutzer**
> möchte ich **eine Übersicht aller meiner Projekte sehen können**,
> damit **ich weiß, wie viele Partikel ich pro Projekt gesammelt habe**.

## Kontext

Link zum Feature: [[features/project-tracking]]

Abhängigkeiten:
- [[stories/backlog/POMO-100-project-data-model]]
- [[stories/backlog/POMO-101-project-crud]]

Der Project List View ist die zentrale Anlaufstelle für Projekt-Management. Er zeigt alle Projekte mit ihren Partikel-Counts und ermöglicht Navigation, Erstellen, Bearbeiten und Archivieren.

## Akzeptanzkriterien

### Navigation
- [ ] **Given** ich bin irgendwo in der App, **When** ich `G P` drücke, **Then** navigiere ich zum Projects View
- [ ] **Given** ich bin im Projects View, **When** ich `Escape` drücke, **Then** navigiere ich zurück (z.B. Timer)

### Liste
- [ ] **Given** ich bin im Projects View, **When** Projekte existieren, **Then** sehe ich sie in einer Liste
- [ ] **Given** ich sehe die Liste, **When** ich ein Projekt betrachte, **Then** sehe ich Name, Partikel-Count, "This week" Count
- [ ] **Given** archivierte Projekte existieren, **When** "Show Archived" deaktiviert ist, **Then** sehe ich sie nicht
- [ ] **Given** archivierte Projekte existieren, **When** ich "Show Archived" aktiviere, **Then** sehe ich sie (ausgegraut)

### Interaktionen
- [ ] **Given** ich bin im Projects View, **When** ich `J`/`K` oder Pfeiltasten drücke, **Then** navigiere ich durch die Liste
- [ ] **Given** ein Projekt ist fokussiert, **When** ich `Enter` drücke, **Then** öffnet sich der Detail View
- [ ] **Given** ein Projekt ist fokussiert, **When** ich `E` drücke, **Then** öffnet sich das Edit Modal
- [ ] **Given** ein Projekt ist fokussiert, **When** ich `A` drücke, **Then** öffnet sich der Archive Dialog
- [ ] **Given** ich bin im Projects View, **When** ich `N` drücke, **Then** öffnet sich das "New Project" Modal

### Empty State
- [ ] **Given** keine Projekte existieren, **When** ich den View öffne, **Then** sehe ich den Empty State mit CTA

### "No Project" Kategorie
- [ ] **Given** Partikel ohne Projekt existieren, **When** ich die Liste sehe, **Then** gibt es einen "No Project" Eintrag am Ende
- [ ] **Given** ich sehe "No Project", **When** ich es anklicke, **Then** öffnet sich ein Detail View für unzugeordnete Partikel

## Technische Details

### Betroffene Dateien
```
src/
├── components/
│   └── projects/
│       ├── ProjectList.tsx           # NEU: Hauptkomponente
│       ├── ProjectListItem.tsx       # NEU: Einzelnes Projekt
│       ├── ProjectEmptyState.tsx     # NEU: Leerer Zustand
│       └── index.ts
├── app/
│   └── projects/
│       └── page.tsx                  # NEU: Route /projects
└── lib/
    └── navigation.ts                 # G P Registration
```

### Implementierungshinweise

**ProjectList Component:**
```typescript
interface ProjectListProps {
  showArchived: boolean;
  onToggleArchived: () => void;
}

// Interne State:
// - focusedIndex: number
// - projects: Project[]
// - particleCounts: Map<string, { total: number; thisWeek: number }>
```

**Partikel-Counts aggregieren:**
```typescript
// Efficient query: Group by projectId
async function getParticleCountsByProject(): Promise<Map<string, ProjectStats>> {
  const particles = await getAllParticles();
  const now = new Date();
  const weekStart = startOfWeek(now);

  return particles.reduce((acc, p) => {
    const id = p.projectId || 'no-project';
    const current = acc.get(id) || { total: 0, thisWeek: 0 };
    current.total++;
    if (p.createdAt >= weekStart) current.thisWeek++;
    acc.set(id, current);
    return acc;
  }, new Map());
}
```

**Keyboard Navigation:**
```typescript
// Im ProjectList
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'j':
      case 'ArrowDown':
        setFocusedIndex(i => Math.min(i + 1, projects.length - 1));
        break;
      case 'k':
      case 'ArrowUp':
        setFocusedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        navigateToProject(projects[focusedIndex].id);
        break;
      // ... etc
    }
  };
  // ...
}, []);
```

## UI/UX

### Project List View

```
+-----------------------------------------------------------+
|  <- Projects                               [+ New]  N     |
+-----------------------------------------------------------+
|                                                           |
|  +-------------------------------------------------------+|
|  |  *  Website Redesign                    47 Partikel > ||  <- Focused
|  |     This week: 12                                     ||
|  +-------------------------------------------------------+|
|                                                           |
|  +-------------------------------------------------------+|
|  |  *  Mobile App                          23 Partikel   ||
|  |     This week: 8                                      ||
|  +-------------------------------------------------------+|
|                                                           |
|  +-------------------------------------------------------+|
|  |  *  Freelance: Client A                 89 Partikel   ||
|  |     This week: 0                                      ||
|  +-------------------------------------------------------+|
|                                                           |
|  ---------------------------------------------------------|
|                                                           |
|  +-------------------------------------------------------+|
|  |  o  No Project                          34 Partikel   ||
|  |     Particles without assignment                      ||
|  +-------------------------------------------------------+|
|                                                           |
|  [ ] Show Archived (3)                                    |
|                                                           |
+-----------------------------------------------------------+
```

### Visual Details

- **Focused Item:** Border highlight oder leichter Background-Shift
- **Brightness Dot:** Kleiner Kreis links (●) in der Projekt-Brightness
- **Partikel Count:** Rechts aligned, prominent
- **This Week:** Kleiner, secondary text
- **Arrow (>):** Bei Hover/Focus, zeigt "kann navigiert werden"
- **No Project:** Separator darüber, leicht anders gestylt (o statt ●)
- **Show Archived:** Checkbox unten, mit Count in Klammern

### Empty State

```
+-----------------------------------------------------------+
|  <- Projects                               [+ New]  N     |
+-----------------------------------------------------------+
|                                                           |
|                          *                                |
|                                                           |
|            Dein Lebenswerk hat viele Kapitel.             |
|                                                           |
|         Erstelle dein erstes Projekt, um deine            |
|                Partikel zu gruppieren.                    |
|                                                           |
|                   [+ Neues Projekt]                       |
|                          N                                |
|                                                           |
+-----------------------------------------------------------+
```

### Animations

- List items: Staggered fade-in on mount (50ms delay each)
- Focus change: Instant (keine Animation, Snappy)
- Archive toggle: List animates (items slide in/out)

## Testing

### Manuell zu testen
- [ ] `G P` navigiert zum Projects View
- [ ] Liste zeigt alle aktiven Projekte
- [ ] Partikel-Counts sind korrekt
- [ ] "This week" Counts sind korrekt
- [ ] J/K Navigation funktioniert
- [ ] Arrow Keys funktionieren
- [ ] Enter öffnet Detail View
- [ ] E öffnet Edit Modal
- [ ] A öffnet Archive Dialog
- [ ] N öffnet New Project Modal
- [ ] "No Project" Kategorie erscheint wenn relevant
- [ ] Show Archived toggle funktioniert
- [ ] Empty State bei 0 Projekten

### Automatisierte Tests
- [ ] Component Test: ProjectList renders items
- [ ] Component Test: Keyboard navigation
- [ ] Component Test: Empty state renders
- [ ] Integration Test: Partikel-Counts korrekt aggregiert
- [ ] Integration Test: Navigation via G P

## Definition of Done

- [ ] Code implementiert
- [ ] Route /projects existiert
- [ ] G P Navigation registriert
- [ ] Liste mit Projekten + Counts
- [ ] Keyboard Navigation (J/K, Arrows, Enter, E, A, N)
- [ ] Empty State
- [ ] "No Project" Kategorie
- [ ] Show Archived Toggle
- [ ] Tests geschrieben & grün
- [ ] Responsive (Mobile-friendly)
- [ ] Code reviewed

## Notizen

**Performance:**
- Partikel-Counts beim Mount laden, nicht live updaten
- Bei vielen Projekten (>20): Virtual Scrolling erwägen

**Sortierung:**
- Default: Nach letzter Aktivität (Recent first)
- Später optional: Alphabetisch, nach Partikel-Count

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
