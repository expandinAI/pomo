---
type: story
status: backlog
priority: p1
effort: 2
feature: "[[features/wellbeing]]"
created: 2026-01-25
updated: 2026-01-25
done_date: null
tags: [wellbeing, breathing, break, minimal, premium, p1]
---
	
# POMO-153: Der Timer atmet mit dir

## User Story

> Als **Mensch, der Pausen bewusster nutzen will**
> möchte ich **dass der Timer mich visuell zum ruhigen Atmen einlädt**,
> damit **ich mich entspanne, ohne aktiv eine Übung starten zu müssen**.

## Kontext

Link zum Feature: [[features/wellbeing]]

**Die Erkenntnis:** Breathing-Apps scheitern, weil sie Aufmerksamkeit fordern. Particle macht es anders – der Timer selbst wird zum Breathing Guide. Keine Prompts, keine Worte, keine Extra-UI.

**Particle-Philosophie:**
- **Null zusätzliche UI** – der Timer IS die Übung
- **Keine Prompts** – es passiert einfach (wenn aktiviert)
- **Keine Worte** – pure visuelle Kommunikation
- **Unbewusst wirksam** – User atmet automatisch mit
- **Premium** – subtil, elegant, Apple-würdig

## Das Konzept

### "Der Timer atmet"

Wenn Break startet und Breathing aktiviert ist, pulsiert die Timer-Anzeige sanft im Box-Breathing-Rhythmus:

```
        ┌─────────────────┐
        │                 │
        │     04:32       │  ← Zahlen pulsieren sanft
        │                 │     (scale 1.0 → 1.03 → 1.0)
        │      Break      │
        │                 │
        └─────────────────┘

             ◦   ◦   ◦      ← Partikel pulsieren optional mit
```

**Der Rhythmus (Box Breathing 4-4-4-4):**
- 4 Sekunden expandieren (Einatmen)
- 4 Sekunden halten
- 4 Sekunden kontrahieren (Ausatmen)
- 4 Sekunden halten

**Das ist alles.** Keine Anleitung. Der Timer atmet einfach.

## Warum das funktioniert

| Klassische Apps | Particle |
|-----------------|----------|
| Separater Breathing-Screen | Timer selbst pulsiert |
| "Möchtest du eine Übung?" | Keine Prompts |
| "Einatmen... Halten..." | Keine Worte |
| Fordert aktive Teilnahme | Wirkt auch unbewusst |
| Fühlt sich wie Arbeit an | Fühlt sich wie Magie an |

**Der Effekt:** User schauen auf den Timer und atmen automatisch mit – oft ohne es bewusst zu merken. Nach einer Woche realisieren sie: "Ich bin in Pausen viel ruhiger geworden."

## Akzeptanzkriterien

### Core Animation

- [ ] **Given** Break + Breathing ON, **When** Timer läuft, **Then** TimerDisplay pulsiert (scale 1.0 → 1.03)
- [ ] **Given** Breathing ON, **When** 4 Sek vergehen, **Then** Phase wechselt (expand → hold → contract → hold)
- [ ] **Given** Work Session, **When** Breathing ON, **Then** keine Animation (nur in Breaks)
- [ ] **Given** Break endet, **When** Übergang, **Then** Pulsieren stoppt sanft

### Animation-Qualität

- [ ] **Given** Pulsieren, **When** Übergang, **Then** butterweich (ease-in-out)
- [ ] **Given** Pulsieren, **When** User schaut, **Then** subtil, nicht ablenkend (max 3% scale)
- [ ] **Given** prefers-reduced-motion, **When** Breathing ON, **Then** keine Animation

### Settings

- [ ] **Given** Settings, **When** Timer-Sektion, **Then** "Break Breathing" Toggle sichtbar
- [ ] **Given** Default, **When** neue Installation, **Then** Breathing ist OFF
- [ ] **Given** Toggle, **When** Beschreibung, **Then** "Timer pulses during breaks"

### Optional: Partikel-Sync

- [ ] **Given** Breathing ON + Ambient Particles, **When** Break, **Then** Partikel pulsieren synchron
- [ ] **Given** Partikel-Sync, **When** Animation, **Then** subtile Opacity-Änderung (0.8 → 1.0)

## Technische Details

### Betroffene Dateien

