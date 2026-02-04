---
type: story
status: done
priority: p1
effort: 3
feature: daily-intentions
created: 2026-02-04
updated: 2026-02-04
done_date: 2026-02-04
tags: [intentions, timeline, visual-language, particles]
---

# POMO-357: Timeline with Alignment Styling

## User Story

> As a **Particle user reviewing my day in the timeline**,
> I want **to see aligned vs reactive particles with different colors**,
> so that **I can understand when I was on-intention throughout the day**.

## Context

Link: [[features/daily-intentions]]

**Phase 2: Visual Language** — The timeline becomes a visual story of intentionality over time.

### Visual Example

```
6am         12pm         6pm         12am
├────────────┼────────────┼────────────┤
    ●    ●       ●    ●        ●
   white white  gray white    white
```

The gray particle at noon shows an interruption — something reactive happened.

## Acceptance Criteria

### Visual Rendering

- [ ] Aligned particles: White dot
- [ ] Reactive particles: Gray dot (#525252)
- [ ] No-alignment particles: White dot (default)
- [ ] Consistent with SessionCounter colors

### Timeline Track

- [ ] Each particle dot shows alignment color
- [ ] Hover state maintains color
- [ ] Click opens ParticleDetailOverlay (existing)

### Tooltip Enhancement

- [ ] Show alignment status in tooltip
- [ ] Format: "10:30 AM · Meeting · Aligned" or "· Reactive"

### History List (if in Timeline)

- [ ] Row background could subtly differ
- [ ] Or: Small colored indicator dot in row
- [ ] Keep it subtle — not distracting

## Technical Details

### Files to Modify

```
src/components/timeline/TimelineTrack.tsx   # Dot colors
src/components/timeline/TimelineModal.tsx   # If list view exists
```

### TimelineTrack Dot Rendering

```typescript
// In TimelineTrack.tsx

function ParticleDot({ session }: { session: UnifiedSession }) {
  const isReactive = session.intentionAlignment === 'reactive';

  return (
    <div
      className={cn(
        "w-3 h-3 rounded-full cursor-pointer transition-transform hover:scale-125",
        isReactive ? "bg-tertiary" : "bg-white"
      )}
      style={{ left: `${calculatePosition(session.startTime)}%` }}
    />
  );
}
```

### Tooltip Update

```typescript
// In tooltip content
const alignmentLabel = session.intentionAlignment === 'reactive'
  ? ' · Reactive'
  : session.intentionAlignment === 'aligned'
  ? ' · Aligned'
  : '';

return `${formatTime(session.startTime)}${taskLabel}${alignmentLabel}`;
```

## Testing

- [ ] Aligned particles show white on timeline
- [ ] Reactive particles show gray on timeline
- [ ] Mixed day shows both colors correctly
- [ ] Tooltip shows alignment status
- [ ] Clicking opens correct particle detail
- [ ] Colors consistent between counter and timeline
- [ ] Light mode: colors visible against background

## Definition of Done

- [ ] Timeline dots use alignment colors
- [ ] Tooltip includes alignment info
- [ ] Visual consistency with SessionCounter
- [ ] No layout shift or performance issues
- [ ] Works with existing timeline features (zoom, scroll)

## Dependencies

- POMO-354 (Particle colors) — Color tokens
- POMO-355 (Alignment toggle) — For setting alignment
- POMO-356 (Session counter) — Visual consistency

## Design Notes

**Timeline as Story:**
The timeline tells the story of your day:
- Morning: Focused, intentional (white, white, white)
- Midday: Interruption (gray)
- Afternoon: Back on track (white, white)

This visual narrative is more powerful than numbers.

**Subtle not loud:**
Gray is chosen because it's visible but not alarming. A reactive particle isn't a failure — it's information.

**Future Enhancement:**
- Hover on gray particle: "This was reactive. Was it necessary?"
- Coach can reference: "3 of your 5 particles were aligned"
