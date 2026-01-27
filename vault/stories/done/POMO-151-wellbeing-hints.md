---
type: story
status: done
priority: p2
effort: 2
feature: "[[features/wellbeing]]"
created: 2026-01-27
updated: 2026-01-27
done_date: 2026-01-27
tags: [wellbeing, breaks, health, reflection, p2]
---

# POMO-151: Wellbeing Hints (Break Enhancement)

## User Story

> Als **Deep-Work-Nutzer**
> möchte ich **in meinen Pausen sanfte Hinweise für mein Wohlbefinden sehen**,
> damit **ich die Break-Zeit sinnvoll nutzen kann – ohne Schuld, ohne Druck**.

## Kontext

Link zum Feature: [[features/wellbeing]]
Link zur Analyse: [[features/break-reminders-analysis]]

**Die Erkenntnis:** Break Reminders während Focus widersprechen unserer Philosophie. Aber **Hints in der StatusMessage während der Pause** – das ist Particle.

**Der Unterschied:**
- ❌ "Du hast vergessen, Pause zu machen" (Schuld)
- ❌ "Trink jetzt Wasser!" (Direktive)
- ✅ "Zeit für einen Schluck Wasser?" (Einladung)
- ✅ "Nutze die Zeit, um aus dem Fenster zu schauen" (Möglichkeit)

---

## Design-Philosophie

### Kein Befehl, sondern eine Einladung

> "Das Beste, was Particle tun kann, ist Raum zu schaffen – auch in der Pause."

Die Hints sind:
- **Möglichkeiten**, keine Anweisungen
- **Einladungen**, keine Befehle
- **Inspiration**, keine Checkliste

### Die Sprache

| Statt | Schreibe |
|-------|----------|
| "Trink Wasser!" | "Zeit für einen Schluck?" |
| "Du solltest aufstehen" | "Guter Moment zum Aufstehen" |
| "Vergiss nicht..." | (gar nicht verwenden) |
| "Mach X!" | "Nutze die Zeit für..." |

### Das visuelle Prinzip

- **Keine neue UI** – Nutzt die bestehende StatusMessage-Zeile
- **Dezent** – Gleicher Style wie andere Status-Messages
- **Clean** – Timer-Bereich bleibt unberührt
- **Wechselnd** – Nicht immer derselbe Hint

---

## UX-Konzept

### Wo: In der StatusMessage-Zeile (unten am Screen)

Die StatusMessage zeigt bereits kontextuelle Infos:
- Auto-Start Countdown
- "Skipped to Focus"
- Session Feedback
- Preset-Beschreibungen (hover)

**Neu:** Wellbeing Hints als niedrigste Priorität während Break.

### Wann: Nur während Break, wenn nichts anderes angezeigt wird

- ✅ Short Break (5 min) – wenn kein anderer Message aktiv
- ✅ Long Break (15-30 min) – wenn kein anderer Message aktiv
- ❌ Niemals während Focus
- ❌ Niemals wenn Toast/Countdown/etc. aktiv

### Wie: Integration in StatusMessage-Prioritätssystem

```
StatusMessage Prioritäten (bestehend):
1. Auto-Start Countdown
2. Explicit message (Toast, Skip, etc.)
3. Session Feedback
4. Preset hover (idle)
5. Session status (running)

NEU:
6. Wellbeing Hint (nur Break, niedrigste Priorität)
```

### Visuelles Beispiel

```
┌─────────────────────────────────────┐
│                                     │
│              4:32                   │
│              Break                  │
│                                     │
│                                     │
│                                     │
│   🥛 Zeit für einen Schluck Wasser? │  ← StatusMessage
└─────────────────────────────────────┘
```

---

## Die Hints

### Kategorie: Hydration

| Icon | Hint |
|------|------|
| 🥛 | Zeit für einen Schluck Wasser? |
| 💧 | Dein Körper freut sich über Wasser |

### Kategorie: Augen

| Icon | Hint |
|------|------|
| 👀 | Schau kurz in die Ferne |
| 🪟 | Gib deinen Augen eine kleine Pause |

### Kategorie: Bewegung

| Icon | Hint |
|------|------|
| 🚶 | Guter Moment zum Aufstehen |
| 🧘 | Einmal strecken tut gut |

