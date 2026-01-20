---
type: story
status: backlog
priority: p1
effort: 2
feature: project-tracking
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [projects, command-palette, search, p1]
---

# POMO-107: Project Command Palette Integration

## User Story

> Als **Keyboard-Power-User**
> möchte ich **Projekte über die Command Palette finden und auswählen können**,
> damit **ich blitzschnell zum richtigen Projekt wechseln kann**.

## Kontext

Link zum Feature: [[features/project-tracking]]

Abhängigkeiten:
- [[features/command-palette]] (bestehend)
- [[stories/backlog/POMO-101-project-crud]]

Diese Story erweitert die bestehende Command Palette mit Project-Commands und Project-Suche. User können `Cmd+K` drücken, "project" tippen und sofort Projekte finden.

## Akzeptanzkriterien

### Project Commands
- [ ] **Given** ich öffne die Command Palette, **When** ich "new project" tippe, **Then** erscheint "New Project" als Option
- [ ] **Given** ich wähle "New Project", **When** ich Enter drücke, **Then** öffnet sich das New Project Modal
- [ ] **Given** ich öffne die Command Palette, **When** ich "projects" tippe, **Then** erscheint "Go to Projects" als Option
- [ ] **Given** ich wähle "Go to Projects", **When** ich Enter drücke, **Then** navigiere ich zum Projects View

### Project Search
- [ ] **Given** ich öffne die Command Palette, **When** ich einen Projektnamen tippe, **Then** erscheinen passende Projekte als Optionen
- [ ] **Given** ich sehe Projekte in den Ergebnissen, **When** ich eines auswähle, **Then** werde ich gefragt was ich tun will (Switch/Open)
- [ ] **Given** Projekte existieren, **When** ich "project:" als Prefix tippe, **Then** sehe ich nur Projekt-Ergebnisse

### Quick Project Switch
- [ ] **Given** ich bin im Timer View, **When** ich `Cmd+K` → Projektname → Enter, **Then** wird das Projekt für die nächste Session ausgewählt
- [ ] **Given** ich switche ein Projekt via Command Palette, **When** ich im Timer bin, **Then** zeigt der Project Selector das neue Projekt

### Fuzzy Search
- [ ] **Given** ein Projekt heißt "Website Redesign", **When** ich "webred" tippe, **Then** wird es gefunden
- [ ] **Given** mehrere Projekte matchen, **When** ich die Ergebnisse sehe, **Then** sind sie nach Relevanz sortiert

## Technische Details

### Betroffene Dateien
```
src/
├── components/
│   └── command-palette/
│       ├── CommandPalette.tsx      # Erweitern
│       ├── commands/
│       │   └── project-commands.ts # NEU
│       └── search/
│           └── project-search.ts   # NEU
└── lib/
    └── command-registry.ts         # Commands registrieren
```

### Command Registry Erweitern

```typescript
// src/components/command-palette/commands/project-commands.ts

export const projectCommands: Command[] = [
  {
    id: 'new-project',
    name: 'New Project',
    keywords: ['create', 'add', 'project'],
    shortcut: 'N', // Context: Projects View
    icon: 'plus',
    action: () => openNewProjectModal(),
    category: 'Projects',
  },
  {
    id: 'go-to-projects',
    name: 'Go to Projects',
    keywords: ['projects', 'list', 'view'],
    shortcut: 'G P',
    icon: 'folder',
    action: () => navigate('/projects'),
    category: 'Navigation',
  },
  {
    id: 'switch-project',
    name: 'Switch Project...',
    keywords: ['project', 'change', 'select'],
    shortcut: 'P',
    icon: 'repeat',
    action: () => openProjectSelector(),
    category: 'Projects',
  },
];
```

### Dynamic Project Results

