---
type: story
status: done
priority: p2
effort: 2
feature: "[[features/payment-integration]]"
created: 2026-01-31
updated: 2026-01-31
done_date: 2026-02-03
tags: [payment, stripe, lifetime]
---

# POMO-317: Lifetime Purchase Flow

## User Story

> As a **free user with a promo link**,
> I want to **purchase Lifetime for €99**,
> so that **I pay once and have Flow forever**.

## Context

Link: [[features/payment-integration]]

Lifetime is only available through special promo links, not publicly on the website. This creates urgency and rewards early supporters.

## Acceptance Criteria

- [ ] Promo link leads to Lifetime checkout
- [ ] Stripe Checkout with one-time payment (not subscription)
- [ ] After purchase: `is_lifetime: true` on user
- [ ] Lifetime users have Flow features forever
- [ ] No expiration date, no renewal
- [ ] Webhook correctly processes one-time payment

## Technical Details

### URL Structure
```
/upgrade/lifetime?promo=EARLY2026
```

### Files
```
src/
├── app/upgrade/lifetime/
│   └── page.tsx                  # NEW: Lifetime landing
└── app/api/stripe/
    └── create-checkout/route.ts  # Extend for one-time
```

### Implementation Notes
- Stripe Checkout with `mode: 'payment'` instead of `subscription`
- Validate promo code (optional, for tracking)
- Set `is_lifetime: true` instead of `subscription_id`
- No grace period needed

### Database
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  is_lifetime BOOLEAN DEFAULT FALSE;
```

## UI/UX

Lifetime landing page:
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                    Lifetime Access                               │
│                                                                   │
│                       €99                                        │
│                    one-time                                      │
│                                                                   │
│  Pay once and get forever access to:                            │
│                                                                   │
│  ✓ AI Coach (300 insights/month)                                │
│  ✓ Year View                                                     │
│  ✓ All future features                                          │
│                                                                   │
│              [Get Lifetime Access]                               │
│                                                                   │
│         This offer is available for a limited time              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

The page feels exclusive, not salesy. Simple. Clear. Calm.

## Definition of Done

- [ ] Lifetime product created in Stripe
- [ ] Landing page implemented
- [ ] One-time checkout works
- [ ] Webhook processes Lifetime correctly
- [ ] is_lifetime flag set after purchase
