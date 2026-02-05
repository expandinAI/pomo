---
type: story
status: backlog
priority: p1
effort: 3
feature: intelligent-particles
created: 2026-02-05
updated: 2026-02-05
done_date: null
tags: [ai, coach, intention, alignment, reflection, 10x]
---

# POMO-382: Intention-Coach Bridge — "The Compass Speaks"

## User Story

> As a **Particle user who sets daily intentions**,
> I want **the AI coach to acknowledge and enrich my intention throughout the day**,
> so that **my intention feels like a living compass, not a forgotten note**.

## Context

Currently, Intentions (`G I`) and Coach (`G C`) are separate worlds. You set an intention in the morning, but the Coach never mentions it. The Evening Reflection exists, but it doesn't leverage AI for personalized insights.

This story creates **three touchpoints** where the Coach meets your Intention:

1. **Morning Nudge** — When setting your intention, get context from past data
2. **Session Awareness** — The app knows if your current work aligns
3. **Evening Insight** — A personalized sentence about your intention-reality gap

### The 10x Philosophy

> "A compass that only works in the morning is just a decoration."

## Acceptance Criteria

### A) Morning Nudge (IntentionOverlay)

- [ ] **Given** user opens IntentionOverlay to set intention, **When** they type an intention, **Then** show contextual insight if relevant data exists
- [ ] **Given** intention matches a known project/task, **When** data exists, **Then** show "Last week: 4 particles on this. Your sweet spot was 90-min sessions."
- [ ] **Given** intention is new/unknown, **When** no matching data, **Then** show nothing (no generic fluff)

### B) Live Alignment Awareness

- [ ] **Given** intention is set and session is running, **When** current task/project doesn't match intention, **Then** alignment toggle defaults to "Reactive" (existing behavior, just document)
- [ ] **Given** IntentionDisplay below timer, **When** current session is reactive, **Then** subtle visual differentiation (already exists via POMO-352)

*Note: This section confirms existing behavior is intentional, no new development needed.*

### C) Evening Reflection Enhancement

- [ ] **Given** user triggers Evening Reflection, **When** intention was set today, **Then** show AI-generated insight about the day
- [ ] **Given** Evening Reflection shows, **When** some particles were aligned and some reactive, **Then** insight mentions the split: "3 of 5 aligned. The 2 reactive ones were emails — 40 minutes total."
- [ ] **Given** Evening Reflection shows, **When** 100% aligned, **Then** celebrate: "Fully aligned day. Every particle served your intention."
- [ ] **Given** Evening Reflection shows, **When** 0% aligned, **Then** neutral observation: "Life happened. Tomorrow's a fresh page."

### D) Coach Context Extension

- [ ] **Given** user opens Coach modal, **When** intention is set, **Then** Coach has full context of today's intention + alignment data
- [ ] **Given** chatting with Coach, **When** asking about today, **Then** Coach can reference intention and alignment

## Technical Details

### Affected Files

```
src/
├── components/
│   ├── timer/
│   │   ├── IntentionOverlay.tsx      # Add morning nudge section
│   │   └── EveningReflection.tsx     # Add AI insight
│   └── coach/
│       └── CoachView.tsx             # Context already includes intention
├── lib/
│   └── coach/
│       ├── context-builder.ts        # Extend with intention data
│       ├── intention-insights.ts     # NEW: Intention-specific insights
│       └── prompts.ts                # Add intention-aware prompts
└── hooks/
    └── useIntentionInsight.ts        # NEW: Hook for intention insights
```

### A) Morning Nudge Implementation

```typescript
// In IntentionOverlay.tsx
const { insight, isLoading } = useIntentionInsight(intentionText);

// Display below input:
{insight && (
  <p className="text-xs text-tertiary mt-2">
    {insight}
  </p>
)}
```

```typescript
// src/hooks/useIntentionInsight.ts
function useIntentionInsight(intentionText: string) {
  // Debounce the input (500ms)
  // Search sessions for matching project/task names
  // If found, calculate stats:
  //   - How many particles last week on this topic
  //   - Average session duration
  //   - Most productive time
  // Return insight string or null
}
```

**Examples:**
- Input: "Brand redesign" → Match project "Brand Redesign" → "Last week: 4 particles. Best sessions around 9am."
- Input: "emails" → Match task pattern → "You spend ~3 particles/week on emails. Usually 15-20 min each."
- Input: "something new" → No match → Show nothing

### C) Evening Reflection Enhancement

