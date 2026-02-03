---
type: story
status: done
priority: p1
effort: 3
feature: "[[features/payment-integration]]"
created: 2026-01-31
updated: 2026-01-31
done_date: 2026-02-03
tags: [payment, stripe, checkout]
---

# POMO-311: Stripe Setup & Checkout

## User Story

> As a **user interested in Flow**,
> I want to **click "Upgrade" and pay seamlessly**,
> so that **I immediately get access to Flow features**.

## Context

Link: [[features/payment-integration]]

Stripe Checkout (hosted) is the simplest solution. No custom payment form needed. The checkout page is hosted by Stripe, reducing PCI compliance burden.

## Acceptance Criteria

- [ ] Stripe account configured (Test + Live keys in environment)
- [ ] Products created in Stripe (Flow Monthly €4.99, Flow Yearly €39)
- [ ] Checkout session can be created via API
- [ ] User is redirected to Stripe Checkout
- [ ] After successful payment: redirect back to app
- [ ] Stripe Customer ID is stored on user record

## Technical Details

### Files
```
src/
├── app/api/stripe/
│   └── create-checkout/route.ts  # NEW
├── lib/
│   └── stripe.ts                 # NEW: Stripe client singleton
└── .env.local                    # Stripe keys
```

### Implementation Notes
- Install `stripe` npm package
- Create Stripe client as singleton
- Use `mode: 'subscription'` for recurring billing
- Configure `success_url` and `cancel_url`
- Create or retrieve Stripe Customer ID from Clerk metadata

### API Contract
```typescript
// POST /api/stripe/create-checkout
interface CreateCheckoutRequest {
  priceId: string; // 'price_monthly' | 'price_yearly'
}

interface CreateCheckoutResponse {
  checkoutUrl: string;
}
```

## Testing

- [ ] Click "Upgrade" → Stripe Checkout opens
- [ ] Test card works (4242 4242 4242 4242)
- [ ] After payment: redirect back to app
- [ ] Cancel: redirect back without changes

## Definition of Done

- [ ] Stripe account set up
- [ ] API endpoint implemented
- [ ] Tested locally with test keys
- [ ] Documentation for Stripe setup added

---

## Notes

Stripe test cards: https://stripe.com/docs/testing
