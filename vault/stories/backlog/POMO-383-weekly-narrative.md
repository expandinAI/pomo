---
type: story
status: backlog
priority: p2
effort: 3
feature: intelligent-particles
created: 2026-02-05
updated: 2026-02-05
done_date: null
tags: [ai, coach, narrative, storytelling, weekly, 10x]
---

# POMO-383: Weekly Narrative — "The Story of Your Week"

## User Story

> As a **Particle user reviewing my weekly progress**,
> I want **a 3-sentence narrative that tells the story of my week**,
> so that **my work feels like a journey, not just statistics**.

## Context

The Coach currently shows daily insights — factual, useful, but forgettable. Statistics tell you *what* happened. Narratives tell you *who you were* that week.

This story transforms the weekly summary from numbers into a **micro-story**: 3 sentences that capture the arc of your week. Contrasts, pivots, highlights — written like a journal entry someone made *for you*.

### The 10x Philosophy

> "Numbers you forget. Stories you remember."

## Acceptance Criteria

### Narrative Generation

- [ ] **Given** it's Sunday or Monday, **When** user opens Coach, **Then** show weekly narrative prominently
- [ ] **Given** weekday, **When** user opens Coach, **Then** show previous week's narrative (smaller, secondary)
- [ ] **Given** < 3 particles last week, **When** generating narrative, **Then** show gentle message instead ("A quiet week. Sometimes rest is the work.")

### Narrative Content

The narrative should capture:
- **Arc**: How the week progressed (strong start, mid-week slump, finish strong?)
- **Contrasts**: Deep work vs scattered, one project vs many
- **Highlight**: The standout moment (ties into Particle of the Week)
- **Texture**: Specific details (project names, times, counts)

### Display

- [ ] **Given** narrative exists, **When** viewing CoachView, **Then** narrative appears in dedicated section above Particle of the Week
- [ ] **Given** narrative is long, **When** displaying, **Then** max 3 sentences, ~50 words total

### Caching

- [ ] **Given** narrative generated for a week, **When** accessing again, **Then** serve cached version
- [ ] **Given** new week starts, **When** accessing, **Then** generate fresh narrative for completed week

## Technical Details

### Affected Files

```
src/
├── components/
│   └── coach/
│       ├── CoachView.tsx             # Add WeeklyNarrative section
│       └── WeeklyNarrative.tsx       # NEW: Narrative display component
├── lib/
│   └── coach/
│       ├── weekly-narrative.ts       # NEW: Narrative generation logic
│       └── prompts.ts                # Add narrative prompt
├── app/
│   └── api/
│       └── coach/
│           └── narrative/
│               └── route.ts          # NEW: Narrative endpoint
└── hooks/
    └── useWeeklyNarrative.ts         # NEW: Hook for narrative state
```

### Narrative Generation

```typescript
// POST /api/coach/narrative
// Request:
{
  weekData: {
    startDate: string;           // ISO date
    endDate: string;
    totalParticles: number;
    totalMinutes: number;
    dailyBreakdown: {
      day: string;
      particles: number;
      minutes: number;
      mainProject?: string;
    }[];
    projectDistribution: {
      name: string;
      percentage: number;
      particles: number;
    }[];
    particleOfTheWeek?: {
      task: string;
      project: string;
      duration: number;
      timestamp: string;
      reason: string;  // "longest", "early_bird", etc.
    };
    intentionStats?: {
      daysWithIntention: number;
      averageAlignment: number;
    };
  };
}

// Response:
{
  narrative: string;
  generatedAt: string;
}
```

### AI Prompt

```typescript
const WEEKLY_NARRATIVE_PROMPT = `Write a 3-sentence story about someone's work week.

Week data:
{weekData}

Rules:
- Exactly 3 sentences
- First sentence: The overall arc or theme
- Second sentence: A specific detail or contrast
- Third sentence: The highlight or closing thought
- Use specific data (project names, days, numbers)
- Write like a thoughtful journal entry, not a report
- No advice, no "you should"
- No emojis
- Warm but not cheesy

