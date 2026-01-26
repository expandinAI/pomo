---
type: story
status: backlog
priority: p2
effort: 3
feature: "[[features/focus-enhancement]]"
created: 2026-01-25
updated: 2026-01-25
done_date: null
tags: [sounds, ambient, focus, tide-learning, p2]
---

# POMO-152: Ambient Sounds (Optional)

## User Story

> Als **Deep-Work-Nutzer**
> möchte ich **optionale Ambient-Sounds während der Session**,
> damit **ich mich besser konzentrieren kann (wenn ich das möchte)**.

## Kontext

Link zum Feature: [[features/focus-enhancement]]

**Tide-Learning:** Tide hat ein umfangreiches Sound-Ökosystem, das Nutzer lieben. Aber: Es ist zu komplex für Particle.

**Particle-Philosophie:**
- **Minimal, nicht maximal** – 4-5 Sounds, nicht 20
- **Opt-In, nicht Opt-Out** – Default ist Stille
- **Keyboard-First** – Cmd+M statt UI-Klick
- **Hochwertig** – Lieber 4 gute als 20 mittelmäßige

## Design-Prinzipien

1. **Default: Stille** – Sounds müssen aktiviert werden
2. **Keyboard-First** – Schnelle Toggle-Möglichkeit
3. **Minimal Selection** – Wenige, aber gute Sounds
4. **Non-Intrusive** – Sound stoppt/pausiert mit Timer

## Akzeptanzkriterien

### Sound-Auswahl

- [ ] **Given** Settings/Focus, **When** Sounds, **Then** 4-5 Optionen verfügbar
- [ ] **Given** Sound-Optionen, **When** Liste, **Then** Rain, Café, White Noise, Fireplace
- [ ] **Given** Sound, **When** ausgewählt, **Then** spielt während Session
- [ ] **Given** Default, **When** neue Installation, **Then** Sound ist OFF

### Keyboard-Control

- [ ] **Given** Session aktiv, **When** `Cmd+M`, **Then** Toggle Sound On/Off
- [ ] **Given** Sound aktiv, **When** `Cmd+Shift+M`, **Then** Cycle zum nächsten Sound
- [ ] **Given** Command Palette, **When** "sound", **Then** Sound-Optionen gelistet

### Timer-Integration

- [ ] **Given** Sound aktiv, **When** Session pausiert, **Then** Sound pausiert
- [ ] **Given** Sound aktiv, **When** Session beendet, **Then** Sound stoppt (Fade-Out)
- [ ] **Given** Break beginnt, **When** Sound war aktiv, **Then** Sound läuft weiter (optional)

### Volume Control

- [ ] **Given** Sound aktiv, **When** Volume Slider, **Then** Lautstärke anpassbar
- [ ] **Given** Volume eingestellt, **When** nächste Session, **Then** Volume wird erinnert

### UI (Minimal)

- [ ] **Given** Timer-View, **When** Sound aktiv, **Then** dezentes Icon sichtbar
- [ ] **Given** Sound-Icon, **When** Klick, **Then** Sound-Picker öffnet
- [ ] **Given** Sound-Picker, **When** Design, **Then** Minimalistisch, nicht überladen

## Technische Details

### Sound-Optionen

```typescript
interface AmbientSound {
  id: 'rain' | 'cafe' | 'white-noise' | 'fireplace' | 'silence';
  name: string;
  icon: string;
  file: string;  // Audio file path
}

const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'silence', name: 'Stille', icon: '🔇', file: null },
  { id: 'rain', name: 'Regen', icon: '🌧', file: '/sounds/rain.mp3' },
  { id: 'cafe', name: 'Café', icon: '☕', file: '/sounds/cafe.mp3' },
  { id: 'white-noise', name: 'White Noise', icon: '📻', file: '/sounds/white-noise.mp3' },
  { id: 'fireplace', name: 'Kaminfeuer', icon: '🔥', file: '/sounds/fireplace.mp3' },
];
```

### Keyboard Shortcuts

