# POMO-004: Audio notification on completion

**Status:** DONE
**Priority:** P0 - Urgent
**Estimate:** 2 points
**Epic:** Core Timer Experience
**Labels:** `feature`, `notification`

## Beschreibung
Play a pleasant sound when a session completes.

## Akzeptanzkriterien
- [x] Sound plays when timer reaches 00:00
- [x] Sound is warm and pleasant (not jarring)
- [x] Sound works on all supported browsers
- [x] Sound respects system mute settings
- [ ] Option to disable sound (future: settings)

## Technische Notizen
- Use Web Audio API for low latency
- Preload audio during idle time
- Keep audio file small (<50KB)

## Implementierungslog
- 2026-01-17: Verifiziert - Kernfunktionalität implementiert
  - Sound Hook: `src/hooks/useSound.ts`
  - Web Audio API synthesis (C5→E5 chime)
  - Separate sounds for work/break completion
  - Mute-Option kommt später in Settings
