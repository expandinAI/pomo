# POMO-027: Extended Keyboard Shortcuts

**Status:** TODO
**Priority:** P1 - High
**Estimate:** 2 points
**Epic:** Accessibility
**Labels:** `accessibility`, `ux`, `keyboard`

## Beschreibung
Erweiterung der bestehenden Keyboard Shortcuts für Power-User und bessere Accessibility.

## Aktuelle Shortcuts (POMO-006)
- `Space` - Start/Pause
- `R` - Reset
- `S` - Skip/Complete
- `D` - Dark Mode Toggle
- `?` - Shortcuts Help

## Neue Shortcuts

| Shortcut | Aktion | Kontext |
|----------|--------|---------|
| `1` | Focus Mode auswählen | Immer |
| `2` | Short Break auswählen | Immer |
| `3` | Long Break auswählen | Immer |
| `↑` / `↓` | Timer +/- 1 Minute | Wenn pausiert |
| `M` | Mute/Unmute Sounds | Immer |
| `A` | Ambient Sound Toggle | Immer |
| `Esc` | Schließe aktives Modal | Wenn Modal offen |
| `Cmd/Ctrl + ,` | Öffne Settings | Immer |

## Akzeptanzkriterien
- [ ] Alle neuen Shortcuts implementiert
- [ ] Shortcuts-Help Modal aktualisiert
- [ ] Arrow Keys nur aktiv wenn Timer pausiert
- [ ] Keine Konflikte mit Browser-Shortcuts
- [ ] Shortcuts funktionieren nicht in Input-Feldern

## Implementation

### Keyboard Handler Erweiterung
```typescript
// In page.tsx oder Timer.tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if in input/textarea
    if (e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.key) {
      case '1':
        setMode('work');
        break;
      case '2':
        setMode('shortBreak');
        break;
      case '3':
        setMode('longBreak');
        break;
      case 'ArrowUp':
        if (!isRunning) {
          adjustTime(+60); // +1 minute
        }
        break;
      case 'ArrowDown':
        if (!isRunning) {
          adjustTime(-60); // -1 minute
        }
        break;
      case 'm':
      case 'M':
        toggleMute();
        break;
      case 'a':
      case 'A':
        toggleAmbient();
        break;
      case 'Escape':
        closeActiveModal();
        break;
      case ',':
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          openSettings();
        }
        break;
      // ... existing shortcuts
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isRunning, /* other deps */]);
```

## Shortcuts Help Update

```
┌─────────────────────────────────────┐
│ Keyboard Shortcuts              [?] │
├─────────────────────────────────────┤
│                                     │
│ Timer                               │
│ ─────                               │
│ Space      Start/Pause              │
│ R          Reset                    │
│ S          Skip session             │
│ ↑ / ↓     +/- 1 minute (paused)    │
│                                     │
│ Sessions                            │
│ ────────                            │
│ 1          Focus mode               │
│ 2          Short break              │
│ 3          Long break               │
│                                     │
│ Sound                               │
│ ─────                               │
│ M          Mute/Unmute              │
│ A          Toggle ambient           │
│                                     │
│ General                             │
│ ───────                             │
│ D          Dark/Light mode          │
│ ⌘/Ctrl+,  Open settings            │
│ Esc        Close modal              │
│ ?          This help                │
│                                     │
└─────────────────────────────────────┘
```

## Dateien
- `src/app/page.tsx` (MODIFIZIEREN) - Keyboard handler erweitern
- `src/components/ui/ShortcutsHelp.tsx` (MODIFIZIEREN) - Help aktualisieren

## Testing
- [ ] Alle Shortcuts funktionieren
- [ ] Arrow Keys nur bei pausiertem Timer
- [ ] Keine Konflikte mit Input-Feldern
- [ ] Cmd+, öffnet Settings (nicht Browser-Einstellungen)
- [ ] Esc schließt Modals
- [ ] Help-Modal zeigt alle Shortcuts
