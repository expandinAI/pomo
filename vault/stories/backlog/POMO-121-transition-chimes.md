---
type: story
status: backlog
priority: p0
effort: 3
feature: sound-design-2
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [sound, chimes, transitions, emotional, p0]
---
Vielen Dank! 
# POMO-121: Transition Chimes – Klänge des Übergangs

## User Story

> Als **Particle-Nutzer**
> möchte ich **dezente, emotionale Klänge bei Session-Übergängen hören**,
> damit **ich sanft aus meinem Flow geholt werde und den Moment feiern kann**.

## Kontext

Link zum Feature: [[features/sound-design-2]]

Abhängigkeit: [[stories/backlog/POMO-120-sound-engine]]

Die Transition Chimes sind das Herzstück des Sound Designs. Sie markieren die wichtigsten Momente:
- **Session Start:** "Es geht los. Du schaffst das."
- **Session End:** "Geschafft! Sei stolz."
- **Pause Start:** "Zeit zum Atmen."
- **Pause End:** "Bereit für mehr?"
- **Warning:** "Gleich ist es soweit." (2 Minuten vor Ende)

Jeder Klang ist ein Mini-Moment der Anerkennung.

## Akzeptanzkriterien

### Session Start Chime
- [ ] **Given** Sounds sind aktiviert, **When** eine Session startet, **Then** spielt der Start-Chime
- [ ] **Given** der Start-Chime, **When** er spielt, **Then** ist er aufsteigend und motivierend
- [ ] **Given** der Start-Chime, **When** er endet, **Then** dauert er ca. 1.5 Sekunden

### Session End Chime
- [ ] **Given** eine Session endet, **When** der Timer bei 0:00 ist, **Then** spielt der End-Chime
- [ ] **Given** der End-Chime, **When** er spielt, **Then** klingt er feierlich und warm
- [ ] **Given** der End-Chime, **When** er spielt, **Then** ist er der "reichste" aller Chimes

### Pause Chimes
- [ ] **Given** eine Pause startet, **When** der Break-Timer beginnt, **Then** spielt der Pause-Start-Chime
- [ ] **Given** eine Pause endet, **When** ich wieder arbeite, **Then** spielt der Pause-End-Chime
- [ ] **Given** die Pause-Chimes, **When** sie spielen, **Then** sind sie sanfter als Session-Chimes

### Warning Chime
- [ ] **Given** Sounds sind aktiviert, **When** 2 Minuten vor Session-Ende, **Then** spielt der Warning-Chime
- [ ] **Given** der Warning-Chime, **When** er spielt, **Then** ist er subtil und nicht störend
- [ ] **Given** der Warning-Chime, **When** der User in Deep Focus ist, **Then** holt er ihn sanft zurück

### Einstellungen
- [ ] **Given** die Sound-Settings, **When** ich Chimes deaktiviere, **Then** spielen keine Transition-Sounds
- [ ] **Given** die Chime-Lautstärke, **When** ich sie ändere, **Then** sind alle Chimes entsprechend lauter/leiser

## Technische Details

### Chime Types

```typescript
// src/lib/sound/types.ts

export type ChimeType =
  | 'session-start'
  | 'session-end'
  | 'pause-start'
  | 'pause-end'
  | 'warning';

export interface ChimeConfig {
  file: string;
  volume: number;      // Default volume (0-1)
  fadeIn?: number;     // ms
  fadeOut?: number;    // ms
  delay?: number;      // ms before playing
}

export const CHIME_CONFIG: Record<ChimeType, ChimeConfig> = {
  'session-start': {
    file: '/sounds/chimes/session-start.mp3',
    volume: 0.7,
    fadeIn: 100,
  },
  'session-end': {
    file: '/sounds/chimes/session-end.mp3',
    volume: 0.8,
    fadeIn: 100,
  },
  'pause-start': {
    file: '/sounds/chimes/pause-start.mp3',
    volume: 0.5,
    fadeIn: 50,
  },
  'pause-end': {
    file: '/sounds/chimes/pause-end.mp3',
    volume: 0.6,
    fadeIn: 50,
  },
  'warning': {
    file: '/sounds/chimes/warning.mp3',
    volume: 0.4,
    fadeIn: 200,
    fadeOut: 500,
  },
};
```

### Chime Service

