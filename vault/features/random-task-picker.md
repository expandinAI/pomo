# Random Task Picker – Konzept

> **"Wenn die Entscheidung blockiert, entscheide nicht."**

---

## Das Problem

Du hast mehrere Tasks eingegeben:

```
Email 10, Report 30, Meeting 15, Code Review 20
```

Und jetzt? Entscheidungsparalyse. Welchen zuerst? Alle sind wichtig. Keiner springt raus. Du starrst auf die Liste.

**Die ADHD-Falle:** Die Entscheidung selbst wird zur Hürde. Nicht die Arbeit.

---

## Die Particle-Lösung

**Kein Gamification. Keine Slot-Machine. Nur: Entscheidung abnehmen.**

Der Random Picker ist keine Animation, kein Spiel, kein Dopamin-Trick.
Er ist ein **Befreiungsschlag**. Du drückst eine Taste, und die Entscheidung ist getroffen.

---

## UX-Flow

### 1. Trigger: `R` Shortcut

**Warum `R`:**
- "**R**andom" – intuitiv
- Passt zu anderen Single-Key-Shortcuts (`S` Skip, `D` Dark, `M` Mute, `A` Ambient, `T` Task)
- Schnell und direkt – wie Particle selbst
- R war vorher ungenutzt

**Zusätzlich:** Dezenter Keyboard Hint im Task-Input bei 2+ Tasks.

### 2. Voraussetzung

- Mindestens 2 nicht-erledigte Tasks
- Wenn nur 1 Task → nichts passiert (oder: wird direkt gewählt)
- Wenn 0 Tasks → nichts passiert

### 3. Die Auswahl

**Keine lange Animation.** Particle ist kein Casino.

```typescript
const pendingTasks = tasks.filter(t => !t.completed);
const randomIndex = Math.floor(Math.random() * pendingTasks.length);
const pickedTask = pendingTasks[randomIndex];
```

**Feedback:** Kurzes visuelles Highlight (200ms), dann ist der Task markiert.

### 4. Die Markierung: `→` Prefix (nur visuell)

**Vorher:**
```
Email 10 · Report 30 · Meeting 15 · Code Review 20
```

**Nachher (Report wurde gepickt):**
```
→ Report 30 · Email 10 · Meeting 15 · Code Review 20
```

**Das `→` bedeutet:** "Das hier. Jetzt."

**Wichtig: Nur State, nicht persistiert.**
- Der `→` wird **nicht** im Input-String gespeichert
- Er ist ein flüchtiger visueller State
- Bei Reload/Neustart: Pick ist weg (das ist okay)
- Der Input-String bleibt sauber: `Report 30, Email 10, Meeting 15`

**Warum nur State:**
- Pick ist Entscheidungshilfe, nicht Task-Definition
- Einfacherer Parser (keine `→` Logik nötig)
- Saubere Trennung: Input = Daten, Pick = UI-State

### 5. Der gepickte Task rückt nach vorne (visuell)

Der gewählte Task wird **visuell** an Position 1 angezeigt. Der Input-String bleibt unverändert.

> "Das ist jetzt dein Fokus."

Die Reihenfolge im String ändert sich nicht – nur die Darstellung.

---

## Technische Details

### State-Modell (kein Parser-Change nötig)

```typescript
// In UnifiedTaskInput oder Timer-Komponente:
const [pickedTaskIndex, setPickedTaskIndex] = useState<number | null>(null);

// ParsedTask bleibt unverändert - kein "picked" Flag nötig
interface ParsedTask {
  text: string;
  duration: number;
  completed: boolean;
  // KEIN picked: boolean - das ist UI-State, nicht Daten
}
```

### Funktion: `pickRandomTask`

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

### Visuelle Darstellung mit pickedIndex

```typescript
// In der Render-Logik:
const displayTasks = useMemo(() => {
  if (pickedTaskIndex === null) return parsedTasks.tasks;

  // Visuell umordnen: gepickter Task zuerst
  const picked = parsedTasks.tasks[pickedTaskIndex];
  const others = parsedTasks.tasks.filter((_, i) => i !== pickedTaskIndex);
  return [picked, ...others];
}, [parsedTasks.tasks, pickedTaskIndex]);

// Beim Rendern:
{displayTasks.map((task, displayIndex) => {
  const isPicked = pickedTaskIndex !== null && displayIndex === 0;
  return (
    <span key={task.text}>
      {isPicked && <span className="text-accent">→ </span>}
      {task.text} {task.duration}
    </span>
  );
})}
```

### Reset des Pick-State

