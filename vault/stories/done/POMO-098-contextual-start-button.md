---
type: story
status: done
priority: p0
effort: 2
feature: timer
created: 2026-01-20
updated: 2026-01-20
done_date: 2026-01-20
tags: [ux, timer, clarity, p0]
---

# POMO-098: Contextual Start Button

## User Story

> Als **Particle-Nutzer**
> möchte ich **auf einen Blick sehen, ob ich eine Focus- oder Break-Session starten werde**,
> damit **ich immer weiß, was als nächstes kommt**.

## Kontext

Aktuell zeigt der Start-Button nur "Start" – der Nutzer sieht nicht, ob eine Focus- oder Break-Session beginnt. Das führt zu Unsicherheit.

## Lösung

Der Start-Button zeigt kontextabhängig:
- **"Start Focus"** → vor Work-Session
- **"Start Break"** → vor Break-Session

Während die Session läuft: **"Pause"** (unverändert)

## Akzeptanzkriterien

- [ ] **Given** Timer gestoppt + Work-Session, **When** Button angezeigt, **Then** "Start Focus"
- [ ] **Given** Timer gestoppt + Break-Session, **When** Button angezeigt, **Then** "Start Break"
- [ ] **Given** Timer läuft, **When** Button angezeigt, **Then** "Pause" (wie bisher)
- [ ] **Given** Timer pausiert, **When** Button angezeigt, **Then** "Resume" (wie bisher)
- [ ] **Given** Button, **When** angezeigt, **Then** konsistent mit Design System (monochrom, minimal)

## Technische Details

### Betroffene Dateien
```
src/components/timer/Timer.tsx   # Button-Label Logik
```

### Implementierung
```typescript
const getButtonLabel = () => {
  if (isRunning) return 'Pause';
  if (isPaused) return 'Resume';
  // Stopped state - show what will start
  return sessionType === 'work' ? 'Start Focus' : 'Start Break';
};
```

## Design

- Keine neuen UI-Elemente
- Text im Button ändert sich kontextabhängig
- Konsistent mit bestehendem Button-Styling
- Monochrom, keine Farben

## Testing

- [ ] Button zeigt "Start Focus" vor Work-Session
- [ ] Button zeigt "Start Break" vor Short/Long Break
- [ ] Button zeigt "Pause" während Session
- [ ] Button zeigt "Resume" wenn pausiert
- [ ] Keyboard Shortcut (Space) funktioniert weiterhin

## Definition of Done

- [ ] Implementiert
- [ ] Getestet (alle Session-Typen)
- [ ] Keine neuen UI-Elemente hinzugefügt
- [ ] Design-Prinzipien eingehalten
