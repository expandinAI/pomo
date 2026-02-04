---
type: story
status: backlog
priority: p1
effort: 2
feature: daily-intentions
created: 2026-02-04
updated: 2026-02-04
done_date: null
tags: [intentions, status, data-model, persistence]
---

# POMO-359: Intention Status (completed/partial/deferred)

## User Story

> As a **Particle user tracking my intentions over time**,
> I want **my daily intention to have a status**,
> so that **I can see patterns in completion vs deferral**.

## Context

Link: [[features/daily-intentions]]

**Phase 3: Reflection & Gap** — Status enables the week view and coach insights.

### Status Flow

```
active → [user completes day]
        ├── completed (done)
        ├── partial (progress but not finished)
        ├── deferred (tomorrow)
        └── skipped (no reflection / day ended)
```

## Acceptance Criteria

### Data Model

- [ ] `status` field on DailyIntention
- [ ] Values: `'active' | 'completed' | 'partial' | 'deferred' | 'skipped'`
- [ ] Default: `'active'`
- [ ] `completedAt` timestamp when status changes

### Status Transitions

| From | To | Trigger |
|------|-----|---------|
| active | completed | User selects "Done" in reflection |
| active | partial | User selects "Partial" in reflection |
| active | deferred | User selects "Tomorrow" in reflection |
| active | skipped | Day ends without reflection (auto at midnight) |

### Auto-Transition at Midnight

- [ ] If intention is still `active` at midnight → set to `skipped`
- [ ] Creates historical record for the day
- [ ] Prevents orphaned active intentions

### API / Storage

- [ ] `updateIntentionStatus(id, status)` function
- [ ] `getIntentionsByStatus(status)` for filtering
- [ ] IndexedDB persistence
- [ ] Supabase sync (future)

## Technical Details

### Files to Modify

```
src/lib/intentions/types.ts     # Add status type
src/lib/intentions/storage.ts   # Status update functions
src/hooks/useIntention.ts       # Expose status methods
```

### Type Definition

```typescript
// In types.ts
export type IntentionStatus = 'active' | 'completed' | 'partial' | 'deferred' | 'skipped';

export interface DailyIntention {
  id: string;
  date: string;                    // "2026-02-04"
  text: string;
  projectId?: string;
  status: IntentionStatus;         // NEW
  createdAt: number;
  completedAt?: number;            // NEW - when status changed
  deferredFrom?: string;           // Date if deferred from previous day
}
```

### Storage Functions

```typescript
// In storage.ts

export async function updateIntentionStatus(
  id: string,
  status: IntentionStatus
): Promise<void> {
  const db = await getDB();
  const intention = await db.get('intentions', id);
  if (!intention) return;

  await db.put('intentions', {
    ...intention,
    status,
    completedAt: Date.now(),
  });
}

export async function getIntentionsByStatus(
  status: IntentionStatus
): Promise<DailyIntention[]> {
  const db = await getDB();
  const all = await db.getAll('intentions');
  return all.filter(i => i.status === status);
}
```

### Hook Extension

```typescript
// In useIntention.ts

export function useIntention() {
  // ... existing code ...

  const updateStatus = useCallback(async (status: IntentionStatus) => {
    if (!todayIntention) return;
    await updateIntentionStatus(todayIntention.id, status);
    // Refresh state
    loadTodayIntention();
  }, [todayIntention]);

  return {
    // ... existing returns ...
    updateStatus,
  };
}
```

### Midnight Cleanup (Optional)

```typescript
// Could run on app load or via scheduled worker
async function cleanupStaleIntentions() {
  const db = await getDB();
  const all = await db.getAll('intentions');
  const today = formatDate(new Date());

  for (const intention of all) {
    if (intention.status === 'active' && intention.date < today) {
      await updateIntentionStatus(intention.id, 'skipped');
    }
  }
}
```

## Testing

- [ ] New intention has status `active`
- [ ] `updateStatus('completed')` works
- [ ] `updateStatus('partial')` works
- [ ] `updateStatus('deferred')` works
- [ ] Status persists across page reload
- [ ] `completedAt` timestamp is set
- [ ] `getIntentionsByStatus` filters correctly
- [ ] Stale intentions marked as `skipped`

## Definition of Done

- [ ] Status field added to DailyIntention type
- [ ] Storage functions for status update
- [ ] Hook exposes updateStatus method
- [ ] Midnight cleanup logic (or on-load check)
- [ ] Unit tests for status transitions

## Dependencies

- POMO-350 (Intention data model) ✓ Complete
- POMO-358 (Evening reflection) — Uses status

## Design Notes

**Why "skipped" instead of "failed"?**

"Failed" implies judgment. "Skipped" is neutral — you simply didn't reflect on that day. No shame.

**Deferred intentions:**

When user selects "Tomorrow", we could:
1. Mark today's intention as `deferred`
2. Auto-suggest same text for next day
3. Track `deferredFrom` to show patterns

**Coach insight:**
> "You've deferred 'Ship login feature' 3 times. Would you like to break it into smaller goals?"
