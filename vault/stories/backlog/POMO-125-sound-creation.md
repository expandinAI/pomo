---
type: story
status: backlog
priority: p0
effort: 2
feature: sound-design-2
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [sound, audio, elevenlabs, ai, production, p0]
---

# POMO-125: Sound Production mit ElevenLabs – Die Seele des Klangs

## User Story

> Als **Particle-Team**
> möchten wir **alle 17 Sound-Files mit ElevenLabs AI generieren**,
> damit **wir schnell, günstig und hochwertig zum perfekten Sound-Design kommen**.

## Kontext

Link zum Feature: [[features/sound-design-2]]

Abhängigkeiten:
- [[stories/backlog/POMO-120-sound-engine]] (Technical Foundation)
- [[stories/backlog/POMO-121-transition-chimes]] (Chime Specs)
- [[stories/backlog/POMO-123-ambient-sounds]] (Ambient Specs)
- [[stories/backlog/POMO-124-ui-sounds]] (UI Sound Specs)

**Warum ElevenLabs?**
- ✅ Text-to-Sound aus natürlichen Prompts
- ✅ Royalty-free für kommerzielle Nutzung
- ✅ Mehrere Varianten pro Prompt (6 Samples)
- ✅ Schnelle Iteration (Sekunden, nicht Stunden)
- ✅ Bis zu 22 Sekunden pro Sound
- ✅ Instrumental/musikalische Sounds möglich

**Priorität P0:** Ohne Sounds keine Sound-Features.

---

## ElevenLabs Workflow

