---
type: story
status: done
priority: p0
effort: 2
feature: project-tracking
created: 2026-01-20
updated: 2026-01-21
done_date: 2026-01-21
tags: [projects, shortcuts, keyboard, p0]
---

# POMO-106: Project Keyboard Shortcuts

## User Story

> Als **Keyboard-Power-User**
> möchte ich **alle Projekt-Funktionen per Tastatur bedienen können**,
> damit **ich im Flow bleibe und keine Maus brauche**.

## Kontext

Link zum Feature: [[features/project-tracking]]

Abhängigkeiten:
- [[features/keyboard-ux]] (bestehend)
- Alle anderen POMO-10x Stories

Diese Story stellt sicher, dass alle Projekt-Features den bestehenden Keyboard-First-Standards von Particle entsprechen. Sie ist eine "Glue"-Story, die alle Shortcuts zusammenführt und im Help Modal dokumentiert.

## Akzeptanzkriterien

### Globale Navigation
- [ ] **Given** ich bin irgendwo in der App, **When** ich `G P` drücke, **Then** navigiere ich zu Projects View

### Timer View Shortcuts
- [ ] **Given** ich bin im Timer View, **When** ich `P` drücke, **Then** öffnet sich das Project Dropdown
- [ ] **Given** das Dropdown ist offen, **When** ich `P 1-9` drücke, **Then** wird das entsprechende Recent Project ausgewählt
- [ ] **Given** das Dropdown ist offen, **When** ich `P 0` drücke, **Then** wird "No Project" ausgewählt
- [ ] **Given** das Dropdown ist offen, **When** ich `Escape` drücke, **Then** schließt es ohne Änderung

### Projects View Shortcuts
- [ ] **Given** ich bin im Projects View, **When** ich `N` drücke, **Then** öffnet sich das New Project Modal
- [ ] **Given** ich bin im Projects View, **When** ich `J` oder `ArrowDown` drücke, **Then** bewegt sich der Fokus nach unten
- [ ] **Given** ich bin im Projects View, **When** ich `K` oder `ArrowUp` drücke, **Then** bewegt sich der Fokus nach oben
- [ ] **Given** ein Projekt ist fokussiert, **When** ich `Enter` drücke, **Then** öffnet sich der Detail View
- [ ] **Given** ein Projekt ist fokussiert, **When** ich `E` drücke, **Then** öffnet sich das Edit Modal
- [ ] **Given** ein Projekt ist fokussiert, **When** ich `A` drücke, **Then** öffnet sich der Archive Dialog
- [ ] **Given** ich bin im Projects View, **When** ich `Escape` drücke, **Then** navigiere ich zurück

### Project Detail View Shortcuts
- [ ] **Given** ich bin im Project Detail, **When** ich `E` drücke, **Then** öffnet sich das Edit Modal
- [ ] **Given** ich bin im Project Detail, **When** ich `Escape` oder `Backspace` drücke, **Then** gehe ich zurück zur Liste

### Modal Shortcuts
- [ ] **Given** ein Modal ist offen (Create/Edit/Archive), **When** ich `Escape` drücke, **Then** schließt es ohne zu speichern
- [ ] **Given** das Create/Edit Modal ist offen, **When** ich `Cmd+Enter` drücke, **Then** wird gespeichert
- [ ] **Given** das Archive Dialog ist offen, **When** ich `Enter` drücke, **Then** wird archiviert

### Help Modal Integration
- [ ] **Given** ich öffne das Help Modal (`?`), **When** ich die Shortcuts sehe, **Then** sind alle Project Shortcuts dokumentiert

## Technische Details

### Betroffene Dateien
```
src/
├── lib/
│   ├── shortcuts/
│   │   ├── registry.ts           # Shortcut Registry erweitern
│   │   └── project-shortcuts.ts  # NEU: Project-spezifische Shortcuts
│   └── navigation.ts             # G P registrieren
├── components/
│   ├── help/
│   │   └── HelpModal.tsx         # Shortcuts dokumentieren
│   └── projects/
│       └── *.tsx                  # Keyboard Handler
```

### Shortcut Registry Erweitern

```typescript
// src/lib/shortcuts/registry.ts

export const shortcuts = {
  // ... existing shortcuts ...

  // Projects - Global
  'g p': {
    description: 'Go to Projects',
    action: 'navigate',
    target: '/projects',
    scope: 'global',
  },

  // Projects - Timer View
  'p': {
    description: 'Open project selector',
    action: 'openProjectSelector',
    scope: 'timer',
  },
  'p 0': {
    description: 'Select "No Project"',
    action: 'selectProject',
    target: null,
    scope: 'timer',
  },
  'p 1-9': {
    description: 'Select recent project (1-9)',
    action: 'selectRecentProject',
    scope: 'timer',
  },

  // Projects - Projects View
  'n': {
    description: 'New project',
    action: 'newProject',
    scope: 'projects',
  },
  'e': {
    description: 'Edit project',
    action: 'editProject',
    scope: 'projects',
  },
  'a': {
    description: 'Archive project',
    action: 'archiveProject',
    scope: 'projects',
  },
};
```

