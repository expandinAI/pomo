---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/gamification]]"
created: 2026-01-23
updated: 2026-01-23
done_date: null
tags: [gamification, goals, daily-target, llama-life-learning, p1]
---

# POMO-145: Daily Goals

## User Story

> Als **Nutzer**
> möchte ich **ein tägliches Session-Ziel setzen können**,
> damit **ich einen klaren Fokus für den Tag habe und meinen Fortschritt sehen kann**.

## Kontext

Link zum Feature: [[features/gamification]]

**Competitor Learning:** Toggl und andere Apps bieten Daily Goals. Es gibt dem Tag Struktur und ein klares Ziel. "4 von 6 Sessions heute" ist motivierender als nur die rohe Zahl.

## Akzeptanzkriterien

### Goal-Setting
- [ ] **Given** Settings, **When** Daily Goal, **Then** Slider/Input für Ziel (1-12 Sessions)
- [ ] **Given** Kein Goal gesetzt, **When** Default, **Then** 4 Sessions als Standard
- [ ] **Given** Goal ändern, **When** mitten am Tag, **Then** Fortschritt bleibt erhalten

### Progress-Anzeige
- [ ] **Given** Goal gesetzt, **When** Timer-View, **Then** "2/4 Sessions" sichtbar
- [ ] **Given** Session abgeschlossen, **When** Zähler, **Then** erhöht sich um 1
- [ ] **Given** Goal erreicht, **When** angezeigt, **Then** "✓ Tagesziel erreicht!"
- [ ] **Given** Goal übertroffen, **When** 5/4, **Then** "5/4 Sessions (+1 Bonus)"

### Visual Progress
- [ ] **Given** Progress, **When** angezeigt, **Then** Progress-Bar oder Kreise
- [ ] **Given** Progress-Bar, **When** Goal erreicht, **Then** Farbe wechselt zu Grün/Accent
- [ ] **Given** Goal erreicht, **When** erstmals heute, **Then** Celebration (optional)

### Reset
- [ ] **Given** Neuer Tag (Mitternacht), **When** App geöffnet, **Then** Progress auf 0/X reset
- [ ] **Given** Verschiedene Zeitzonen, **When** Reset, **Then** basiert auf lokaler Zeit

## Technische Details

### Datenmodell

```typescript
interface DailyGoal {
  targetSessions: number;          // z.B. 4
  currentSessions: number;         // z.B. 2
  date: string;                    // "2026-01-23"
  goalReachedAt?: Date;            // Wann Goal erreicht wurde
}

interface UserSettings {
  dailyGoal: number;               // Default: 4
  showDailyGoal: boolean;          // Default: true
  celebrateGoalReached: boolean;   // Default: true
}
```

### Progress-Berechnung

```typescript
const getDailyProgress = (goal: DailyGoal): DailyProgress => {
  const progress = goal.currentSessions / goal.targetSessions;
  const isCompleted = goal.currentSessions >= goal.targetSessions;
  const isOverachieved = goal.currentSessions > goal.targetSessions;
  const bonus = Math.max(0, goal.currentSessions - goal.targetSessions);

  return {
    current: goal.currentSessions,
    target: goal.targetSessions,
    progress: Math.min(progress, 1),  // Max 100% für Bar
    isCompleted,
    isOverachieved,
    bonus,
    label: isOverachieved
      ? `${goal.currentSessions}/${goal.targetSessions} (+${bonus} Bonus)`
      : `${goal.currentSessions}/${goal.targetSessions} Sessions`,
  };
};
```

### UI Mockup

**Im Timer-View:**
```
┌─────────────────────────────────────┐
│  🔥 12 Tage              2/4 ○○●●   │  ← Oben: Streak + Goal
│                                     │
│            25:00                    │
│                                     │
│        Working on Task              │
└─────────────────────────────────────┘
```

**Progress-Varianten:**

Option A: Kreise
```
○ ○ ● ●    (2/4 Sessions)
● ● ● ●    (4/4 - Goal reached!)
● ● ● ● ●  (5/4 - Bonus!)
```

Option B: Progress Bar
```
████████░░░░░░░░  2/4 Sessions
████████████████  4/4 Tagesziel erreicht! ✓
████████████████▓▓▓▓  5/4 (+1 Bonus)
```

**Goal erreicht:**
```
┌─────────────────────────────────────┐
│                                     │
│     ✨ Tagesziel erreicht! ✨       │
│                                     │
│         4/4 Sessions                │
│                                     │
│    Weiter so oder Feierabend?       │
│                                     │
└─────────────────────────────────────┘
```

### Settings UI

```
┌─────────────────────────────────────┐
│  ⚙️ Tagesziel                       │
│  ───────────────────────────────    │
│                                     │
│  Sessions pro Tag:                  │
│  [  4  ] ← +  →                     │
│                                     │
│  ☑ Tagesziel anzeigen               │
│  ☑ Bei Erreichen feiern             │
└─────────────────────────────────────┘
```

## Nicht im Scope (v1)

- Wochenziele
- Monatsziele
- Zeit-basierte Goals (statt Session-basiert)
- Verschiedene Goals pro Wochentag

## Testing

### Manuell zu testen
- [ ] Goal kann gesetzt werden
- [ ] Progress erhöht sich bei Session-Abschluss
- [ ] Reset um Mitternacht
- [ ] Goal-Reached wird erkannt
- [ ] Bonus-Sessions werden gezählt
- [ ] Settings-Toggle funktioniert

## Definition of Done

- [ ] Goal-Setting in Settings
- [ ] Progress-Anzeige im Timer-View
- [ ] Daily Reset implementiert
- [ ] Celebration bei Goal-Reached
- [ ] Persistenz (localStorage/DB)
- [ ] Code Review abgeschlossen
