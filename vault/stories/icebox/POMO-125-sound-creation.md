---
type: story
status: backlog
priority: p0
effort: 2
feature: sound-design-2
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [sound, audio, elevenlabs, api, automation, p0]
---

# POMO-125: Automatische Sound-Generierung mit ElevenLabs API

## User Story

> Als **Particle-Team**
> möchten wir **alle 17 Sound-Files automatisch via ElevenLabs API generieren**,
> damit **wir mit einem einzigen Script-Aufruf das komplette Sound-Design erstellen**.

## Kontext

Link zum Feature: [[features/sound-design-2]]

Abhängigkeiten:
- [[stories/backlog/POMO-120-sound-engine]] (Technical Foundation)
- [[stories/backlog/POMO-121-transition-chimes]] (Chime Specs)
- [[stories/backlog/POMO-123-ambient-sounds]] (Ambient Specs)
- [[stories/backlog/POMO-124-ui-sounds]] (UI Sound Specs)

**Warum ElevenLabs API?**
- ✅ Offizielles TypeScript SDK (`@elevenlabs/elevenlabs-js`)
- ✅ Programmatische Generierung aller Sounds
- ✅ Royalty-free & Commercial License
- ✅ Bis zu 30 Sekunden pro Sound
- ✅ Konsistente Qualität durch gleiche Prompts
- ✅ Wiederholbar & versionierbar

**Priorität P0:** Ohne Sounds keine Sound-Features.

---

## Setup

### 1. ElevenLabs Account & API Key

