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

Llama Life's Killer-Feature: Natural Language Input. "Meeting 30" wird zu Task "Meeting" + 30min Timer. Das ist **perfekt für Particle's Keyboard-First USP**. Wir machen es noch smarter.

**Particle-Philosophie:** Tippen → Enter → Arbeiten. Drei Schritte maximum. Keine Dropdowns, keine Modals, keine Mausklicks.

## Akzeptanzkriterien

### Core Parsing
- [ ] **Given** Input "Meeting 30", **When** Enter, **Then** Task "Meeting" + 30min Timer startet
- [ ] **Given** Input "Deep Work 90", **When** Enter, **Then** Task "Deep Work" + 90min Timer startet
- [ ] **Given** Input "Code Review", **When** Enter (ohne Zahl), **Then** Task + aktuelle Preset-Zeit
- [ ] **Given** Input "25", **When** nur Zahl, **Then** Timer startet ohne Task-Name (anonym)

### Smart Patterns
- [ ] **Given** "standup 15m", **When** mit "m" Suffix, **Then** 15 Minuten erkannt
- [ ] **Given** "focus 1h", **When** mit "h" Suffix, **Then** 60 Minuten erkannt
- [ ] **Given** "pomodoro", **When** Keyword, **Then** Classic Preset (25min)
- [ ] **Given** "deep" oder "deepwork", **When** Keyword, **Then** Deep Work Preset (50min)

### UX
- [ ] **Given** gültiges Pattern, **When** ich tippe, **Then** Preview zeigt "Meeting · 30 min"
- [ ] **Given** ungültiges Pattern, **When** ich tippe, **Then** normaler Task-Input Modus
- [ ] **Given** Pattern erkannt, **When** Enter, **Then** Haptic Feedback + Timer startet
- [ ] **Given** Fehler im Parsing, **When** Edge Case, **Then** Fallback zu normalem Task

## Technische Details

### Betroffene Dateien
```
src/
├── components/timer/
│   └── UnifiedTaskInput.tsx  # Smart Parsing Integration
├── lib/
│   └── smart-input-parser.ts # NEU: Parsing Logik
└── hooks/
    └── useSmartInput.ts      # NEU: Hook für Parsing State
```

### Parser Logik
```typescript
// smart-input-parser.ts

interface ParsedInput {
  taskName: string | null;
  duration: number | null;  // in minutes
  preset: PresetId | null;
  raw: string;
}

const PATTERNS = [
  // "Meeting 30" oder "Meeting 30m"
  /^(.+?)\s+(\d+)(m|min)?$/i,

  // "30 Meeting" (Zahl zuerst)
  /^(\d+)(m|min)?\s+(.+)$/i,

  // "1h Meeting" oder "Meeting 1h"
  /^(.+?)\s+(\d+)(h|hr|hour)$/i,
  /^(\d+)(h|hr|hour)\s+(.+)$/i,

  // Nur Zahl: "30"
  /^(\d+)(m|min|h|hr)?$/,
];

const KEYWORDS: Record<string, { preset: PresetId } | { duration: number }> = {
  'pomodoro': { preset: 'classic' },
  'pomo': { preset: 'classic' },
  'deep': { preset: 'deepWork' },
  'deepwork': { preset: 'deepWork' },
  'ultradian': { preset: 'ultradian' },
};

export function parseSmartInput(input: string): ParsedInput {
  const trimmed = input.trim();

  // 1. Check keywords
  const keyword = KEYWORDS[trimmed.toLowerCase()];
  if (keyword) {
    return 'preset' in keyword
      ? { taskName: trimmed, duration: null, preset: keyword.preset, raw: input }
      : { taskName: null, duration: keyword.duration, preset: null, raw: input };
  }

  // 2. Try patterns
  for (const pattern of PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      // Extract and return...
    }
  }

  // 3. Fallback: just a task name
  return { taskName: trimmed, duration: null, preset: null, raw: input };
}
```

### Integration in UnifiedTaskInput
```typescript
function UnifiedTaskInput() {
  const [input, setInput] = useState('');
  const parsed = useMemo(() => parseSmartInput(input), [input]);

  const handleSubmit = () => {
    if (parsed.duration) {
      // Start timer with custom duration
      onStartWithDuration(parsed.taskName, parsed.duration);
    } else if (parsed.preset) {
      // Apply preset and start
      applyPreset(parsed.preset);
      onStart(parsed.taskName);
    } else {
      // Normal task, use current preset
      onStart(parsed.taskName);
    }
  };

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      {parsed.duration && (
        <span className="text-tertiary">
          {parsed.taskName} · {parsed.duration} min
        </span>
      )}
    </div>
  );
}
```

## UI/UX

### Input Preview
```
┌────────────────────────────────────┐
│ Meeting 30                         │
│ ─────────────────────────────────  │
│ Meeting · 30 min         [Enter ↵] │
└────────────────────────────────────┘
```

### Parsing Feedback (während Tippen)
```
"Meet"       →  (no preview, normal input)
"Meeting 3"  →  Meeting · 3 min
"Meeting 30" →  Meeting · 30 min
"deep"       →  Deep Work · 50 min (Preset)
"45"         →  45 min (no task name)
```

### Keyboard Flow
```
1. T (focus input)
2. "Standup 15" (tippen)
3. Enter (startet 15min Timer mit Task "Standup")
```

**Total: 3 Interaktionen vom Idle zum Flow.**

## Testing

### Manuell zu testen
- [ ] "Meeting 30" → Task "Meeting", 30 min
- [ ] "Code Review 45m" → Task "Code Review", 45 min
- [ ] "Focus 1h" → Task "Focus", 60 min
- [ ] "25" → Anonym, 25 min
- [ ] "pomodoro" → Preset Classic, 25 min
- [ ] "deepwork" → Preset Deep Work, 50 min
- [ ] "Einfach nur Text" → Normaler Task, aktuelle Preset-Zeit
- [ ] "30 Standup" → Task "Standup", 30 min (Zahl zuerst)

### Edge Cases
- [ ] "Meeting30" (keine Space) → Task "Meeting30", keine Zeit erkannt
- [ ] "Meeting 999" → 999 min akzeptieren? (Cap bei 180?)
- [ ] "Meeting -30" → Ignorieren, normaler Task
- [ ] "" (leer) → Kein Task, Timer mit aktuellem Preset

## Definition of Done

- [ ] Parser implementiert
- [ ] Input-Preview funktioniert
- [ ] Timer startet mit custom Duration
- [ ] Preset-Keywords erkannt
- [ ] Beide Themes getestet
- [ ] Keyboard Flow getestet (T → Input → Enter)

## Notizen

**Particle-Differenzierung:** Kein anderer Pomodoro-Timer hat Keyboard-First + Smart Input. Das ist unser USP.

**Future Enhancements:**
- Project in Input: "Meeting 30 @project"
- Tags: "Meeting 30 #work"
- Recurring: "Standup 15 daily"

**Duration Cap:** Maximum 180 Minuten (3h) - mehr ist unrealistisch für eine fokussierte Session.

---

## Arbeitsverlauf

### Gestartet:
### Erledigt:
