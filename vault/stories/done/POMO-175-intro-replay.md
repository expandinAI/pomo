---
type: story
status: backlog
priority: p2
effort: 3
feature: "[[features/first-run-intro]]"
created: 2026-01-27
updated: 2026-01-29
done_date: null
tags: [intro, easter-egg, command-palette, replay]
---

# POMO-175: Intro Replay & Easter Egg

## User Story

> As an **enthusiastic Particle user**
> I want to **replay the intro at any time**,
> so that **I can show it to friends and enjoy it again and again**.

## Context

Link to feature: [[features/first-run-intro]]

The intro is a work of art – too beautiful to show only once. Two access paths make it accessible: Command Palette for everyone, Easter Egg for discoverers.

**Priority: P2** – Nice-to-have after the core stories (POMO-170 to POMO-174).

**Dependency:** All other intro stories must be complete.

**Scope reduction:** Record Mode (format selection, outro screen) was removed – too complex for this phase. Can be implemented as a separate future story.

## Acceptance Criteria

### Command Palette

- [ ] **Given** I'm in the app, **When** I press `Cmd+K` → type "intro", **Then** I see "Replay intro" as an option
- [ ] **Given** I select "Replay intro", **When** I press Enter, **Then** the intro starts in an overlay
- [ ] **Given** the intro runs via replay, **When** it ends or I skip, **Then** I return to the app (no reload, no state loss)

### Easter Egg

- [ ] **Given** I'm in the app without focus in an input field, **When** I type "particle", **Then** the intro starts
- [ ] **Given** I'm in an input field, **When** I type "particle", **Then** nothing happens (normal text)
- [ ] **Given** I type "part" and wait 5s, **When** I then type "icle", **Then** nothing happens (buffer reset)

### Settings (Optional)

- [ ] **Given** I'm in settings, **When** I select "Replay intro", **Then** the intro will be shown next time

## Technical Details

### Affected Files

```
src/
├── components/
│   └── command-palette/
│       └── commands.ts        # Register new command
├── hooks/
│   └── useEasterEgg.ts        # NEW: Easter Egg listener
└── app/
    └── page.tsx               # Add replay state
```

### useEasterEgg Hook

```typescript
// src/hooks/useEasterEgg.ts
'use client';

import { useEffect, useRef } from 'react';

const EASTER_EGG = 'particle';
const BUFFER_TIMEOUT = 5000; // Reset after 5s inactivity

export function useEasterEgg(onTrigger: () => void) {
  const bufferRef = useRef('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if in Input/Textarea/ContentEditable
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return;
      }

      // Ignore if modifier key pressed
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      // Buffer timeout reset
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        bufferRef.current = '';
      }, BUFFER_TIMEOUT);

      // Only accept letters
      if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
        bufferRef.current += e.key.toLowerCase();
        bufferRef.current = bufferRef.current.slice(-EASTER_EGG.length);

        if (bufferRef.current === EASTER_EGG) {
          onTrigger();
          bufferRef.current = '';
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onTrigger]);
}
```

### Command Palette Integration

```typescript
// In commands.ts - add new command
{
  id: 'intro-replay',
  name: 'Replay intro',
  keywords: ['intro', 'replay', 'animation', 'start', 'again'],
  icon: Sparkles, // or Play
  action: () => {
    window.dispatchEvent(new CustomEvent('particle:replay-intro'));
  },
}
```

### Page Integration

