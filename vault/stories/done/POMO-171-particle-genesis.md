---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/first-run-intro]]"
created: 2026-01-27
updated: 2026-01-29
done_date: null
tags: [intro, animation, particle, genesis]
---

# POMO-171: Particle Genesis

## User Story

> As a **new Particle user**
> I want to **see how a single particle emerges from the darkness and begins to breathe**,
> so that **I feel like I'm experiencing something alive**.

## Context

Link to feature: [[features/first-run-intro]]

The Genesis moment is the first visual impression. A single white dot appears from nothing and begins to "breathe". Organic. Alive. Not mechanical.

**Dependency:** POMO-170 (Foundation) must be complete.

**Scope:** The particle appears in phase `genesis` and remains visible until phase `division`. From `division`, POMO-173 (ParticleSystem) takes over.

## Acceptance Criteria

- [ ] **Given** phase is `genesis`, **When** the animation starts, **Then** a white dot appears with fade-in (~1.5s)
- [ ] **Given** the dot has appeared, **When** I observe, **Then** it pulses gently (±2% size, 4s cycle)
- [ ] **Given** phase changes to `truth1`, `truth2`, **Then** the particle remains visible and keeps breathing
- [ ] **Given** phase changes to `division`, **Then** this particle disappears (ParticleSystem takes over)
- [ ] **Given** user has `prefers-reduced-motion`, **When** Genesis runs, **Then** the dot appears without pulsing
- [ ] **Given** the dot exists, **When** I look closely, **Then** it has slightly soft edges (organic)

## Technical Details

### Affected Files

```
src/components/intro/
├── IntroExperience.tsx    # Integration
├── GenesisParticle.tsx    # NEW: The first particle
└── index.ts               # Extend exports
```

### GenesisParticle Component

```typescript
// src/components/intro/GenesisParticle.tsx
'use client';

import { motion } from 'framer-motion';
import type { IntroPhase } from '@/hooks/useIntro';
import { usePrefersReducedMotion } from '@/hooks/useIntro';

interface GenesisParticleProps {
  phase: IntroPhase;
}

export function GenesisParticle({ phase }: GenesisParticleProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Visible from genesis to truth2 (division takes over then)
  const isVisible = ['genesis', 'truth1', 'truth2'].includes(phase);

  if (!isVisible) return null;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                 w-1.5 h-1.5 md:w-[5px] md:h-[5px] lg:w-1.5 lg:h-1.5
                 bg-white rounded-full"
      style={{ filter: 'blur(0.5px)' }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: prefersReducedMotion ? 1 : [1, 1.02, 1, 0.98, 1],
      }}
      transition={{
        opacity: { duration: 1.5, ease: [0.33, 1, 0.68, 1] },
        scale: prefersReducedMotion
          ? { duration: 0 }
          : { duration: 4, repeat: Infinity, ease: 'easeInOut' },
      }}
      aria-hidden="true"
    />
  );
}
```

### Responsive Sizes

| Breakpoint | Size | Tailwind |
|------------|------|----------|
| Mobile (<768px) | 4px | `w-1 h-1` |
| Tablet (768-1024px) | 5px | `md:w-[5px] md:h-[5px]` |
| Desktop (>1024px) | 6px | `lg:w-1.5 lg:h-1.5` |

### Integration in IntroExperience

```typescript
// In IntroExperience.tsx
import { GenesisParticle } from './GenesisParticle';

export function IntroExperience({ phase, onSkip, onComplete }: IntroExperienceProps) {
  return (
    <motion.div className="fixed inset-0 bg-black z-[100] ...">
      {/* Genesis Particle - visible from genesis to truth2 */}
      <GenesisParticle phase={phase} />

      {/* Typography comes in POMO-172 */}
      {/* ParticleSystem comes in POMO-173 */}

      {/* Dev mode indicator */}
      {process.env.NODE_ENV === 'development' && (...)}
    </motion.div>
  );
}
```

## Animation Details

### Fade-In (Phase: genesis)

```typescript
const fadeIn = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1 },
  transition: {
    duration: 1.5,
    ease: [0.33, 1, 0.68, 1], // Smooth ease-out
  }
};
```

### Breathing (continuous)

```typescript
const breathing = {
  animate: {
    scale: [1, 1.02, 1, 0.98, 1],
  },
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
  }
};
```

## The Feeling

The particle should feel like:
- A star becoming visible in the night sky
- A heartbeat
- Something just born
- Alive, not digital

**Not:**
- A blinking cursor
- A loading indicator
- Something mechanical

## Testing

### Manual Testing

- [ ] Particle appears after 2s silence (Phase: genesis)
- [ ] Fade-in takes ~1.5s
- [ ] Particle pulses gently (not too strong)
- [ ] Edges are slightly soft (blur)
- [ ] Particle remains visible in truth1, truth2
- [ ] Particle disappears at division
- [ ] Responsive: Mobile 4px, Tablet 5px, Desktop 6px
- [ ] Reduced Motion: No pulsing

### Automated Tests

```typescript
describe('GenesisParticle', () => {
  it('renders in genesis phase', () => {
    render(<GenesisParticle phase="genesis" />);
    expect(screen.getByRole('presentation', { hidden: true })).toBeInTheDocument();
  });

  it('remains visible in truth1 and truth2', () => {
    const { rerender } = render(<GenesisParticle phase="genesis" />);
    rerender(<GenesisParticle phase="truth1" />);
    expect(screen.getByRole('presentation', { hidden: true })).toBeInTheDocument();
  });

  it('hides in division phase', () => {
    render(<GenesisParticle phase="division" />);
    expect(screen.queryByRole('presentation', { hidden: true })).not.toBeInTheDocument();
  });
});
```

## Definition of Done

- [ ] `GenesisParticle` component implemented
- [ ] Integrated in `IntroExperience`
- [ ] Fade-in animation smooth (60fps)
- [ ] Breathing animation organic
- [ ] Responsive sizes work
- [ ] Reduced Motion respected
- [ ] Blur for organic feel
- [ ] Locally tested

## Notes

- The particle is the heart of the intro – invest time here
- The breathing must be subtle – not like a "pulse" icon
- The blur (0.5px) makes the difference between "digital" and "organic"
- This particle is replaced by the ParticleSystem in POMO-173 (7 particles)

---

## Work Log

### Started:
<!-- Claude: Note what you're doing here -->

### Completed:
<!-- Will be auto-filled when story is moved to done/ -->
