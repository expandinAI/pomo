---
type: story
status: done
priority: p1
effort: 3
feature: sound-design-2
created: 2026-01-20
updated: 2026-01-20
done_date: 2026-01-29
tags: [sound, ambient, focus, atmosphere, p1]
---

# POMO-123: Ambient Sound System – Dein Klangteppich

## User Story

> Als **Particle-Nutzer**
> möchte ich **während meiner Sessions beruhigende Hintergrundklänge hören können**,
> damit **ich tiefer in meinen Flow eintauchen kann**.

## Kontext

Link zum Feature: [[features/sound-design-2]]

Abhängigkeiten:
- [[stories/backlog/POMO-120-sound-engine]]
- [[stories/backlog/POMO-122-sound-settings]]

Ambient Sounds sind der Klangteppich, der deine Arbeit begleitet. Keine Musik, keine Ablenkung – nur Atmosphäre. Wie Endel, aber minimalistischer: Ein paar sorgfältig kuratierte Soundscapes, die zu verschiedenen Arbeitsmodi passen.

**Priorität P1:** Wichtig für das vollständige Sound-Erlebnis, aber nach den Basics.

## Akzeptanzkriterien

### Ambient Auswahl
- [ ] **Given** die Settings, **When** ich zu Ambient scrolle, **Then** sehe ich 3-4 Ambient-Optionen
- [ ] **Given** die Ambient-Optionen, **When** ich eine wähle, **Then** startet sie mit Fade-In
- [ ] **Given** ein aktiver Ambient, **When** ich einen anderen wähle, **Then** crossfaden sie

### Verfügbare Sounds
- [ ] **Given** die Ambient-Optionen, **When** ich sie sehe, **Then** gibt es "Deep Focus" (drones)
- [ ] **Given** die Ambient-Optionen, **When** ich sie sehe, **Then** gibt es "Soft Rain" (Regen)
- [ ] **Given** die Ambient-Optionen, **When** ich sie sehe, **Then** gibt es "Night Mode" (minimalistisch)
- [ ] **Given** die Ambient-Optionen, **When** ich sie sehe, **Then** gibt es "White Noise"

### Session-Verknüpfung
- [ ] **Given** Ambient ist aktiv, **When** eine Session startet, **Then** spielt der Ambient weiter
- [ ] **Given** Ambient ist aktiv, **When** eine Pause startet, **Then** bleibt der Ambient
- [ ] **Given** "Nur in Sessions" ist an, **When** keine Session läuft, **Then** pausiert der Ambient

### Playback Control
- [ ] **Given** ein Ambient spielt, **When** ich Pause drücke, **Then** fadet er aus
- [ ] **Given** ein gepauseter Ambient, **When** ich Play drücke, **Then** fadet er ein
- [ ] **Given** ich ändere die Lautstärke, **When** ein Ambient spielt, **Then** ändert sich seine Lautstärke

### Looping
- [ ] **Given** ein Ambient, **When** er das Ende erreicht, **Then** loopt er nahtlos
- [ ] **Given** ein Loop, **When** ich genau hinhöre, **Then** ist kein Sprung hörbar

## Technische Details

### Ambient Types

```typescript
// src/lib/sound/ambient-types.ts

export interface AmbientSound {
  id: string;
  name: string;
  description: string;
  file: string;
  duration: number;      // Sekunden
  loopStart?: number;    // Optional: Loop-Startpunkt
  loopEnd?: number;      // Optional: Loop-Endpunkt
}

export const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    description: 'Tiefe Drone-Sounds für maximale Konzentration',
    file: '/sounds/ambient/deep-focus.mp3',
    duration: 300, // 5 Minuten
  },
  {
    id: 'soft-rain',
    name: 'Soft Rain',
    description: 'Sanfter Regen für entspanntes Arbeiten',
    file: '/sounds/ambient/soft-rain.mp3',
    duration: 600, // 10 Minuten
  },
  {
    id: 'night-mode',
    name: 'Night Mode',
    description: 'Minimale Klänge für späte Stunden',
    file: '/sounds/ambient/night-mode.mp3',
    duration: 300,
  },
  {
    id: 'white-noise',
    name: 'White Noise',
    description: 'Konstantes Rauschen zum Ausblenden',
    file: '/sounds/ambient/white-noise.mp3',
    duration: 60, // Kürzerer Loop
  },
];
```

### Ambient Service

