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
depends_on: []
blocks: []
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

- [ ] **Given** user opens Coach (`G C`) and the previous week has >= 3 particles, **When** no cached narrative exists for that week, **Then** generate and cache a weekly narrative
- [ ] **Given** user opens Coach and a cached narrative exists for last week, **When** displaying, **Then** serve cached version (no regeneration)
- [ ] **Given** previous week had < 3 particles, **When** opening Coach, **Then** show gentle fallback: "A quiet week. Sometimes rest is the work."
- [ ] **Given** a new week starts (Monday 00:00), **When** user opens Coach, **Then** last week's narrative is generated fresh (previous cache expired)

### Narrative Content

The narrative captures:
- **Arc**: How the week progressed (strong start? mid-week slump? finish strong?)
- **Contrasts**: Deep work vs scattered, one project vs many
- **Highlight**: The standout moment (ties into Particle of the Week if available)
- **Texture**: Specific details (project names, days, counts)

### Display

- [ ] **Given** narrative exists, **When** viewing CoachView, **Then** narrative appears in dedicated "This Week" section **above** Particle of the Week
- [ ] **Given** narrative is displayed, **Then** max 3 sentences, approximately 40-60 words total
- [ ] **Given** narrative exists, **When** viewing, **Then** show compact stats below: "{particles} particles · {hours} · {projects} projects"

### Caching

- [ ] **Given** narrative generated for a week, **When** accessing again within same week, **Then** serve cached version from localStorage
- [ ] **Given** new week starts (Monday), **When** accessing Coach, **Then** old cache invalidated, new narrative generated for completed week
- [ ] **Given** cache key format, **Then** use `particle:weekly-narrative:{ISO-week-start-date}` (e.g., `particle:weekly-narrative:2026-01-26`)

### Tier Handling

- [ ] **Given** Flow tier user, **When** generating narrative, **Then** use API call (1 query per week)
- [ ] **Given** Free tier user, **When** generating narrative, **Then** use local template-based generation
- [ ] **Given** API fails for Flow user, **When** generating, **Then** fall back to local template

## Technical Details

### Affected Files

```
src/
├── components/
│   └── coach/
│       ├── CoachView.tsx             # Add WeeklyNarrative section above POTW
│       └── WeeklyNarrative.tsx       # NEW: Narrative display + loading state
├── lib/
│   └── coach/
│       ├── weekly-narrative.ts       # NEW: Narrative generation (local + API)
│       └── prompts.ts                # Add WEEKLY_NARRATIVE_PROMPT
├── app/
│   └── api/
│       └── coach/
│           └── narrative/
│               └── route.ts          # NEW: Narrative generation endpoint
└── hooks/
    └── useWeeklyNarrative.ts         # NEW: Hook for narrative state + caching
```

### Hook Design

```typescript
// src/hooks/useWeeklyNarrative.ts
interface WeeklyNarrativeState {
  narrative: string | null;
  stats: {
    totalParticles: number;
    totalMinutes: number;
    projectCount: number;
  } | null;
  isLoading: boolean;
  weekLabel: string;  // "This Week" oder "Last Week" oder "Jan 26 – Feb 1"
}

export function useWeeklyNarrative(): WeeklyNarrativeState {
  // 1. Determine which week to show:
  //    - Monday/Sunday: Show just-completed week as "This Week"
  //    - Other days: Show previous week as "Last Week"
  //
  // 2. Check localStorage cache:
  //    const cacheKey = `particle:weekly-narrative:${weekStartISO}`;
  //    If cached + valid → return immediately
  //
  // 3. Load week's sessions from IndexedDB
  //    If < 3 work particles → return fallback, don't cache
  //
  // 4. Generate narrative:
  //    Flow tier → API call
  //    Free tier → generateLocalNarrative()
  //    API fail → fallback to local
  //
  // 5. Cache result in localStorage
}
```

### Narrative Generation

```typescript
// POST /api/coach/narrative
// Counts toward 300/month AI quota (1 per week = ~4/month)

interface NarrativeRequest {
  weekData: {
    startDate: string;               // ISO date (Monday)
    endDate: string;                 // ISO date (Sunday)
    totalParticles: number;
    totalMinutes: number;
    dailyBreakdown: {
      day: string;                   // "Monday", "Tuesday", ...
      date: string;                  // ISO date
      particles: number;
      minutes: number;
      mainProject?: string;          // Most-used project that day
    }[];
    projectDistribution: {
      name: string;
      percentage: number;            // 0-100
      particles: number;
      minutes: number;
    }[];
    particleOfTheWeek?: {
      task?: string;
      projectName?: string;
      duration: number;
      timestamp: string;
      reason: string;                // "longest", "early_bird", etc.
    };
    intentionStats?: {
      daysWithIntention: number;     // 0-7
      averageAlignmentPercent: number; // 0-100
    };
  };
}

interface NarrativeResponse {
  narrative: string;                 // 3 sentences, ~50 words
}
```

### AI Prompt (Haiku)

