---
type: story
status: backlog
priority: p3
effort: 3
feature: "[[features/ai-coach]]"
created: 2026-02-02
updated: 2026-02-02
done_date: null
tags: [ai, coach, weekly-report]
---

# POMO-332: Coach Weekly Reports

## User Story

> As a **Flow user**,
> I want to **receive a weekly AI-generated focus summary**,
> so that **I can reflect on my productivity patterns and progress**.

## Context

Link: [[features/ai-coach]]

Spun off from POMO-326 (Coach Settings). The toggle UI exists in CoachSettings but functionality needs to be implemented.

## Acceptance Criteria

- [ ] Weekly report generated every Monday
- [ ] Uses AI to create personalized insights
- [ ] Includes: total focus time, top projects, patterns, achievements
- [ ] Delivered via in-app notification or email
- [ ] Respects `weeklySummaryEnabled` setting from CoachSettings
- [ ] Can be viewed in Coach history

## Technical Details

### Trigger Options

1. **Cron Job (Backend)**
   - Run Monday 9am user's timezone
   - Generate for all users with setting enabled
   - Store in database

2. **Client-Side (Simpler)**
   - Check on app load if it's Monday and no report this week
   - Generate on-demand
   - Cache in localStorage

### Report Content

```typescript
interface WeeklyReport {
  weekOf: string;              // "Jan 27 - Feb 2, 2026"
  totalMinutes: number;
  totalParticles: number;
  topProjects: Array<{
    name: string;
    minutes: number;
    percentage: number;
  }>;
  patterns: string[];          // AI-generated observations
  achievement: string | null;  // "New personal best!" etc.
  encouragement: string;       // AI-generated closing
}
```

### Files to Create/Modify

```
src/
├── lib/
│   └── coach/
│       └── weekly-report.ts       # NEW: Report generation
├── components/
│   └── coach/
│       └── WeeklyReportCard.tsx   # NEW: Display component
└── hooks/
    └── useWeeklyReport.ts         # NEW: Hook for fetching/generating
```

## UI/UX

Weekly report could appear as:
1. Special Coach message on Monday
2. Dedicated section in Coach view
3. Push notification (if implemented)

## Definition of Done

- [ ] Report generation logic implemented
- [ ] AI generates personalized insights
- [ ] Report displayed in Coach
- [ ] Setting toggle works (enable/disable)
- [ ] Reports cached to avoid re-generation