1. Account erstellen: [elevenlabs.io](https://elevenlabs.io)
2. Credits kaufen (Pay-as-you-go oder Plan)
3. API Key holen: Settings → API Keys
4. In `.env.local` speichern:

```bash
ELEVENLABS_API_KEY=your_api_key_here
```

### 2. SDK installieren

```bash
pnpm add @elevenlabs/elevenlabs-js
pnpm add -D tsx  # Für Script-Ausführung
```

---

## Das Script

### `scripts/generate-sounds.ts`

```typescript
import { ElevenLabs } from '@elevenlabs/elevenlabs-js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// ============================================
// KONFIGURATION
// ============================================

const client = new ElevenLabs({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const OUTPUT_DIR = 'public/sounds';

interface SoundConfig {
  filename: string;
  prompt: string;
  duration: number; // Sekunden (0.5 - 30)
  category: 'chimes' | 'ambient' | 'ui';
}

// ============================================
// SOUND DEFINITIONEN
// ============================================

const SOUNDS: SoundConfig[] = [
  // 🔔 TRANSITION CHIMES
  {
    filename: 'session-start.mp3',
    category: 'chimes',
    duration: 1.5,
    prompt: `Gentle ascending chime, celesta bells going up C-E-G,
             soft reverb, hopeful and welcoming,
             like the beginning of a meditation session`,
  },
  {
    filename: 'session-end.mp3',
    category: 'chimes',
    duration: 2.0,
    prompt: `Warm celebratory chime, full C major chord on celesta
             with soft synth pad, gentle glow sound,
             feeling of accomplishment and satisfaction`,
  },
  {
    filename: 'pause-start.mp3',
    category: 'chimes',
    duration: 1.0,
    prompt: `Soft descending chime, G-E-C going down gently,
             relaxing exhale feeling, celesta with soft pad,
             peaceful transition to rest`,
  },
  {
    filename: 'pause-end.mp3',
    category: 'chimes',
    duration: 1.2,
    prompt: `Refreshing gentle chime, two notes C-E,
             crisp but soft celesta,
             feeling of waking up gently, ready to continue`,
  },
  {
    filename: 'warning.mp3',
    category: 'chimes',
    duration: 0.8,
    prompt: `Single soft G note on celesta, gentle reminder sound,
             not alarming, friendly heads-up,
             subtle notification without urgency`,
  },

  // 🌊 AMBIENT SOUNDS
  {
    filename: 'deep-focus.mp3',
    category: 'ambient',
    duration: 22, // Max für guten Loop
    prompt: `Deep ambient drone, warm analog synthesizer,
             slowly evolving texture, C minor, meditative,
             perfect for concentration and deep work,
             loopable seamless ambient`,
  },
  {
    filename: 'soft-rain.mp3',
    category: 'ambient',
    duration: 22,
    prompt: `Gentle rain falling on leaves, soft and consistent,
             no thunder, peaceful rainfall, nature ambience,
             continuous soft rain, loopable`,
  },
  {
    filename: 'night-mode.mp3',
    category: 'ambient',
    duration: 15,
    prompt: `Very minimal ambient, almost silence with subtle texture,
             distant soft tones, night atmosphere, barely audible drone,
             extremely quiet and peaceful`,
  },
  {
    filename: 'white-noise.mp3',
    category: 'ambient',
    duration: 10,
    prompt: `Clean white noise, consistent and smooth,
             no crackling or artifacts, perfect for masking,
             neutral frequency spectrum, loopable`,
  },

  // 🖱️ UI SOUNDS
  {
    filename: 'click.mp3',
    category: 'ui',
    duration: 0.5, // Minimum
    prompt: `Soft mechanical click, tactile button press,
             satisfying but quiet, like a premium keyboard,
             clean and minimal`,
  },
  {
    filename: 'toggle-on.mp3',
    category: 'ui',
    duration: 0.5,
    prompt: `Soft switch on sound, gentle upward pitch,
             confirmation feeling, satisfying click
             with subtle brightness`,
  },
  {
    filename: 'toggle-off.mp3',
    category: 'ui',
    duration: 0.5,
    prompt: `Soft switch off sound, gentle downward pitch,
             neutral deactivation, soft click
             with subtle lowering`,
  },
  {
    filename: 'modal-open.mp3',
    category: 'ui',
    duration: 0.5,
    prompt: `Soft whoosh opening, gentle air movement,
             like a window sliding open smoothly,
             elegant and subtle`,
  },
  {
    filename: 'modal-close.mp3',
    category: 'ui',
    duration: 0.5,
    prompt: `Soft whoosh closing, reverse of opening,
             gentle compression sound,
             like sliding a drawer closed softly`,
  },
  {
    filename: 'navigation.mp3',
    category: 'ui',
    duration: 0.5,
    prompt: `Very subtle transition sound, soft swish,
             page turning in silence,
             minimal and almost imperceptible`,
  },
  {
    filename: 'success.mp3',
    category: 'ui',
    duration: 0.5,
    prompt: `Gentle positive chime, two ascending notes,
             soft celebration, satisfying completion
             without being loud`,
  },
  {
    filename: 'error.mp3',
    category: 'ui',
    duration: 0.5,
    prompt: `Soft warning tone, single low note,
             not alarming but informative,
             gentle heads-up without negativity`,
  },
];

// ============================================
// GENERATOR FUNKTION
// ============================================

async function generateSound(config: SoundConfig): Promise<void> {
  const { filename, prompt, duration, category } = config;

  console.log(`🎵 Generating: ${category}/${filename}...`);

  try {
    // ElevenLabs API Call
    const response = await client.textToSoundEffects.convert({
      text: prompt,
      duration_seconds: duration,
      prompt_influence: 0.4, // Balance zwischen Prompt-Treue und Variabilität
    });

    // Response ist ein ReadableStream - zu Buffer konvertieren
    const chunks: Uint8Array[] = [];
    for await (const chunk of response) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Datei speichern
    const outputPath = join(OUTPUT_DIR, category, filename);
    await writeFile(outputPath, buffer);

    console.log(`   ✅ Saved: ${outputPath} (${buffer.length} bytes)`);
  } catch (error) {
    console.error(`   ❌ Failed: ${filename}`, error);
    throw error;
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('🎧 Particle Sound Generator');
  console.log('============================\n');

  // Verzeichnisse erstellen
  await mkdir(join(OUTPUT_DIR, 'chimes'), { recursive: true });
  await mkdir(join(OUTPUT_DIR, 'ambient'), { recursive: true });
  await mkdir(join(OUTPUT_DIR, 'ui'), { recursive: true });

  // Sounds generieren (sequentiell um Rate Limits zu vermeiden)
  let success = 0;
  let failed = 0;

  for (const sound of SOUNDS) {
    try {
      await generateSound(sound);
      success++;

      // Kleine Pause zwischen Requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch {
      failed++;
    }
  }

  // Summary
  console.log('\n============================');
  console.log(`✅ Success: ${success}/${SOUNDS.length}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}/${SOUNDS.length}`);
  }
  console.log('\n📁 Output: public/sounds/');
}

main().catch(console.error);
```