```typescript
const WEEKLY_NARRATIVE_PROMPT = `Write a 3-sentence story about someone's work week.

Week data:
{weekData}

Rules:
- Exactly 3 sentences
- First sentence: The overall arc or theme of the week
- Second sentence: A specific detail, contrast, or turning point
- Third sentence: The highlight or a forward-looking closing thought
- Use specific data: project names, day names, particle counts, durations
- Write like a thoughtful journal entry, not a productivity report
- No advice, no "you should", no "keep it up"
- No emojis, no exclamation marks
- Warm but not cheesy. Dieter Rams, not Tony Robbins.
- Maximum 60 words total

Good example:
"A week of contrasts. Monday and Tuesday you were deep in Brand Redesign — 6 particles, almost all aligned. Wednesday the everyday took over: emails, calls, shorter sessions."

Bad example:
"You had a productive week with 14 particles! Great job on your focus time. Keep up the good work!" (generic, cheerleader tone)
`;
```

### Local Fallback (Free Tier & API-Failure)

```typescript
// src/lib/coach/weekly-narrative.ts

interface WeekData {
  totalParticles: number;
  totalMinutes: number;
  dailyBreakdown: { day: string; particles: number; minutes: number; mainProject?: string }[];
  projectDistribution: { name: string; percentage: number; particles: number }[];
  particleOfTheWeek?: { projectName?: string; duration: number; reason: string };
}

function generateLocalNarrative(data: WeekData): string {
  const { totalParticles, dailyBreakdown, projectDistribution } = data;

  if (totalParticles < 3) {
    return "A quiet week. Sometimes rest is the work.";
  }

  // Find strongest and weakest days
  const activeDays = dailyBreakdown.filter(d => d.particles > 0);
  const strongestDay = activeDays.reduce((a, b) => a.particles > b.particles ? a : b);
  const mainProject = projectDistribution[0];

  // Build 3 sentences with variety based on data shape

  // Sentence 1: Arc
  let s1: string;
  if (activeDays.length >= 5) {
    s1 = `${totalParticles} particles across ${activeDays.length} days — a full week.`;
  } else if (activeDays.length <= 2) {
    s1 = `A focused week. ${activeDays.length} days, ${totalParticles} particles — quality over quantity.`;
  } else {
    s1 = `${totalParticles} particles spread across ${activeDays.length} days.`;
  }

  // Sentence 2: Detail
  let s2: string;
  if (projectDistribution.length === 1 && mainProject) {
    s2 = `All dedicated to ${mainProject.name}.`;
  } else if (mainProject && mainProject.percentage >= 60) {
    s2 = `${mainProject.name} dominated with ${mainProject.percentage}% of your time.`;
  } else if (projectDistribution.length >= 3) {
    s2 = `Split across ${projectDistribution.length} projects — a week of variety.`;
  } else {
    s2 = `${strongestDay.day} was your strongest with ${strongestDay.particles} particles.`;
  }

  // Sentence 3: Highlight
  let s3: string;
  if (data.particleOfTheWeek) {
    const potw = data.particleOfTheWeek;
    const durationMin = Math.round(potw.duration / 60);
    s3 = potw.projectName
      ? `Standout moment: ${durationMin} minutes on ${potw.projectName}.`
      : `Standout moment: a ${durationMin}-minute deep session.`;
  } else {
    s3 = `${strongestDay.day} was the highlight with ${strongestDay.particles} particles.`;
  }

  return `${s1} ${s2} ${s3}`;
}
```

**Wichtig:** Der lokale Fallback hat 3 Variablen pro Satz (Arc/Detail/Highlight), was ~27 Kombinationen ergibt. Dadurch fuehlt sich die Narrative nicht repetitiv an, selbst fuer Free-User.

### Caching Strategy

```typescript
// Cache in localStorage (nicht IndexedDB, da ephemere Daten)
const CACHE_PREFIX = 'particle:weekly-narrative:';

interface CachedNarrative {
  narrative: string;
  stats: { totalParticles: number; totalMinutes: number; projectCount: number };
  generatedAt: string;       // ISO timestamp
}

function getCacheKey(weekStart: Date): string {
  return `${CACHE_PREFIX}${weekStart.toISOString().split('T')[0]}`;
}

function isCacheValid(weekStart: Date): boolean {
  const cached = localStorage.getItem(getCacheKey(weekStart));
  if (!cached) return false;

  // Cache ist gueltig solange die Woche nicht vorbei ist
  const weekEnd = addDays(weekStart, 7);
  return new Date() < weekEnd;
}
```

## UI/UX

### CoachView Layout

