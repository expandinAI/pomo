---
type: feature
status: draft
priority: p2
effort: m
business_value: high
origin: "Competitor Analysis: Endel + Particle Vision"
stories: []
created: 2026-01-20
updated: 2026-01-20
tags: [sound, audio, immersive, emotional, premium, p2]
---

# Sound Design 2.0 – Die Stimme von Particle

## Die Vision

> **Particle ist nicht nur ein Ort. Particle ist eine Welt.**
>
> Und jede Welt hat ihre eigene Stimme.

Wenn du Particle betrittst, betrittst du einen Raum. Einen Raum der Ruhe, der Fokussierung, der Schöpfung. Die Sounds sind nicht "Benachrichtigungen" – sie sind **die Stimme dieses Raums**, die zu dir spricht.

Ein sanfter Ton sagt: *"Willkommen zurück. Lass uns beginnen."*
Ein warmer Klang sagt: *"Du hast es geschafft. Ruh dich aus."*
Ein leises Summen sagt: *"Ich bin hier. Du bist nicht allein."*

**Sound Design 2.0 macht Particle zu einem Erlebnis, nicht nur zu einem Tool.**

---

## Zusammenfassung

> Endel-inspirierte Audio-Landschaft für Particle. Subtile, emotionale Sounds, die den Flow-State unterstützen, ohne abzulenken. Chimes für Übergänge, optionale Ambient-Sounds, und eine kohärente Audio-Identität, die Particle unverwechselbar macht.

## Die Sound-Philosophie

### Was Sound in Particle IST:

| ✅ Sound ist... | Beschreibung |
|----------------|--------------|
| **Emotional** | Erzeugt Gefühle, nicht nur Informationen |
| **Subtil** | Nie aufdringlich, nie störend |
| **Konsistent** | Eine kohärente Audio-Welt |
| **Optional** | Kann komplett deaktiviert werden |
| **Bedeutungsvoll** | Jeder Sound hat einen Zweck |

### Was Sound in Particle NICHT IST:

| ❌ Sound ist nicht... | Warum nicht |
|---------------------|-------------|
| **Gamification** | Keine "Ding ding ding!" Belohnungssounds |
| **Alarm** | Keine stressigen Wecker |
| **Notification-Spam** | Keine "Sie haben eine neue Nachricht" Vibes |
| **Musik** | Wir sind kein Spotify (Ambient ≠ Musik) |
| **Pflicht** | Alles funktioniert auch stumm |

---

## Die Sound-Kategorien

### 1. Transition Chimes (Übergänge)

Die wichtigsten Sounds. Sie markieren Momente des Übergangs.

| Moment | Sound-Charakter | Emotionale Botschaft |
|--------|-----------------|---------------------|
| **Session Start** | Sanfter, aufsteigender Ton | "Lass uns beginnen." |
| **Session Ende** | Warmer, vollendender Klang | "Du hast es geschafft." |
| **Pause Start** | Entspannender, absteigender Ton | "Zeit zum Atmen." |
| **Pause Ende** | Sanft weckender Ton | "Bereit für mehr?" |
| **Warnung (1 min)** | Subtiler Hinweis-Ton | "Bald ist es soweit." |

### 2. Ambient Sounds (Hintergrund)

Optionale Klanglandschaften für immersives Arbeiten.

| Ambient | Beschreibung | Ideal für |
|---------|--------------|-----------|
| **Deep Focus** | Minimalistisches Drone, sehr leise | Maximale Konzentration |
| **Soft Rain** | Sanfter Regen, ohne Gewitter | Entspanntes Arbeiten |
| **Night Mode** | Dunkle, warme Töne | Späte Sessions |
| **White Noise** | Neutrales Rauschen | Ablenkende Umgebung |
| **Silence** | Kein Ambient | Puristen |

### 3. Interaction Sounds (Mikro-Feedback)

Sehr subtile Sounds für UI-Interaktionen.

| Interaktion | Sound | Lautstärke |
|-------------|-------|------------|
| **Timer Start (Space)** | Kurzer Klick | 30% |
| **Timer Pause** | Sanfter Stop | 20% |
| **Navigation (G prefix)** | Subtiler Whoosh | 15% |
| **Modal Open** | Leises Pop | 20% |
| **Modal Close** | Sanftes Zurück | 15% |

