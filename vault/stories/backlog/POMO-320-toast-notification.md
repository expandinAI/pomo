---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/ai-coach]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [ai, coach, toast, notification]
---

# POMO-320: Toast Notification System

## User Story

> As a **Flow user**,
> I want to **see Coach insights as brief messages**,
> so that **I'm informed without my work being interrupted**.

## Context

Link: [[features/ai-coach]]

Toast appears above the Coach particle, shows a brief insight, disappears after 5 seconds. The particle then pulses, waiting for the user to explore further.

## Acceptance Criteria

- [ ] Toast appears above the Coach particle
- [ ] Shows ✨ icon + short text (max 2 lines)
- [ ] Slide-up animation on appear
- [ ] Auto-hide after 5 seconds
- [ ] Fade-out animation
- [ ] Click on toast → opens Coach View with that insight
- [ ] After hide → Coach particle starts pulsing
- [ ] Don't show during active focus session

## Technical Details

### Files
```
src/
├── components/
│   └── coach/
│       ├── CoachToast.tsx        # NEW
│       └── CoachParticle.tsx     # Integration
├── hooks/
│   └── useCoachNotifications.ts  # NEW: Notification logic
```

### Implementation Notes
- `AnimatePresence` for enter/exit animations
- Toast queue for multiple insights (show one at a time)
- LocalStorage: last toast time (cooldown)

### Animation
```typescript
// Enter
initial={{ opacity: 0, y: 20, scale: 0.95 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
transition={{ type: 'spring', duration: 0.4 }}

// Exit
exit={{ opacity: 0, y: 10 }}
transition={{ duration: 0.3 }}
```

## UI/UX

```
┌─────────────────────────────────────────┐
│  ✨ You focused 127% more than usual    │
│     on a typical Friday                 │
└─────────────────────────────────────────┘
                    ↓
                   ✨
            (Coach Particle)
```

**Styling:**
- Background: `bg-surface`
- Border: `border-tertiary/20`
- Border-radius: `rounded-xl`
- Padding: `px-4 py-3`
- Shadow: `shadow-lg`
- Max-width: `max-w-sm`

**Feel:** Magical, not marketing. Like a friend sharing an observation.

## Testing

- [ ] Toast appears on new insight
- [ ] Auto-hides after 5 seconds
- [ ] Click opens Coach View
- [ ] Particle pulses after toast hides
- [ ] No toast during running timer

## Definition of Done

- [ ] Toast component implemented
- [ ] Animation smooth
- [ ] Click handler works
- [ ] Session-awareness (don't disturb)
- [ ] Cooldown between toasts
