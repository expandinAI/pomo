---
type: story
status: backlog
priority: p1
effort: 2
feature: daily-intentions
created: 2026-02-04
updated: 2026-02-04
done_date: null
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

- [ ] Aligned particles: White (#FFFFFF)
- [ ] Reactive particles: Gray (#525252)
- [ ] Particles without alignment: White (default)
- [ ] Order: Chronological (earliest first)

### Data Source

- [ ] Read `intentionAlignment` from each session in `todaySessions`
- [ ] Map alignment to color
- [ ] Pass colors to SessionCounter dots

### Counter Behavior

- [ ] Show filled dots for completed particles (with alignment color)
- [ ] Show empty dots for remaining goal (if daily goal set)
- [ ] Glow effect respects particle color
- [ ] Hover info shows alignment status

### Hover Tooltip Enhancement

- [ ] Show alignment status: "Aligned" or "Reactive"
- [ ] Show alongside existing info (time, task, project)

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

- [ ] Aligned particles render white
- [ ] Reactive particles render gray
- [ ] Mixed sessions show correct colors
- [ ] Hover shows alignment status
- [ ] Colors persist after page refresh
- [ ] Light mode: colors still visible
- [ ] Animation works with both colors

## Definition of Done

- [ ] SessionCounter shows alignment colors
- [ ] Hover tooltip includes alignment status
- [ ] Visual matches design spec
- [ ] No performance regression
- [ ] Works with existing goal/glow features

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
