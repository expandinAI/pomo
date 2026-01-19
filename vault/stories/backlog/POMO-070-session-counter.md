---
type: story
status: backlog
priority: p0
effort: 1
feature: "[[features/extended-presets]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [presets, counter, ui, p0]
---

# POMO-070: Preset-spezifische Session Counter

## User Story

> Als **User**
> möchte ich **sehen, wie viele Sessions bis zur langen Pause verbleiben**,
> damit **ich meinen Fortschritt verfolgen kann**.

## Kontext

Link zum Feature: [[features/extended-presets]]

Visueller Counter der Sessions bis zur langen Pause.

## Akzeptanzkriterien

- [ ] **Given** Pomodoro Preset, **When** Counter angezeigt, **Then** "2/4 Sessions"
- [ ] **Given** Deep Work Preset, **When** Counter angezeigt, **Then** "1/2 Sessions"
- [ ] **Given** lange Pause erreicht, **When** Counter, **Then** resettet
- [ ] **Given** Visual, **When** angezeigt, **Then** gefüllte/leere Dots oder Zahlen
- [ ] **Given** lange Pause, **When** aktiv, **Then** "Long Break!" angezeigt

## Technische Details

### UI Varianten
```
●●○○  2/4 Sessions    (Dots)
2/4                    (Minimal)
Session 2 of 4         (Verbose)
```

### State
```typescript
interface TimerState {
  currentPreset: PresetId;
  sessionsCompleted: number; // Resettet nach Long Break
  totalSessionsToday: number;
}
```

### Counter Komponente
```tsx
const SessionCounter = ({ completed, total }) => (
  <div className="flex gap-1">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={cn(
          'w-2 h-2 rounded-full',
          i < completed ? 'bg-accent' : 'bg-muted'
        )}
      />
    ))}
  </div>
);
```

## Testing

### Manuell zu testen
- [ ] Counter zeigt korrekten Fortschritt
- [ ] Resettet nach langer Pause
- [ ] "Long Break!" bei langer Pause
- [ ] Funktioniert für alle Presets

## Definition of Done

- [ ] Counter Komponente
- [ ] In Timer State
- [ ] Reset-Logik
- [ ] Long Break Anzeige