```typescript
// src/lib/sound/chime-service.ts

import { getSoundEngine } from './index';
import { ChimeType, CHIME_CONFIG } from './types';
import { useSoundSettings } from './use-sound-settings';

export class ChimeService {
  private engine = getSoundEngine();
  private preloaded = false;

  // Preload alle Chimes beim App-Start
  async preload(): Promise<void> {
    if (this.preloaded) return;

    const promises = Object.values(CHIME_CONFIG).map(config =>
      this.engine.loadSound(config.file).catch(err => {
        console.warn(`Failed to preload chime: ${config.file}`, err);
      })
    );

    await Promise.all(promises);
    this.preloaded = true;
  }

  // Chime abspielen
  async play(type: ChimeType): Promise<void> {
    const settings = useSoundSettings.getState();

    if (!settings.chimesEnabled) return;
    if (settings.masterMuted) return;

    const config = CHIME_CONFIG[type];
    const volume = config.volume * settings.chimeVolume;

    await this.engine.play(config.file, {
      volume,
      fadeIn: config.fadeIn,
      fadeOut: config.fadeOut,
    });
  }
}

// Singleton
let chimeService: ChimeService | null = null;

export function getChimeService(): ChimeService {
  if (!chimeService) {
    chimeService = new ChimeService();
  }
  return chimeService;
}
```

### Integration mit Timer

```typescript
// src/hooks/use-timer.ts (erweitert)

import { getChimeService } from '@/lib/sound/chime-service';

export function useTimer() {
  const chimes = getChimeService();

  const startSession = useCallback(async () => {
    // ... existing logic ...
    await chimes.play('session-start');
  }, []);

  const endSession = useCallback(async () => {
    // ... existing logic ...
    await chimes.play('session-end');
  }, []);

  const startPause = useCallback(async () => {
    // ... existing logic ...
    await chimes.play('pause-start');
  }, []);

  const endPause = useCallback(async () => {
    // ... existing logic ...
    await chimes.play('pause-end');
  }, []);

  // Warning 2 Minuten vor Ende
  useEffect(() => {
    if (remainingSeconds === 120 && isRunning && !isPaused) {
      chimes.play('warning');
    }
  }, [remainingSeconds, isRunning, isPaused]);

  // ...
}
```

### React Hook für Chimes

```typescript
// src/lib/sound/use-chimes.ts

import { useCallback, useEffect } from 'react';
import { getChimeService } from './chime-service';
import { ChimeType } from './types';

export function useChimes() {
  const service = getChimeService();

  // Preload beim Mount
  useEffect(() => {
    service.preload();
  }, []);

  const playChime = useCallback(async (type: ChimeType) => {
    await service.play(type);
  }, [service]);

  return { playChime };
}
```

### Sound Files Spezifikation

```
public/
└── sounds/
    └── chimes/
        ├── session-start.mp3    # 1.5s, aufsteigend, warm
        ├── session-end.mp3      # 2.0s, feierlich, reich
        ├── pause-start.mp3      # 1.0s, sanft, entspannend
        ├── pause-end.mp3        # 1.2s, erfrischend, motivierend
        └── warning.mp3          # 0.8s, subtil, nicht störend
```

### Betroffene Dateien

```
src/
├── lib/
│   └── sound/
│       ├── types.ts            # ChimeType, ChimeConfig
│       ├── chime-service.ts    # ChimeService
│       └── use-chimes.ts       # React Hook
├── hooks/
│   └── use-timer.ts            # Integration
└── public/
    └── sounds/
        └── chimes/             # Audio Files
```

## Sound Design Spezifikation

### Session Start Chime
```
Charakter: Aufsteigend, hoffnungsvoll, "Aufbruch"
Tonalität: Dur, aufsteigende Terz oder Quinte
Instrumente: Glockenspiel + leichter Pad
Dauer: 1.5 Sekunden
Fade: 100ms in, natürliches Ausklingen
```

### Session End Chime
```
Charakter: Feierlich, warm, "Erfüllung"
Tonalität: Voller Dur-Akkord, leichte Terz am Ende
Instrumente: Tiefere Glocken + warmer Synth-Pad + leichte Obertöne
Dauer: 2.0 Sekunden
Fade: 100ms in, 500ms out
Der "reichste" Klang – du hast es verdient!
```

