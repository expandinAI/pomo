---
type: story
status: done
priority: p2
effort: 2
feature: "[[features/ai-coach]]"
created: 2026-01-31
updated: 2026-02-02
done_date: 2026-02-02
tags: [ai, coach, settings]
---

# POMO-326: Coach Settings

## User Story

> As a **Flow user**,
> I want to **adjust Coach notification preferences**,
> so that **I find the right balance between helpful and distracting**.

## Context

Link: [[features/ai-coach]]

Some users want more insights, some want fewer. Make it configurable. Respect user preferences.

## Acceptance Criteria

- [ ] Setting: Proactive hints (More / Normal / Less / Off)
- [ ] Setting: Weekly summary (On / Off)
- [ ] Setting: Toast duration (3s / 5s / 8s)
- [ ] Settings in Account/Settings section
- [ ] Settings saved to database
- [ ] Changes take effect immediately

## Technical Details

### Files
```
src/
├── components/
│   └── settings/
│       └── CoachSettings.tsx     # NEW
└── lib/
    └── coach/
        └── settings.ts           # NEW: Defaults & types
```

### Settings Schema
```typescript
interface CoachSettings {
  proactiveHints: 'more' | 'normal' | 'less' | 'off';
  weeklySummary: boolean;
  toastDuration: 3 | 5 | 8; // seconds
}

const DEFAULT_COACH_SETTINGS: CoachSettings = {
  proactiveHints: 'normal',
  weeklySummary: true,
  toastDuration: 5,
};
```

### Frequency Mapping

| Setting | Max insights/day | Cooldown |
|---------|------------------|----------|
| `more` | 5 | 1h |
| `normal` | 3 | 2h |
| `less` | 1 | 4h |
| `off` | 0 | – |

### Database
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  coach_settings JSONB DEFAULT '{"proactiveHints": "normal", "weeklySummary": true, "toastDuration": 5}'::jsonb;
```

## UI/UX

In Settings section:
```
┌─────────────────────────────────────────────────────────────────┐
│ Coach                                                            │
│ ─────────────────────────────────────────────────────────────   │
│                                                                   │
│ Proactive Insights                                               │
│ ┌─────────┬─────────┬─────────┬─────────┐                       │
│ │  More   │ Normal  │  Less   │   Off   │                       │
│ └─────────┴────●────┴─────────┴─────────┘                       │
│ The Coach shares observations from time to time                  │
│                                                                   │
│ Weekly Summary                                         [●]       │
│ Get a summary of your week every Monday                         │
│                                                                   │
│ Toast Duration                                                    │
│ ┌─────────┬─────────┬─────────┐                                 │
│ │   3s    │   5s    │   8s    │                                 │
│ └─────────┴────●────┴─────────┘                                 │
│ How long insights stay visible                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Definition of Done

- [ ] Settings UI implemented
- [ ] Settings are saved
- [ ] Frequency logic respects settings
- [ ] Toast duration configurable
- [ ] Weekly summary toggleable