```typescript
// In EveningReflection.tsx
// After showing alignment stats, add AI insight:

const { insight } = useEveningInsight({
  intention: todayIntention,
  sessions: todaySessions,
  alignedCount,
  reactiveCount,
});

// Display:
<p className="text-sm text-secondary italic mt-4">
  "{insight}"
</p>
```

```typescript
// src/lib/coach/intention-insights.ts
async function generateEveningInsight(context: EveningContext): Promise<string> {
  // For Flow users: API call with context
  // For Free users: Local template-based insight

  // Context includes:
  // - Intention text
  // - Total particles today
  // - Aligned vs reactive count
  // - Reactive sessions' tasks/projects
  // - Total time aligned vs reactive
}
```

**AI Prompt for Evening Insight:**

```typescript
const EVENING_INSIGHT_PROMPT = `Generate a single reflective sentence about someone's workday.

Context:
- Their intention was: "{intention}"
- They completed {total} particles
- {aligned} were aligned with their intention
- {reactive} were reactive (unplanned): {reactiveTasks}
- Aligned time: {alignedMinutes} min
- Reactive time: {reactiveMinutes} min

Rules:
- One sentence, maximum 20 words
- Specific to their data (mention numbers, tasks)
- Neutral tone — no judgment, no guilt
- No advice or "you should"
- No emojis

Good: "3 of 5 aligned. Emails took the other 40 minutes — worth knowing."
Bad: "Great job staying focused!" (generic)
Bad: "You should reduce email time." (advice)
`;
```

### D) Coach Context Extension

```typescript
// src/lib/coach/context-builder.ts
interface CoachContext {
  // ... existing fields ...

  // NEW: Intention data
  todayIntention?: {
    text: string;
    particleGoal?: number;
    alignedCount: number;
    reactiveCount: number;
    alignedMinutes: number;
    reactiveMinutes: number;
    reactiveTasks: string[];  // What pulled attention away
  };
}
```

## UI/UX

### Morning Nudge in IntentionOverlay

```
┌─────────────────────────────────────┐
│  What's your focus for today?       │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Brand redesign finalize        │││
│  └─────────────────────────────────┘│
│                                     │
│  Last week: 4 particles on Brand    │  ← Morning nudge
│  Redesign. Sweet spot: 90-min.      │
│                                     │
│  Particles: [3] [4] [5] [6] [·]     │
│                                     │
│             [Set Intention]         │
└─────────────────────────────────────┘
```

### Evening Reflection with Insight

```
┌─────────────────────────────────────┐
│  Evening Reflection                 │
│                                     │
│  Your intention: "Brand redesign"   │
│                                     │
│  ○ ○ ● ● ○                         │
│  3 aligned · 2 reactive             │
│                                     │
│  "3 of 5 aligned. Emails took the   │  ← AI insight
│   other 40 minutes — worth knowing."│
│                                     │
│  How does this feel?                │
│  [Done] [Partial] [Tomorrow]        │
└─────────────────────────────────────┘
```

## Testing

### Manual Testing

- [ ] Set intention matching existing project → insight appears
- [ ] Set intention with unknown text → no insight
- [ ] Complete day with mixed alignment → evening insight reflects split
- [ ] Complete day 100% aligned → evening insight celebrates
- [ ] Complete day 0% aligned → evening insight is neutral
- [ ] Open Coach, ask about intention → Coach knows context
- [ ] Free tier user → local insights (no API)
- [ ] Flow tier user → AI-generated insights

### Automated Tests

- [ ] Unit test intention matching logic
- [ ] Unit test evening insight generation
- [ ] Test context builder includes intention data

## Definition of Done

- [ ] Morning nudge shows relevant context when setting intention
- [ ] Evening reflection includes AI-generated insight
- [ ] Coach has full intention context for chat
- [ ] Graceful handling for users without intention
- [ ] Works for both Free (local) and Flow (API) tiers
- [ ] Typecheck + Lint pass
- [ ] Tested end-to-end: morning → day → evening flow

## Notes

**The rhythm this creates:**

```
Morning:  "Brand redesign — you did 4 particles on this last week."
          [User sets intention with informed context]

Midday:   [Particles accumulate, alignment tracked automatically]
          IntentionDisplay shows current intention below timer

Evening:  "3 of 5 aligned. Emails took the other 40 minutes."
          [User reflects on the gap between intention and reality]
```

This is a **daily rhythm with meaning** — not just tracking, but understanding.

**API cost:**
- 1 query for evening insight (only if Flow + intention set)
- Morning nudge is pure local heuristics (no API)
