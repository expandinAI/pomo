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
depends_on: []
blocks: []
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

### Scope

- **Nur Work-Sessions** erhalten Memories. Breaks sind Pausen, keine Leistungen.
- **Nur nach COMPLETE-Action** — nicht nach SKIP (< 60s Arbeit verdient kein Memory)
- **Immutable** — einmal generiert, nie ueberschrieben. Wie ein Tagebuch-Eintrag.

## Acceptance Criteria

### Memory Generation

- [ ] **Given** a work session completes (COMPLETE action, not SKIP), **When** saving to IndexedDB, **Then** generate and store a memory sentence
- [ ] **Given** the AI API fails or is unavailable, **When** saving the session, **Then** save session without memory (graceful degradation, no error shown to user)
- [ ] **Given** the user is on Free tier (no API access), **When** session completes, **Then** generate memory using local heuristics (template-based, no API)
- [ ] **Given** the user is on Flow tier, **When** session completes, **Then** generate memory via API call (Haiku model)
- [ ] **Given** a break session completes, **When** saving, **Then** no memory generated (breaks don't get memories)
- [ ] **Given** multiple sessions complete in quick succession, **When** generating memories, **Then** queue API calls (max 1 concurrent, fire-and-forget pattern)

### Memory Display

- [ ] **Given** a particle has a memory, **When** viewing ParticleDetailOverlay, **Then** display the memory in a quote-style block below the time/duration/task info
- [ ] **Given** a particle has no memory (old session or generation failed), **When** viewing ParticleDetailOverlay, **Then** show nothing in the memory area (no empty state)
- [ ] **Given** viewing Timeline, **When** hovering a particle with memory, **Then** show memory in tooltip below existing info
- [ ] **Given** viewing Timeline, **When** hovering a particle without memory, **Then** show normal tooltip (no change)

### Memory Types

Memories capture what made this session **unique**:

| Type | Example | Trigger Condition |
|------|---------|-------------------|
| **Duration Milestone** | "Longest particle this week — 12 minutes of overflow." | `session.duration > max(sessions last 7 days)` |
| **Daily Record** | "5 particles in a single day — a new daily record." | `todayCount > max(allDailyCounts)` |
| **Return After Break** | "First particle after 3 days of rest." | `daysSinceLastSession >= 3` |
| **Deep Work** | "52 uninterrupted minutes. No task switch." | `duration >= 45min && single task` |
| **Ritual Detection** | "7:30am Tuesday — like every Tuesday." | Pattern match via `detectTimeOfDayPattern()` |
| **Project Dedication** | "3rd consecutive particle on Design System." | `consecutiveSameProject >= 3` |
| **Early Bird** | "Started at 6:14am. Ahead of the world." | `sessionStartHour < 7` |
| **Night Owl** | "11:47pm. The quiet hours." | `sessionStartHour >= 22` |
| **Overflow Champion** | "Planned 25, worked 41. In the zone." | `overflowDuration >= estimatedDuration * 0.5` |
| **Milestone Proximity** | "Particle #99. One more to a hundred." | `lifetimeCount % 100 >= 95 OR lifetimeCount % 50 >= 48` |

### Data Model

- [ ] Add `memory?: string` field to `DBSession` interface in `src/lib/db/types.ts`
- [ ] Bump Dexie schema version (v4 -> v5) with migration that adds nothing (field is optional)
- [ ] Memory is optional — older sessions won't have it (backward compatible)
- [ ] Memory is immutable once generated (no update/regenerate API)
- [ ] Max length: 80 characters (enforced in both local and API generation)

## Technical Details

### Affected Files

```
src/
├── lib/
│   ├── db/
│   │   ├── types.ts                    # Add memory?: string to DBSession
│   │   └── database.ts                 # Bump schema version v4 -> v5
│   └── coach/
│       └── memory-generator.ts         # NEW: Memory generation (local + API)
├── components/
│   └── timer/
│       ├── Timer.tsx                   # Trigger memory generation after COMPLETE
│       └── ParticleDetailOverlay.tsx   # Display memory
├── app/
│   └── api/
│       └── coach/
│           └── memory/
│               └── route.ts            # NEW: Memory generation endpoint (Flow tier)
└── hooks/
    └── useParticleMemory.ts            # NEW: Hook for memory generation queue
```

### DB Migration

```typescript
// In database.ts — Dexie schema bump
// v4 (current): sessions table has existing fields
// v5 (new): add memory field (optional, no data migration needed)

db.version(5).stores({
  sessions: '++localId, id, serverId, type, completedAt, projectId, syncStatus',
  // memory field is not indexed — just stored as optional property
});
```

**Wichtig:** Da `memory` nicht indexiert wird, reicht ein Schema-Bump ohne Daten-Migration. Dexie fuegt das Feld automatisch bei neuen Eintraegen hinzu, bestehende Eintraege behalten ihren Zustand.

### Memory Generation Flow

```
Work Session Completes (COMPLETE action)
       │
       ▼
┌──────────────────────┐
│ Build MemoryContext:  │
│ - Session data       │
│ - Today's sessions   │
│ - This week's max    │
│ - Lifetime count     │
│ - Recent sessions    │
│ - Patterns           │
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ User Tier?           │
├──────────────────────┤
│ Flow → API Call      │──→ POST /api/coach/memory
│ Free → Local Logic   │──→ generateLocalMemory()
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ Update session with  │
│ memory field in DB   │  (fire-and-forget, no blocking)
└──────────────────────┘
```

**Wichtig: Fire-and-Forget Pattern**

Die Memory-Generierung darf den normalen Session-Completion-Flow **nicht blockieren**. Die Session wird sofort gespeichert. Das Memory wird asynchron nachgeliefert:

```typescript
// In Timer.tsx nach COMPLETE:
// 1. Session sofort speichern (ohne memory)
const savedSession = await saveSession(sessionData);

// 2. Memory asynchron generieren + updaten (fire-and-forget)
generateAndSaveMemory(savedSession.id, memoryContext).catch(() => {
  // Silent fail — session ist schon gespeichert
});
```

### API Endpoint

```typescript
// POST /api/coach/memory
// Counts toward 300/month AI quota

// Request:
interface MemoryRequest {
  session: {
    duration: number;           // seconds
    task?: string;
    projectName?: string;
    completedAt: string;
    overflowDuration?: number;
    estimatedDuration?: number;
  };
  context: {
    todayCount: number;
    weekCount: number;
    longestThisWeekDuration: number;  // seconds
    daysSinceLastSession: number;
    consecutiveSameProject: number;
    lifetimeCount: number;
    sessionStartHour: number;
    isNewDailyRecord: boolean;
    detectedPatterns: { type: string; description: string }[];
  };
}

// Response:
interface MemoryResponse {
  memory: string;  // max 80 chars
}
```

### AI Prompt (fuer Haiku)

```typescript
const MEMORY_SYSTEM_PROMPT = `You generate a single memorable sentence about a focus session.

Rules:
- Maximum 15 words, maximum 80 characters
- Specific, not generic — reference actual data (numbers, times, project names)
- Celebratory but understated — Dieter Rams, not cheerleader
- No emojis, no exclamation marks
- No questions
- No "you should" or advice
- No "Great job!" or motivational fluff
- Use em dash (—) for dramatic pause
- Write in second person ("Your..." not "The user's...")

Good examples:
- "Longest particle this week — 12 minutes of overflow."
- "5 particles today — last achieved January 14th."
- "7:30am Tuesday — like every Tuesday."
- "First particle after 3 days. Welcome back."
- "Planned 25, worked 41. In the zone."

Bad examples:
- "Great job!" (too generic)
- "You worked for 25 minutes." (just restating data)
- "Keep up the good work!" (motivational fluff)
- "What a productive session!" (empty praise)
`;
```

### Local Heuristic Fallback (Free Tier)

```typescript
// src/lib/coach/memory-generator.ts
function generateLocalMemory(
  session: DBSession,
  context: MemoryContext
): string | null {
  // Check triggers in priority order — return first match

  if (context.isNewDailyRecord) {
    return `${context.todayCount} particles today — a new daily record.`;
  }
  if (context.daysSinceLastSession >= 3) {
    return `First particle after ${context.daysSinceLastSession} days.`;
  }
  if (session.duration > context.longestThisWeekDuration) {
    const overflow = session.overflowDuration
      ? ` — ${Math.round(session.overflowDuration / 60)} min overflow.`
      : '.';
    return `Longest particle this week${overflow}`;
  }
  if (context.sessionStartHour < 7) {
    return `${formatTime(session.completedAt)} — ahead of the world.`;
  }
  if (context.sessionStartHour >= 22) {
    return `${formatTime(session.completedAt)} — the quiet hours.`;
  }
  if (context.consecutiveSameProject >= 3 && session.projectName) {
    return `${context.consecutiveSameProject}x ${session.projectName} in a row.`;
  }
  if (session.overflowDuration && session.estimatedDuration &&
      session.overflowDuration >= session.estimatedDuration * 0.5) {
    const planned = Math.round(session.estimatedDuration / 60);
    const actual = Math.round(session.duration / 60);
    return `Planned ${planned}, worked ${actual}. In the zone.`;
  }
  if (context.lifetimeCount % 100 >= 95 || context.lifetimeCount % 50 >= 48) {
    return `Particle #${context.lifetimeCount}. Almost there.`;
  }

  // Nothing noteworthy — return null (no memory)
  return null;
}
```

**Wichtig:** Nicht jede Session braucht ein Memory. ~40-60% der Sessions werden eins bekommen. Das macht die, die eins haben, wertvoller.

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
│  │ Longest particle this week —   ││
│  │ 12 minutes of overflow.        ││  ← Memory (italic, quote-style)
│  └─────────────────────────────────┘│
│                                     │
│  [Aligned] [Reactive]               │
│                                     │
└─────────────────────────────────────┘
```

