---
type: story
status: done
priority: p1
effort: 3
feature: intelligent-particles
created: 2026-02-06
updated: 2026-02-06
done_date: 2026-02-06
tags: [ai, coach, intention, alignment, weekly-patterns]
depends_on: [POMO-382]
blocks: []
---

# POMO-362+364: Coach Intention Intelligence — Weekly Awareness

## User Story

> As a **Particle user who sets daily intentions**,
> I want **the AI coach to see my weekly intention patterns, deferral chains, and recurring reactive work**,
> so that **it can make insightful observations beyond just today's snapshot**.

## Context

Before this story, the Coach only saw today's intention + today's alignment counts. Now it sees this week + last week's daily intentions with per-day alignment, deferred chains, and recurring reactive tasks.

## What was built

### New Types (`src/lib/coach/types.ts`)
- `DailyIntentionEntry` — per-day intention with alignment stats
- `WeeklyIntentionSummary` — aggregated weekly intention summary
- `DeferredChain` — tracks intentions deferred across days
- Extended `CoachContext` with `weeklyIntentions?` field

### Builder Functions (`src/lib/coach/context-builder.ts`)
- `getMondayDateString(weekOffset)` — Monday ISO date for current/previous week
- `traceDeferralChain(intention, map)` — follows deferredFrom links backwards
- `buildDeferredChains(intentions, map)` — filters and builds all chains
- `buildSingleWeekSummary(label, offset, intentions, map, sessions)` — 7-day breakdown
- `buildWeeklyIntentions(thisWeek, lastWeek, sessions)` — combines both weeks
- `formatContextForPrompt()` — new "Intention Patterns" section in coach context

### Enhanced System Prompt (`src/lib/coach/prompts.ts`)
- Richer "Intention Awareness" guidance for alignment trends, deferred intentions, reactive patterns, week-over-week comparison

### Tests (`src/lib/coach/__tests__/weekly-intentions-context.test.ts`)
- 19 unit tests covering traceDeferralChain, buildDeferredChains, buildSingleWeekSummary, formatContextForPrompt

### Bug Fix: Timezone
- Fixed `toISOString()` converting to UTC which shifted dates by -1 day in CET
- Added `toLocalDateString()` helper using local date components

## Coach Context Format

```
## Intention Patterns
This week: 5/7 days with intention, 27p, 74% aligned
  Mon: "Ship login" [completed] — 6p 83%
  Tue: "Ship login" [completed] (deferred 1x) — 5p 80%
  Wed: "Design review" — 4p 50%
  ⚠ "Ship login" deferred 1x (since 2026-02-02)
  Reactive: "email replies" 4x, "code review" 2x
Last week: 4/7 days with intention, 22p, 68% aligned
```

## Definition of Done

- [x] Weekly intention data built from IndexedDB (current + previous week)
- [x] Per-day alignment stats (particles, aligned, reactive, percentage)
- [x] Deferral chain tracing with circular reference protection
- [x] Top reactive tasks identified per week
- [x] Context formatted compactly (~145 tokens/week)
- [x] System prompt updated with richer intention awareness guidance
- [x] Timezone bug fixed (local dates, not UTC)
- [x] 19 unit tests passing
- [x] Typecheck + Lint clean
- [x] No UI changes (pure data layer)
