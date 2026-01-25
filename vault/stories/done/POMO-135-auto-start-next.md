---
type: story
status: done
priority: p1
effort: 3
feature: timer-enhancements
created: 2026-01-23
updated: 2026-01-25
done_date: 2026-01-25
tags: [timer, flow, power-user, keyboard]
---

# POMO-135: Auto-Start Next Session

## User Story

> Als **Power-User im Flow**
> möchte ich **dass der nächste Timer automatisch startet**,
> damit ich **meinen Rhythmus nicht durch manuelles Starten unterbreche**.

## Kontext

Nach einer Work-Session folgt Break. Nach Break folgt Work. Für Nutzer im Deep-Work-Flow ist jeder manuelle Klick eine Unterbrechung. Auto-Start hält den Rhythmus aufrecht.

**Particle-Philosophie:**
- Opt-in Feature für Power-User. Default: Aus.
- Keine Bevormundung, volle Kontrolle.
- Subtil und elegant – kein "in your face" Countdown.
- Keyboard-first: Shift+A zum Togglen.

## Design-Entscheidungen

| Aspekt | Entscheidung | Begründung |
|--------|--------------|------------|
| Countdown-Dauer | **Konfigurierbar** (3/5/10s) | Power-User wollen Kontrolle |
| UI-Location | **StatusMessage-Area (unten)** | Timer bleibt clean, konsistent mit System |
| Auto-Indikator | **Keiner** | Minimal – zeigt sich nur beim Countdown |
| Granularität | **Ein Toggle** | Simpel: AN oder AUS für alles |
| Background-Tab | **Still starten** | Kein Notification-Spam |
| Sound | **Kurzer Chime** | Dezentes Audio-Feedback |
| Shortcuts | **Shift+A + Cmd+K** | Quick-Toggle + Command Palette |

**Philosophie:** Auto-Start ist "unsichtbar" bis er gebraucht wird. Kein persistenter Hinweis – der Countdown selbst ist der Hinweis.

## Akzeptanzkriterien

### Core Flow
- [ ] **Given** Auto-Start ON + Work endet, **When** Timer completed, **Then** Countdown in StatusMessage + Break startet danach
- [ ] **Given** Auto-Start ON + Break endet, **When** Timer completed, **Then** Countdown in StatusMessage + Work startet danach
- [ ] **Given** Auto-Start ON, **When** Countdown läuft, **Then** kann ich mit Space/Escape abbrechen
- [ ] **Given** Auto-Start OFF, **When** Timer endet, **Then** klassisches Verhalten (manueller Start)

### StatusMessage UI
- [ ] **Given** Auto-Start ON + Timer läuft, **When** ich nach unten schaue, **Then** sehe ich nichts (kein Hinweis)
- [ ] **Given** Auto-Start ON + Session complete, **When** Countdown startet, **Then** StatusMessage zeigt "Break in 5 · Space to cancel"
- [ ] **Given** Countdown läuft, **When** Sekunde vergeht, **Then** Zahl animiert sanft (5 → 4 → 3...)
- [ ] **Given** Countdown gecancelled, **When** Cancel passiert, **Then** "Well done!" erscheint + normale Controls

### Konfiguration
- [ ] **Given** Settings offen, **When** ich Countdown-Zeit ändere, **Then** drei Optionen: 3s / 5s / 10s
- [ ] **Given** Settings, **When** ich Toggle ändere, **Then** sofort aktiv ohne Restart
- [ ] **Given** Timer läuft, **When** ich Shift+A drücke, **Then** Auto-Start toggelt + Toast-Feedback

### Integration
- [ ] **Given** Overflow Mode aktiv, **When** in Overflow, **Then** Auto-Start wartet auf Done-Button
- [ ] **Given** Tab im Hintergrund, **When** Auto-Start triggert, **Then** Timer startet still (keine Notification)
- [ ] **Given** Command Palette offen, **When** ich "auto" tippe, **Then** "Toggle Auto-Start" erscheint

### Sound
- [ ] **Given** Auto-Start ON + Sound enabled, **When** Countdown endet, **Then** kurzer Chime spielt
- [ ] **Given** Mute aktiv, **When** Auto-Start triggert, **Then** kein Sound

## Technische Details

### Betroffene Dateien
```
src/
├── components/timer/
│   ├── Timer.tsx               # Auto-Start State + Logik + StatusMessage Props
│   └── StatusMessage.tsx       # ERWEITERN: Auto-Start Indikator + Countdown
├── components/settings/
│   └── TimerSettings.tsx       # Toggle + Countdown-Dauer Selector
├── contexts/
│   └── TimerSettingsContext.tsx # autoStartEnabled, autoStartDelay
├── hooks/
│   └── useSound.ts             # Neuer "autostart" Sound
└── lib/
    └── sounds.ts               # Sound-Definition
```

