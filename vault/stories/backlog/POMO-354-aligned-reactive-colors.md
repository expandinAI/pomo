---
type: story
status: backlog
priority: p1
effort: 3
feature: daily-intentions
created: 2026-02-04
updated: 2026-02-04
done_date: null
tags: [intentions, visual-language, particles, colors]
---

# POMO-354: Aligned/Reactive Particle Colors

## User Story

> As a **Particle user with a daily intention**,
> I want **to see my particles in different colors based on alignment**,
> so that **I can visually distinguish between intentional work and reactive work**.

## Context

Link: [[features/daily-intentions]]

**Phase 2: Visual Language** — This is the foundation for showing the gap between intention and reality.

### The Two Types of Particles

| Type | Symbol | Color | Description |
|------|--------|-------|-------------|
| **Aligned** | ● | White | Work that contributed to your intention |
| **Reactive** | ● | Gray (#525252) | Work that happened, but wasn't planned |

**No judgment.** A reactive particle isn't "bad". Answering that email was necessary. But you see: That wasn't your intention.

## Acceptance Criteria

### Data Model Extension

- [ ] `DBSession.intentionAlignment` field exists (from POMO-350)
- [ ] Values: `'aligned' | 'reactive' | 'none'`
- [ ] Default: `'none'` (no intention set that day)

### Visual Rendering

- [ ] White (#FFFFFF) for aligned particles
- [ ] Gray (#525252 / text-tertiary) for reactive particles
- [ ] White for particles without intention (`'none'`)
- [ ] Consistent across all particle displays

### CSS Classes

```css
/* Aligned Particle */
.particle-aligned {
  background: white;
  opacity: 1;
}

/* Reactive Particle */
.particle-reactive {
  background: #525252;  /* text-tertiary */
  opacity: 1;
}
```

### Default Behavior

- [ ] Particles without alignment = treated as aligned (white)
- [ ] Days without intention = all particles white
- [ ] New particles default to `'none'` until user sets alignment

## Technical Details

### Files to Modify

```
src/lib/db/types.ts               # Already has intentionAlignment
src/styles/design-tokens.ts       # Add particle-aligned, particle-reactive
src/components/timer/SessionCounter.tsx  # Use colors (POMO-356)
src/components/timeline/TimelineTrack.tsx  # Use colors (POMO-357)
```

### Type Definition (already exists)

```typescript
// In src/lib/intentions/types.ts
export type IntentionAlignment = 'aligned' | 'reactive' | 'none';

// In src/lib/db/types.ts
export interface DBSession {
  // ... existing fields ...
  intentionAlignment?: IntentionAlignment;
}
```

### Color Tokens

```typescript
// In design-tokens.ts or tailwind.config.js
colors: {
  particle: {
    aligned: '#FFFFFF',
    reactive: '#525252',  // matches text-tertiary
  }
}
```

## Testing

- [ ] Aligned particles render white
- [ ] Reactive particles render gray
- [ ] Particles without alignment render white
- [ ] Colors are consistent in all views (counter, timeline, history)
- [ ] Light mode: Same colors work (white on light bg may need border)

## Definition of Done

- [ ] Color tokens defined
- [ ] CSS classes created
- [ ] Helper function to get particle color from alignment
- [ ] Unit tests for color logic
- [ ] Visual regression test (screenshot comparison)

## Dependencies

- POMO-350 (Intention data model) ✓ Complete

## Design Notes

**Why gray instead of outline?**
- Still reads as a "particle" (filled shape)
- Less prominent than white (aligned)
- Consistent with Particle's monochrome design
- No confusion with "empty/pending" dots

**Light Mode consideration:**
- White particles on white background need subtle border/shadow
- Gray particles remain visible
