# POMO-005: Tab title update with timer state

**Status:** DONE
**Priority:** P1 - High
**Estimate:** 1 point
**Epic:** Core Timer Experience
**Labels:** `feature`, `polish`

## Beschreibung
Update the browser tab title to show timer state.

## Akzeptanzkriterien
- [x] Idle: "Pomo - Focus Timer"
- [x] Running: "MM:SS - Focus | Pomo"
- [x] Paused: "⏸ MM:SS - Focus | Pomo"
- [x] Updates every second when running
- [x] Shows correct session type (Focus/Short Break/Long Break)

## Technische Notizen
- Use document.title
- Consider emoji for paused state

## Implementierungslog
- 2026-01-17: Verifiziert - alle Kriterien implementiert
  - Tab Titles: `src/lib/constants.ts` TAB_TITLES
  - Timer.tsx useEffect updates document.title
  - Verwendet ⏸ Emoji für paused state