**Wichtig:** Keine separate AutoStartCountdown-Komponente. Alles läuft über die erweiterte StatusMessage.

### Neuer State in TimerSettingsContext
```typescript
interface TimerSettings {
  // ... existing
  autoStartEnabled: boolean;      // Default: false
  autoStartDelay: 3 | 5 | 10;     // Sekunden, Default: 5
}
```

### Timer State Erweiterung
```typescript
interface TimerState {
  // ... existing
  autoStartCountdown: number | null;  // null = nicht aktiv, sonst Sekunden remaining
}

type TimerAction =
  | // ... existing
  | { type: 'START_AUTO_COUNTDOWN'; delay: number }
  | { type: 'TICK_AUTO_COUNTDOWN' }
  | { type: 'CANCEL_AUTO_COUNTDOWN' };
```

### StatusMessage Props Erweiterung
```typescript
interface StatusMessageProps {
  message: string | null;
  subtle?: boolean;
  // NEW:
  autoStartCountdown?: number | null; // Countdown-Zahl (5, 4, 3...), null = nicht aktiv
  nextMode?: 'work' | 'break';        // "Break in X" oder "Focus in X"
}
```

Die StatusMessage entscheidet intern, was angezeigt wird:
1. `autoStartCountdown !== null` → "Break in X · Space to cancel"
2. `message !== null` → Zeigt message (Well done!, etc.)
3. Sonst → nichts

**Einfach und minimal.**

### Auto-Start Flow (aktualisiert)
```
Session Complete (Timer hits 00:00)
      ↓
[Overflow enabled?]──YES──→ Warte auf Done-Button
      │ NO                         ↓
      ↓                    User klickt Done
[Auto-Start ON?]←─────────────────┘
      │ NO → Show "Well done!" (klassisch)
      │ YES
      ↓
Dispatch START_AUTO_COUNTDOWN(delay)
      ↓
┌─────────────────────────────────┐
│  UI: "Break in 5..."            │
│       (ersetzt Well done!)      │
│  Jede Sekunde: TICK_AUTO_COUNTDOWN
└─────────────────────────────────┘
      │
[User drückt Space/Esc?]──YES──→ CANCEL_AUTO_COUNTDOWN
      │ NO                              ↓
      │                         Show "Well done!" + normale Controls
      ↓
Countdown = 0
      ↓
Play "autostart" chime
      ↓
Dispatch START (nächste Session)
```

## UI/UX

### Design-Prinzip: StatusMessage-Area nutzen

Der Timer-Bereich bleibt **komplett clean**. Alle Auto-Start Informationen erscheinen in der **StatusMessage-Area** am unteren Bildschirmrand – konsistent mit "Well done!", "Skipped to Focus", etc.

### StatusMessage States

**State 1: Timer läuft (Auto-Start ON oder OFF)**
```
        ┌─────────────────┐
        │                 │
        │     12:34       │  ← Timer läuft normal
        │                 │
        └─────────────────┘



                                       ← Nichts (clean)
```
Kein Hinweis während Timer läuft – User weiß, dass Auto-Start an ist.

**State 2: Session complete + Countdown aktiv**
```
        ┌─────────────────┐
        │                 │
        │     00:00       │  ← Timer bei 00:00
        │                 │
        └─────────────────┘



        Break in 5 · Space to cancel   ← Countdown erscheint
```
- Countdown-Zahl animiert bei jedem Tick (fade/scale)
- Cancel-Hint direkt integriert
- Secondary color für Sichtbarkeit

**State 3: Countdown gecancelled / Auto-Start OFF**
```
        ┌─────────────────┐
        │     00:00       │
        │                 │
        │    [▶ Start]    │  ← Normale Controls
        └─────────────────┘



              Well done!               ← Klassische Message
```
Gleiches Verhalten wie ohne Auto-Start.

### Animation Flow

```
Timer complete (00:00)
      ↓
[Auto-Start ON?]
      │ NO → "Well done!" (fade out nach 3s) → normale Controls
      │ YES
      ↓
Fade in "Break in 5 · Space to cancel"
      ↓
Tick: "Break in 4 · Space to cancel" (Zahl animiert)
      ↓
Tick: "Break in 3 · Space to cancel"
      ↓
...
      ↓
[Cancelled?]──YES──→ "Well done!" + normale Controls
      │ NO
      ↓
Play chime + Start next session
      ↓
StatusMessage verschwindet (Timer läuft wieder)
```

### Settings UI

