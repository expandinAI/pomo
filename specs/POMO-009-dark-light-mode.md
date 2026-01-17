# POMO-009: Dark/Light mode with system detection

**Status:** DONE
**Priority:** P0 - Urgent
**Estimate:** 2 points
**Epic:** Premium Feel Foundation
**Labels:** `feature`, `accessibility`

## Beschreibung
Implement theme switching with system preference detection.

## Akzeptanzkriterien
- [x] Detect system preference on load
- [x] Apply correct theme without flash
- [x] Toggle button to switch modes
- [x] Persist preference in localStorage
- [x] Smooth transition between themes
- [x] All components support both themes

## Technische Notizen
- Use next-themes or custom implementation
- Script in head to prevent flash
- CSS transitions for smooth switching

## Implementierungslog
- 2026-01-17: Teilweise implementiert
  - System detection: `src/app/layout.tsx` inline script
  - localStorage persistence: vorhanden
  - Dark mode CSS: alle Komponenten haben dark: variants
- 2026-01-17: Fertiggestellt
  - Hook: `src/hooks/useTheme.ts`
  - Toggle: `src/components/ui/ThemeToggle.tsx`
  - Position: oben rechts in `src/app/page.tsx`
