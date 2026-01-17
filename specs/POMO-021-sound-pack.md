# POMO-021: Premium Sound Pack

**Status:** DONE
**Priority:** P1 - High
**Estimate:** 2 points
**Epic:** Premium Features
**Labels:** `premium`, `audio`, `customization`

## Beschreibung
6 verschiedene Completion-Sounds zur Auswahl. Preview beim Auswählen. Auswahl wird persistiert.

## Akzeptanzkriterien
- [x] 6 verschiedene Sound-Optionen
- [x] Preview beim Klick auf Sound
- [x] Visueller Indikator für aktiven Sound
- [x] Auswahl in localStorage gespeichert
- [x] Sound-Auswahl in Settings integriert
- [x] Alle Sounds <50KB pro Datei (Web Audio API = 0KB externe Dateien)

## Sound-Optionen
1. **Default** - Aktueller Sound (Soft Chime)
2. **Soft** - Sanfter Gong
3. **Bell** - Klare Glocke
4. **Woodblock** - Holzblock-Klang
5. **Bowl** - Singing Bowl
6. **Minimal** - Kurzer Beep

## Technische Notizen
- Sounds in `public/sounds/`
- Format: MP3 (beste Kompatibilität)
- Bitrate: 128kbps ausreichend
- Hook: `useSoundSettings`
- Integration mit bestehendem Audio-System

## UI-Konzept
```
┌─────────────────────────────────────┐
│ Completion Sound                    │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │🔊Default│ │  Soft   │ │  Bell   ││
│ │  ✓     │ │         │ │         ││
│ └─────────┘ └─────────┘ └─────────┘│
│                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │Woodblock│ │  Bowl   │ │ Minimal ││
│ │         │ │         │ │         ││
│ └─────────┘ └─────────┘ └─────────┘│
│                                     │
│ [▶ Preview]                         │
└─────────────────────────────────────┘
```

## Dateien
- `public/sounds/chime-default.mp3` (EXISTIERT)
- `public/sounds/chime-soft.mp3` (NEU)
- `public/sounds/chime-bell.mp3` (NEU)
- `public/sounds/chime-woodblock.mp3` (NEU)
- `public/sounds/chime-bowl.mp3` (NEU)
- `public/sounds/chime-minimal.mp3` (NEU)
- `src/hooks/useSoundSettings.ts` (NEU)
- `src/components/settings/SoundSettings.tsx` (NEU)

## Implementierungslog
- 2026-01-17: Fertiggestellt
  - Sounds: Web Audio API Synthese statt MP3 Dateien
    - Default: Zwei-Ton C5→E5 Chime
    - Soft: Gong mit Obertönen (G3, G4, G5)
    - Bell: Klare Glocke mit Harmonischen
    - Woodblock: Perkussiver Klick mit Bandpass-Filter
    - Bowl: Singing Bowl mit Frequency Wobble
    - Minimal: Kurzer 800Hz Beep
  - Hook: `src/hooks/useSoundSettings.ts`
  - Component: `src/components/settings/SoundSettings.tsx`
  - Integration: In TimerSettings Modal
  - localStorage Key: `pomo_sound_settings`
  - Keine externen Dateien = kleiner Bundle
