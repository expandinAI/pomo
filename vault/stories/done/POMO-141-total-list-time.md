---
type: story
status: done
priority: p0
effort: 3
feature: "[[features/timer-core]]"
created: 2026-01-23
updated: 2026-01-25
done_date: 2026-01-25
tags: [timer, planning, llama-life-learning, p0, adhd]
---

# POMO-141: Multi-Task Input mit Total Time

## User Story

> Als **ADHS-Nutzer**
> möchte ich **mehrere Tasks mit Zeiten in einer Session planen**,
> damit **ich sehe, wie lange meine gesamte Session dauert und strukturiert arbeiten kann**.

## Kontext

Link zum Feature: [[features/timer-core]]

**Llama Life Learning:** ADHS-Nutzer wollen ihre Aufgaben sehen. Sie planen mehrere kleine Tasks für eine Session (z.B. 25min) und brauchen Überblick über die Gesamtzeit.

**Strategie: Minimal Viable Feature**
Wir starten bewusst einfach, um zu validieren ob Nutzer Multi-Tasks überhaupt nutzen. Komplexes Task-Management (Checkboxen, Completion-Tracking, Reordering) kommt erst wenn der Bedarf bestätigt ist.

## Scope

### In Scope (MVP)
- Mehrzeilige Task-Eingabe (Textarea statt Input)
- Time-Parsing pro Zeile (bestehendes System wiederverwenden)
- Live-Gesamtzeit-Anzeige
- Cmd+Enter zum Starten

### Explizit Out of Scope (Later)
- ❌ Checkboxen zum Abhaken
- ❌ Task-Completion während Session
- ❌ Reorder/Drag & Drop
- ❌ Persistente Task-Listen
- ❌ Task-Historie/Tracking

## Akzeptanzkriterien

### Core Funktionalität
- [x] **Given** Task-Input, **When** Fokus, **Then** Textarea statt einzeiligem Input
- [x] **Given** Textarea, **When** Enter, **Then** neue Zeile (nicht Submit)
- [x] **Given** Textarea, **When** Cmd+Enter, **Then** Session startet
- [x] **Given** mehrere Zeilen mit Zeiten, **When** getippt, **Then** Gesamtzeit live berechnet
- [x] **Given** Zeile ohne Zeit, **When** berechnet, **Then** wird ignoriert (0min)

### Time-Parsing (bestehendes System)
- [x] "Emails 10min" → Task "Emails", 10 Minuten
- [x] "Call 30" → Task "Call", 30 Minuten
- [x] "Deep Work 1h" → Task "Deep Work", 60 Minuten
- [x] "Nur Text" → Task "Nur Text", 0 Minuten (keine Zeit)

### UI/UX
- [x] **Given** Textarea mit Tasks, **When** angezeigt, **Then** Gesamtzeit unter Textarea
- [ ] **Given** Gesamtzeit, **When** End Time Preview aktiv, **Then** auch "Fertig um: HH:MM" zeigen *(deferred)*
- [x] **Given** Keine Tasks mit Zeit, **When** berechnet, **Then** Total ausblenden oder "0min"
- [x] **Given** Textarea, **When** leer, **Then** Placeholder "What are you working on?"

### Keyboard
- [x] `T` → Öffnet Task-Input (wie bisher)
- [x] `Enter` → Neue Zeile
- [x] `Cmd+Enter` / `Ctrl+Enter` → Startet Session
- [x] `Escape` → Schließt Input

### Bonus (über Scope hinaus implementiert)
- [x] Kompakte Anzeige mit Styling (Task weiß, Dauer grau) wenn unfokussiert
- [x] Edit-Modus beim Klick auf kompakte Anzeige
- [x] Konsistent für Single- und Multi-Task Eingaben
- [x] Auto-Grow Textarea

## UI Mockup

```
┌─────────────────────────────────────────┐
│  What are you working on?               │
├─────────────────────────────────────────┤
│  Emails aufräumen 10min                 │
│  Tagesplan erstellen 5min               │
│  Call mit Max 10min                     │
│  |                                      │  ← Cursor, weitere Zeilen möglich
├─────────────────────────────────────────┤
│  Total: 25min · Done by 14:35           │  ← Live-Update
└─────────────────────────────────────────┘
         [Start Session ⌘↵]
```

**Parsing-Preview pro Zeile (optional):**
```
│  Emails aufräumen 10min      → 10min    │
│  Tagesplan erstellen 5min    →  5min    │
│  Call mit Max 10min          → 10min    │
│  Notizen machen              →  -       │  ← Keine Zeit erkannt
```

## Technische Details

### Berechnung

```typescript
interface ParsedTask {
  text: string;
  duration: number; // in minutes, 0 if not parsed
}

const parseTaskLines = (input: string): ParsedTask[] => {
  return input
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const { taskName, duration } = parseTimeFromInput(line); // Bestehende Funktion
      return { text: taskName || line, duration: duration || 0 };
    });
};

const calculateTotalTime = (tasks: ParsedTask[]): number => {
  return tasks.reduce((sum, task) => sum + task.duration, 0);
};
```

### Komponenten-Änderungen

1. **TaskInput.tsx** (oder neuer Name)
   - `<input>` → `<textarea>`
   - Höhe: auto-grow oder feste Höhe mit Scroll
   - Enter-Handling anpassen

2. **Time-Parsing**
   - `parseTimeFromInput()` pro Zeile aufrufen
   - Bestehende Logik wiederverwenden

3. **Total-Display**
   - Neue Komponente oder Teil von TaskInput
   - Live-Update bei Änderung

## Testing

### Manuell zu testen
- [ ] Mehrzeilige Eingabe funktioniert
- [ ] Enter = neue Zeile, nicht Submit
- [ ] Cmd+Enter startet Session
- [ ] Time-Parsing funktioniert pro Zeile
- [ ] Gesamtzeit berechnet korrekt
- [ ] Zeilen ohne Zeit werden ignoriert
- [ ] "Fertig um" zeigt korrekte Uhrzeit
- [ ] Keyboard-Shortcuts funktionieren

## Definition of Done

- [x] Textarea statt Input implementiert
- [x] Time-Parsing pro Zeile funktioniert
- [x] Gesamtzeit-Anzeige implementiert
- [x] Keyboard-Shortcuts angepasst
- [x] Edge Cases abgedeckt
- [x] Build erfolgreich

## Future Iterations (wenn validiert)

Wenn Nutzer Multi-Tasks aktiv nutzen, können wir erweitern:

1. **Task-Checkboxen** - Tasks während Session abhaken
2. **Current Task Highlight** - Aktiver Task hervorgehoben
3. **Task-Completion im Particle** - Welche Tasks wurden erledigt?
4. **Task-Templates** - Wiederkehrende Task-Listen speichern
5. **Reordering** - Drag & Drop zum Umsortieren
