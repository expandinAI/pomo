# POMO-017: Wake Lock API integration

**Status:** DONE
**Priority:** P1 - High
**Estimate:** 2 points
**Epic:** Technical Foundation
**Labels:** `technical`, `pwa`

## Beschreibung
Prevent screen from sleeping during active sessions.

## Akzeptanzkriterien
- [x] Request wake lock when timer starts
- [x] Release wake lock when timer pauses/stops
- [x] Handle wake lock rejection gracefully
- [x] Works on supported mobile browsers
- [x] No impact on battery when not timing

## Technische Notizen
- navigator.wakeLock.request('screen')
- Re-acquire on visibility change
- Feature detection required

## Implementierungslog
- Created `useWakeLock` hook in `src/hooks/useWakeLock.ts`
- Integrated into Timer component
- Wake lock requested when `isRunning` becomes true
- Wake lock released when timer pauses/stops
- Auto re-acquires on visibility change (tab becomes visible)
- Graceful fallback for unsupported browsers
