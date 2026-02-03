---
type: story
status: backlog
priority: p1
effort: 2
feature: "[[ideas/10x-breathing-guidance]]"
created: 2026-02-03
updated: 2026-02-03
done_date: null
tags: [10x, quick-win, wellbeing, break, breathing]
---

# POMO-337: Breathing Text-Guidance in Pausen

## User Story

> Als **Wissensarbeiter in der Pause**
> möchte ich **geführte Atemanweisungen sehen**,
> damit **ich die Breathing-Animation aktiv nutzen kann statt sie zu übersehen**.

## Kontext

**Problem:**
Break Breathing existiert bereits (Setting + Animation), aber niemand bemerkt es. Der Timer pulsiert subtil – ohne Text weiß der User nicht, wann er ein- oder ausatmen soll.

**Lösung:**
Text-Guidance via **bestehende StatusMessage**. Kein neues UI, nur ein neuer Prop.

**10x-Faktor:**
Von "Der Timer zittert irgendwie?" zu "Oh, Particle hat geführte Atemübungen!". Macht ein verstecktes Feature zum Killer-Feature.

## Akzeptanzkriterien

### Text-Guidance

- [ ] **Given** Break läuft + Breathing aktiviert, **When** Inhale-Phase, **Then** StatusMessage zeigt "Einatmen · · · 4"
- [ ] **Given** Break läuft + Breathing aktiviert, **When** Hold-Phase, **Then** StatusMessage zeigt "Halten · · · 3"
- [ ] **Given** Break läuft + Breathing aktiviert, **When** Exhale-Phase, **Then** StatusMessage zeigt "Ausatmen · · · 2"
- [ ] Countdown zählt von 4 → 1 pro Phase (Box Breathing: 4s pro Phase)
- [ ] Text-Übergang ist sanft (fade), kein hartes Springen

### Priorität

- [ ] **Given** Break + Breathing aktiv, **Then** Breathing-Text hat höchste Priorität (vor Wellbeing Hints)
- [ ] **Given** Break + Breathing NICHT aktiv, **Then** Wellbeing Hints erscheinen wie gewohnt
- [ ] **Given** Break pausiert, **Then** Breathing-Text pausiert auch

### Bestehende Features

- [ ] Animation bleibt unverändert (16s Box Breathing Cycle)
- [ ] Settings Toggle bleibt unverändert
- [ ] Breathing stoppt wenn Break endet

## Implementierung

### 1. Neuer Hook: `useBreathingGuide.ts`

```typescript
// src/hooks/useBreathingGuide.ts
'use client';

import { useState, useEffect } from 'react';

export type BreathingAction = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

export interface BreathingPhase {
  action: BreathingAction;
  countdown: number;
}

const BOX_BREATHING = [
  { action: 'inhale' as const, duration: 4 },
  { action: 'hold-in' as const, duration: 4 },
  { action: 'exhale' as const, duration: 4 },
  { action: 'hold-out' as const, duration: 4 },
];

/**
 * Tracks current breathing phase for text guidance.
 * Syncs with the 16s Box Breathing animation cycle.
 */
export function useBreathingGuide(
  isActive: boolean // true when: isBreak && isRunning && breakBreathingEnabled
): BreathingPhase | null {
  const [phase, setPhase] = useState<BreathingPhase | null>(null);

  useEffect(() => {
    if (!isActive) {
      setPhase(null);
      return;
    }

    let phaseIndex = 0;
    let countdown = BOX_BREATHING[0].duration;

    // Initial phase
    setPhase({ action: BOX_BREATHING[0].action, countdown });

    const interval = setInterval(() => {
      countdown--;

      if (countdown <= 0) {
        // Move to next phase
        phaseIndex = (phaseIndex + 1) % BOX_BREATHING.length;
        countdown = BOX_BREATHING[phaseIndex].duration;
      }

      setPhase({ action: BOX_BREATHING[phaseIndex].action, countdown });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  return phase;
}
```

### 2. StatusMessage erweitern

```typescript
// In StatusMessageProps
breathingPhase?: BreathingPhase | null;

// In getDisplayMessage() - hohe Priorität (nach countdown, message)
if (breathingPhase) {
  const labels: Record<BreathingAction, string> = {
    'inhale': 'Einatmen',
    'hold-in': 'Halten',
    'exhale': 'Ausatmen',
    'hold-out': 'Halten',
  };
  return `${labels[breathingPhase.action]} · · · ${breathingPhase.countdown}`;
}
```

### 3. Timer.tsx Integration

```typescript
// Import
import { useBreathingGuide } from '@/hooks/useBreathingGuide';

// In Timer component
const isBreathingActive = isBreak && state.isRunning && breakBreathingEnabled;
const breathingPhase = useBreathingGuide(isBreathingActive);

// Pass to StatusMessage
<StatusMessage
  // ... existing props
  breathingPhase={breathingPhase}
/>
```

### Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `src/hooks/useBreathingGuide.ts` | **NEU:** Phase-Tracking Hook |
| `src/components/timer/Timer.tsx` | Hook einbinden, Prop weiterreichen |
| `src/components/timer/StatusMessage.tsx` | `breathingPhase` Prop + Priority |

## UI/UX

**Break mit Breathing-Guidance:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                            04:32                                │
│                         (pulsiert)                              │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                     Einatmen · · · 3                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Phasen-Ablauf (16s Zyklus):**
```
Einatmen · · · 4
Einatmen · · · 3
Einatmen · · · 2
Einatmen · · · 1
Halten · · · 4
Halten · · · 3
...
Ausatmen · · · 4
...
Halten · · · 4
...
(repeat)
```

**Warum StatusMessage?**
- Konsistent mit bestehendem UI
- Keine neue Komponente nötig
- Gleiche Position wie Wellbeing Hints
- Sanfte Übergänge bereits implementiert

## Testing

### Manuell

- [ ] Break starten mit Breathing ON → Text-Guidance erscheint
- [ ] Countdown zählt korrekt 4 → 1
- [ ] Phasen wechseln korrekt (inhale → hold → exhale → hold)
- [ ] Text synchron mit Animation (Timer pulsiert mit)
- [ ] Break pausieren → Text pausiert
- [ ] Break beenden → Text verschwindet
- [ ] Breathing OFF → Keine Text-Guidance

### Edge Cases

- [ ] Break < 16s (nur Teil eines Zyklus)
- [ ] Breathing während Short Break vs Long Break
- [ ] Wechsel zwischen Breathing ON/OFF während Break

## Definition of Done

- [ ] `useBreathingGuide` Hook implementiert
- [ ] StatusMessage zeigt Breathing-Phase
- [ ] Animation und Text sind synchron
- [ ] Priorität korrekt (über Wellbeing Hints)
- [ ] TypeScript-Typen korrekt
- [ ] Lint & Typecheck grün

## Nicht im Scope (v1)

- Pattern-Auswahl (Box vs 4-7-8) → später in Settings
- Sound bei Phasenwechsel → später
- Zyklus-Counter ("Runde 2 von 4") → später
- Englische Texte (erstmal nur Deutsch)

## Spätere Erweiterungen

| Feature | Beschreibung |
|---------|--------------|
| Pattern-Auswahl | 4-7-8 Atmung als Alternative |
| Sound | Sanfter Gong bei Phasenwechsel |
| Zyklus-Counter | "Runde 2 von 4" |
| Lokalisierung | Englische Texte |

---

## Arbeitsverlauf

### Gestartet:
### Erledigt:
