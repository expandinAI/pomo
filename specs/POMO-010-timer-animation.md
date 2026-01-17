# POMO-010: Timer animation (start/complete)

**Status:** DONE
**Priority:** P1 - High
**Estimate:** 3 points
**Epic:** Premium Feel Foundation
**Labels:** `animation`, `polish`

## Beschreibung
Add subtle animations to the timer for premium feel.

## Akzeptanzkriterien
- [x] Pulse animation when timer is running
- [x] Scale animation on timer start
- [x] Glow effect on completion
- [x] Number transition animation (fade + slide)
- [x] All animations respect reduced motion
- [x] Animations use spring physics

## Technische Notizen
- Framer Motion for all animations
- Keep animations subtle, not distracting
- Performance: use transform/opacity only

## Implementierungslog
- 2026-01-17: Teilweise implementiert
  - Pulse: `TimerDisplay.tsx` pulse when isRunning
  - Glow: celebration glow effect
- 2026-01-17: Fertiggestellt
  - Scale on start: Timer-Circle skaliert kurz bei Start (1 → 1.03 → 1)
  - AnimatedDigit: Jede Ziffer animiert mit slide-up + fade
  - Reduced motion: Alle Animationen respektieren `prefers-reduced-motion`
  - Performance: Nur transform/opacity Animationen
