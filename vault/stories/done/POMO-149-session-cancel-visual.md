---
type: story
status: done
priority: p2
effort: 2
feature: "[[features/timer-core]]"
created: 2026-01-25
updated: 2026-01-26
done_date: 2026-01-26
tags: [timer, cancel, particle-philosophy, time-tracking]
---

# POMO-149: Session Cancel Behavior

## User Story

> As a **user who cancels a session**
> I want **my actual focus time to be saved without judgment**
> so that **my work counts – even when life interrupts**.

## Philosophy

**Forest kills your tree. Particle doesn't.**

A cancelled session is not a failure. It's reality. Sometimes a client calls. Sometimes a meeting runs over. Sometimes life happens.

The time was real. The work was real. So we save it.

**Particle is honest, not punishing.**

## Design Principles

1. **Honor the work** – 10 minutes of focus is 10 minutes of focus
2. **No visual punishment** – No gray dots, no "dead" particles
3. **Honest tracking** – Save actual duration, not planned duration
4. **No drama** – Timer stops, particle is saved, life continues

## The Rule

```
Cancelled after < 60 seconds  →  Nothing saved (accidental)
Cancelled after ≥ 60 seconds  →  Particle saved with actual duration
```

## Acceptance Criteria

### Cancel Action

- [ ] **Given** session running, **When** user presses `Escape`, **Then** timer stops immediately
- [ ] **Given** elapsed time < 60s, **When** cancelled, **Then** nothing is saved
- [ ] **Given** elapsed time ≥ 60s, **When** cancelled, **Then** particle is saved with actual duration
- [ ] **Given** particle saved, **When** cancel complete, **Then** show "Session ended · X min saved"

### Saved Particle

- [ ] **Given** 10:34 worked of 25:00 planned, **When** saved, **Then** duration = 10:34
- [ ] **Given** cancelled particle, **When** in Timeline, **Then** looks identical to completed particles
- [ ] **Given** cancelled particle, **When** Particle counter, **Then** counts as +1 particle
- [ ] **Given** cancelled particle, **When** Focus Time stats, **Then** adds actual duration

### Visual Feedback

- [ ] **Given** particle saved, **When** feedback shown, **Then** "Session ended · 10 min saved"
- [ ] **Given** nothing saved (<60s), **When** feedback shown, **Then** "Session ended"
- [ ] **Given** feedback shown, **When** 2 seconds pass, **Then** text fades out

### What We DON'T Do

- [ ] No confirmation dialog before cancel
- [ ] No visual difference for "cancelled" vs "completed" particles
- [ ] No separate "cancelled" status in data model
- [ ] No guilt, no judgment, no punishment

## Technical Details

### Implementation

```typescript
// In Timer.tsx
const handleCancel = useCallback(() => {
  const elapsedSeconds = totalSeconds - timeRemaining;

  // Stop timer
  dispatch({ type: 'STOP' });

  if (elapsedSeconds >= 60 && mode === 'work') {
    // Save particle with actual duration
    const session: CompletedSession = {
      id: crypto.randomUUID(),
      startTime: sessionStartTime,
      endTime: new Date().toISOString(),
      duration: elapsedSeconds,
      plannedDuration: totalSeconds,
      mode: 'work',
      projectId: currentProjectId,
      task: currentTask,
    };

    saveSession(session);
    incrementParticleCount();

    const minutes = Math.round(elapsedSeconds / 60);
    setStatusMessage(`Session ended · ${minutes} min saved`);
  } else {
    setStatusMessage('Session ended');
  }

  // Clear after 2 seconds
  setTimeout(() => setStatusMessage(null), 2000);

  // Reset to ready state
  dispatch({ type: 'RESET' });
}, [timeRemaining, totalSeconds, mode, ...]);
```

### Data Model

No changes needed. We already store `duration` (actual) and `plannedDuration` (intended).

```typescript
interface CompletedSession {
  duration: number;        // Actual seconds worked (e.g., 634 = 10:34)
  plannedDuration: number; // Planned seconds (e.g., 1500 = 25:00)
  // ... rest unchanged
}
```

### Timeline Display

```
Timeline (Today)
───────────────────────────────────────
●  09:15  Design Review       25:00
●  10:00  Code Review         52:00
●  11:30  Client Call Prep    10:34  ← Cancelled, but still a particle
●  14:00  Deep Work           90:00
```

No visual difference. A particle is a particle.

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Cancel at 0:45 | Nothing saved, "Session ended" |
| Cancel at 1:30 | Particle saved, "Session ended · 2 min saved" |
| Cancel at 24:59 | Particle saved, "Session ended · 25 min saved" |
| Cancel during break | Nothing saved (breaks don't create particles) |

## Supersedes

This story incorporates the intent of **POMO-155 (Partial Session Logging)**. That story can be closed or archived.

## Definition of Done

- [ ] Escape cancels session immediately (no dialog)
- [ ] Sessions ≥60s are saved as particles with actual duration
- [ ] Sessions <60s are not saved
- [ ] Feedback shows "X min saved" when applicable
- [ ] No visual distinction in Timeline
- [ ] Particle counter increments for saved cancellations
- [ ] Focus Time stats include actual duration
- [ ] **The test:** Does a freelancer feel their 10 minutes counted?
