# POMO-019: Custom Timer Lengths

**Status:** DONE
**Priority:** P0 - Urgent
**Estimate:** 2 points
**Epic:** Premium Features
**Labels:** `premium`, `settings`, `customization`

## Beschreibung
Nutzer können die Timer-Längen für Work/Short Break/Long Break anpassen. Enthält Presets für verschiedene Arbeitsstile.

## Akzeptanzkriterien
- [x] Slider oder Input für Work Session (1-90 min)
- [x] Slider oder Input für Short Break (1-30 min)
- [x] Slider oder Input für Long Break (1-60 min)
- [x] Preset: Classic (25/5/15)
- [x] Preset: Deep Work (50/10/30)
- [x] Preset: Sprint (15/3/10)
- [x] Einstellungen in localStorage persistiert
- [x] Settings-Button in der UI (Gear Icon)
- [x] Settings Modal/Panel mit Animation

## Technische Notizen
- Hook: `useTimerSettings` für State Management
- Component: `TimerSettings.tsx` für UI
- Integration in `Timer.tsx` - liest von Hook
- Presets als Konstanten definieren
- Range Input mit custom Styling (Tailwind)

## UI-Konzept
```
┌─────────────────────────────────────┐
│ Timer Settings              [×]    │
├─────────────────────────────────────┤
│                                     │
│ Work Session                        │
│ [●━━━━━━━━━━━━━━━━━━━] 25 min      │
│                                     │
│ Short Break                         │
│ [━●━━━━━━━━━━━━━━━━━━]  5 min      │
│                                     │
│ Long Break                          │
│ [━━━●━━━━━━━━━━━━━━━━] 15 min      │
│                                     │
│ ┌─────────┐ ┌─────────┐ ┌────────┐ │
│ │ Classic │ │Deep Work│ │ Sprint │ │
│ └─────────┘ └─────────┘ └────────┘ │
│                                     │
└─────────────────────────────────────┘
```

## Dateien
- `src/hooks/useTimerSettings.ts` (NEU)
- `src/components/settings/TimerSettings.tsx` (NEU)
- `src/components/timer/Timer.tsx` (MODIFIZIEREN)
- `src/app/page.tsx` (MODIFIZIEREN - Settings Button)

## Implementierungslog
- 2026-01-17: Fertiggestellt
  - Hook: `src/hooks/useTimerSettings.ts`
  - Component: `src/components/settings/TimerSettings.tsx`
  - Timer.tsx: Refactored für dynamische Durations
  - Settings-Button: Oben rechts neben Theme-Toggle
  - Presets: Classic, Deep Work, Sprint
  - Slider: Range-Input mit Tailwind Styling
  - localStorage: Persistenz mit `pomo_timer_settings` key
