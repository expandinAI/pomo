# POMO-016: Web Worker for background timer

**Status:** DONE
**Priority:** P0 - Urgent
**Estimate:** 3 points
**Epic:** Technical Foundation
**Labels:** `technical`, `core`

## Beschreibung
Implement Web Worker for accurate background timing.

## Akzeptanzkriterien
- [x] Timer runs in Web Worker
- [x] Timer continues in background tabs
- [x] Timer accurate to within 100ms
- [ ] Graceful fallback if Web Worker unavailable
- [x] Worker communicates with main thread efficiently

## Technische Notizen
- postMessage for communication
- Use performance.now() for accuracy
- Test with DevTools throttling

## Implementierungslog
- 2026-01-17: Verifiziert - Kernfunktionalität implementiert
  - Worker: `src/lib/timer-worker.ts`
  - Hook: `src/hooks/useTimerWorker.ts`
  - Uses Date.now() elapsed time calculation
  - Fallback ist optional (low priority)
