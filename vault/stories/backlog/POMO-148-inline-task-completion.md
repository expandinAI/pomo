---
type: story
status: backlog
priority: p1
effort: 2
feature: "[[features/task-management]]"
created: 2026-01-25
updated: 2026-01-25
done_date: null
tags: [tasks, adhd-friendly, multi-line, inline-editing, p1]
---

# POMO-148: Inline Task Completion (Durchstreichen mit `-`)

## User Story

> Als **Nutzer mit ADHD**
> möchte ich **Tasks während der Session als erledigt markieren können**,
> damit **ich eine Übersicht behalte, was noch offen ist, ohne meinen Flow zu unterbrechen**.

## Kontext

Link zum Feature: [[features/task-management]]

**Prerequisite:** POMO-141 (Multi-Line Task Input)

**ADHD-Insight:** Nutzer mit ADHD brauchen oft visuelle Übersicht über Fortschritt. Das Durchstreichen erledigter Tasks gibt Mini-Dopamin-Kicks und hilft, den Fokus zu behalten.

**Keyboard-First:** Einfach `-` vor die Zeile setzen - kein Button, kein Checkbox-Klicken.

## Akzeptanzkriterien

### Marking Tasks as Done

- [ ] **Given** Multi-Line Edit offen, **When** `-` am Zeilenanfang, **Then** Task als erledigt markiert
- [ ] **Given** `-` am Zeilenende, **When** Edit schließen, **Then** Task ebenfalls als erledigt erkannt
- [ ] **Given** Task markiert, **When** Preview, **Then** Task durchgestrichen angezeigt
- [ ] **Given** `-` entfernt, **When** Edit schließen, **Then** Task wieder aktiv

### Timer-Verhalten (WICHTIG)

- [ ] **Given** Session läuft, **When** Edit öffnen + Tasks abhaken + schließen, **Then** Timer läuft WEITER
- [ ] **Given** Session läuft, **When** Edit öffnen + Cmd+Enter, **Then** Session NEU starten
- [ ] **Given** Tasks geändert ohne Cmd+Enter, **When** schließen, **Then** keine Zeit-Neuberechnung

### Preview-Anzeige

- [ ] **Given** Tasks mit erledigten, **When** Preview (collapsed), **Then** erledigte durchgestrichen
- [ ] **Given** Mehrere Tasks, **When** Preview, **Then** Format: `~~Done~~ · Active · Next`
- [ ] **Given** Alle Tasks erledigt, **When** Preview, **Then** Alle durchgestrichen

### Keyboard Flow

- [ ] **Given** Timer läuft, **When** `T` drücken, **Then** Edit öffnet sich
- [ ] **Given** Edit offen, **When** `-` tippen + Escape, **Then** Task markiert, Timer läuft weiter
- [ ] **Given** Edit offen, **When** Cmd+Enter, **Then** Neue Session (falls gewünscht)

## Technische Details

### Parsing-Logik

```typescript
interface ParsedTask {
  text: string;
  duration: number;
  completed: boolean;  // NEU
}

const parseTaskLine = (line: string): ParsedTask => {
  const trimmed = line.trim();

  // Check for completion marker at start or end
  const isCompleted = trimmed.startsWith('-') || trimmed.endsWith('-');

  // Remove marker for parsing
  const cleanLine = trimmed
    .replace(/^-\s*/, '')  // Remove leading -
    .replace(/\s*-$/, ''); // Remove trailing -

  const parsed = parseSmartInput(cleanLine);

  return {
    text: parsed.taskName || cleanLine,
    duration: parsed.durationSeconds ? Math.round(parsed.durationSeconds / 60) : 0,
    completed: isCompleted,
  };
};
```

### Preview-Rendering

```typescript
const renderPreview = (tasks: ParsedTask[]): JSX.Element => {
  return (
    <span className="flex items-center gap-2">
      {tasks.map((task, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="text-tertiary">·</span>}
          <span className={task.completed ? 'line-through opacity-50' : ''}>
            {task.text}
          </span>
        </Fragment>
      ))}
    </span>
  );
};
```

### UI Mockup

**Multi-Line Edit (während Session):**
```
┌─────────────────────────────────────┐
│ - Emails 5                          │  ← erledigt (mit -)
│ Call 10                             │  ← aktiv
│ Meeting 15                          │  ← noch offen
└─────────────────────────────────────┘
  ~~Emails~~ · Call · Meeting           ← Live Preview

  [Esc] Schließen   [Cmd+Enter] Neu starten
```

**Collapsed Preview (Timer läuft):**
```
┌─────────────────────────────────────┐
│            18:45                    │
│                                     │
│   ~~Emails~~ · Call · Meeting       │  ← Durchgestrichen sichtbar
│   Total: 25min (5 erledigt)         │
└─────────────────────────────────────┘
```

### State-Management

```typescript
// Im Timer-State
interface TaskState {
  raw: string;           // Original multi-line text
  tasks: ParsedTask[];   // Parsed tasks with completion status
  totalMinutes: number;
  completedMinutes: number;
}

// Edit schließen OHNE Cmd+Enter = nur Task-State updaten
const handleEditClose = (newText: string) => {
  const parsed = parseMultiLineInput(newText);
  setTaskState({
    raw: newText,
    tasks: parsed.tasks,
    totalMinutes: parsed.totalMinutes,
    completedMinutes: parsed.tasks
      .filter(t => t.completed)
      .reduce((sum, t) => sum + t.duration, 0),
  });
  // Timer läuft weiter - KEIN Reset!
};

// Cmd+Enter = Neue Session
const handleNewSession = (newText: string) => {
  const parsed = parseMultiLineInput(newText);
  // Timer Reset + Neu starten
  startNewSession(parsed.totalMinutes * 60);
};
```

## Nicht im Scope (v1)

- Automatisches Weiterschalten zum nächsten Task
- Sound bei Task-Completion
- Persistenz über Sessions hinweg (Tasks sind session-lokal)
- Reorder von Tasks per Drag & Drop

## Testing

### Manuell zu testen

- [ ] `-` am Anfang markiert Task als erledigt
- [ ] `-` am Ende markiert Task als erledigt
- [ ] Preview zeigt durchgestrichene Tasks
- [ ] Timer läuft weiter bei Edit ohne Cmd+Enter
- [ ] Cmd+Enter startet neue Session
- [ ] Entfernen von `-` macht Task wieder aktiv

## Definition of Done

- [ ] Parsing-Logik für `-` Marker
- [ ] Preview mit Durchstreichen-Styling
- [ ] Timer-Verhalten korrekt (weiter vs. neu)
- [ ] Keyboard-Shortcuts dokumentiert
- [ ] Code Review abgeschlossen