---

## Script ausführen

```bash
# Mit Environment Variable
ELEVENLABS_API_KEY=your_key pnpm tsx scripts/generate-sounds.ts

# Oder wenn in .env.local
pnpm dotenv -e .env.local -- tsx scripts/generate-sounds.ts
```

### Erwartete Ausgabe

```
🎧 Particle Sound Generator
============================

🎵 Generating: chimes/session-start.mp3...
   ✅ Saved: public/sounds/chimes/session-start.mp3 (48293 bytes)
🎵 Generating: chimes/session-end.mp3...
   ✅ Saved: public/sounds/chimes/session-end.mp3 (62841 bytes)
...
🎵 Generating: ui/error.mp3...
   ✅ Saved: public/sounds/ui/error.mp3 (12847 bytes)

============================
✅ Success: 17/17

📁 Output: public/sounds/
```

---

## Erweiterte Optionen

### Einzelnen Sound regenerieren

```typescript
// Am Ende von generate-sounds.ts hinzufügen:

// CLI: pnpm tsx scripts/generate-sounds.ts --only session-end.mp3
const onlyArg = process.argv.find(arg => arg.startsWith('--only='));
if (onlyArg) {
  const filename = onlyArg.split('=')[1];
  const sound = SOUNDS.find(s => s.filename === filename);
  if (sound) {
    await generateSound(sound);
    process.exit(0);
  }
}
```

### Mehrere Varianten generieren

```typescript
async function generateVariants(config: SoundConfig, count: number = 3) {
  for (let i = 1; i <= count; i++) {
    const variantConfig = {
      ...config,
      filename: config.filename.replace('.mp3', `_v${i}.mp3`),
    };
    await generateSound(variantConfig);
  }
}

// Nutzung:
// await generateVariants(SOUNDS[0], 3);
// → session-start_v1.mp3, session-start_v2.mp3, session-start_v3.mp3
```

---

## Kosten-Schätzung

| Kategorie | Sounds | Ø Dauer | Gesamt |
|-----------|--------|---------|--------|
| Chimes | 5 | 1.3s | ~6.5s |
| Ambient | 4 | 17s | ~68s |
| UI | 8 | 0.5s | ~4s |
| **Total** | 17 | - | **~78.5s** |

**ElevenLabs Pricing (Stand 2026):**
- ~$0.30 pro Minute Sound Effects
- **Geschätzte Kosten: ~$0.40 für alle 17 Sounds**
- Mit 3 Varianten pro Sound: ~$1.20

---

## File-Struktur nach Generierung

```
public/
└── sounds/
    ├── chimes/
    │   ├── session-start.mp3
    │   ├── session-end.mp3
    │   ├── pause-start.mp3
    │   ├── pause-end.mp3
    │   └── warning.mp3
    ├── ambient/
    │   ├── deep-focus.mp3
    │   ├── soft-rain.mp3
    │   ├── night-mode.mp3
    │   └── white-noise.mp3
    └── ui/
        ├── click.mp3
        ├── toggle-on.mp3
        ├── toggle-off.mp3
        ├── modal-open.mp3
        ├── modal-close.mp3
        ├── navigation.mp3
        ├── success.mp3
        └── error.mp3

scripts/
└── generate-sounds.ts
```

