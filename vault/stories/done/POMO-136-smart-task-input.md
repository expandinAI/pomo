---
type: story
status: backlog
priority: p0
effort: 3
feature: keyboard-first
created: 2026-01-23
updated: 2026-01-23
done_date: null
tags: [task, keyboard, ux, differentiator]
---

# POMO-136: Smart Task Input

## User Story

> Als **Keyboard-First Power-User**
> möchte ich **"Meeting 30" tippen und sofort einen 30min Timer starten**,
> damit ich **blitzschnell in den Flow komme ohne Mausklicks**.

## Kontext

**Particle-Differenzierung:** Kein anderer Pomodoro-Timer hat Keyboard-First + Smart Input. Das ist unser USP.

**Flow:** `T` → `"Standup 15"` → `Enter` = **3 Interaktionen vom Idle zum Flow.**

## Design-Entscheidungen

| Aspekt | Entscheidung |
|--------|--------------|
| Timer-Typ | **One-off Timer** - Custom Duration für Work, danach normale Break vom Preset |
| Preview | **Sofort** bei Pattern-Erkennung |
| Preview-Position | **Unter dem Input** (wie Autocomplete) |
| Project-Integration | **Nein** - P-Shortcut reicht |
| Duration Min | **1 Minute** |
| Duration Max | **180 Minuten** (3h) |
| Bei Überschreitung | Stille Korrektur + StatusMessage "Maximum 180 min" (2s) |
| Preset-Keywords | **Keine im MVP** - halten wir einfach |

---

## Akzeptanzkriterien

### Core Parsing
- [ ] **Given** Input "Meeting 30", **When** Enter, **Then** Task "Meeting" + 30min Timer startet
- [ ] **Given** Input "Meeting 30m", **When** Enter, **Then** Task "Meeting" + 30min Timer startet
- [ ] **Given** Input "30 Meeting", **When** Enter, **Then** Task "Meeting" + 30min Timer startet
- [ ] **Given** Input "Meeting 1h", **When** Enter, **Then** Task "Meeting" + 60min Timer startet
- [ ] **Given** Input "1h Meeting", **When** Enter, **Then** Task "Meeting" + 60min Timer startet
- [ ] **Given** Input "30", **When** nur Zahl, **Then** 30min Timer ohne Task-Name startet
- [ ] **Given** Input "Meeting30" (kein Space), **When** Enter, **Then** normaler Task "Meeting30", Preset-Duration

### Duration Limits
- [ ] **Given** Input "Focus 999", **When** Enter, **Then** Timer startet mit 180min + StatusMessage "Maximum 180 min"
- [ ] **Given** Input "Quick 1", **When** Enter, **Then** Timer startet mit 1min

### Preview UX
- [ ] **Given** ich tippe "Meeting 3", **When** Pattern erkannt, **Then** Preview erscheint sofort unter Input
- [ ] **Given** Preview sichtbar, **When** ich weitertipe zu "Meeting 30", **Then** Preview updated live
- [ ] **Given** ich lösche die Zahl, **When** nur "Meeting" übrig, **Then** Preview verschwindet

### Flow nach One-off Timer
- [ ] **Given** "Standup 15" gestartet, **When** 15min Work complete, **Then** normale Break vom aktuellen Preset
- [ ] **Given** Break complete, **When** nächste Session, **Then** zurück zum normalen Preset-Zyklus

---

## Unterstützte Patterns

```
PATTERN                  TASK           DURATION
─────────────────────────────────────────────────
"Meeting 30"             Meeting        30 min
"Meeting 30m"            Meeting        30 min
"Meeting 30min"          Meeting        30 min
"30 Meeting"             Meeting        30 min
"30m Meeting"            Meeting        30 min
"Meeting 1h"             Meeting        60 min
"Meeting 1hr"            Meeting        60 min
"1h Meeting"             Meeting        60 min
"30"                     (kein Task)    30 min
"1h"                     (kein Task)    60 min
"Meeting"                Meeting        (Preset-Duration)
"Meeting30"              Meeting30      (Preset-Duration) ← kein Space = kein Parse
```

