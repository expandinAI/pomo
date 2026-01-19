# POMO-094: Partikel pausieren statt neustarten

**Status:** Backlog
**Story Points:** 3
**Priority:** Medium

## User Story

Als User möchte ich, dass die Partikel beim Pausieren des Timers einfrieren und bei Fortsetzung von der gleichen Position weiterfliegen,
damit die visuelle Kontinuität erhalten bleibt und das Pause/Resume-Erlebnis flüssiger wirkt.

## Aktuelles Verhalten

- Timer pausieren → Partikel stoppen abrupt
- Timer fortsetzen → Partikel starten neu (von Anfangspositionen)
- Visueller "Bruch" beim Pause/Resume

## Gewünschtes Verhalten

- Timer pausieren → Partikel frieren an aktueller Position ein
- Timer fortsetzen → Partikel bewegen sich von eingefrorener Position weiter
- Nahtloser visueller Übergang

## Akzeptanzkriterien

- [ ] Partikel frieren bei Pause an aktueller Position ein
- [ ] Partikel setzen Bewegung bei Resume von gleicher Position fort
- [ ] Kein visueller "Reset" beim Pause/Resume
- [ ] Funktioniert für alle Partikel-Typen (ParticleField, ParticleBurst)
- [ ] Performance bleibt erhalten (keine Memory Leaks)

## Technische Notizen

### Betroffene Dateien

- `src/components/effects/ParticleField.tsx`
- `src/components/effects/ParticleBurst.tsx`
- `src/contexts/AmbientEffectsContext.tsx`

### Lösungsansatz

1. **Animation State erweitern**: `isPaused` Flag im AmbientEffectsContext
2. **Framer Motion**: `animate` vs `initial` State für Pause-Logik
3. **CSS Animation**: `animation-play-state: paused` für CSS-basierte Animationen

### Offene Fragen

- Wie verhält sich ParticleBurst (Celebration) beim Pausieren?
- Sollen Partikel bei längerem Pause langsam "verblassen"?
