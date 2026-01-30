---
type: story
status: backlog
priority: p0
effort: 2
feature: "[[features/first-run-intro]]"
created: 2026-01-27
updated: 2026-01-29
done_date: null
tags: [intro, animation, transition, ux]
---

# POMO-174: Intro Transition

## User Story

> As a **new Particle user**
> I want to **experience a seamless transition from the intro to the app**,
> so that **it feels like the app was born from the intro**.

## Context

Link to feature: [[features/first-run-intro]]

The transition is the last impression of the intro – and the first impression of the app. No hard cut, no loading animation. Continuity.

**Dependency:** POMO-170 to POMO-173 must be complete.

**Note:** The basic structure (state machine, localStorage, conditional rendering) is already implemented in POMO-170. This story only adds the **visual fade transition**.

## Acceptance Criteria

- [ ] **Given** phase is `transition`, **When** 500ms pass, **Then** the intro fades out smoothly (opacity 1 → 0)
- [ ] **Given** the intro fades out, **When** opacity is ~0.3, **Then** the app underneath is already visible
- [ ] **Given** the transition is complete, **Then** the app is immediately usable (no delay)
- [ ] **Given** user has `prefers-reduced-motion`, **When** transition comes, **Then** the fade is faster (200ms)

## Timing

| Time | What Happens |
|------|--------------|
| 0ms | Phase changes to `transition` |
| 0-500ms | Intro fades out (opacity 1 → 0) |
| 500ms | `phase` becomes `complete`, intro is unmounted |

**Reduced Motion:** 200ms instead of 500ms

## Technical Details

### What Already Exists (POMO-170)

```typescript
// In useIntro.ts - already implemented
useEffect(() => {
  if (phase === 'complete' && showIntro) {
    markIntroSeen();
    setShowIntro(false);
  }
}, [phase, showIntro]);
```

### What This Story Adds

The `IntroExperience` component needs an animated fade-out when `phase === 'transition'`.

```typescript
// In IntroExperience.tsx - Anpassung
export function IntroExperience({ phase, onSkip, onComplete }: IntroExperienceProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isTransitioning = phase === 'transition';

  return (
    <motion.div
      className="fixed inset-0 bg-black z-[100] ..."
      initial={{ opacity: 1 }}
      animate={{ opacity: isTransitioning ? 0 : 1 }}
      transition={{
        duration: prefersReducedMotion ? 0.2 : 0.5,
        ease: [0.33, 1, 0.68, 1],
      }}
      onAnimationComplete={() => {
        if (isTransitioning) {
          onComplete();
        }
      }}
    >
      {/* Partikel und Typography bleiben während Transition sichtbar */}
      <GenesisParticle phase={phase} />
      <ParticleSystem phase={phase} />
      <IntroTypography phase={phase} />
    </motion.div>
  );
}
```

### Affected Files

```
src/components/intro/
└── IntroExperience.tsx    # Add fade animation
```

## The Feeling

The transition should feel like:
- A door opening
- A curtain lifting
- Fog clearing

**Not:**
- A hard cut
- A flicker
- A "loading complete" moment

## Edge Cases

| Case | Behavior |
|------|----------|
| Skip during transition | Accelerate transition (instant) |
| Browser tab switch | Transition continues |
| Very slow device | Reduced Motion as fallback |

## Testing

### Manual Testing

- [ ] Fade-out is smooth (no jumps)
- [ ] App is immediately usable after fade
- [ ] No black frame between intro and app
- [ ] Reduced Motion: Faster fade
- [ ] Particle line remains visible during fade

### Automated Tests

```typescript
describe('IntroExperience transition', () => {
  it('fades out when phase is transition', () => {
    const { container } = render(
      <IntroExperience
        phase="transition"
        onSkip={jest.fn()}
        onComplete={jest.fn()}
      />
    );
    // Check that opacity animation is applied
    const intro = container.firstChild as HTMLElement;
    expect(intro).toHaveStyle({ opacity: '0' });
  });

  it('calls onComplete after fade animation', async () => {
    const onComplete = jest.fn();
    render(
      <IntroExperience
        phase="transition"
        onSkip={jest.fn()}
        onComplete={onComplete}
      />
    );

    // Wait for animation
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    }, { timeout: 600 });
  });
});
```

## Definition of Done

- [ ] Fade animation implemented in IntroExperience
- [ ] `onAnimationComplete` calls `onComplete`
- [ ] Reduced Motion respected (faster fade)
- [ ] No visual jump between intro and app
- [ ] Locally tested

## Notes

- This story is intentionally small (Effort 2) – the heavy lifting is already done in POMO-170
- The overlap between intro fade-out and app appearance prevents black frames
- The particle line at the end of convergence could harmonize with timer design later (Future Enhancement)

---

## Work Log

### Started:
<!-- Claude: Note what you're doing here -->

### Completed:
<!-- Will be auto-filled when story is moved to done/ -->
