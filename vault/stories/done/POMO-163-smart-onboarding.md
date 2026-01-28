---
type: story
status: done
priority: p1
effort: 3
feature: "[[features/learn-section]]"
created: 2026-01-27
updated: 2026-01-28
done_date: 2026-01-28
tags: [onboarding, learn, ux]
---

# POMO-163: Smart Onboarding

## User Story

> As a **new Particle user**
> I want to **be asked how I prefer to work when I first try to start the timer**
> so that **Particle starts with a rhythm that fits me**.

## Context

Link to feature: [[features/learn-section]]

The onboarding is the first contact with Particle's philosophy. One single, simple question—no tutorial slides, no explanations. Respects the user's time.

This is not an interrogation. It's an invitation.

## Acceptance Criteria

- [x] **Given** I try to start the timer for the first time, **When** I press Space or click Start, **Then** I see the rhythm selection overlay
- [x] **Given** I see the rhythm selection, **When** I choose "Classic (25 min)", **Then** Classic becomes my default and timer starts
- [x] **Given** I see the rhythm selection, **When** I choose "Deep Work (52 min)", **Then** Deep Work becomes my default and timer starts
- [x] **Given** I see the rhythm selection, **When** I choose "90-Min (90 min)", **Then** Ultradian becomes my default and timer starts
- [x] **Given** I see the rhythm selection, **When** I choose "I'm not sure", **Then** Classic becomes my default and timer starts
- [x] **Given** I've completed onboarding, **When** I try to start the timer again, **Then** it starts immediately without onboarding

## Final Implementation

### Trigger
- Onboarding appears on **first timer start attempt** (not on app load)
- This respects the timer-first approach: user sees the app, then engages

### The Question

```
Choose your rhythm
```

### The Options (3 Cards)

| Option | Duration | Description | Confirmation |
|--------|----------|-------------|--------------|
| Classic | 25 min | The original Pomodoro technique. Short, focused sprints with frequent breaks. | Classic rhythm selected. Short sprints, frequent breaks. |
| Deep Work | 52 min | Based on productivity research. Longer focus for complex, creative work. | Deep Work rhythm selected. Longer focus, deeper immersion. |
| 90-Min | 90 min | Full ultradian cycle. Matches your natural energy rhythm. | 90-Min rhythm selected. Complete energy cycles. |

### Fallback Option
```
I'm not sure – start with Classic
```
→ "Starting with Classic. You can switch anytime with keys 1, 2, or 3."

### Welcome Message (after first particle)
```
Your first particle. Press L to explore rhythms.
```
Shown in status bar for 8 seconds after timer starts.

## Technical Implementation

### Files Created/Modified

```
src/
├── components/
│   └── onboarding/
│       ├── OnboardingOverlay.tsx    # Generic reusable base
│       ├── RhythmOnboarding.tsx     # Rhythm-specific implementation
│       └── index.ts                 # Exports
├── hooks/
│   └── useOnboarding.ts             # State & localStorage
└── app/
    └── page.tsx                     # Integration with Timer
```

### Architecture

The implementation establishes a **reusable pattern** for future onboardings:

- `OnboardingOverlay` is a generic component with configurable props
- `RhythmOnboarding` is a specific implementation using the base
- Timing constants are exported for consistency
- Pattern is documented in CLAUDE.md

### LocalStorage Key

```typescript
const STORAGE_KEY = 'particle:rhythm-onboarding-completed';
```

### Phase Flow

```
question ──(selection)──> confirmation ──(3.5s)──> exiting ──(1.2s)──> timer starts
```

### Timing Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| CONFIRMATION_DISPLAY_DURATION | 3500ms | Show confirmation message |
| FADE_OUT_DURATION | 1200ms | Magical slow fade-out |
| CONFIRMATION_DELAY | 200ms | Delay after question fades |
| CARD_STAGGER_DELAY | 100ms | Stagger between cards |

## UI/UX

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ·                                  │  ← Particle (30% from top)
│                                                             │
│              Choose your rhythm                             │  ← Content (38% from top)
│       You can switch anytime with keys 1, 2, or 3          │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Classic    │  │  Deep Work  │  │   90-Min    │         │
│  │   25 min    │  │   52 min    │  │   90 min    │         │
│  │ Description │  │ Description │  │ Description │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│            I'm not sure – start with Classic                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Visual Design

- Full-screen overlay on black background
- Single white particle at 30% from top, pulsing gently
- Content at 38% from top (absolute positioning prevents jumping)
- Cards with subtle border (`border-tertiary/10`)
- Hover: scale 1.02 + border glow
- Reduced motion support via `useReducedMotion()`

### Animation

- Particle: Gentle breathing (scale 1-1.15, opacity 0.7-1) during question
- Particle: Calm (no animation) during confirmation
- Cards: Spring animation with stagger
- Confirmation: Fade in centered, then magical slow fade-out

## Testing

### Manual Tests

- [x] Onboarding appears on first timer start attempt
- [x] "Classic" sets Classic preset and starts timer
- [x] "Deep Work" sets Deep Work preset and starts timer
- [x] "90-Min" sets Ultradian preset and starts timer
- [x] "I'm not sure" sets Classic preset and starts timer
- [x] Onboarding doesn't appear on subsequent launches
- [x] Confirmation shows for 3.5 seconds
- [x] Welcome message appears after first timer start
- [x] Keyboard shortcuts blocked during onboarding (Space, 1-4, etc.)
- [x] Reduced motion is respected

## Definition of Done

- [x] Code implemented
- [x] Reusable pattern established (OnboardingOverlay base)
- [x] Pattern documented in CLAUDE.md
- [x] Content is final (English)
- [x] Tested locally
- [x] All three rhythm presets explained with descriptions

## Design Notes

- Changed from 2 options to 3 (all rhythm presets)
- Added descriptions explaining each rhythm's philosophy
- Trigger changed from "on load" to "on first start attempt"
- Particle position absolute (30%) to prevent jumping on phase change
- Welcome message points to Learn section (L key)

## Voice Check

Does this sound like Particle?

- ✅ Calm, not pushy
- ✅ Respects the user's time (one question)
- ✅ No gamification language
- ✅ "You can switch anytime"—no commitment pressure
- ✅ Simple, poetic confirmation messages
- ✅ Magical transition feels like opening a door

---

## Work Log

### Started: 2026-01-27

Initial implementation with 2 options (Short sprints / Longer blocks)

### Iterations:

- Added all 3 rhythm presets with descriptions
- Changed trigger from "on load" to "on first start attempt"
- Fixed particle jumping by using absolute positioning
- Added welcome message after first timer start
- Refactored to reusable OnboardingOverlay pattern

### Completed: 2026-01-28

- Full implementation with reusable pattern
- Documented in CLAUDE.md
- All acceptance criteria met
