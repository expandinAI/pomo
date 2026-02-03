---
type: story
status: backlog
priority: p1
effort: 2
feature: timer
created: 2026-02-02
updated: 2026-02-02
done_date: null
tags: [ux, timer, session-management, pause]
---

# POMO-334: Finish Session Early via Pause UI

## User Story

> Als **Particle-Nutzer im Pausenzustand**
> möchte ich **die Option haben, meine aktuelle Session vorzeitig zu beenden**,
> damit **ich bei Unterbrechungen oder wenn ich früher fertig bin, meine bisherige Fokuszeit trotzdem erfassen kann**.

## Kontext

Link zum Feature: [[features/timer]]

**Problem:**
Aktuell zeigt der Pause-Zustand nur "Resume" als Option. Wenn ein Nutzer eine Session unterbrechen muss (Meeting, Notfall, Task früher fertig), hat er keine einfache Möglichkeit, die Session sauber zu beenden und die bisherige Zeit zu loggen.

**Bezug zu anderen Stories:**
- Ergänzt **POMO-149** (Session Cancel Behavior) um explizite UI-Aktion
- Nutzt die Partial-Session-Logik aus **POMO-155** (Partial Session Logging)

**Particle-Philosophie:**
- **Reality, not Idealism** – Manchmal muss man früher aufhören
- **Data Integrity** – Jede Minute Fokusarbeit zählt
- **User Control** – Der Nutzer entscheidet, nicht das System

## Akzeptanzkriterien

### UI im Pause-Zustand

- [ ] **Given** Timer pausiert (Focus-Session), **When** UI angezeigt, **Then** Button "Finish Early" sichtbar neben "Resume"
- [ ] **Given** Timer pausiert (Break-Session), **When** UI angezeigt, **Then** Button "Skip Break" sichtbar (bestehende Logik)
- [ ] **Given** Timer läuft, **When** UI angezeigt, **Then** kein "Finish Early" Button (nur Pause)
- [ ] **Given** Timer gestoppt, **When** UI angezeigt, **Then** kein "Finish Early" Button (nur Start)

### Finish Early Verhalten

- [ ] **Given** Focus-Session pausiert (≥2 min), **When** "Finish Early" geklickt, **Then** bisherige Zeit wird geloggt + Timer zurückgesetzt
- [ ] **Given** Focus-Session pausiert (<2 min), **When** "Finish Early" geklickt, **Then** Session verworfen (zu kurz)
- [ ] **Given** Overflow-Modus aktiv (+05:00), **When** "Finish Early", **Then** Gesamtzeit (planned + overflow) wird geloggt
- [ ] **Given** "Finish Early" ausgeführt, **When** Statistik, **Then** Session als "partial" markiert

### Keyboard-Shortcut

- [ ] **Given** Timer pausiert, **When** `F` gedrückt, **Then** "Finish Early" ausgeführt
- [ ] **Given** Timer pausiert, **When** `Escape`, **Then** Session verwerfen (bestehend)
- [ ] **Given** Command Palette offen, **When** "finish" eingegeben, **Then** "Finish Session Early" als Option

### Feedback

- [ ] **Given** "Finish Early" ausgeführt (≥2 min), **When** Session geloggt, **Then** kurze Bestätigung (Toast oder Animation)
- [ ] **Given** "Finish Early" ausgeführt (<2 min), **When** verworfen, **Then** dezenter Hinweis "Session zu kurz"

## Technische Details

### Betroffene Dateien

```
src/
├── components/timer/
│   ├── Timer.tsx           # Pause-UI erweitern
│   └── TimerControls.tsx   # "Finish Early" Button
├── hooks/
│   └── useTimer.ts         # finishEarly() Funktion
├── lib/
│   └── sessions.ts         # Partial-Session Logik
└── commands/
    └── timer-commands.ts   # Command Palette Integration
```

### Implementierungshinweise

