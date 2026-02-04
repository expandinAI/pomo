---
type: story
status: backlog
priority: p2
effort: 3
feature: daily-intentions
created: 2026-02-04
updated: 2026-02-04
done_date: null
tags: [intentions, suggestion, ux, continuity]
---

# POMO-361: "Tomorrow" → Intention Suggestion

## User Story

> As a **Particle user who deferred yesterday's intention**,
> I want **today to suggest continuing that intention**,
> so that **I can maintain continuity without re-typing**.

## Context

Link: [[features/daily-intentions]]

**Phase 3: Reflection & Gap** — Continuity reduces friction and maintains focus.

### The Flow

**Evening (yesterday):**
User selects "Tomorrow →" in evening reflection.

**Morning (today):**
When opening Intention overlay:

```
┌─────────────────────────────────────────┐
│                                         │
│     What's your focus for today?        │
│                                         │
│     💡 Continue from yesterday?         │
│     "Ship the login feature"            │
│                                         │
│     ┌─────────────────────────────┐     │
│     │ Ship the login feature      │     │
│     └─────────────────────────────┘     │
│                                         │
│     ○ ○ ○ ● ○ ○ ○ ○ ○                   │
│              [4]                        │
│                                         │
└─────────────────────────────────────────┘
```

## Acceptance Criteria

### Detection

- [ ] Check if yesterday had a `deferred` intention
- [ ] Check if today doesn't have an intention yet
- [ ] Only suggest if both conditions met

### Suggestion UI

- [ ] Show suggestion banner above input
- [ ] Pre-fill input with yesterday's intention text
- [ ] Pre-fill particle count if set
- [ ] User can modify before confirming

### Accept/Dismiss

- [ ] Clicking suggestion fills input
- [ ] User can edit text
- [ ] Dismiss: Clear suggestion, start fresh
- [ ] Accept: Creates today's intention with `deferredFrom` reference

### Data Tracking

- [ ] Store `deferredFrom: "2026-02-03"` on new intention
- [ ] Enables coach insight: "This intention has been deferred X times"

### Keyboard

- [ ] `Tab` or `↓` — Accept suggestion and focus input
- [ ] `Escape` — Dismiss suggestion
- [ ] Typing immediately — Starts fresh, dismisses suggestion

## Technical Details

### Files to Modify

```
src/components/timer/IntentionOverlay.tsx  # Add suggestion UI
src/hooks/useIntention.ts                  # Add suggestion detection
src/lib/intentions/storage.ts              # Query deferred intentions
```

### Hook Extension

```typescript
// In useIntention.ts

interface UseIntentionReturn {
  // ... existing ...
  deferredSuggestion: DailyIntention | null;
  dismissSuggestion: () => void;
}

function useIntention() {
  const [deferredSuggestion, setDeferredSuggestion] = useState<DailyIntention | null>(null);

  useEffect(() => {
    // Check for yesterday's deferred intention
    const yesterday = formatDate(subDays(new Date(), 1));
    const yesterdayIntention = getIntentionByDate(yesterday);

    if (yesterdayIntention?.status === 'deferred' && !todayIntention) {
      setDeferredSuggestion(yesterdayIntention);
    }
  }, [todayIntention]);

  const dismissSuggestion = useCallback(() => {
    setDeferredSuggestion(null);
  }, []);

  return {
    // ...
    deferredSuggestion,
    dismissSuggestion,
  };
}
```

### Suggestion Banner Component

```typescript
// In IntentionOverlay.tsx

function DeferredSuggestion({
  intention,
  onAccept,
  onDismiss,
}: {
  intention: DailyIntention;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 rounded-lg bg-tertiary/10 mb-4"
    >
      <div className="flex items-center gap-2">
        <ArrowRight className="w-4 h-4 text-tertiary" />
        <span className="text-sm text-tertiary">
          Continue: "{intention.text}"
        </span>
      </div>
      <div className="flex gap-2">
        <button onClick={onDismiss} className="text-xs text-tertiary hover:text-secondary">
          Dismiss
        </button>
        <button onClick={onAccept} className="text-xs text-primary hover:underline">
          Use
        </button>
      </div>
    </motion.div>
  );
}
```

### Creating Intention with Reference

```typescript
// When accepting suggestion
await setIntention(
  deferredSuggestion.text,
  deferredSuggestion.projectId,
  deferredSuggestion.particleGoal,
  deferredSuggestion.date  // deferredFrom
);
```

## Testing

- [ ] Suggestion appears when yesterday was deferred
- [ ] Suggestion doesn't appear if today already has intention
- [ ] Accepting pre-fills the form
- [ ] Dismissing clears suggestion
- [ ] `deferredFrom` is stored correctly
- [ ] Typing dismisses suggestion
- [ ] Works across midnight boundary

## Definition of Done

- [ ] Deferred detection logic
- [ ] Suggestion UI component
- [ ] Pre-fill functionality
- [ ] `deferredFrom` tracking
- [ ] Keyboard support
- [ ] Dismiss functionality

## Dependencies

- POMO-350 (Intention data model) ✓ Complete
- POMO-351 (IntentionOverlay) ✓ Complete
- POMO-359 (Intention status) — For deferred status

## Design Notes

**Why suggest, not auto-continue?**

Auto-continuing would feel presumptuous. The user might:
- Want a fresh start
- Have a different priority today
- Have already completed it yesterday but marked deferred by mistake

Suggestion respects user agency while reducing friction.

**Coach insight potential:**

> "You've deferred 'Ship login feature' 3 days in a row. Would you like to break it into smaller steps?"

This requires tracking `deferredFrom` chain.

**Edge case: Weekend**

If Friday is deferred, should Monday suggest? Probably yes — the feature doesn't assume weekends are breaks.
