---
type: story
status: done
priority: p1
effort: 3
feature: "[[features/ai-coach]]"
created: 2026-01-31
updated: 2026-02-02
done_date: 2026-02-02
tags: [ai, coach, limits]
---

# POMO-315: AI Query Counter & Limits

## User Story

> As a **Flow user**,
> I want to **see how many AI queries I have left**,
> so that **I can keep track of my monthly limit**.

## Context

Link: [[features/payment-integration]]

Flow users get 300 AI queries per month. The counter must be tracked and displayed. This protects margins while being generous.

## Acceptance Criteria

- [ ] Each AI query increments the counter
- [ ] Counter resets monthly
- [ ] UI shows current usage (e.g., "247/300")
- [ ] At 90% limit: show warning
- [ ] At 100% limit: friendly message, no more queries allowed
- [ ] Proactive Coach insights also count toward limit

## Technical Details

### Database
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  ai_queries_used INTEGER DEFAULT 0,
  ai_queries_reset_at TIMESTAMPTZ DEFAULT NOW();

-- Monthly reset via cron or on first query of new month
```

### Files
```
src/
├── lib/
│   └── ai-quota.ts               # NEW: Quota management
├── app/api/coach/
│   └── chat/route.ts             # Check quota before query
└── components/
    └── coach/
        └── QuotaIndicator.tsx    # NEW: Usage display
```

### Implementation Notes
- Check before every AI query: `canUseAI(userId)`
- Increment after successful query
- Reset logic: if `ai_queries_reset_at` < start of current month → reset
- Edge case: exactly on the 1st of month

### Quota Logic
```typescript
async function checkAndIncrementQuota(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}> {
  // 1. Reset if new month
  // 2. Check if under limit (300)
  // 3. Increment if allowed
  // 4. Return status
}
```

## UI/UX

In Coach view:
```
┌──────────────────────────────────────┐
│  Coach                    247/300    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░     │
│  Resets in 12 days                   │
└──────────────────────────────────────┘
```

When limit reached:
```
┌──────────────────────────────────────┐
│  You've reached your limit for this  │
│  month. Your quota resets on         │
│  March 1st.                          │
│                                       │
│  You can still view your existing    │
│  insights and chat history.          │
└──────────────────────────────────────┘
```

## Definition of Done

- [ ] Counter in database implemented
- [ ] Quota check on AI queries
- [ ] UI display in Coach
- [ ] Limit-reached UI
- [ ] Monthly reset works
