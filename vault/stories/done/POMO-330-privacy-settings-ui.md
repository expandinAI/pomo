---
type: story
status: done
priority: p1
effort: 2
feature: "[[features/gdpr-data-privacy]]"
created: 2026-01-31
updated: 2026-01-31
done_date: 2026-02-03
tags: [gdpr, privacy, ui, settings]
---

# POMO-330: Privacy Settings UI

## User Story

> As a **user**,
> I want to **find all privacy options in one place**,
> so that **I can easily exercise my data protection rights**.

## Context

Link: [[features/gdpr-data-privacy]]

Central section for all privacy-related actions.

## Acceptance Criteria

- [ ] Dedicated "Privacy" section in Settings/Account
- [ ] Data export button
- [ ] Analytics opt-out toggle
- [ ] Delete account button
- [ ] Link to privacy policy
- [ ] Consistent design with other settings

## Technical Details

### Files

```
src/
├── components/
│   └── settings/
│       ├── PrivacySettings.tsx   # NEW
│       └── index.ts
```

### Implementation Notes

- Integrate into existing Account/Settings modal
- Analytics toggle saves to user settings
- PostHog respects `analytics_enabled` flag

### Analytics Opt-Out

```typescript
// PostHog integration
if (!user.analytics_enabled) {
  posthog.opt_out_capturing();
} else {
  posthog.opt_in_capturing();
}
```

## UI/UX

```
┌─────────────────────────────────────────────────────────────────┐
│ Privacy                                                          │
│ ─────────────────────────────────────────────────────────────   │
│                                                                   │
│ Data Export                                                      │
│ Download a copy of all your data.                                │
│ [Export Data]                                                    │
│                                                                   │
│ ─────────────────────────────────────────────────────────────   │
│                                                                   │
│ Analytics                                              [●]       │
│ Help us improve Particle (anonymized).                           │
│ We don't collect personal data.                                  │
│                                                                   │
│ ─────────────────────────────────────────────────────────────   │
│                                                                   │
│ Delete Account                                                   │
│ Permanently delete your account and all data.                   │
│ After requesting deletion, you have 30 days to                  │
│ change your mind.                                                │
│ [Delete Account...]                                              │
│                                                                   │
│ ─────────────────────────────────────────────────────────────   │
│                                                                   │
│ Privacy Policy                                                   │
│ [View Privacy Policy ↗]                                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### States

**Analytics Toggle:**
- ON: PostHog active
- OFF: PostHog disabled

**Delete Account Button:**
- Normal: "Delete Account..."
- During cooling-off: "Cancel Deletion (X days left)"

## Definition of Done

- [ ] Privacy Settings component created
- [ ] Integrated into Account/Settings
- [ ] Analytics toggle works
- [ ] All buttons linked (Export, Delete, Policy)
- [ ] Responsive design
