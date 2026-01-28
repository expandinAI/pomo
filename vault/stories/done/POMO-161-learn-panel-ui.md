---
type: story
status: done
priority: p1
effort: 5
feature: "[[features/learn-section]]"
created: 2026-01-27
updated: 2026-01-28
done_date: 2026-01-28
tags: [ui, learn, panel]
---

# POMO-161: Learn Panel UI

## User Story

> As a **Particle user**
> I want **a calm space where I can learn more about focused work**,
> so that **I understand how to use Particle optimally for my needs**.

## Context

Link to feature: [[features/learn-section]]

The Learn Section is the central place for knowledge about focused work and the three rhythms. The panel must seamlessly integrate with the Particle aesthetic—minimalist, keyboard-first, unobtrusive.

## Acceptance Criteria

- [x] **Given** I'm on the timer page, **When** I press `L`, **Then** the Learn Panel opens from the right
- [x] **Given** the Learn Panel is open, **When** I press `Esc` or `L`, **Then** the panel closes
- [x] **Given** the Learn Panel is open, **When** I click outside the panel, **Then** the panel closes
- [x] **Given** I'm on mobile (<640px), **When** the Learn Panel opens, **Then** it's fullscreen
- [x] **Given** the panel is open, **When** I navigate with the keyboard, **Then** I can tab through menu items
- [x] **Given** I click the Learn button in the bottom-right corner, **Then** the panel opens

## Technical Details

### Affected Files
```
src/
├── components/
│   └── learn/
│       ├── LearnPanel.tsx        # Main container (Slide-In Panel)
│       ├── LearnMenu.tsx         # Menu with topics
│       └── index.ts              # Barrel export
├── hooks/
│   └── useGPrefixNavigation.ts   # Added G+L shortcut
├── components/ui/
│   └── CornerControls.tsx        # Learn button integrated here
└── app/
    └── page.tsx                  # State + Event listeners
```

### Integration in BottomRightControls

The Learn button is part of the existing `BottomRightControls` component:

```
Bottom-right Layout: [L] [D] [⚙]
                      │   │   └── Settings
                      │   └────── Night Mode (Day/Night Toggle)
                      └────────── Learn
```

**Why here?**
- Learn is a meta-function (like Settings), not daily navigation
- Semantically: "Learn" belongs with "Settings" (System controls)
- Apple convention: Help/Info in bottom-right

### State Management

```typescript
// In page.tsx
const [showLearn, setShowLearn] = useState(false);

// Event listener for Command Palette integration
useEffect(() => {
  function handleOpenLearn() {
    setShowLearn(true);
  }
  window.addEventListener('particle:open-learn', handleOpenLearn);
  return () => window.removeEventListener('particle:open-learn', handleOpenLearn);
}, []);
```

### Keyboard Handlers

```typescript
// Global L key (in page.tsx)
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }
    if (e.key === 'l' || e.key === 'L') {
      e.preventDefault();
      setShowLearn(prev => !prev);
    }
  }
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Animation (Framer Motion)

```typescript
// Slide-in from right
const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 35,
      stiffness: 600
    }
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.2 }
  }
};
```

### Z-Index Hierarchy

| Layer | Z-Index | Component |
|-------|---------|-----------|
| Timer | 0 | Base |
| Learn Panel | 50 | Above Timer |
| Command Palette | 60 | Above everything except Toasts |
| Toasts | 70 | Top layer |

## UI/UX

### Panel Layout

```
┌─────────────────────────────────────────┐
│  Learn                              ✕   │  ← Header with Close button
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  📚  The Three Rhythms            │  │  ← Menu item (clickable)
│  │      Everyone works differently   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🧠  Why Breaks Matter            │  │
│  │      Your brain needs space       │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🔬  The Science                  │  │
│  │      Focus isn't magic            │  │
│  └───────────────────────────────────┘  │
│                                         │
│                                         │
│  ─────────────────────────────────────  │
│  Keyboard: L                            │  ← Footer hint
└─────────────────────────────────────────┘
```

### Learn Button in CornerControls

```typescript
// Extended BottomRightControls
export function BottomRightControls({
  onOpenLearn,
  onToggleNightMode,
  onOpenSettings,
  nightModeEnabled,
}: BottomRightControlsProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Learn Button */}
      <CornerButton
        onClick={onOpenLearn}
        label="Open learn section"
        tooltip="Learn · L"
      >
        <BookOpen className="w-4 h-4" />
      </CornerButton>

      {/* Night Mode Toggle */}
      <motion.button ... />

      {/* Settings */}
      <CornerButton ... />
    </div>
  );
}
```

**Icon:** `BookOpen` from Lucide (not `HelpCircle` – "Learn" ≠ "Help")

### Backdrop

```typescript
// Click outside closes panel
<AnimatePresence>
  {showLearn && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 z-40"
        onClick={() => setShowLearn(false)}
      />
      {/* Panel */}
      <LearnPanel onClose={() => setShowLearn(false)} />
    </>
  )}
