---
type: story
status: backlog
priority: p1
effort: 3
feature: daily-intentions
created: 2026-02-04
updated: 2026-02-04
done_date: null
tags: [intentions, data-model, storage, foundation]
---

# POMO-350: Intention Data Model & Storage

## User Story

> As a **Particle user**,
> I want **my daily intentions to be stored persistently**,
> so that **they survive page refreshes and sync across devices**.

## Context

Link: [[features/daily-intentions]]

This is the foundation story for Daily Intentions. No UI yet — just the data layer that everything else builds on.

## Acceptance Criteria

### Data Model

- [ ] `DailyIntention` interface defined in TypeScript
- [ ] Fields: `id`, `date`, `text`, `projectId?`, `status`, `createdAt`, `completedAt?`, `deferredFrom?`
- [ ] Status enum: `active`, `completed`, `partial`, `deferred`, `skipped`

### IndexedDB Storage

- [ ] New `intentions` collection in Dexie schema
- [ ] CRUD operations: `createIntention`, `getIntention`, `updateIntention`, `deleteIntention`
- [ ] Query: `getIntentionForDate(date: string)`
- [ ] Query: `getIntentionsForWeek(startDate: string)`

### Session Extension

- [ ] Add `intentionAlignment` field to `CompletedSession` interface
- [ ] Values: `'aligned' | 'reactive' | 'none'`
- [ ] Default: `'none'` for backwards compatibility
- [ ] Migration: Existing sessions get `'none'`

### Hook

- [ ] `useIntention()` hook providing:
  - `todayIntention: DailyIntention | null`
  - `setIntention(text: string): Promise<void>`
  - `updateIntentionStatus(status: Status): Promise<void>`
  - `clearIntention(): Promise<void>`
  - `isLoading: boolean`

## Technical Details

### Files to Create

```
src/
├── lib/
│   └── intentions/
│       ├── types.ts           # DailyIntention interface
│       ├── storage.ts         # IndexedDB operations
│       └── index.ts           # Exports
├── hooks/
│   └── useIntention.ts        # React hook
└── db/
    └── schema.ts              # Update Dexie schema (add intentions)
```

### Data Model

```typescript
// src/lib/intentions/types.ts

export type IntentionStatus =
  | 'active'
  | 'completed'
  | 'partial'
  | 'deferred'
  | 'skipped';

export interface DailyIntention {
  id: string;
  date: string;                    // "2026-02-04" (ISO date)
  text: string;                    // "Finish the presentation"
  projectId?: string;              // Optional: linked project
  status: IntentionStatus;
  createdAt: number;               // Unix timestamp
  completedAt?: number;            // When marked as completed/partial
  deferredFrom?: string;           // If deferred from another day
}
```

### Session Extension

```typescript
// Update CompletedSession interface

export type IntentionAlignment = 'aligned' | 'reactive' | 'none';

export interface CompletedSession {
  // ... existing fields ...

  intentionAlignment: IntentionAlignment;  // NEW
}
```

### Hook Usage

```typescript
// Example usage in components
const {
  todayIntention,
  setIntention,
  updateIntentionStatus,
  isLoading
} = useIntention();

// Set today's intention
await setIntention("Finish the presentation");

// Mark as completed
await updateIntentionStatus('completed');
```

## Migration

- [ ] Existing sessions get `intentionAlignment: 'none'`
- [ ] No breaking changes to existing data
- [ ] Schema version bump in Dexie

## Testing

- [ ] Unit tests for storage operations
- [ ] Unit tests for useIntention hook
- [ ] Test: Create intention, reload, intention persists
- [ ] Test: Get intentions for week returns correct data
- [ ] Test: Session alignment field works

## Definition of Done

- [ ] TypeScript interfaces defined
- [ ] IndexedDB schema updated
- [ ] CRUD operations working
- [ ] useIntention hook implemented
- [ ] Session model extended
- [ ] Unit tests passing
- [ ] No console errors

## Out of Scope

- Supabase sync (Phase 4: POMO-365)
- UI components (POMO-351, 352)
- Keyboard shortcuts (POMO-353)
