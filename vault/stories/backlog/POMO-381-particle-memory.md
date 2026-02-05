---
type: story
status: backlog
priority: p1
effort: 5
feature: intelligent-particles
created: 2026-02-05
updated: 2026-02-05
done_date: null
tags: [ai, coach, memory, storytelling, 10x]
---

# POMO-381: Particle Memory — "Every Particle Remembers"

## User Story

> As a **Particle user reviewing my completed sessions**,
> I want **each particle to have a unique, AI-generated memory sentence**,
> so that **every moment of focused work feels meaningful and memorable**.

## Context

Currently, particles are just rows in a list: time, duration, project, task. They're data, not memories.

This story transforms each particle into **a moment with meaning**. A single sentence that captures what made this particular session noteworthy. The app "remembers" you — and that creates emotional connection no feature set can replicate.

### The 10x Philosophy

> "Numbers you forget. Stories you remember."

## Acceptance Criteria

### Memory Generation

- [ ] **Given** a work session completes, **When** saving to IndexedDB, **Then** generate and store a memory sentence
- [ ] **Given** the AI API fails, **When** saving the session, **Then** save without memory (graceful degradation)
- [ ] **Given** the user is on Free tier, **When** session completes, **Then** generate memory using local heuristics (no API)

### Memory Display

- [ ] **Given** a particle has a memory, **When** viewing ParticleDetailOverlay, **Then** display the memory below the time/duration info
- [ ] **Given** a particle has no memory, **When** viewing ParticleDetailOverlay, **Then** show nothing (no empty state)
- [ ] **Given** viewing Timeline, **When** hovering a particle with memory, **Then** show memory in tooltip

### Memory Types

Memories should capture what made this session **unique**:

| Type | Example | Trigger |
|------|---------|---------|
| **Duration Milestone** | "Your longest particle this week — 12 minutes of overflow." | Longest in 7 days |
| **Streak Moment** | "5 particles in a single day — last achieved January 14th." | Daily record |
| **Return After Break** | "First particle after 3 days of rest." | Gap > 2 days |
| **Deep Work** | "52 uninterrupted minutes. No task switch." | Long session, single task |
| **Ritual Detection** | "7:30am Tuesday — like every Tuesday." | Recurring time pattern |
| **Project Dedication** | "3rd consecutive particle on Design System." | Same project streak |
| **Early Bird** | "Started at 6:14am. Ahead of the world." | Session before 7am |
| **Night Owl** | "11:47pm. The quiet hours." | Session after 10pm |
| **Overflow Champion** | "Planned 25, worked 41. In the zone." | Significant overflow |
| **Milestone Proximity** | "Particle #99. One more to a hundred." | Near round number |

### Data Model

- [ ] Add `memory?: string` field to `DBSession` interface
- [ ] Memory is optional — older sessions won't have it
- [ ] Memory is immutable once generated (no regeneration)

## Technical Details

### Affected Files

```
src/
├── lib/
│   ├── db/
│   │   └── types.ts                    # Add memory field to DBSession
│   └── coach/
│       └── memory-generator.ts         # NEW: Memory generation logic
├── components/
│   └── timer/
│       ├── Timer.tsx                   # Trigger memory generation on complete
│       └── ParticleDetailOverlay.tsx   # Display memory
├── app/
│   └── api/
│       └── coach/
│           └── memory/
│               └── route.ts            # NEW: Memory generation endpoint
└── hooks/
    └── useParticleMemory.ts            # NEW: Hook for memory operations
```

### Memory Generation Flow

```
Session Completes
       │
       ▼
┌──────────────────────┐
│ Collect Context:     │
│ - Session data       │
│ - Recent sessions    │
│ - Patterns           │
│ - Milestones         │
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ User Tier?           │
├──────────────────────┤
│ Flow → API Call      │
│ Free → Local Heuristic│
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ Save session with    │
│ memory field         │
└──────────────────────┘
```

### API Endpoint

```typescript
// POST /api/coach/memory
// Request:
{
  session: {
    id: string;
    type: 'work';
    duration: number;
    task?: string;
    projectId?: string;
    completedAt: string;
    overflowDuration?: number;
  };
  context: {
    todayCount: number;
    weekCount: number;
    longestThisWeek: number;
    lastSessionGap: number; // hours since last session
    projectStreak: number;  // consecutive sessions on same project
    totalLifetime: number;
    patterns: DetectedPatterns;
  };
}

// Response:
{
  memory: string; // e.g., "Your longest particle this week — 12 minutes of overflow."
}
```

