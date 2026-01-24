---
type: story
status: done
priority: p1
effort: 3
feature: "[[features/timer]]"
created: 2026-01-24
updated: 2026-01-24
done_date: 2026-01-24
tags: [timer, ux, onboarding, presets, status-message]
---

# POMO-151: Kontextuelle StatusMessage

## User Story

> Als **User**
> möchte ich **kontextbezogene Informationen in der StatusMessage sehen**,
> damit **ich die verschiedenen Modi verstehe und meinen aktuellen Zustand im Blick habe**.

## Kontext

Die StatusMessage unter dem Timer ist aktuell nur für Übergänge genutzt ("Focus time", "Break time"). Sie könnte viel mehr leisten:

1. **Preset-Onboarding** - Bei Hover über Presets erklärt sie, wann welcher Modus passt
2. **Session-Status** - Während einer Session zeigt sie alle relevanten Einstellungen
3. **Break-Kontext** - Während eines Breaks zeigt sie, was als nächstes kommt

**Philosophie:** Die StatusMessage wird zum "stillen Begleiter", der kontextuelle Intelligenz zeigt, ohne aufdringlich zu sein.

## Drei Kontexte

### 1. Preset-Hover (Timer idle)

Wenn der User über ein Preset hovert, zeigt die StatusMessage eine kurze Erklärung:

| Preset | StatusMessage |
|--------|--------------|
| **Classic** | "The original Pomodoro · 25 min focus, 5 min break · Perfect for getting started" |
| **Deep Work** | "Based on DeskTime research · 52 min focus, 17 min break · For demanding tasks" |
| **90-Min** | "Ultradian rhythm · 90 min deep sessions · Matches your body's natural cycles" |
| **Custom** | "Your personal rhythm · Adjust times in settings (⌘ ,)" |

**Animation:** Sanfter Fade beim Wechsel zwischen Presets.

### 2. Work-Session läuft

Zeigt den aktuellen Status und relevante Einstellungen:

```
25 min focus · 5 min break after · Overflow off · Auto-start on
```

Oder bei Custom:
```
45 min focus · 10 min break after · Overflow on
```

**Bestandteile:**
- Aktuelle Work-Dauer
- Nächste Break-Dauer
- Overflow-Status (on/off)
- Auto-Start-Status (on/off)

### 3. Break-Session läuft

Zeigt Break-Typ und was als nächstes kommt:

```
Short break · 5 min to recharge · Next: focus session
```

Oder bei Long Break:
```
Long break · 15 min to recover · Next: new focus cycle
```

### 4. Idle State (kein Hover)

Default-Zustand ohne Hover:

```
Press Space to start · [aktives Preset-Label]
```

## Akzeptanzkriterien

### Preset-Hover
- [ ] **Given** Timer idle, **When** Hover über "Classic", **Then** StatusMessage zeigt Classic-Beschreibung
- [ ] **Given** Timer idle, **When** Hover über "Deep Work", **Then** StatusMessage zeigt Deep Work-Beschreibung
- [ ] **Given** Timer idle, **When** Hover über "90-Min", **Then** StatusMessage zeigt Ultradian-Beschreibung
- [ ] **Given** Timer idle, **When** Hover über "Custom", **Then** StatusMessage zeigt Custom-Beschreibung mit Hinweis auf Settings
- [ ] **Given** Preset-Hover, **When** Mouse verlässt, **Then** zurück zu Default-Message
- [ ] **Given** Preset-Wechsel, **When** Animation, **Then** sanfter Fade (keine harten Cuts)

### Work-Session Status
- [ ] **Given** Work läuft, **When** StatusMessage angezeigt, **Then** zeigt aktuelle Work-Dauer
- [ ] **Given** Work läuft, **When** StatusMessage angezeigt, **Then** zeigt nächste Break-Dauer
- [ ] **Given** Overflow enabled, **When** StatusMessage angezeigt, **Then** zeigt "Overflow on"
- [ ] **Given** Overflow disabled, **When** StatusMessage angezeigt, **Then** zeigt "Overflow off"
- [ ] **Given** Auto-Start enabled, **When** StatusMessage angezeigt, **Then** zeigt "Auto-start on"
- [ ] **Given** Auto-Start disabled, **When** StatusMessage angezeigt, **Then** zeigt "Auto-start off"