### Pause Start Chime
```
Charakter: Sanft, entspannend, "Loslassen"
Tonalität: Absteigend, ruhig
Instrumente: Sanfte Bells + Breath-artig
Dauer: 1.0 Sekunden
Fade: 50ms in, natürliches Ausklingen
```

### Pause End Chime
```
Charakter: Erfrischend, bereit, "Aufgewacht"
Tonalität: Aufsteigend, klarer als Session-Start
Instrumente: Helle Bells + kurzer Synth
Dauer: 1.2 Sekunden
Fade: 50ms in, natürliches Ausklingen
```

### Warning Chime
```
Charakter: Subtil, freundlich, "Heads up"
Tonalität: Neutral, nicht alarmierend
Instrumente: Einzelner weicher Ton
Dauer: 0.8 Sekunden
Fade: 200ms in, 500ms out
Wichtig: Nicht aus dem Flow reißen!
```

## Testing

### Manuell zu testen
- [ ] Session Start spielt Chime
- [ ] Session End spielt Chime
- [ ] Pause Start/End spielen Chimes
- [ ] Warning bei 2:00 verbleibend
- [ ] Chimes respektieren Lautstärke-Einstellung
- [ ] Chimes respektieren Mute
- [ ] Chimes respektieren "Chimes deaktiviert"
- [ ] Chimes klingen emotional richtig

### Automatisierte Tests

```typescript
describe('ChimeService', () => {
  let service: ChimeService;
  let mockEngine: jest.Mocked<SoundEngine>;

  beforeEach(() => {
    mockEngine = createMockSoundEngine();
    service = new ChimeService(mockEngine);
  });

  it('preloads all chimes', async () => {
    await service.preload();

    expect(mockEngine.loadSound).toHaveBeenCalledTimes(5);
    expect(mockEngine.loadSound).toHaveBeenCalledWith('/sounds/chimes/session-start.mp3');
    expect(mockEngine.loadSound).toHaveBeenCalledWith('/sounds/chimes/session-end.mp3');
  });

  it('plays chime with correct config', async () => {
    await service.play('session-start');

    expect(mockEngine.play).toHaveBeenCalledWith(
      '/sounds/chimes/session-start.mp3',
      expect.objectContaining({
        volume: expect.any(Number),
        fadeIn: 100,
      })
    );
  });

  it('does not play when chimesEnabled is false', async () => {
    useSoundSettings.setState({ chimesEnabled: false });

    await service.play('session-start');

    expect(mockEngine.play).not.toHaveBeenCalled();
  });

  it('respects chime volume setting', async () => {
    useSoundSettings.setState({ chimeVolume: 0.5 });

    await service.play('session-start');

    expect(mockEngine.play).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        volume: 0.35, // 0.7 * 0.5
      })
    );
  });
});

describe('Timer Chime Integration', () => {
  it('plays session-start on timer start', async () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.startSession();
    });

    expect(getChimeService().play).toHaveBeenCalledWith('session-start');
  });

  it('plays warning at 2 minutes remaining', async () => {
    const { result } = renderHook(() => useTimer());

    // Set timer to 2:00
    act(() => {
      result.current.setRemainingSeconds(120);
    });

    expect(getChimeService().play).toHaveBeenCalledWith('warning');
  });
});
```

## Definition of Done

- [ ] ChimeService implementiert
- [ ] Alle 5 Chime-Types definiert
- [ ] Timer-Integration (Start/End/Pause/Warning)
- [ ] Preloading beim App-Start
- [ ] Settings werden respektiert
- [ ] Placeholder-Sounds vorhanden (werden später ersetzt)
- [ ] Volume-Kontrolle funktioniert
- [ ] Tests geschrieben & grün
- [ ] Code reviewed

## Notizen

**Sound-Erstellung (POMO-125):**
- Audio-Files werden in separater Story erstellt
- Vorerst: Placeholder-Sounds (simple Tones)
- Später: Professionell produzierte Sounds (Endel-Qualität)

**Emotional Design:**
- Jeder Chime ist ein Moment der Anerkennung
- Kein Alarm, sondern eine sanfte Einladung
- Der End-Chime ist der wichtigste: "Du hast es geschafft!"

**Timing-Feinheiten:**
- Warning Chime: 2 Minuten vor Ende (konfigurierbar?)
- Chimes blockieren nicht den UI-Thread
- Bei schnellem Session-Wechsel: Kein Overlap

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
