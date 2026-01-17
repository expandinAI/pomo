# POMO-003: Session type switching (Work/Short/Long)

**Status:** DONE
**Priority:** P0 - Urgent
**Estimate:** 2 points
**Epic:** Core Timer Experience
**Labels:** `feature`, `core`

## Beschreibung
Allow users to switch between different session types.

## Akzeptanzkriterien
- [x] Three session types: Work (25min), Short Break (5min), Long Break (15min)
- [x] Visual indicator shows current mode
- [x] Clicking a mode switches timer to that duration
- [x] Switching resets the timer to the new duration
- [x] Cannot switch while timer is running (button disabled)
- [x] Smooth animation between active states

## Technische Notizen
- Session types as enum/const
- Consider keyboard shortcuts for switching (future)

## Implementierungslog
- 2026-01-17: Verifiziert - alle Kriterien implementiert
  - SessionType: `src/components/timer/SessionType.tsx`
  - Durations: `src/styles/design-tokens.ts` TIMER_DURATIONS
  - Animation: Framer Motion layoutId for smooth transitions
