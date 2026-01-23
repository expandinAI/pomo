---
type: story
status: backlog
priority: p2
effort: 2
feature: timer-enhancements
created: 2026-01-23
updated: 2026-01-23
done_date: null
tags: [timer, flow, power-user]
---

# POMO-135: Auto-Start Next Session

## User Story

> Als **Power-User im Flow**
> möchte ich **dass der nächste Timer automatisch startet**,
> damit ich **meinen Rhythmus nicht durch manuelles Starten unterbreche**.

## Kontext

Nach einer Work-Session folgt Break. Nach Break folgt Work. Für Nutzer im Deep-Work-Flow ist jeder manuelle Klick eine Unterbrechung. Auto-Start hält den Rhythmus aufrecht.

**Particle-Philosophie:** Opt-in Feature für Power-User. Default: Aus. Keine Bevormundung, volle Kontrolle.

## Akzeptanzkriterien

- [ ] **Given** Auto-Start ON + Work endet, **When** Timer completed, **Then** Break startet nach 3s Countdown
- [ ] **Given** Auto-Start ON + Break endet, **When** Timer completed, **Then** Work startet nach 3s Countdown
- [ ] **Given** Auto-Start ON, **When** Countdown läuft, **Then** kann ich mit Space/Escape abbrechen
- [ ] **Given** Auto-Start OFF, **When** Timer endet, **Then** klassisches Verhalten (manuelle Start)
- [ ] **Given** Overflow Mode aktiv, **When** in Overflow, **Then** Auto-Start wartet auf Done-Button
- [ ] **Given** Settings, **When** ich Toggle ändere, **Then** sofort aktiv ohne Restart

## Technische Details

### Betroffene Dateien
```
src/
├── components/timer/
│   ├── Timer.tsx             # Auto-Start Logik
│   └── AutoStartCountdown.tsx # Neues "Starting in 3..." UI
├── components/settings/
│   └── TimerSettings.tsx     # Toggle hinzufügen
└── contexts/
    └── TimerSettingsContext.tsx # autoStartEnabled State
```

### Implementierungshinweise

1. **Timing:** 3 Sekunden Countdown nach Session-Ende
2. **Abbruch:** Space oder Escape während Countdown
3. **Integration mit Overflow:** Wenn Overflow aktiv, Auto-Start erst nach manuellem Complete
4. **Sound:** Kurzer "Starting..." Chime vor Auto-Start (optional)

### Auto-Start Flow
```
Session Complete
      ↓
[Overflow enabled?]──YES──→ Warte auf Done-Button
      │ NO                         ↓
      ↓                    User klickt Done
[Auto-Start ON?]←─────────────────┘
      │ YES
      ↓
Show Countdown (3...2...1...)
      │
[User cancels?]──YES──→ Stop, show normal controls
      │ NO
      ↓
Start next session
```

### Neue Komponente
```typescript
interface AutoStartCountdownProps {
  seconds: number;
  nextMode: 'work' | 'break';
  onComplete: () => void;
  onCancel: () => void;
}

export function AutoStartCountdown({
  seconds,
  nextMode,
  onComplete,
  onCancel
}: AutoStartCountdownProps) {
  // Circular countdown oder einfacher Text
  // "Break starts in 3..."
  // Space/Esc Handler für Cancel
}
```

## UI/UX

### Countdown-Anzeige
```
┌─────────────────────────────────┐
│                                 │
│        Break in 3...            │
│                                 │
│   [Press Space to cancel]       │
│                                 │
└─────────────────────────────────┘
```

**Oder subtiler:**
```
        ┌─────────────────┐
        │     00:00       │
        │   Break in 3    │  ← Ersetzt "Well done!"
        │  Space to stay  │
        └─────────────────┘
```

### Settings Toggle
```
┌─────────────────────────────────┐
│ Auto-Start Next Session         │
│                                 │
│  [Toggle: OFF]                  │
│                                 │
│  ℹ️ Automatically start the     │
│     next timer after 3 seconds  │
└─────────────────────────────────┘
```

**Keyboard:**
- Space während Countdown = Abbrechen
- Escape während Countdown = Abbrechen
- Jede andere Taste = Ignorieren (kein versehentliches Starten)

## Testing

### Manuell zu testen
- [ ] Auto-Start OFF → klassisches Verhalten
- [ ] Auto-Start ON, Work → Break startet nach 3s
- [ ] Auto-Start ON, Break → Work startet nach 3s
- [ ] Countdown + Space → Abgebrochen
- [ ] Overflow + Auto-Start → Wartet auf Done
- [ ] Tab im Hintergrund → Auto-Start trotzdem

## Definition of Done

- [ ] Code implementiert
- [ ] Settings-Toggle
- [ ] Countdown-UI
- [ ] Keyboard-Cancel funktioniert
- [ ] Overflow-Kompatibilität
- [ ] Beide Themes getestet

## Notizen

**Edge Cases:**
- Browser-Tab inaktiv: Auto-Start trotzdem (Web Worker handled Zeit)
- Notification Permission: Zeige Notification "Break starting..." wenn Tab nicht fokussiert
- Lange Pausen: Wenn User 1h weg war und zurückkommt, Auto-Start könnte merkwürdig sein → Vielleicht Timeout nach 5min inactivity?

**Future Enhancement:** "Auto-Start only for Breaks" Option (manche wollen Work manuell starten)

---

## Arbeitsverlauf

### Gestartet:
### Erledigt:
