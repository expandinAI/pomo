---
type: story
status: backlog
priority: p1
effort: 8
feature: daily-intentions
created: 2026-02-04
updated: 2026-02-04
done_date: null
tags: [intentions, ui, ritual, onboarding, animation]
---

# POMO-351: Morning Ritual UI (3 Phases)

## User Story

> As a **Particle user starting my day**,
> I want **a calm, intentional moment to set my focus**,
> so that **my day has a direction before I begin working**.

## Context

Link: [[features/daily-intentions]]

This is the core ritual — not a form, but a moment. Three phases: Stillness → Question → Confirmation.

## Acceptance Criteria

### Trigger

- [ ] Shows on first app open of the day (if no intention set)
- [ ] Does NOT show if intention already set today
- [ ] Does NOT show if user dismissed today ("Start without intention")
- [ ] Can be manually triggered via `I` shortcut (POMO-353)

### Phase 1: Stillness (2 seconds)

- [ ] Full-screen overlay, dark background
- [ ] Single particle (dot) in center, still
- [ ] Text appears: "Before the day begins."
- [ ] No interaction possible — just presence
- [ ] After 2 seconds, automatically transitions to Phase 2

### Phase 2: The Question

- [ ] Particle starts pulsing softly
- [ ] Text changes to: "What matters today?"
- [ ] Single text input appears below
- [ ] Cursor auto-focused, blinking
- [ ] Placeholder rotates (optional):
  - "Finish the presentation..."
  - "Deep work on the project..."
  - "Clear my inbox..."
- [ ] Submit: Press `Enter` (no button)
- [ ] Opt-out: "Start without intention" link (subtle, bottom)
- [ ] `Escape` = same as opt-out

### Phase 3: Confirmation (2 seconds)

- [ ] Particle glows briefly (subtle pulse)
- [ ] User's intention displayed as quote
- [ ] Text below: "Your day has a direction."
- [ ] After 2 seconds, fade out to timer

### Animation

- [ ] Smooth transitions between phases
- [ ] Respect `prefers-reduced-motion`
- [ ] Particle animations match existing Particle design language
- [ ] Fade-in/fade-out for text (not instant)

### Persistence

- [ ] On submit: Create intention via `useIntention().setIntention()`
- [ ] On opt-out: Set flag `intentionDismissedToday` in localStorage
- [ ] Flag resets at midnight (or on new day detection)

## Technical Details

### Files to Create

```
src/components/intentions/
├── IntentionRitual.tsx        # Main component (3 phases)
├── IntentionRitualPhase1.tsx  # Stillness
├── IntentionRitualPhase2.tsx  # Question + input
├── IntentionRitualPhase3.tsx  # Confirmation
└── index.ts
```

### Component Structure

```typescript
// IntentionRitual.tsx

interface IntentionRitualProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

type Phase = 'stillness' | 'question' | 'confirmation';

export function IntentionRitual({ isOpen, onComplete, onSkip }: IntentionRitualProps) {
  const [phase, setPhase] = useState<Phase>('stillness');
  const [intentionText, setIntentionText] = useState('');
  const { setIntention } = useIntention();

  // Phase 1 → Phase 2 after 2 seconds
  useEffect(() => {
    if (phase === 'stillness') {
      const timer = setTimeout(() => setPhase('question'), 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Handle submit
  const handleSubmit = async () => {
    if (!intentionText.trim()) return;
    await setIntention(intentionText.trim());
    setPhase('confirmation');
  };

  // Phase 3 → complete after 2 seconds
  useEffect(() => {
    if (phase === 'confirmation') {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  // ... render phases
}
```

### Integration in page.tsx

```typescript
// In page.tsx

const [showIntentionRitual, setShowIntentionRitual] = useState(false);
const { todayIntention } = useIntention();

// Check on mount: Should we show the ritual?
useEffect(() => {
  const dismissed = localStorage.getItem('particle:intention-dismissed-today');
  const dismissedDate = dismissed ? JSON.parse(dismissed).date : null;
  const today = new Date().toISOString().split('T')[0];

  if (!todayIntention && dismissedDate !== today) {
    setShowIntentionRitual(true);
  }
}, [todayIntention]);

// Render
<AnimatePresence>
  {showIntentionRitual && (
    <IntentionRitual
      isOpen={showIntentionRitual}
      onComplete={() => setShowIntentionRitual(false)}
      onSkip={() => {
        localStorage.setItem('particle:intention-dismissed-today',
          JSON.stringify({ date: new Date().toISOString().split('T')[0] })
        );
        setShowIntentionRitual(false);
      }}
    />
  )}
</AnimatePresence>
```

## UI Mockups

### Phase 1: Stillness
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                          ·                                  │
│                                                             │
│                                                             │
│                                                             │
│               Before the day begins.                        │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Phase 2: Question
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ·                                  │
│                                                             │
│              What matters today?                            │
│                                                             │
│         ┌─────────────────────────────────────┐            │
│         │ _                                   │            │
│         └─────────────────────────────────────┘            │
│                                                             │
│                        ↵                                    │
│                                                             │
│                  Start without intention                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Phase 3: Confirmation
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ·                                  │
│                                                             │
│              Finish the presentation.                       │
│                                                             │
│              Your day has a direction.                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Styling

- Background: `bg-background` (full black)
- Text: `text-primary` for intention, `text-secondary` for labels
- Input: Minimal border, large text, center-aligned
- Particle: Reuse existing particle animation styles
- Font: Same as timer display (large, light)

## Testing

- [ ] Ritual shows on first visit of day
- [ ] Ritual does NOT show if intention exists
- [ ] Ritual does NOT show if dismissed today
- [ ] Enter submits and goes to Phase 3
- [ ] Escape/opt-out dismisses and doesn't show again today
- [ ] Intention is saved to storage
- [ ] Animations respect reduced motion
- [ ] Works on mobile (touch)

## Definition of Done

- [ ] 3-phase ritual implemented
- [ ] Smooth animations
- [ ] Keyboard navigation (Enter, Escape)
- [ ] Mobile responsive
- [ ] Reduced motion support
- [ ] Integrated in page.tsx
- [ ] Intention saved on complete

## Dependencies

- POMO-350 (Intention data model) must be complete
