---
type: story
status: backlog
priority: p0
effort: 3
feature: project-tracking
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [projects, timer, selector, dropdown, p0]
---

# POMO-102: Project Selector in Timer

## User Story

> Als **Particle-Nutzer**
> möchte ich **vor oder während einer Session ein Projekt auswählen können**,
> damit **mein Partikel dem richtigen Projekt zugeordnet wird**.

## Kontext

Link zum Feature: [[features/project-tracking]]

Abhängigkeiten:
- [[stories/backlog/POMO-100-project-data-model]]
- [[stories/backlog/POMO-101-project-crud]]

Der Project Selector ist das Herzstück der Timer-Integration. Er erscheint unter dem Quick Task Input und ermöglicht schnelle Projekt-Auswahl per Maus oder Tastatur.

## Akzeptanzkriterien

### Anzeige
- [ ] **Given** ich bin im Timer View, **When** Projekte existieren, **Then** sehe ich ein Project Dropdown unter dem Task Input
- [ ] **Given** kein Projekt ausgewählt, **When** ich das Dropdown sehe, **Then** zeigt es "No Project"
- [ ] **Given** ein Projekt ausgewählt, **When** ich das Dropdown sehe, **Then** zeigt es den Projektnamen

### Auswahl
- [ ] **Given** ich bin im Timer View, **When** ich `P` drücke, **Then** öffnet sich das Project Dropdown
- [ ] **Given** das Dropdown ist offen, **When** ich `P 1` drücke, **Then** wird Projekt 1 ausgewählt (Recent-Order)
- [ ] **Given** das Dropdown ist offen, **When** ich `P 0` drücke, **Then** wird "No Project" ausgewählt
- [ ] **Given** das Dropdown ist offen, **When** ich mit Pfeiltasten navigiere und Enter drücke, **Then** wird das Projekt ausgewählt
- [ ] **Given** das Dropdown ist offen, **When** ich Escape drücke, **Then** schließt es ohne Änderung

### Während Session
- [ ] **Given** eine Session läuft, **When** ich `P` drücke, **Then** kann ich das Projekt wechseln
- [ ] **Given** ich wechsle das Projekt während der Session, **When** die Session endet, **Then** wird der Partikel dem letzten Projekt zugeordnet

### Partikel-Speicherung
- [ ] **Given** ein Projekt ist ausgewählt, **When** die Session endet (COMPLETE), **Then** hat der Partikel die `projectId`
- [ ] **Given** "No Project" ist ausgewählt, **When** die Session endet, **Then** hat der Partikel `projectId: null`
- [ ] **Given** ein Projekt ist ausgewählt, **When** ich die Session skippe (>60s), **Then** hat der Partikel trotzdem die `projectId`

## Technische Details

### Betroffene Dateien
```
src/
├── components/
│   ├── timer/
│   │   └── Timer.tsx              # Erweitern mit ProjectSelector
│   └── projects/
│       ├── ProjectSelector.tsx    # NEU: Dropdown Component
│       └── index.ts
├── lib/
│   └── timer/
│       └── hooks.ts               # Timer State erweitern
```

### Implementierungshinweise

**Timer State erweitern:**
```typescript
// In Timer.tsx oder useTimer hook

interface TimerState {
  // ...existing...
  selectedProjectId: string | null;
}
```

**ProjectSelector Component:**
```typescript
interface ProjectSelectorProps {
  selectedProjectId: string | null;
  onSelect: (projectId: string | null) => void;
  disabled?: boolean; // Optional: während bestimmter States
}
```

**Recent Projects Order:**
- Projekte sortiert nach letzter Nutzung (most recent first)
- Speichern in localStorage: `particle:recentProjects: string[]` (max 9 IDs)

**Partikel erweitern bei Save:**
```typescript
// In handleSessionComplete

const particle: Particle = {
  // ...existing fields...
  projectId: timerState.selectedProjectId,
};
```

## UI/UX

### Collapsed State (im Timer)

```
+------------------------------------------+
|                                          |
|                25:00                     |
|           [----------------]             |
|                                          |
|  Working on: API Integration             |
|  Project:    Website Redesign     [v]    |  <-- NEU
|                                          |
|            [> Start Session]             |
|                                          |
+------------------------------------------+
```

### Expanded Dropdown

```
+------------------------------------------+
|  Project:    Website Redesign     [^]    |
|  +------------------------------------+  |
|  | * Website Redesign           P 1  |  |  <-- Selected
|  |   Mobile App                 P 2  |  |
|  |   Freelance: Client A        P 3  |  |
|  |   --------------------------------|  |
|  |   No Project                 P 0  |  |
|  +------------------------------------+  |
+------------------------------------------+
```

### Visuelle Details

- **Selected Project:** Bullet point (●) vor dem Namen
- **Brightness:** Jedes Projekt zeigt seine Graustufe als kleinen Dot
- **Shortcut Hints:** Rechts aligned (P 1, P 2, etc.)
- **Separator:** Vor "No Project"
- **Max Height:** 5 Projekte sichtbar, dann Scroll

### Animations

- Dropdown: Fade in + slide down (150ms)
- Selection: Instant highlight
- Close: Fade out (100ms)

## Testing

### Manuell zu testen
- [ ] Dropdown öffnen mit `P`
- [ ] Projekt auswählen mit Nummer (P 1, P 2...)
- [ ] "No Project" mit P 0
- [ ] Navigation mit Pfeiltasten
- [ ] Enter zum Auswählen
- [ ] Escape zum Schließen
- [ ] Projekt-Wechsel während laufender Session
- [ ] Partikel hat korrekte projectId nach Session
- [ ] Recent Order wird aktualisiert nach Auswahl

### Automatisierte Tests
- [ ] Component Test: ProjectSelector renders dropdown
- [ ] Component Test: Keyboard navigation works
- [ ] Component Test: Selection callback fires
- [ ] Integration Test: Timer saves projectId to Particle
- [ ] Integration Test: Recent projects order updates

## Definition of Done

- [ ] Code implementiert
- [ ] ProjectSelector Component fertig
- [ ] Timer-Integration fertig
- [ ] Keyboard Shortcuts funktionieren (P, P 0-9, Arrows, Enter, Escape)
- [ ] Partikel speichert projectId korrekt
- [ ] Recent Projects Order funktioniert
- [ ] Tests geschrieben & grün
- [ ] Animations smooth
- [ ] Code reviewed

## Notizen

**UX-Entscheidung:**
- Projekt kann während Session gewechselt werden (Flexibilität > Rigidität)
- Der letzte Stand bei Session-Ende zählt

**Performance:**
- Projekte werden beim Mount geladen, nicht bei jedem Dropdown-Open
- Recent Projects aus localStorage (schnell)

**Edge Cases:**
- Keine Projekte vorhanden → Dropdown zeigt nur "No Project" + "Create Project" Link
- Ausgewähltes Projekt wurde archiviert → Fallback auf "No Project"

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
