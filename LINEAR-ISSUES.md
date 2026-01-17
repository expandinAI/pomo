# Linear Issues - Pomo Sprint 1

This document contains issues formatted for import into Linear. Copy each issue into Linear or use the Linear API/CSV import.

---

## Epic 1: Core Timer Experience

### POMO-1: Timer component with accurate countdown
**Priority:** P0 - Urgent
**Estimate:** 3 points
**Labels:** `feature`, `core`

**Description:**
Implement the core timer countdown functionality with second-accurate timing.

**Acceptance Criteria:**
- [ ] Timer counts down from initial duration (25:00 for work)
- [ ] Timer updates every second accurately
- [ ] Timer works correctly in background tabs (Web Worker implementation)
- [ ] Timer displays in MM:SS format with leading zeros
- [ ] Use tabular numbers for consistent width during countdown

**Technical Notes:**
- Use `setInterval` in Web Worker for background accuracy
- Fall back to main thread with visibility API compensation
- Store start time and calculate remaining rather than decrementing

---

### POMO-2: Start/Pause/Reset controls
**Priority:** P0 - Urgent
**Estimate:** 2 points
**Labels:** `feature`, `core`

**Description:**
Implement the primary control buttons for the timer.

**Acceptance Criteria:**
- [ ] Start button begins the countdown
- [ ] Button changes to "Pause" when timer is running
- [ ] Pause stops the timer at current time
- [ ] Button shows "Resume" when paused
- [ ] Reset button returns timer to initial duration
- [ ] All buttons have proper hover/active states
- [ ] Buttons are keyboard accessible

---

### POMO-3: Session type switching (Work/Short/Long)
**Priority:** P0 - Urgent
**Estimate:** 2 points
**Labels:** `feature`, `core`

**Description:**
Allow users to switch between different session types.

**Acceptance Criteria:**
- [ ] Three session types: Work (25min), Short Break (5min), Long Break (15min)
- [ ] Visual indicator shows current mode
- [ ] Clicking a mode switches timer to that duration
- [ ] Switching resets the timer to the new duration
- [ ] Cannot switch while timer is running (button disabled)
- [ ] Smooth animation between active states

---

### POMO-4: Audio notification on completion
**Priority:** P0 - Urgent
**Estimate:** 2 points
**Labels:** `feature`, `notification`

**Description:**
Play a pleasant sound when a session completes.

**Acceptance Criteria:**
- [ ] Sound plays when timer reaches 00:00
- [ ] Sound is warm and pleasant (not jarring)
- [ ] Sound works on all supported browsers
- [ ] Sound respects system mute settings
- [ ] Option to disable sound (future: settings)

**Technical Notes:**
- Use Web Audio API for low latency
- Preload audio during idle time
- Keep audio file small (<50KB)

---

### POMO-5: Tab title update with timer state
**Priority:** P1 - High
**Estimate:** 1 point
**Labels:** `feature`, `polish`

**Description:**
Update the browser tab title to show timer state.

**Acceptance Criteria:**
- [ ] Idle: "Pomo - Focus Timer"
- [ ] Running: "MM:SS - Focus | Pomo"
- [ ] Paused: "⏸ MM:SS - Focus | Pomo"
- [ ] Updates every second when running
- [ ] Shows correct session type (Focus/Short Break/Long Break)

---

### POMO-6: Keyboard shortcuts (Space, R, S)
**Priority:** P1 - High
**Estimate:** 2 points
**Labels:** `feature`, `accessibility`

**Description:**
Implement keyboard shortcuts for power users.

**Acceptance Criteria:**
- [ ] Space: Start/Pause toggle
- [ ] R: Reset current session
- [ ] S: Skip to next session
- [ ] D: Toggle dark mode
- [ ] Shortcuts don't trigger in input fields
- [ ] Shortcuts work when page has focus
- [ ] Visual hint showing available shortcuts (?)

---

## Epic 2: Premium Feel Foundation

### POMO-7: Design system tokens setup
**Priority:** P0 - Urgent
**Estimate:** 3 points
**Labels:** `design-system`, `foundation`

**Description:**
Set up the complete design token system in Tailwind and TypeScript.

