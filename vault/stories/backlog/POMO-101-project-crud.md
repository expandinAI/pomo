---
type: story
status: backlog
priority: p0
effort: 5
feature: project-tracking
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [projects, crud, modal, p0]
---

# POMO-101: Project CRUD Operations

## User Story

> Als **Particle-Nutzer**
> möchte ich **Projekte erstellen, bearbeiten und archivieren können**,
> damit **ich meine Fokuszeit nach Projekten organisieren kann**.

## Kontext

Link zum Feature: [[features/project-tracking]]

Abhängigkeit: [[stories/backlog/POMO-100-project-data-model]] muss zuerst fertig sein.

Diese Story implementiert die grundlegenden Operationen für Projekte. Die UI besteht aus einem Modal für Create/Edit und einem Confirmation Dialog für Archive.

## Akzeptanzkriterien

### Create
- [ ] **Given** ich bin im Projects View, **When** ich `N` drücke, **Then** öffnet sich das "New Project" Modal
- [ ] **Given** das Modal ist offen, **When** ich einen Namen eingebe und `Cmd+Enter` drücke, **Then** wird das Projekt erstellt
- [ ] **Given** ich erstelle ein Projekt, **When** der Name leer ist, **Then** zeigt das Modal einen Fehler
- [ ] **Given** ich erstelle ein Projekt, **When** der Name > 50 Zeichen, **Then** wird der Input begrenzt

### Edit
- [ ] **Given** ich bin im Projects View, **When** ich `E` auf einem Projekt drücke, **Then** öffnet sich das Edit Modal
- [ ] **Given** das Edit Modal ist offen, **When** ich den Namen ändere und speichere, **Then** wird das Projekt aktualisiert
- [ ] **Given** ich bearbeite ein Projekt, **When** ich die Brightness ändere, **Then** wird sie gespeichert

### Archive
- [ ] **Given** ich bin im Projects View, **When** ich `A` auf einem Projekt drücke, **Then** erscheint ein Confirmation Dialog
- [ ] **Given** der Archive Dialog ist offen, **When** ich bestätige, **Then** wird das Projekt archiviert (nicht gelöscht)
- [ ] **Given** ein Projekt ist archiviert, **When** ich "Show Archived" aktiviere, **Then** sehe ich das Projekt wieder
- [ ] **Given** ein archiviertes Projekt, **When** ich es bearbeite, **Then** kann ich es wieder aktivieren (unarchive)

### General
- [ ] **Given** ein Modal ist offen, **When** ich `Escape` drücke, **Then** schließt es ohne zu speichern
- [ ] **Given** ein Projekt wurde erstellt, **When** ich die Liste refreshe, **Then** ist es persistent

## Technische Details

### Betroffene Dateien
```
src/
├── components/
│   └── projects/
│       ├── ProjectForm.tsx        # Create/Edit Modal
│       ├── ProjectArchiveDialog.tsx
│       └── index.ts
├── lib/
│   └── projects/
│       ├── actions.ts             # CRUD Functions
│       ├── hooks.ts               # useProjects, useProject
│       └── index.ts
└── app/
    └── (routes)/
        └── projects/              # Falls separate Route
```

### Implementierungshinweise

**ProjectForm Component:**
- Shared für Create und Edit (prop: `project?: Project`)
- Controlled Form mit useState
- Brightness als 5 Radio Buttons (visuell als Punkte)
- Keyboard: Enter in Name-Field → Create/Save

**CRUD Functions:**
```typescript
// src/lib/projects/actions.ts

export async function createProject(data: CreateProjectInput): Promise<Project>;
export async function updateProject(id: string, data: UpdateProjectInput): Promise<Project>;
export async function archiveProject(id: string): Promise<void>;
export async function unarchiveProject(id: string): Promise<void>;
export async function getProject(id: string): Promise<Project | null>;
export async function getProjects(includeArchived?: boolean): Promise<Project[]>;
```

**Hooks:**
```typescript
// src/lib/projects/hooks.ts

export function useProjects(includeArchived?: boolean): {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useProject(id: string): {
  project: Project | null;
  isLoading: boolean;
  error: Error | null;
};
```

### API-Änderungen

Keine API - alles lokal in IndexedDB.

## UI/UX

### Create/Edit Modal

```
+------------------------------------------+
|  New Project                         [x] |
+------------------------------------------+
|                                          |
|  Name                                    |
|  +------------------------------------+  |
|  | Website Redesign                   |  |
|  +------------------------------------+  |
|  0/50                                    |
|                                          |
|  Brightness                              |
|  ( ) ( ) ( ) (*) ( )                    |
|  Darker           Lighter                |
|                                          |
|  +------------------------------------+  |
|  |         [Cancel]  [Create]         |  |
|  |           Esc      Cmd+Enter       |  |
|  +------------------------------------+  |
|                                          |
+------------------------------------------+
```

**Edit-Modus zusätzlich:**
```
|  ----------------------------------------|
|                                          |
|  Danger Zone                             |
|  +------------------------------------+  |
|  | Archive Project                    |  |
|  | Hides project, keeps all data      |  |
|  +------------------------------------+  |
```

### Archive Confirmation

```
+------------------------------------------+
|  Archive "Website Redesign"?             |
+------------------------------------------+
|                                          |
|  This project has 47 Partikel.           |
|                                          |
|  Archiving hides it from your list,      |
|  but all data is preserved forever.      |
|                                          |
|  You can restore it anytime.             |
|                                          |
|             [Cancel]  [Archive]          |
|               Esc        Enter           |
+------------------------------------------+
```

### Animations

- Modal: Fade in + slight scale (wie Command Palette)
- Brightness Selection: Instant, kein Delay
- Success: Modal schließt, kurzer Toast "Project created"

## Testing

### Manuell zu testen
- [ ] Create: Name eingeben, Brightness wählen, speichern
- [ ] Create: Leerer Name → Error Message
- [ ] Create: 50+ Zeichen → Input stoppt bei 50
- [ ] Edit: Bestehenden Namen ändern
- [ ] Edit: Brightness ändern
- [ ] Archive: Confirmation Dialog erscheint
- [ ] Archive: Projekt verschwindet aus Liste
- [ ] Unarchive: Über "Show Archived" → Edit → Unarchive
- [ ] Escape schließt Modal ohne Änderungen
- [ ] Persistence: Nach Reload sind Projekte noch da

### Automatisierte Tests
- [ ] Unit Test: createProject Validation
- [ ] Unit Test: archiveProject setzt archived=true
- [ ] Unit Test: unarchiveProject setzt archived=false
- [ ] Integration Test: Full Create → Read → Update → Archive Flow
- [ ] Component Test: ProjectForm renders correctly
- [ ] Component Test: Form validation messages

## Definition of Done

- [ ] Code implementiert
- [ ] Create Modal funktioniert
- [ ] Edit Modal funktioniert
- [ ] Archive Dialog funktioniert
- [ ] Unarchive funktioniert
- [ ] Keyboard Shortcuts (N, E, A, Escape, Cmd+Enter)
- [ ] Tests geschrieben & grün
- [ ] Animations smooth
- [ ] Code reviewed

## Notizen

**Design-Entscheidungen:**
- Kein "Delete" Button - nur Archive. Lebenswerk geht nicht verloren.
- Brightness als visuelle Punkte, nicht als Slider (reduzierter)
- Toast statt Inline-Success (weniger UI-Noise)

**Abhängigkeiten:**
- Benötigt POMO-100 (Data Model)
- Wird benötigt von POMO-102, POMO-103, POMO-104

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
