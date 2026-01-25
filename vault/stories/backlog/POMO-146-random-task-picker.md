---
type: story
status: backlog
priority: p2
effort: 2
feature: "[[features/task-management]]"
created: 2026-01-23
updated: 2026-01-23
done_date: null
tags: [tasks, adhd-friendly, decision-fatigue, llama-life-learning, p2]
---

# POMO-146: Random Task Picker

## User Story

> Als **Nutzer mit Entscheidungsparalyse**
> möchte ich **einen zufälligen Task aus meiner Liste auswählen lassen können**,
> damit **ich bei Überforderung einfach loslegen kann, ohne entscheiden zu müssen**.

## Kontext

Link zum Feature: [[features/task-management]]

**Llama Life Learning:** Der "Pick a random task" Button ist besonders beliebt bei ADHD-Nutzern. Wenn man vor zu vielen Optionen steht, kann die Entscheidung selbst blockieren. Ein zufälliger Pick nimmt diese Last ab.

**Keyboard-First:** Bei uns wird das natürlich per Shortcut funktionieren!

## Akzeptanzkriterien

### Random-Auswahl
- [ ] **Given** Task-Liste mit >1 Tasks, **When** Random getriggert, **Then** zufälliger Task wird ausgewählt
- [ ] **Given** Task ausgewählt, **When** Random, **Then** Task wird highlighted + Timer vorbereitet
- [ ] **Given** Nur 1 Task in Liste, **When** Random, **Then** dieser Task wird ausgewählt
- [ ] **Given** Leere Liste, **When** Random, **Then** Hinweis "Füge erst Tasks hinzu"

### Keyboard Shortcut
- [ ] **Given** Task-Liste sichtbar, **When** `Shift+R` oder `?`, **Then** Random Task Picker
- [ ] **Given** Command Palette, **When** "random" eingeben, **Then** "Pick random task" Option

### Animation
- [ ] **Given** Random getriggert, **When** Auswahl, **Then** kurze "Slot-Machine" Animation
- [ ] **Given** Animation, **When** endet, **Then** gewählter Task blinkt kurz auf

### Quick Start
- [ ] **Given** Task per Random gewählt, **When** `Enter`, **Then** Session startet sofort

## Technische Details

### Random-Logik

```typescript
const pickRandomTask = (tasks: Task[]): Task | null => {
  const pendingTasks = tasks.filter(t => !t.completed);

  if (pendingTasks.length === 0) return null;
  if (pendingTasks.length === 1) return pendingTasks[0];

  const randomIndex = Math.floor(Math.random() * pendingTasks.length);
  return pendingTasks[randomIndex];
};
```

### Animation (Framer Motion)

```typescript
const SlotMachineAnimation = ({ tasks, onComplete }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);

  useEffect(() => {
    if (!isSpinning) return;

    // Schnelles Durchblättern, dann verlangsamen
    const intervals = [50, 50, 50, 100, 100, 150, 200, 300, 400];
    let step = 0;

    const spin = () => {
      if (step >= intervals.length) {
        setIsSpinning(false);
        onComplete(tasks[currentIndex]);
        return;
      }

      setCurrentIndex(prev => (prev + 1) % tasks.length);
      step++;
      setTimeout(spin, intervals[step] || 400);
    };

    spin();
  }, []);

  return (
    <motion.div
      animate={{ scale: isSpinning ? [1, 1.02, 1] : 1 }}
      className="text-xl font-medium"
    >
      {tasks[currentIndex]?.title}
    </motion.div>
  );
};
```

### UI Mockup

**Vor Random:**
```
┌─────────────────────────────────────┐
│  Tasks                    [🎲]      │  ← Random Button
│  ─────────────────────────────────  │
│  ☐ Email beantworten      15 min    │
│  ☐ Report schreiben       45 min    │
│  ☐ Meeting vorbereiten    20 min    │
│  ☐ Code Review            30 min    │
└─────────────────────────────────────┘
```

**Während Animation:**
```
┌─────────────────────────────────────┐
│                                     │
│         🎲 Auswahl läuft...         │
│                                     │
│    ░░░ Report schreiben ░░░         │  ← Schnell wechselnd
│                                     │
└─────────────────────────────────────┘
```

**Nach Auswahl:**
```
┌─────────────────────────────────────┐
│                                     │
│         🎯 Dein Task:               │
│                                     │
│    ▶ Report schreiben (45 min)      │  ← Highlighted
│                                     │
│    [Enter] Starten  [Esc] Abbrechen │
└─────────────────────────────────────┘
```

### Command Palette Integration

```typescript
const randomTaskCommand: Command = {
  id: 'pick-random-task',
  label: 'Pick random task',
  shortcut: 'Shift+R',
  icon: '🎲',
  category: 'Tasks',
  action: () => {
    const task = pickRandomTask(tasks);
    if (task) {
      highlightTask(task.id);
      showRandomPickModal(task);
    }
  },
};
```

## Nicht im Scope (v1)

- Gewichtete Randomisierung (nach Priorität)
- "Shuffle Mode" für ganze Liste
- Exclusion-Liste für Random

## Testing

### Manuell zu testen
- [ ] Random wählt aus allen nicht-erledigten Tasks
- [ ] Animation läuft smooth
- [ ] Keyboard Shortcut funktioniert
- [ ] Command Palette Integration
- [ ] Edge Case: 0 oder 1 Task

## Definition of Done

- [ ] Random-Logik implementiert
- [ ] Animation implementiert
- [ ] Keyboard Shortcut (Shift+R)
- [ ] Command Palette Integration
- [ ] UI für Auswahl-Modal
- [ ] Edge Cases abgedeckt
- [ ] Code Review abgeschlossen
