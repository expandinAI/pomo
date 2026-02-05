---
type: story
status: backlog
priority: p1
effort: 2
feature: intelligent-particles
created: 2026-02-05
updated: 2026-02-05
done_date: null
tags: [ai, coach, nudge, personalization, 10x]
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

## Acceptance Criteria

### Nudge Display

- [ ] **Given** the timer is idle, **When** the main view loads, **Then** a single-line nudge appears below the Start button
- [ ] **Given** a nudge is displayed, **When** the user starts a session, **Then** the nudge fades out gracefully
- [ ] **Given** the timer is running or paused, **When** viewing the timer, **Then** no nudge is shown

### Nudge Content Types

The nudge should rotate through contextual insights (local heuristics, no API call):

| Type | Example | Trigger |
|------|---------|---------|
| **Project Insight** | "Design System — you're strongest here." | Project selected + pattern data |
| **Time Pattern** | "Tuesday 9am — your peak productivity window." | Current time matches detected peak |
| **Progress Context** | "Your 4th particle today. Your average is 5." | Today's count vs. lifetime avg |
| **Task Continuity** | "API Refactor — last session was 47 minutes." | Same task as recent session |
| **Gentle Reminder** | "Documentation — untouched for 12 days." | Project with long gap |
| **Intention Alignment** | "Aligned with: Brand Redesign finalize" | Intention set for today |

### Styling

- [ ] Text: `text-sm text-tertiary` (subtle, not dominant)
- [ ] Position: Below Start button, above any other controls
- [ ] Animation: Fade in on load (300ms delay), fade out on session start
- [ ] Max width: ~300px, centered
- [ ] Single line, truncate with ellipsis if needed

### Edge Cases

- [ ] **Given** no patterns exist (< 10 sessions), **Then** show nothing (no nudge)
- [ ] **Given** no project selected and no intention, **Then** show generic time-based or progress nudge
- [ ] **Given** user preference to disable nudges, **Then** respect the setting (future: Coach Settings)

## Technical Details

### Affected Files

```
src/
├── components/
│   └── timer/
│       ├── Timer.tsx              # Add StartNudge integration
│       └── StartNudge.tsx         # NEW: Nudge component
├── lib/
│   └── coach/
│       └── nudge-generator.ts     # NEW: Local heuristic logic
└── hooks/
    └── useStartNudge.ts           # NEW: Hook for nudge state
```

### Implementation Notes

**No API calls** — this is purely local heuristics:

1. Read from `useSessionStore()` for session history
2. Read from `useProjects()` for project data
3. Read from `useIntention()` for today's intention
4. Read from pattern detection (`src/lib/coach/patterns.ts`)
5. Combine with current time/date for contextual relevance

```typescript
// src/lib/coach/nudge-generator.ts
interface NudgeContext {
  selectedProject?: Project;
  currentTask?: string;
  todayParticles: number;
  averagePerDay: number;
  currentHour: number;
  currentDayOfWeek: number;
  patterns: DetectedPatterns;
  intention?: string;
  recentSessions: CompletedSession[];
}

function generateNudge(context: NudgeContext): string | null {
  // Priority order:
  // 1. Intention alignment (if set)
  // 2. Time pattern match (if in peak window)
  // 3. Project insight (if project selected)
  // 4. Progress context (compare to average)
  // 5. Task continuity (if same task as recent)
  // 6. Gentle reminder (long-untouched project)
  // Return null if insufficient data
}
```

### Nudge Templates (English)

```typescript
const NUDGE_TEMPLATES = {
  intention: "Aligned with: {intention}",
  timePeak: "{dayTime} — your peak productivity window.",
  projectStrength: "{project} — you're strongest here.",
  progressContext: "Particle #{count} today. Your average is {avg}.",
  taskContinuity: "{task} — last session was {duration}.",
  gentleReminder: "{project} — untouched for {days} days.",
  genericMorning: "Morning focus. Your best work happens now.",
  genericEvening: "Evening session. Wrap up strong.",
};
```

## UI/UX

```
           ┌─────────────────────────┐
           │         25:00           │
           │                         │
           │    [ Start Focus ]      │
           │                         │
           │  "Design System — you're│
           │   strongest here."      │  ← Nudge (text-tertiary, subtle)
           │                         │
           └─────────────────────────┘
```

**Behavior:**
- Nudge appears 300ms after page load (gentle entrance)
- On Start button click: nudge fades out as timer begins
- Nudge refreshes when project/task changes (debounced)
- No interaction — purely informational

## Testing

### Manual Testing

- [ ] With 0 sessions: No nudge shown
- [ ] With 10+ sessions: Nudge appears based on patterns
- [ ] With project selected: Project-specific nudge prioritized
- [ ] With intention set: Intention nudge shown
- [ ] At detected peak time: Time pattern nudge shown
- [ ] Light mode + Dark mode: Proper contrast
- [ ] Mobile viewport: Nudge doesn't break layout

### Automated Tests

- [ ] Unit tests for `nudge-generator.ts` with various contexts
- [ ] Test priority ordering of nudge types
- [ ] Test null return when insufficient data

## Definition of Done

- [ ] StartNudge component renders below Start button
- [ ] Nudge generator produces contextual, personalized messages
- [ ] No API calls — purely local data
- [ ] Graceful handling of edge cases (no data, no project)
- [ ] Typecheck + Lint pass
- [ ] Tested in light/dark mode
- [ ] Tested on mobile viewport

## Notes

**Why P1 priority?**

This is the lowest-effort, highest-impact change in the 10x AI initiative. A single line of text that makes the entire app feel intelligent. No new UI chrome, no modals, no complexity — just a whisper that says "I see you."

**Future enhancements:**
- User preference to disable nudges
- More nudge types (streak, milestone approaching, etc.)
- A/B testing different nudge styles
