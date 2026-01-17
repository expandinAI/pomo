# POMO-017: Wake Lock API integration

**Status:** TODO
**Priority:** P1 - High
**Estimate:** 2 points
**Epic:** Technical Foundation
**Labels:** `technical`, `pwa`

## Beschreibung
Prevent screen from sleeping during active sessions.

## Akzeptanzkriterien
- [ ] Request wake lock when timer starts
- [ ] Release wake lock when timer pauses/stops
- [ ] Handle wake lock rejection gracefully
- [ ] Works on supported mobile browsers
- [ ] No impact on battery when not timing

## Technische Notizen
- navigator.wakeLock.request('screen')
- Re-acquire on visibility change
- Feature detection required

## Implementierungslog
<!-- Notizen während der Implementierung hier eintragen -->