---

## Die Transition Chimes im Detail

### Session Start – "Der Beginn"

```
Charakter:   Aufsteigend, hoffnungsvoll
Tonalität:   C-Dur, rein
Instrumente: Sine Wave + leichtes Glockenspiel
Dauer:       800ms
Dynamik:     p → mp (leise startend, sanft anschwellend)

Timeline:
0ms     200ms   400ms   600ms   800ms
|-------|-------|-------|-------|
 C4      E4      G4      C5
 ●───────●───────●───────●
        (aufsteigende Quinte + Oktave)
```

**Emotionale Botschaft:**
> "Ein neuer Anfang. Eine neue Chance. Lass uns Großes schaffen."

### Session Ende – "Die Vollendung"

```
Charakter:   Vollendend, befriedigend, warm
Tonalität:   C-Dur → Resolution
Instrumente: Warme Pads + Glockenspiel
Dauer:       1200ms
Dynamik:     mp → p (sanft ausklingend)

Timeline:
0ms     300ms   600ms   900ms   1200ms
|-------|-------|-------|-------|
 G4      E4      C4      G3
 ●───────●───────●───────●~~~~~~~~
        (absteigende Linie, Ruhe findend)
```

**Emotionale Botschaft:**
> "Du hast es geschafft. Dieser Moment gehört dir. Sei stolz."

### Pause Start – "Das Atmen"

```
Charakter:   Entspannend, loslassend
Tonalität:   F-Dur (wärmer als C)
Instrumente: Soft Pad, kein Attack
Dauer:       600ms
Dynamik:     p (durchgehend sanft)

Timeline:
0ms     300ms   600ms
|-------|-------|
 F4      C4
 ●~~~~~~~●~~~~~~
        (sanft fallend, wie ein Ausatmen)
```

**Emotionale Botschaft:**
> "Lass los. Atme. Du hast es verdient."

### Warnung (1 min) – "Der sanfte Hinweis"

```
Charakter:   Aufmerksam, aber nicht stressig
Tonalität:   Neutral
Instrumente: Einzelner Ton, reiner Sine
Dauer:       300ms
Dynamik:     pp (sehr leise)

Timeline:
0ms     150ms   300ms
|-------|-------|
 G5
 ●~~~~~~~
        (kurz, klar, verschwindet wieder)
```

**Emotionale Botschaft:**
> "Hey, nur damit du weißt – bald ist es soweit. Kein Stress."

---

## Sound-Identität: Die Particle-Stimme

### Musikalische Grundlagen

| Aspekt | Entscheidung | Begründung |
|--------|--------------|------------|
| **Grundton** | C (261.63 Hz) | Universell, neutral, "Home" |
| **Stimmung** | 440 Hz (Standard A) | Kompatibel mit allem |
| **Skala** | Pentatonisch (C-D-E-G-A) | Keine Dissonanzen möglich |
| **Dur/Moll** | Primär Dur, Moll für Pausen | Positiv, aber nicht übertrieben |

### Die "Particle-Klangfarbe"

```
Bestandteile:
├── Sine Wave (Grundton, 70%)
├── Triangle Wave (Obertöne, 20%)
└── Soft Reverb (Raum, 10%)

Kein:
├── Saw Wave (zu aggressiv)
├── Square Wave (zu digital/retro)
└── Heavy Reverb (zu "episch")
```

**Das Ergebnis:** Ein Klang, der warm, klar und zeitlos ist. Nicht nach 2020er-App klingt, nicht nach 80er-Synthesizer. Einfach: Particle.

---

## Ambient Sounds

### Deep Focus

```
Beschreibung: Minimalistisches Drone, kaum wahrnehmbar
Frequenzbereich: 80-200 Hz (tiefe Wärme)
Variationen: Sehr langsame, subtile Modulationen (30+ Sekunden Zyklen)
Lautstärke: -30dB bis -40dB (unterbewusst)

Charakter:
- Wie das Summen eines fernen Generators
- Gibt dem Raum "Tiefe"
- Füllt die Stille, ohne abzulenken
```

### Soft Rain

