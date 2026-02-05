---
type: story
status: done
priority: p1
effort: 2
feature: intelligent-particles
created: 2026-02-05
updated: 2026-02-05
done_date: 2026-02-05
tags: [ai, coach, nudge, personalization, 10x]
depends_on: []
blocks: []
---

# POMO-380: Session Start Nudge — "The Whisper Before You Begin"

## User Story

> As a **Particle user about to start a focus session**,
> I want **to see a personalized one-liner based on my patterns**,
> so that **I feel seen and understood by the app**.

## Context

The AI Coach currently lives in its own modal (`G C`). Users must actively seek it out. This story brings AI presence to the most important moment: **the moment before you begin**.

A single sentence below the Start button. No new UI chrome. Just a whisper.

### The 10x Philosophy

> "The best AI is the one you don't notice. It manifests not as a feature, but as a feeling: this app understands me."

### Abgrenzung zu POMO-384 (Silent Intelligence)

POMO-384 hat "Intelligent Empty States" in der Timeline — das sind kontextuelle Nachrichten wenn **kein Particle heute existiert**. POMO-380 ist der Nudge **direkt vor dem Starten** im Timer. Unterschiedliche Orte, unterschiedliche Momente:

| | POMO-380 (Start Nudge) | POMO-384-C (Empty State) |
|---|---|---|
| **Wo** | Timer, unter Start-Button | Timeline, leerer Tag |
| **Wann** | Timer ist idle, User will starten | User schaut auf Timeline |
| **Ton** | Motivierend, kontextuell | Informativ, einladend |
| **Daten** | Projekt, Intention, Patterns | Tages-/Wochen-Muster |

## Acceptance Criteria

### Nudge Display

- [ ] **Given** the timer is idle (not running, not paused, not in overflow), **When** the main view loads, **Then** a single-line nudge appears below the Start button
- [ ] **Given** a nudge is displayed, **When** the user starts a session, **Then** the nudge fades out gracefully (200ms)
- [ ] **Given** the timer is running, paused, or in overflow, **When** viewing the timer, **Then** no nudge is shown
- [ ] **Given** a nudge is displayed AND IntentionDisplay is visible, **When** viewing the timer, **Then** nudge appears below IntentionDisplay (not between timer and intention)

### Nudge Content Types

The nudge rotates through contextual insights (local heuristics, no API call):

| Type | Example | Trigger | Priority |
|------|---------|---------|----------|
| **Intention Alignment** | "Aligned with: Brand Redesign finalize" | Intention set for today | 1 (highest) |
| **Time Pattern** | "Tuesday 9am — your peak focus window." | Current time matches peak from `detectTimeOfDayPattern()` | 2 |
| **Project Insight** | "Design System — you're strongest here." | Project selected + `detectProjectFocusPattern()` | 3 |
| **Progress Context** | "Your 4th particle today. Your average is 5." | Today's count vs. lifetime avg per active day | 4 |
| **Task Continuity** | "API Refactor — last session was 47 minutes." | Same task entered as most recent session | 5 |
| **Gentle Reminder** | "Documentation — untouched for 12 days." | Active project with last session > 10 days ago | 6 |

### Styling

- [ ] Text: `text-sm text-tertiary light:text-tertiary-dark` (subtle, not dominant)
- [ ] Position: Below Start button + IntentionDisplay, above PresetSelector
- [ ] Animation: Fade in with 300ms delay after idle state, fade out on session start
- [ ] Max width: ~320px, centered, `text-center`
- [ ] Single line, truncate with ellipsis if needed (`truncate` class)
- [ ] No interaction — purely informational (no click handler, no hover effect)

### Edge Cases

- [ ] **Given** no patterns exist (< 10 total work sessions), **Then** show nothing (no nudge)
- [ ] **Given** no project selected and no intention set, **Then** show generic time-based or progress nudge
- [ ] **Given** Multi-Task Input is expanded, **Then** hide nudge (zu viel Visual Noise)
- [ ] **Given** user changes project or task, **Then** nudge refreshes after 500ms debounce
- [ ] **Given** RhythmOnboarding or other overlay is visible, **Then** nudge is hidden

## Technical Details

### Affected Files

```
src/
├── components/
│   └── timer/
│       ├── Timer.tsx              # Integrate StartNudge below IntentionDisplay
│       └── StartNudge.tsx         # NEW: Nudge display component
├── lib/
│   └── coach/
│       ├── nudge-generator.ts     # NEW: Local heuristic logic
│       └── patterns.ts            # EXISTING: detectAllPatterns() — wiederverwendbar
└── hooks/
    └── useStartNudge.ts           # NEW: Hook combining context + generator
```

### Implementation Notes

**No API calls** — this is purely local heuristics:

1. Read from `useSessionStore()` for session history (existiert in `src/lib/db/`)
2. Read from `useProjects()` for project data (existiert in `src/hooks/`)
3. Read from `useIntention()` for today's intention (existiert in `src/hooks/useIntention.ts`)
4. Read from `detectAllPatterns()` (existiert in `src/lib/coach/patterns.ts`)
5. Combine with current time/date for contextual relevance

