---
type: story
status: icebox
priority: p3
effort: 2
feature: "[[features/analytics]]"
created: 2026-01-25
updated: 2026-01-26
done_date: null
tags: [analytics, timer, session, befocused-learning, superseded]
---

# POMO-155: Partial Session Logging

> **⚠️ SUPERSEDED by POMO-149**
>
> This story's core intent (saving partial focus time) has been incorporated into
> **POMO-149: Session Cancel Behavior** with a simpler, no-dialog approach.
>
> Key difference: POMO-149 saves automatically without asking. No "log or discard" dialog.
> This aligns better with Particle's philosophy: "No drama, no decisions, just save the work."

## User Story

> Als **Nutzer der eine Session abbrechen muss**
> möchte ich **dass die bisherige Zeit trotzdem erfasst wird**,
> damit **meine Statistik die tatsächliche Arbeitszeit widerspiegelt**.

## Kontext

Link zum Feature: [[features/analytics]]

**Be Focused Learning:** User-Beschwerde: "No real way to end the timer and still capture the data if you can't finish a full session."

**Problem:** Manchmal MUSS man eine Session abbrechen:
- Notfall (Anruf, Meeting, Kind)
- Task früher fertig als gedacht
- Energie-Crash nach 18 von 25 Minuten

**Aktueller Zustand (vermutlich):** Cancel = 0 Minuten geloggt. Das ist frustrierend.

**Particle-Philosophie:**
- **Reality, not Idealism** – Das Leben ist nicht perfekt
- **Data Integrity** – Alle Arbeitszeit soll erfasst werden
- **User Choice** – Entscheidung: Loggen oder Verwerfen

## Design-Prinzipien

1. **Fragen, nicht Entscheiden** – User wählt: Loggen oder Verwerfen
2. **Minimum Threshold** – Unter X Minuten nicht loggen (zu kurz)
3. **Visual Distinction** – Partial Sessions anders markiert
4. **Overflow-Kompatibel** – Funktioniert mit Overflow Mode

## Akzeptanzkriterien

### Cancel-Dialog

- [ ] **Given** Focus-Session aktiv, **When** Cancel (Stop/Escape), **Then** Dialog erscheint
- [ ] **Given** Dialog, **When** "Zeit loggen" gewählt, **Then** bisherige Zeit wird gespeichert
- [ ] **Given** Dialog, **When** "Verwerfen" gewählt, **Then** Session wird nicht geloggt
- [ ] **Given** Session < 2 Minuten, **When** Cancel, **Then** Kein Dialog, direkt verwerfen

### Logging-Details

- [ ] **Given** Partial Session geloggt, **When** Statistik, **Then** als "Partial" markiert
- [ ] **Given** Task mit Partial Session, **When** Task-Ansicht, **Then** Zeit wird addiert
- [ ] **Given** Overflow aktiv (+05:00), **When** Cancel, **Then** 25+5=30 Minuten angeboten

### Analytics-Integration

- [ ] **Given** Statistik, **When** Partial Sessions vorhanden, **Then** separat ausgewiesen
- [ ] **Given** Tag mit Mix, **When** Total, **Then** Full + Partial = Gesamt

### Keyboard-Shortcuts

- [ ] **Given** Dialog offen, **When** `L`, **Then** Zeit loggen
- [ ] **Given** Dialog offen, **When** `D` oder Escape, **Then** Verwerfen
- [ ] **Given** Dialog offen, **When** Enter, **Then** Zeit loggen (Default)

## Technische Details

### Session-Datenmodell

```typescript
interface FocusSession {
  id: string;
  taskId: string | null;
  startedAt: Date;
  endedAt: Date;
  plannedDuration: number;  // in Sekunden (z.B. 1500 für 25 min)
  actualDuration: number;   // in Sekunden (tatsächlich)
  type: 'full' | 'partial' | 'overflow';
  completionReason: 'completed' | 'cancelled' | 'overflow';
}

// Beispiele:
// Full: 25 min geplant, 25 min gearbeitet
// Partial: 25 min geplant, 18 min gearbeitet (cancelled)
// Overflow: 25 min geplant, 32 min gearbeitet (+7 overflow)
```

### Cancel-Dialog Logik