**Memory Styling:**
- Font: `text-sm italic text-secondary light:text-secondary-dark`
- Background: `bg-tertiary/5 light:bg-tertiary-dark/5`
- Padding: `px-3 py-2`
- Border: `border-l-2 border-tertiary/20 light:border-tertiary-dark/20` (quote-style)
- Border radius: `rounded-r-md`
- Animation: Fade in after 200ms
- Position: Between task info and alignment toggle

### Timeline Tooltip Enhancement

```
┌──────────────────────────────┐
│ 09:14 - 09:52                │
│ Design System · 38 min       │
│                              │
│ Longest particle this week.  │  ← Memory in tooltip (wenn vorhanden)
└──────────────────────────────┘
```

## Testing

### Manual Testing

- [ ] Complete work session as Flow user → memory generated via API, visible in ParticleDetailOverlay
- [ ] Complete work session as Free user → memory generated locally (or null if nothing noteworthy)
- [ ] Complete break session → no memory generated
- [ ] Skip session (S-Taste) → no memory generated
- [ ] API fails → session saved without memory, no error toast
- [ ] Complete 3 sessions quickly → memories queued, all eventually generated
- [ ] Old sessions without memory → no memory section in overlay
- [ ] Memory appears in ParticleDetailOverlay below task info
- [ ] Memory appears in Timeline tooltip
- [ ] Memory with 80 chars → no overflow
- [ ] Light mode + Dark mode: Quote-style block has correct contrast

