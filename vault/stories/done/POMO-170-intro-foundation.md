---
type: story
status: done
priority: p0
effort: 3
feature: "[[features/first-run-intro]]"
created: 2026-01-27
updated: 2026-01-29
done_date: 2026-01-29
tags: [intro, foundation, animation]
---

# POMO-170: Intro Foundation

## User Story

> As a **new Particle user**
> I want to **experience a special moment when I first start the app**,
> so that **I immediately feel that this app is different**.

## Context

Link to feature: [[features/first-run-intro]]

This story lays the **technical foundation** for the First-Run Intro:
- Container element (black fullscreen)
- State machine with phase transitions
- Timing system (exported constants)
- Skip logic
- LocalStorage persistence

**Not in this story:**
- Visual elements (particle, text) → POMO-171, POMO-172, POMO-173
- Settings "Replay intro" → POMO-175
- Transition to app → POMO-174

## Acceptance Criteria

- [ ] **Given** I open Particle for the first time, **When** the app loads, **Then** I see the intro (black screen)
- [ ] **Given** I have already seen the intro, **When** I open the app again, **Then** I see the app directly (no intro)
- [ ] **Given** the intro is running, **When** I press Click/Tap/Space/Enter/Esc, **Then** the intro is skipped (→ `complete`)
- [ ] **Given** the intro is running, **When** the state machine completes all phases, **Then** it ends automatically after ~13s

## Technical Details

### Affected Files

```
src/
├── components/
│   └── intro/
│       ├── IntroExperience.tsx    # Container + Rendering
│       └── index.ts
├── hooks/
│   └── useIntro.ts                # State-Machine + Persistenz
└── app/
    └── page.tsx                   # Conditional Rendering
```

### State Machine (in Hook)

```typescript
type IntroPhase =
  | 'silence'      // Act 1: Black screen (2s)
  | 'genesis'      // Act 2: Particle appears (1.5s)
  | 'truth1'       // Act 3: First text (3s)
  | 'truth2'       // Act 4: Second text (2.5s)
  | 'division'     // Act 5: Cell division (1.5s)
  | 'invitation'   // Act 6: "Ready?" (1s)
  | 'convergence'  // Act 7: Particles converge (1s)
  | 'transition'   // Act 8: Transition to app (0.5s)
  | 'complete';    // Intro finished

interface UseIntroReturn {
  /** Whether the intro should be displayed */
  showIntro: boolean;
  /** Current phase */
  phase: IntroPhase;
  /** Whether currently being skipped */
  isSkipping: boolean;
  /** Skip function */
  skip: () => void;
  /** Mark intro as seen (call at the end) */
  markComplete: () => void;
}
```

### Timing Constants (exported)

```typescript
// src/hooks/useIntro.ts
export const INTRO_TIMING = {
  silence: 2000,      // 2s
  genesis: 1500,      // 1.5s
  truth1: 3000,       // 3s
  truth2: 2500,       // 2.5s
  division: 1500,     // 1.5s
  invitation: 1000,   // 1s
  convergence: 1000,  // 1s
  transition: 500,    // 0.5s
} as const;

// Phase order
export const INTRO_PHASE_ORDER: IntroPhase[] = [
  'silence', 'genesis', 'truth1', 'truth2',
  'division', 'invitation', 'convergence', 'transition', 'complete'
];
```

### LocalStorage

```typescript
const STORAGE_KEY = 'particle:intro-seen';

// In hook:
const hasSeenIntro = (): boolean => {
  if (typeof window === 'undefined') return true; // SSR-safe
  return localStorage.getItem(STORAGE_KEY) === 'true';
};

const markIntroSeen = (): void => {
  localStorage.setItem(STORAGE_KEY, 'true');
};

// For POMO-175 (Replay):
export const resetIntro = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
```

### Skip Logic

