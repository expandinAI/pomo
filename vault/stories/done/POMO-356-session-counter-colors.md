---
type: story
status: done
priority: p1
effort: 2
feature: daily-intentions
created: 2026-02-04
updated: 2026-02-04
done_date: 2026-02-04
tags: [intentions, session-counter, visual-language, particles]
---

# POMO-356: Session Counter with Alignment Colors

## User Story

> As a **Particle user looking at my daily progress**,
> I want **to see which particles were aligned vs reactive in the counter**,
> so that **I can gauge my intentionality at a glance**.

## Context

Link: [[features/daily-intentions]]

**Phase 2: Visual Language** — The session counter becomes a visual summary of intentionality.

### Visual Example

```
●●●●●      (all aligned - white)
●●●●●      (3 aligned white, 2 reactive gray)
   ↑↑
  gray
```

## Acceptance Criteria

### Visual Rendering

- [x] Aligned particles: White (#FFFFFF)
- [x] Reactive particles: Gray (#525252)
- [x] Particles without alignment: White (default)
- [x] Order: Chronological (earliest first)

### Data Source

- [x] Read `intentionAlignment` from each session in `todaySessions`
- [x] Map alignment to color
- [x] Pass colors to SessionCounter dots

### Counter Behavior

- [x] Show filled dots for completed particles (with alignment color)
- [x] Show empty dots for remaining goal (if daily goal set)
- [x] Glow effect respects particle color
- [x] Hover info shows alignment status

### Hover Tooltip Enhancement

- [x] Show alignment status: "Aligned" or "Reactive"
- [x] Show alongside existing info (time, task, project)

## Technical Details

### Files to Modify

```
src/components/timer/SessionCounter.tsx   # Add color support
src/components/timer/Timer.tsx            # Pass alignment data
```

### SessionCounter Props Extension

```typescript
interface SessionCounterProps {
  // ... existing props ...
  todaySessions: UnifiedSession[];  // Already passed
}

// Inside SessionCounter:
function getParticleColor(session: UnifiedSession): string {
  if (session.intentionAlignment === 'reactive') {
    return 'bg-tertiary'; // gray
  }
  return 'bg-white'; // aligned or none
}
```

### Dot Rendering

```typescript
// In SessionCounter.tsx

{todaySessions.map((session, index) => (
  <motion.div
    key={session.id}
    className={cn(
      "w-2 h-2 rounded-full",
      getParticleColor(session)
    )}
    // ... existing animation props
  />
))}
```

### Hover Info Update

```typescript
// In particle hover handler
const alignmentText = session.intentionAlignment === 'reactive'
  ? ' · Reactive'
  : session.intentionAlignment === 'aligned'
  ? ' · Aligned'
  : '';

setParticleHoverInfo(`${timeInfo}${alignmentText}`);
```

## Testing

- [x] Aligned particles render white
- [x] Reactive particles render gray
- [x] Mixed sessions show correct colors
- [x] Hover shows alignment status
- [x] Colors persist after page refresh
- [x] Light mode: colors still visible
- [x] Animation works with both colors

## Definition of Done

- [x] SessionCounter shows alignment colors
- [x] Hover tooltip includes alignment status
- [x] Visual matches design spec
- [x] No performance regression
- [x] Works with existing goal/glow features

## Dependencies

- POMO-354 (Particle colors) — Color tokens
- POMO-355 (Alignment toggle) — For setting alignment

## Design Notes

**Why chronological order?**
- Matches timeline view
- User can see progression of their day
- Reactive particles in middle = "interruption" visible

**Glow effect:**
- Glow should match particle color
- White particle = white glow
- Gray particle = gray/dim glow
