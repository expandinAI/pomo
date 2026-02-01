---
type: story
status: backlog
priority: p2
effort: 2
feature: "[[features/payment-integration]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [payment, stripe, billing]
---

# POMO-314: Billing Portal Integration

## User Story

> As a **Flow subscriber**,
> I want to **manage my subscription myself**,
> so that **I can change plans, cancel, or view invoices without contacting support**.

## Context

Link: [[features/payment-integration]]

Stripe Billing Portal = self-service. Reduces support tickets and gives users control.

## Acceptance Criteria

- [ ] "Manage subscription" button in Account section
- [ ] Click opens Stripe Billing Portal
- [ ] User can switch plans (Monthly ↔ Yearly)
- [ ] User can cancel subscription
- [ ] User can view/download invoices
- [ ] User can update payment method

## Technical Details

### Files
```
src/
├── app/api/stripe/
│   └── create-portal-session/route.ts  # NEW
└── components/
    └── account/
        └── SubscriptionSection.tsx     # Add button
```

### Implementation Notes
- Configure Stripe Billing Portal in Dashboard first
- Create portal session with customer_id
- Redirect to portal URL
- Set return_url back to app

### API Contract
```typescript
// POST /api/stripe/create-portal-session
interface PortalSessionResponse {
  portalUrl: string;
}
```

## UI/UX

In Account view:
```
┌─────────────────────────────────────────┐
│ Subscription                            │
│                                         │
│ Plan: Flow (Yearly)                     │
│ Next payment: Feb 15, 2027              │
│                                         │
│ [Manage subscription]                   │
└─────────────────────────────────────────┘
```

## Definition of Done

- [ ] Portal session endpoint implemented
- [ ] Button in Account section
- [ ] Portal opens correctly
- [ ] Changes are processed via webhook (POMO-312)