```typescript
// src/lib/coach/nudge-generator.ts
import { DetectedPattern } from './types';
import { DBSession } from '../db/types';

interface NudgeContext {
  selectedProjectId?: string;
  selectedProjectName?: string;
  currentTask?: string;
  todayWorkParticles: number;          // nur Work-Sessions zählen
  averagePerActiveDay: number;         // aus getLifetimeStats()
  currentHour: number;
  currentDayOfWeek: number;            // 0=Sunday...6=Saturday
  patterns: DetectedPattern[];         // von detectAllPatterns()
  intentionText?: string;              // von useIntention().todayIntention?.text
  recentSessions: DBSession[];         // letzte 30 Sessions
  activeProjects: { id: string; name: string; lastSessionDate?: string }[];
}

function generateNudge(context: NudgeContext): string | null {
  // Priority order (highest first):
  // 1. Intention alignment (if set today)
  // 2. Time pattern match (if current hour within detected peak ±1h)
  // 3. Project insight (if project selected + project_focus pattern)
  // 4. Progress context (todayWorkParticles vs. averagePerActiveDay)
  // 5. Task continuity (if currentTask matches most recent session's task)
  // 6. Gentle reminder (active project with lastSession > 10 days ago)
  // Return null if < 10 total sessions or no relevant context
}
```

### Nudge Templates

```typescript
const NUDGE_TEMPLATES = {
  intention: (text: string) =>
    `Aligned with: ${truncate(text, 30)}`,
  timePeak: (dayTime: string) =>
    `${dayTime} — your peak focus window.`,
  projectStrength: (project: string) =>
    `${project} — you're strongest here.`,
  progressContext: (count: number, avg: number) =>
    `Particle #${count} today. Your average is ${avg}.`,
  taskContinuity: (task: string, duration: string) =>
    `${truncate(task, 20)} — last session was ${duration}.`,
  gentleReminder: (project: string, days: number) =>
    `${project} — untouched for ${days} days.`,
};
```

### Hook Design

```typescript
// src/hooks/useStartNudge.ts
export function useStartNudge(options: {
  isTimerIdle: boolean;
  selectedProjectId?: string;
  currentTask?: string;
}): {
  nudge: string | null;
  isLoading: boolean;
} {
  // 1. Skip if timer not idle
  // 2. Load sessions, projects, intention, patterns
  // 3. Build NudgeContext
  // 4. Call generateNudge()
  // 5. Debounce recalculation on project/task change (500ms)
  // 6. Memoize result to prevent flicker
}
```

## UI/UX

### Layout-Integration

```
           ┌─────────────────────────┐
           │         25:00           │  ← TimerDisplay
           │                         │
           │    [ Start Focus  ⎵ ]   │  ← TimerControls (Start button)
           │                         │
           │  "Brand Redesign        │  ← IntentionDisplay (wenn gesetzt)
           │   finalize"             │
           │                         │
           │  Design System — you're │  ← StartNudge (NEU, unter Intention)
           │  strongest here.        │
           │                         │
           │  [25m] [52m] [90m] [·]  │  ← PresetSelector
           └─────────────────────────┘
```

**Wenn keine Intention gesetzt:**
```
           │    [ Start Focus  ⎵ ]   │
           │                         │
           │  Tuesday 9am — your     │  ← StartNudge (direkt unter Button)
           │  peak focus window.     │
```

### Behavior

- Nudge appears 300ms after timer enters idle state (gentle entrance)
- On Start button click: nudge fades out (200ms) as timer begins
- Nudge refreshes when project/task changes (500ms debounce)
- No interaction — purely informational
- Respects `prefers-reduced-motion` (no fade, instant show/hide)

## Testing

### Manual Testing

- [ ] With 0 sessions: No nudge shown
- [ ] With 5 sessions: No nudge shown (threshold is 10)
- [ ] With 10+ work sessions: Nudge appears based on patterns
- [ ] With project selected: Project-specific nudge prioritized
- [ ] With intention set: Intention nudge shown (highest priority)
- [ ] At detected peak time: Time pattern nudge shown
- [ ] With Multi-Task Input expanded: Nudge hidden
- [ ] Change project: Nudge updates after 500ms
- [ ] Start session: Nudge fades out
- [ ] Light mode + Dark mode: Proper contrast
- [ ] Mobile viewport: Nudge doesn't break layout
- [ ] With IntentionDisplay visible: Nudge below it, not between timer and intention

### Automated Tests

- [ ] Unit tests for `nudge-generator.ts` with various contexts
- [ ] Test priority ordering (intention > time > project > progress > task > reminder)
- [ ] Test null return when < 10 sessions
- [ ] Test null return when no relevant context
- [ ] Test template truncation for long project/task names
- [ ] Test debounce behavior in `useStartNudge`

## Definition of Done

- [ ] StartNudge component renders below Start button (and below IntentionDisplay if visible)
- [ ] Nudge generator produces contextual, personalized messages
- [ ] No API calls — purely local data from IndexedDB
- [ ] Uses existing `detectAllPatterns()` from `src/lib/coach/patterns.ts`
- [ ] Graceful handling of edge cases (no data, no project, overlays visible)
- [ ] Hidden during Multi-Task Input expanded state
- [ ] Typecheck + Lint pass
- [ ] Tested in light/dark mode
- [ ] Tested on mobile viewport
- [ ] Respects `prefers-reduced-motion`

## Notes

**Why P1 priority?**

This is the lowest-effort, highest-impact change in the 10x AI initiative. A single line of text that makes the entire app feel intelligent. No new UI chrome, no modals, no complexity — just a whisper that says "I see you."

**Abhangigkeiten:**
- Nutzt bestehende Infrastruktur: `patterns.ts`, `useSessionStore()`, `useIntention()`, `useProjects()`
- Keine neuen DB-Felder noetig
- Kein API-Endpoint noetig
- Kann unabhaengig von POMO-381 bis 384 entwickelt werden

**Future enhancements:**
- User preference to disable nudges (in Coach Settings)
- More nudge types (milestone approaching, streak context)
- Nudge rotation (don't show same type twice in a row)
