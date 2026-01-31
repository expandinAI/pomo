---
type: story
status: backlog
priority: p2
effort: 2
feature: "[[features/ai-coach]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [ai, coach, settings]
---

# POMO-326: Coach Settings

## User Story

> Als **Flow-User**
> möchte ich **die Coach-Benachrichtigungen anpassen können**,
> damit **ich die richtige Balance zwischen hilfreich und störend finde**.

## Kontext

Link zum Feature: [[features/ai-coach]]

Manche User wollen mehr Insights, manche weniger. Einstellbar machen.

## Akzeptanzkriterien

- [ ] Setting: Proaktive Hinweise (Mehr / Normal / Weniger / Aus)
- [ ] Setting: Wöchentliche Zusammenfassung (An / Aus)
- [ ] Setting: Toast-Dauer (3s / 5s / 8s)
- [ ] Settings im Account/Settings-Bereich
- [ ] Settings werden in DB gespeichert
- [ ] Änderungen wirken sofort

## Technische Details

### Betroffene Dateien
```
src/
├── components/
│   └── settings/
│       └── CoachSettings.tsx     # NEU
└── lib/
    └── coach/
        └── settings.ts           # NEU: Defaults & Types
```

### Settings-Schema
```typescript
interface CoachSettings {
  proactiveHints: 'more' | 'normal' | 'less' | 'off';
  weeklySummary: boolean;
  toastDuration: 3 | 5 | 8; // Sekunden
}

const DEFAULT_COACH_SETTINGS: CoachSettings = {
  proactiveHints: 'normal',
  weeklySummary: true,
  toastDuration: 5,
};
```

### Frequenz-Mapping

| Setting | Max Insights/Tag | Cooldown |
|---------|------------------|----------|
| `more` | 5 | 1h |
| `normal` | 3 | 2h |
| `less` | 1 | 4h |
| `off` | 0 | - |

### Datenbank
```sql
-- In users Tabelle oder separate settings Tabelle
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  coach_settings JSONB DEFAULT '{"proactiveHints": "normal", "weeklySummary": true, "toastDuration": 5}'::jsonb;
```

## UI/UX

Im Settings-Bereich:
```
┌─────────────────────────────────────────────────────────────────┐
│ Coach                                                            │
│ ─────────────────────────────────────────────────────────────   │
│                                                                   │
│ Proaktive Hinweise                                               │
│ ┌─────────┬─────────┬─────────┬─────────┐                       │
│ │  Mehr   │ Normal  │ Weniger │   Aus   │                       │
│ └─────────┴────●────┴─────────┴─────────┘                       │
│ Der Coach teilt gelegentlich Beobachtungen mit dir              │
│                                                                   │
│ Wöchentliche Zusammenfassung                          [●]       │
│ Jeden Montag eine Übersicht deiner Woche                        │
│                                                                   │
│ Toast-Dauer                                                       │
│ ┌─────────┬─────────┬─────────┐                                 │
│ │   3s    │   5s    │   8s    │                                 │
│ └─────────┴────●────┴─────────┘                                 │
│ Wie lange Hinweise sichtbar bleiben                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Definition of Done

- [ ] Settings-UI implementiert
- [ ] Settings werden gespeichert
- [ ] Frequenz-Logic respektiert Settings
- [ ] Toast-Dauer konfigurierbar
- [ ] Wöchentliche Summary togglebar
