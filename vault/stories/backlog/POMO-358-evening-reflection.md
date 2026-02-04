---
type: story
status: backlog
priority: p1
effort: 5
feature: daily-intentions
created: 2026-02-04
updated: 2026-02-04
done_date: null
tags: [intentions, reflection, evening, emotional-design]
---

# POMO-358: Evening Reflection UI

## User Story

> As a **Particle user ending my workday**,
> I want **a calm moment to reflect on my intention vs reality**,
> so that **I can close my day with awareness, not just numbers**.

## Context

Link: [[features/daily-intentions]]

**Phase 3: Reflection & Gap** — The day's close is where learning happens.

### The 10x Insight

Most tools show: "You did 5 sessions."

Particle shows: "You wanted to ship the login feature with 4 particles. 4 of 5 were exactly there — one was reactive. That feels right."

## Acceptance Criteria

### Trigger Conditions

- [ ] After last particle when time > 6pm (configurable?)
- [ ] When closing app in evening (on blur/close)
- [ ] Via `G I` when intention exists and > 6pm
- [ ] Manual trigger: Command Palette "End of Day"

### Phase 1: Your Day

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              "Ship the login feature"                       │
│                                                             │
│                    ●  ●  ●  ●  ●                            │
│                   (colors show alignment)                   │
│                                                             │
│              4 hours. 5 particles.                          │
│              4 of them exactly where you wanted to be.      │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- [ ] Show intention text prominently
- [ ] Show particles with alignment colors
- [ ] Show summary: "X hours. Y particles. Z aligned."
- [ ] Warm, reflective tone — not judgmental

### Phase 2: The Question

After 3 seconds (or Space to continue):

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

- [ ] Three options: Done, Partial, Tomorrow
- [ ] Keyboard: 1/2/3 or D/P/T
- [ ] Selection updates intention status

### Status Meaning

| Status | Symbol | Meaning | Next Day Action |
|--------|--------|---------|-----------------|
| Done | ✓ | Intention fulfilled | Clear intention |
| Partial | ◐ | Progress, but not finished | Keep as reference |
| Tomorrow | → | Continues tomorrow | Suggest same intention |

### Animation

- [ ] Particles animate in (like milestone celebration, but calmer)
- [ ] Text fades in after particles
- [ ] Cards appear with subtle stagger
- [ ] Selection triggers gentle exit animation

## Technical Details

### Files to Create

```
src/components/intentions/
├── EveningReflection.tsx       # Main component
├── ReflectionPhaseOne.tsx      # "Your Day" phase
├── ReflectionPhaseTwo.tsx      # "How does this feel?" phase
└── index.ts                    # Export
```

### Data Model

```typescript
// Update DailyIntention
interface DailyIntention {
  // ... existing fields ...
  status: 'active' | 'completed' | 'partial' | 'deferred' | 'skipped';
  completedAt?: number;
}
```

### Integration

```typescript
// In page.tsx or Timer.tsx

const { todayIntention, updateIntentionStatus } = useIntention();
const [showReflection, setShowReflection] = useState(false);

// Trigger after particle completion in evening
useEffect(() => {
  if (isEvening && todayIntention && justCompletedParticle) {
    setShowReflection(true);
  }
}, [isEvening, todayIntention, justCompletedParticle]);
```

### Evening Detection

```typescript
function isEvening(): boolean {
  const hour = new Date().getHours();
  return hour >= 18; // After 6pm
}
```

## Testing

- [ ] Reflection shows after evening particle
- [ ] Phase 1 displays correctly with particle colors
- [ ] Phase 2 appears after delay
- [ ] All three status options work
- [ ] Keyboard shortcuts work (D/P/T)
- [ ] Status persists to intention
- [ ] Animation is smooth and calm
- [ ] Can dismiss without selecting (Escape)

## Definition of Done

- [ ] EveningReflection component created
- [ ] Two-phase flow implemented
- [ ] Status update persists
- [ ] Keyboard navigation
- [ ] Respects reduced motion
- [ ] Evening trigger logic
- [ ] Visual design matches mockup

## Dependencies

- POMO-350 (Intention data model) ✓ Complete
- POMO-354 (Particle colors) — For alignment visualization
- POMO-359 (Intention status) — For status persistence

## Design Notes

**"How does this feel?" not "Did you succeed?"**

We don't ask if they completed their goal. We ask how it feels. This:
- Removes judgment
- Encourages honesty
- Acknowledges that "partial" can be a win
- Makes "tomorrow" a valid choice, not failure

**The Particle Philosophy:**
> "Markers, not badges" — Evening reflection is a moment of awareness, not a performance review.

**Future Enhancement:**
- Coach could reference: "You marked 3 days as 'partial' this week. Would you like to adjust your particle goals?"