**Acceptance Criteria:**
- [ ] Color palette defined (light + dark mode)
- [ ] Typography scale implemented
- [ ] Spacing scale (8px base)
- [ ] Border radius tokens
- [ ] Shadow tokens (warm-tinted)
- [ ] Animation timing tokens
- [ ] Tokens accessible in both CSS and JS

---

### POMO-8: Button component with all states
**Priority:** P0 - Urgent
**Estimate:** 2 points
**Labels:** `component`, `design-system`

**Description:**
Create a polished button component with all required states.

**Acceptance Criteria:**
- [ ] Primary, secondary, ghost variants
- [ ] Small, medium, large sizes
- [ ] Default, hover, active, focus, disabled states
- [ ] Loading state with spinner
- [ ] Icon button variant
- [ ] Spring animation on press
- [ ] Respects reduced motion preference

---

### POMO-9: Dark/Light mode with system detection
**Priority:** P0 - Urgent
**Estimate:** 2 points
**Labels:** `feature`, `accessibility`

**Description:**
Implement theme switching with system preference detection.

**Acceptance Criteria:**
- [ ] Detect system preference on load
- [ ] Apply correct theme without flash
- [ ] Toggle button to switch modes
- [ ] Persist preference in localStorage
- [ ] Smooth transition between themes
- [ ] All components support both themes

---

### POMO-10: Timer animation (start/complete)
**Priority:** P1 - High
**Estimate:** 3 points
**Labels:** `animation`, `polish`

**Description:**
Add subtle animations to the timer for premium feel.

**Acceptance Criteria:**
- [ ] Pulse animation when timer is running
- [ ] Scale animation on timer start
- [ ] Glow effect on completion
- [ ] Number transition animation (fade + slide)
- [ ] All animations respect reduced motion
- [ ] Animations use spring physics

---

### POMO-11: Loading/skeleton states
**Priority:** P1 - High
**Estimate:** 2 points
**Labels:** `polish`, `ux`

**Description:**
Add loading states to prevent layout shift.

**Acceptance Criteria:**
- [ ] Skeleton loader for timer display
- [ ] Shimmer animation on skeleton
- [ ] No layout shift when content loads
- [ ] Graceful handling of hydration

---

## Epic 3: Signature Moments

### POMO-12: "The Breath" breathing animation on start
**Priority:** P1 - High
**Estimate:** 3 points
**Labels:** `animation`, `signature`

**Description:**
Implement the signature breathing animation before work sessions.

**Acceptance Criteria:**
- [ ] 3-second animation (1.5s inhale, 1.5s exhale)
- [ ] Concentric circles expand and contract
- [ ] "Breathe in..." / "Breathe out..." text
- [ ] Timer starts immediately after animation
- [ ] Can be skipped by tapping
- [ ] Setting to disable (future)
- [ ] Only shows for work sessions, not breaks

---

### POMO-13: Completion celebration animation
**Priority:** P1 - High
**Estimate:** 3 points
**Labels:** `animation`, `signature`

**Description:**
Create a subtle, elegant celebration when a session completes.

**Acceptance Criteria:**
- [ ] Subtle particle/glow effect
- [ ] "Well done" message (brief)
- [ ] Timer pulses gently
- [ ] Session counter increments with animation
- [ ] Auto-transition to break after 3 seconds
- [ ] Not overwhelming or distracting

---

### POMO-14: Sound design (completion chime)
**Priority:** P2 - Medium
**Estimate:** 2 points
**Labels:** `audio`, `polish`

**Description:**
Create or source a beautiful completion sound.

**Acceptance Criteria:**
- [ ] Warm, resolving tone
- [ ] Duration under 500ms
- [ ] Volume balanced with typical app usage
- [ ] Works on all browsers
- [ ] No licensing issues

---

## Epic 4: Technical Foundation

### POMO-15: PWA manifest and service worker
**Priority:** P0 - Urgent
**Estimate:** 3 points
**Labels:** `pwa`, `technical`

**Description:**
Set up Progressive Web App capabilities.