---

## UI/UX

### Preview unter Input

```
┌────────────────────────────────────────────────┐
│ Meeting 30                                     │  ← User Input
├────────────────────────────────────────────────┤
│ Meeting · 30 min                          ↵    │  ← Preview (erscheint sofort)
└────────────────────────────────────────────────┘
```

### Preview-States

```
Input              Preview
─────────────────────────────────────────
"Meet"             (keine Preview)
"Meeting 3"        Meeting · 3 min
"Meeting 30"       Meeting · 30 min
"30 Stan"          Stan · 30 min
"1h"               60 min
"Focus"            (keine Preview - kein Pattern)
"Focus 999"        Focus · 180 min (max korrigiert)
```

### Visual Design

- Preview-Box: `bg-surface`, `border border-tertiary/20`, `rounded-lg`
- Task-Name: `text-primary`, `font-medium`
- Duration: `text-tertiary`, nach `·` Separator
- Enter-Hint: `↵` Icon rechts, `text-tertiary/50`
- Animation: `fade-in` 150ms wenn Preview erscheint

### StatusMessage bei Max-Korrektur

```
User tippt: "Marathon 999" → Enter
Timer startet: 180 min
StatusMessage: "Maximum 180 min" (2 Sekunden, dann fade-out)
```

---

## Technische Details

### Betroffene Dateien
```
src/
├── components/task/
│   └── UnifiedTaskInput.tsx  # Preview-Integration
├── components/timer/
│   └── Timer.tsx             # One-off Duration Support
├── lib/
│   └── smart-input-parser.ts # NEU: Parsing Logik
└── (StatusMessage bereits vorhanden)
```

### Parser Implementation

```typescript
// src/lib/smart-input-parser.ts

export interface ParsedInput {
  taskName: string | null;
  duration: number | null;  // in seconds (für Timer-Kompatibilität)
  raw: string;
}

const MIN_DURATION = 1;      // 1 minute
const MAX_DURATION = 180;    // 3 hours

// Patterns in Prioritätsreihenfolge
const PATTERNS = [
  // "Meeting 30" oder "Meeting 30m" oder "Meeting 30min"
  /^(.+?)\s+(\d+)\s*(m|min|mins)?$/i,

  // "Meeting 1h" oder "Meeting 1hr" oder "Meeting 1hour"
  /^(.+?)\s+(\d+)\s*(h|hr|hrs|hour|hours)$/i,

  // "30 Meeting" oder "30m Meeting"
  /^(\d+)\s*(m|min|mins)?\s+(.+)$/i,

  // "1h Meeting"
  /^(\d+)\s*(h|hr|hrs|hour|hours)\s+(.+)$/i,

  // Nur Zahl: "30" oder "30m" oder "1h"
  /^(\d+)\s*(m|min|mins|h|hr|hrs|hour|hours)?$/i,
];

export function parseSmartInput(input: string): ParsedInput {
  const trimmed = input.trim();

  if (!trimmed) {
    return { taskName: null, duration: null, raw: input };
  }

  for (const pattern of PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      const result = extractFromMatch(match, pattern);
      if (result.duration !== null) {
        // Clamp duration
        const clampedMinutes = Math.max(MIN_DURATION, Math.min(MAX_DURATION, result.duration));
        return {
          ...result,
          duration: clampedMinutes * 60, // Convert to seconds
          wasLimited: result.duration > MAX_DURATION,
        };
      }
    }
  }

  // Fallback: just a task name, no duration
  return { taskName: trimmed, duration: null, raw: input };
}

function extractFromMatch(match: RegExpMatchArray, pattern: RegExp): ParsedInput {
  // ... pattern-specific extraction logic
}
```

### Timer.tsx Integration

