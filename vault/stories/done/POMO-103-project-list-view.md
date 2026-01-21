---
type: story
status: done
priority: p0
effort: 3
feature: project-tracking
created: 2026-01-20
updated: 2026-01-21
done_date: 2026-01-21
tags: [projects, view, list, navigation, p0]
---

# POMO-103: Project List View (G P)

## User Story

> Als **Particle-Nutzer**
> möchte ich **eine Übersicht aller meiner Projekte sehen können**,
> damit **ich weiß, wie viele Partikel ich pro Projekt gesammelt habe**.

## Kontext

Link zum Feature: [[features/project-tracking]]

Der Project List View ist die zentrale Anlaufstelle für Projekt-Management. Er zeigt alle Projekte mit ihren Partikel-Counts und ermöglicht Navigation, Erstellen, Bearbeiten und Archivieren.

## Akzeptanzkriterien

### Navigation
- [x] G P öffnet den Projects View
- [x] Escape schließt den View

### Liste
- [x] Liste zeigt alle aktiven Projekte
- [x] Jedes Projekt zeigt: Name, Brightness-Dot, Particle Count, "This week" Count
- [x] Archivierte Projekte standardmäßig ausgeblendet
- [x] "Show Archived" Toggle zeigt archivierte Projekte (ausgegraut)

### Interaktionen
- [x] J/K und Pfeiltasten für Navigation
- [x] Enter öffnet Edit Modal
- [x] E öffnet Edit Modal
- [x] A öffnet Archive Dialog (oder Restore für archivierte)
- [x] N öffnet "New Project" Modal

### Empty State
- [x] Bei 0 Projekten: Motivierender Text + CTA

### "No Project" Kategorie
- [x] Zeigt unzugeordnete Partikel am Ende der Liste
- [x] Nur sichtbar wenn unassigned Particles existieren

## Technische Details

### Implementierte Dateien
```
src/
├── components/
│   └── projects/
│       ├── ProjectListModal.tsx       # Hauptkomponente
│       ├── ProjectListItem.tsx        # Einzelnes Projekt
│       ├── ProjectEmptyState.tsx      # Leerer Zustand
│       └── index.ts                   # Exports
├── hooks/
│   └── useGPrefixNavigation.ts        # G P Shortcut
└── app/
    └── page.tsx                       # Integration
```

### ProjectListModal Features

```typescript
// Event-basiertes Öffnen
window.addEventListener('particle:open-projects', handleOpen);

// Keyboard Navigation
- J/K, ArrowUp/Down: Navigation
- Enter, E: Edit Project
- A: Archive/Restore
- N: New Project
- Escape: Close

// State
- showArchived: boolean (toggle)
- focusedIndex: number (list navigation)
- showCreateForm, editingProject, archivingProject (sub-modals)
```

### ProjectListItem Features

- Staggered fade-in animation
- Brightness dot indicator
- Particle count + week count
- Focus state with ring highlight
- Archived state (opacity reduced)

## UI/UX

### Project List View
```
+-----------------------------------------------------------+
|  Projects                       [+ New N]             [x] |
+-----------------------------------------------------------+
|  ● Website Redesign              47 Particles    >        |
|    This week: 12                                          |
|                                                           |
|  ● Mobile App                    23 Particles             |
|    This week: 8                                           |
|                                                           |
|  ○ No Project                    34 Particles             |
|    Particles without assignment                           |
+-----------------------------------------------------------+
|  👁 Show Archived (3)                                     |
|  J/K navigate  ↵ open  E edit  A archive                  |
+-----------------------------------------------------------+
```

### Empty State
```
           ●

  Dein Lebenswerk hat viele Kapitel.

  Erstelle dein erstes Projekt, um deine
  Partikel zu gruppieren.

          [+ Neues Projekt]
               N
```

## Definition of Done

- [x] Code implementiert
- [x] G P Navigation registriert
- [x] Liste mit Projekten + Counts
- [x] Keyboard Navigation (J/K, Arrows, Enter, E, A, N)
- [x] Empty State
- [x] "No Project" Kategorie
- [x] Show Archived Toggle
- [x] Typecheck bestanden

## Arbeitsverlauf

### Erledigt: 2026-01-21

**Implementiert:**
1. `useGPrefixNavigation.ts` - G P Shortcut hinzugefügt
2. `ProjectListItem.tsx` - List item mit staggered animation
3. `ProjectEmptyState.tsx` - Motivierender Empty State
4. `ProjectListModal.tsx` - Modal mit full keyboard navigation
5. `page.tsx` - Integration mit dynamic import

**Patterns:**
- Event-basiertes Modal opening (consistent mit anderen)
- Focus trap and keyboard navigation
- Sub-modals für Create/Edit/Archive