1. **Button-Logik:** Nur im Pause-Zustand sichtbar, nur bei Focus-Sessions
2. **Minimum Threshold:** 2 Minuten Mindestzeit für Logging (bereits in POMO-155 definiert)
3. **Session-Type:** `type: 'partial'` für alle früh beendeten Sessions
4. **Analytics:** Partial Sessions werden separat in Statistiken ausgewiesen

### State-Erweiterung

```typescript
// In useTimer.ts
const finishEarly = () => {
  if (!isPaused || sessionType !== 'work') return;

  const elapsedSeconds = getElapsedTime();
  const MIN_LOGGABLE = 2 * 60; // 2 Minuten

  if (elapsedSeconds >= MIN_LOGGABLE) {
    logSession({
      type: 'partial',
      duration: elapsedSeconds,
      completionReason: 'early_finish',
    });
    showToast('Session gespeichert');
  } else {
    showToast('Session zu kurz', 'info');
  }

  resetTimer();
};
```

### Command Integration

```typescript
// In timer-commands.ts
{
  id: 'finish-session-early',
  label: 'Finish Session Early',
  shortcut: 'F',
  when: 'timer.isPaused && timer.sessionType === "work"',
  action: () => timer.finishEarly(),
}
```

## UI/UX

**Pause-Zustand (Focus-Session):**
```
┌─────────────────────────────────────────┐
│                                         │
│              18:24                      │
│              PAUSED                     │
│                                         │
│   ┌──────────────┐  ┌────────────────┐  │
│   │ Finish Early │  │    Resume      │  │
│   │     [F]      │  │   [Space]      │  │
│   └──────────────┘  └────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**Button-Styling:**
- "Finish Early" = sekundärer Button (outline/ghost)
- "Resume" = primärer Button (solid)
- Monochrom, konsistent mit Design System
- Icons optional: ✓ für Finish, ▶ für Resume

**Verhalten:**
- Click auf "Finish Early" → Session loggen + Reset
- Keyboard `F` → gleiche Aktion
- Hover zeigt Tooltip: "18:24 werden als Fokuszeit gespeichert"

## Testing

### Manuell zu testen

- [ ] Focus-Session starten, nach 3 min pausieren, "Finish Early" klicken
- [ ] Prüfen: Session erscheint in Statistik als partial (3 min)
- [ ] Focus-Session starten, nach 30 sek pausieren, "Finish Early" klicken
- [ ] Prüfen: Session wird verworfen (unter 2 min)
- [ ] Break-Session pausieren: "Finish Early" sollte NICHT erscheinen
- [ ] Keyboard: `F` im Pause-Zustand funktioniert
- [ ] Command Palette: "finish" zeigt korrekten Befehl

### Automatisierte Tests

- [ ] Unit Test: `finishEarly()` mit verschiedenen Zeitwerten
- [ ] Unit Test: Button-Visibility basierend auf State
- [ ] Integration: Session wird korrekt in Storage gespeichert

## Definition of Done

- [ ] "Finish Early" Button im Pause-Zustand implementiert
- [ ] Keyboard-Shortcut `F` funktioniert
- [ ] Command Palette Integration
- [ ] Minimum Threshold (2 min) respektiert
- [ ] Partial Sessions werden korrekt geloggt
- [ ] Toast-Feedback implementiert
- [ ] Tests geschrieben & grün
- [ ] Code reviewed
- [ ] Design-Prinzipien eingehalten (monochrom, minimal)
- [ ] **Prüffrage:** Fühlt es sich natürlich an, eine Session früh zu beenden?

## Nicht im Scope (v1)

- Konfirmations-Dialog vor "Finish Early" (bewusst weggelassen für schnellen Flow)
- Anpassbares Minimum Threshold in Settings
- "Finish Early" für Break-Sessions (Break = Skip)
- Grund für frühes Beenden erfragen

## Offene Fragen

- **UX:** Soll "Finish Early" links oder rechts von "Resume" stehen? → Empfehlung: Links (sekundäre Aktion)
- **Wording:** "Finish Early" vs "End Session" vs "Save & Stop"? → "Finish Early" ist klarer

---

## Arbeitsverlauf

### Erstellt: 2026-02-02
Story erstellt basierend auf User-Anfrage.

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