### Schritt 1: Account & Setup
1. Gehe zu [elevenlabs.io/sound-effects](https://elevenlabs.io/sound-effects)
2. Erstelle Account (Free Tier reicht für Start)
3. Für mehr Generierungen: Creator Plan ($22/Monat)

### Schritt 2: Prompts vorbereiten
Siehe unten: Fertige Prompts für alle 17 Sounds

### Schritt 3: Generieren & Auswählen
1. Prompt eingeben
2. 6 Varianten werden generiert
3. Beste Variante auswählen
4. Optional: Prompt anpassen, neu generieren

### Schritt 4: Post-Processing
1. Download als MP3
2. In Audacity/Logic öffnen
3. Stille am Anfang/Ende trimmen
4. Normalisieren (-3dB Peak)
5. Als MP3 exportieren (128kbps+)

---

## Fertige ElevenLabs Prompts

### 🔔 Transition Chimes (5 Sounds)

#### session-start.mp3
```
Gentle ascending chime, celesta bells going up C-E-G,
soft reverb, hopeful and welcoming, 1.5 seconds,
like the beginning of a meditation session
```

**Alternativ-Prompts:**
- `Soft bell ascending arpeggio, three notes going higher, gentle reverb, peaceful start signal`
- `Warm celesta melody rising upward, C major chord broken, 1.5 seconds, minimal and elegant`

#### session-end.mp3
```
Warm celebratory chime, full C major chord on celesta with
soft synth pad, gentle glow sound, 2 seconds,
feeling of accomplishment and satisfaction
```

**Alternativ-Prompts:**
- `Triumphant but gentle bell chord, warm and rewarding, like completing something meaningful`
- `Soft golden chime with reverb, major chord, celebration without being loud, 2 seconds`

#### pause-start.mp3
```
Soft descending chime, G-E-C going down gently,
relaxing exhale feeling, celesta with soft pad,
1 second, peaceful transition to rest
```

**Alternativ-Prompts:**
- `Gentle bells descending, letting go feeling, soft and calming, minimal reverb`
- `Relaxing downward chime, like a soft sigh, 1 second, peaceful`

#### pause-end.mp3
```
Refreshing gentle chime, two notes C-E,
crisp but soft celesta, 1.2 seconds,
feeling of waking up gently, ready to continue
```

**Alternativ-Prompts:**
- `Soft awakening bells, two ascending notes, fresh and alert but not jarring`
- `Gentle wake-up chime, bright but soft, like morning light`

#### warning.mp3
```
Single soft G note on celesta, gentle reminder sound,
not alarming, friendly heads-up, 0.8 seconds,
subtle notification without urgency
```

**Alternativ-Prompts:**
- `Soft single bell tone, neutral pitch, gentle reminder, not alarming`
- `Friendly notification chime, one note, subtle and non-intrusive`

---

### 🌊 Ambient Sounds (4 Sounds)

#### deep-focus.mp3
```
Deep ambient drone, warm analog synthesizer,
slowly evolving texture, C minor, meditative,
perfect for concentration and deep work,
10 seconds loopable section
```

**Alternativ-Prompts:**
- `Low frequency ambient pad, warm and enveloping, minimal movement, focus-inducing`
- `Slow evolving synth drone, deep concentration atmosphere, subtle and non-distracting`

#### soft-rain.mp3
```
Gentle rain falling on leaves, soft and consistent,
no thunder, peaceful rainfall, nature ambience,
10 seconds of continuous soft rain
```

**Alternativ-Prompts:**
- `Light rain ambient sound, steady gentle drops, calming nature background`
- `Soft rainfall without storm, peaceful rain on roof, continuous and soothing`

#### night-mode.mp3
```
Very minimal ambient, almost silence with subtle texture,
distant soft tones, night atmosphere, barely audible drone,
5 seconds, extremely quiet and peaceful
```

**Alternativ-Prompts:**
- `Near-silent ambient, whisper of sound, nighttime stillness, minimal texture`
- `Ultra-quiet ambient pad, like distant stars humming, almost imperceptible`

#### white-noise.mp3
```
Clean white noise, consistent and smooth,
no crackling or artifacts, perfect for masking,
1 minute loopable, neutral frequency spectrum
```

**Alternativ-Prompts:**
- `Smooth consistent white noise, clean and neutral, no harsh frequencies`
- `Gentle static noise, even distribution, calming background hum`

---

### 🖱️ UI Sounds (8 Sounds)

#### click.mp3
```
Soft mechanical click, tactile button press,
satisfying but quiet, like a premium keyboard,
50ms, clean and minimal
```

**Alternativ-Prompts:**
- `Gentle tap sound, soft click, premium feel, very short`
- `Subtle button press, mechanical but soft, high quality feel`

#### toggle-on.mp3
```
Soft switch on sound, gentle upward pitch,
confirmation feeling, 100ms, satisfying click
with subtle brightness
```

**Alternativ-Prompts:**
- `Toggle activation sound, soft ascending, confirmatory`
- `Switch on with gentle high pitch, brief and satisfying`

#### toggle-off.mp3
```
Soft switch off sound, gentle downward pitch,
neutral deactivation, 80ms, soft click
with subtle lowering
```

**Alternativ-Prompts:**
- `Toggle deactivation, soft descending pitch, brief`
- `Switch off sound, gentle low tone, neutral feeling`

#### modal-open.mp3
```
Soft whoosh opening, gentle air movement,
like a window sliding open smoothly,
150ms, elegant and subtle
```

**Alternativ-Prompts:**
- `Gentle opening sound, soft expansion, subtle whoosh`
- `Smooth slide open sound, airy and elegant`

#### modal-close.mp3
```
Soft whoosh closing, reverse of opening,
gentle compression sound, 120ms,
like sliding a drawer closed softly
```

**Alternativ-Prompts:**
- `Gentle closing sound, soft contraction, subtle whoosh reversed`
- `Smooth slide close, quiet and elegant`

#### navigation.mp3
```
Very subtle transition sound, soft swish,
page turning in silence, 100ms,
minimal and almost imperceptible
```

**Alternativ-Prompts:**
- `Ultra-soft navigation sound, barely there, gentle movement`
- `Whisper of transition, subtle shift sound`

#### success.mp3
```
Gentle positive chime, two ascending notes,
soft celebration, 200ms, satisfying completion
without being loud
```

**Alternativ-Prompts:**
- `Soft success sound, brief happy notes, confirmatory`
- `Gentle achievement chime, positive but subtle`

#### error.mp3
```
Soft warning tone, single low note,
not alarming but informative, 150ms,
gentle heads-up without negativity
```

**Alternativ-Prompts:**
- `Gentle error notification, soft low tone, not harsh`
- `Subtle problem indication, calm warning sound`

---

## Akzeptanzkriterien

### Generierung
- [ ] **Given** alle 17 Prompts, **When** in ElevenLabs eingegeben, **Then** werden jeweils mindestens 3 Varianten generiert
- [ ] **Given** die Varianten, **When** ausgewählt, **Then** passt der Sound zur emotionalen Beschreibung
- [ ] **Given** jeder Sound, **When** generiert, **Then** ist er royalty-free nutzbar

### Post-Processing
- [ ] **Given** alle Sound-Files, **When** bearbeitet, **Then** sind sie im MP3-Format (128kbps+)
- [ ] **Given** alle Sound-Files, **When** bearbeitet, **Then** haben sie keine Stille am Anfang/Ende
- [ ] **Given** Loop-Sounds (Ambient), **When** sie loopen, **Then** ist kein Schnitt hörbar
- [ ] **Given** alle Sounds, **When** normalisiert, **Then** peaken sie bei -3dB

### Qualität
- [ ] **Given** alle Sounds, **When** zusammen gespielt, **Then** harmonieren sie
- [ ] **Given** Session End Chime, **When** er spielt, **Then** fühlt es sich wie eine Belohnung an
- [ ] **Given** alle Sounds, **When** ich sie höre, **Then** fühlen sie sich "Particle" an (monochrom, elegant)

---

## Post-Processing Workflow

### Tools (kostenlos)
- **Audacity** (Mac/Windows/Linux) – Open Source Audio Editor
- **Online Alternative:** [audiomass.co](https://audiomass.co) – Browser-basiert

### Schritt-für-Schritt

```
1. IMPORT
   - MP3 von ElevenLabs in Audacity öffnen

2. TRIM
   - Stille am Anfang markieren → Löschen
   - Stille am Ende markieren → Löschen
   - Nur der eigentliche Sound bleibt

3. FADE (für Chimes & Ambient)
   - Ende markieren (letzte 100-500ms)
   - Effekt → Ausblenden (Fade Out)

4. NORMALIZE
   - Effekt → Normalisieren
   - Peak auf -3dB setzen

5. LOOP CHECK (nur Ambient)
   - Sound loopen lassen
   - Auf Klicks/Sprünge achten
   - Ggf. Crossfade am Loop-Punkt

6. EXPORT
   - Datei → Exportieren → Als MP3
   - 128kbps oder höher
   - Dateiname laut Struktur
```

---

## File-Struktur

```
public/
└── sounds/
    ├── chimes/
    │   ├── session-start.mp3    (1.5s)
    │   ├── session-end.mp3      (2.0s)
    │   ├── pause-start.mp3      (1.0s)
    │   ├── pause-end.mp3        (1.2s)
    │   └── warning.mp3          (0.8s)
    ├── ambient/
    │   ├── deep-focus.mp3       (5-10 min loop)
    │   ├── soft-rain.mp3        (10 min loop)
    │   ├── night-mode.mp3       (5 min loop)
    │   └── white-noise.mp3      (1 min loop)
    └── ui/
        ├── click.mp3            (50ms)
        ├── toggle-on.mp3        (100ms)
        ├── toggle-off.mp3       (80ms)
        ├── modal-open.mp3       (150ms)
        ├── modal-close.mp3      (120ms)
        ├── navigation.mp3       (100ms)
        ├── success.mp3          (200ms)
        └── error.mp3            (150ms)
```

---

## Checkliste pro Sound

Für jeden der 17 Sounds:

- [ ] Prompt in ElevenLabs eingeben
- [ ] 6 Varianten anhören
- [ ] Beste auswählen (oder neu generieren)
- [ ] Herunterladen
- [ ] In Audacity trimmen
- [ ] Fade Out hinzufügen (wenn nötig)
- [ ] Normalisieren (-3dB)
- [ ] Als MP3 exportieren
- [ ] In public/sounds/ speichern
- [ ] Im Browser testen

---

## Zeitschätzung

| Phase | Zeit |
|-------|------|
| ElevenLabs Setup | 10 min |
| Chimes generieren (5×) | 30 min |
| Ambient generieren (4×) | 45 min |
| UI Sounds generieren (8×) | 30 min |
| Post-Processing (17×) | 60 min |
| Review & Iteration | 45 min |
| **Gesamt** | **~3-4 Stunden** |

Viel schneller als traditionelle Sound-Produktion (10-20 Stunden)!

---

## Fallback-Strategien

### Falls ElevenLabs nicht passt:

**Für Chimes:**
- Suno.ai (besser für musikalische Sounds)
- Prompt: `Gentle celesta chime, C major ascending, meditation app sound, 2 seconds`

**Für Ambient:**
- [Freesound.org](https://freesound.org) – CC-lizenzierte Field Recordings
- Suche: "rain ambient loop", "white noise clean"

**Für UI Sounds:**
- [Mixkit.co](https://mixkit.co/free-sound-effects/) – Kostenlose UI Sounds
- [Zapsplat.com](https://www.zapsplat.com) – Große Bibliothek

---

## Definition of Done

- [ ] 5 Chime-Sounds mit ElevenLabs generiert
- [ ] 4 Ambient-Sounds generiert (oder von Freesound)
- [ ] 8 UI-Sounds generiert
- [ ] Alle in MP3 Format (128kbps+)
- [ ] Alle getrimmt (keine Stille)
- [ ] Alle normalisiert (-3dB Peak)
- [ ] Loops sind nahtlos
- [ ] In public/sounds/ organisiert
- [ ] Alle Sounds im Browser getestet
- [ ] Von mindestens 2 Personen gehört & approved

---

## Referenzen

### ElevenLabs
- [Sound Effects Generator](https://elevenlabs.io/sound-effects) – Haupttool
- [SB1 Infinite Soundboard](https://elevenlabs.io/blog/how-we-created-a-soundboard-using-elevenlabs-sfx-api) – Inspiration

### Inspiration für Sound-Charakter
- **Endel** – Generative, sich entwickelnde Sounds
- **Headspace** – Warme, einladende Chimes
- **Calm** – Natürliche Ambient-Sounds
- **Linear** – Fast unhörbare UI-Sounds

---

## Notizen

**Iteration ist key:** Die ersten Sounds werden wahrscheinlich nicht perfekt. ElevenLabs macht es aber einfach, schnell neue Varianten zu generieren.

**Konsistenz:** Alle Sounds müssen sich wie eine Familie anfühlen. Nutze ähnliche Prompts für ähnliche Sounds.

**Weniger ist mehr:** Lieber etwas zu leise als zu laut. Lieber etwas zu kurz als zu lang.

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