```typescript
const skip = useCallback(() => {
  setIsSkipping(true);
  setPhase('complete');
}, []);

// Event listeners in IntroExperience.tsx
useEffect(() => {
  const handleSkip = (e: KeyboardEvent | MouseEvent) => {
    if (e instanceof KeyboardEvent) {
      if (!['Space', 'Enter', 'Escape'].includes(e.code)) return;
    }
    skip();
  };

  window.addEventListener('keydown', handleSkip);
  window.addEventListener('click', handleSkip);
  window.addEventListener('touchstart', handleSkip);

  return () => {
    window.removeEventListener('keydown', handleSkip);
    window.removeEventListener('click', handleSkip);
    window.removeEventListener('touchstart', handleSkip);
  };
}, [skip]);
```

## UI/UX

### Container Styling

```tsx
// IntroExperience.tsx
<div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
  {/* Visual elements come in later stories */}
  {process.env.NODE_ENV === 'development' && (
    <div className="absolute bottom-4 left-4 text-white/30 text-xs font-mono">
      Phase: {phase}
    </div>
  )}
</div>
```

### Integration in page.tsx

```tsx
// src/app/page.tsx
import { IntroExperience } from '@/components/intro';
import { useIntro } from '@/hooks/useIntro';

export default function Home() {
  const { showIntro, phase, skip, markComplete } = useIntro();

  return (
    <>
      {showIntro && (
        <IntroExperience
          phase={phase}
          onSkip={skip}
          onComplete={markComplete}
        />
      )}
      {/* Rest of the app */}
    </>
  );
}
```

### Reduced Motion

For this foundation story: Only provide the flag. Visual adjustments in later stories.

```typescript
// Im Hook exportieren
export const usePrefersReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
};
```

## Testing

### Manual Testing

- [ ] Intro appears on first start (clear localStorage)
- [ ] Intro does NOT appear on second start
- [ ] Skip works with Click
- [ ] Skip works with Tap (Touch)
- [ ] Skip works with Space
- [ ] Skip works with Enter
- [ ] Skip works with Escape
- [ ] State machine advances through all phases automatically
- [ ] Dev mode shows current phase

### Automated Tests

```typescript
// src/hooks/__tests__/useIntro.test.ts
describe('useIntro', () => {
  beforeEach(() => localStorage.clear());

  it('shows intro on first visit', () => {
    const { result } = renderHook(() => useIntro());
    expect(result.current.showIntro).toBe(true);
  });

  it('hides intro after completion', () => {
    const { result } = renderHook(() => useIntro());
    act(() => result.current.markComplete());
    expect(result.current.showIntro).toBe(false);
  });

  it('persists completion in localStorage', () => {
    const { result } = renderHook(() => useIntro());
    act(() => result.current.markComplete());
    expect(localStorage.getItem('particle:intro-seen')).toBe('true');
  });

  it('skips intro if already seen', () => {
    localStorage.setItem('particle:intro-seen', 'true');
    const { result } = renderHook(() => useIntro());
    expect(result.current.showIntro).toBe(false);
  });

  it('advances phases with correct timing', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useIntro());

    expect(result.current.phase).toBe('silence');

    act(() => jest.advanceTimersByTime(2000));
    expect(result.current.phase).toBe('genesis');

    // ... more phases
  });

  it('skips to complete when skip() is called', () => {
    const { result } = renderHook(() => useIntro());
    act(() => result.current.skip());
    expect(result.current.phase).toBe('complete');
    expect(result.current.isSkipping).toBe(true);
  });
});
```

## Definition of Done

- [ ] `useIntro` hook implemented with state machine
- [ ] `IntroExperience` container implemented
- [ ] LocalStorage persistence works
- [ ] Skip logic works (Click/Tap/Space/Enter/Esc)
- [ ] Timing constants exported
- [ ] Dev mode shows phase
- [ ] Unit tests written & green
- [ ] Integrated in page.tsx
- [ ] Locally tested (clear localStorage → intro appears)

## Notes

- This story is the **foundation** – without it, the other intro stories don't work
- The **visual experience** (particle, text, animations) comes in POMO-171 to POMO-174
- **Replay function** (Settings) comes in POMO-175
- `resetIntro()` is exported but only used in POMO-175

---

## Work Log

### Started:
<!-- Claude: Note what you're doing here -->

### Completed:
<!-- Will be auto-filled when story is moved to done/ -->