```typescript
// In page.tsx - add replay logic
import { useEasterEgg } from '@/hooks/useEasterEgg';
import { resetIntro } from '@/hooks/useIntro';

function HomeContent() {
  // Existing intro state
  const { showIntro, phase, skip, markComplete } = useIntro();

  // Replay state (for manual replay)
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayPhase, setReplayPhase] = useState<IntroPhase>('silence');

  // Trigger replay
  const triggerReplay = useCallback(() => {
    setReplayPhase('silence');
    setIsReplaying(true);
  }, []);

  // Handle replay complete
  const handleReplayComplete = useCallback(() => {
    setIsReplaying(false);
  }, []);

  // Easter Egg
  useEasterEgg(triggerReplay);

  // Command Palette event listener
  useEffect(() => {
    const handleReplayEvent = () => triggerReplay();
    window.addEventListener('particle:replay-intro', handleReplayEvent);
    return () => window.removeEventListener('particle:replay-intro', handleReplayEvent);
  }, [triggerReplay]);

  return (
    <>
      {/* Normal first-run intro */}
      <AnimatePresence>
        {showIntro && (
          <IntroExperience
            phase={phase}
            onSkip={skip}
            onComplete={markComplete}
          />
        )}
      </AnimatePresence>

      {/* Replay intro (separate instance) */}
      <AnimatePresence>
        {isReplaying && (
          <IntroExperience
            phase={replayPhase}
            onSkip={() => setIsReplaying(false)}
            onComplete={handleReplayComplete}
          />
        )}
      </AnimatePresence>

      {/* Rest of app */}
    </>
  );
}
```

### Settings Integration (Optional)

```typescript
// In Settings - "Replay intro" button
<button
  onClick={() => {
    resetIntro(); // from useIntro.ts
    // Show feedback toast
  }}
>
  Replay intro
</button>
```

## User Flow

### Command Palette

```
User presses Cmd+K
    ↓
Types "intro"
    ↓
Selects "Replay intro"
    ↓
Intro starts in overlay
    ↓
Intro ends → Overlay disappears
    ↓
App is visible again (state preserved)
```

### Easter Egg

```
User types (without input focus):
p → a → r → t → i → c → l → e
    ↓
Intro starts immediately (surprise!)
    ↓
Intro ends → back to app
```

## Testing

### Manual Testing

- [ ] Command Palette shows "Replay intro"
- [ ] Replay starts intro correctly
- [ ] After replay: App state is preserved (timer status, etc.)
- [ ] Easter Egg works with "particle"
- [ ] Easter Egg ignores input fields
- [ ] Easter Egg resets buffer after 5s
- [ ] Skip during replay works

### Automated Tests

```typescript
describe('useEasterEgg', () => {
  it('triggers on "particle" sequence', () => {
    const onTrigger = jest.fn();
    renderHook(() => useEasterEgg(onTrigger));

    'particle'.split('').forEach((char) => {
      fireEvent.keyDown(document, { key: char });
    });

    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it('ignores input in text fields', () => {
    const onTrigger = jest.fn();
    renderHook(() => useEasterEgg(onTrigger));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    'particle'.split('').forEach((char) => {
      fireEvent.keyDown(input, { key: char });
    });

    expect(onTrigger).not.toHaveBeenCalled();
  });

  it('resets buffer after 5s inactivity', async () => {
    jest.useFakeTimers();
    const onTrigger = jest.fn();
    renderHook(() => useEasterEgg(onTrigger));

    'part'.split('').forEach((char) => {
      fireEvent.keyDown(document, { key: char });
    });

    jest.advanceTimersByTime(5000);

    'icle'.split('').forEach((char) => {
      fireEvent.keyDown(document, { key: char });
    });

    expect(onTrigger).not.toHaveBeenCalled();
  });
});
```

## Definition of Done

- [ ] Command Palette command registered
- [ ] `useEasterEgg` hook implemented
- [ ] Replay logic in page.tsx
- [ ] App state remains preserved after replay
- [ ] Easter Egg works and is undocumented
- [ ] Tests written & green
- [ ] Locally tested

## Future Enhancements (not in this story)

- **Record Mode:** Format selection (16:9, 9:16, 1:1), outro screen with logo + URL
- **Share:** Direct share to social media
- **Analytics:** Tracking of replay/Easter Egg usage

## Notes

- Easter Egg is **undocumented** – that's part of the magic
- Buffer timeout (5s) prevents accidental activation
- Replay uses separate state variable to not affect first-run intro

---

## Work Log

### Started:
<!-- Claude: Note what you're doing here -->

### Completed:
<!-- Will be auto-filled when story is moved to done/ -->
