---
type: story
status: backlog
priority: p0
effort: 2
feature: "[[features/extended-presets]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [presets, ultradian, p0]
---

# POMO-068: 90-Minuten Ultradian Preset

## User Story

> Als **Deep Work Praktizierender**
> möchte ich **90-Minuten-Blöcke nutzen können**,
> damit **ich meinem biologischen Rhythmus folgen kann**.

## Kontext

Link zum Feature: [[features/extended-presets]]

Basiert auf Kleitman's Basic Rest-Activity Cycle: Menschen durchlaufen natürliche 90-120 Min Zyklen.

## Akzeptanzkriterien

- [ ] **Given** Ultradian Preset, **When** gewählt, **Then** 90min Arbeit, 20min Pause
- [ ] **Given** Shortcut, **When** 3 gedrückt, **Then** Ultradian aktiviert
- [ ] **Given** optionale Mid-Session, **When** bei 45min, **Then** kurze Atem-Übung (konfigurierbar)
- [ ] **Given** 2 Zyklen, **When** abgeschlossen, **Then** lange Pause (30min)
- [ ] **Given** Preset, **When** Info angezeigt, **Then** Ultradian Rhythm erklärt

## Technische Details

### Preset Konfiguration
```typescript
ultradian: {
  id: 'ultradian',
  name: '90-Min Block',
  shortcut: '3',
  work: 90 * 60,       // 90 Minuten
  shortBreak: 20 * 60, // 20 Minuten
  longBreak: 30 * 60,  // 30 Minuten
  sessionsUntilLong: 2,
  midSessionBreathing: true, // Optional bei 45min
  description: 'Based on Kleitman\'s Basic Rest-Activity Cycle',
}
```

### Optional: Mid-Session Breathing
```typescript
// Nach 45min in einer 90min Session
if (preset.id === 'ultradian' && elapsedTime === 45 * 60) {
  showMidSessionBreathing(); // Kurze 30-Sekunden Atem-Übung
}
```

### Info Tooltip
```
┌─────────────────────────────────────────────────┐
│ 90-Min Block (Ultradian)                        │
│                                                 │
│ Humans naturally cycle through 90-120 minute   │
│ periods of higher and lower attention          │
│ (Kleitman's Basic Rest-Activity Cycle).        │
└─────────────────────────────────────────────────┘
```

## Testing

### Manuell zu testen
- [ ] 90min Work Timer
- [ ] 20min Break Timer
- [ ] Shortcut 3 funktioniert
- [ ] Mid-Session Breathing (optional)
- [ ] Info Tooltip

## Definition of Done

- [ ] Preset konfiguriert
- [ ] In Command Palette
- [ ] Tooltip mit Info
- [ ] Mid-Session optional
