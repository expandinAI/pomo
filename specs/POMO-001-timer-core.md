# POMO-001: Timer component with accurate countdown

**Status:** DONE
**Priority:** P0 - Urgent
**Estimate:** 3 points
**Epic:** Core Timer Experience
**Labels:** `feature`, `core`

## Beschreibung
Implement the core timer countdown functionality with second-accurate timing.

## Akzeptanzkriterien
- [x] Timer counts down from initial duration (25:00 for work)
- [x] Timer updates every second accurately
- [x] Timer works correctly in background tabs (Web Worker implementation)
- [x] Timer displays in MM:SS format with leading zeros
- [x] Use tabular numbers for consistent width during countdown

## Technische Notizen
- Use `setInterval` in Web Worker for background accuracy
- Fall back to main thread with visibility API compensation
- Store start time and calculate remaining rather than decrementing

## Implementierungslog
- 2026-01-17: Verifiziert - alle Kriterien bereits implementiert
  - Web Worker: `src/lib/timer-worker.ts`
  - Timer Display: `src/components/timer/TimerDisplay.tsx`
  - Format: `src/lib/utils.ts` → `formatTime()`
  - Tabular nums: `src/app/globals.css` → `.timer-display`
