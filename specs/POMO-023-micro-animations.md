# POMO-023: Micro-Animations

**Status:** DONE
**Priority:** P1 - High
**Estimate:** 5 points
**Epic:** Premium Feel
**Labels:** `animation`, `ux`, `polish`

## Beschreibung
Verfeinerte Micro-Animationen für ein "lebendiges" Premium-Gefühl. Jede Animation soll subtil, aber spürbar sein - nicht ablenkend, sondern erdend.

## Akzeptanzkriterien
- [ ] Timer-Tick Puls: Subtiler Opacity-Puls jede Sekunde
- [ ] Session-Übergang: Smooth Crossfade zwischen Work/Break
- [ ] Completion Animation: Sanfte Expand/Contract statt hartem Wechsel
- [ ] Button Hover/Press: 150ms Spring-Animation
- [ ] Alle Animationen respektieren `prefers-reduced-motion`
- [ ] Performance: Keine Jank, 60fps

## Technische Details

### Timer-Tick Animation
```typescript
// Subtiler Pulse alle Sekunde
const tickVariants = {
  tick: {
    opacity: [1, 0.85, 1],
    transition: { duration: 1, ease: "easeInOut" }
  }
};
```

### Session-Übergang
```typescript
// Crossfade mit Farbwechsel
const sessionTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.02 },
  transition: { duration: 0.3, type: "spring", stiffness: 300 }
};
```

### Completion Celebration (Verbesserung)
- Aktuelle Glow-Animation beibehalten
- Zusätzlich: Sanfte Scale-Animation (1 → 1.02 → 1)
- Timing: 500ms für "ceremonial" Moment

### Button Feedback
```typescript
const buttonVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 400, damping: 17 }
};
```

## Animation Timing Guide
| Kategorie | Dauer | Verwendung |
|-----------|-------|------------|
| Fast | 150ms | Button feedback, hover states |
| Normal | 300ms | Transitions, mode switches |
| Slow | 500ms | Celebrations, ceremonial moments |

## Dateien
- `src/components/timer/TimerDisplay.tsx` (MODIFIZIEREN) - Tick animation
- `src/components/timer/Timer.tsx` (MODIFIZIEREN) - Session transitions
- `src/components/ui/Button.tsx` (MODIFIZIEREN) - Hover/press animations
- `src/lib/design-tokens.ts` (MODIFIZIEREN) - Animation tokens hinzufügen

## Reduced Motion Support
```typescript
const prefersReducedMotion = useReducedMotion();

// Bei reduced motion: keine Animation, sofortige Übergänge
const transition = prefersReducedMotion
  ? { duration: 0 }
  : { type: "spring", stiffness: 400 };
```

## Testing
- [ ] Visueller Test in Chrome DevTools (60fps)
- [ ] Test mit `prefers-reduced-motion: reduce`
- [ ] Test auf Mobile (Touch feedback)
- [ ] Lighthouse Performance Score bleibt 95+
