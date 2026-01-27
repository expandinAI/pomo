---
type: story
status: done
priority: p2
effort: 2
feature: "[[features/wellbeing]]"
created: 2026-01-25
updated: 2026-01-27
done_date: 2026-01-27
tags: [wellbeing, breaks, health, centered-learning, p2]
---

# POMO-151: Smart Break Reminders (Optional)

## User Story

> Als **Deep-Work-Nutzer, der lange Sessions macht**
> möchte ich **an gesunde Gewohnheiten erinnert werden (optional)**,
> damit **ich nicht zu lange ohne Pause arbeite und gesund bleibe**.

## Kontext

Link zum Feature: [[features/wellbeing]]

**Centered-Learning:** Centered hat einen AI-Coach, der an Pausen, Wasser trinken und Augen-Ruhe erinnert. Das ist wissenschaftlich sinnvoll – aber bei Centered oft als störend empfunden.

**Particle-Philosophie:**
- **Opt-in, nicht Opt-out** – Default ist AUS
- **Dezent, nicht störend** – Kein Popup, nur subtiler Hinweis
- **Respektiert den Flow** – Nicht während Deep Work unterbrechen

## Design-Prinzipien

1. **Komplett optional** – Default ist deaktiviert
2. **Nicht störend** – Subtiler Hinweis, kein Popup/Sound
3. **Wissenschaftlich** – 20-20-20 Regel, Hydration, Bewegung
4. **Respektiert Flow** – Nicht im Overflow oder Deep Focus stören

## Akzeptanzkriterien

### Settings

- [ ] **Given** Settings, **When** "Wellbeing", **Then** Break Reminders Section
- [ ] **Given** Break Reminders, **When** Default, **Then** alle deaktiviert
- [ ] **Given** Reminder-Typ, **When** Toggle, **Then** individuell aktivierbar

### Reminder-Typen

- [ ] **Given** "20-20-20 Regel" aktiviert, **When** 20 min ohne Pause, **Then** dezenter Hinweis
- [ ] **Given** "Hydration" aktiviert, **When** 45 min ohne Pause, **Then** dezenter Hinweis
- [ ] **Given** "Bewegung" aktiviert, **When** 60 min ohne Pause, **Then** dezenter Hinweis

### Anzeige

- [ ] **Given** Reminder getriggert, **When** angezeigt, **Then** subtiler Text im Timer-Bereich
- [ ] **Given** Reminder, **When** angezeigt, **Then** kein Sound, kein Popup
- [ ] **Given** Reminder, **When** User im Overflow, **Then** NICHT anzeigen (Flow respektieren)
- [ ] **Given** Reminder, **When** Session pausiert, **Then** NICHT anzeigen

### Dismissal

- [ ] **Given** Reminder sichtbar, **When** 30 Sekunden, **Then** automatisch ausblenden
- [ ] **Given** Reminder sichtbar, **When** User klickt, **Then** sofort ausblenden

## Technische Details

### Reminder-Typen

```typescript
interface BreakReminder {
  id: 'eye-rest' | 'hydration' | 'movement';
  name: string;
  description: string;
  intervalMinutes: number;
  message: string;
}

const BREAK_REMINDERS: BreakReminder[] = [
  {
    id: 'eye-rest',
    name: '20-20-20 Regel',
    description: 'Alle 20 Min: 20 Sek in die Ferne schauen',
    intervalMinutes: 20,
    message: '👀 Kurz in die Ferne schauen (20 Sek)',
  },
  {
    id: 'hydration',
    name: 'Hydration',
    description: 'Erinnerung zum Trinken',
    intervalMinutes: 45,
    message: '💧 Zeit für einen Schluck Wasser',
  },
  {
    id: 'movement',
    name: 'Bewegung',
    description: 'Kurz aufstehen und strecken',
    intervalMinutes: 60,
    message: '🚶 Kurz aufstehen und strecken',
  },
];
```

### Reminder-Logik

```typescript
const shouldShowReminder = (
  reminder: BreakReminder,
  sessionState: SessionState,
  settings: UserSettings
): boolean => {
  // Nicht anzeigen wenn deaktiviert
  if (!settings.breakReminders[reminder.id]) return false;

  // Nicht im Overflow (Flow respektieren)
  if (sessionState.isOverflow) return false;

  // Nicht wenn pausiert
  if (sessionState.isPaused) return false;

  // Nicht wenn kürzlich Break genommen
  const timeSinceBreak = Date.now() - sessionState.lastBreakAt;
  if (timeSinceBreak < reminder.intervalMinutes * 60 * 1000) return false;

  // Zeit seit letztem Reminder dieses Typs
  const timeSinceReminder = Date.now() - (sessionState.lastReminders[reminder.id] || 0);
  if (timeSinceReminder < reminder.intervalMinutes * 60 * 1000) return false;

  return true;
};
```

### UI Mockup

**Settings:**
```
┌─────────────────────────────────────────────────┐
│  ⚙️ Wellbeing                                   │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Break Reminders                                │
│  Dezente Erinnerungen für gesunde Gewohnheiten  │
│                                                 │
│  ○ 20-20-20 Regel                    [Toggle]   │
│    Alle 20 Min: 20 Sek in die Ferne schauen     │
│                                                 │
│  ○ Hydration                         [Toggle]   │
│    Alle 45 Min: Trinken nicht vergessen         │
│                                                 │
│  ○ Bewegung                          [Toggle]   │
│    Alle 60 Min: Kurz aufstehen                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Reminder im Timer (dezent):**
```
┌─────────────────────────────────────┐
│                                     │
│            12:34                    │
│                                     │
│      Working on Feature             │
│                                     │
│   💧 Zeit für einen Schluck Wasser  │  ← Subtil, unten
│                                     │
└─────────────────────────────────────┘
```

**Hinweis-Stil:**
- Kleine Schrift (text-sm)
- Sekundäre Farbe (text-secondary)
- Keine Animation beim Erscheinen
- Faded nach 30 Sekunden

## Nicht im Scope (v1)

- Sound-Benachrichtigungen
- System-Notifications
- Tracking ob Reminder befolgt wurde
- Customizable Intervalle
- AI-basierte Empfehlungen

## Testing

### Manuell zu testen

- [ ] Reminders sind default deaktiviert
- [ ] Toggle aktiviert/deaktiviert korrekt
- [ ] Reminder erscheint nach Intervall
- [ ] Reminder erscheint NICHT im Overflow
- [ ] Reminder verschwindet nach 30 Sekunden
- [ ] Klick dismisst sofort

## Definition of Done

- [ ] Settings-UI für Reminders
- [ ] Reminder-Logik implementiert
- [ ] Dezente Anzeige im Timer
- [ ] Auto-hide nach 30 Sekunden
- [ ] Flow-Respekt (kein Overflow-Interrupt)
- [ ] Default: Alle deaktiviert
- [ ] Code Review abgeschlossen
- [ ] **Prüffrage:** Stört es den Flow? Nein → Done
