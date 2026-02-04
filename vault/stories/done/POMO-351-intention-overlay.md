---
type: story
status: done
priority: p1
effort: 5
feature: daily-intentions
created: 2026-02-04
updated: 2026-02-04
done_date: 2026-02-04
tags: [intentions, ui, overlay, daily-goal, merge]
---

# POMO-351: IntentionOverlay (Unified Daily Planning)

## User Story

> As a **Particle user starting my day**,
> I want **to set my intention and particle goal in one place**,
> so that **I have a clear direction with a tangible target**.

## Context

Link: [[features/daily-intentions]]

**Key Change:** This story merges `DailyGoalOverlay` with the new Intention concept. One unified overlay for daily planning: What (intention text) + How Much (particle count).

## Acceptance Criteria

### Trigger

- [ ] Opens via `G I` shortcut
- [ ] Opens when clicking on session dots in timer
- [ ] Opens when clicking on intention text below timer
- [ ] Replaces `G O` (Daily Goal) — `G O` should redirect to `G I`

### Layout

```
┌─────────────────────────────────────────┐
│                                         │
│     What's your focus for today?        │
│                                         │
│     ┌─────────────────────────────┐     │
│     │ Ship the login feature      │     │
│     └─────────────────────────────┘     │
│                                         │
│     ○ ○ ○ ○ ○ ○ ○ ○ ○                   │
│       1 2 3 4 5 6 7 8 9                 │
│                                         │
│           [4 particles]                 │
│                                         │
│         ┌──────────────┐                │
│         │ Set Intention│ ↵              │
│         └──────────────┘                │
│                                         │
│           No intention                  │
│                                         │
└─────────────────────────────────────────┘
```

### Input Fields

- [ ] Text input for intention (top)
  - Placeholder: "What matters today?"
  - Auto-focus on open
  - Max length: ~100 chars
- [ ] Particle count selector (below text)
  - Range: 1-9
  - Default: 4 (or previous value)
  - Visual dots showing selected count

### Keyboard Navigation

- [ ] `1-9` — Set particle count directly
- [ ] `0` — Clear intention (No intention)
- [ ] `↑/↓` or `←/→` — Adjust particle count
- [ ] `Enter` — Save intention + goal
- [ ] `Escape` — Cancel (close without saving)
- [ ] `Tab` — Move between text input and count selector

### Buttons

- [ ] "Set Intention" — Primary action (with `↵` hint)
- [ ] "No intention" — Secondary, clears both intention and goal

### Behavior

- [ ] If intention exists: Pre-fill text and count
- [ ] If no intention: Empty text, default count (4)
- [ ] Saving creates/updates intention via `useIntention().setIntention()`
- [ ] Particle count stored with intention (extend data model if needed)
- [ ] "No intention" clears both

### Animation

- [ ] Fade in/out backdrop
- [ ] Scale + slide for modal
- [ ] Dot selection animation (like current DailyGoalOverlay)
- [ ] Respect `prefers-reduced-motion`

## Technical Details

### Files to Modify

```
src/components/timer/
├── DailyGoalOverlay.tsx  → Rename to IntentionOverlay.tsx
└── Timer.tsx             # Update import + props

src/hooks/
└── useIntention.ts       # May need to handle particle count
```

### Component Props

```typescript
interface IntentionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentIntention: {
    text: string;
    particleCount: number;
  } | null;
  todayCount: number;  // Particles completed today
  onSave: (text: string, particleCount: number) => void;
  onClear: () => void;
}
```

### Data Model Extension

The intention needs to store particle count. Options:

1. **Store in DailyIntention** — Add `particleGoal: number` field
2. **Keep separate** — Intention in IndexedDB, goal in localStorage (current)

Recommendation: Option 1 — unified storage.

```typescript
interface DailyIntention {
  // ... existing fields ...
  particleGoal?: number;  // 1-9, optional for backwards compat
}
```

### Migration from DailyGoalOverlay

- Rename component file
- Extend UI with text input
- Keep existing particle selector logic
- Update all imports
- `G O` event → dispatch `G I` event (backwards compat)

## Styling

- Background: `bg-surface` with border
- Text input: Minimal, center-aligned, `text-lg`
- Particle dots: Reuse existing DailyGoalOverlay styles
- Consistent with other Particle overlays

## Testing

- [ ] Opens via `G I`
- [ ] Opens when clicking session dots
- [ ] Text input works and saves
- [ ] Particle count selection works
- [ ] Keyboard shortcuts (1-9, arrows, Enter, Escape)
- [ ] Pre-fills when intention exists
- [ ] "No intention" clears both
- [ ] Animations smooth
- [ ] Mobile responsive
- [ ] Reduced motion respected

## Definition of Done

- [ ] `DailyGoalOverlay` renamed to `IntentionOverlay`
- [ ] Text input added
- [ ] Both text + count saved together
- [ ] All keyboard shortcuts working
- [ ] `G O` redirects to `G I` (backwards compat)
- [ ] Integrated in Timer.tsx
- [ ] Mobile responsive

## Dependencies

- POMO-350 (Intention data model) ✓ Complete
- POMO-353 (Keyboard shortcuts) — Can be done in parallel

## Breaking Changes

- `G O` → `G I` (documented in CHANGELOG)
- `DailyGoalOverlay` → `IntentionOverlay`
