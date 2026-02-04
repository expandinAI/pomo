---
type: story
status: done
priority: p1
effort: 5
feature: timeline
created: 2026-02-02
updated: 2026-02-04
done_date: 2026-02-04
tags: [mobile, timeline, responsive, ux]
---

# POMO-333: Mobile-Native Timeline Redesign

**Type:** Enhancement
**Priority:** High
**Complexity:** Medium
**Component:** Timeline

---

## Context

The Timeline view was designed desktop-first. On mobile viewports (< 640px), the experience degrades significantly:

- Stats row overflows horizontally (requires ~540px, mobile provides ~342px)
- Fixed `gap-16` (64px) between stats wastes precious space
- Keyboard hints ("← → navigate days", "T for today") are irrelevant on touch devices
- 24-hour track is heavily compressed, making particles hard to tap
- Fixed padding (`px-6`) reduces usable content area

**Current State (iPhone 12, 390px):**
```
Available modal width: 390px × 0.95 = 370px
Minus padding (24px × 2): 370 - 48 = 322px actual content
Stats row needs: ~540px → overflow/cutoff
```

## User Story

**As a** mobile user viewing my daily focus timeline,
**I want** a touch-optimized, native-feeling experience,
**So that** reviewing my particles feels as delightful on my phone as on desktop.

## Acceptance Criteria

### Stats Display (Critical)
- [ ] Stats stack vertically on mobile (< 640px): Particles → Focus Time → Active Hours
- [ ] Each stat is a full-width row with label on left, value on right
- [ ] Desktop (≥ 640px) maintains current horizontal layout
- [ ] Animation: Stats slide in sequentially from below

### Timeline Track
- [ ] Track height increases on mobile (h-32 instead of h-24) for better tap targets
- [ ] Minimum particle width increases for touch (≥ 44px tap target)
- [ ] Time markers simplified: Show only 6am, 12pm, 6pm on mobile
- [ ] "Now" marker remains visible and doesn't overlap cramped particles

### Navigation & Gestures
- [ ] Swipe left/right navigates between days (mobile only)
- [ ] Day navigation arrows have 44×44px touch targets
- [ ] Keyboard hints hidden on mobile (detected via pointer: coarse)

### Spacing & Layout
- [ ] Modal padding reduces to `px-4` on mobile
- [ ] Stats section padding reduces proportionally
- [ ] Modal max-height: 70vh on mobile to leave room for dismissal

### Empty State
- [ ] "A blank canvas" message + breathing dot works on mobile
- [ ] Touch-friendly tap area to add first particle (future: quick-add)

## Design Specifications

### Mobile Stats Layout (< 640px)
```
┌──────────────────────────────────────┐
│  Particles               12          │
├──────────────────────────────────────┤
│  Focus time              1h 30m      │
├──────────────────────────────────────┤
│  Active hours            9am - 5pm   │
└──────────────────────────────────────┘
```

### Mobile Full View
```
┌──────────────────────────────────────┐
│  Timeline                        ✕   │
├──────────────────────────────────────┤
│      ‹     Today     ›               │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  ●    ●●   │now      ●       │   │  ← Taller track
│  │            │                 │   │
│  └──────────────────────────────┘   │
│    6am      12pm      6pm           │  ← Simplified markers
│                                      │
│  Particles               12          │
│  ─────────────────────────────────   │
│  Focus time              1h 30m      │
│  ─────────────────────────────────   │
│  Active hours            9am - 5pm   │
│                                      │
│  Tap a particle for details          │  ← Mobile-friendly hint
└──────────────────────────────────────┘
```

### Desktop Remains Unchanged
The current horizontal stats layout with dividers remains for ≥ 640px viewports.

## Technical Approach

### 1. TimelineStats.tsx
```tsx
// Mobile: Stack vertically
// Desktop: Current horizontal layout
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-center sm:gap-16">
  {/* Stats with responsive layout */}
</div>
```

### 2. TimelineOverlay.tsx
```tsx
// Responsive padding
className="px-4 sm:px-6 py-4"

// Hide keyboard hints on touch devices
{!isTouchDevice && <KeyboardHints />}
```

### 3. TimelineTrack.tsx
```tsx
// Responsive track height
className="relative h-32 sm:h-24 mb-4 sm:mb-8"
```

### 4. TimelineMarkers.tsx
```tsx
// Simplified mobile markers
const mobileMarkers = ['6am', '12pm', '6pm'];
const desktopMarkers = ['12am', '6am', '12pm', '6pm', '12am'];
```

### 5. New: useSwipeNavigation hook
```tsx
// Swipe gesture detection for day navigation
export function useSwipeNavigation(onSwipeLeft, onSwipeRight) {
  // Touch event handling
}
```

## Touch Detection Strategy

Use CSS media query for pointer type:
```tsx
// Hook: useTouchDevice
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
```

Or Tailwind's `@media (pointer: coarse)`:
```tsx
className="hidden touch:block"  // Show only on touch
className="block touch:hidden"  // Hide on touch
```

## Out of Scope

- Zooming into specific hour ranges (future enhancement)
- Haptic feedback on particle tap (requires native)
- Quick-add particle from empty timeline (separate story)
- Landscape orientation optimization

## Dependencies

- None (self-contained enhancement)

## Testing Checklist

- [ ] iPhone SE (375px) - smallest common viewport
- [ ] iPhone 12/13 (390px) - popular mid-size
- [ ] iPhone Pro Max (428px) - larger phones
- [ ] Android (360-412px range) - common Android sizes
- [ ] iPad Mini (768px) - should show desktop layout
- [ ] Stats don't overflow at any mobile width
- [ ] Swipe navigation works smoothly
- [ ] Particles remain tappable
- [ ] ParticleDetailOverlay opens correctly on tap
- [ ] Day navigation arrows are easy to hit
- [ ] Animations perform well (60fps)

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Tested on physical iOS and Android devices
- [ ] No horizontal scroll on any mobile viewport
- [ ] Touch targets ≥ 44px
- [ ] Reduced motion respected
- [ ] Code reviewed
- [ ] Screenshots added to PR

---

## Notes

**Particle Philosophy Check:**
- ✅ Reduziert genug? – Removes desktop-only elements, simplifies markers
- ✅ Emotionale Tiefe? – Swipe gestures feel native and delightful
- ✅ Mobile-native? – Not a squeezed desktop view, but a designed mobile experience

**Reference:** Apple Human Interface Guidelines recommend 44×44pt minimum touch targets.
