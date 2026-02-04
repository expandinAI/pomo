---
type: story
status: backlog
priority: p1
effort: 2
feature: daily-intentions
created: 2026-02-04
updated: 2026-02-04
done_date: null
tags: [intentions, ui, timer, display]
---

# POMO-352: Intention Display Below Timer

## User Story

> As a **Particle user with an intention set**,
> I want **to see my intention below the timer**,
> so that **every glance reminds me why I'm here**.

## Context

Link: [[features/daily-intentions]]

The intention is always visible during focus. Not prominent, but present. A constant, subtle reminder of direction.

## Acceptance Criteria

### Display

- [ ] Intention text shown below timer when set
- [ ] Position: Centered, below timer display, above controls
- [ ] Style: Subtle, secondary text color
- [ ] Truncate long intentions with ellipsis (max ~40 chars visible)
- [ ] Full text shown on hover (tooltip)

### Visibility

- [ ] Shows when: Intention is set for today
- [ ] Hides when: No intention set
- [ ] Hides when: User disabled in settings (future)

### Interaction

- [ ] Click on intention → Opens edit modal (or triggers `I` shortcut behavior)
- [ ] Hover → Shows full text if truncated

### Animation

- [ ] Fade in when intention is set
- [ ] Fade out when intention is cleared
- [ ] Respect reduced motion

## Technical Details

### Files to Create/Modify

```
src/components/intentions/
├── IntentionDisplay.tsx       # NEW: Display component
└── index.ts                   # Update exports

src/components/timer/
└── Timer.tsx                  # Integrate IntentionDisplay
```

### Component

```typescript
// IntentionDisplay.tsx

interface IntentionDisplayProps {
  intention: string | null;
  onClick?: () => void;
}

export function IntentionDisplay({ intention, onClick }: IntentionDisplayProps) {
  if (!intention) return null;

  const truncated = intention.length > 40
    ? intention.slice(0, 40) + '...'
    : intention;

  return (
    <motion.button
      onClick={onClick}
      className="text-sm text-secondary light:text-secondary-dark text-center max-w-xs mx-auto truncate"
      title={intention}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {truncated}
    </motion.button>
  );
}
```

### Integration in Timer

```typescript
// In Timer.tsx, below TimerDisplay

const { todayIntention } = useIntention();

// In render, after timer display:
<AnimatePresence>
  {todayIntention && (
    <IntentionDisplay
      intention={todayIntention.text}
      onClick={() => {
        // Open intention edit (could dispatch event or use callback)
        window.dispatchEvent(new CustomEvent('particle:edit-intention'));
      }}
    />
  )}
</AnimatePresence>
```

## UI Mockup

### With Intention
```
                    25:00

          Finish the presentation

     [ Start ]  [ Settings ]  [ ... ]
```

### Without Intention
```
                    25:00

     [ Start ]  [ Settings ]  [ ... ]
```

### Long Intention (Truncated)
```
                    25:00

     Complete the quarterly report and...
                    ↑
              (hover for full text)
```

## Styling

```css
/* Intention display styling */
.intention-display {
  font-size: 0.875rem;           /* text-sm */
  color: var(--color-secondary);
  text-align: center;
  max-width: 20rem;              /* max-w-xs */
  margin: 0.5rem auto;
  cursor: pointer;
  transition: color 0.15s;
}

.intention-display:hover {
  color: var(--color-primary);
}
```

## Testing

- [ ] Shows intention when set
- [ ] Hides when no intention
- [ ] Truncates long text correctly
- [ ] Tooltip shows full text on hover
- [ ] Click triggers edit action
- [ ] Animation works (fade in/out)
- [ ] Reduced motion respected
- [ ] Mobile: Tap works, no hover state issues

## Definition of Done

- [ ] IntentionDisplay component created
- [ ] Integrated below timer in Timer.tsx
- [ ] Truncation and tooltip working
- [ ] Click handler connected
- [ ] Animations smooth
- [ ] Mobile responsive

## Dependencies

- POMO-350 (Intention data model) must be complete