```
┌─────────────────────────────────────────┐
│ Timer Settings                          │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Auto-Start Next Session             │ │
│ │                              [OFF]  │ │ ← Toggle
│ │                                     │ │
│ │ Automatically start the next timer  │ │
│ │ after the countdown.                │ │
│ │                                     │ │
│ │ Countdown Duration                  │ │
│ │ ┌─────┬─────┬──────┐               │ │
│ │ │ 3s  │ 5s  │ 10s  │               │ │ ← Segmented Control
│ │ └─────┴─────┴──────┘               │ │   (nur sichtbar wenn ON)
│ │                                     │ │
│ │ ⌨️ Shift+A to toggle quickly       │ │ ← Keyboard Hint
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### Keyboard Shortcuts

| Shortcut | Aktion | Kontext |
|----------|--------|---------|
| **Shift+A** | Toggle Auto-Start ON/OFF | Global (außer in Inputs) |
| **Space** | Cancel Countdown | Während Countdown läuft |
| **Escape** | Cancel Countdown | Während Countdown läuft |

### Command Palette

Neuer Command:
```typescript
{
  id: 'toggle-auto-start',
  name: 'Toggle Auto-Start',
  shortcut: '⇧A',
  category: 'timer',
  action: () => toggleAutoStart(),
}
```

### Toast Feedback

Bei Shift+A Toggle:
```
┌────────────────────────┐
│ Auto-Start enabled     │  oder  │ Auto-Start disabled    │
└────────────────────────┘        └────────────────────────┘
```

## Sound Design

### "autostart" Chime

- **Wann:** 0.5s bevor nächste Session startet
- **Charakter:** Kurz, sanft, "awakening" – nicht alarmartig
- **Dauer:** ~300ms
- **Frequenz:** Höher als Session-Complete, aber nicht schrill
- **Inspiration:** Wie ein sanftes "ding" das sagt "here we go"

**Implementation:**
```typescript
// In sounds.ts
export const SOUNDS = {
  // ... existing
  autostart: {
    frequency: 880,      // A5
    duration: 0.15,
    type: 'sine' as const,
    volume: 0.3,         // Leiser als complete
    fadeOut: 0.1,
  },
};
```

## Edge Cases

| Situation | Verhalten |
|-----------|-----------|
| Tab im Hintergrund | Timer startet still, keine Notification |
| Overflow Mode aktiv | Auto-Start wartet auf Done-Button, dann Countdown |
| User war 1h+ weg | Auto-Start triggert trotzdem (Web Worker trackt Zeit) |
| Mute aktiv | Kein Chime, aber Countdown läuft |
| Skip (S) während Countdown | Countdown cancelled, Skip führt normalen Skip aus |
| Reset (R) während Countdown | Countdown cancelled, Reset führt normalen Reset aus |
| Preset-Wechsel während Countdown | Countdown cancelled, Preset wechselt |
| Settings öffnen während Countdown | Countdown cancelled (Modal öffnet) |

## Testing

### Manuell zu testen
- [ ] Auto-Start OFF → klassisches Verhalten (Well done! + manuelle Controls)
- [ ] Auto-Start ON, 5s, Work → Break startet nach 5s Countdown
- [ ] Auto-Start ON, 3s, Break → Work startet nach 3s Countdown
- [ ] Countdown + Space → Cancelled, zeigt Well done!
- [ ] Countdown + Escape → Cancelled, zeigt Well done!
- [ ] Shift+A → Toggle + Toast Feedback
- [ ] Cmd+K → "Toggle Auto-Start" findbar
- [ ] Overflow + Auto-Start → Wartet auf Done, dann Countdown
- [ ] Tab im Hintergrund → Timer startet still
- [ ] Mute + Auto-Start → Kein Sound, Countdown funktioniert
- [ ] Settings: Toggle ON → Countdown-Selector erscheint
- [ ] Settings: 3s/5s/10s → Countdown-Dauer ändert sich

### Unit Tests
- [ ] `timerReducer`: START_AUTO_COUNTDOWN setzt countdown state
- [ ] `timerReducer`: TICK_AUTO_COUNTDOWN decrementiert
- [ ] `timerReducer`: CANCEL_AUTO_COUNTDOWN setzt auf null
- [ ] Auto-Start nur nach COMPLETE, nicht nach SKIP

## Definition of Done

- [ ] Auto-Start Toggle in Settings
- [ ] Countdown-Dauer Selector (3/5/10s)
- [ ] StatusMessage: Countdown "Break in X · Space to cancel"
- [ ] StatusMessage: Smooth Tick-Animation (Zahl wechselt)
- [ ] Space/Escape Cancel → "Well done!" + normale Controls
- [ ] Shift+A Shortcut mit Toast
- [ ] Command Palette Integration
- [ ] Overflow-Kompatibilität
- [ ] Autostart-Chime Sound
- [ ] Beide Themes getestet
- [ ] Reduced Motion respektiert (keine Tick-Animation)
- [ ] LocalStorage Persistenz

## Nicht in Scope (v1)

- "Auto-Start nur für Breaks" Option (später evaluieren)
- Notification bei Background-Tab (bewusst weggelassen)
- Längerer Timeout nach Inaktivität (zu komplex für v1)

---

## Arbeitsverlauf

### Gestartet:
### Erledigt:
