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
depends_on: []
blocks: []
---

# POMO-382: Intention-Coach Bridge — "The Compass Speaks"

## User Story

> As a **Particle user who sets daily intentions**,
> I want **the AI coach to acknowledge and enrich my intention throughout the day**,
> so that **my intention feels like a living compass, not a forgotten note**.

## Context

Currently, Intentions (`G I`) and Coach (`G C`) are separate worlds. You set an intention in the morning, but the Coach never mentions it. The Evening Reflection (POMO-358, done) exists and shows alignment stats, but it doesn't leverage AI for personalized insights.

This story creates **drei Bruecken** zwischen Intention und Coach:

1. **Morning Context** — Beim Setzen der Intention: historische Daten zeigen
2. **Evening Insight** — Am Abend: AI-generierte Reflexion ueber den Tag
3. **Coach Awareness** — Im Chat: Coach kennt die Intention

### The 10x Philosophy

> "A compass that only works in the morning is just a decoration."

### Abgrenzung zu POMO-380 (Start Nudge)

POMO-380 zeigt einen Nudge unter dem Start-Button basierend auf Patterns. POMO-382 zeigt einen Insight **im IntentionOverlay** basierend auf dem eingetippten Intentions-Text. Unterschiedlicher Ort, unterschiedlicher Trigger:

| | POMO-380 (Start Nudge) | POMO-382 (Morning Context) |
|---|---|---|
| **Wo** | Timer-Hauptansicht, unter Start | IntentionOverlay (`G I`) |
| **Trigger** | Timer idle, automatisch | User tippt Intention ein |
| **Content** | Pattern-basiert (Zeit, Projekt, Progress) | Match auf historische Projekte/Tasks |
| **Beispiel** | "Tuesday 9am — peak window." | "Last week: 4 particles on Brand Redesign." |

## Acceptance Criteria

### A) Morning Context (IntentionOverlay)

- [ ] **Given** user opens IntentionOverlay (`G I`) to set intention, **When** they type text that matches an existing project name or recent task, **Then** show a contextual insight below the input field
- [ ] **Given** intention text matches a known project (fuzzy match), **When** historical data exists (>= 3 sessions on that project last 14 days), **Then** show insight like "Last week: 4 particles on Brand Redesign. Best sessions around 9am."
- [ ] **Given** intention text matches a frequent task pattern, **When** data exists, **Then** show insight like "You spend ~3 particles/week on emails. Usually 15-20 min each."
- [ ] **Given** intention text is new/unknown (no matching project or task), **When** no matching data, **Then** show nothing (no generic fluff, no empty state)
- [ ] **Given** user types quickly, **When** text changes, **Then** debounce search by 500ms to avoid flicker

### B) Evening Reflection Enhancement

Die bestehende EveningReflection (POMO-358, done) zeigt bereits Alignment-Stats und Status-Auswahl. Diese Story erweitert sie um einen **AI-generierten Insight-Satz**:

- [ ] **Given** user triggers Evening Reflection (automatisch >= 18 Uhr oder manuell via Command Palette), **When** intention was set today AND at least 1 work session exists, **Then** show AI-generated insight sentence below the alignment stats
- [ ] **Given** some particles were aligned and some reactive, **Then** insight mentions the split: "3 of 5 aligned. The 2 reactive ones were emails — 40 minutes total."
- [ ] **Given** 100% aligned, **Then** celebrate subtly: "Fully aligned day. Every particle served your intention."
- [ ] **Given** 0% aligned (all reactive), **Then** neutral observation: "Life happened. Tomorrow's a fresh page."
- [ ] **Given** no intention was set today, **Then** no AI insight shown (existing Evening Reflection behavior unchanged)
- [ ] **Given** user is on Free tier, **Then** use local template-based insight (no API call)
- [ ] **Given** user is on Flow tier, **Then** use API-generated insight (counts toward quota)
- [ ] **Given** API fails, **Then** fall back to local template (silent degradation)

### C) Coach Context Extension

- [ ] **Given** user opens Coach modal (`G C`), **When** intention is set today, **Then** Coach system prompt includes today's intention text + alignment stats
- [ ] **Given** chatting with Coach, **When** asking about today, **Then** Coach can reference intention and alignment data in responses
- [ ] **Given** no intention set today, **Then** Coach context unchanged (no mention of intentions)

## Technical Details

### Affected Files

```
src/
├── components/
│   └── timer/
│       ├── IntentionOverlay.tsx      # Add morning context section below input
│       └── EveningReflection.tsx     # Add AI insight below alignment stats
├── lib/
│   └── coach/
│       ├── context-builder.ts        # Extend CoachContext with intention data
│       ├── intention-insights.ts     # NEW: Morning context + evening insight logic
│       └── prompts.ts                # Extend COACH_SYSTEM_PROMPT with intention context
├── app/
│   └── api/
│       └── coach/
│           └── evening/
│               └── route.ts          # NEW: Evening insight endpoint
└── hooks/
    ├── useIntentionInsight.ts        # NEW: Hook for morning context in IntentionOverlay
    └── useEveningInsight.ts          # NEW: Hook for evening AI insight
```

