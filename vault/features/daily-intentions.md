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

## Unified Concept: Intention = What + How Much

**Daily Goal and Daily Intention are merged into one concept.**

An Intention consists of:
1. **Text** — What matters today? ("Ship the login feature")
2. **Particle Count** — How many particles for this? (1-9)

One moment. One view. One decision.

---

## Two Types of Particles

| Type | Symbol | Color | Description |
|------|--------|-------|-------------|
| **Aligned** | ● | White | Work that contributed to your intention |
| **Reactive** | ● | Gray | Work that happened, but wasn't planned |

```
Your day:    ●  ●  ●  ●  ●
             ↑  ↑  ↑  ↑  ↑
          white white gray white white

             4 aligned · 1 reactive
```

**Why gray instead of outline?**
- Still reads as a "particle" (filled shape)
- Less prominent than white (aligned)
- Consistent with Particle's monochrome design
- No confusion with "empty/pending" dots

**No judgment.** A reactive particle isn't "bad". Answering that email was necessary. But you see: That wasn't your intention.

---

## Hierarchy

```
DAILY INTENTION (The Compass)
└── "Finish the presentation" · 4 particles
    │
    ├── PARTICLE 1 · ● white  "Structure"     ← aligned
    ├── PARTICLE 2 · ● white  "Graphics"      ← aligned
    ├── PARTICLE 3 · ● gray   "Email"         ← reactive
    └── PARTICLE 4 · ● white  "Practice"      ← aligned

    → 75% Alignment
```

**Important:** Alignment is at the **Particle level**, not Task level. A particle may contain multiple tasks, but the entire particle is either aligned or reactive.

---

## User Flow

### 1. Setting the Intention: `G I`

**Trigger:** `G I` shortcut, click on session dots, or click on intention text

**Unified IntentionOverlay:**
```
┌─────────────────────────────────────────┐
│                                         │
│     What's your focus for today?        │
│                                         │
│     ┌─────────────────────────────┐     │
│     │ Ship the login feature      │     │
│     └─────────────────────────────┘     │
│                                         │
│     ○ ○ ○ ○ ○ ○ ○ ○ ○                   │
│       1 2 3 4 5 6 7 8 9                 │
│                                         │
│           [4 particles]                 │
│                                         │
│         ┌──────────────┐                │
│         │ Set Intention│ ↵              │
│         └──────────────┘                │
│                                         │
│           No intention                  │
│                                         │
└─────────────────────────────────────────┘
```

**Design principles:**
- Text input at top (what)
- Particle selector below (how much)
- Keyboard-first: Type text → Arrow keys for count → Enter
- Existing `DailyGoalOverlay` component extended/replaced

**Keyboard shortcuts in overlay:**
- `1-9` — Set particle count directly
- `0` — Clear intention
- `↑/↓` or `←/→` — Adjust particle count
- `Enter` — Save intention
- `Escape` — Cancel

---

### 2. During the Day: Intention Visible

**Below the timer:**
```
                    25:00

          Ship the login feature
               ●●●○ (3/4)
```

The intention is always there. Every glance at the timer reminds you: *This is why I'm here.*

**Session Counter shows progress:**
- Filled dots = completed particles
- Empty dots = remaining goal
- Color indicates alignment (white = aligned, gray = reactive)

---

### 3. At Particle Completion: Alignment Choice

When a particle ends, the user marks whether it was aligned:

**In ParticleDetailOverlay:**
```
┌─────────────────────────────────────────┐
│  What did you work on?                  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Answer emails                     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Today's intention: "Ship login feature"│
│                                         │
│  ┌─────────────┐  ┌─────────────┐      │
│  │ ● Aligned   │  │ ● Reactive  │      │
│  └─────────────┘  └─────────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

**Auto-detection (V2):**
- Project match → suggest aligned
- Keyword match → suggest aligned
- Otherwise → user decides

---

### 4. Visual Language: Aligned vs. Reactive

**Everywhere particles appear:**

| Location | Aligned | Reactive |
|----------|---------|----------|
| Session Counter | ● white | ● gray (#525252) |
| Timeline | ● white dot | ● gray dot |
| History | White row | Gray row |

**Session Counter:**
```
        ●●●●●      (all aligned)
        ●●●●●      (3 aligned, 2 reactive - grays visible)
```

**Timeline:**
```
6am         12pm         6pm         12am
├────────────┼────────────┼────────────┤
    ●    ●       ●    ●        ●
   white white  gray white    white
```

---

### 5. Evening Reflection: "The Day's Close"

**Trigger:**
- After last particle when > 6pm
- Or when closing the app in the evening
- Or via `G I` when intention exists

**Phase 1: Your Day**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              "Ship the login feature"                       │
│                                                             │
│                    ●  ●  ●  ●  ●                            │
│                                                             │
│              4 hours. 5 particles.                          │
│              4 of them exactly where you wanted to be.      │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Phase 2: The Question**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              How does this feel?                            │
│                                                             │
│      ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│      │    Done     │ │   Partial   │ │  Tomorrow   │       │
│      │      ✓      │ │      ◐      │ │      →      │       │
│      └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Status meaning:**
| Status | Symbol | Meaning |
|--------|--------|---------|
| Done | ✓ | Intention fulfilled |
| Partial | ◐ | Progress, but not finished |
| Tomorrow | → | Continues tomorrow (deferred) |

---

### 6. The Gap Visible: Week Intentions View

**Access:** Part of Statistics or Coach view

```
┌─────────────────────────────────────────────────────────────┐
│  Intentions                                            ✕    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  This Week                                                  │
│  ───────────────────────────────────────────────────────    │
│                                                             │
│  Mon  "Presentation"        ●●●●●           80%            │
│  Tue  "Feedback"            ●●●●            50%            │
│  Wed  —                     ●●●●●           —              │
│  Thu  "Launch"              ●●●●●●          100%           │
│  Fri  "Documentation"       ●●●             67%            │
│                                                             │
│  ───────────────────────────────────────────────────────    │
│                                                             │
│  This week: 73% intentional                                 │
│  Without intention: 0% aligned (Wednesday)                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Model

