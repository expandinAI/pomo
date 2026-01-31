---
type: story
status: backlog
priority: p1
effort: 2
feature: "[[features/gdpr-data-privacy]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [gdpr, privacy, cron, deletion]
---

# POMO-329: Deletion Cron Job

## User Story

> As the **system**,
> I want to **automatically delete expired accounts**,
> so that **the 30-day cooling-off period is enforced**.

## Context

Link: [[features/gdpr-data-privacy]]

After 30 days, accounts must be permanently deleted. Cron job runs daily.

## Acceptance Criteria

- [ ] Cron job runs daily (e.g., 3:00 UTC)
- [ ] Finds all users where `deletion_scheduled_for < NOW()`
- [ ] Permanently deletes all associated data
- [ ] Cancels Stripe subscription
- [ ] Deletes Clerk user
- [ ] Deletes user record last
- [ ] Logging for audit trail
- [ ] Error handling (one error doesn't stop all)

## Technical Details

### Cron Endpoint

```typescript
// POST /api/cron/cleanup-deleted
// Auth: Cron secret (Vercel Cron or similar)

async function cleanupDeletedAccounts(): Promise<{
  processed: number;
  deleted: number;
  errors: string[];
}> {
  const usersToDelete = await supabase
    .from('users')
    .select('*')
    .lt('deletion_scheduled_for', new Date().toISOString())
    .not('deletion_scheduled_for', 'is', null);

  for (const user of usersToDelete.data) {
    try {
      await permanentlyDeleteUser(user.id);
    } catch (error) {
      // Log error, continue with next user
    }
  }
}
```

### Deletion Order (important!)

```typescript
async function permanentlyDeleteUser(userId: string): Promise<void> {
  // 1. Coach data (depends on user)
  await supabase.from('coach_insights').delete().eq('user_id', userId);
  await supabase.from('coach_messages').delete().eq('user_id', userId);

  // 2. Sessions (depends on user)
  await supabase.from('sessions').delete().eq('user_id', userId);

  // 3. Projects (depends on user)
  await supabase.from('projects').delete().eq('user_id', userId);

  // 4. Settings (depends on user)
  await supabase.from('user_settings').delete().eq('user_id', userId);

  // 5. Privacy events (audit log)
  await supabase.from('privacy_events').delete().eq('user_id', userId);

  // 6. Cancel Stripe subscription
  const user = await supabase.from('users').select('*').eq('id', userId).single();
  if (user.data?.subscription_id) {
    await stripe.subscriptions.cancel(user.data.subscription_id);
  }

  // 7. Delete Clerk user
  await clerk.users.deleteUser(userId);

  // 8. Delete user record (LAST - due to foreign keys)
  await supabase.from('users').delete().eq('id', userId);

  // 9. Log for audit
  console.log(`[GDPR] Permanently deleted user ${userId}`);
}
```

### Files

```
src/
├── app/api/cron/
│   └── cleanup-deleted/route.ts  # NEW
└── lib/
    └── privacy/
        └── delete-user.ts        # NEW
```

### Vercel Cron Config

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-deleted",
      "schedule": "0 3 * * *"
    }
  ]
}
```

## Testing

### Manual Testing

- [ ] Cron endpoint reachable
- [ ] Test user is correctly deleted
- [ ] All tables are cleaned up
- [ ] Stripe subscription is cancelled
- [ ] Clerk user is deleted
- [ ] Error in one user doesn't stop all

## Definition of Done

- [ ] Cron endpoint implemented
- [ ] Delete function with correct order
- [ ] Vercel Cron configured
- [ ] Logging implemented
- [ ] Error handling tested