### A) Morning Context Implementation

```typescript
// src/hooks/useIntentionInsight.ts
import { useSessionStore } from '@/lib/db';
import { useProjects } from '@/hooks/useProjects';

export function useIntentionInsight(intentionText: string): {
  insight: string | null;
  isLoading: boolean;
} {
  // 1. Debounce intentionText (500ms)
  // 2. Fuzzy-match against project names (case-insensitive substring)
  // 3. Fuzzy-match against recent task names (last 30 days)
  // 4. If match found with >= 3 sessions in last 14 days:
  //    - Count particles on matched project/task last 7 days
  //    - Calculate average session duration
  //    - Find most common hour (peak time)
  //    - Build insight string
  // 5. Return null if no match or insufficient data
}
```

**Matching-Logik:**
```typescript
function findMatchingContext(
  text: string,
  projects: Project[],
  recentSessions: DBSession[]
): MatchResult | null {
  const lowerText = text.toLowerCase().trim();
  if (lowerText.length < 3) return null; // Mindestlaenge

  // 1. Exakter Projekt-Match (case-insensitive)
  const projectMatch = projects.find(p =>
    p.name.toLowerCase().includes(lowerText) ||
    lowerText.includes(p.name.toLowerCase())
  );

  if (projectMatch) {
    const projectSessions = recentSessions.filter(
      s => s.projectId === projectMatch.id && s.type === 'work'
    );
    if (projectSessions.length >= 3) {
      return { type: 'project', name: projectMatch.name, sessions: projectSessions };
    }
  }

  // 2. Task-Pattern-Match (haeufigste Tasks der letzten 30 Tage)
  const taskMatch = findFrequentTaskMatch(lowerText, recentSessions);
  if (taskMatch && taskMatch.sessions.length >= 3) {
    return { type: 'task', name: taskMatch.taskName, sessions: taskMatch.sessions };
  }

  return null;
}
```

**Insight-Templates (lokal, kein API-Call):**
```typescript
function buildMorningInsight(match: MatchResult): string {
  const lastWeekCount = countLastWeek(match.sessions);
  const avgDuration = averageDuration(match.sessions);
  const peakHour = findPeakHour(match.sessions);

  if (peakHour !== null) {
    return `Last week: ${lastWeekCount} particles on ${match.name}. Best sessions around ${peakHour}.`;
  }
  return `Last week: ${lastWeekCount} particles on ${match.name}. Avg ${avgDuration} min each.`;
}
```

### B) Evening Insight Implementation

```typescript
// src/hooks/useEveningInsight.ts
interface EveningInsightContext {
  intentionText: string;
  totalParticles: number;
  alignedCount: number;
  reactiveCount: number;
  alignedMinutes: number;
  reactiveMinutes: number;
  reactiveTasks: string[];  // Task-Namen der reaktiven Sessions
}

export function useEveningInsight(context: EveningInsightContext | null): {
  insight: string | null;
  isLoading: boolean;
} {
  // null context = no intention today → return null
  // Free tier → generateLocalEveningInsight(context)
  // Flow tier → API call to /api/coach/evening
  // API fail → fallback to local
}
```

**Lokale Evening-Insight Templates (Free Tier):**
```typescript
function generateLocalEveningInsight(ctx: EveningInsightContext): string {
  const { alignedCount, reactiveCount, totalParticles, reactiveTasks } = ctx;

  if (totalParticles === 0) {
    return "A quiet day. Tomorrow's a fresh page.";
  }
  if (reactiveCount === 0) {
    return "Fully aligned day. Every particle served your intention.";
  }
  if (alignedCount === 0) {
    return "Life happened. Tomorrow's a fresh page.";
  }

  const reactiveTaskSummary = reactiveTasks.length > 0
    ? reactiveTasks.slice(0, 2).join(' & ')
    : 'unplanned work';

  return `${alignedCount} of ${totalParticles} aligned. ${reactiveTaskSummary} took the rest.`;
}
```

**API Prompt (Flow Tier, fuer Haiku):**
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
- Specific to their data (mention numbers, task names)
- Neutral tone — no judgment, no guilt
- No advice or "you should"
- No emojis, no exclamation marks
- Use em dash (—) for pause

Good: "3 of 5 aligned. Emails took the other 40 minutes — worth knowing."
Bad: "Great job staying focused!" (generic)
Bad: "You should reduce email time." (advice)
`;
```

### C) Coach Context Extension

```typescript
// In src/lib/coach/context-builder.ts
// Extend the existing buildCoachContext() function:

interface CoachContext {
  // ... existing fields (sessions, patterns, etc.) ...

  // NEU: Intention-Daten fuer heute
  todayIntention?: {
    text: string;
    particleGoal?: number;
    status: IntentionStatus;
    alignedCount: number;
    reactiveCount: number;
    alignedMinutes: number;
    reactiveMinutes: number;
    reactiveTasks: string[];
  };
}
```

