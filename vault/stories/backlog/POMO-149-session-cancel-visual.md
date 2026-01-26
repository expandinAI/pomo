---
type: story
status: backlog
priority: p2
effort: 1
feature: "[[features/timer-core]]"
created: 2026-01-25
updated: 2026-01-26
done_date: null
tags: [timer, cancel, particle-philosophy]
---

# POMO-149: Session Cancel Behavior

## User Story

> As a **user who cancels a session**
> I want **the timer to stop without drama or judgment**
> so that **I can move on without feeling guilty**.

## Philosophy

**Forest kills your tree. Particle doesn't.**

A particle that isn't completed simply doesn't exist. No ghosts. No gray dots. No visual reminder of "what could have been."

Canceling is not a failure. It's a decision. Sometimes the timing isn't right. Sometimes life interrupts. That's okay.

**Particle is a mirror, not a judge.**

## Design Principles

1. **No confirmation dialog** – Asking "are you sure?" implies doubt and guilt
2. **No visual consequence** – No "dead particles", no gray dots in timeline
3. **No drama** – Timer stops, life continues
4. **Minimal feedback** – Brief acknowledgment, then back to ready state

## Acceptance Criteria

### Cancel Action

- [ ] **Given** session running, **When** user presses `Escape`, **Then** timer stops immediately
- [ ] **Given** timer stopped, **When** cancel complete, **Then** show brief "Session ended" text (2s)
- [ ] **Given** session < 60 seconds, **When** cancelled, **Then** nothing is saved (already implemented)
- [ ] **Given** session ≥ 60 seconds, **When** cancelled, **Then** nothing is saved (no partial logging)

### Visual Feedback

- [ ] **Given** cancel complete, **When** feedback shown, **Then** text appears where celebration would appear
- [ ] **Given** feedback shown, **When** 2 seconds pass, **Then** text fades out
- [ ] **Given** cancel complete, **When** timer resets, **Then** shows ready state (full duration)

### What We DON'T Do

- [ ] No confirmation dialog before cancel
- [ ] No "cancelled" status in data model
- [ ] No gray/dimmed particles in timeline
- [ ] No undo mechanism (keep it simple)
- [ ] No statistics tracking of cancellations

## Technical Details

### Implementation

```typescript
// In Timer.tsx, handleCancel (currently handleSkip for Escape)
const handleCancel = useCallback(() => {
  // Stop timer immediately
  dispatch({ type: 'STOP' });

  // Show brief feedback
  setStatusMessage('Session ended');

  // Clear after 2 seconds
  setTimeout(() => setStatusMessage(null), 2000);

  // Reset to ready state
  dispatch({ type: 'RESET' });
}, []);
```

### Keyboard

- `Escape` → Cancel session (no confirmation)
- No `Cmd+Z` undo needed

## Out of Scope

- Partial session logging (see POMO-155 if needed later)
- Cancel reason tracking
- "Cancelled sessions" view
- Any form of cancel statistics

## Definition of Done

- [ ] Escape cancels session immediately (no dialog)
- [ ] Brief "Session ended" feedback appears
- [ ] Timer resets to ready state
- [ ] No data is saved for cancelled sessions
- [ ] **The test:** Does it feel neutral? No guilt, no judgment?
