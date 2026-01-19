---
type: story
status: backlog
priority: p0
effort: 2
feature: "[[features/keyboard-ux]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [keyboard, timer, p0]
---

# POMO-075: Erweiterte Timer-Shortcuts

## User Story

> Als **User**
> möchte ich **den Timer präzise per Tastatur steuern können**,
> damit **ich nie zur Maus greifen muss**.

## Kontext

Link zum Feature: [[features/keyboard-ux]]

Zusätzliche Shortcuts für Zeit-Anpassung und Session-Ende.

## Akzeptanzkriterien

- [ ] **Given** Timer pausiert, **When** ↑ gedrückt, **Then** +1 Minute
- [ ] **Given** Timer pausiert, **When** ↓ gedrückt, **Then** -1 Minute
- [ ] **Given** Timer pausiert, **When** Shift+↑ gedrückt, **Then** +5 Minuten
- [ ] **Given** Timer pausiert, **When** Shift+↓ gedrückt, **Then** -5 Minuten
- [ ] **Given** Timer läuft, **When** E gedrückt, **Then** Bestätigung, dann Ende
- [ ] **Given** Modal offen, **When** Shortcuts, **Then** deaktiviert

## Technische Details

### Time Adjustment
```typescript
const adjustTime = (delta: number) => {
  if (!isRunning) {
    const newTime = Math.max(60, Math.min(timeRemaining + delta, 120 * 60));
    setTimeRemaining(newTime);
  }
};

// Keyboard Handler
if (e.key === 'ArrowUp' && !isRunning) {
  e.preventDefault();
  adjustTime(e.shiftKey ? 5 * 60 : 60);
}
if (e.key === 'ArrowDown' && !isRunning) {
  e.preventDefault();
  adjustTime(e.shiftKey ? -5 * 60 : -60);
}
```

### End Session (E)
```typescript
if (e.key === 'e' && isRunning) {
  // Show confirmation modal
  setShowEndConfirmation(true);
}
```

### Disable during Modal
```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  if (isModalOpen) return;
  // ... handle shortcuts
};
```

## Testing

### Manuell zu testen
- [ ] ↑/↓ adjustiert Zeit
- [ ] Shift+↑/↓ für ±5min
- [ ] E beendet mit Bestätigung
- [ ] Nicht während Modal

## Definition of Done

- [ ] Zeit-Anpassung implementiert
- [ ] E-Shortcut mit Confirm
- [ ] Modal-Check
