# POMO-008: Button component with all states

**Status:** DONE
**Priority:** P0 - Urgent
**Estimate:** 2 points
**Epic:** Premium Feel Foundation
**Labels:** `component`, `design-system`

## Beschreibung
Create a polished button component with all required states.

## Akzeptanzkriterien
- [x] Primary, secondary, ghost variants
- [x] Small, medium, large sizes
- [x] Default, hover, active, focus, disabled states
- [x] Loading state with spinner
- [x] Icon button variant
- [x] Spring animation on press
- [x] Respects reduced motion preference

## Technische Notizen
- Use Framer Motion for spring animations
- useReducedMotion hook for a11y
- CVA or class-variance-authority for variants

## Implementierungslog
- 2026-01-17: Verifiziert - vollständig implementiert
  - Button: `src/components/ui/Button.tsx`
  - IconButton: `src/components/ui/IconButton.tsx`
  - Framer Motion whileHover/whileTap mit SPRING
  - Reduced motion via Framer's built-in support
