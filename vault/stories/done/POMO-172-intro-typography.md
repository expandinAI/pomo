---
type: story
status: done
priority: p0
effort: 3
feature: "[[features/first-run-intro]]"
created: 2026-01-27
updated: 2026-01-29
done_date: 2026-01-29
tags: [intro, animation, typography, text]
---

# POMO-172: Intro Typography

## User Story

> As a **new Particle user**
> I want to **read the philosophy "Great works are born from many small ones"**,
> so that **I understand what Particle stands for – before I use it**.

## Kontext

Link zum Feature: [[features/first-run-intro]]

Der Text ist das Herz des Intros. Zwei Wahrheiten und eine Einladung. Die Typografie muss perfekt sein – Inter, zentriert, organisches Erscheinen.

**Abhängigkeit:** POMO-170 (Foundation), POMO-171 (Genesis) müssen fertig sein.

## The Content

### Text 1 (Phase: truth1)
```
Great works are not born
from great moments.
```
*Position: Above the particle*

### Text 2 (Phase: truth2)
```
They are born from many small ones.
```
*Position: Below the particle*

### Text 3 (Phase: invitation)
```
Ready?
```
*Position: Below the particle cloud (after cell division)*

## Acceptance Criteria

- [ ] **Given** phase is `truth1`, **When** animation starts, **Then** Text 1 appears above the particle
- [ ] **Given** phase is `truth2`, **When** animation starts, **Then** Text 2 appears below the particle (Text 1 stays)
- [ ] **Given** phase changes to `division`, **Then** both texts remain visible
- [ ] **Given** phase changes to `invitation`, **Then** Texts 1+2 fade out, "Ready?" appears
- [ ] **Given** phase changes to `convergence`, **Then** "Ready?" fades out
- [ ] **Given** user has `prefers-reduced-motion`, **When** text appears, **Then** only fade (no y-offset)

## Timing (from Feature Spec)

| Phase | Start | End | What Happens |
|-------|-------|-----|--------------|
| truth1 | 3.5s | 6.5s | Text 1 appears, stays |
| truth2 | 6.5s | 9.0s | Text 2 appears, both stay |
| division | 9.0s | 10.5s | Both texts stay (cell division runs) |
| invitation | 10.5s | 11.5s | Texts 1+2 fade out, "Ready?" appears |
| convergence | 11.5s | 12.5s | "Ready?" fades out |

## Technical Details

### Affected Files

```
src/components/intro/
├── IntroExperience.tsx    # Integration
├── IntroTypography.tsx    # NEU: Text-Komponente
└── index.ts               # Export erweitern
```

### IntroTypography Component

```typescript
// src/components/intro/IntroTypography.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { IntroPhase } from '@/hooks/useIntro';
import { usePrefersReducedMotion } from '@/hooks/useIntro';

interface IntroTypographyProps {
  phase: IntroPhase;
}

export function IntroTypography({ phase }: IntroTypographyProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Visibility logic
  const showText1 = ['truth1', 'truth2', 'division'].includes(phase);
  const showText2 = ['truth2', 'division'].includes(phase);
  const showInvitation = phase === 'invitation';

  // Animation variants
  const textVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 10,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : -5,
    },
  };

  const transition = {
    duration: 1.2,
    ease: [0.33, 1, 0.68, 1],
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      {/* Text 1 - Above particle */}
      <AnimatePresence>
        {showText1 && (
          <motion.p
            key="text1"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
            className="absolute text-white text-center font-normal tracking-tight leading-relaxed
                       text-lg md:text-xl lg:text-2xl
                       px-6"
            style={{ bottom: 'calc(50% + 40px)' }}
          >
            Great works are not born
            <br />
            from great moments.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Text 2 - Below particle */}
      <AnimatePresence>
        {showText2 && (
          <motion.p
            key="text2"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
            className="absolute text-white text-center font-normal tracking-tight leading-relaxed
                       text-lg md:text-xl lg:text-2xl
                       px-6"
            style={{ top: 'calc(50% + 40px)' }}
          >
            They are born from many small ones.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Invitation - Below particle cloud */}
      <AnimatePresence>
        {showInvitation && (
          <motion.p
            key="invitation"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
            className="absolute text-white text-center font-normal tracking-tight leading-relaxed
                       text-lg md:text-xl lg:text-2xl"
            style={{ top: 'calc(50% + 60px)' }}
          >
            Ready?
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Responsive Typography

| Breakpoint | Size | Tailwind |
|------------|------|----------|
| Mobile (<768px) | 18px | `text-lg` |
| Tablet (768-1024px) | 20px | `md:text-xl` |
| Desktop (>1024px) | 24px | `lg:text-2xl` |

### Integration in IntroExperience

```typescript
// In IntroExperience.tsx
import { GenesisParticle } from './GenesisParticle';
import { IntroTypography } from './IntroTypography';

export function IntroExperience({ phase, onSkip, onComplete }: IntroExperienceProps) {
  return (
    <motion.div className="fixed inset-0 bg-black z-[100] ...">
      {/* Genesis Particle */}
      <GenesisParticle phase={phase} />

      {/* Typography */}
      <IntroTypography phase={phase} />

      {/* ParticleSystem kommt in POMO-173 */}
    </motion.div>
  );
}
```

## The Feeling

The text should feel like:
- A poem being recited
- A truth being spoken
- A hand being extended

**Not:**
- A marketing slogan
- A tutorial text
- Something you skim over

## Important Details

- **Line break in Text 1:** "not born" and "from great moments" are separated
- **The question mark:** In "Ready?" it's an invitation, not a command
- **Position relative to particle:** Texts must be symmetrically arranged around the particle
- **Inter Font:** Same as the app, no special intro font

## Testing

### Manual Testing

- [ ] Text 1 appears in truth1 phase
- [ ] Text 2 appears in truth2 phase
- [ ] Both texts remain in division phase
- [ ] Texts fade out, "Ready?" appears in invitation phase
- [ ] "Ready?" fades out in convergence phase
- [ ] Typography correct (Inter, centered)
- [ ] Responsive works
- [ ] Reduced Motion: Fade only, no y-offset

### Automated Tests

```typescript
describe('IntroTypography', () => {
  it('shows text1 in truth1 phase', () => {
    render(<IntroTypography phase="truth1" />);
    expect(screen.getByText(/Great works/)).toBeInTheDocument();
  });

  it('shows both texts in truth2 phase', () => {
    render(<IntroTypography phase="truth2" />);
    expect(screen.getByText(/Great works/)).toBeInTheDocument();
    expect(screen.getByText(/many small ones/)).toBeInTheDocument();
  });

  it('shows invitation in invitation phase', () => {
    render(<IntroTypography phase="invitation" />);
    expect(screen.getByText('Ready?')).toBeInTheDocument();
    expect(screen.queryByText(/Great works/)).not.toBeInTheDocument();
  });
});
```

## Definition of Done

- [ ] `IntroTypography` component implemented
- [ ] Integrated in `IntroExperience`
- [ ] Texts appear at the right phase
- [ ] Fade animations smooth
- [ ] Responsive typography
- [ ] Reduced Motion respected
- [ ] Texts are pixel-perfect positioned
- [ ] Locally tested

## Notes

- The texts are in English (primary language of the app)
- The spacing to the particle (40px/60px) can be fine-tuned
- Later: i18n for German and other languages

---

## Work Log

### Started:
<!-- Claude: Note what you're doing here -->

### Completed:
<!-- Will be auto-filled when story is moved to done/ -->
