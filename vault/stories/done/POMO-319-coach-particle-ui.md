---
type: story
status: done
priority: p1
effort: 3
feature: "[[features/ai-coach]]"
created: 2026-01-31
updated: 2026-02-02
done_date: 2026-02-02
tags: [ai, coach, ui, particle]
---

# POMO-319: Coach Particle UI

## User Story

> As a **Flow user**,
> I want to **see the Coach particle floating on screen**,
> so that **I know my Coach is there for me**.

## Context

Link: [[features/ai-coach]]

The Coach manifests as its own sparkle particle that floats at the bottom-right of the screen, next to the Library button. Like the MacBook sleep indicator, it breathes gently—alive, present, waiting.

**Why bottom-right, next to Library?**

The screen is semantically organized:
- **Left:** Navigation & Controls (Cmd+K, Keyboard Hints)
- **Right:** Knowledge & Learning (Library, Coach)

Library and Coach are both "knowledge sources":
| Library | Coach |
|---------|-------|
| Static knowledge | AI knowledge |
| Read & learn | Ask & interact |
| Passive | Active |

Placing them together creates a coherent "Wissensbereich" (knowledge zone).

## Acceptance Criteria

- [ ] Coach particle appears for Flow users only
- [ ] Position: Bottom-right, left of LibraryButton (`bottom-4 right-14` or flex group)
- [ ] Symbol: Custom SVG sparkle icon (4 rays from center, white, no emoji)
- [ ] Idle state: Static, subtle (opacity ~0.6)
- [ ] Active state: Pulses when new insight is waiting
- [ ] Click opens Coach View
- [ ] Keyboard: G C opens Coach View
- [ ] Not visible for Free/Plus users
- [ ] Hidden on mobile (like LibraryButton) – access via ParticleMenu instead

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
- Custom SVG sparkle icon (not emoji) – follows BRAND.md black/white philosophy
- `hidden sm:block` like LibraryButton (mobile uses ParticleMenu)
- Consider grouping with LibraryButton in a flex container for consistent spacing

### Sparkle Icon (SVG)
```svg
<!-- 4-ray sparkle, 16x16, centered -->
<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M8 0v6M8 10v6M0 8h6M10 8h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <!-- Optional: diagonal rays for 8-point star -->
  <path d="M2.5 2.5l3.5 3.5M10 10l3.5 3.5M13.5 2.5l-3.5 3.5M6 10l-3.5 3.5" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
</svg>
```

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
│                                                   [·] Menu      │
│                                                                 │
│                              ●                                  │
│                           Timer                                 │
│                                                                 │
│                      [StatusMessage]                            │
│                                                                 │
│  [⌘K] [?]                                        [✦]  [📚]     │
│  Navigation                                    Coach  Library   │
│                                                 ↑ Wissensbereich │
└─────────────────────────────────────────────────────────────────┘
```

**Semantic Layout:**
- Left: Navigation & Controls (Cmd+K, Keyboard Hints)
- Right: Knowledge Zone (Coach + Library)

**Position:** `absolute bottom-4 right-4` as flex group with LibraryButton
**Spacing:** `gap-3` between Coach and Library icons
**Hover:** Subtle scale-up (1.1), cursor: pointer
**Touch:** 44x44px touch target per icon
**Mobile:** Hidden (access via ParticleMenu → G C)
**Feel:** Alive, not decorative. Like it has something to share.

## Definition of Done

- [ ] Component implemented with SVG sparkle icon
- [ ] Positioned bottom-right, grouped with LibraryButton (Wissensbereich)
- [ ] Idle state correct (opacity 0.6)
- [ ] Pulse animation works when insight waiting
- [ ] Click opens Coach View
- [ ] G C shortcut works
- [ ] Only visible for Flow users
- [ ] Hidden on mobile (sm:block)
