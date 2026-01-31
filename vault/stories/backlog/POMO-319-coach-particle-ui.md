---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/ai-coach]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [ai, coach, ui, particle]
---

# POMO-319: Coach Particle UI

## User Story

> As a **Flow user**,
> I want to **see the Coach particle floating on screen**,
> so that **I know my Coach is there for me**.

## Context

Link: [[features/ai-coach]]

The Coach manifests as its own ✨ sparkle particle that floats at the bottom of the screen. Like the MacBook sleep indicator, it breathes gently—alive, present, waiting.

## Acceptance Criteria

- [ ] Coach particle appears for Flow users only
- [ ] Position: Bottom center, 24px from bottom
- [ ] Symbol: ✨ (Sparkle emoji or custom icon)
- [ ] Idle state: Static, subtle (opacity ~0.6)
- [ ] Active state: Pulses when new insight is waiting
- [ ] Click opens Coach View
- [ ] Keyboard: G C opens Coach View
- [ ] Not visible for Free/Plus users

## Technical Details

### Files
```
src/
├── components/
│   └── coach/
│       ├── CoachParticle.tsx     # NEW
│       └── index.ts
└── app/
    └── page.tsx                  # Integrate component
```

### Implementation Notes
- Framer Motion for pulse animation
- `useFeatureAccess('aiCoach')` for visibility
- `useCoachInsights()` hook for insight status
- Breathing animation similar to ParticleMenu dot

### Animation
```typescript
// Idle State
{ opacity: 0.6, scale: 1 }

// Active State (new insight waiting)
animate={{
  opacity: [0.5, 1, 0.5],
  scale: [1, 1.2, 1],
}}
transition={{
  duration: 3,
  repeat: Infinity,
  ease: 'easeInOut',
}}
```

## UI/UX

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                              ●                          [·]      │
│                           Timer                    ParticleMenu  │
│                                                                   │
│                                                                   │
│                                                                   │
│                                                                   │
│                             ✨  ← Coach Particle                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Hover:** Subtle scale-up (1.1), cursor: pointer
**Touch:** 44x44px touch target
**Feel:** Alive, not decorative. Like it has something to share.

## Definition of Done

- [ ] Component implemented
- [ ] Idle state correct
- [ ] Pulse animation works
- [ ] Click opens Coach View
- [ ] G C shortcut works
- [ ] Only visible for Flow users