### Kategorie: Mindfulness

| Icon | Hint |
|------|------|
| 🌬️ | Tief durchatmen |
| ✨ | Genieß den Moment |

---

## Technische Details

### Hint-Datenstruktur

```typescript
// src/lib/wellbeing-hints.ts

interface WellbeingHint {
  id: string;
  icon: string;
  text: string;
  category: 'hydration' | 'eyes' | 'movement' | 'mindfulness';
}

export const WELLBEING_HINTS: WellbeingHint[] = [
  { id: 'water-1', icon: '🥛', text: 'Zeit für einen Schluck Wasser?', category: 'hydration' },
  { id: 'water-2', icon: '💧', text: 'Dein Körper freut sich über Wasser', category: 'hydration' },
  { id: 'eyes-1', icon: '👀', text: 'Schau kurz in die Ferne', category: 'eyes' },
  { id: 'eyes-2', icon: '🪟', text: 'Gib deinen Augen eine kleine Pause', category: 'eyes' },
  { id: 'move-1', icon: '🚶', text: 'Guter Moment zum Aufstehen', category: 'movement' },
  { id: 'move-2', icon: '🧘', text: 'Einmal strecken tut gut', category: 'movement' },
  { id: 'mind-1', icon: '🌬️', text: 'Tief durchatmen', category: 'mindfulness' },
  { id: 'mind-2', icon: '✨', text: 'Genieß den Moment', category: 'mindfulness' },
];

export function getRandomHint(excludeId?: string): WellbeingHint {
  const available = excludeId
    ? WELLBEING_HINTS.filter(h => h.id !== excludeId)
    : WELLBEING_HINTS;
  return available[Math.floor(Math.random() * available.length)];
}

export function formatHint(hint: WellbeingHint): string {
  return `${hint.icon} ${hint.text}`;
}
```

### Hook für Hint-Rotation

```typescript
// src/hooks/useWellbeingHint.ts

import { useState, useEffect, useRef } from 'react';
import { getRandomHint, formatHint, type WellbeingHint } from '@/lib/wellbeing-hints';

interface UseWellbeingHintOptions {
  isBreak: boolean;
  rotationInterval?: number; // Default: 35000ms (35 Sekunden)
  initialDelay?: number;     // Default: 3000ms (3 Sekunden)
}

export function useWellbeingHint({
  isBreak,
  rotationInterval = 35000,
  initialDelay = 3000
}: UseWellbeingHintOptions): string | null {
  const [hint, setHint] = useState<WellbeingHint | null>(null);
  const lastHintId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isBreak) {
      setHint(null);
      lastHintId.current = undefined;
      return;
    }

    // Initial hint after delay
    const initialTimeout = setTimeout(() => {
      const newHint = getRandomHint();
      setHint(newHint);
      lastHintId.current = newHint.id;
    }, initialDelay);

    // Rotation interval
    const interval = setInterval(() => {
      const newHint = getRandomHint(lastHintId.current);
      setHint(newHint);
      lastHintId.current = newHint.id;
    }, rotationInterval);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isBreak, rotationInterval, initialDelay]);

  return hint ? formatHint(hint) : null;
}
```

### Integration in Timer.tsx

```typescript
// In Timer.tsx

import { useWellbeingHint } from '@/hooks/useWellbeingHint';

// Im Component Body:
const isBreak = state.mode === 'shortBreak' || state.mode === 'longBreak';
const wellbeingHint = useWellbeingHint({ isBreak });

// Bei StatusMessage:
<StatusMessage
  message={...}
  wellbeingHint={wellbeingHint}  // NEU
  // ... andere props
/>
```

### Erweiterung StatusMessage.tsx

```typescript
// In StatusMessage.tsx

interface StatusMessageProps {
  // ... bestehende props
  wellbeingHint?: string | null;  // NEU
}

// In getDisplayMessage():
function getDisplayMessage(): string | null {
  // 1. Auto-start countdown (highest priority)
  if (isCountdownActive) {
    return `${nextMode || 'Next'} in ${autoStartCountdown} · Space to cancel`;
  }

  // 2. Explicit message (toast, celebration, skip, etc.)
  if (message) {
    return message;
  }

  // 3. Session Feedback
  if (sessionFeedback) {
    return formatFeedbackMessage(sessionFeedback);
  }

  // 4. Preset hover (only when idle)
  if (hoveredPresetId && !isRunning) {
    return PRESET_DESCRIPTIONS[hoveredPresetId] || null;
  }

  // 5. Session status (only when hovering collapsed view)
  if (isCollapsedHovered && isRunning && durations && mode) {
    // ... existing logic
  }

  // 6. NEU: Wellbeing Hint (nur während Break, niedrigste Priorität)
  if (wellbeingHint) {
    return wellbeingHint;
  }

  return null;
}
```

