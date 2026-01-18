# POMO-026: Ambient Soundscapes

**Status:** DONE
**Priority:** P1 - High
**Estimate:** 8 points
**Epic:** Premium Features
**Labels:** `audio`, `premium`, `focus`

## Beschreibung
Optionale Ambient Sounds während Focus-Sessions. Curated Selection (5 Sounds), nicht überwältigend. Implementiert via Web Audio API (keine Audio-Files).

## Akzeptanzkriterien
- [ ] 5 Ambient Sound Optionen + "Silence" (default)
- [ ] Sounds nur während aktiver Session spielen
- [ ] Automatisches Fade-Out bei Pause/Completion (500ms)
- [ ] Automatisches Fade-In bei Resume (300ms)
- [ ] Volume-Control unabhängig von Completion-Sound
- [ ] Minimale UI (ein Icon-Button zum Öffnen)
- [ ] Ambient-Auswahl in localStorage gespeichert
- [ ] Web Audio API Synthese (kein Bundle-Size Impact)

## Sound-Optionen

| Sound | Technik | Beschreibung |
|-------|---------|--------------|
| **Silence** | - | Default, kein Ambient |
| **Rain** | Pink Noise + LFO | Sanfter, gleichmäßiger Regen |
| **Forest** | Layered Oscillators | Vögel + Wind + Blätter |
| **Café** | Brown Noise + Variations | Gedämpftes Murmeln |
| **White Noise** | White Noise Generator | Neutrales Rauschen |
| **Ocean** | Brown Noise + LFO | Wellenähnliches Auf/Ab |

## Web Audio Implementation

### Noise Generators
```typescript
// White Noise
function createWhiteNoise(ctx: AudioContext): AudioBufferSourceNode {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

// Pink Noise (für Rain)
function createPinkNoise(ctx: AudioContext): AudioNode {
  // Pink noise = white noise through lowpass filter
  const white = createWhiteNoise(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1000;
  white.connect(filter);
  return filter;
}

// Brown Noise (für Ocean/Café)
function createBrownNoise(ctx: AudioContext): AudioNode {
  // Deeper filtering
  const white = createWhiteNoise(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  white.connect(filter);
  return filter;
}
```

### LFO für Welleneffekt (Ocean)
```typescript
function createOceanSound(ctx: AudioContext): AudioNode {
  const brown = createBrownNoise(ctx);
  const gain = ctx.createGain();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();

  lfo.frequency.value = 0.1; // Slow wave
  lfoGain.gain.value = 0.3;

  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  brown.connect(gain);
  lfo.start();

  return gain;
}
```

## Hook: useAmbientSound

```typescript
// src/lib/useAmbientSound.ts
type AmbientType = 'silence' | 'rain' | 'forest' | 'cafe' | 'white' | 'ocean';

interface AmbientState {
  type: AmbientType;
  volume: number;
  isPlaying: boolean;
}

export function useAmbientSound() {
  const [state, setState] = useState<AmbientState>({
    type: 'silence',
    volume: 0.5,
    isPlaying: false,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const play = useCallback(() => {
    if (state.type === 'silence') return;
    // Create AudioContext and start sound
    // ... implementation
  }, [state.type]);

  const stop = useCallback(() => {
    // Fade out over 500ms, then stop
    if (gainRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current!.currentTime + 0.5);
    }
  }, []);

  const setType = useCallback((type: AmbientType) => {
    setState(prev => ({ ...prev, type }));
    localStorage.setItem('pomo_ambient_type', type);
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume }));
    localStorage.setItem('pomo_ambient_volume', String(volume));
    if (gainRef.current) {
      gainRef.current.gain.value = volume;
    }
  }, []);

  return { ...state, play, stop, setType, setVolume };
}
```

## UI-Konzept

### Icon Button (Hauptseite)
```
[ 🔊 ] ← Öffnet Ambient-Auswahl
```

### Ambient Panel
```
┌─────────────────────────────────────┐
│ Ambient Sound                       │
├─────────────────────────────────────┤
│                                     │
│ Volume  ────●──────────────  50%    │
│                                     │
│ ○ Silence (default)                 │
│ ○ Rain                              │
│ ● Forest                            │
│ ○ Café                              │
│ ○ White Noise                       │
│ ○ Ocean Waves                       │
│                                     │
│ Sounds play only during focus       │
│                                     │
└─────────────────────────────────────┘
```

## Integration mit Timer

```typescript
// In Timer.tsx
const { play, stop, isPlaying, type } = useAmbientSound();

// Bei Session Start
useEffect(() => {
  if (isRunning && mode === 'work') {
    play();
  }
}, [isRunning, mode]);

// Bei Pause/Complete
useEffect(() => {
  if (!isRunning || mode !== 'work') {
    stop();
  }
}, [isRunning, mode]);
```

## Dateien
- `src/lib/useAmbientSound.ts` (NEU)
- `src/lib/ambientGenerators.ts` (NEU) - Noise/Sound generators
- `src/components/settings/AmbientSettings.tsx` (NEU)
- `src/components/timer/Timer.tsx` (MODIFIZIEREN)
- `src/app/page.tsx` (MODIFIZIEREN) - Ambient button hinzufügen

## Performance
- AudioContext nur bei Bedarf erstellen
- Sounds stoppen wenn Tab nicht sichtbar (Page Visibility API)
- Kein Bundle-Size Impact (alles Web Audio API)

## Testing
- [ ] Alle 5 Sounds spielen korrekt
- [ ] Fade-In/Out funktioniert
- [ ] Sound stoppt bei Pause
- [ ] Sound stoppt bei Tab-Wechsel (optional)
- [ ] Volume-Control funktioniert
- [ ] Settings werden gespeichert
- [ ] Kein Einfluss auf Bundle-Size
