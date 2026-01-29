---
type: story
status: done
priority: p2
effort: 2
feature: "[[features/visual-identity]]"
created: 2026-01-27
updated: 2026-01-27
done_date: 2026-01-29
tags: [theme, night-mode, visual, reduction, p2]
---

# POMO-130: Night Mode – Noch mehr Reduktion

## User Story

> Als **Particle-Nutzer, der spät abends arbeitet**
> möchte ich **einen gedämpfteren visuellen Modus**,
> damit **die App meine Augen schont und mich nicht aus der Ruhe bringt**.

## Kontext

**Particle ist immer dunkel.** Der weiße Punkt auf Schwarz ist unsere DNA. Es gibt keinen Light Mode – das wäre ein anderes Produkt.

Aber: Dunkel ist nicht gleich dunkel.

- **Day Mode** = Produktiver Fokus, volle Energie
- **Night Mode** = Ruhiges Arbeiten, winding down

Der Unterschied ist nicht Schwarz vs. Weiß – sondern **Intensität**.

## Design-Philosophie

> "Night Mode ist Day Mode mit gedimmtem Licht."

### Was Night Mode NICHT ist

- ❌ Ein Light Mode
- ❌ Sepia/Warm-Filter
- ❌ Ein komplett anderes Design
- ❌ Weniger Funktionalität

### Was Night Mode IST

- ✅ Reduzierter Kontrast (sanfteres Weiß)
- ✅ Weniger visuelle Effekte
- ✅ Langsamere Animationen
- ✅ Die gleiche App, nur ruhiger

---

## Die zwei Modi

### Day Mode (Standard)

Der produktive, energetische Modus für fokussiertes Arbeiten.

