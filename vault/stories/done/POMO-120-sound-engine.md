---
type: story
status: done
priority: p0
effort: 3
feature: sound-design-2
created: 2026-01-20
updated: 2026-01-20
done_date: 2026-01-29
tags: [sound, web-audio-api, engine, foundation, p0]
---

# POMO-120: Sound Engine – Das Fundament des Klangs

## User Story

> Als **Entwickler**
> möchte ich **eine robuste Sound Engine basierend auf Web Audio API**,
> damit **alle Sound-Features auf einer soliden Basis aufbauen können**.

## Kontext

Link zum Feature: [[features/sound-design-2]]

Dies ist das technische Fundament für alle Sound-Features. Die Sound Engine abstrahiert die Web Audio API und bietet eine einfache Schnittstelle für:
- Laden und Cachen von Audio-Dateien
- Abspielen von Sounds mit Kontrolle über Lautstärke, Fade, Position
- Verwalten mehrerer gleichzeitiger Audio-Quellen
- Respektieren von Browser-Autoplay-Policies

**Priorität P0:** Ohne Engine keine Sounds.

## Akzeptanzkriterien

### AudioContext Management
- [ ] **Given** die App startet, **When** der User noch nicht interagiert hat, **Then** ist der AudioContext suspended
- [ ] **Given** der User interagiert (Click/Key), **When** Sounds aktiviert sind, **Then** wird der AudioContext resumed
- [ ] **Given** der Tab verliert Fokus, **When** Sounds spielen, **Then** werden sie nicht pausiert (User-Entscheidung)

### Sound Loading
- [ ] **Given** ein Sound-File, **When** ich es lade, **Then** wird es in den AudioBuffer gecacht
- [ ] **Given** ein bereits geladener Sound, **When** ich ihn erneut lade, **Then** wird der Cache verwendet
- [ ] **Given** ein ungültiges Audio-File, **When** ich es lade, **Then** wird ein Error geloggt (kein Crash)

### Sound Playback
- [ ] **Given** ein geladener Sound, **When** ich play() aufrufe, **Then** wird er abgespielt
- [ ] **Given** ein spielender Sound, **When** ich stop() aufrufe, **Then** stoppt er sofort
- [ ] **Given** ein Sound, **When** ich fadeOut() aufrufe, **Then** fadet er über die angegebene Zeit aus

### Volume Control
- [ ] **Given** die Engine, **When** ich setMasterVolume() aufrufe, **Then** ändert sich die Lautstärke aller Sounds
- [ ] **Given** ein einzelner Sound, **When** ich seine Volume setze, **Then** ändert sich nur seine Lautstärke
- [ ] **Given** Mute ist aktiviert, **When** ein Sound abgespielt wird, **Then** ist er unhörbar

### Cleanup
- [ ] **Given** ein Sound ist fertig, **When** er endet, **Then** werden seine Ressourcen freigegeben
- [ ] **Given** die Component unmountet, **When** Sounds spielen, **Then** werden sie gestoppt und aufgeräumt

## Technische Details

### SoundEngine Klasse

```typescript
// src/lib/sound/sound-engine.ts

export interface SoundOptions {
  volume?: number;      // 0-1, default 1
  loop?: boolean;       // default false
  fadeIn?: number;      // ms, default 0
  fadeOut?: number;     // ms, default 0
}

export interface SoundInstance {
  id: string;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  stop: () => void;
  fadeOut: (duration?: number) => Promise<void>;
  setVolume: (volume: number) => void;
}

export class SoundEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private activeSounds: Map<string, SoundInstance> = new Map();
  private isMuted: boolean = false;

  // Lazy initialization (Browser Autoplay Policy)
  async initialize(): Promise<void> {
    if (this.audioContext) return;

    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
  }

  // Resume nach User-Interaktion
  async resume(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Sound laden und cachen
  async loadSound(url: string): Promise<AudioBuffer> {
    if (this.bufferCache.has(url)) {
      return this.bufferCache.get(url)!;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      this.bufferCache.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error(`Failed to load sound: ${url}`, error);
      throw error;
    }
  }

  // Sound abspielen
  async play(url: string, options: SoundOptions = {}): Promise<SoundInstance> {
    await this.initialize();
    await this.resume();

    const buffer = await this.loadSound(url);
    const source = this.audioContext!.createBufferSource();
    source.buffer = buffer;
    source.loop = options.loop ?? false;

    const gainNode = this.audioContext!.createGain();
    const volume = this.isMuted ? 0 : (options.volume ?? 1);

    // Fade In
    if (options.fadeIn && options.fadeIn > 0) {
      gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        volume,
        this.audioContext!.currentTime + options.fadeIn / 1000
      );
    } else {
      gainNode.gain.setValueAtTime(volume, this.audioContext!.currentTime);
    }

    source.connect(gainNode);
    gainNode.connect(this.masterGain!);

    const id = crypto.randomUUID();
    const instance: SoundInstance = {
      id,
      source,
      gainNode,
      stop: () => this.stopSound(id),
      fadeOut: (duration = 500) => this.fadeOutSound(id, duration),
      setVolume: (vol) => this.setSoundVolume(id, vol),
    };

    this.activeSounds.set(id, instance);

    source.onended = () => {
      this.activeSounds.delete(id);
    };

    source.start();
    return instance;
  }

  // Sound stoppen
  private stopSound(id: string): void {
    const instance = this.activeSounds.get(id);
    if (instance) {
      instance.source.stop();
      this.activeSounds.delete(id);
    }
  }

  // Fade Out
  private async fadeOutSound(id: string, duration: number): Promise<void> {
    const instance = this.activeSounds.get(id);
    if (!instance) return;

    const currentTime = this.audioContext!.currentTime;
    const currentVolume = instance.gainNode.gain.value;

    instance.gainNode.gain.setValueAtTime(currentVolume, currentTime);
    instance.gainNode.gain.linearRampToValueAtTime(0, currentTime + duration / 1000);

    await new Promise(resolve => setTimeout(resolve, duration));
    this.stopSound(id);
  }

  // Volume setzen
  private setSoundVolume(id: string, volume: number): void {
    const instance = this.activeSounds.get(id);
    if (instance && !this.isMuted) {
      instance.gainNode.gain.setValueAtTime(volume, this.audioContext!.currentTime);
    }
  }

  // Master Volume
  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(volume, this.audioContext!.currentTime);
    }
  }

  // Mute
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.setMasterVolume(muted ? 0 : 1);
  }

  // Alle Sounds stoppen
  stopAll(): void {
    this.activeSounds.forEach((_, id) => this.stopSound(id));
  }

  // Cleanup
  dispose(): void {
    this.stopAll();
    this.bufferCache.clear();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
```

