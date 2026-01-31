---
type: story
status: backlog
priority: p2
effort: 3
feature: signup-nudge
created: 2025-01-31
updated: 2025-01-31
done_date: null
tags: [conversion, growth, particle-menu, animation]
---

# Subtle Glow When Break Starts

## User Story

> As someone **who just finished focused work**,
> I want to see **a gentle glow on the menu dot**,
> so that **I notice there's something worth exploring – at a moment when I'm free to look**.

## Context

Link: [[ideas/IDEA-subtle-signup-nudge]]

During focus, the UI should be invisible. During break, we can gently invite.

The break is the perfect moment:
- You just accomplished something
- You're allowed to look around
- It feels like a reward, not an interruption

The glow is subtle. Like the dot is breathing. Like it has something to share.

## Acceptance Criteria

- [ ] **Given** I'm not signed in and focus ends, **When** break starts, **Then** the menu dot pulses softly (2-3 times)
- [ ] **Given** I'm signed in, **When** break starts, **Then** no glow appears
- [ ] **Given** the dot is glowing, **When** I click it, **Then** the glow stops and menu opens
- [ ] **Given** I prefer reduced motion, **When** break starts, **Then** no animation plays

## Technical Details

### Files
```
src/components/ui/ParticleMenu.tsx  – glow animation
src/components/timer/Timer.tsx      – emit break-start event
```

### Timer Event
```typescript
// When transitioning to break:
window.dispatchEvent(new CustomEvent('particle:break-started'));
```

### Glow Animation
```typescript
const [shouldGlow, setShouldGlow] = useState(false);

useEffect(() => {
  if (authStatus !== 'anonymous') return;

  const handleBreakStart = () => {
    setShouldGlow(true);
    setTimeout(() => setShouldGlow(false), 6000);
  };

  window.addEventListener('particle:break-started', handleBreakStart);
  return () => window.removeEventListener('particle:break-started', handleBreakStart);
}, [authStatus]);
```

### Animation Spec

| Property | Value |
|----------|-------|
| Duration | 2 seconds per pulse |
| Pulses | 2-3 |
| Color | White at 40% opacity |
| Feel | Breathing, not flashing |

```typescript
<motion.div
  animate={shouldGlow ? {
    boxShadow: [
      '0 0 0 0 rgba(255, 255, 255, 0)',
      '0 0 12px 4px rgba(255, 255, 255, 0.4)',
      '0 0 0 0 rgba(255, 255, 255, 0)',
    ],
  } : {}}
  transition={{ duration: 2, repeat: 2, ease: 'easeInOut' }}
/>
```

## UI/UX

The glow is magic, not marketing.

It should feel like the particle is alive. Breathing. Waiting.

Not urgent. Not flashy. Just... present.

## Definition of Done

- [ ] Glow appears on break start (anonymous users only)
- [ ] Animation respects reduced motion
- [ ] Feels magical, not salesy
- [ ] Clicking the dot stops the glow
- [ ] No performance impact
