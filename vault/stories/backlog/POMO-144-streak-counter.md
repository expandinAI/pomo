---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/gamification]]"
created: 2026-01-23
updated: 2026-01-23
done_date: null
tags: [gamification, streak, retention, llama-life-learning, p1]
---

# POMO-144: Streak Counter

## User Story

> Als **Nutzer**
> möchte ich **sehen, wie viele Tage in Folge ich Particle genutzt habe**,
> damit **ich motiviert bleibe, meine Streak nicht zu brechen**.

## Kontext

Link zum Feature: [[features/gamification]]

**Competitor Learning:** Forest und Session haben beide Streak-Counter. Es ist ein bewährtes Retention-Feature, das Nutzer täglich zurückbringt. "Don't break the chain" ist psychologisch sehr wirksam.

## Akzeptanzkriterien

### Streak-Logik
- [ ] **Given** User hat heute Session abgeschlossen, **When** morgen Session, **Then** Streak +1
- [ ] **Given** User hat gestern keine Session, **When** heute Session, **Then** Streak reset auf 1
- [ ] **Given** Streak aktiv, **When** Tag ohne Session endet (Mitternacht), **Then** Streak reset
- [ ] **Given** Erste Session ever, **When** abgeschlossen, **Then** Streak startet bei 1

### Anzeige
- [ ] **Given** Streak vorhanden, **When** Dashboard/Timer, **Then** "🔥 7 Tage" sichtbar
- [ ] **Given** Streak = 0, **When** angezeigt, **Then** "Starte deine Streak!" oder ausblenden
- [ ] **Given** Streak Milestone, **When** 7/30/100 Tage, **Then** besondere Hervorhebung

### Streak-Schutz (Optional)
- [ ] **Given** Streak gefährdet, **When** 20:00 Uhr ohne Session, **Then** Reminder-Notification
- [ ] **Given** Settings, **When** Streak-Reminder, **Then** Ein/Aus + Uhrzeit einstellbar

### Streak-Freeze (Premium Feature, später)
- [ ] **Given** Premium User, **When** Streak Freeze aktiviert, **Then** 1 Tag Pause ohne Reset

## Technische Details

### Datenmodell

```typescript
interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;  // ISO date "2026-01-23"
  streakStartDate: string;
}

const updateStreak = (data: StreakData, today: string): StreakData => {
  const lastActive = new Date(data.lastActiveDate);
  const todayDate = new Date(today);
  const diffDays = Math.floor(
    (todayDate.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    // Gleicher Tag, nichts ändern
    return data;
  } else if (diffDays === 1) {
    // Nächster Tag, Streak fortsetzen
    return {
      ...data,
      currentStreak: data.currentStreak + 1,
      longestStreak: Math.max(data.longestStreak, data.currentStreak + 1),
      lastActiveDate: today,
    };
  } else {
    // Mehr als 1 Tag Pause, Streak reset
    return {
      currentStreak: 1,
      longestStreak: data.longestStreak,
      lastActiveDate: today,
      streakStartDate: today,
    };
  }
};
```

### UI Mockup

**Im Timer-View (dezent):**
```
┌─────────────────────────────────────┐
│                     🔥 12 Tage      │  ← Oben rechts, klein
│                                     │
│            25:00                    │
│                                     │
│        Working on Task              │
└─────────────────────────────────────┘
```

**Im Stats-Dashboard:**
```
┌─────────────────────────────────────┐
│  🔥 Streak                          │
│  ───────────────────────────────    │
│                                     │
│       12 Tage                       │
│    aktuelle Streak                  │
│                                     │
│  Längste Streak: 45 Tage            │
│  Gestartet: 12. Januar 2026         │
│                                     │
│  ████████████░░░░░░░░░░░░░░░░       │
│  12/30 Tage bis zum nächsten        │
│  Milestone 🏆                       │
└─────────────────────────────────────┘
```

### Milestones

```typescript
const STREAK_MILESTONES = [
  { days: 3, label: "Guter Start", emoji: "🌱" },
  { days: 7, label: "Eine Woche!", emoji: "⭐" },
  { days: 14, label: "Zwei Wochen!", emoji: "🌟" },
  { days: 30, label: "Ein Monat!", emoji: "🔥" },
  { days: 60, label: "Zwei Monate!", emoji: "💪" },
  { days: 100, label: "100 Tage!", emoji: "🏆" },
  { days: 365, label: "Ein Jahr!", emoji: "👑" },
];
```

### Notification (Optional)

```typescript
// Abends um 20:00 (einstellbar)
const sendStreakReminder = (streak: number) => {
  if (streak > 0 && !hasSessionToday()) {
    notify({
      title: "Deine Streak ist in Gefahr! 🔥",
      body: `${streak} Tage Streak – eine kurze Session reicht!`,
    });
  }
};
```

## Nicht im Scope (v1)

- Streak-Freeze (Premium Feature)
- Streak-Sharing auf Social Media
- Team-Streaks
- Streak-Wettbewerbe

## Testing

### Manuell zu testen
- [ ] Streak erhöht sich bei täglicher Nutzung
- [ ] Streak reset bei verpasstem Tag
- [ ] Streak-Anzeige im Timer-View
- [ ] Streak-Details im Stats-Dashboard
- [ ] Milestones werden erkannt
- [ ] Längste Streak wird korrekt gespeichert

## Definition of Done

- [ ] Streak-Logik implementiert
- [ ] Persistenz (localStorage/DB)
- [ ] UI im Timer-View
- [ ] UI im Stats-Dashboard
- [ ] Milestone-Erkennung
- [ ] Streak-Reminder (optional)
- [ ] Code Review abgeschlossen
