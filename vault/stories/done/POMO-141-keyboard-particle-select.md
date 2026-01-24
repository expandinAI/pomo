# POMO-141: Keyboard Particle Select

**Status:** Done
**Completed:** 2026-01-24

## Story

**As a** keyboard-first user,
**I want to** press O followed by a number to open a specific particle,
**So that** I can quickly access and edit any particle without using the mouse.

## Context

Following the P+number pattern for projects, this feature adds O+number for particles. It's a natural extension of the keyboard-first philosophy and makes particle editing lightning fast.

## Acceptance Criteria

- [x] Press `O` activates "Particle Select Mode"
- [x] Filled particles show their index numbers (1-9)
- [x] Press number (1-9) opens that particle's detail overlay
- [x] Escape cancels the mode
- [x] Timeout (2s) auto-cancels if no selection
- [x] Only works when overlays are not open
- [x] Visual feedback: numbers appear with subtle staggered animation

## Interaction Flow

```
Normal:     ● ● ● ● ○ ○ ○ ○

Press O:    ❶ ❷ ❸ ❹ ○ ○ ○ ○   (numbers appear)
            "Select particle..."

Press 3:    → Opens 3rd particle overlay

Or Escape:  ● ● ● ● ○ ○ ○ ○   (back to normal)
```

## Technical Notes

- Added `particleSelectMode` state to Timer.tsx
- Added `getParticleNumber` helper to SessionCounter.tsx
- Numbers displayed as overlay on filled particles with spring animation
- Status message shows "Select particle..." when in mode
- 2-second timeout auto-cancels selection mode

## Implementation Details

### Timer.tsx
- Added `particleSelectMode` state and `particleSelectTimeoutRef` ref
- O key handler enters select mode with 2s auto-cancel timeout
- 1-9 key handlers open corresponding particle overlay when in select mode
- Escape cancels select mode
- Pass `particleSelectMode` to SessionCounter

### SessionCounter.tsx
- Added `particleSelectMode` prop
- Added `getParticleNumber` helper (returns 1-9 for filled particles)
- StandardView shows animated number overlay on filled particles when in mode
- Numbers use staggered entrance animation (delay based on index)