### Automated Tests

- [ ] Unit tests for `generateLocalMemory()` — all trigger types
- [ ] Test daily record detection
- [ ] Test return-after-break detection
- [ ] Test longest-this-week detection
- [ ] Test null return when nothing noteworthy
- [ ] Test max length enforcement (80 chars)
- [ ] Test context builder produces correct data
- [ ] Integration test for `/api/coach/memory` endpoint

## Definition of Done

- [ ] `memory?: string` field added to `DBSession` in types.ts
- [ ] Dexie schema bumped to v5 (backward compatible)
- [ ] Memory generated on work session COMPLETE (not SKIP, not break)
- [ ] Fire-and-forget pattern — session save not blocked by memory generation
- [ ] Memory displayed in ParticleDetailOverlay (existing single source of truth)
- [ ] Memory shown in Timeline tooltip
- [ ] Local heuristic fallback for Free tier
- [ ] API generation for Flow tier (counts toward 300/month quota)
- [ ] Graceful fallback when API unavailable (silent fail)
- [ ] No breaking changes to existing sessions
- [ ] Typecheck + Lint pass
- [ ] Tested with Flow and Free tier users

## Notes

**Cost consideration:**
- ~$0.001 per memory (Haiku model via existing OpenRouter setup)
- Flow users only — counts toward 300 queries/month
- Each completed work session = 1 query
- At 5 sessions/day = ~150 queries/month for memories alone
- **Empfehlung:** Memory-Generierung teilt sich das Quota mit Coach Chat und Insights. Bei 300/Monat ist das knapp. Alternative: Memories nur lokal generieren (auch fuer Flow) und API nur fuer Chat/Insights reservieren.

**Why immutable?**
Memories should feel like journal entries — written once, preserved forever. Regenerating would destroy the authenticity.

**Warum nicht jede Session ein Memory bekommt:**
Nicht jede Fokus-Session ist bemerkenswert. Die Local-Heuristic returned `null` wenn nichts Besonderes passiert ist. Das ist gewollt — es macht die Memories, die existieren, bedeutungsvoller.

**Future enhancements:**
- Memory search ("Show me all overflow particles")
- Memory export (for personal journaling)
- Memory themes (poetic, professional, minimal)
- Batch-generate memories for old sessions (one-time backfill)
