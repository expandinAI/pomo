---
type: story
status: done
priority: p2
effort: 1
feature: "[[features/random-task-picker]]"
created: 2026-01-23
updated: 2026-01-27
done_date: 2026-01-27
tags: [tasks, adhd-friendly, decision-fatigue, p2]
---

# POMO-146: Random Task Picker

## User Story

> Als **Nutzer mit Entscheidungsparalyse**
> möchte ich **einen zufälligen Task aus meiner Liste auswählen lassen können**,
> damit **ich bei Überforderung einfach loslegen kann, ohne entscheiden zu müssen**.

## Kontext

Link zum Feature: [[features/random-task-picker]]

**Das Problem:** Du hast mehrere Tasks eingegeben (`Email 10, Report 30, Meeting 15`) und starrst auf die Liste. Welchen zuerst? Die Entscheidung selbst wird zur Hürde.

**Die Particle-Lösung:** Kein Gamification, keine Slot-Machine. Nur: Entscheidung abnehmen. `R` drücken, fertig.

---

## UX-Konzept

### Trigger
- **`R`** – "**R**andom", einfach und direkt wie andere Shortcuts (S, D, M, A, T)
- Command Palette: "Random Pick"

### Markierung: `→` Prefix (nur visuell)

**Vorher:**
```
Email 10 · Report 30 · Meeting 15
```

**Nachher (Report wurde gepickt):**
```
→ Report 30 · Email 10 · Meeting 15
```

- `→` ist **nur UI-State**, nicht im Input-String gespeichert
- Gepickter Task wird visuell an Position 1 angezeigt
- Bei Textänderung oder Session-Start: Pick wird zurückgesetzt

### Animation

Subtil, keine Slot-Machine:
1. Alle Tasks dimmen kurz (opacity 0.5, 100ms)
2. Gepickter Task leuchtet auf (opacity 1, scale 1.02, 150ms)
3. Tasks ordnen sich visuell um (200ms, spring)

**Gesamtdauer:** ~400ms

---

## Akzeptanzkriterien

### Trigger
- [x] **Given** Multi-Tasks (≥2 pending), **When** `R`, **Then** Random Pick
- [x] **Given** <2 pending Tasks, **When** `R`, **Then** Toast "Need 2+ tasks to pick"
- [x] **Given** Input fokussiert, **When** `R`, **Then** nichts passiert (Typing)
- [x] **Given** Command Palette, **When** "random", **Then** "Random Pick" Option

### Markierung
- [x] **Given** Task gepickt, **When** angezeigt, **Then** `→` Prefix + erste Position
- [x] **Given** Pick aktiv, **When** kompakte Anzeige, **Then** `→` in `text-accent`
- [x] **Given** Pick aktiv, **When** Edit-Mode, **Then** kein `→` im Input sichtbar

### State-Verhalten
- [x] **Given** Pick aktiv, **When** taskText ändert sich, **Then** Pick zurückgesetzt
- [x] **Given** Pick aktiv, **When** Session startet, **Then** Pick zurückgesetzt
- [x] **Given** Pick aktiv, **When** `R` erneut, **Then** neuer Pick (überschreibt)

### Animation
- [x] **Given** Pick getriggert, **When** Animation, **Then** Dim → Highlight → Reorder
- [x] **Given** Framer Motion, **When** Pick, **Then** spring-basierte Animation

---

## Technische Details

### State-Modell

```typescript
// In UnifiedTaskInput:
const [pickedTaskIndex, setPickedTaskIndex] = useState<number | null>(null);

// Reset bei Textänderung
useEffect(() => {
  setPickedTaskIndex(null);
}, [taskText]);
```

### Pick-Funktion

```typescript
function pickRandomTask(tasks: ParsedTask[]): number | null {
  const pendingIndices = tasks
    .map((t, i) => ({ task: t, index: i }))
    .filter(({ task }) => !task.completed)
    .map(({ index }) => index);

  if (pendingIndices.length < 2) return null;

  const randomIdx = Math.floor(Math.random() * pendingIndices.length);
  return pendingIndices[randomIdx];
}
```

### Visuelle Umordnung

```typescript
const displayTasks = useMemo(() => {
  if (pickedTaskIndex === null) return parsedTasks.tasks;

  const picked = parsedTasks.tasks[pickedTaskIndex];
  const others = parsedTasks.tasks.filter((_, i) => i !== pickedTaskIndex);
  return [picked, ...others];
}, [parsedTasks.tasks, pickedTaskIndex]);
```

### Command Palette

```typescript
{
  id: 'pick-random-task',
  label: 'Random Pick',
  shortcut: 'R',
  category: 'timer',
  icon: <Shuffle className="w-4 h-4" />,
  keywords: ['random', 'pick', 'task', 'shuffle', 'choose'],
  disabled: () => pendingTaskCount < 2,
}
```

---

## Was wir NICHT bauen

| Feature | Warum nicht |
|---------|-------------|
| Slot-Machine Animation | Gamification |
| Sound beim Pick | Übertrieben |
| Pick-Modal | Zu viel UI |
| Persistierter Pick | Unnötige Komplexität |
| Gewichteter Random | Feature Creep |

---

## Definition of Done

- [x] `pickedTaskIndex` State in Timer.tsx
- [x] `R` Shortcut (global, wenn nicht in Input)
- [x] Visuelle Markierung (`→`) in kompakter Anzeige
- [x] Visuelle Umordnung (gepickter Task zuerst)
- [x] Subtile Animation (Dim → Highlight → Reorder) via Framer Motion
- [x] Command Palette Integration ("Random Pick")
- [x] Keyboard Help Liste aktualisiert
- [x] Dezenter Keyboard Hint im Task-Input bei 2+ Tasks
- [x] State-Reset bei Textänderung/Session-Start
- [x] **Prüffrage:** "Fühlt es sich wie Befreiung an, nicht wie ein Spiel?" ✓