**System-Prompt Erweiterung:**
```typescript
// In prompts.ts, append to COACH_SYSTEM_PROMPT when intention exists:
const INTENTION_CONTEXT_ADDENDUM = `
Today's intention: "{text}"
Alignment: {alignedCount}/{totalCount} particles aligned ({alignedMinutes} min)
Reactive work: {reactiveTasks}

When discussing today, reference the intention and alignment naturally.
Don't lecture about alignment — just acknowledge it as context.
`;
```

## UI/UX

### Morning Context in IntentionOverlay

```
┌─────────────────────────────────────┐
│  What's your focus for today?       │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Brand redesign finalize        │││
│  └─────────────────────────────────┘│
│                                     │
│  Last week: 4 particles on Brand   │  ← Morning context (text-xs text-tertiary)
│  Redesign. Best sessions around 9am│
│                                     │
│  Particles: [3] [4] [5] [6] [·]    │
│                                     │
│             [Set Intention]         │
└─────────────────────────────────────┘
```

**Styling:**
- `text-xs text-tertiary light:text-tertiary-dark`
- Below input, above particle goal selector
- Fade in (200ms) when insight becomes available
- Max 2 lines, truncate if needed

### Evening Reflection with AI Insight

```
┌─────────────────────────────────────┐
│  Evening Reflection                 │
│                                     │
│  Your intention: "Brand redesign"   │
│                                     │
│  ● ● ● ○ ○                         │
│  3 aligned · 2 reactive             │
│                                     │
│  "3 of 5 aligned. Emails took the   │  ← AI insight (text-sm italic text-secondary)
│   other 40 minutes — worth knowing."│
│                                     │
│  How does this feel?                │
│  [Done] [Partial] [Tomorrow]        │
└─────────────────────────────────────┘
```

**Styling des Insight-Satzes:**
- `text-sm italic text-secondary light:text-secondary-dark`
- Anführungszeichen links und rechts
- Fade in nach 300ms (wirkt nachdenklich)
- Position: Zwischen Alignment-Stats und "How does this feel?"

## Testing

### Manual Testing

- [ ] Set intention matching existing project → insight appears below input
- [ ] Set intention with partial project name → still matches (fuzzy)
- [ ] Set intention with unknown text → no insight shown
- [ ] Type quickly → no flicker (500ms debounce works)
- [ ] Clear intention input → insight disappears
- [ ] Complete day with mixed alignment → evening insight reflects split
- [ ] Complete day 100% aligned → evening insight celebrates subtly
- [ ] Complete day 0% aligned → evening insight is neutral
- [ ] No intention set → Evening Reflection unchanged, no insight
- [ ] Free tier: morning context local, evening insight local template
- [ ] Flow tier: morning context local, evening insight via API
- [ ] API failure → fallback to local template (no error shown)
- [ ] Open Coach (`G C`), ask about intention → Coach references it naturally
- [ ] Open Coach without intention → no intention mentioned

### Automated Tests

- [ ] Unit test `findMatchingContext()` — project match, task match, no match
- [ ] Unit test morning insight builder with various data
- [ ] Unit test `generateLocalEveningInsight()` — all alignment scenarios
- [ ] Test debounce in `useIntentionInsight` hook
- [ ] Test context builder includes intention data when set
- [ ] Test context builder omits intention when not set

## Definition of Done

- [ ] Morning context shows relevant historical data when typing intention
- [ ] Evening reflection includes AI-generated (Flow) or template-based (Free) insight
- [ ] Coach system prompt includes intention + alignment context when set
- [ ] Graceful handling for users without intention (no changes to existing behavior)
- [ ] Morning context is purely local (no API cost)
- [ ] Evening insight costs max 1 API query per day (Flow only)
- [ ] Typecheck + Lint pass
- [ ] Tested end-to-end: morning → day → evening flow

## Notes

**Der Rhythmus, den diese Story erzeugt:**

```
Morning:  "Brand redesign — you did 4 particles on this last week."
          [User sets intention with informed context]

Midday:   [Particles accumulate, alignment tracked automatically]
          IntentionDisplay shows current intention below timer

Evening:  "3 of 5 aligned. Emails took the other 40 minutes."
          [User reflects on the gap between intention and reality]
```

**API-Kosten:**
- Morning context: $0 (rein lokal, kein API-Call)
- Evening insight: ~$0.0005 pro Tag (1x Haiku, nur Flow Tier, nur wenn Intention gesetzt)
- Coach context: $0 (wird nur dem System-Prompt hinzugefuegt, kein Extra-Call)

**Abhaengigkeiten:**
- IntentionOverlay (POMO-351, done) muss erweitert werden
- EveningReflection (POMO-358, done) muss erweitert werden
- `useIntention()` Hook (done) liefert alle nötigen Daten
- Coach context-builder (done) muss erweitert werden
- Kann parallel zu POMO-380, 381, 383, 384 entwickelt werden
