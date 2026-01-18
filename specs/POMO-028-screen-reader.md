# POMO-028: Screen Reader Optimization

**Status:** DONE
**Priority:** P1 - High
**Estimate:** 3 points
**Epic:** Accessibility
**Labels:** `accessibility`, `a11y`, `aria`

## Beschreibung
Optimierung für Screen Reader (VoiceOver, NVDA) mit Live Regions für Timer-Updates und klaren ARIA-Labels.

## Akzeptanzkriterien
- [ ] Timer-Zeit wird alle 5 Minuten angesagt
- [ ] Session-Status-Änderungen werden angesagt
- [ ] Alle Buttons haben aussagekräftige Labels
- [ ] Focus-Management bei Modal-Öffnung
- [ ] Skip-to-main-content Link
- [ ] WCAG 2.1 AA compliant

## ARIA Live Regions

### Timer Announcements
```tsx
// Nur alle 5 Minuten (nicht jede Sekunde - zu störend)
<div
  role="timer"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {shouldAnnounce && `${minutes} minutes remaining`}
</div>
```

### Session Status
```tsx
<div
  role="status"
  aria-live="assertive"
  className="sr-only"
>
  {statusMessage}
</div>

// Status messages:
// "Focus session started, 25 minutes"
// "Session paused"
// "Session resumed"
// "Focus session complete. Well done!"
// "Short break started, 5 minutes"
```

## Button Labels

| Button | Aktuell | Besser |
|--------|---------|--------|
| Start | "Start" | "Start focus session" |
| Pause | "Pause" | "Pause timer" |
| Reset | Icon only | "Reset timer to beginning" |
| Skip | Icon only | "Skip to next session" |
| Settings | Icon only | "Open timer settings" |
| Theme Toggle | Icon only | "Switch to dark/light mode" |

## Focus Management

### Modal Opening
```typescript
// Wenn Modal öffnet
useEffect(() => {
  if (isOpen) {
    // Save current focus
    previousFocusRef.current = document.activeElement;
    // Focus first focusable element in modal
    modalRef.current?.querySelector('button, [href], input')?.focus();
  } else {
    // Restore focus when closing
    previousFocusRef.current?.focus();
  }
}, [isOpen]);
```

### Focus Trap in Modals
```typescript
// Tab should cycle within modal
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    const focusable = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
};
```

## Skip to Content Link

```tsx
// In layout.tsx oder page.tsx
<a
  href="#main-timer"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:p-2 focus:rounded"
>
  Skip to timer
</a>

// Timer section
<main id="main-timer" tabIndex={-1}>
  {/* Timer content */}
</main>
```

## Component Updates

### TimerDisplay.tsx
```tsx
<div
  role="timer"
  aria-label={`${minutes} minutes ${seconds} seconds remaining`}
>
  {/* Visual display */}
</div>
```

### TimerControls.tsx
```tsx
<Button
  aria-label={isRunning ? "Pause timer" : "Start focus session"}
  onClick={toggleTimer}
>
  {isRunning ? <PauseIcon /> : <PlayIcon />}
</Button>

<Button
  aria-label="Reset timer to beginning"
  onClick={resetTimer}
>
  <ResetIcon />
</Button>
```

### SessionType.tsx
```tsx
<div role="radiogroup" aria-label="Session type">
  <button
    role="radio"
    aria-checked={mode === 'work'}
    aria-label="Focus session, 25 minutes"
  >
    Focus
  </button>
  {/* ... */}
</div>
```

## Dateien
- `src/components/timer/TimerDisplay.tsx` (MODIFIZIEREN)
- `src/components/timer/TimerControls.tsx` (MODIFIZIEREN)
- `src/components/timer/SessionType.tsx` (MODIFIZIEREN)
- `src/components/timer/Timer.tsx` (MODIFIZIEREN) - Live regions
- `src/components/settings/TimerSettings.tsx` (MODIFIZIEREN) - Focus trap
- `src/app/page.tsx` (MODIFIZIEREN) - Skip link
- `src/app/layout.tsx` (MODIFIZIEREN) - Skip link

## Testing
- [ ] Test mit VoiceOver (macOS)
- [ ] Test mit NVDA (Windows, optional)
- [ ] Timer-Zeit wird alle 5 Min angesagt
- [ ] Session-Wechsel wird angesagt
- [ ] Focus bleibt in Modals
- [ ] Skip-Link funktioniert
- [ ] axe-core zeigt keine Fehler
