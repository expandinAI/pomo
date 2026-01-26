---
type: story
status: backlog
priority: p0
effort: 5
feature: "[[features/timer-core]]"
created: 2026-01-23
updated: 2026-01-23
done_date: null
tags: [timer, flow-state, session-competitor, p0]
---

# POMO-132: Overflow Mode

## User Story

> Als **Deep-Work-Nutzer**
> möchte ich **nach Timer-Ende im "Overflow" weiterarbeiten können**,
> damit **mein Flow-State nicht unterbrochen wird, wenn ich noch konzentriert bin**.

## Kontext

Link zum Feature: [[features/timer-core]]

**Session-Competitor-Learning:** Session (stayinsession.com) hat dieses Feature und es ist einer der Hauptgründe, warum Power-User es lieben. Harte Timer-Stops bei 00:00 sind frustrierend – der Timer sollte **einladen** zur Pause, nicht **zwingen**.

## Akzeptanzkriterien

### Timer-Verhalten
- [ ] **Given** Timer bei 00:00, **When** Session läuft, **Then** Timer zeigt positive Overflow-Zeit (+00:01, +00:02...)
- [ ] **Given** Overflow aktiv, **When** Anzeige, **Then** Farbe wechselt subtil zu Accent (#4F6EF7)
- [ ] **Given** Übergang zu Overflow, **When** 00:00 erreicht, **Then** optionaler Sound/Notification
- [ ] **Given** Overflow, **When** länger als 5min, **Then** sanfter Nudge "Zeit für eine Pause?"

### Keyboard Shortcuts
- [ ] **Given** Overflow aktiv, **When** `Space`, **Then** Pause/Resume Overflow
- [ ] **Given** Overflow aktiv, **When** `B`, **Then** sofort Break starten
- [ ] **Given** Overflow aktiv, **When** `Enter`, **Then** Session beenden, Gesamtzeit loggen
- [ ] **Given** Overflow aktiv, **When** `Escape`, **Then** Session abbrechen (mit 5s Undo)

### Visueller Feedback
- [ ] **Given** Overflow, **When** Timer-Display, **Then** sanftes Pulsieren (opacity 0.8→1.0, 2s)
- [ ] **Given** Overflow, **When** UI, **Then** Hint "Im Flow? Arbeite weiter." dezent sichtbar
- [ ] **Given** Overflow, **When** UI, **Then** Shortcut-Hints `[B] Break  [↵] Done` angezeigt

### Daten & Analytics
- [ ] **Given** Session beendet, **When** Overflow genutzt, **Then** `overflowDuration` separat gespeichert
- [ ] **Given** Session beendet, **When** Overflow genutzt, **Then** `actualDuration` = planned + overflow
- [ ] **Given** Stats-View, **When** Overflow-Daten, **Then** "Flow Sessions" Metrik (>5min Overflow)

## Technische Details

### Timer-Logik

```typescript
// Timer State erweitern
interface TimerState {
  // ... existing
  isOverflow: boolean;
  overflowSeconds: number;
}

// Im Timer-Tick
useEffect(() => {
  if (remainingSeconds <= 0 && isRunning && !isPaused) {
    setIsOverflow(true);
    setOverflowSeconds(prev => prev + 1);
  }
}, [remainingSeconds, isRunning, isPaused]);

// Display-Logik
const formatTime = (seconds: number, isOverflow: boolean): string => {
  if (isOverflow) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `+${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  // ... normal formatting
};
```

### Session-Datenmodell erweitern

```typescript
interface Session {
  id: string;
  task: string;
  project?: string;
  preset: 'pomodoro' | 'desktime' | 'ultradian' | 'custom';
  plannedDuration: number;      // Geplante Zeit in Sekunden
  actualDuration: number;       // Geplant + Overflow
  overflowDuration: number;     // NUR Overflow-Zeit (NEU)
  startedAt: Date;
  endedAt: Date;
  status: 'completed' | 'abandoned';
}
```

### UI States

**Normal (vor 00:00):**
```
┌─────────────────────────────┐
│                             │
│          12:34              │  ← text-primary (#F5F5F5)
│                             │
│      Working on Task        │
│                             │
└─────────────────────────────┘
```

**Overflow (nach 00:00):**
```
┌─────────────────────────────┐
│                             │
│         +02:15              │  ← accent (#4F6EF7), pulsierend
│                             │
│   Im Flow? Arbeite weiter.  │  ← text-secondary, dezent
│      [B] Break  [↵] Done    │  ← Shortcut-Hints
│                             │
└─────────────────────────────┘
```

### Animation (Framer Motion)

```typescript
// Pulsieren im Overflow
const overflowPulse = {
  opacity: [0.8, 1, 0.8],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Übergang Normal → Overflow
const overflowTransition = {
  color: { duration: 0.3, ease: "easeOut" }
};
```

## Edge Cases

- [ ] Overflow funktioniert für alle Presets (25/5, 52/17, 90/20, Custom)
- [ ] Bei Pause im Overflow: Overflow-Zeit pausiert auch
- [ ] Bei App-Reload im Overflow: State wird wiederhergestellt
- [ ] Overflow-Maximum: Kein Limit (User entscheidet)

## Nicht im Scope (v1)

- Auto-Break nach X Minuten Overflow
- Verschiedene Overflow-Modi pro Preset
- Overflow-Warnung nach sehr langer Zeit (>30min)

## Testing

### Manuell zu testen
- [ ] Timer läuft durch 00:00 in Overflow
- [ ] Display zeigt +00:01, +00:02 korrekt
- [ ] Keyboard Shortcuts funktionieren im Overflow
- [ ] Visuelle Unterscheidung klar erkennbar
- [ ] Session-Daten inkl. Overflow korrekt gespeichert
- [ ] Alle Presets unterstützen Overflow

## Definition of Done

- [ ] Timer-Logik für Overflow implementiert
- [ ] UI zeigt Overflow-Zeit mit +Prefix
- [ ] Visuelle Unterscheidung (Farbe, Pulsieren)
- [ ] Alle Keyboard Shortcuts funktionieren
- [ ] Session-Datenmodell erweitert
- [ ] Overflow-Zeit wird gespeichert
- [ ] Hint-Text und Shortcut-Hints angezeigt
- [ ] Keine Console-Errors
- [ ] Code Review abgeschlossen