### Intention

```typescript
interface DailyIntention {
  id: string;
  date: string;                    // "2026-02-04"
  text: string;                    // "Ship the login feature"
  projectId?: string;              // Optional: linked project
  status: 'active' | 'completed' | 'partial' | 'deferred' | 'skipped';
  createdAt: number;
  completedAt?: number;
  deferredFrom?: string;           // Date of original intention
}
```

### Session Extension

```typescript
interface DBSession {
  // ... existing fields ...

  // Alignment to daily intention (at Particle level, not Task level)
  intentionAlignment?: 'aligned' | 'reactive' | 'none';
  // 'none' = no intention set that day
}
```

### Storage

- **IndexedDB:** `intentions` table (already implemented in POMO-350)
- **Supabase:** New `intentions` table (for sync)

---

## Visual Language

### Particle Rendering

```css
/* Aligned Particle */
.particle-aligned {
  background: white;
  opacity: 1;
}

/* Reactive Particle */
.particle-reactive {
  background: #525252;  /* text-tertiary */
  opacity: 1;
}
```

### In Timeline
```
Aligned:    ● white (filled, bright)
Reactive:   ● gray  (filled, dimmed)
```

### In Counter
```
●●●●●  with some dots gray instead of white
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `G I` | Open Intention overlay (set/edit) |
| `Shift+I` | Clear today's intention |

**Breaking Change:** `G O` (Daily Goal) → `G I` (Intention)

---

## UI Components

### Modified Components

```
src/components/timer/
├── DailyGoalOverlay.tsx  → IntentionOverlay.tsx  # Renamed + extended
├── SessionCounter.tsx    # Show aligned/reactive colors
└── Timer.tsx             # Integrate intention display
```

### New Components

```
src/components/intentions/
├── IntentionDisplay.tsx       # Display below timer
├── IntentionReview.tsx        # Evening reflection
├── AlignmentToggle.tsx        # Aligned/Reactive selection
└── index.ts
```

### Extend Existing Components

- `SessionCounter.tsx` — Show white vs gray particles
- `TimelineTrack.tsx` — Aligned/Reactive styling
- `ParticleDetailOverlay.tsx` — Alignment toggle

---

## Stories (Implementation)

### Phase 1: Core (MVP)

| Story | Description | Effort |
|-------|-------------|--------|
| ~~POMO-350~~ | ~~Intention data model & storage~~ | ~~2~~ ✓ |
| POMO-351 | IntentionOverlay (merge with DailyGoal) | 5 |
| POMO-352 | Intention display below timer | 2 |
| POMO-353 | Keyboard shortcut `G I` + Command Palette | 2 |

**Phase 1 Total: 11 SP**

### Phase 2: Visual Language

| Story | Description | Effort |
|-------|-------------|--------|
| POMO-354 | Aligned/Reactive particle colors | 3 |
| POMO-355 | Alignment toggle in ParticleDetail | 3 |
| POMO-356 | Session counter with colors | 2 |
| POMO-357 | Timeline with alignment styling | 3 |

**Phase 2 Total: 11 SP**

### Phase 3: Reflection & Gap

| Story | Description | Effort |
|-------|-------------|--------|
| POMO-358 | Evening reflection UI | 5 |
| POMO-359 | Intention status (completed/partial/deferred) | 2 |
| POMO-360 | Week intentions view with gap | 8 |
| POMO-361 | "Tomorrow" → Intention suggestion | 3 |

**Phase 3 Total: 18 SP**

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
| Phase 1 | 11 | Core (MVP) |
| Phase 2 | 11 | Visual Language |
| Phase 3 | 18 | Reflection & Gap |
| Phase 4 | 16 | Intelligence |
| **Total** | **56 SP** | |

---

## 10x Checklist

- ✅ **Unified planning** — Intention (what) + Particles (how much) in one view
- ✅ **Visual language** — White = aligned, Gray = reactive
- ✅ **Evening reflection** — Show result, then question
- ✅ **Gap visible** — Week view shows intention vs. reality
- ✅ **Coach integration** — References intention & alignment

---

## Particle Philosophy Check

- ✅ **Reduced enough?** — One overlay, one moment, one decision
- ✅ **About particles?** — Yes, particles are white or gray based on intention
- ✅ **Pride over guilt?** — "4 of them exactly where you wanted to be"
- ✅ **Keyboard-first?** — `G I` for everything
- ✅ **Emotional depth?** — Evening = reflection, not checkbox

---

## Breaking Changes

| Before | After | Migration |
|--------|-------|-----------|
| `G O` (Daily Goal) | `G I` (Intention) | Automatic |
| `DailyGoalOverlay` | `IntentionOverlay` | Rename |
| Separate Goal + Intention | Unified Intention | Merge |

---

## The Difference

**Before:** "I did 5 particles."

**After:** "I wanted to ship the login feature with 4 particles. 4 of 5 particles were exactly there — one was reactive. That feels right."

---

*Particle — Where intention becomes visible.*