```typescript
// src/components/command-palette/search/project-search.ts

interface ProjectSearchResult {
  type: 'project';
  id: string;
  name: string;
  particleCount: number;
  actions: ProjectAction[];
}

type ProjectAction = 'switch' | 'open' | 'edit';

async function searchProjects(query: string): Promise<ProjectSearchResult[]> {
  const projects = await getProjects(false); // exclude archived

  return projects
    .filter(p => fuzzyMatch(p.name, query))
    .map(p => ({
      type: 'project',
      id: p.id,
      name: p.name,
      particleCount: getParticleCount(p.id),
      actions: ['switch', 'open', 'edit'],
    }))
    .sort((a, b) => fuzzyScore(b.name, query) - fuzzyScore(a.name, query))
    .slice(0, 5);
}
```

### Project Result Actions

```typescript
// When user selects a project, show sub-actions:

const projectActions = [
  { id: 'switch', label: 'Switch to this project', icon: 'check' },
  { id: 'open', label: 'Open project details', icon: 'external-link' },
  { id: 'edit', label: 'Edit project', icon: 'edit' },
];
```

## UI/UX

### Command Palette mit Project Commands

```
+-----------------------------------------------------------+
|  > project                                                |
+-----------------------------------------------------------+
|                                                           |
|  Actions                                                  |
|  +- New Project                                        N  |
|  +- Go to Projects                                   G P  |
|  +- Switch Project...                                  P  |
|                                                           |
|  Projects                                                 |
|  +- Website Redesign                          47 Partikel |
|  +- Mobile App                                23 Partikel |
|  +- Freelance: Client A                       89 Partikel |
|                                                           |
+-----------------------------------------------------------+
```

### Project Sub-Actions

Wenn ein Projekt ausgewählt wird:

```
+-----------------------------------------------------------+
|  Website Redesign                                         |
+-----------------------------------------------------------+
|                                                           |
|  +- Switch to this project                        Enter   |
|  +- Open project details                            O     |
|  +- Edit project                                    E     |
|                                                           |
+-----------------------------------------------------------+
```

### Visual Details

**Project Results:**
- Icon: Folder oder Dot in Project-Brightness
- Name: Primary Text
- Particle Count: Secondary, rechts aligned
- Kategorie-Header: "Projects"

**Fuzzy Highlight:**
- Matching characters im Namen hervorheben
- z.B. "**Web**site **Red**esign" bei Query "webred"

## Testing

### Manuell zu testen
- [ ] `Cmd+K` → "new project" → Enter öffnet Modal
- [ ] `Cmd+K` → "projects" → Enter navigiert zu /projects
- [ ] `Cmd+K` → Projektname findet Projekte
- [ ] Fuzzy Search funktioniert ("webred" → "Website Redesign")
- [ ] Project auswählen zeigt Sub-Actions
- [ ] "Switch" setzt Projekt im Timer
- [ ] "Open" navigiert zu Project Detail
- [ ] "Edit" öffnet Edit Modal
- [ ] Particle Count wird angezeigt
- [ ] Ergebnisse sind nach Relevanz sortiert

### Automatisierte Tests
- [ ] Unit Test: projectCommands sind registriert
- [ ] Unit Test: searchProjects fuzzy matching
- [ ] Unit Test: searchProjects sorting
- [ ] Component Test: Command Palette zeigt Project Results
- [ ] Component Test: Sub-Actions erscheinen
- [ ] Integration Test: Switch-Action setzt Timer State

## Definition of Done

- [ ] Code implementiert
- [ ] Project Commands registriert (New, Go to, Switch)
- [ ] Project Search funktioniert
- [ ] Fuzzy Matching funktioniert
- [ ] Sub-Actions implementiert (Switch, Open, Edit)
- [ ] Particle Counts angezeigt
- [ ] Tests geschrieben & grün
- [ ] Code reviewed

## Notizen

**Design-Entscheidung:**
- Projects erscheinen automatisch in Suchergebnissen (kein "project:" Prefix nötig)
- Sub-Actions für Projekte, weil mehrere sinnvolle Aktionen möglich

**Performance:**
- Projects werden gecached (nicht bei jedem Keystroke laden)
- Max 5 Project-Ergebnisse (nicht zu viele)

**Edge Cases:**
- Keine Projekte → Nur Commands erscheinen
- Archivierte Projekte → Nicht in Suche
- Sehr lange Projektnamen → Truncate mit Ellipsis

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
