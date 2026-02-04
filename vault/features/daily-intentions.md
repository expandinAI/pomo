# Daily Intentions — Your Compass for the Day

> "What matters today?"

---

## The 10x Vision

**Feature thinking:** "User can set an intention"

**10x thinking:** "Particle shows you the gap between what you intended and what you actually did — and makes this gap visible, tangible, learnable."

---

## The 10x Core

**Nobody shows you the gap between intention and reality.**

- Journaling apps: "What's your goal?" ✓
- Timer apps: "You worked 4 hours" ✓
- **Particle:** "You wanted X. You did Y. Here's the difference — as a picture."

---

## Two Types of Work

| Type | Symbol | Description |
|------|--------|-------------|
| **Intentional** | ● | Work you planned to do |
| **Reactive** | ○ | Work that "happened" |

```
Your day:    ●  ●  ●  ○  ●

             4 aligned · 1 reactive
```

**No judgment.** A reactive particle isn't "bad". Answering that email was necessary. But you see: That wasn't your intention.

---

## Hierarchy

```
DAILY INTENTION (The Compass)
└── "Finish the presentation"
    │
    ├── PARTICLE 1 · ● "Structure"     ← aligned
    ├── PARTICLE 2 · ● "Graphics"      ← aligned
    ├── PARTICLE 3 · ○ "Email"         ← reactive
    └── PARTICLE 4 · ● "Practice"      ← aligned

    → 75% Alignment
```

---

## User Flow

### 1. Morning Ritual: "The First Breath"

**Trigger:** First app open of the day (or `I`)

**Phase 1: Stillness**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                          ·                                  │  ← Particle, still
│                                                             │
│                                                             │
│                                                             │
│               Before the day begins.                        │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
*2 seconds of stillness. The moment marks the transition.*

**Phase 2: The Question**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ·                                  │  ← Particle pulses softly
│                                                             │
│                                                             │
│              What matters today?                            │
│                                                             │
│         ┌─────────────────────────────────────┐            │
│         │ _                                   │            │  ← Cursor blinks
│         └─────────────────────────────────────┘            │
│                                                             │
│                        ↵                                    │  ← No button. Just Enter.
│                                                             │
│                                                             │
│                  Start without intention                    │  ← Subtle opt-out
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Phase 3: Confirmation**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ·                                  │  ← Particle glows briefly
│                                                             │
│                                                             │
│              Finish the presentation.                       │
│                                                             │
│              Your day has a direction.                      │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
*Fade to Timer after 2 seconds.*

**Design principles:**
- Stillness first. Then the question.
- No button — just Enter. Maximum reduction.
- The particle reacts (glows on commit)
- Opt-out is subtle, not prominent

**Don't annoy:**
- Offer once per day
- If "Start without intention" → don't ask again today
- User can always set/change via `I`

---

### 2. During the Day: Intention Visible

**Below the timer:**
```
                    25:00

          Finish the presentation
```

The intention is always there. Every glance at the timer reminds you: *This is why I'm here.*

**Optional in Settings:** Hide intention (for minimalists)

---

### 3. Aligned vs. Reactive: Visual Language

**Everywhere particles appear:**

| Aligned | Reactive |
|---------|----------|
| ● | ○ |
| Filled circle | Ring/Outline |
| White, glowing | White, transparent |
| "Where you wanted to be" | "Happened, not planned" |

**Session Counter:**
```
        ●●●○●

    4 aligned · 1 reactive
```

**Timeline:**
```
6am         12pm         6pm         12am
├────────────┼────────────┼────────────┤
    ●    ●       ○    ●        ●
```