```
┌─────────────────────────────────────────┐
│  Coach                             [X]  │
├─────────────────────────────────────────┤
│                                         │
│  Last Week                              │  ← Section Header (text-xs text-tertiary uppercase)
│                                         │
│  "A week of contrasts. Monday and       │  ← Narrative (text-sm text-secondary, blockquote)
│   Tuesday you were deep in Brand        │
│   Redesign — 6 particles, almost all    │
│   aligned. Wednesday the everyday took  │
│   over."                                │
│                                         │
│  14 particles · 6.2h · 3 projects       │  ← Stats (text-xs text-tertiary)
│                                         │
│  ─────────────────────────────────────  │  ← Separator
│                                         │
│  ✧ Particle of the Week                 │  ← Existing POTW section
│  ...                                    │
├─────────────────────────────────────────┤
│  [Insights / Chat Bereich]              │
└─────────────────────────────────────────┘
```

### Component

```tsx
// src/components/coach/WeeklyNarrative.tsx
interface WeeklyNarrativeProps {
  narrative: string;
  stats: { totalParticles: number; totalMinutes: number; projectCount: number };
  weekLabel: string;
  isLoading: boolean;
}

export function WeeklyNarrative({ narrative, stats, weekLabel, isLoading }: WeeklyNarrativeProps) {
  if (isLoading) return <NarrativeSkeleton />;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-tertiary uppercase tracking-wider">
        {weekLabel}
      </h3>

      <blockquote className="text-sm text-secondary leading-relaxed">
        {narrative}
      </blockquote>

      <p className="text-xs text-tertiary">
        {stats.totalParticles} particles · {formatDuration(stats.totalMinutes)} ·{' '}
        {stats.projectCount} {stats.projectCount === 1 ? 'project' : 'projects'}
      </p>
    </div>
  );
}
```

### Loading State

```
┌─────────────────────────────────────────┐
│  Last Week                              │
│                                         │
│  ████████████████████████████           │  ← Skeleton line 1
│  ████████████████████                   │  ← Skeleton line 2
│  ████████████                           │  ← Skeleton line 3
│                                         │
│  ██ particles · ██ · ██                 │
└─────────────────────────────────────────┘
```

- Skeleton: `bg-tertiary/10 animate-pulse rounded h-3`
- Loading dauert max 2-3s (Haiku ist schnell)
- Cached version erscheint sofort

## Testing

### Manual Testing

- [ ] Open Coach on Monday → narrative for last week shown as "Last Week"
- [ ] Open Coach on Wednesday → same narrative still shown (cached)
- [ ] Open Coach on next Monday → new narrative for completed week
- [ ] Week with < 3 particles → "A quiet week. Sometimes rest is the work."
- [ ] Week with 20+ particles → rich narrative with project details
- [ ] Week with 1 dominant project → narrative mentions dedication
- [ ] Week with scattered projects → narrative reflects variety
- [ ] Flow tier: narrative generated via API
- [ ] Free tier: narrative generated locally (template-based)
- [ ] API fails for Flow → falls back to local template
- [ ] Loading state shows skeleton while generating
- [ ] Cached narrative loads instantly (no skeleton)
- [ ] Stats line below narrative shows correct numbers

### Automated Tests

- [ ] Unit test `generateLocalNarrative()` — all combination paths
- [ ] Test with single-project week → "All dedicated to..."
- [ ] Test with dominant project → percentage mentioned
- [ ] Test with variety → project count mentioned
- [ ] Test with < 3 particles → gentle fallback
- [ ] Test cache key generation and validation
- [ ] Test cache expiration at week boundary

## Definition of Done

- [ ] WeeklyNarrative component renders in CoachView above POTW
- [ ] Narrative generated via API (Flow) or locally (Free)
- [ ] Proper caching in localStorage (1 generation per week, persists)
- [ ] Graceful fallback for sparse weeks (< 3 particles)
- [ ] Loading skeleton while generating
- [ ] Stats line shows particles, duration, project count
- [ ] Typecheck + Lint pass
- [ ] Tested across different week patterns (busy, quiet, focused, varied)

## Notes

**Wann zeigen:**
- Die Narrative bezieht sich immer auf die **letzte abgeschlossene Woche** (Mo-So)
- Label: "Last Week" (Dienstag-Sonntag), "This Week" (Montag = gerade abgeschlossen)
- Am Montag sieht es aus wie "frisch generiert", den Rest der Woche wie "Referenz"

**Warum 3 Saetze?**
- 1 = zu kurz, kein Arc
- 3 = Setup, Detail, Conclusion (klassische Story-Struktur)
- 5+ = zu lang, verliert Impact

**API-Kosten:**
- 1 Query pro Woche (gecached) = ~4/Monat
- ~$0.002 per Narrative (Haiku)
- Minimaler Impact auf 300/Monat Quota

**Abhaengigkeiten:**
- Nutzt bestehenden CoachView (POMO-321, done) als Host
- Nutzt bestehenden Particle of the Week (POMO-338, done) als Referenz
- Nutzt `useSessionStore()` fuer Wochen-Daten
- Kann parallel zu allen anderen Stories entwickelt werden

**Future enhancements:**
- Monthly narrative (aggregiert 4 Wochen)
- Yearly narrative (fuer Year View `G Y`)
- Narrative sharing (als Image exportieren, wie Year View Export)
- "Regenerate" Button im Coach (verbraucht 1 Query)