| Aspekt | Verhalten |
|--------|-----------|
| **Text** | Pures Weiß (#FFFFFF) |
| **Kontrast** | Maximum |
| **Celebrations** | Volle Partikel-Animation |
| **Visual Timer Ring** | Sichtbar |
| **Breathing Animation** | Aktiv (wenn enabled) |
| **Glow Effects** | Sichtbar |
| **Animationen** | Spring-Physics, 300ms |

### Night Mode

Der ruhige, gedämpfte Modus für spätes Arbeiten.

| Aspekt | Verhalten |
|--------|-----------|
| **Text** | Gedämpftes Weiß (#C8C8C8) |
| **Kontrast** | Reduziert |
| **Celebrations** | Aus |
| **Visual Timer Ring** | Gedämpft (reduzierte Opacity) |
| **Session Particles** | Gedämpft (reduzierte Helligkeit) |
| **Breathing Animation** | Aus |
| **Glow Effects** | Aus |
| **Animationen** | Langsamer, 500ms |

---

## Visueller Vergleich

### Day Mode
```
┌─────────────────────────────────────┐
│                                     │
│             25:00                   │  ← Pures Weiß
│           ◯━━━━━━━◯                 │  ← Visual Ring sichtbar
│                                     │
│         [Start Focus]               │
│            Space                    │
│                                     │
│    ●  ●  ●  ○  ○  ○  ○  ○          │  ← Volle Helligkeit
│                                     │
│      Time for a sip of water?       │
└─────────────────────────────────────┘
```

### Night Mode
```
┌─────────────────────────────────────┐
│                                     │
│             25:00                   │  ← Gedämpftes Weiß
│           ◯─────◯                   │  ← Ring gedämpft (15% opacity)
│                                     │
│         [Start Focus]               │
│            Space                    │
│                                     │
│    ◦  ◦  ◦  ○  ○  ○  ○  ○          │  ← Particles gedämpft
│                                     │
│      Time for a sip of water?       │
└─────────────────────────────────────┘
```

---

## Technische Umsetzung

### CSS Custom Properties

```css
/* globals.css */

:root {
  /* Day Mode (default) */
  --color-primary: #FFFFFF;
  --color-secondary: #A0A0A0;
  --color-tertiary: #606060;
  --particle-brightness: 1;
  --ring-opacity: 1;
  --animation-duration: 300ms;
  --effects-enabled: 1;
}

:root.night-mode {
  /* Night Mode */
  --color-primary: #C8C8C8;
  --color-secondary: #888888;
  --color-tertiary: #505050;
  --particle-brightness: 0.35;
  --ring-opacity: 0.15;
  --animation-duration: 500ms;
  --effects-enabled: 0;
}
```

### Settings Hook

```typescript
// src/hooks/useNightMode.ts

interface UseNightModeReturn {
  isNightMode: boolean;
  toggleNightMode: () => void;
  setNightMode: (enabled: boolean) => void;
}

export function useNightMode(): UseNightModeReturn {
  // Persisted in localStorage
  // Applies 'night-mode' class to :root
}
```

### Effect Conditions

```typescript
// In components that have effects:

const { isNightMode } = useNightMode();

// Celebrations
if (celebrationEnabled && !isNightMode) {
  triggerCelebration();
}

// Visual Timer Ring
<VisualTimerRing visible={visualTimerEnabled && !isNightMode} />

// Break Breathing
<BreathingAnimation enabled={breakBreathingEnabled && !isNightMode} />
```

---

## Akzeptanzkriterien

### Mode Switching

- [ ] **Given** Day Mode, **When** Toggle, **Then** Night Mode aktiviert
- [ ] **Given** Night Mode, **When** Toggle, **Then** Day Mode aktiviert
- [ ] **Given** Mode Change, **When** App Restart, **Then** Mode bleibt erhalten

### Visual Changes

- [ ] **Given** Night Mode, **When** Text, **Then** gedämpftes Weiß (#C8C8C8)
- [ ] **Given** Night Mode, **When** Visual Ring, **Then** 15% Opacity
- [ ] **Given** Night Mode, **When** Session Particles, **Then** 35% Brightness
- [ ] **Given** Night Mode, **When** Session Complete, **Then** keine Celebration

### Settings Integration

- [ ] **Given** Settings, **When** Night Mode, **Then** Toggle sichtbar
- [ ] **Given** Night Mode ON, **When** Visual Timer Setting, **Then** deaktiviert/ausgegraut
- [ ] **Given** Night Mode ON, **When** Celebration Setting, **Then** deaktiviert/ausgegraut

### Keyboard Shortcut

- [ ] **Given** Any Mode, **When** `Shift+N`, **Then** Toggle Night Mode
- [ ] **Given** Command Palette, **When** "night", **Then** Toggle Option sichtbar

---

## UI/UX

### Settings Toggle

```
┌─────────────────────────────────────────────────────────┐
│  Night Mode                                    [●    ]  │
│  Reduced contrast, no effects                           │
└─────────────────────────────────────────────────────────┘
```

### StatusMessage Feedback

Nach Toggle:
- "Night mode" (wenn aktiviert)
- "Day mode" (wenn deaktiviert)

---

## Was NICHT im Scope ist

| Feature | Warum nicht |
|---------|-------------|
| Automatischer Zeitplan | Feature Creep (v1 ist manuell) |
| System-Theme folgen | Particle ist immer dunkel |
| Anpassbare Farben | Widerspricht Reduktion |
| Transition-Animation | Nicht nötig, instant switch |

---

## Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `src/app/globals.css` | CSS Variables für beide Modi |
| `src/hooks/useNightMode.ts` | **NEU:** Night Mode Hook |
| `src/contexts/TimerSettingsContext.tsx` | Night Mode State |
| `src/components/settings/NightModeSettings.tsx` | **NEU:** Toggle |
| `src/components/timer/Timer.tsx` | Effect Conditions |
| `src/components/timer/TimerDisplay.tsx` | Conditional Ring |
| `src/components/timer/CelebrationAnimation.tsx` | Night Mode Check |

---

## Definition of Done

- [ ] CSS Variables für Day/Night definiert
- [ ] `useNightMode` Hook implementiert
- [ ] Settings Toggle vorhanden
- [ ] Keyboard Shortcut `Shift+N` funktioniert
- [ ] Celebrations deaktiviert in Night Mode
- [ ] Visual Timer Ring gedämpft in Night Mode (15% opacity)
- [ ] Session Particles gedämpft in Night Mode (35% brightness)
- [ ] Breathing Animation deaktiviert in Night Mode
- [ ] Text-Kontrast reduziert in Night Mode
- [ ] Mode wird persistiert
- [ ] Feedback in StatusMessage

---

## Philosophie-Check

> "Würde ein einzelner weißer Punkt stolz sein, Teil davon zu sein?"

**Ja.** Night Mode ist nicht weniger Particle – es ist Particle, das sich an den Moment anpasst. Wie ein Raum, in dem man das Licht dimmt, ohne ihn zu verlassen.

---

*"Die beste Nacht-Arbeit fühlt sich an wie ein ruhiges Gespräch, nicht wie ein Vortrag."*
