---
type: story
status: backlog
priority: p1
effort: 5
feature: "[[features/gdpr-data-privacy]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [gdpr, privacy, deletion]
---

# POMO-328: Account Deletion Flow

## User Story

> As a **user**,
> I want to **delete my account**,
> so that **I can exercise my GDPR right to erasure**.

## Context

Link: [[features/gdpr-data-privacy]]

GDPR Article 17: Right to erasure ("right to be forgotten").
30-day cooling-off period protects against accidental deletion.

## Acceptance Criteria

- [ ] "Delete account" button in Privacy Settings
- [ ] Confirmation modal with "DELETE" text input
- [ ] "Export data first" option in modal
- [ ] After confirmation: account is DEACTIVATED (not deleted yet)
- [ ] Confirmation email with cancellation link
- [ ] 30-day cooling-off period
- [ ] User can cancel deletion via email link
- [ ] Login disabled during cooling-off period
- [ ] After 30 days: automatic permanent deletion

## Technical Details

### API Endpoints

```typescript
// POST /api/privacy/delete
// Starts 30-day countdown
interface DeleteResponse {
  scheduledFor: string; // ISO date
  cancellationToken: string;
}

// POST /api/privacy/cancel-deletion
// Cancels deletion
interface CancelRequest {
  token: string;
}
```

### Database

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  deletion_requested_at TIMESTAMPTZ,
  deletion_scheduled_for TIMESTAMPTZ,
  deletion_cancellation_token TEXT;
```

### Files

```
src/
├── app/api/privacy/
│   ├── delete/route.ts           # NEW
│   └── cancel-deletion/route.ts  # NEW
├── components/
│   └── settings/
│       └── DeleteAccountModal.tsx # NEW
└── lib/
    └── email/
        └── templates/
            └── deletion-scheduled.tsx # NEW
```

### Implementation Notes

- Invalidate Clerk session after deletion request
- Send email with cancellation token
- Token valid for 30 days
- On login attempt: show "Account scheduled for deletion" message

## UI/UX

### Modal: Request Deletion

```
┌─────────────────────────────────────────────────┐
│                                           [×]   │
│                                                 │
│         Delete Account                          │
│                                                 │
│   ⚠️ This action cannot be undone.             │
│                                                 │
│   The following will be deleted:                │
│   • 127 Particles                               │
│   • 12 Projects                                 │
│   • Your settings                               │
│   • Coach history                               │
│   • Your Flow subscription (if any)             │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │  Export my data first                   │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   To continue, type "DELETE":                   │
│   ┌─────────────────────────────────────────┐   │
│   │                                         │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   [Cancel]    [Delete Account]                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Modal: Confirmation

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         ✓ Deletion Scheduled                    │
│                                                 │
│   Your account will be deleted on               │
│   March 2, 2026.                                │
│                                                 │
│   We've sent you an email where you can         │
│   cancel the deletion if you change your mind.  │
│                                                 │
│   [Got it]                                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Testing

### Manual Testing

- [ ] Deletion request works
- [ ] Email is sent
- [ ] Cancellation link works
- [ ] Login blocked after deletion request
- [ ] Account not deleted immediately

## Definition of Done

- [ ] Delete endpoint implemented
- [ ] Cancel endpoint implemented
- [ ] Modal UI implemented
- [ ] Email template created
- [ ] Login block during cooling-off
- [ ] Database fields added
