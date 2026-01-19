# POMO-092: Adaptive Quality + Visual Modes

> Phase 3 - Pragmatischer Fokus auf Device-Erkennung und Visual Modes

## User Story

**Als** Design-bewusster Benutzer,
**möchte ich** anpassbare visuelle Effekte und optimale Performance auf meinem Gerät,
**damit** die App sich wie eine Premium-Native-Anwendung anfühlt.

## Status: DONE

Implementiert am 2026-01-19

## Implementierte Features

### 1. Device Capability Detection
- Mobile-Erkennung via User Agent
- Hardware Concurrency Check (CPU-Kerne)
- Reduced Motion Preference Support
- Automatische Quality-Empfehlung

### 2. Visual Mode Selector
| Mode | Partikel | Noise | Burst | Beschreibung |
|------|----------|-------|-------|--------------|
| `minimal` | 0 | Ja | Nein | Nur Grain-Textur |
| `ambient` | 20 | Ja | Ja | Standard (volle Effekte) |
| `auto` | 10-20 | Ja | Adaptiv | Basierend auf Device |

### 3. Adaptive Partikelanzahl
- Desktop (8+ Kerne): 20 Partikel (high)
- Desktop (4-8 Kerne): 15 Partikel (medium)
- Mobile / Low-end (≤4 Kerne): 10 Partikel (low)
- Reduced Motion: Keine Animationen

### 4. Monochromes Farbschema
- Blaue Akzentfarbe entfernt
- Dark Mode: Weiß (#FFFFFF) als Akzent
- Light Mode: Schwarz (#171717) als Akzent
- Maximaler Kontrast bei allen interaktiven Elementen

### 5. Verbesserte Grain-Textur
- Blend Mode: `soft-light` (statt `overlay`)
- Opazität: 15% Dark / 8% Light
- Jetzt sichtbar auf schwarzem Hintergrund

## Acceptance Criteria (Erfüllt)

- [x] **Adaptive Quality**: Automatische Qualitätsreduzierung auf schwachen Geräten
- [x] **Visual Modes**: Minimal | Ambient | Auto funktionieren korrekt
- [x] **Mobile-Optimierung**: Reduzierte Partikelanzahl auf Mobile
- [x] **Monochrome Design**: Reines Schwarz-Weiß-Grau Farbschema
- [x] **Grain-Textur**: Sichtbar auf allen Hintergründen
- [x] **Settings UI**: Mode Selector in den Einstellungen

## Dateien

### Neue Dateien
- `src/lib/detectDevice.ts` - Device Capability Detection
- `src/hooks/useAdaptiveQuality.ts` - Quality + Mode State Hook

### Geänderte Dateien
- `src/contexts/AmbientEffectsContext.tsx` - Erweitert mit Mode/Quality
- `src/components/effects/AmbientEffects.tsx` - Mode-basierte Logik
- `src/components/effects/NoiseOverlay.tsx` - Verbesserte Sichtbarkeit
- `src/components/effects/ParticleBurst.tsx` - Light Mode Support
- `src/components/settings/VisualEffectsSettings.tsx` - Mode Selector UI
- `src/components/timer/TimerDisplay.tsx` - Monochrome Celebration
- `src/components/ui/Button.tsx` - Monochrome Button
- `src/app/globals.css` - Monochrome Styles
- `src/styles/design-tokens.ts` - Monochrome Colors
- `tailwind.config.js` - Monochrome Accent Colors

## Estimation

- **Ursprüngliche Größe:** XL (10-15 Stunden)
- **Tatsächlich:** M (3-4 Stunden) - Pragmatische Option A

## Dependencies

- POMO-090 (Dark Foundation) ✓
- POMO-091 (Ambient Effects) ✓

## Future Considerations (Nicht implementiert)

- WebGL Noise Shader
- ASCII Mode
- Parallax/3D Depth
- Motion Blur
- Audio-Reactive Visuals
