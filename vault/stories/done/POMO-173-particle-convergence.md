---
type: story
status: backlog
priority: p0
effort: 8
feature: "[[features/first-run-intro]]"
created: 2026-01-27
updated: 2026-01-29
done_date: null
tags: [intro, animation, particle, physics, cell-division, convergence]
---

# POMO-173: Particle Division & Convergence

## User Story

> As a **new Particle user**
> I want to **see how the single particle divides and then comes back together**,
> so that **I visually understand: From many small ones, something great emerges**.

## Context

Link to feature: [[features/first-run-intro]]

This is the visual heart of the intro. The cell division makes the philosophy visible. The convergence shows: All small moments become one – the timer, your focus.

**Effort: 8** – This is the technically most demanding story. The physics must feel organic, not mechanical.

**Dependency:** POMO-170 (Foundation), POMO-171 (Genesis), POMO-172 (Typography) should be complete.

## Phase Overview

| Phase | What Happens | Component |
|-------|--------------|-----------|
| genesis, truth1, truth2 | 1 particle (GenesisParticle) | POMO-171 |
| **division** | 1 → 3 → 7 particles (cell division) | **This story** |
| **invitation** | 7 particles drift | **This story** |
| **convergence** | 7 → line (convergence) | **This story** |
| transition | Fade-out | POMO-174 |

## Acceptance Criteria

### Cell Division (Phase: division)

- [ ] **Given** phase changes to `division`, **Then** 7 particles appear at the genesis particle's position
- [ ] **Given** the particles appear, **When** I observe, **Then** they divide organically: 1 → 3 → 7
- [ ] **Given** particles exist, **When** they drift, **Then** they move slowly and organically

### Drift (Phase: invitation)

- [ ] **Given** phase is `invitation`, **When** I observe, **Then** the 7 particles drift gently
- [ ] **Given** particles drift, **Then** they stay within a bounded radius (~80px from center)

### Convergence (Phase: convergence)

- [ ] **Given** phase changes to `convergence`, **Then** all particles are pulled to the center
- [ ] **Given** convergence runs, **When** it ends, **Then** the 7 particles form a horizontal line
- [ ] **Given** convergence ends, **Then** the line is exactly centered

### Reduced Motion

- [ ] **Given** user has `prefers-reduced-motion`, **When** division starts, **Then** 7 particles appear directly in line form (no animation)

## Technical Details

### Affected Files

```
src/components/intro/
├── IntroExperience.tsx      # Integration
├── ParticleSystem.tsx       # NEU: Haupt-Komponente für 7 Partikel
├── useParticlePhysics.ts    # NEU: Physik-Hook
└── index.ts                 # Export erweitern
```

### Particle Interface

```typescript
interface Particle {
  id: number;
  x: number;          // Position relativ zum Zentrum
  y: number;
  vx: number;         // Velocity X
  vy: number;         // Velocity Y
  scale: number;      // 0.8 – 1.0
  opacity: number;    // 0 – 1
}
```

### ParticleSystem Component

```typescript
// src/components/intro/ParticleSystem.tsx
'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { IntroPhase } from '@/hooks/useIntro';
import { usePrefersReducedMotion } from '@/hooks/useIntro';
import { useParticlePhysics } from './useParticlePhysics';

interface ParticleSystemProps {
  phase: IntroPhase;
}

export function ParticleSystem({ phase }: ParticleSystemProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Nur in division, invitation, convergence sichtbar
  const isActive = ['division', 'invitation', 'convergence'].includes(phase);

  // Physik-Hook für Partikel-Positionen
  const particles = useParticlePhysics({
    phase,
    isActive,
    prefersReducedMotion,
  });

  if (!isActive) return null;

  // Reduced Motion: Statische Linie
  if (prefersReducedMotion) {
    return (
      <div
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="flex gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-white rounded-full"
              style={{ filter: 'blur(0.5px)' }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1.5 h-1.5 bg-white rounded-full"
          style={{
            left: '50%',
            top: '50%',
            x: p.x,
            y: p.y,
            scale: p.scale,
            opacity: p.opacity,
            filter: 'blur(0.5px)',
            translateX: '-50%',
            translateY: '-50%',
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
```

### Physics Hook