```
Beschreibung: Sanfter Regen auf einem Fenster
Frequenzbereich: Breitband, leichtes Rauschen
Variationen: Unregelmäßige Tropfen (keine Loops spürbar)
Lautstärke: -25dB bis -35dB

Charakter:
- Keine Gewitter, keine Donner
- Beruhigend, nicht dramatisch
- "Ich bin drinnen, draußen regnet es, ich arbeite"
```

### Night Mode

```
Beschreibung: Dunkle, warme Töne für späte Sessions
Frequenzbereich: 60-150 Hz (sehr tief)
Variationen: Langsame Wellen, wie Atmen
Lautstärke: -35dB bis -45dB

Charakter:
- Die Welt schläft, du schaffst
- Keine hohen Frequenzen (augenschonend für Ohren)
- Passt zu Dark Mode visuell
```

---

## User Settings

### Sound-Einstellungen

```
┌───────────────────────────────────────────────────────────────────┐
│  Sound                                                            │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Master Volume                                                    │
│  [░░░░░░░░░░████████████████████░░░░░░░░░░]  60%                 │
│                                                                   │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  Transition Chimes                              [On] [Off]        │
│  Sounds für Session-Start, Ende, Pausen                          │
│                                                                   │
│  Ambient Sound                                  [Deep Focus ▼]    │
│  Hintergrund-Klanglandschaft                                      │
│                                                                   │
│  Interaction Sounds                             [On] [Off]        │
│  Subtile Sounds für UI-Aktionen                                   │
│                                                                   │
│  1-Minute Warning                               [On] [Off]        │
│  Sanfter Hinweis vor Session-Ende                                 │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Ambient-Dropdown

```
┌─────────────────────────┐
│ ✓ Aus (Stille)          │
│   Deep Focus            │
│   Soft Rain             │
│   Night Mode            │
│   White Noise           │
└─────────────────────────┘
```

---

## Technische Implementation

### Web Audio API

```typescript
// src/lib/audio/sound-engine.ts

class SoundEngine {
  private context: AudioContext;
  private masterGain: GainNode;
  private transitionGain: GainNode;
  private ambientGain: GainNode;

  constructor() {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);

    this.transitionGain = this.context.createGain();
    this.transitionGain.connect(this.masterGain);

    this.ambientGain = this.context.createGain();
    this.ambientGain.connect(this.masterGain);
  }

  async playTransition(type: TransitionType): Promise<void> {
    const sound = await this.loadSound(`/sounds/transitions/${type}.mp3`);
    const source = this.context.createBufferSource();
    source.buffer = sound;
    source.connect(this.transitionGain);
    source.start();
  }

  setMasterVolume(volume: number): void {
    this.masterGain.gain.setValueAtTime(volume, this.context.currentTime);
  }

  // ... ambient methods
}
```

### Sound Files Structure

```
public/
└── sounds/
    ├── transitions/
    │   ├── session-start.mp3      (~15KB)
    │   ├── session-end.mp3        (~20KB)
    │   ├── break-start.mp3        (~12KB)
    │   ├── break-end.mp3          (~15KB)
    │   └── warning.mp3            (~8KB)
    ├── ambient/
    │   ├── deep-focus.mp3         (~500KB, 2min loop)
    │   ├── soft-rain.mp3          (~800KB, 3min loop)
    │   ├── night-mode.mp3         (~500KB, 2min loop)
    │   └── white-noise.mp3        (~300KB, 1min loop)
    └── ui/
        ├── click.mp3              (~3KB)
        ├── whoosh.mp3             (~5KB)
        └── pop.mp3                (~4KB)

Total: ~2.2MB (lazy loaded)
```

### Preloading Strategy

```typescript
// Transition sounds: Preload on app start (small)
// Ambient sounds: Load on first use (larger)
// UI sounds: Load on first interaction

const preloadPriority = {
  immediate: ['session-start', 'session-end'],
  onIdle: ['break-start', 'break-end', 'warning'],
  onDemand: ['ambient/*', 'ui/*'],
};
```

### Betroffene Dateien

```
src/
├── lib/
│   └── audio/
│       ├── sound-engine.ts       # Web Audio Wrapper
│       ├── transitions.ts        # Transition Sounds
│       ├── ambient.ts            # Ambient Player
│       ├── ui-sounds.ts          # Micro-Interactions
│       └── index.ts
├── components/
│   └── settings/
│       └── SoundSettings.tsx     # UI
└── hooks/
    └── useSound.ts               # React Hook
