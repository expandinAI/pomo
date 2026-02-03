---
type: story
status: done
priority: p1
effort: 3
feature: "[[features/payment-integration]]"
created: 2026-01-31
updated: 2026-01-31
done_date: 2026-02-03
tags: [payment, ui, upgrade]
---

# POMO-316: Upgrade UI Modal

## User Story

> As a **Plus user**,
> I want to **see a compelling upgrade offer**,
> so that **I understand what Flow offers and can upgrade easily**.

## Context

Link: [[features/payment-integration]]

The upgrade modal is the most important conversion point. Must be convincing but not pushy. Calm, not aggressive.

## Acceptance Criteria

- [ ] Modal shows Monthly and Yearly options
- [ ] Yearly shows savings ("Save 35%")
- [ ] Feature list is clear and compelling
- [ ] AI Coach is prominently highlighted
- [ ] "Start 14-day free trial" CTA
- [ ] Modal opens when clicking locked features
- [ ] Keyboard: Escape closes

## Technical Details

### Files
```
src/
├── components/
│   └── upgrade/
│       ├── UpgradeModal.tsx      # NEW
│       └── PricingCard.tsx       # NEW
└── hooks/
    └── useUpgradeModal.ts        # NEW: Modal state
```

## UI/UX

```
┌─────────────────────────────────────────────────────────────────┐
│                                                           [×]    │
│                                                                   │
│                      Upgrade to Flow                             │
│                                                                   │
│  ┌─────────────────────┐    ┌─────────────────────┐             │
│  │      Monthly        │    │       Yearly        │             │
│  │                     │    │                     │             │
│  │       €4.99         │    │        €39          │             │
│  │      /month         │    │       /year         │             │
│  │                     │    │    ┌──────────┐    │             │
│  │                     │    │    │ Save 35% │    │             │
│  │                     │    │    └──────────┘    │             │
│  │     [Select]        │    │     [Select]       │             │
│  └─────────────────────┘    └─────────────────────┘             │
│                                                                   │
│  ✓ AI Coach – Your personal productivity companion              │
│  ✓ Year View – See your year at a glance                        │
│  ✓ Advanced Statistics – Deep insights                          │
│  ✓ All Themes                                                    │
│  ✓ Unlimited Presets                                             │
│  ✓ Export for invoicing                                          │
│                                                                   │
│              Start 14-day free trial                             │
│           Cancel anytime · No hidden fees                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Trigger Points

| Trigger | Behavior |
|---------|----------|
| Click locked Year View | Modal opens |
| Click locked theme | Modal opens |
| "Upgrade" in account menu | Modal opens |
| Trial expired | Modal opens automatically |

### Design Principles

- **Calm, not aggressive** – No countdown timers, no "LAST CHANCE"
- **Honest** – Clear pricing, no tricks
- **Respectful** – Easy to close, no dark patterns
- **Premium** – Generous spacing, subtle animations

## Definition of Done

- [ ] Modal component implemented
- [ ] Both pricing options displayed
- [ ] Checkout integration (calls POMO-311)
- [ ] All trigger points implemented
- [ ] Responsive (Mobile + Desktop)
- [ ] Keyboard accessible
