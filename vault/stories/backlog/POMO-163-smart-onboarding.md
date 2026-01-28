---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/learn-section]]"
created: 2026-01-27
updated: 2026-01-28
done_date: null
tags: [onboarding, learn, ux]
---
	
# POMO-163: Smart Onboarding

## User Story

> As a **new Particle user**
> I want to **be asked how I prefer to work when I first open the app**
> so that **Particle starts with a rhythm that fits me**.

## Context

Link to feature: [[features/learn-section]]

The onboarding is the first contact with Particle's philosophy. One single, simple question—no tutorial slides, no explanations. Respects the user's time.

This is not an interrogation. It's an invitation.

## Acceptance Criteria

- [ ] **Given** I open Particle for the first time, **When** I reach the main screen, **Then** I see the onboarding question
- [ ] **Given** I see the onboarding question, **When** I choose "Short sprints", **Then** Classic (25) becomes my default
- [ ] **Given** I see the onboarding question, **When** I choose "Longer blocks", **Then** Deep Work (52) becomes my default
- [ ] **Given** I see the onboarding question, **When** I choose "I'm not sure", **Then** Classic (25) becomes my default
- [ ] **Given** I've completed onboarding, **When** I open Particle again, **Then** I don't see the onboarding

## Content (Final Copy)

### The Question

```
How do you prefer to work?
```

### The Options

| Position | Label | Duration hint | Result |
|----------|-------|---------------|--------|
| Left | "Short sprints" | "25 minutes" | Classic |
| Right | "Longer blocks" | "52+ minutes" | Deep Work |
| Bottom | "I'm not sure" | — | Classic |

### Confirmation Messages

| Choice | Message |
|--------|---------|
| Short sprints | "Classic is a good place to start. You can always change." |
| Longer blocks | "Deep Work for concentrated effort. You can always change." |
| Not sure | "We'll start with Classic. Find your rhythm, particle by particle." |

## Technical Details

### Files to Create/Modify

```
src/
├── components/
│   └── onboarding/
│       └── OnboardingChoice.tsx    # Onboarding modal
├── hooks/
│   └── useOnboarding.ts            # State & logic
└── app/
    └── page.tsx                    # Conditional rendering
```

### Implementation Notes

- Store `hasSeenOnboarding` in LocalStorage
- After selection: Set preset → Show confirmation (2s) → Close
- No skip button—the question is simple enough
- Respect `prefers-reduced-motion` for animations

### State

```typescript
interface OnboardingState {
  hasSeenOnboarding: boolean;
  showConfirmation: boolean;
}
```

### LocalStorage Key

```typescript
const ONBOARDING_KEY = 'particle:onboarding-completed';
```

## UI/UX

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ·                                  │
│                                                             │
│                                                             │
│              How do you prefer to work?                     │
│                                                             │
│                                                             │
│    ┌───────────────────┐  ┌───────────────────┐            │
│    │                   │  │                   │            │
│    │   Short sprints   │  │   Longer blocks   │            │
│    │                   │  │                   │            │
│    │    25 minutes     │  │   52+ minutes     │            │
│    └───────────────────┘  └───────────────────┘            │
│                                                             │
│                                                             │
│                  [ I'm not sure ]                           │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Confirmation (after selection)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ·                                  │
│                                                             │
│                                                             │
│          Classic is a good place to start.                  │
│          You can always change.                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Visual Design

- Full-screen overlay on black background
- Single white particle (dot) at top, pulsing gently
- Clean typography, centered
- Cards have subtle border (`border-tertiary/10`)
- Hover: slight scale + border glow
- No icons—pure typography

### Animation

```typescript
// Question appears
const questionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.3, duration: 0.5 }
  }
};

// Cards stagger in
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 30 }
  }
};
```

### Behavior

1. Click option → Instant visual feedback
2. Show confirmation message (fade in)
3. Wait 2 seconds
4. Fade out → Show timer

## Testing

### Manual Tests

- [ ] Onboarding appears on first launch
- [ ] "Short sprints" sets Classic preset
- [ ] "Longer blocks" sets Deep Work preset
- [ ] "I'm not sure" sets Classic preset
- [ ] Onboarding doesn't appear on subsequent launches
- [ ] Confirmation shows for 2 seconds
- [ ] Reduced motion is respected

### Automated Tests

- [ ] Unit: Preset mapping is correct
- [ ] Unit: LocalStorage is set after completion
- [ ] E2E: Complete onboarding flow

## Definition of Done

- [ ] Code implemented
- [ ] Tests written & passing
- [ ] Content is final (English)
- [ ] Tested locally
- [ ] Deployed to preview

## Design Notes

- No icons for options—too playful for Particle
- The question is intentionally vague ("prefer")—no judgment
- "I'm not sure" is a valid choice, not an escape hatch
- The particle at top is the same one from the intro animation
- Everything fades to black, then the timer appears

## Voice Check

Does this sound like Particle?

- ✅ Calm, not pushy
- ✅ Respects the user's time (one question)
- ✅ No gamification language
- ✅ "You can always change"—no commitment pressure
- ✅ Simple, poetic confirmation messages

---

## Work Log

### Started:
<!-- Claude: Note what you're doing -->

### Completed:
<!-- Auto-filled when story moves to done/ -->
