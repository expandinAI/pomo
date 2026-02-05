---
type: story
status: backlog
priority: p1
effort: 8
feature: daily-intentions
created: 2026-02-04
updated: 2026-02-04
done_date: null
tags: [intentions, week-view, gap-visible, analytics]
---

# POMO-360: Week Intentions View with Gap

## User Story

> As a **Particle user wanting to understand my patterns**,
> I want **to see my intentions and alignment over a week**,
> so that **I can see the gap between what I planned and what I did**.

## Context

Link: [[features/daily-intentions]]

**Phase 3: Reflection & Gap** — This is where the 10x insight becomes visible.

### The 10x Core

**"Particle shows you the gap between what you intended and what you actually did — and makes this gap visible, tangible, learnable."**

```
┌─────────────────────────────────────────────────────────────┐
│  Intentions                                            ✕    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  This Week                                                  │
│  ───────────────────────────────────────────────────────    │
│                                                             │
│  Mon  "Presentation"        ●●●●●           80%  ✓          │
│  Tue  "Feedback"            ●●●●            50%  ◐          │
│  Wed  —                     ●●●●●           —               │
│  Thu  "Launch"              ●●●●●●          100% ✓          │
│  Fri  "Documentation"       ●●●             67%  ◐          │
│                                                             │
│  ───────────────────────────────────────────────────────    │
│                                                             │
│  This week: 73% intentional                                 │
│  Without intention: 0% aligned (Wednesday)                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Acceptance Criteria

### Navigation

- [ ] Access via Statistics modal or dedicated view
- [ ] Keyboard shortcut (part of G I or new G W?)
- [ ] Week navigation: ←/→ or J/K for prev/next week

### Week Display

- [ ] Show 7 days (Mon-Sun)
- [ ] Each day shows:
  - Intention text (or "—" if none)
  - Particle dots with alignment colors
  - Alignment percentage
  - Status icon (✓/◐/→/—)

### Particles per Day

- [ ] Show actual particles completed that day
- [ ] Colors: white (aligned) vs gray (reactive)
- [ ] Max display: 9 dots (truncate with "+X" if more)

### Alignment Calculation

```
alignment_percentage = aligned_particles / total_particles × 100
```

- [ ] 0% if no aligned particles
- [ ] "—" if no intention set that day
- [ ] Days without intention: particles are neither aligned nor reactive

### Summary Row

- [ ] "This week: X% intentional"
- [ ] Note about days without intention
- [ ] Total particles / aligned particles

### Status Icons

| Status | Icon | Meaning |
|--------|------|---------|
| completed | ✓ | Intention fulfilled |
| partial | ◐ | Progress made |
| deferred | → | Moved to next day |
| skipped | — | No reflection |
| active | (today) | Current day |

## Technical Details

### Files to Create

```
src/components/intentions/
├── WeekIntentionsView.tsx     # Main component
├── DayIntentionRow.tsx        # Single day row
├── WeekSummary.tsx            # Bottom summary
└── index.ts                   # Export
```

### Data Fetching

```typescript
interface WeekIntentionData {
  date: string;
  intention: DailyIntention | null;
  particles: UnifiedSession[];
  alignedCount: number;
  reactiveCount: number;
  alignmentPercentage: number | null;
}

function useWeekIntentions(weekStart: Date): WeekIntentionData[] {
  const { getIntentionByDate } = useIntention();
  const { getSessionsByDateRange } = useSessionStore();

  // Get 7 days of data
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const intention = getIntentionByDate(date);
    const particles = getSessionsByDateRange(date, date);
    // ... calculate alignment
  });

  return days;
}
```

### Integration Point

Could be:
1. New modal (WeekIntentionsModal)
2. Tab in Statistics Dashboard
3. Section in Coach view

Recommend: Tab in Statistics Dashboard (consistent with other analytics)

### Keyboard Navigation

- [ ] `←`/`→` — Previous/next week
- [ ] `J`/`K` — Navigate days (highlight)
- [ ] `Enter` — Open day's intention overlay
- [ ] `Escape` — Close

## Testing

- [ ] Shows 7 days correctly
- [ ] Intentions display for each day
- [ ] Particle dots show correct colors
- [ ] Alignment percentages calculate correctly
- [ ] Days without intention show "—"
- [ ] Week navigation works
- [ ] Summary calculates correctly
- [ ] Status icons display correctly
- [ ] Empty week handles gracefully

## Definition of Done

- [ ] WeekIntentionsView component
- [ ] Integrated in Statistics or as modal
- [ ] Week navigation
- [ ] Alignment calculations
- [ ] Summary statistics
- [ ] Keyboard navigation
- [ ] Visual matches mockup
- [ ] Performance optimized (< 100ms load)

## Dependencies

- POMO-350 (Intention data model) ✓ Complete
- POMO-354 (Particle colors) — For alignment visualization
- POMO-359 (Intention status) — For status icons

## Design Notes

**Why week view, not month?**

- Week is actionable — you can remember what happened
- Month becomes abstract — too many days to track
- Coach works on weekly cycles

**The Gap is the Feature:**

The week view doesn't just show data. It shows:
- Days you had intention vs. didn't
- How aligned you were each day
- Patterns: "Mondays are reactive, Thursdays are focused"

**Coach Integration:**

Coach can reference this view:
> "Looking at your week, you were 80% aligned Monday but only 50% Tuesday. What changed?"

**Future Enhancement:**
- Click on day → opens that day's intention detail
- Trend graph over weeks
- Export week summary
