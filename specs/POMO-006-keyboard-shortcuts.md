# POMO-006: Keyboard shortcuts (Space, R, S)

**Status:** DONE
**Priority:** P1 - High
**Estimate:** 2 points
**Epic:** Core Timer Experience
**Labels:** `feature`, `accessibility`

## Beschreibung
Implement keyboard shortcuts for power users.

## Akzeptanzkriterien
- [x] Space: Start/Pause toggle
- [x] R: Reset current session
- [x] S: Skip to next session
- [x] D: Toggle dark mode
- [x] Shortcuts don't trigger in input fields
- [x] Shortcuts work when page has focus
- [x] Visual hint showing available shortcuts (?)

## Technische Notizen
- Use keydown event listener
- Check for input focus to prevent conflicts
- Consider useHotkeys hook pattern

## Implementierungslog
- 2026-01-17: Teilweise implementiert
  - Timer.tsx keydown handler für Space/R/S
- 2026-01-17: D-Shortcut hinzugefügt
  - Timer.tsx nutzt useTheme hook
- 2026-01-17: Fertiggestellt
  - ShortcutsHelp: `src/components/ui/ShortcutsHelp.tsx`
  - Keyboard icon (unten links) mit Popover
  - ?-Taste öffnet/schließt die Übersicht
  - Escape schließt die Übersicht
