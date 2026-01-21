---
type: story
status: done
priority: p0
effort: 3
feature: project-tracking
created: 2026-01-20
updated: 2026-01-21
done_date: 2026-01-21
tags: [projects, timer, selector, dropdown, p0]
---

# POMO-102: Project Selector in Timer

## User Story

> Als **Particle-Nutzer**
> möchte ich **vor oder während einer Session ein Projekt auswählen können**,
> damit **mein Partikel dem richtigen Projekt zugeordnet wird**.

## Kontext

Link zum Feature: [[features/project-tracking]]

Der Project Selector ist das Herzstück der Timer-Integration. Er erscheint unter dem Quick Task Input und ermöglicht schnelle Projekt-Auswahl per Maus oder Tastatur.

## Akzeptanzkriterien

### Anzeige
- [x] Project Dropdown unter dem Task Input sichtbar
- [x] Zeigt "No Project" wenn kein Projekt ausgewählt
- [x] Zeigt Projektnamen wenn ein Projekt ausgewählt ist
- [x] Brightness-Indikator für jedes Projekt

### Auswahl
- [x] `P` öffnet das Project Dropdown
- [x] `P 1-9` für schnelle Projekt-Auswahl (Recent-Order)
- [x] `P 0` für "No Project"
- [x] Pfeiltasten (↑/↓) und J/K für Navigation
- [x] Enter zum Auswählen
- [x] Escape zum Schließen

### Während Session
- [x] Projekt kann auch während laufender Session gewechselt werden
- [x] Letzter Stand bei Session-Ende wird gespeichert

### Partikel-Speicherung
- [x] Partikel erhält `projectId` bei COMPLETE
- [x] Partikel erhält `projectId` bei SKIP (>60s)
- [x] "No Project" → `projectId: undefined`

## Technische Details

### Implementierte Dateien
```
src/
├── components/
│   ├── projects/
│   │   ├── ProjectSelector.tsx    # NEU: Dropdown Component
│   │   └── index.ts               # Export hinzugefügt
│   └── timer/
│       └── Timer.tsx              # Integration
```

### ProjectSelector Component

```typescript
interface ProjectSelectorProps {
  projects: (Project | ProjectWithStats)[];
  selectedProjectId: string | null;
  onSelect: (projectId: string | null) => void;
  recentProjectIds?: string[];
  disabled?: boolean;
  onCreateNew?: () => void;
}
```

Features:
- Sortiert Projekte nach Recent-Usage
- Keyboard navigation (P, 0-9, Arrows, J/K, Enter, Escape)
- Brightness-Indikator als farbiger Dot
- Click-outside-to-close
- Scroll support für viele Projekte

### Timer Integration

```typescript
// Neuer Hook-Import
const {
  activeProjects,
  selectedProjectId,
  selectProject,
  recentProjectIds,
  isLoading: projectsLoading,
} = useProjects();

// Ref für Callbacks
const selectedProjectIdRef = useRef<string | null>(null);

// Session speichern mit projectId
const taskData = {
  ...taskData,
  ...(selectedProjectIdRef.current && { projectId: selectedProjectIdRef.current }),
};
```

## UI/UX

### Collapsed State (im Timer)
```
+------------------------------------------+
|                                          |
|                25:00                     |
|                                          |
|  Working on: API Integration             |
|  Project:    Website Redesign     [v] P  |  <-- NEU
|                                          |
+------------------------------------------+
```

### Expanded Dropdown
```
+------------------------------------------+
|  Project:    Website Redesign     [^]    |
|  +------------------------------------+  |
|  | ● Website Redesign           P 1  |  |
|  |   Mobile App                 P 2  |  |
|  |   Freelance: Client A        P 3  |  |
|  |   --------------------------------|  |
|  |   No Project                 P 0  |  |
|  +------------------------------------+  |
+------------------------------------------+
```

## Definition of Done

- [x] Code implementiert
- [x] ProjectSelector Component fertig
- [x] Timer-Integration fertig
- [x] Keyboard Shortcuts (P, P 0-9, Arrows, J/K, Enter, Escape)
- [x] Partikel speichert projectId korrekt
- [x] Recent Projects Order funktioniert
- [x] Typecheck bestanden

## Arbeitsverlauf

### Erledigt: 2026-01-21

**Implementiert:**
1. `ProjectSelector.tsx` - Full dropdown with keyboard navigation
2. Timer integration via `useProjects` hook
3. Session save updated to include projectId

**Features:**
- P key opens dropdown (when not typing)
- Quick selection P 0-9
- Arrow/J/K navigation
- Brightness dots for visual project identification
- Sorted by recent usage
