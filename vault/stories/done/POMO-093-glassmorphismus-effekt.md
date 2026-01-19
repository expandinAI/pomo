# POMO-093: Glasmorphismus UI-Effekt

**Status:** Done
**Story Points:** 2
**Completed:** 2026-01-19

## User Story

Als User möchte ich, dass UI-Elemente wie matte Glasflächen wirken,
durch die die Partikel-Animationen subtil hindurchschimmern,
um ein noch premium-wertigeres visuelles Erlebnis zu haben.

## Akzeptanzkriterien

- [x] Partikel fließen visuell "unter" SessionType und QuickTaskInput
- [x] Glaseffekt mit backdrop-blur
- [x] Funktioniert in Dark und Light Mode
- [x] Kein Performance-Impact (GPU-beschleunigt)

## Technische Umsetzung

### Z-Index Hierarchie (neu)

| Layer | Z-Index | Komponente |
|-------|---------|------------|
| Top | z-50 | NoiseOverlay |
| | z-40 | Vignette |
| | z-20 | Glasflächen (SessionType, QuickTaskInput) |
| | z-10 | ParticleField, ParticleBurst |
| Bottom | z-0 | Background |

### Geänderte Dateien

- `src/components/effects/ParticleField.tsx` - z-30 → z-10
- `src/components/effects/ParticleBurst.tsx` - z-30 → z-10
- `src/components/timer/SessionType.tsx` - Glasmorphismus + z-20
- `src/components/task/QuickTaskInput.tsx` - Glasmorphismus + z-20

### Glasmorphismus-Styling

```css
/* Tailwind-Klassen */
relative z-20
bg-surface/70 light:bg-surface-dark/70
backdrop-blur-md
border border-white/[0.08] light:border-black/[0.05]
shadow-lg
```
