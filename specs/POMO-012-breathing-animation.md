# POMO-012: "The Breath" breathing animation on start

**Status:** DONE
**Priority:** P1 - High
**Estimate:** 3 points
**Epic:** Signature Moments
**Labels:** `animation`, `signature`

## Beschreibung
Implement the signature breathing animation before work sessions.

## Akzeptanzkriterien
- [x] 3-second animation (1.5s inhale, 1.5s exhale)
- [x] Concentric circles expand and contract
- [x] "Breathe in..." / "Breathe out..." text
- [x] Timer starts immediately after animation
- [x] Can be skipped by tapping
- [ ] Setting to disable (future)
- [x] Only shows for work sessions, not breaks

## Technische Notizen
- Framer Motion for circle animations
- Text sync with animation phases
- Consider reduced motion: skip or simplify

## Implementierungslog
- 2026-01-17: Größtenteils implementiert
  - BreathingAnimation: `src/components/timer/BreathingAnimation.tsx`
  - 3 konzentrische Kreise mit scale animation
  - Reduced motion: automatisch übersprungen
- 2026-01-17: Fertiggestellt
  - Skip by tap/click: Button wrapper mit onClick
  - "Tap to skip" Hinweis erscheint nach 1s
  - Accessibility: aria-label für Screen Reader
  - Note: "Setting to disable" ist für zukünftige Iteration vorgesehen