---

## Akzeptanzkriterien

### Anzeige

- [ ] **Given** Break aktiv + keine andere Message, **When** 3 Sek vergangen, **Then** Hint in StatusMessage
- [ ] **Given** Hint sichtbar, **When** 35 Sek vergangen, **Then** neuer Hint (fade transition)
- [ ] **Given** Focus aktiv, **When** immer, **Then** KEIN Hint sichtbar
- [ ] **Given** Break + Toast aktiv, **When** Hint, **Then** Toast hat Priorität

### Priorität

- [ ] **Given** Auto-Start Countdown aktiv, **When** Break, **Then** Countdown hat Priorität
- [ ] **Given** Session Feedback aktiv, **When** Break, **Then** Feedback hat Priorität
- [ ] **Given** Keine andere Message, **When** Break, **Then** Hint wird angezeigt

### Inhalt

- [ ] **Given** Hints, **When** Text, **Then** einladend, nicht direktiv
- [ ] **Given** Hints, **When** Format, **Then** "Icon Text" (z.B. "🥛 Zeit für Wasser?")
- [ ] **Given** Hint-Wechsel, **When** Rotation, **Then** nicht derselbe Hint zweimal hintereinander

### Edge Cases

- [ ] **Given** Short Break endet, **When** Hint sichtbar, **Then** Hint verschwindet
- [ ] **Given** User startet Focus manuell, **When** Break-Hint sichtbar, **Then** Hint verschwindet
- [ ] **Given** Break pausiert, **When** Hint, **Then** Hint bleibt (Break ist immer noch Break)

---

## Was wir NICHT bauen

| Feature | Warum nicht |
|---------|-------------|
| Hints während Focus | Widerspricht Philosophie |
| Eigene UI-Komponente | StatusMessage reicht |
| Notification/Sound | Zu aufdringlich |
| Tracking ("Wasser getrunken?") | Gamification |
| Settings für Kategorien | Feature Creep (v1) |
| Klick-to-dismiss | Nicht nötig (rotiert automatisch) |

---

## Dateien

| Datei | Änderung |
|-------|----------|
| `src/lib/wellbeing-hints.ts` | NEU: Hint-Daten + Utilities |
| `src/hooks/useWellbeingHint.ts` | NEU: Rotation-Hook |
| `src/components/timer/StatusMessage.tsx` | Prop + Priorität hinzufügen |
| `src/components/timer/Timer.tsx` | Hook nutzen, Prop übergeben |

---

## Definition of Done

- [ ] `wellbeing-hints.ts` mit 8 Hints erstellt
- [ ] `useWellbeingHint` Hook implementiert
- [ ] StatusMessage um `wellbeingHint` Prop erweitert
- [ ] Priorität korrekt (niedrigste, nur Break)
- [ ] Rotation alle ~35 Sekunden
- [ ] Kein Hint während Focus
- [ ] Fade-Animation (bestehendes StatusMessage-Pattern)
- [ ] Code Review abgeschlossen
- [ ] **Prüffrage:** "Fühlt es sich wie eine Einladung an, nicht wie ein Befehl?" ✓

---

## Beispiel-Texte (Final)

| Icon | Text |
|------|------|
| 🥛 | Zeit für einen Schluck Wasser? |
| 💧 | Dein Körper freut sich über Wasser |
| 👀 | Schau kurz in die Ferne |
| 🪟 | Gib deinen Augen eine kleine Pause |
| 🚶 | Guter Moment zum Aufstehen |
| 🧘 | Einmal strecken tut gut |
| 🌬️ | Tief durchatmen |
| ✨ | Genieß den Moment |

---

*"Die beste Pause ist die, die sich nicht wie Pflicht anfühlt."*
