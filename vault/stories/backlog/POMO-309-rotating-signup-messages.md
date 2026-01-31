---
type: story
status: backlog
priority: p2
effort: 2
feature: signup-nudge
created: 2025-01-31
updated: 2025-01-31
done_date: null
tags: [conversion, growth, particle-menu]
---

# Rotating Sign-up Messages

## User Story

> As someone **who hasn't signed in yet**,
> I want to see **different reasons to protect my work**,
> so that **I understand the value without feeling pressured**.

## Context

Link: [[ideas/IDEA-subtle-signup-nudge]]

One message speaks to one motivation. But people are different. Some care about safety. Others want flexibility. By rotating messages, we speak to everyone – gently, not loudly.

## Message Pool

Each message is short. Clear. Warm.

| Message | What it speaks to |
|---------|-------------------|
| **Protect your work** | Safety, care |
| **Access anywhere** | Freedom, flexibility |
| **Never lose progress** | Peace of mind |
| **Your work, everywhere** | Continuity |
| **Keep it safe** | Simple, warm |
| **Continue on any device** | Practical benefit |

## Acceptance Criteria

- [ ] **Given** I'm not signed in, **When** I open the menu, **Then** I see one message from the pool
- [ ] **Given** I open the menu again, **When** I look at the message, **Then** it may be different
- [ ] **Given** I'm signed in, **When** I open the menu, **Then** I see "Account" – no rotation

## Technical Details

### Files
```
src/components/ui/ParticleMenu.tsx
```

### Implementation
```typescript
const SIGNUP_MESSAGES = [
  'Protect your work',
  'Access anywhere',
  'Never lose progress',
  'Your work, everywhere',
  'Keep it safe',
  'Continue on any device',
];

// Random selection on each menu open
const message = useMemo(
  () => SIGNUP_MESSAGES[Math.floor(Math.random() * SIGNUP_MESSAGES.length)],
  [isOpen]
);
```

## UI/UX

The message appears at the bottom of the menu. Same styling as now. Shield icon stays constant – only the words change.

Feels natural. Not salesy.

## Definition of Done

- [ ] Messages rotate on menu open
- [ ] All messages feel on-brand
- [ ] Works for anonymous users only
- [ ] No console errors
