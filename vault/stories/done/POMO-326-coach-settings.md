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

- [x] Setting: Proactive hints (More / Normal / Less / Off)
- [ ] Setting: Weekly summary (On / Off) → moved to POMO-332
- [x] Setting: Toast duration (3s / 5s / 8s)
- [x] Settings in Account/Settings section
- [x] Settings saved to localStorage
- [x] Changes take effect immediately

## Implementation Notes

### Implemented
- `src/hooks/useCoachSettings.ts` - Settings hook with localStorage persistence
- `src/components/settings/CoachSettings.tsx` - Settings UI (Flow-tier only)
- Frequency logic: More (5/day, 1h), Normal (3/day, 2h), Less (1/day, 4h), Off
- Toast duration: 3s / 5s / 8s configurable
- Integrated with `useCoach.ts` for proactive insights
- Integrated with `Timer.tsx` for StatusMessage duration

### Not Implemented (moved to POMO-332)
- Weekly Summary toggle (UI exists but functionality needs backend)

## Definition of Done

- [x] Settings UI implemented
- [x] Settings are saved (localStorage)
- [x] Frequency logic respects settings
- [x] Toast duration configurable
- [ ] Weekly summary toggleable → POMO-332
