---
type: story
status: done
priority: p1
effort: 5
feature: "[[features/payment-integration]]"
created: 2026-01-31
updated: 2026-01-31
done_date: 2026-02-03
tags: [payment, stripe, webhook]
---

# POMO-312: Payment Webhook Handler

## User Story

> As the **system**,
> I want to **reliably process Stripe events**,
> so that **user tiers are updated automatically**.

## Context

Link: [[features/payment-integration]]

Webhooks are the most reliable way to process payment events. Never rely solely on client redirects—the webhook is the source of truth.

## Acceptance Criteria

- [ ] Webhook endpoint created and registered in Stripe Dashboard
- [ ] Signature verification implemented
- [ ] `checkout.session.completed` → upgrade tier to Flow
- [ ] `customer.subscription.deleted` → downgrade tier to Plus
- [ ] `invoice.payment_failed` → start grace period
- [ ] `invoice.paid` → end grace period
- [ ] Idempotent: same event can arrive multiple times safely

## Technical Details

### Files
```
src/
├── app/api/stripe/
│   └── webhook/route.ts          # NEW
└── lib/
    └── stripe-events.ts          # NEW: Event handlers
```

### Implementation Notes
- Use raw body for signature verification (no JSON parsing before)
- Store Stripe Webhook Secret in ENV
- Update Supabase on successful events
- Optional: Sync tier to Clerk metadata
- Add logging for debugging

### Database Changes
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  subscription_status TEXT DEFAULT 'none',
  subscription_id TEXT,
  stripe_customer_id TEXT,
  grace_period_until TIMESTAMPTZ;
```

### Webhook Events

| Event | Action |
|-------|--------|
| `checkout.session.completed` | tier → 'flow', subscription_status → 'active' |
| `customer.subscription.deleted` | tier → 'plus', subscription_status → 'canceled' |
| `invoice.payment_failed` | grace_period_until → NOW() + 7 days |
| `invoice.paid` | grace_period_until → NULL |
| `customer.subscription.updated` | Process plan change |

## Testing

- [ ] Stripe CLI: `stripe trigger checkout.session.completed`
- [ ] User tier is updated correctly
- [ ] Same event twice → no duplicates
- [ ] Invalid signature → 400 error

## Definition of Done

- [ ] Webhook endpoint implemented
- [ ] All events processed correctly
- [ ] Stripe CLI tests pass
- [ ] Webhook registered in Stripe Dashboard