```
src/
├── components/timer/
│   └── TimerDisplay.tsx        # ERWEITERN: Breathing-Animation
├── contexts/
│   └── TimerSettingsContext.tsx # breakBreathingEnabled: boolean
├── components/settings/
│   └── TimerSettings.tsx        # Toggle hinzufügen
└── components/effects/
    └── AmbientEffects.tsx       # Optional: Partikel-Sync
```

**Wichtig:** Kein neuer Component-Folder. Alles in bestehende Strukturen integriert.

### TimerDisplay Animation

```typescript
// In TimerDisplay.tsx
const breathingScale = useBreathingAnimation(isBreak && breathingEnabled);

// Hook
function useBreathingAnimation(enabled: boolean) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!enabled) return;

    // Box Breathing: 4-4-4-4 = 16 Sekunden Zyklus
    const phases = [
      { scale: 1.03, duration: 4000 },  // Einatmen
      { scale: 1.03, duration: 4000 },  // Halten
      { scale: 1.00, duration: 4000 },  // Ausatmen
      { scale: 1.00, duration: 4000 },  // Halten
    ];

    // Animation loop...
  }, [enabled]);

  return scale;
}

// Render
<motion.div
  animate={{ scale: breathingScale }}
  transition={{ duration: 4, ease: 'easeInOut' }}
>
  {formattedTime}
</motion.div>
```

### Settings State

```typescript
interface TimerSettings {
  // ... existing
  breakBreathingEnabled: boolean;  // Default: false
}
```

### Settings UI

```
┌─────────────────────────────────────────┐
│  Break Breathing                        │
│                                  [OFF]  │
│                                         │
│  Timer pulsiert sanft während Pausen    │
│  im Box-Breathing-Rhythmus (4-4-4-4).   │
│                                         │
│  Hilft beim Entspannen – auch wenn      │
│  du es nicht bewusst merkst.            │
└─────────────────────────────────────────┘
```

## Der "Wow"-Faktor

**Was Leute erzählen werden:**

> "Mein Timer atmet während der Pause. Ich hab erst nach einer Woche gemerkt, dass ich automatisch mitgeatmet habe. So subtil, so genial."

**Das ist Particle:**
- Minimal – null zusätzliche UI
- Effektiv – wirkt auch unbewusst
- Premium – Apple würde das feiern
- Storytelling – "Der Timer atmet"

## Wissenschaftlicher Hintergrund

### Box Breathing (4-4-4-4)

- **Navy SEALs** nutzen es zur Stress-Reduktion
- **Aktiviert Parasympathikus** (Entspannungs-Nervensystem)
- **Subtile visuelle Cues** können Atmung synchronisieren (Studien zu "visual pacing")
- **4 Sekunden** pro Phase = natürlicher Rhythmus

## Nicht im Scope (v1)

- Audio-Anleitung (widerspricht Philosophie)
- Verschiedene Breathing-Patterns (nur Box Breathing)
- "Einatmen/Ausatmen" Text-Labels
- Breathing während Work-Sessions
- Statistiken (wie oft genutzt)
- Prompts oder Hinweise ("Möchtest du...?")

## Testing

### Manuell zu testen

- [ ] Pulsieren nur in Breaks, nicht in Work
- [ ] Default ist OFF
- [ ] Animation ist subtil (nicht ablenkend)
- [ ] Übergang beim Phase-Wechsel ist smooth
- [ ] Break-Ende stoppt Animation sanft
- [ ] Reduced-Motion respektiert
- [ ] Optional: Partikel pulsieren synchron

## Definition of Done

- [ ] TimerDisplay pulsiert in Breaks (wenn aktiviert)
- [ ] Box-Breathing-Rhythmus (4-4-4-4)
- [ ] Settings-Toggle implementiert
- [ ] Default: OFF
- [ ] Animation ist butterweich
- [ ] Reduced-Motion Support
- [ ] Beide Themes getestet
- [ ] **Prüffrage:** "Atme ich automatisch mit, ohne nachzudenken?"

---

## Die Essenz

Andere Apps sagen: "Atme jetzt ein."
Particle sagt nichts. Der Timer atmet einfach. Und du mit ihm.

*"Der beste Breathing Guide ist der, den du nicht bemerkst."*