```typescript
// Pick wird zurückgesetzt bei:
// 1. Session startet → setPickedTaskIndex(null)
// 2. Tasks werden editiert → setPickedTaskIndex(null)
// 3. Escape gedrückt → setPickedTaskIndex(null)

useEffect(() => {
  // Wenn taskText sich ändert, Pick zurücksetzen
  setPickedTaskIndex(null);
}, [taskText]);
```

---

## UI-Verhalten

### Kompakte Anzeige (nicht fokussiert)

```
→ Report 30 · Email 10 · Meeting 15
```

- Der `→` ist `text-accent` (leichter Akzent, kein hartes Highlight)
- Gepickter Task hat normale Schrift, nicht bold
- Reihenfolge ist visuell umgeordnet (gepickter Task zuerst)

### Fokussierte Anzeige (Edit-Mode)

```
Email 10, Report 30, Meeting 15
```

- Im Edit-Mode: **kein `→` sichtbar** (nur Input-String)
- Pick-State bleibt erhalten, aber nicht im Input angezeigt
- Bei Textänderung: Pick wird automatisch zurückgesetzt
- `R` setzt neuen Pick (wenn nicht fokussiert)

### Animation beim Pick

**Subtil, nicht störend:**

1. Alle Tasks dimmen kurz (opacity 0.5, 100ms)
2. Der gepickte Task leuchtet auf (opacity 1, scale 1.02, 150ms)
3. Tasks ordnen sich um (200ms, spring animation)

**Gesamtdauer:** ~400ms

```typescript
const pickAnimation = {
  dim: { opacity: 0.5, transition: { duration: 0.1 } },
  highlight: {
    opacity: 1,
    scale: 1.02,
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  },
  reorder: {
    layout: true,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  }
};
```

---

## Keyboard-Flow

| Taste | Aktion |
|-------|--------|
| `R` | Random Pick (wenn Multi-Tasks) |
| `↵` | Session starten (mit gepicktem Task zuerst) |
| `Esc` | Pick aufheben (Pfeil entfernen) |

### Command Palette Integration

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

## Edge Cases

| Fall | Verhalten |
|------|-----------|
| 0 Tasks | Nichts passiert |
| 1 Task | Nichts passiert (keine Entscheidung nötig) |
| 1 Task + 1 erledigt | Nichts passiert |
| Alle Tasks erledigt | Nichts passiert |
| `R` während Animation | Ignorieren |
| `R` wenn schon gepickt | Neuer Pick (überschreibt) |

---

## Was wir NICHT bauen

| Feature | Warum nicht |
|---------|-------------|
| Slot-Machine Animation | Gamification |
| Sound beim Pick | Übertrieben |
| "Glückwunsch!" Toast | Gamification |
| Pick-Historie | Feature Creep |
| Gewichteter Random | Komplexität |

---

## Akzeptanzkriterien ✅

### Trigger
- [x] `R` Shortcut triggert Random Pick (wenn nicht in Input fokussiert)
- [x] Command Palette zeigt "Random Pick"

### Auswahl
- [x] Nur nicht-erledigte Tasks werden berücksichtigt
- [x] Bei <2 pending Tasks: Toast "Need 2+ tasks to pick"

### Markierung
- [x] Gepickter Task erhält `→` Prefix (visuell, nicht im String)
- [x] Gepickter Task wird visuell an Position 1 angezeigt
- [x] Pick-State wird bei Textänderung zurückgesetzt

### Animation
- [x] Kurzes Dim → Highlight → Reorder via Framer Motion
- [x] Spring-basierte Animation

### State-Verhalten
- [x] Pick ist flüchtiger UI-State (nicht persistiert)
- [x] Bei Textänderung: Pick wird zurückgesetzt
- [x] Bei Session-Start: Pick wird zurückgesetzt

---

## Definition of Done ✅

- [x] `pickedTaskIndex` State in Timer.tsx
- [x] `R` Shortcut implementiert
- [x] Visuelle Markierung (`→`) in kompakter Anzeige
- [x] Visuelle Umordnung (gepickter Task zuerst)
- [x] Subtile Animation (Framer Motion spring)
- [x] Command Palette Integration ("Random Pick")
- [x] Keyboard Help Liste aktualisiert
- [x] Dezenter Keyboard Hint bei 2+ Tasks
- [x] State-Reset bei Textänderung/Session-Start
- [x] **Prüffrage:** "Fühlt es sich wie Befreiung an, nicht wie ein Spiel?" ✓

---

*"Die beste Entscheidung ist manchmal: keine treffen müssen."*