```typescript
const MIN_LOGGABLE_DURATION = 2 * 60;  // 2 Minuten in Sekunden

const handleCancel = () => {
  const elapsedTime = getElapsedTime();  // in Sekunden

  if (elapsedTime < MIN_LOGGABLE_DURATION) {
    // Zu kurz, direkt verwerfen
    discardSession();
    return;
  }

  // Dialog anzeigen
  setShowCancelDialog(true);
};

const handleLogPartial = () => {
  const session: FocusSession = {
    id: generateId(),
    taskId: currentTask?.id ?? null,
    startedAt: sessionStartTime,
    endedAt: new Date(),
    plannedDuration: timerSettings.focusDuration,
    actualDuration: getElapsedTime(),
    type: 'partial',
    completionReason: 'cancelled',
  };

  saveSession(session);
  resetTimer();
};
```

### UI Mockups

**Cancel-Dialog (Normal):**
```
┌─────────────────────────────────────────┐
│                                         │
│       Session beenden?                  │
│                                         │
│    Du hast 18:24 von 25:00 gearbeitet.  │
│                                         │
│   ┌──────────────┐  ┌────────────────┐  │
│   │ Verwerfen    │  │ Zeit loggen    │  │
│   │     [D]      │  │   [Enter]      │  │
│   └──────────────┘  └────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**Cancel-Dialog (Mit Overflow):**
```
┌─────────────────────────────────────────┐
│                                         │
│       Session beenden?                  │
│                                         │
│    Du hast 32:15 gearbeitet             │
│    (25:00 + 7:15 Overflow)              │
│                                         │
│   ┌──────────────┐  ┌────────────────┐  │
│   │ Verwerfen    │  │ 32 min loggen  │  │
│   │     [D]      │  │   [Enter]      │  │
│   └──────────────┘  └────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**Statistik-Anzeige (später):**
```
Heute: 3h 45min
─────────────────────────────────────────
●●●●○  4 volle Sessions (1h 40min)
◐◐     2 partielle Sessions (52min)
●●●    3 Overflow-Sessions (1h 13min)
```

**Legende:**
- `●` = Volle Session
- `◐` = Partial Session
- `●` mit Rand = Overflow Session

### Analytics-Aggregation

```typescript
interface DailyStats {
  date: Date;
  fullSessions: number;
  partialSessions: number;
  overflowSessions: number;
  totalFocusTime: number;  // Sekunden
  totalBreakTime: number;

  // Breakdown
  fullSessionTime: number;
  partialSessionTime: number;
  overflowTime: number;  // Extra-Zeit über geplante Duration
}

const calculateDailyStats = (sessions: FocusSession[]): DailyStats => {
  return sessions.reduce((stats, session) => {
    stats.totalFocusTime += session.actualDuration;

    switch (session.type) {
      case 'full':
        stats.fullSessions++;
        stats.fullSessionTime += session.actualDuration;
        break;
      case 'partial':
        stats.partialSessions++;
        stats.partialSessionTime += session.actualDuration;
        break;
      case 'overflow':
        stats.overflowSessions++;
        stats.overflowTime += session.actualDuration - session.plannedDuration;
        break;
    }

    return stats;
  }, initialStats);
};
```

## Minimum Duration Threshold

### Warum 2 Minuten?

- **Unter 2 min:** Wahrscheinlich versehentlich gestartet
- **Über 2 min:** Echte Arbeit, sollte geloggt werden

### Konfigurierbar?

**v1:** Hardcoded 2 Minuten
**Später:** Settings-Option (0, 1, 2, 5 Minuten)

## Nicht im Scope (v1)

- Partial-Session-Breakdown in detaillierter Statistik
- Grund für Abbruch erfassen ("Warum?")
- Partial Sessions nachträglich zu Full konvertieren
- Minimum Threshold in Settings anpassbar

## Testing

### Manuell zu testen

- [ ] Cancel nach 30 Sekunden = kein Dialog, verworfen
- [ ] Cancel nach 5 Minuten = Dialog erscheint
- [ ] "Zeit loggen" speichert korrekte Duration
- [ ] "Verwerfen" speichert nichts
- [ ] Overflow + Cancel loggt Gesamtzeit
- [ ] Statistik zeigt Partial Sessions

## Definition of Done

- [ ] Cancel-Dialog mit Loggen/Verwerfen Optionen
- [ ] Minimum Threshold (2 min) implementiert
- [ ] Session-Type 'partial' in Datenmodell
- [ ] Partial Sessions werden in Statistik erfasst
- [ ] Keyboard-Shortcuts (L, D, Enter, Escape)
- [ ] Overflow-kompatibel
- [ ] Code Review abgeschlossen
- [ ] **Prüffrage:** Fühlt es sich an wie echte Datenerfassung, nicht wie Bestrafung?
