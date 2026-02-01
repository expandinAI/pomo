---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/payment-integration]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [payment, tier, flow]
---

# POMO-313: Tier Upgrade Logic

## User Story

> As a **newly subscribed Flow user**,
> I want to **immediately access all Flow features**,
> so that **I can start using premium capabilities right away**.

## Context

Link: [[features/payment-integration]]

After the webhook updates the user tier, the app must reflect the new status. Features must be unlocked, and the user should feel celebrated.

## Acceptance Criteria

- [ ] App detects new tier status (polling or realtime)
- [ ] Year View is unlocked
- [ ] All themes are unlocked
- [ ] Advanced Stats are unlocked
- [ ] Coach feature is unlocked (300/month limit)
- [ ] UI shows "Flow" badge
- [ ] Celebration animation plays on first Flow access

## Technical Details

### Files
```
src/
├── contexts/
│   └── UserContext.tsx           # Extend with tier state
├── hooks/
│   └── useFeatureAccess.ts       # NEW: Feature gates
├── components/
│   └── FlowCelebration.tsx       # NEW: Upgrade animation
```

### Implementation Notes
- `useFeatureAccess('yearView')` → boolean
- Use Supabase Realtime for tier updates OR
- Poll every 30s after checkout redirect
- LocalStorage flag for "just upgraded" → show celebration

### Feature Gates
```typescript
const FLOW_FEATURES = [
  'yearView',
  'advancedStats',
  'allThemes',
  'unlimitedPresets',
  'aiCoach',
  'export',
] as const;

function useFeatureAccess(feature: FlowFeature): boolean {
  const { tier } = useUser();
  return tier === 'flow' || tier === 'lifetime';
}
```

## UI/UX

**Celebration Animation:**
- Particle explosion or confetti
- "Welcome to Flow ✨" message
- Brief (2-3 seconds)
- Shows only once

The celebration should feel magical, not salesy. It's a moment of arrival.

## Testing

- [ ] After upgrade: Year View accessible
- [ ] After upgrade: All themes visible
- [ ] Celebration animation plays
- [ ] Downgrade: Features locked again

## Definition of Done

- [ ] Feature gates implemented
- [ ] All Flow features unlock when tier='flow'
- [ ] Celebration animation works
- [ ] Downgrade path tested
