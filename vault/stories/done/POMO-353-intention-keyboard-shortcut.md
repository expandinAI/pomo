---
type: story
status: done
priority: p1
effort: 2
feature: daily-intentions
created: 2026-02-04
updated: 2026-02-04
done_date: 2026-02-04
tags: [intentions, keyboard, shortcuts, command-palette, breaking-change]
---

# POMO-353: Keyboard Shortcut `G I` for Intention

## User Story

> As a **keyboard-first Particle user**,
> I want **to press `G I` to set or edit my intention**,
> so that **I can manage my daily focus without touching the mouse**.

## Context

Link: [[features/daily-intentions]]

**Breaking Change:** This replaces `G O` (Daily Goal) with `G I` (Intention). The unified IntentionOverlay handles both intention text and particle count.

## Acceptance Criteria

### Shortcut: `G I`

- [x] `G I` opens IntentionOverlay
- [x] Works when timer is idle or running
- [x] Does NOT work when modal is open or input is focused
- [x] Replaces `G O` behavior

### Shortcut: `Shift+I`

- [x] Clears today's intention
- [x] Shows brief confirmation toast: "Intention cleared"
- [x] Only works if intention exists

### Backwards Compatibility: `G O`

- [x] `G O` still works but triggers `G I` behavior
- [x] Shows deprecation hint in Help Modal: "G O → Set Intention (legacy)"

### Command Palette

- [x] "Set Intention" command added
- [x] Shortcut shown: `G I`
- [x] Keywords: intention, focus, today, goal, direction, planning
- [x] "Clear Intention" command added (⇧I)

### Help Modal

- [x] `G I` added under Navigation category
- [x] `⇧I` added for Clear Intention
- [x] `G O` marked as "(legacy)"

### Event System

- [x] `particle:open-intentions` event opens IntentionOverlay
- [x] `particle:clear-intention` event clears intention
- [x] `particle:open-goals` redirects to `particle:open-intentions` (backwards compat)

## Implementation Summary

### Files Modified

- `src/components/timer/Timer.tsx` - Added `Shift+I` handler + `particle:clear-intention` listener
- `src/components/command/CommandRegistration.tsx` - Added "Set Intention" and "Clear Intention" commands
- `src/lib/shortcuts.ts` - Added `G I`, `⇧I`, updated `G O` description
- `src/hooks/useGPrefixNavigation.ts` - Added `G I` and `G O` redirect

## Definition of Done

- [x] `G I` shortcut working
- [x] `G O` redirects to `G I` (backwards compat)
- [x] `Shift+I` shortcut working
- [x] Command palette updated
- [x] Help modal updated
- [x] Toast feedback for clear
- [x] No conflicts with other shortcuts
- [x] Breaking change documented

## Dependencies

- POMO-350 (Intention data model) ✓ Complete
- POMO-351 (IntentionOverlay) ✓ Complete