public/
└── sounds/
    └── ...                       # Audio Files
```

---

## Akzeptanzkriterien

### Must Have

- [ ] Session Start Chime
- [ ] Session Ende Chime
- [ ] Pause Start/Ende Chimes
- [ ] Master Volume Control
- [ ] Mute/Unmute Toggle
- [ ] Settings UI für alle Sound-Optionen
- [ ] Sounds respektieren System-Mute
- [ ] Keine Sounds bei `prefers-reduced-motion`? (diskutierbar)

### Should Have

- [ ] 1-Minute Warning Sound
- [ ] Mindestens 2 Ambient Options (Deep Focus, Soft Rain)
- [ ] Smooth Fade-In/Out für Ambient
- [ ] UI Interaction Sounds (optional)

### Nice to Have

- [ ] Mehr Ambient Options (Night Mode, White Noise)
- [ ] Custom Sound Upload
- [ ] Sound Preview in Settings
- [ ] Keyboard Shortcut für Mute (M)

---

## Metriken & Erfolgsmessung

- **Primäre Metrik:** 60% der User haben Sound aktiviert (Default: On)
- **Sekundäre Metrik:** 20% nutzen Ambient Sounds
- **Sekundäre Metrik:** <5% deaktivieren Sound nach erstem Test
- **Messzeitraum:** 4 Wochen nach Launch

---

## Stories

*Werden nach Freigabe der Spec erstellt.*

Vorgeschlagene Aufteilung:

| Story | Titel | SP | Prio |
|-------|-------|---|------|
| `POMO-120` | Sound Engine (Web Audio API) | 3 | P0 |
| `POMO-121` | Transition Chimes | 3 | P0 |
| `POMO-122` | Sound Settings UI | 2 | P0 |
| `POMO-123` | Ambient Sound System | 3 | P1 |
| `POMO-124` | UI Interaction Sounds | 2 | P2 |
| `POMO-125` | Sound File Creation/Recording | 3 | P0 |

**P0 Gesamt: 11 Story Points**
**P1 Gesamt: 3 Story Points**
**P2 Gesamt: 2 Story Points**
**Total: 16 Story Points**

---

## Audio-Design Notizen

### Inspiration

- **Endel:** Generative, adaptive Soundscapes
- **Headspace:** Warme, menschliche Meditation-Sounds
- **macOS:** Subtile System-Sounds (Sosumi, Basso)
- **ASMR:** Die Kunst des "angenehm Leisen"

### Was wir NICHT wollen

- **Windows XP:** Übertriebene "Ta-da!" Sounds
- **Mobile Games:** "Ding ding ding!" Belohnungen
- **Slack:** Aufdringliche Notification Sounds
- **Zoom:** Stressige "Someone joined" Sounds

### Die goldene Regel

> **Wenn jemand fragt "Was war das für ein Sound?", war er zu laut.**
>
> Der perfekte Sound wird wahrgenommen, ohne bemerkt zu werden. Er verändert die Stimmung, ohne aufzufallen. Er ist da, ohne zu stören.

---

## Die emotionale Reise

```
[Session Start]
    │
    │  ♪ "Lass uns beginnen"
    │  (aufsteigend, hoffnungsvoll)
    │
    ▼
[Deep Work]
    │
    │  ♪ Ambient: Stille oder Deep Focus
    │  (kaum wahrnehmbar, unterstützend)
    │
    ▼
[1 Minute Warnung]
    │
    │  ♪ "Bald geschafft"
    │  (subtil, nicht stressig)
    │
    ▼
[Session Ende]
    │
    │  ♪ "Du hast es geschafft"
    │  (warm, befriedigend, stolz)
    │
    ▼
[Pause]
    │
    │  ♪ "Zeit zum Atmen"
    │  (entspannend, loslassend)
    │
    ▼
[Pause Ende]
    │
    │  ♪ "Bereit für mehr?"
    │  (sanft weckend)
    │
    └──► [Nächste Session]
```

---

## Changelog

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2026-01-20 | Initial Draft | Claude |

---

*"Particle ist nicht nur ein Ort. Particle ist eine Welt. Und jede Welt hat ihre eigene Stimme."*