Good example:
"A week of contrasts. Monday and Tuesday you were deep in Brand Redesign — 6 particles, almost all aligned. Wednesday the everyday took over: emails, calls, shorter sessions. Your Tuesday at 9:14 was the week's defining moment."

Bad example:
"You had a productive week with 14 particles! Great job on your focus time. Keep up the good work!" (generic, cheerleader tone)
`;
```

### Caching Strategy

```typescript
// Cache key: `particle:weekly-narrative:{weekStartDate}`
// TTL: Until next week starts
// Invalidation: Manual only (user can regenerate)

function getCacheKey(weekStart: Date): string {
  return `particle:weekly-narrative:${weekStart.toISOString().split('T')[0]}`;
}
```

### Local Fallback (Free Tier)

```typescript
function generateLocalNarrative(weekData: WeekData): string {
  const { totalParticles, projectDistribution, dailyBreakdown } = weekData;

  if (totalParticles < 3) {
    return "A quiet week. Sometimes rest is the work.";
  }

  const strongestDay = findStrongestDay(dailyBreakdown);
  const mainProject = projectDistribution[0]?.name || 'various projects';

  return `${totalParticles} particles across ${projectDistribution.length} projects. ` +
         `${strongestDay.day} was your strongest with ${strongestDay.particles} particles. ` +
         `Most of your time went to ${mainProject}.`;
}
```

## UI/UX

### CoachView Layout

```
┌─────────────────────────────────────────┐
│  Coach                             [X]  │
├─────────────────────────────────────────┤
│                                         │
│  This Week                              │
│  ─────────────────────────────────────  │
│                                         │
│  "A week of contrasts. Monday and       │
│   Tuesday you were deep in Brand        │
│   Redesign — 6 particles, almost all    │
│   aligned. Wednesday the everyday took  │
│   over: emails, calls, shorter sessions.│
│   Your Tuesday at 9:14 was the week's   │
│   defining moment."                     │
│                                         │
│  14 particles · 6.2h · 3 projects       │  ← Stats below narrative
│                                         │
├─────────────────────────────────────────┤
│  ✧ Particle of the Week                 │
│  ...                                    │
└─────────────────────────────────────────┘
```

### Styling

```tsx
<div className="space-y-3">
  <h3 className="text-sm font-medium text-primary">This Week</h3>

  <blockquote className="text-sm text-secondary leading-relaxed">
    "{narrative}"
  </blockquote>

  <p className="text-xs text-tertiary">
    {totalParticles} particles · {formatDuration(totalMinutes)} · {projectCount} projects
  </p>
</div>
```

## Testing

### Manual Testing

- [ ] Open Coach on Sunday/Monday → weekly narrative prominent
- [ ] Open Coach on Wednesday → previous week's narrative smaller
- [ ] Week with < 3 particles → gentle fallback message
- [ ] Week with 20+ particles → rich narrative
- [ ] Week with one dominant project → narrative mentions it
- [ ] Week with scattered projects → narrative reflects variety
- [ ] Refresh Coach → cached narrative served (no re-generation)
- [ ] New week starts → fresh narrative generated

### Automated Tests

- [ ] Unit test local fallback generator
- [ ] Test cache key generation
- [ ] Test week boundary detection

## Definition of Done

- [ ] WeeklyNarrative component renders in CoachView
- [ ] Narrative generated via API (Flow) or locally (Free)
- [ ] Proper caching (one generation per week)
- [ ] Graceful fallback for sparse weeks
- [ ] Typecheck + Lint pass
- [ ] Tested across different week patterns

## Notes

**When to show:**
- Sunday evening / Monday morning: "Your week" (just completed)
- Rest of week: "Last week" (smaller, reference)

**Why 3 sentences?**
- 1 = too terse, no arc
- 3 = setup, detail, resolution (classic story structure)
- 5+ = too long, loses impact

**API cost:**
- 1 query per week (cached)
- ~$0.002 per narrative (Haiku)
- Minimal impact on 300/month quota

**Future enhancements:**
- Monthly narrative
- Yearly narrative (for Year View)
- Narrative sharing (image export)
