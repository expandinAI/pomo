---
type: story
status: done
priority: p0
effort: 5
feature: project-tracking
created: 2026-01-20
updated: 2026-01-21
done_date: 2026-01-21
tags: [projects, crud, modal, p0]
---

# POMO-101: Project CRUD Operations

## User Story

> Als **Particle-Nutzer**
> möchte ich **Projekte erstellen, bearbeiten und archivieren können**,
> damit **ich meine Fokuszeit nach Projekten organisieren kann**.

## Kontext

Link zum Feature: [[features/project-tracking]]

Diese Story implementiert die grundlegenden UI-Komponenten für Projekt-Operationen:
- Create/Edit Modal mit Name und Brightness
- Archive Confirmation Dialog

## Akzeptanzkriterien

### Create
- [x] Modal für "New Project" mit Name-Input
- [x] Name mit max 50 Zeichen limitiert
- [x] Brightness-Auswahl mit 5 Presets (visuell als Punkte)
- [x] Cmd+Enter speichert, Escape schließt

### Edit
- [x] Gleiches Modal wie Create, aber mit Projekt-Daten gefüllt
- [x] Name und Brightness änderbar
- [x] Archive-Option im Edit-Modal

### Archive
- [x] Confirmation Dialog mit Projekt-Name
- [x] Zeigt Particle-Count falls verfügbar
- [x] Erklärt dass Daten erhalten bleiben
- [x] Enter bestätigt, Escape schließt

### General
- [x] Escape schließt Modal ohne zu speichern
- [x] Focus Trap in allen Modals
- [x] Accessibility (ARIA-Attribute, Keyboard-Navigation)

## Technische Details

### Implementierte Dateien
```
src/
├── components/
│   └── projects/
│       ├── BrightnessSelector.tsx    # 5 Brightness-Punkte
│       ├── ProjectForm.tsx           # Create/Edit Modal
│       ├── ProjectArchiveDialog.tsx  # Archive Confirmation
│       └── index.ts                  # Exports
```

### Komponenten

**BrightnessSelector:**
- 5 Radio-Buttons als visuelle Punkte
- Brightness-Werte: 0.3, 0.5, 0.7, 0.85, 1.0
- Framer Motion für Selection-Indicator

**ProjectForm:**
- Shared für Create und Edit (prop: `project?: Project`)
- Name-Input mit Character-Counter (max 50)
- Duplicate-Name-Warnung (nicht blockierend)
- Keyboard: Cmd+Enter = Save, Escape = Close
- Im Edit-Mode: Archive-Button im "Danger Zone"

**ProjectArchiveDialog:**
- Zeigt Projekt-Name und Particle-Count
- Erklärt dass Daten erhalten bleiben
- Keyboard: Enter = Confirm, Escape = Cancel

### Patterns verwendet
- Focus Trap via `useFocusTrap` Hook
- Framer Motion AnimatePresence für Animationen
- SPRING.gentle für Modal-Animation
- Consistent mit EndConfirmationModal und YearViewModal

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
|  [Edit mode: Archive Project button]     |
|                                          |
|  +------------------------------------+  |
|  |      [Cancel Esc]  [Create ⌘↵]    |  |
|  +------------------------------------+  |
+------------------------------------------+
```

### Archive Confirmation
```
+------------------------------------------+
|  Archive "Website Redesign"?             |
+------------------------------------------+
|  [Archive Icon]                          |
|                                          |
|  This project has 47 Particles.          |
|                                          |
|  Archiving hides it from your list,      |
|  but all data is preserved forever.      |
|                                          |
|  You can restore it anytime.             |
|                                          |
|         [Cancel Esc]  [Archive ↵]        |
+------------------------------------------+
```

## Definition of Done

- [x] Code implementiert
- [x] Create Modal funktioniert
- [x] Edit Modal funktioniert
- [x] Archive Dialog funktioniert
- [x] Keyboard Shortcuts in Modals
- [x] Typecheck bestanden
- [x] Animations smooth

## Arbeitsverlauf

### Erledigt: 2026-01-21

**Implementiert:**
1. `BrightnessSelector.tsx` - Visual brightness selection with 5 presets
2. `ProjectForm.tsx` - Full create/edit modal with validation
3. `ProjectArchiveDialog.tsx` - Confirmation dialog for archiving

**Patterns:**
- Followed existing modal patterns (EndConfirmationModal, YearViewModal)
- Used useFocusTrap for accessibility
- Framer Motion for animations

**Note:**
Die Integration in die Projects List (N/E/A Shortcuts im Kontext) erfolgt in POMO-102 (Project List UI), da dort der Kontext "welches Projekt ist ausgewählt" existiert.