```typescript
// src/lib/sound/ambient-service.ts

import { getSoundEngine, SoundInstance } from './index';
import { AMBIENT_SOUNDS, AmbientSound } from './ambient-types';
import { useSoundSettings } from './sound-settings';

export class AmbientService {
  private engine = getSoundEngine();
  private currentInstance: SoundInstance | null = null;
  private currentSoundId: string | null = null;
  private isPaused: boolean = false;

  // Ambient starten
  async play(soundId: string): Promise<void> {
    const settings = useSoundSettings.getState();
    if (!settings.ambientEnabled || settings.masterMuted) return;

    const sound = AMBIENT_SOUNDS.find(s => s.id === soundId);
    if (!sound) return;

    // Crossfade wenn bereits einer spielt
    if (this.currentInstance && this.currentSoundId !== soundId) {
      await this.crossfadeTo(sound, settings.ambientVolume);
    } else if (!this.currentInstance) {
      await this.startFresh(sound, settings.ambientVolume);
    }

    this.currentSoundId = soundId;
    useSoundSettings.setState({ ambientSound: soundId });
  }

  // Frischer Start mit Fade-In
  private async startFresh(sound: AmbientSound, volume: number): Promise<void> {
    this.currentInstance = await this.engine.play(sound.file, {
      volume,
      loop: true,
      fadeIn: 2000, // 2 Sekunden Fade-In
    });
  }

  // Crossfade zwischen Sounds
  private async crossfadeTo(newSound: AmbientSound, volume: number): Promise<void> {
    const oldInstance = this.currentInstance;

    // Neuen Sound starten (leise)
    this.currentInstance = await this.engine.play(newSound.file, {
      volume: 0,
      loop: true,
    });

    // Crossfade über 2 Sekunden
    const duration = 2000;
    const steps = 20;
    const stepDuration = duration / steps;

    for (let i = 1; i <= steps; i++) {
      await new Promise(r => setTimeout(r, stepDuration));

      const progress = i / steps;
      oldInstance?.setVolume(volume * (1 - progress));
      this.currentInstance?.setVolume(volume * progress);
    }

    oldInstance?.stop();
  }

  // Pause mit Fade-Out
  async pause(): Promise<void> {
    if (!this.currentInstance || this.isPaused) return;

    await this.currentInstance.fadeOut(1000);
    this.isPaused = true;
  }

  // Resume mit Fade-In
  async resume(): Promise<void> {
    if (!this.currentSoundId || !this.isPaused) return;

    await this.play(this.currentSoundId);
    this.isPaused = false;
  }

  // Stoppen
  stop(): void {
    this.currentInstance?.fadeOut(1000);
    this.currentInstance = null;
    this.currentSoundId = null;
    useSoundSettings.setState({ ambientSound: null });
  }

  // Volume ändern
  setVolume(volume: number): void {
    this.currentInstance?.setVolume(volume);
  }

  // Aktueller Status
  get isPlaying(): boolean {
    return this.currentInstance !== null && !this.isPaused;
  }

  get currentSound(): string | null {
    return this.currentSoundId;
  }
}

// Singleton
let ambientService: AmbientService | null = null;

export function getAmbientService(): AmbientService {
  if (!ambientService) {
    ambientService = new AmbientService();
  }
  return ambientService;
}
```

### Ambient UI Component

```typescript
// src/components/settings/AmbientSettings.tsx

import { useSoundSettings } from '@/lib/sound/sound-settings';
import { getAmbientService } from '@/lib/sound/ambient-service';
import { AMBIENT_SOUNDS } from '@/lib/sound/ambient-types';

export function AmbientSettings() {
  const {
    ambientEnabled,
    ambientVolume,
    ambientSound,
    setAmbientEnabled,
    setAmbientVolume,
  } = useSoundSettings();

  const ambient = getAmbientService();

  const handleSoundSelect = async (soundId: string) => {
    if (ambientSound === soundId) {
      // Toggle off
      ambient.stop();
    } else {
      // Switch to new sound
      await ambient.play(soundId);
    }
  };

  const handleVolumeChange = (volume: number) => {
    setAmbientVolume(volume);
    ambient.setVolume(volume);
  };

  return (
    <div className="ambient-settings">
      <div className="setting-row">
        <div className="setting-label">
          <span className="setting-title">Ambient Sounds</span>
          <span className="setting-description">
            Hintergrundklänge für tieferen Fokus
          </span>
        </div>
        <Toggle
          checked={ambientEnabled}
          onChange={(enabled) => {
            setAmbientEnabled(enabled);
            if (!enabled) ambient.stop();
          }}
        />
      </div>

      {ambientEnabled && (
        <>
          <div className="ambient-grid">
            {AMBIENT_SOUNDS.map((sound) => (
              <button
                key={sound.id}
                className={cn(
                  'ambient-option',
                  ambientSound === sound.id && 'active'
                )}
                onClick={() => handleSoundSelect(sound.id)}
              >
                <span className="ambient-name">{sound.name}</span>
                <span className="ambient-description">
                  {sound.description}
                </span>
                {ambientSound === sound.id && (
                  <div className="ambient-playing">
                    <SoundWaveIcon />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="setting-row nested">
            <div className="setting-label">
              <span className="setting-title">Ambient-Lautstärke</span>
            </div>
            <Slider
              value={ambientVolume}
              onChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.05}
            />
          </div>
        </>
      )}
    </div>
  );
}
```

### Ambient Grid Styling