### Break-Session Status
- [ ] **Given** Short Break läuft, **When** StatusMessage angezeigt, **Then** zeigt "Short break"
- [ ] **Given** Long Break läuft, **When** StatusMessage angezeigt, **Then** zeigt "Long break"
- [ ] **Given** Break läuft, **When** StatusMessage angezeigt, **Then** zeigt Break-Dauer
- [ ] **Given** Break läuft, **When** StatusMessage angezeigt, **Then** zeigt "Next: focus session"

## Technische Details

### Props-Erweiterung für StatusMessage

```typescript
interface StatusMessageProps {
  mode: SessionType;
  isRunning: boolean;
  isPaused: boolean;
  showCelebration: boolean;
  showSkipMessage: boolean;
  autoStartCountdown: number | null;

  // NEU: Kontextuelle Infos
  hoveredPreset?: string | null;        // ID des gehoverten Presets
  durations: TimerDurations;            // Aktuelle Dauern
  overflowEnabled: boolean;             // Overflow-Setting
  autoStartEnabled: boolean;            // Auto-Start-Setting
  nextBreakType: 'shortBreak' | 'longBreak'; // Für Work: welcher Break kommt?
}
```

### Preset-Beschreibungen

```typescript
const PRESET_DESCRIPTIONS: Record<string, string> = {
  classic: "The original Pomodoro · 25 min focus, 5 min break · Perfect for getting started",
  deepWork: "Based on DeskTime research · 52 min focus, 17 min break · For demanding tasks",
  ultradian: "Ultradian rhythm · 90 min deep sessions · Matches your body's natural cycles",
  custom: "Your personal rhythm · Adjust times in settings",
};
```

### Integration mit PresetSelector

PresetSelector muss einen `onHover`-Callback erhalten:

```typescript
interface PresetSelectorProps {
  // ... existing props
  onPresetHover?: (presetId: string | null) => void;
}
```

## UI States

### Preset-Hover (Classic)
```
┌─────────────────────────────────────────────────────────────────┐
│                          25:00                                  │
│                                                                 │
│     [Classic]   Deep Work   90-Min   Custom                     │
│        ↑ hovered                                                │
│                                                                 │
│   The original Pomodoro · 25 min focus, 5 min break ·           │
│   Perfect for getting started                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Work läuft
```
┌─────────────────────────────────────────────────────────────────┐
│                          18:42                                  │
│                                                                 │
│   25 min focus · 5 min break after · Overflow off · Auto-start on │
└─────────────────────────────────────────────────────────────────┘
```

### Break läuft
```
┌─────────────────────────────────────────────────────────────────┐
│                          03:28                                  │
│                                                                 │
│         Short break · 5 min to recharge · Next: focus session   │
└─────────────────────────────────────────────────────────────────┘
```

## Animation

| Zustand | Animation | Timing |
|---------|-----------|--------|
| Preset-Hover wechsel | Fade out/in | 150ms |
| Session-Start | Fade zu Session-Status | 200ms |
| Session-Ende | Fade zu Default | 200ms |

## Komponenten-Änderungen

1. **StatusMessage.tsx** - Erweitern um neue Props und Rendering-Logik
2. **PresetSelector.tsx** - `onPresetHover` Callback hinzufügen
3. **Timer.tsx** - State für `hoveredPreset` und Props durchreichen

## Definition of Done

- [ ] Preset-Hover zeigt Beschreibungen
- [ ] Work-Session zeigt Dauern und Settings
- [ ] Break-Session zeigt Typ und nächsten Schritt
- [ ] Animationen sind flüssig
- [ ] Texte sind prägnant und hilfreich
- [ ] Kein visuelles "Springen" bei Wechseln

## Notizen

- Die Beschreibungen sollten kurz sein (max 2 Zeilen)
- Fokus auf "Werbung" für die Modi - warum sollte ich diesen wählen?
- Bei Custom: Hinweis auf Settings ermutigt zur Anpassung
- Später: Dynamische Tipps basierend auf Nutzungsverhalten