```typescript
// src/components/intro/useParticlePhysics.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { IntroPhase } from '@/hooks/useIntro';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  opacity: number;
}

interface UseParticlePhysicsOptions {
  phase: IntroPhase;
  isActive: boolean;
  prefersReducedMotion: boolean;
}

const PARTICLE_COUNT = 7;
const DRIFT_FRICTION = 0.98;
const DRIFT_MAX_SPEED = 0.5;
const BOUNDARY_RADIUS = 80;
const CONVERGENCE_FORCE_BASE = 0.03;
const CONVERGENCE_FORCE_MAX = 0.18;
const LINE_SPACING = 12;

// Easing for organic movement
const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export function useParticlePhysics({
  phase,
  isActive,
  prefersReducedMotion,
}: UseParticlePhysicsOptions) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>();
  const convergenceStartRef = useRef<number>(0);

  // Initialize particles when division starts
  useEffect(() => {
    if (phase === 'division' && particles.length === 0 && !prefersReducedMotion) {
      // Create 7 particles with slight random offsets
      const initial: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        scale: 0.85 + Math.random() * 0.15,
        opacity: 0,
      }));
      setParticles(initial);

      // Fade in particles
      setTimeout(() => {
        setParticles((prev) =>
          prev.map((p) => ({ ...p, opacity: 1 }))
        );
      }, 100);
    }
  }, [phase, particles.length, prefersReducedMotion]);

  // Track convergence start time
  useEffect(() => {
    if (phase === 'convergence') {
      convergenceStartRef.current = Date.now();
    }
  }, [phase]);

  // Physics animation loop
  useEffect(() => {
    if (!isActive || prefersReducedMotion || particles.length === 0) return;

    const animate = () => {
      setParticles((prev) => {
        return prev.map((p, index) => {
          let { x, y, vx, vy } = p;

          if (phase === 'division' || phase === 'invitation') {
            // Drift physics
            vx *= DRIFT_FRICTION;
            vy *= DRIFT_FRICTION;

            // Boundary attraction (keep particles close to center)
            const dist = Math.sqrt(x * x + y * y);
            if (dist > BOUNDARY_RADIUS * 0.7) {
              vx -= x * 0.0005;
              vy -= y * 0.0005;
            }

            // Speed limit
            const speed = Math.sqrt(vx * vx + vy * vy);
            if (speed > DRIFT_MAX_SPEED) {
              vx = (vx / speed) * DRIFT_MAX_SPEED;
              vy = (vy / speed) * DRIFT_MAX_SPEED;
            }
          } else if (phase === 'convergence') {
            // Convergence physics - attract to line
            const elapsed = Date.now() - convergenceStartRef.current;
            const progress = Math.min(elapsed / 1000, 1); // 1s duration
            const easedProgress = easeInOutCubic(progress);

            // Target position on horizontal line
            const totalWidth = (PARTICLE_COUNT - 1) * LINE_SPACING;
            const targetX = -totalWidth / 2 + index * LINE_SPACING;
            const targetY = 0;

            // Attraction force increases with progress
            const force = CONVERGENCE_FORCE_BASE + easedProgress * (CONVERGENCE_FORCE_MAX - CONVERGENCE_FORCE_BASE);

            vx += (targetX - x) * force;
            vy += (targetY - y) * force;

            // Dampen near target
            const distToTarget = Math.sqrt((targetX - x) ** 2 + (targetY - y) ** 2);
            if (distToTarget < 30) {
              const dampening = 0.85 + (1 - distToTarget / 30) * 0.1;
              vx *= dampening;
              vy *= dampening;
            }
          }

          // Update position
          x += vx;
          y += vy;

          return { ...p, x, y, vx, vy };
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, phase, prefersReducedMotion, particles.length]);

  return particles;
}
```

### Integration in IntroExperience

```typescript
// In IntroExperience.tsx
import { GenesisParticle } from './GenesisParticle';
import { IntroTypography } from './IntroTypography';
import { ParticleSystem } from './ParticleSystem';

export function IntroExperience({ phase, onSkip, onComplete }: IntroExperienceProps) {
  return (
    <motion.div className="fixed inset-0 bg-black z-[100] ...">
      {/* Genesis Particle (1) - visible in genesis, truth1, truth2 */}
      <GenesisParticle phase={phase} />

      {/* Particle System (7) - visible in division, invitation, convergence */}
      <ParticleSystem phase={phase} />

      {/* Typography */}
      <IntroTypography phase={phase} />
    </motion.div>
  );
}
```

## Animation Flow

### Cell Division (1.5s)

```
Start:           0.5s:            1.0s:            1.5s:
    ·            · · ·            · · ·            · · ·
                  ·                · ·              · ·
                                    ·                ·
```

### Drift (during invitation)

```
The 7 particles move gently
within a ~80px radius
```

### Convergence (1s)

```
Start:           0.3s:            0.7s:            1.0s:
  · · ·          · · ·            ·····            ·······
  · ·              ···
    ·
```

## The Feeling

The animation should feel like:
- A cell dividing – organic, not mechanical
- Breathing in and out
- Magnetism – gentle, not jerky
- Something alive finding its place

**Not:**
- Explosions or fireworks
- Linear, robotic movement
- Too fast or too chaotic

## Testing

### Manual Testing

- [ ] Cell division looks organic (not mechanical)
- [ ] 7 particles appear (no more, no less)
- [ ] Particles drift gently (not too fast)
- [ ] Particles stay within boundary (~80px)
- [ ] Convergence is harmonious (easing)
- [ ] Final line is horizontal and centered
- [ ] 60fps is achieved
- [ ] Reduced Motion shows static line

### Performance Check

```typescript
// In useEffect with performance logging (dev only)
if (process.env.NODE_ENV === 'development') {
  const start = performance.now();
  // ... physics calculation ...
  const duration = performance.now() - start;
  if (duration > 16) {
    console.warn(`Physics calculation took ${duration.toFixed(2)}ms (>16ms = <60fps)`);
  }
}
```

## Definition of Done

- [ ] `ParticleSystem` component implemented
- [ ] `useParticlePhysics` hook implemented
- [ ] Cell division works (1 → 7)
- [ ] Drift physics works
- [ ] Convergence physics works
- [ ] Final line is centered
- [ ] 60fps on standard hardware
- [ ] Reduced Motion shows static alternative
- [ ] Integrated in IntroExperience
- [ ] Locally tested

## Notes

- **Performance:** requestAnimationFrame instead of setInterval
- **Particle count:** 7 is magic – not too few, not too many
- **Convergence timing:** 1s is fast enough to avoid impatience
- The final line is horizontal – could harmonize with timer design later (POMO-174)

---

## Work Log

### Started:
<!-- Claude: Note what you're doing here -->

### Completed:
<!-- Will be auto-filled when story is moved to done/ -->