---

## Akzeptanzkriterien

### Script-Funktionalität
- [ ] **Given** ein gültiger API Key, **When** Script ausgeführt, **Then** werden alle 17 Sounds generiert
- [ ] **Given** ein Sound-Fehler, **When** Generierung fehlschlägt, **Then** wird Fehler geloggt und Script fährt fort
- [ ] **Given** `--only` Parameter, **When** Script ausgeführt, **Then** wird nur dieser Sound generiert

### Sound-Qualität
- [ ] **Given** alle generierten Sounds, **When** abgespielt, **Then** passen sie zur emotionalen Beschreibung
- [ ] **Given** Ambient-Sounds, **When** geloopt, **Then** sind sie nahtlos (oder nah dran)
- [ ] **Given** UI-Sounds, **When** abgespielt, **Then** sind sie kurz und unaufdringlich

### Integration
- [ ] **Given** generierte Sounds, **When** in Sound Engine geladen, **Then** spielen sie korrekt
- [ ] **Given** alle Sounds, **When** normalisiert, **Then** haben sie konsistente Lautstärke

---

## Post-Processing (Optional)

Falls Sounds noch bearbeitet werden müssen:

```bash
# FFmpeg für Batch-Normalisierung
for f in public/sounds/**/*.mp3; do
  ffmpeg -i "$f" -af "loudnorm=I=-16:TP=-1.5:LRA=11" -y "${f%.mp3}_normalized.mp3"
done

# Oder mit Audacity (manuell)
# 1. Öffnen
# 2. Effekt → Normalisieren → -3dB
# 3. Exportieren
```

---

## Definition of Done

- [ ] Script `scripts/generate-sounds.ts` erstellt
- [ ] ElevenLabs SDK installiert (`@elevenlabs/elevenlabs-js`)
- [ ] API Key in `.env.local` konfiguriert
- [ ] Script erfolgreich ausgeführt (17/17 Sounds)
- [ ] Sounds in `public/sounds/` gespeichert
- [ ] Sounds im Browser getestet
- [ ] Sounds klingen "Particle" (monochrom, elegant)
- [ ] Von mindestens 2 Personen gehört & approved

---

## Troubleshooting

### "API Key invalid"
```bash
# Prüfen ob Key gesetzt
echo $ELEVENLABS_API_KEY

# Key in .env.local?
cat .env.local | grep ELEVENLABS
```

### "Rate limit exceeded"
```typescript
// Längere Pause zwischen Requests
await new Promise(resolve => setTimeout(resolve, 3000)); // 3s statt 1s
```

### "Sound klingt nicht gut"
```typescript
// Prompt anpassen und nur diesen Sound regenerieren
pnpm tsx scripts/generate-sounds.ts --only=session-end.mp3
```

### "Ambient loops nicht nahtlos"
Das ist ein bekanntes Limit. Optionen:
1. Manuell in Audacity Crossfade hinzufügen
2. Prompt anpassen: "seamless loop, no beginning or end"
3. Längeren Sound generieren, Mitte verwenden

---

## Notizen

**Versionierung:** Das Script sollte in Git sein, die generierten Sounds können in `.gitignore` (und separat gespeichert) oder committed werden.

**Iteration:** Prompts können jederzeit angepasst werden. Ein erneuter Script-Aufruf überschreibt die alten Sounds.

**Konsistenz:** Durch gleiche `prompt_influence` und ähnliche Prompt-Strukturen sollten alle Sounds wie eine Familie klingen.

---

## Referenzen

- [ElevenLabs TypeScript SDK](https://github.com/elevenlabs/elevenlabs-js)
- [Sound Effects API Docs](https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert)
- [Sound Effects Quickstart](https://elevenlabs.io/docs/developers/guides/cookbooks/sound-effects)

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