```css
/* src/components/settings/ambient-settings.css */

.ambient-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 16px 0;
}

.ambient-option {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.ambient-option:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.ambient-option.active {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

.ambient-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 4px;
}

.ambient-description {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.ambient-playing {
  position: absolute;
  top: 12px;
  right: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* Animated Sound Wave Icon */
.sound-wave-icon {
  display: flex;
  gap: 2px;
  height: 16px;
  align-items: flex-end;
}

.sound-wave-icon span {
  width: 3px;
  background: currentColor;
  border-radius: 1px;
  animation: wave 1s ease-in-out infinite;
}

.sound-wave-icon span:nth-child(1) { animation-delay: 0s; }
.sound-wave-icon span:nth-child(2) { animation-delay: 0.2s; }
.sound-wave-icon span:nth-child(3) { animation-delay: 0.4s; }

@keyframes wave {
  0%, 100% { height: 4px; }
  50% { height: 16px; }
}
```

### Betroffene Dateien

```
src/
├── lib/
│   └── sound/
│       ├── ambient-types.ts
│       └── ambient-service.ts
├── components/
│   └── settings/
│       ├── AmbientSettings.tsx
│       └── ambient-settings.css
└── public/
    └── sounds/
        └── ambient/
            ├── deep-focus.mp3
            ├── soft-rain.mp3
            ├── night-mode.mp3
            └── white-noise.mp3
```

## UI/UX

### Ambient Settings Bereich

```
┌───────────────────────────────────────────────────────────────────┐
│  Ambient Sounds                                       [●      ]   │
│  Hintergrundklänge für tieferen Fokus                            │
│                                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐                │
│  │  Deep Focus    ♪ ≋  │  │  Soft Rain          │                │
│  │  Tiefe Drone-Sounds │  │  Sanfter Regen      │                │
│  │  für maximale       │  │  für entspanntes    │                │
│  │  Konzentration      │  │  Arbeiten           │                │
│  └─────────────────────┘  └─────────────────────┘                │
│         ↑ aktiv                                                   │
│                                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐                │
│  │  Night Mode         │  │  White Noise        │                │
│  │  Minimale Klänge    │  │  Konstantes         │                │
│  │  für späte Stunden  │  │  Rauschen           │                │
│  └─────────────────────┘  └─────────────────────┘                │
│                                                                   │
│  Ambient-Lautstärke                      ────●───────────        │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Sound Wave Animation

```
Spielend:     ▎▌█▌▎
              ↓ ↓ ↓
              Animierte Wellen
```

## Testing

### Manuell zu testen
- [ ] Ambient startet mit Fade-In
- [ ] Crossfade zwischen Sounds
- [ ] Loop ist nahtlos
- [ ] Volume-Änderung funktioniert
- [ ] Pause/Resume mit Fade
- [ ] Integration mit Session-Timer
- [ ] Kein Memory-Leak bei langem Abspielen

### Automatisierte Tests

```typescript
describe('AmbientService', () => {
  let service: AmbientService;

  beforeEach(() => {
    service = new AmbientService();
  });

  afterEach(() => {
    service.stop();
  });

  it('starts ambient with fade-in', async () => {
    await service.play('deep-focus');

    expect(service.isPlaying).toBe(true);
    expect(service.currentSound).toBe('deep-focus');
  });

  it('crossfades between sounds', async () => {
    await service.play('deep-focus');
    await service.play('soft-rain');

    expect(service.currentSound).toBe('soft-rain');
  });

  it('stops ambient', () => {
    service.play('deep-focus');
    service.stop();

    expect(service.isPlaying).toBe(false);
    expect(service.currentSound).toBeNull();
  });

  it('respects settings', async () => {
    useSoundSettings.setState({ ambientEnabled: false });

    await service.play('deep-focus');

    expect(service.isPlaying).toBe(false);
  });
});
```

## Definition of Done

- [ ] 4 Ambient-Sounds definiert
- [ ] AmbientService implementiert
- [ ] Fade-In beim Start
- [ ] Crossfade zwischen Sounds
- [ ] Nahtloses Looping
- [ ] Settings-UI mit Grid
- [ ] Volume Control
- [ ] Pause/Resume
- [ ] Placeholder-Sounds vorhanden
- [ ] Tests geschrieben & grün
- [ ] Code reviewed

## Notizen

**Sound-Design-Philosophie:**
- Ambient ist kein Fokus – er ist der Hintergrund
- Sollte nach 5 Minuten "verschwinden"
- Keine Melodien, keine Rhythmen
- Texturen, die sich langsam entwickeln

**Sound-Erstellung (POMO-125):**
- Deep Focus: Lange Drones, tiefe Frequenzen
- Soft Rain: Echte Regenaufnahme, keine Loops hörbar
- Night Mode: Sehr leise, minimale Bewegung
- White Noise: Technisch sauber, verschiedene "Farben"

**Performance:**
- Längere Files = mehr Memory
- Streaming für sehr lange Sounds (>10min)?
- Web Audio API kann mit großen Buffern umgehen

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
