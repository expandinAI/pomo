---
type: story
status: done
priority: p1
effort: 2
feature: timer
created: 2026-02-02
updated: 2026-02-03
done_date: 2026-02-03
tags: [ux, timer, session-management, pause]
---

# POMO-334: Finish Session Early (Pause-Zustand)

## User Story

> Als **Particle-Nutzer im Pausenzustand**
> möchte ich **meine aktuelle Session vorzeitig beenden und speichern können**,
> damit **ich bei Unterbrechungen meine bisherige Fokuszeit nicht verliere, aber auch nicht gezwungen werde, in eine Pause zu wechseln**.

## Kontext

**Problem:**
Der Pause-Zustand zeigte nur "Resume". Bei Unterbrechungen (Meeting, Notfall, Task fertig) hatte der Nutzer zwei suboptimale Optionen:
- `E` (End) → Session speichern, aber zurück zu Ready-State
- `S` (Skip) → Session speichern, aber Wechsel zu Break

**Lösung:**
Neuer "Finish Early" Button (`F`) der:
- Session speichert (wenn ≥2 min)
- Im Work-Modus bleibt (kein erzwungener Break)
- Dezentes visuelles Feedback gibt

**Particle-Philosophie:**
- **Kein Zwang** – Der Nutzer entscheidet, ob Break oder weiterarbeiten
- **Jede Minute zählt** – Fokuszeit ≥2 min wird erfasst
- **Reduziert** – Ein Button, eine Aktion, klares Feedback

## Akzeptanzkriterien

### UI im Pause-Zustand

- [x] **Given** Timer pausiert (Work), **When** UI angezeigt, **Then** "Finish Early" Button links vom Resume
- [x] **Given** Timer pausiert (Break), **When** UI angezeigt, **Then** kein "Finish Early" Button
- [x] **Given** Timer läuft, **When** UI angezeigt, **Then** kein "Finish Early" Button
- [x] **Given** Timer idle, **When** UI angezeigt, **Then** kein "Finish Early" Button

### Finish Early Verhalten

- [x] **Given** ≥2 min elapsed, **When** Finish Early, **Then** Session gespeichert + StatusMessage "Session saved · X min"
- [x] **Given** <2 min elapsed, **When** Finish Early, **Then** StatusMessage "Session too short · min 2 min"
- [x] **Given** Finish Early, **Then** Timer zurück auf Ready-State (gleicher Modus, volle Dauer)
- [x] **Given** Finish Early, **Then** Task wird geleert, One-off Duration zurückgesetzt

### Keyboard

- [x] **Given** Timer pausiert (Work), **When** `F` gedrückt, **Then** Finish Early ausgeführt
- [x] **Given** Timer nicht pausiert, **When** `F` gedrückt, **Then** keine Aktion
- [x] **Given** Help Modal (`?`), **Then** `F` dokumentiert unter "Timer"

### Feedback

- [x] **Given** Session gespeichert, **Then** `flowContinueMessage` zeigt "Session saved · X min" (2s)
- [x] **Given** Session zu kurz, **Then** `sessionTooShortMessage` zeigt "Session too short · min 2 min" (2s)

## Implementierung

### Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `TimerControls.tsx` | `onFinishEarly` Prop + Button-Rendering |
| `Timer.tsx` | `handleFinishEarly` Callback + `F` Keyboard-Handler + State |
| `StatusMessage.tsx` | `sessionTooShortMessage` Prop + Priority #3 |
| `shortcuts.ts` | `F` in SHORTCUTS Array |

### Button-Design

```tsx
<motion.button
  onClick={onFinishEarly}
  className="absolute right-full mr-4 ... bg-tertiary/20 text-secondary"
  aria-label="Finish session early (F)"
  title="Finish early · F"
>
  <Check className="w-5 h-5" />
</motion.button>
```

- Position: Links vom Resume-Button (`right-full mr-4`)
- Styling: Subtil (`bg-tertiary/20`), nicht dominant
- Icon: Checkmark (ohne bold strokeWidth – unterscheidet sich vom Done-Button)
- Animation: Spring entry/exit, scale on hover/tap

### handleFinishEarly Logic

```typescript
const handleFinishEarly = useCallback(() => {
  if (!state.isPaused || state.mode !== 'work') return;

  const fullDuration = oneOffDurationRef.current ?? durationsRef.current[state.mode];
  const elapsedTime = fullDuration - state.timeRemaining;
  const MIN_LOGGABLE = 2 * 60; // 2 Minuten

  if (elapsedTime >= MIN_LOGGABLE) {
    // Session speichern
    void addSession(state.mode, elapsedTime, taskData);
    setFlowContinueMessage(`Session saved · ${Math.round(elapsedTime / 60)} min`);
  } else {
    setSessionTooShortMessage('Session too short · min 2 min');
  }

  // Reset zu Ready-State (gleicher Modus)
  dispatch({ type: 'SET_MODE', mode: state.mode, durations: durationsRef.current });
  workerReset(durationsRef.current[state.mode]);
  // ... cleanup
}, [/* deps */]);
```

### Unterschied zu E und S

| Key | Aktion | Speichert? | Nächster State |
|-----|--------|------------|----------------|
| `E` | End/Cancel | Ja (≥60s) | Ready (Work) |
| `S` | Skip | Ja (>60s) | Break |
| `F` | Finish Early | Ja (≥2min) | Ready (Work) |

**Warum `F` statt `E` erweitern?**
- `E` hat 60s Threshold, `F` hat 2min (strengerer Standard für "echte" Session)
- `F` nur im Pause-Zustand (bewusste Entscheidung, nicht versehentlich)
- Semantik: "Finish" = erfolgreich abschließen, "End" = abbrechen

## UI

```
Pause-Zustand (Work-Session):

          ┌─────┐     ┌─────────────┐
          │  ✓  │     │   Resume    │
          │     │     │   Space     │
          └─────┘     └─────────────┘
         Finish        (Primary)
         Early
          [F]
```

## Definition of Done

- [x] Button im Pause-Zustand implementiert
- [x] Keyboard-Shortcut `F` funktioniert
- [x] 2-Minuten Threshold respektiert
- [x] Sessions werden korrekt gespeichert
- [x] StatusMessage Feedback implementiert
- [x] In Help Modal dokumentiert
- [x] TypeScript-Typen korrekt
- [x] Lint & Typecheck grün
- [x] **Prüffrage:** Fühlt es sich natürlich an? ✓

## Nicht im Scope

- Command Palette Integration (zu speziell für Pause-Zustand)
- Konfirmations-Dialog (bewusst weggelassen)
- "Finish Early" für Break-Sessions (Break = einfach skippen)
- `type: 'partial'` Marker (Session ist eine normale Session)

---

## Changelog

### 2026-02-03 – Implementiert
- Button links vom Resume-Button
- `F` Shortcut im Pause-Zustand
- StatusMessage für Feedback (saved / too short)
- Dokumentation in Help Modal

### 2026-02-02 – Story erstellt
- Initiale Spezifikation
