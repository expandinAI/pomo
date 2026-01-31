---
type: story
status: backlog
priority: p2
effort: 3
feature: "[[features/payment-integration]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [payment, email, trial]
---

# POMO-318: Trial Email Automation

## User Story

> As a **trial user**,
> I want to **receive helpful emails during my trial**,
> so that **I learn about features and can make an informed decision**.

## Context

Link: [[features/payment-integration]]

Email sequence during the 14-day trial. Not pushy—helpful. Each email should provide value, not just ask for money.

## Acceptance Criteria

- [ ] Day 1: Welcome email with Coach introduction
- [ ] Day 7: "Your first week" – insights summary
- [ ] Day 12: Reminder – trial ends in 2 days
- [ ] Day 14: Trial ended – upgrade CTA
- [ ] Emails can be disabled in settings
- [ ] Unsubscribe link in every email

## Technical Details

### Email Provider Options
- Option A: Resend (simple, affordable)
- Option B: Supabase Edge Functions + SMTP
- Option C: Stripe Billing Emails (for payment-related)

### Files
```
src/
├── lib/
│   └── email/
│       ├── send.ts               # NEW: Email client
│       └── templates/
│           ├── trial-welcome.tsx # NEW
│           ├── trial-week1.tsx   # NEW
│           └── trial-ending.tsx  # NEW
└── app/api/cron/
    └── trial-emails/route.ts     # NEW: Scheduled job
```

### Email Triggers

| Day | Trigger | Template |
|-----|---------|----------|
| 1 | Trial start | trial-welcome |
| 7 | Cron (trial_started_at + 7d) | trial-week1 |
| 12 | Cron (trial_started_at + 12d) | trial-ending |
| 14 | Cron (trial_started_at + 14d) | trial-ended |

### Database
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  trial_started_at TIMESTAMPTZ,
  trial_emails_enabled BOOLEAN DEFAULT TRUE;
```

## Email Content (Concept)

**Day 1: Welcome**
- "Your Coach is ready"
- Quick-start: 3 things to try
- Link to app

**Day 7: First Week**
- Personalized insights (if data available)
- "Here's what you accomplished"
- Highlight: What the Coach learned about you

**Day 12: Reminder**
- "Your trial ends in 2 days"
- Summary of what you'd lose
- Upgrade CTA (not pushy)

**Day 14: Ended**
- "Your trial has ended"
- Last chance: Upgrade link
- "You can still use Particle for free, but..."

### Tone
- Warm, not corporate
- Helpful, not desperate
- Respectful of their time
- No guilt ("You're missing out!")

## Definition of Done

- [ ] Email provider set up
- [ ] 4 email templates created
- [ ] Cron job for scheduling
- [ ] Unsubscribe function
- [ ] Emails tested (preview)
