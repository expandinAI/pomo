# POMO-024: Haptic Feedback System

**Status:** DONE
**Priority:** P1 - High
**Estimate:** 3 points
**Epic:** Premium Feel
**Labels:** `haptics`, `ux`, `mobile`

## Beschreibung
Kontextuelles Haptic Feedback via Web Vibration API für ein taktiles Premium-Erlebnis. Zurückhaltend eingesetzt - nur bei bedeutenden Aktionen.

## Akzeptanzkriterien
- [ ] Neuer Hook `useHaptics` erstellt
- [ ] Light tap (30ms) bei Session-Start
- [ ] Double tap (50ms+50ms) bei Pause
- [ ] Medium pulse (100ms) bei Session-Completion
- [ ] Heavy pulse (150ms) bei Skip-Action
- [ ] Haptics deaktivierbar in Settings
- [ ] Graceful degradation wenn API nicht verfügbar
- [ ] KEIN Haptic Feedback während Timer läuft (ablenkend)

## Haptic Patterns

| Aktion | Pattern | Intensität | Grund |
|--------|---------|------------|-------|
| Session Start | `[30]` | Light | Bestätigung |
| Pause | `[50, 30, 50]` | Light-Light | Doppel-Tap Gefühl |
| Resume | `[30]` | Light | Bestätigung |
| Session Complete | `[100]` | Medium | Erfolg |
| Skip/Reset | `[150]` | Heavy | Reversible Aktion |

## Hook Implementation

```typescript
// src/lib/useHaptics.ts
import { useCallback, useEffect, useState } from 'react';

type HapticPattern = 'light' | 'double' | 'medium' | 'heavy';

const patterns: Record<HapticPattern, number[]> = {
  light: [30],
  double: [50, 30, 50],
  medium: [100],
  heavy: [150],
};

export function useHaptics() {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    setIsSupported('vibrate' in navigator);
    // Load preference from localStorage
    const saved = localStorage.getItem('pomo_haptics_enabled');
    if (saved !== null) {
      setIsEnabled(saved === 'true');
    }
  }, []);

  const vibrate = useCallback((pattern: HapticPattern) => {
    if (!isSupported || !isEnabled) return;
    navigator.vibrate(patterns[pattern]);
  }, [isSupported, isEnabled]);

  const toggle = useCallback(() => {
    setIsEnabled(prev => {
      const next = !prev;
      localStorage.setItem('pomo_haptics_enabled', String(next));
      return next;
    });
  }, []);

  return { vibrate, isSupported, isEnabled, toggle };
}
```

## Integration Points

### Timer.tsx
```typescript
const { vibrate } = useHaptics();

// Bei Session Start
const handleStart = () => {
  vibrate('light');
  // ...existing logic
};

// Bei Pause
const handlePause = () => {
  vibrate('double');
  // ...existing logic
};

// Bei Completion
useEffect(() => {
  if (isComplete) {
    vibrate('medium');
  }
}, [isComplete]);
```

### Settings Integration
- Toggle in TimerSettings Modal
- Label: "Haptic Feedback"
- Subtext: "Vibration bei Aktionen (nur Mobile)"
- Nur anzeigen wenn `isSupported === true`

## Dateien
- `src/lib/useHaptics.ts` (NEU)
- `src/components/timer/Timer.tsx` (MODIFIZIEREN)
- `src/components/timer/TimerControls.tsx` (MODIFIZIEREN)
- `src/components/settings/TimerSettings.tsx` (MODIFIZIEREN)

## Browser Support
- Chrome Android: Ja
- Safari iOS: Nein (kein Vibration API)
- Desktop: Nein (kein Vibration)

**Graceful Degradation:** Feature wird nur auf unterstützten Geräten angezeigt.

## Testing
- [ ] Test auf Android Chrome
- [ ] Test Toggle in Settings
- [ ] Verify keine Vibration während Timer läuft
- [ ] Verify graceful degradation auf Desktop/iOS