### React Hook

```typescript
// src/lib/sound/use-sound-engine.ts

import { useEffect, useRef } from 'react';
import { SoundEngine } from './sound-engine';

let globalEngine: SoundEngine | null = null;

export function useSoundEngine(): SoundEngine {
  if (!globalEngine) {
    globalEngine = new SoundEngine();
  }

  useEffect(() => {
    // Resume on first user interaction
    const handleInteraction = () => {
      globalEngine?.resume();
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  return globalEngine;
}
```

### Singleton Pattern

```typescript
// src/lib/sound/index.ts

export { SoundEngine } from './sound-engine';
export { useSoundEngine } from './use-sound-engine';

// Globale Instanz für einfachen Zugriff
import { SoundEngine } from './sound-engine';

let instance: SoundEngine | null = null;

export function getSoundEngine(): SoundEngine {
  if (!instance) {
    instance = new SoundEngine();
  }
  return instance;
}
```

### Betroffene Dateien

```
src/
└── lib/
    └── sound/
        ├── index.ts
        ├── sound-engine.ts
        ├── use-sound-engine.ts
        └── types.ts
```

## Testing

### Manuell zu testen
- [ ] Sound spielt nach erstem Click/Keypress
- [ ] Sound spielt nicht vor User-Interaktion
- [ ] Mehrere Sounds gleichzeitig möglich
- [ ] Fade In/Out funktioniert
- [ ] Mute schaltet alle Sounds stumm
- [ ] Tab-Wechsel stoppt Sounds nicht
- [ ] Kein Memory-Leak bei vielen Sounds

### Automatisierte Tests

```typescript
describe('SoundEngine', () => {
  let engine: SoundEngine;

  beforeEach(() => {
    engine = new SoundEngine();
  });

  afterEach(() => {
    engine.dispose();
  });

  it('initializes AudioContext lazily', () => {
    expect(engine['audioContext']).toBeNull();
  });

  it('caches loaded sounds', async () => {
    const buffer1 = await engine.loadSound('/sounds/test.mp3');
    const buffer2 = await engine.loadSound('/sounds/test.mp3');

    expect(buffer1).toBe(buffer2);
  });

  it('handles mute correctly', async () => {
    engine.setMuted(true);
    const instance = await engine.play('/sounds/test.mp3');

    expect(instance.gainNode.gain.value).toBe(0);
  });

  it('cleans up on dispose', async () => {
    await engine.play('/sounds/test.mp3');
    engine.dispose();

    expect(engine['activeSounds'].size).toBe(0);
    expect(engine['audioContext']).toBeNull();
  });
});
```

## Definition of Done

- [ ] SoundEngine Klasse implementiert
- [ ] Lazy AudioContext Initialization
- [ ] Sound Loading mit Cache
- [ ] Play/Stop/FadeOut funktioniert
- [ ] Master Volume & Mute
- [ ] React Hook für einfache Nutzung
- [ ] Browser Autoplay Policy respektiert
- [ ] Keine Memory Leaks
- [ ] Tests geschrieben & grün
- [ ] Code reviewed

## Notizen

**Browser Autoplay Policy:**
- Chrome/Safari blockieren Audio ohne User-Interaktion
- AudioContext startet als "suspended"
- Muss nach click/keydown "resumed" werden
- Unser Hook macht das automatisch

**Performance:**
- AudioBuffer im RAM = schnelles Playback
- Zu viele gecachte Sounds = Memory-Problem
- Für Ambient: Streaming statt vollständiges Laden (später)

**Alternativen:**
- Howler.js (mehr Features, aber größer)
- Tone.js (für komplexe Synthese)
- Wir nutzen native Web Audio API für maximale Kontrolle

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
