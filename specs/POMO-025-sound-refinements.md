# POMO-025: Sound Refinements

**Status:** DONE
**Priority:** P1 - High
**Estimate:** 3 points
**Epic:** Premium Feel
**Labels:** `audio`, `ux`, `polish`

## Beschreibung
Verfeinerung der bestehenden 6 Sounds für ein noch "calmeres" Erlebnis. Hinzufügen von Volume-Control und Sound-Preview beim Auswählen.

## Akzeptanzkriterien
- [ ] Volume-Slider in Sound Settings (0-100%)
- [ ] Volume in localStorage gespeichert (`pomo_sound_volume`)
- [ ] Preview: Sound spielt kurz ab beim Hover/Select
- [ ] Debounced Preview (max 1x pro 500ms)
- [ ] "Calm" Review aller 6 Sounds (ggf. Frequenzen anpassen)
- [ ] Mute-Button/Option hinzufügen

## UI-Konzept

```
┌─────────────────────────────────────┐
│ Completion Sound                    │
├─────────────────────────────────────┤
│                                     │
│ Volume  ────●──────────────  75%    │
│                                     │
│ ┌─────────┐ ┌─────────┐            │
│ │ Default │ │  Soft   │            │
│ │  Chime  │ │  Gong   │            │
│ │   ✓     │ │         │            │
│ └─────────┘ └─────────┘            │
│                                     │
│ ┌─────────┐ ┌─────────┐            │
│ │  Bell   │ │Woodblock│            │
│ └─────────┘ └─────────┘            │
│                                     │
│ ┌─────────┐ ┌─────────┐            │
│ │ Singing │ │ Minimal │            │
│ │  Bowl   │ │  Beep   │            │
│ └─────────┘ └─────────┘            │
│                                     │
│ [ ] Mute all sounds                 │
│                                     │
└─────────────────────────────────────┘
```

## Sound "Calm" Review

Aktuelle Sounds überprüfen und ggf. anpassen:

| Sound | Aktuell | Anpassung |
|-------|---------|-----------|
| Default Chime | 523Hz + 659Hz | OK - bereits sanft |
| Soft Gong | Complex | Decay verlängern für mehr "Ruhe" |
| Bell | 880Hz | Frequenz senken auf 440Hz |
| Woodblock | Click-Sound | Weniger scharf, mehr "woody" |
| Singing Bowl | Multi-harmonic | OK - sehr calm |
| Minimal Beep | Simple sine | Fade-In hinzufügen |

## Hook Erweiterung

```typescript
// src/lib/useSoundSettings.ts erweitern
interface SoundSettings {
  sound: SoundType;
  volume: number; // 0-1
  muted: boolean;
}

export function useSoundSettings() {
  const [settings, setSettings] = useState<SoundSettings>({
    sound: 'default',
    volume: 0.75,
    muted: false,
  });

  // ... load/save to localStorage

  return {
    ...settings,
    setSound,
    setVolume,
    toggleMute,
  };
}
```

## useSound Hook Anpassung

```typescript
// src/lib/useSound.ts - Volume support
export function useSound() {
  const { volume, muted } = useSoundSettings();

  const play = useCallback((type: SoundType) => {
    if (muted) return;

    const ctx = new AudioContext();
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume; // Apply volume

    // ... rest of sound generation
  }, [volume, muted]);

  return { play };
}
```

## Preview Debouncing

```typescript
// In SoundSettings.tsx
const debouncedPreview = useMemo(
  () => debounce((sound: SoundType) => {
    playSound(sound);
  }, 500),
  [playSound]
);

const handleSoundHover = (sound: SoundType) => {
  debouncedPreview(sound);
};
```

## Dateien
- `src/lib/useSoundSettings.ts` (MODIFIZIEREN)
- `src/lib/useSound.ts` (MODIFIZIEREN)
- `src/components/settings/SoundSettings.tsx` (MODIFIZIEREN)

## Testing
- [ ] Volume-Slider funktioniert (0-100%)
- [ ] Preview spielt beim Hover
- [ ] Preview ist debounced (nicht bei schnellem Wechsel)
- [ ] Mute-Toggle funktioniert
- [ ] Settings werden gespeichert
- [ ] Sounds klingen "calm" und nicht schrill