</AnimatePresence>
```

## Styling

```typescript
// LearnPanel.tsx
<motion.div
  variants={panelVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
  className={cn(
    "fixed right-0 top-0 bottom-0 z-50",
    "w-[400px] max-w-full",
    "bg-surface light:bg-surface-dark",
    "border-l border-tertiary/10 light:border-tertiary-dark/10",
    "shadow-xl",
    "flex flex-col",
    // Mobile: Fullscreen
    "sm:w-[400px]",
    "max-sm:w-full max-sm:border-l-0"
  )}
>
```

### Focus Management

```typescript
// Focus Trap + Initial Focus
const panelRef = useRef<HTMLDivElement>(null);
useFocusTrap(panelRef, isOpen, { initialFocusRef: panelRef });

// Panel Container
<motion.div
  ref={panelRef}
  tabIndex={-1}
  role="dialog"
  aria-modal="true"
  aria-labelledby="learn-title"
  className="... focus:outline-none"
>
```

## Testing

### Manual Tests
- [x] `L` opens/closes panel
- [x] `Esc` closes panel
- [x] Click on backdrop closes panel
- [x] Click on Learn button opens panel
- [x] Mobile (<640px): Panel is fullscreen
- [x] Animation is smooth (spring-based)
- [x] Focus trap works (Tab stays in panel)
- [x] Keyboard events are isolated (Space/Esc don't trigger Timer)

### Automated Tests
- [ ] Unit Test: Keyboard handler (`L` toggle, `Esc` close)
- [ ] Unit Test: Focus management
- [ ] E2E Test: Panel open/close via button and keyboard

## Definition of Done

- [x] LearnPanel.tsx implemented
- [x] LearnMenu.tsx with 3 topic items
- [x] CornerControls.tsx extended (Learn button)
- [x] page.tsx: State + Event listeners
- [x] Keyboard isolation (events don't leak to Timer)
- [x] Focus trap works
- [x] Mobile responsive (fullscreen <640px)
- [ ] Tests written & passing
- [x] Manually tested
- [x] Keyboard accessibility verified

## Notes

- **Title:** "Learn" – fits the Particle voice
- **Icon:** `BookOpen` – conveys knowledge, not helplessness
- **Animation:** Spring-based for organic feel
- **Scope of this story:** Only Panel UI and trigger, NO content (see POMO-162)

---

## Work Log

### Started: 2026-01-28

Implemented Learn Panel UI:
- Created `src/components/learn/LearnMenu.tsx` with 3 menu items
- Created `src/components/learn/LearnPanel.tsx` with slide-in animation
- Created `src/components/learn/index.ts` barrel export
- Extended `src/components/ui/CornerControls.tsx` with Learn button
- Updated `src/app/page.tsx` with state, L key handler, event listener
- Updated `src/hooks/useGPrefixNavigation.ts` with G+L shortcut

### Completed: 2026-01-28

All acceptance criteria met. Panel opens/closes correctly via:
- L key (toggle)
- G+L shortcut (open)
- Escape key (close)
- Backdrop click (close)
- X button (close)
- Learn button in corner controls (open)

Translated all UI text to English for v1 release.