```typescript
const SOUND_SHORTCUTS = {
  'Cmd+M': 'toggleSound',           // Mute/Unmute
  'Cmd+Shift+M': 'cycleSound',      // Next Sound
};

// Command Palette Integration
const soundCommands = [
  { id: 'sound-toggle', name: 'Toggle Sound', shortcut: 'Cmd+M' },
  { id: 'sound-rain', name: 'Sound: Rain', action: () => setSound('rain') },
  { id: 'sound-cafe', name: 'Sound: Café', action: () => setSound('cafe') },
  { id: 'sound-white-noise', name: 'Sound: White Noise', action: () => setSound('white-noise') },
  { id: 'sound-fireplace', name: 'Sound: Fireplace', action: () => setSound('fireplace') },
  { id: 'sound-off', name: 'Sound: Off', action: () => setSound('silence') },
];
```

### Audio-Implementierung

```typescript
// Looping Audio mit Fade
const useAmbientSound = (soundId: string | null) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    if (!soundId || soundId === 'silence') {
      // Fade out
      fadeOut(audioRef.current);
      return;
    }

    const sound = AMBIENT_SOUNDS.find(s => s.id === soundId);
    if (!sound?.file) return;

    audioRef.current = new Audio(sound.file);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    // Fade in
    fadeIn(audioRef.current);

    return () => {
      fadeOut(audioRef.current);
    };
  }, [soundId]);

  return { volume, setVolume };
};

const fadeIn = (audio: HTMLAudioElement, duration = 1000) => {
  audio.volume = 0;
  audio.play();
  // Gradual volume increase
};

const fadeOut = (audio: HTMLAudioElement, duration = 500) => {
  // Gradual volume decrease, then pause
};
```

### UI Mockup

**Timer mit Sound-Indicator:**
```
┌─────────────────────────────────────┐
│                                     │
│            12:34                    │
│                                     │
│      Working on Feature             │
│                                     │
│                          🌧 ▪▪▪▪░   │  ← Sound aktiv + Volume
│                                     │
└─────────────────────────────────────┘
```

**Sound-Picker (Minimal):**
```
┌─────────────────────────────────────┐
│  Ambient Sound                      │
│  ─────────────────────────────────  │
│                                     │
│  ○ 🔇 Stille                        │
│  ● 🌧 Regen                    ✓    │
│  ○ ☕ Café                          │
│  ○ 📻 White Noise                   │
│  ○ 🔥 Kaminfeuer                    │
│                                     │
│  Volume ▪▪▪▪░░░░░░                  │
│                                     │
└─────────────────────────────────────┘
```

## Sound-Beschaffung

### Option A: Lizenzfreie Sounds

- [Freesound.org](https://freesound.org) – CC0 Sounds
- [Pixabay](https://pixabay.com/sound-effects/) – Royalty-free

### Option B: Premium Sounds

- [Epidemic Sound](https://www.epidemicsound.com) – Abo-Modell
- Eigene Aufnahmen

### Anforderungen

- Nahtlos loopbar (kein hörbarer Cut)
- Hochwertig (min. 128kbps)
- Dateigröße optimiert (~1-2 MB pro Sound)

## Nicht im Scope (v1)

- Sound-Mixing (mehrere Sounds gleichzeitig)
- Custom Sound Upload
- Sound-Schedule (verschiedene Sounds für Focus/Break)
- Binaural Beats
- Mehr als 5 Sounds

## Testing

### Manuell zu testen

- [ ] Default ist Stille
- [ ] Cmd+M togglet Sound
- [ ] Cmd+Shift+M wechselt Sound
- [ ] Sound pausiert mit Timer
- [ ] Sound fadet sanft ein/aus
- [ ] Volume wird gespeichert
- [ ] Sounds loopen ohne Cut

## Definition of Done

- [ ] 4 Ambient Sounds integriert (+ Silence)
- [ ] Keyboard Shortcuts (Cmd+M, Cmd+Shift+M)
- [ ] Command Palette Integration
- [ ] Volume Control mit Persistenz
- [ ] Fade In/Out bei Start/Stop
- [ ] Timer-Integration (Pause/Stop)
- [ ] Minimale UI (Icon + Picker)
- [ ] Code Review abgeschlossen
- [ ] **Prüffrage:** Fühlt es sich optional an, nicht aufdringlich?