### AI Prompt

```typescript
const MEMORY_SYSTEM_PROMPT = `You generate a single memorable sentence about a focus session.

Rules:
- Maximum 15 words
- Specific, not generic
- Celebratory but not over-the-top
- Reference actual data (numbers, times, project names)
- No emojis
- No questions
- No "you should" or advice

Good examples:
- "Your longest particle this week — 12 minutes of overflow."
- "5 particles in a single day — last achieved January 14th."
- "7:30am Tuesday — like every Tuesday."

Bad examples:
- "Great job!" (too generic)
- "You worked for 25 minutes." (just restating data)
- "Keep up the good work!" (motivational fluff)
`;
```

### Local Heuristic Fallback (Free Tier)

```typescript
// src/lib/coach/memory-generator.ts
function generateLocalMemory(session: DBSession, context: MemoryContext): string | null {
  // Check triggers in priority order
  if (isLongestThisWeek(session, context)) {
    return `Longest particle this week — ${formatDuration(session.duration)}.`;
  }
  if (isDailyRecord(context)) {
    return `${context.todayCount} particles today — a new daily record.`;
  }
  if (isReturnAfterBreak(context)) {
    return `First particle after ${context.lastSessionGap} days.`;
  }
  if (isEarlyBird(session)) {
    return `${formatTime(session.completedAt)} — ahead of the world.`;
  }
  // ... more heuristics

  // Return null if nothing noteworthy
  return null;
}
```

## UI/UX

### ParticleDetailOverlay

```
┌─────────────────────────────────────┐
│  Particle #47                  [X]  │
├─────────────────────────────────────┤
│                                     │
│  09:14 → 09:52  ·  38 min          │
│  Design System                      │
│  "Implement color tokens"           │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ "Your longest particle this     ││
│  │  week — 12 minutes of overflow."││  ← Memory (italic, subtle)
│  └─────────────────────────────────┘│
│                                     │
│  [Aligned] [Reactive]               │
│                                     │
└─────────────────────────────────────┘
```

**Memory Styling:**
- Font: `text-sm italic text-secondary`
- Background: `bg-tertiary/5` (very subtle)
- Padding: `px-3 py-2`
- Border: `border-l-2 border-tertiary/20` (quote-style)
- Animation: Fade in after 200ms

### Timeline Tooltip Enhancement

```
┌──────────────────────────────┐
│ 09:14 - 09:52                │
│ Design System · 38 min       │
│                              │
│ "Your longest this week."    │  ← Memory in tooltip
└──────────────────────────────┘
```

## Testing

### Manual Testing

- [ ] Complete a session as Flow user → memory generated via API
- [ ] Complete a session as Free user → memory generated locally (or none)
- [ ] API fails → session saved without memory, no error shown
- [ ] Old sessions without memory → no memory displayed
- [ ] Memory appears in ParticleDetailOverlay
- [ ] Memory appears in Timeline tooltip
- [ ] Very long memory → truncated gracefully

### Automated Tests

- [ ] Unit tests for local memory generator with various triggers
- [ ] Unit tests for memory context builder
- [ ] Integration test for API endpoint
- [ ] Test graceful degradation on API failure

## Definition of Done

- [ ] `memory` field added to DBSession
- [ ] Memory generated on session completion (API or local)
- [ ] Memory displayed in ParticleDetailOverlay
- [ ] Memory shown in Timeline tooltip
- [ ] Graceful fallback when API unavailable
- [ ] No breaking changes to existing sessions
- [ ] Typecheck + Lint pass
- [ ] Tested with Flow and Free tier users

## Notes

**Cost consideration:**
- ~$0.001 per memory (Haiku)
- Flow users only (300 queries/month includes memories)
- Each session = 1 query toward quota

**Why immutable?**
Memories should feel like journal entries — written once, preserved forever. Regenerating would destroy the authenticity.

**Future enhancements:**
- Memory search ("Show me all overflow particles")
- Memory export (for personal journaling)
- Memory themes (poetic, professional, minimal)