**Marking flow (when entering task):**
```
┌─────────────────────────────────────────┐
│  What did you work on?                  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Answer emails                     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Your intention: "Finish presentation"  │
│                                         │
│  ┌─────────────┐  ┌─────────────┐      │
│  │ ● Aligned   │  │ ○ Reactive  │      │  ← Default: Reactive if not matching
│  └─────────────┘  └─────────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

**Auto-detection (V2):**
- Project match → probably aligned
- Keyword match → probably aligned
- Otherwise → user decides or default reactive

---

### 4. Evening Reflection: "The Day's Close"

**Trigger:**
- After last particle when > 6pm
- Or when closing the app in the evening
- Or manually

**Phase 1: Your Day**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ·                                  │
│                                                             │
│                                                             │
│                       Your day.                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
*Brief pause. Then the result appears.*

**Phase 2: The Result**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│              "Finish the presentation"                      │
│                                                             │
│                    ●  ●  ●  ○  ●                            │
│                                                             │
│              4 hours. 5 particles.                          │
│              4 of them exactly where you wanted to be.      │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
*The particle row makes it visual. Positive language.*

**Phase 3: The Question**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│              How does this feel?                            │
│                                                             │
│      ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│      │             │ │             │ │             │       │
│      │    Done     │ │   Partial   │ │  Tomorrow   │       │
│      │      ✓      │ │      ◐      │ │      →      │       │
│      └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Status meaning:**
| Status | Symbol | Meaning |
|--------|--------|---------|
| Done | ✓ | Intention fulfilled |
| Partial | ◐ | Progress, but not finished |
| Tomorrow | → | Continues tomorrow |

**"Tomorrow" → Intention appears as suggestion next day**

---

### 5. The Gap Visible: Week Intentions View

**Access:** `G I` or via Coach

```
┌─────────────────────────────────────────────────────────────┐
│  Intentions                                            ✕    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  This Week                                                  │
│  ───────────────────────────────────────────────────────    │
│                                                             │
│  Mon  "Presentation"        ●●●○●           80%            │
│  Tue  "Feedback"            ●○○●            50%            │
│  Wed  —                     ○○○○○           —              │
│  Thu  "Launch"              ●●●●●●          100%           │
│  Fri  "Documentation"       ●●○             67%            │
│                                                             │
│  ───────────────────────────────────────────────────────    │
│                                                             │
│  This week: 73% intentional                                 │
│  Without intention: 0% aligned (Wednesday)                  │
│                                                             │
│  ───────────────────────────────────────────────────────    │
│                                                             │
│  Insight:                                                   │
│  On days with intention, your alignment is 74%.             │
│  On days without: everything reactive.                      │
│  The intention makes the difference.                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**The aha moment:**
> "Wednesday I had no intention — and look: Everything was reactive."

You SEE it. You FEEL it.

---

## Coach Integration

### Prompt Extension

```
CONTEXT FOR TODAY:
- Intention: "Finish the presentation"
- Particles so far: 5 (4 aligned ●, 1 reactive ○)
- Alignment: 80%

INTENTION HISTORY:
- This week: 4 intentions, 3 completed
- Average alignment: 73%
- Most frequent theme: "Presentation" (3 days)

Reference the intention when relevant.
Observe patterns between intention and reality.
```

### Example Insights

**Daily:**
> "You wanted to 'Finish the presentation'. 4 of your 5 particles were exactly there. That one email particle? It happens. 80% alignment is strong."

**Weekly:**
> "This week: 4 intentions set, 3 completed. Your alignment was 73%. Notable: Wednesday without intention — everything was reactive. The intention makes the difference."

**Pattern recognition:**
> "'Write the book' has appeared in your intentions for 3 weeks but often ends as 'Partial'. Maybe too big? Try: 'Write one chapter' instead of 'Write the book'."

---

## Data Model

### Intention

```typescript
interface DailyIntention {
  id: string;
  date: string;                    // "2026-02-04"
  text: string;                    // "Finish the presentation"
  projectId?: string;              // Optional: linked project
  status: 'active' | 'completed' | 'partial' | 'deferred' | 'skipped';
  createdAt: number;
  completedAt?: number;

  // For "Tomorrow" / deferred
  deferredFrom?: string;           // Date of original intention
}
```

### Session Extension

```typescript
interface CompletedSession {
  // ... existing fields ...

  // NEW: Alignment to daily intention
  intentionAlignment: 'aligned' | 'reactive' | 'none';
  // 'none' = no intention set that day
}
```

### Storage

- **IndexedDB:** New `intentions` collection
- **Supabase:** New `intentions` table (for sync)

---

## Visual Language

### Particle Rendering

```css
/* Aligned Particle */
.particle-aligned {
  background: white;
  opacity: 1;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

/* Reactive Particle */
.particle-reactive {
  background: transparent;
  border: 1.5px solid white;
  opacity: 0.7;
}
```