### Help Modal Section

```typescript
// In HelpModal.tsx - neue Section hinzufügen

const projectShortcuts = [
  { keys: ['G', 'P'], description: 'Go to Projects' },
  { keys: ['P'], description: 'Open project selector' },
  { keys: ['P', '1-9'], description: 'Select recent project' },
  { keys: ['P', '0'], description: 'No project' },
  { keys: ['N'], description: 'New project' },
  { keys: ['E'], description: 'Edit project' },
  { keys: ['A'], description: 'Archive project' },
];
```

## UI/UX

### Help Modal mit Project Shortcuts

```
+-----------------------------------------------------------+
|  Keyboard Shortcuts                                   [x] |
+-----------------------------------------------------------+
|                                                           |
|  Timer                                                    |
|  Space         Start/Pause                                |
|  S             Skip to break                              |
|  ...                                                      |
|                                                           |
|  Projects                                      <- NEU     |
|  G P           Go to Projects                             |
|  P             Open project selector                      |
|  P 1-9         Select recent project                      |
|  P 0           No project                                 |
|  N             New project                                |
|  E             Edit project                               |
|  A             Archive project                            |
|                                                           |
|  Navigation                                               |
|  G T           Go to Timer                                |
|  G S           Go to Statistics                           |
|  G P           Go to Projects                  <- NEU     |
|  J / K         Navigate lists                             |
|  Enter         Select / Open                              |
|  Escape        Back / Close                               |
|  ...                                                      |
|                                                           |
+-----------------------------------------------------------+
```

### Shortcut Hints in UI

Überall wo relevant, Shortcut Hints anzeigen:

- New Project Button: `[+ New] N`
- Edit Button: `[Edit] E`
- Archive in Dialog: `[Archive] Enter`
- Back Link: `← Projects Esc`

## Testing

### Manuell zu testen
- [ ] `G P` navigiert von überall zu Projects
- [ ] `P` öffnet Projekt-Dropdown im Timer
- [ ] `P 1-9` wählt Recent Projects
- [ ] `P 0` wählt "No Project"
- [ ] `N` öffnet New Project Modal (in Projects View)
- [ ] `J/K` navigiert in der Liste
- [ ] `Enter` öffnet Detail View
- [ ] `E` öffnet Edit Modal
- [ ] `A` öffnet Archive Dialog
- [ ] `Escape` schließt Modals / navigiert zurück
- [ ] `Cmd+Enter` speichert in Modals
- [ ] `?` zeigt Help Modal mit allen Project Shortcuts

### Automatisierte Tests
- [ ] Unit Test: Shortcut Registry enthält alle Project Shortcuts
- [ ] Integration Test: G P Navigation
- [ ] Integration Test: P Dropdown öffnet
- [ ] Integration Test: Modal Shortcuts (Escape, Cmd+Enter)
- [ ] E2E Test: Full keyboard flow (G P → N → Name → Cmd+Enter → E → Cmd+Enter)

## Definition of Done

- [ ] Alle Shortcuts implementiert und funktional
- [ ] Shortcut Registry erweitert
- [ ] Help Modal aktualisiert mit Project Section
- [ ] Shortcut Hints in UI angezeigt
- [ ] Keine Konflikte mit bestehenden Shortcuts
- [ ] Tests geschrieben & grün
- [ ] Keyboard-only Flow getestet (ohne Maus)
- [ ] Code reviewed

## Notizen

**Shortcut-Konflikte checken:**
- `P` ist neu für Projects → Kein Konflikt
- `N` in Projects View → Scope-spezifisch
- `E` und `A` → Scope-spezifisch (nur in Projects View)

**Scope-System:**
- Shortcuts haben Scopes: 'global', 'timer', 'projects', 'modal'
- Scope wird basierend auf aktuellem View/State ermittelt
- Scope-spezifische Shortcuts überschreiben globale

---

## Arbeitsverlauf

### Gestartet: 2026-01-21

### Erledigt: 2026-01-21

**Befund:** Die meisten Shortcuts waren bereits in vorherigen Stories implementiert:
- P, P1-9, P0: ProjectSelector (POMO-102)
- N, J/K, Enter, E, A, Escape: ProjectListModal (POMO-103)
- E, Escape/Backspace: ProjectDetailModal (POMO-104)
- Cmd+Enter, Escape: ProjectForm (POMO-101)
- G P: useGPrefixNavigation (POMO-103)

**Implementiert:**
- 'projects' Kategorie zum Shortcuts-Registry hinzugefügt
- Alle Project Shortcuts im Help Modal (?) dokumentiert
- G P und G Y zu Navigation-Shortcuts hinzugefügt

**Commit:** `d89c87a` - feat(shortcuts): Add Project shortcuts to Help Modal (POMO-106)
