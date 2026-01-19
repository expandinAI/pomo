# POMO-094: Partikel pausieren statt neustarten

**Status:** Done
**Story Points:** 3
**Priority:** Medium
**Completed:** 2026-01-19

## User Story

Als User möchte ich, dass die Partikel beim Pausieren des Timers einfrieren und bei Fortsetzung von der gleichen Position weiterfliegen,
damit die visuelle Kontinuität erhalten bleibt und das Pause/Resume-Erlebnis flüssiger wirkt.

## Aktuelles Verhalten (vorher)

- Timer pausieren → Partikel stoppen abrupt (visualState → idle → Unmount)
- Timer fortsetzen → Partikel starten neu (von Anfangspositionen)
- Visueller "Bruch" beim Pause/Resume

## Gewünschtes Verhalten (implementiert)

- Timer pausieren → Partikel frieren an aktueller Position ein
- Timer fortsetzen → Partikel bewegen sich von eingefrorener Position weiter
- Nahtloser visueller Übergang

## Akzeptanzkriterien

- [x] Partikel frieren bei Pause an aktueller Position ein
- [x] Partikel setzen Bewegung bei Resume von gleicher Position fort
- [x] Kein visueller "Reset" beim Pause/Resume
- [x] Funktioniert für ParticleField (ParticleBurst zeigt sich nur bei Celebration)
- [x] Performance bleibt erhalten (keine Memory Leaks)

## Technische Notizen

### Betroffene Dateien

- `src/components/effects/ParticleField.tsx` - Added `isPaused` prop with `animationPlayState`
- `src/components/effects/AmbientEffects.tsx` - Passes `isPaused` to ParticleField
- `src/contexts/AmbientEffectsContext.tsx` - Added `isPaused` state and `setIsPaused` function
- `src/components/timer/Timer.tsx` - Updated visual effects sync to use `setParticlesPaused`

### Implementierung

1. **AmbientEffectsContext**: Added `isPaused` state mit `setIsPaused` callback
2. **ParticleField**: Added `isPaused` prop that controls CSS `animation-play-state: paused | running`
3. **Timer.tsx**: Modified visual effects sync:
   - Running: `setVisualState('focus'/'break')`, `setParticlesPaused(false)`
   - Paused: `setVisualState('focus'/'break')`, `setParticlesPaused(true)` (keeps particles visible but frozen)
   - Idle: `setVisualState('idle')`, `setParticlesPaused(false)`

### Lösung

CSS `animation-play-state: paused` freezes CSS animations in place without resetting them.
When resumed (`animation-play-state: running`), animations continue from where they stopped.