### In Timeline

```
Aligned:    ●  (filled, glows slightly)
Reactive:   ○  (ring, subtler)
```

### In Counter

```
●●●○●  instead of  •••••
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `I` | Set/edit intention |
| `G I` | Intentions view (week overview) |
| `Shift+I` | Clear today's intention |

---

## UI Components

### New Components

```
src/components/intentions/
├── IntentionRitual.tsx        # Morning ritual (3 phases)
├── IntentionDisplay.tsx       # Display below timer
├── IntentionReview.tsx        # Evening reflection (3 phases)
├── IntentionHistory.tsx       # Week view with gap visualization
├── AlignmentIndicator.tsx     # ●●●○● display
├── AlignmentToggle.tsx        # Aligned/Reactive selection
└── index.ts
```

### Extend Existing Components

- `SessionCounter.tsx` — Show ●○ instead of just ●
- `TimelineTrack.tsx` — Aligned/Reactive styling
- `ParticleDetailOverlay.tsx` — Alignment toggle
- `CoachView.tsx` — Show intention in context

---

## Stories (Implementation)

### Phase 1: Core Ritual (MVP)

| Story | Description | Effort |
|-------|-------------|--------|
| POMO-350 | Intention data model & storage | 3 |
| POMO-351 | Morning ritual UI (3 phases) | 8 |
| POMO-352 | Intention display below timer | 2 |
| POMO-353 | Keyboard shortcut `I` | 1 |

**Phase 1 Total: 14 SP**

### Phase 2: Visual Language

| Story | Description | Effort |
|-------|-------------|--------|
| POMO-354 | Aligned/Reactive particle styling | 5 |
| POMO-355 | Alignment toggle in ParticleDetail | 3 |
| POMO-356 | Session counter with ●○ | 2 |
| POMO-357 | Timeline with alignment styling | 3 |

**Phase 2 Total: 13 SP**

### Phase 3: Reflection & Gap

| Story | Description | Effort |
|-------|-------------|--------|
| POMO-358 | Evening reflection UI (3 phases) | 8 |
| POMO-359 | Intention status (completed/partial/deferred) | 2 |
| POMO-360 | Week intentions view with gap | 8 |
| POMO-361 | "Tomorrow" → Intention suggestion | 3 |

**Phase 3 Total: 21 SP**

### Phase 4: Intelligence

| Story | Description | Effort |
|-------|-------------|--------|
| POMO-362 | Coach prompt integration | 3 |
| POMO-363 | Auto-alignment detection (project match) | 5 |
| POMO-364 | Alignment statistics for Coach | 5 |
| POMO-365 | Supabase sync for intentions | 3 |

**Phase 4 Total: 16 SP**

---

## Total Effort

| Phase | SP | Focus |
|-------|----|----|
| Phase 1 | 14 | Core Ritual |
| Phase 2 | 13 | Visual Language |
| Phase 3 | 21 | Reflection & Gap |
| Phase 4 | 16 | Intelligence |
| **Total** | **64 SP** | |

*At ~5 SP/week: ~13 weeks*

---

## 10x Checklist

- ✅ **Morning ritual** — Stillness → Question → Confirmation (not a form)
- ✅ **Visual language** — ● aligned vs ○ reactive (everywhere)
- ✅ **Evening reflection** — Show result, then question (not a checkbox)
- ✅ **Gap visible** — Week view shows intention vs. reality
- ✅ **Aha moment** — "Without intention = everything reactive"
- ✅ **Coach integration** — References intention & alignment

---

## Particle Philosophy Check

- ✅ **Reduced enough?** — One sentence. Enter. Done.
- ✅ **About particles?** — Yes, ● vs ○ is the core language
- ✅ **Pride over guilt?** — "4 of them exactly where you wanted to be"
- ✅ **Keyboard-first?** — `I` for everything
- ✅ **Emotional depth?** — Morning = ritual, Evening = reflection

---

## The Difference

**Before:** "I did 5 particles."

**After:** "I wanted to finish the presentation. 4 of 5 particles were exactly there. That feels right."

---

*Particle — Where intention becomes visible.*