**Acceptance Criteria:**
- [ ] Valid manifest.json
- [ ] App icons (192px, 512px)
- [ ] Install prompt works on supported browsers
- [ ] App launches in standalone mode
- [ ] Basic offline capability
- [ ] Proper theme colors

---

### POMO-16: Web Worker for background timer
**Priority:** P0 - Urgent
**Estimate:** 3 points
**Labels:** `technical`, `core`

**Description:**
Implement Web Worker for accurate background timing.

**Acceptance Criteria:**
- [ ] Timer runs in Web Worker
- [ ] Timer continues in background tabs
- [ ] Timer accurate to within 100ms
- [ ] Graceful fallback if Web Worker unavailable
- [ ] Worker communicates with main thread efficiently

---

### POMO-17: Wake Lock API integration
**Priority:** P1 - High
**Estimate:** 2 points
**Labels:** `technical`, `pwa`

**Description:**
Prevent screen from sleeping during active sessions.

**Acceptance Criteria:**
- [ ] Request wake lock when timer starts
- [ ] Release wake lock when timer pauses/stops
- [ ] Handle wake lock rejection gracefully
- [ ] Works on supported mobile browsers
- [ ] No impact on battery when not timing

---

### POMO-18: Performance optimization (<100KB)
**Priority:** P1 - High
**Estimate:** 2 points
**Labels:** `technical`, `performance`

**Description:**
Ensure the app meets performance targets.

**Acceptance Criteria:**
- [ ] Total JS bundle < 100KB (gzipped)
- [ ] LCP < 1.5s
- [ ] CLS < 0.1
- [ ] Lighthouse Performance > 95
- [ ] No unused dependencies
- [ ] Tree-shaking configured correctly

---

## Sprint Summary

| Priority | Issues | Points |
|----------|--------|--------|
| P0 - Urgent | 8 | 20 |
| P1 - High | 8 | 19 |
| P2 - Medium | 2 | 4 |
| **Total** | **18** | **43** |

### Recommended Sprint 1 Scope (P0 only)
- POMO-1: Timer component
- POMO-2: Start/Pause/Reset controls
- POMO-3: Session type switching
- POMO-4: Audio notification
- POMO-7: Design system tokens
- POMO-8: Button component
- POMO-9: Dark/Light mode
- POMO-15: PWA manifest
- POMO-16: Web Worker

**Sprint 1 Points: 22**

---

## Import Format (CSV)

```csv
Title,Description,Priority,Estimate,Labels
"Timer component with accurate countdown","Implement core timer countdown with second-accurate timing using Web Worker",P0,3,"feature,core"
"Start/Pause/Reset controls","Implement primary control buttons for timer",P0,2,"feature,core"
"Session type switching","Allow switching between Work/Short Break/Long Break",P0,2,"feature,core"
"Audio notification on completion","Play pleasant sound when session completes",P0,2,"feature,notification"
"Tab title update with timer state","Show timer state in browser tab title",P1,1,"feature,polish"
"Keyboard shortcuts","Implement Space/R/S/D keyboard shortcuts",P1,2,"feature,accessibility"
"Design system tokens setup","Set up complete design token system",P0,3,"design-system,foundation"
"Button component with all states","Create polished button with all states",P0,2,"component,design-system"
"Dark/Light mode with system detection","Theme switching with system preference",P0,2,"feature,accessibility"
"Timer animation (start/complete)","Add subtle premium animations to timer",P1,3,"animation,polish"
"Loading/skeleton states","Add loading states to prevent layout shift",P1,2,"polish,ux"
"The Breath breathing animation","Signature breathing animation before work sessions",P1,3,"animation,signature"
"Completion celebration animation","Subtle celebration when session completes",P1,3,"animation,signature"
"Sound design (completion chime)","Create beautiful completion sound",P2,2,"audio,polish"
"PWA manifest and service worker","Set up Progressive Web App capabilities",P0,3,"pwa,technical"
"Web Worker for background timer","Implement accurate background timing",P0,3,"technical,core"
"Wake Lock API integration","Prevent screen sleep during sessions",P1,2,"technical,pwa"
"Performance optimization","Ensure app meets <100KB and LCP targets",P1,2,"technical,performance"
```

---

*Generated: 2026-01-17*
