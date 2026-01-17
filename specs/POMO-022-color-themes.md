# POMO-022: Color Themes

**Status:** DONE
**Priority:** P1 - High
**Estimate:** 3 points
**Epic:** Premium Features
**Labels:** `premium`, `design`, `customization`

## Beschreibung
4 Farb-Themes zur Personalisierung. Jedes Theme hat einen eigenen Accent-Farbton.

## Akzeptanzkriterien
- [x] 4 Theme-Optionen (Sunrise, Ocean, Forest, Midnight)
- [x] Smooth Transition beim Wechsel (via CSS custom properties)
- [x] Auswahl in localStorage gespeichert (`pomo_color_theme`)
- [x] Theme-Auswahl in Settings integriert
- [x] Funktioniert mit Dark/Light Mode
- [x] Alle UI-Elemente passen sich an (accent color)

## Theme-Optionen

| Theme | Accent | Light BG | Dark BG | Vibe |
|-------|--------|----------|---------|------|
| **Sunrise** (Default) | Teal #0D9488 | Stone-50 | Stone-950 | Calm, focused |
| **Ocean** | Blue #3B82F6 | Slate-50 | Slate-950 | Cool, professional |
| **Forest** | Emerald #10B981 | Neutral-50 | Neutral-950 | Natural, organic |
| **Midnight** | Violet #8B5CF6 | Zinc-50 | Zinc-950 | Creative, deep |

## Technische Notizen
- CSS Custom Properties für dynamische Farben
- Theme-Class auf `<html>` Element
- Tailwind Config erweitern oder CSS Vars nutzen
- Hook: `useColorTheme`
- Transition: 200ms auf Farbwechsel

## UI-Konzept
```
┌─────────────────────────────────────┐
│ Color Theme                         │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────┐ ┌─────────┐            │
│ │ Sunrise │ │  Ocean  │            │
│ │  🌅 ✓  │ │   🌊    │            │
│ └─────────┘ └─────────┘            │
│                                     │
│ ┌─────────┐ ┌─────────┐            │
│ │ Forest  │ │Midnight │            │
│ │   🌲    │ │   🌙    │            │
│ └─────────┘ └─────────┘            │
│                                     │
└─────────────────────────────────────┘
```

## CSS Variables
```css
:root {
  --color-accent: theme('colors.teal.500');
  --color-accent-hover: theme('colors.teal.600');
  --color-accent-light: theme('colors.teal.400');
}

.theme-ocean {
  --color-accent: theme('colors.blue.500');
  --color-accent-hover: theme('colors.blue.600');
  --color-accent-light: theme('colors.blue.400');
}
/* etc. */
```

## Dateien
- `src/styles/themes.ts` (NEU)
- `src/hooks/useColorTheme.ts` (NEU)
- `src/components/settings/ThemeSettings.tsx` (NEU)
- `src/styles/globals.css` (MODIFIZIEREN)
- `tailwind.config.js` (MODIFIZIEREN)

## Implementierungslog

### 2026-01-17 - Implementation Complete
- Created `src/styles/themes.ts` with 4 theme definitions
- Created `src/hooks/useColorTheme.ts` hook for theme management
- Created `src/components/settings/ThemeSettings.tsx` with grid UI
- Updated `src/app/globals.css` with CSS custom properties
- Updated `tailwind.config.js` to use CSS variables for accent colors
- Integrated ThemeSettings into TimerSettings modal
- Theme initializes on page load via useColorTheme hook
- Build size: 142 kB (within target)