```typescript
// Neuer State für One-off Duration
const [oneOffDuration, setOneOffDuration] = useState<number | null>(null);

// Bei Task-Submit mit Duration
const handleTaskSubmitWithDuration = useCallback((task: string | null, duration: number) => {
  if (task) {
    dispatch({ type: 'SET_TASK', task });
  }
  setOneOffDuration(duration);
  // Timer startet mit custom duration statt durations[mode]
}, []);

// Bei Session Complete: One-off zurücksetzen
// → Normale Break vom Preset
// → Danach oneOffDuration = null, zurück zum Zyklus
```

### UnifiedTaskInput Integration

```typescript
function UnifiedTaskInput({ onSubmitWithDuration, ... }) {
  const [input, setInput] = useState('');
  const parsed = useMemo(() => parseSmartInput(input), [input]);

  const showPreview = parsed.duration !== null;

  const handleSubmit = () => {
    if (parsed.duration) {
      onSubmitWithDuration(parsed.taskName, parsed.duration, parsed.wasLimited);
    } else {
      onSubmit(parsed.taskName);
    }
  };

  return (
    <div className="relative">
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />

      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-1 w-full bg-surface border border-tertiary/20 rounded-lg px-3 py-2"
          >
            <span className="text-primary font-medium">
              {parsed.taskName || ''}
            </span>
            {parsed.taskName && <span className="text-tertiary mx-1">·</span>}
            <span className="text-tertiary">
              {Math.floor(parsed.duration / 60)} min
            </span>
            <span className="float-right text-tertiary/50">↵</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## Keyboard Flow

```
Idle State
    │
    ▼
[T] Focus Task Input
    │
    ▼
"Standup 15" (tippen)
    │
    ▼
Preview: "Standup · 15 min ↵"
    │
    ▼
[Enter] Start Timer
    │
    ▼
15 min Work Session
    │
    ▼
Complete → "Well done!"
    │
    ▼
Normal Break (vom Preset, z.B. 5 min)
    │
    ▼
Back to normal Preset cycle
```

**Total: 3 Interaktionen (T → tippen → Enter) vom Idle zum Flow.**

---

## Edge Cases

| Case | Behavior |
|------|----------|
| `"Meeting 0"` | Ignorieren, Task "Meeting 0", Preset-Duration |
| `"Meeting -30"` | Ignorieren, Task "Meeting -30", Preset-Duration |
| `"Meeting 999"` | Korrigiert auf 180 min + StatusMessage |
| `""` (leer) + Enter | Timer startet ohne Task mit Preset-Duration |
| `"  30  "` (Whitespace) | Trimmed → 30 min ohne Task |
| `"Meeting  30"` (doppelt Space) | Task "Meeting", 30 min (robust) |

---

## Testing

### Manuell zu testen
- [ ] "Meeting 30" → Task "Meeting", 30 min
- [ ] "Code Review 45m" → Task "Code Review", 45 min
- [ ] "Focus 1h" → Task "Focus", 60 min
- [ ] "25" → Kein Task, 25 min
- [ ] "30 Standup" → Task "Standup", 30 min (Zahl zuerst)
- [ ] "Einfach nur Text" → Normaler Task, Preset-Duration
- [ ] "Marathon 999" → 180 min + StatusMessage
- [ ] Preview erscheint sofort bei Pattern
- [ ] Preview verschwindet wenn Zahl gelöscht
- [ ] Nach One-off: normale Break, dann normaler Zyklus

---

## Definition of Done

- [ ] Parser implementiert (`smart-input-parser.ts`)
- [ ] Preview unter Input erscheint sofort
- [ ] Alle Pattern-Varianten funktionieren
- [ ] Duration-Limits mit StatusMessage
- [ ] One-off Timer integriert in Timer.tsx
- [ ] Nach One-off: normale Break vom Preset
- [ ] Beide Themes getestet
- [ ] Keyboard Flow getestet (T → Input → Enter)

---

## Arbeitsverlauf

### Gestartet:
### Erledigt:
