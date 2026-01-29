---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/learn-section]]"
created: 2026-01-27
updated: 2026-01-28
done_date: null
tags: [content, learn, rhythms]
---

# POMO-162: Rhythm Content

## User Story

> As a **Particle user**
> I want **to understand what the three rhythms mean and where they come from**,
> so that **I can choose the right rhythm for my way of working**.

## Context

Link to feature: [[features/learn-section]]

The three rhythms are the heart of Particle. The explanations must be written in the Particle voice—poetic, concise, with storytelling. Not documentation, but a conversation with a wise mentor.

## Acceptance Criteria

- [ ] **Given** I'm in the Learn Panel, **When** I select "The Three Rhythms", **Then** I see explanations for all three rhythms
- [ ] **Given** I'm reading about a rhythm, **When** I click "Try this rhythm", **Then** that rhythm is activated and the panel closes
- [ ] **Given** a rhythm is already active, **When** I see it in the Learn Panel, **Then** it's marked as "Active"
- [ ] **Given** I'm in the rhythm view, **When** I press `←` or Backspace, **Then** I return to the menu

---

## Content (Final Copy)

### Intro

```
Every particle has its own rhythm.
Here are three that have helped people
do their best work.
```

---

### Classic · 25 minutes

```
The origin. Francesco Cirillo called it "Pomodoro"—
after his kitchen timer.

Short sprints. Frequent breaks.
Perfect when you're just starting—or when
the inner resistance feels strongest.
```

**Button:** `Try this rhythm` / `Active`

---

### Deep Work · 52 minutes

```
A DeskTime study found that the most productive
10% work for 52 minutes, then rest for 17.

Longer focus. Deeper work.
For projects that demand your full attention.
```

**Button:** `Try this rhythm` / `Active`

---

### 90-Min · 90 minutes

```
Your body follows a 90-minute rhythm.
Nathaniel Kleitman discovered it in the 1950s.

For flow states. For work that makes you
forget that time exists.
```

**Button:** `Try this rhythm` / `Active`

---

### Closing

```
There is no "right" or "wrong."
Only what works for you.
```

---

## Technical Details

### Affected Files
```
src/
├── components/
│   └── learn/
│       ├── LearnPanel.tsx        # Add view switching logic
│       ├── LearnMenu.tsx         # Handle navigation to content
│       ├── RhythmContent.tsx     # NEW: Rhythm explanations view
│       └── RhythmCard.tsx        # NEW: Individual rhythm card
├── lib/
│   └── content/
│       └── learn-content.ts      # NEW: Content as constants
```

### Implementation Notes
- Content as TypeScript constants (no CMS needed for MVP)
- `RhythmCard` receives current preset as prop
- "Try this rhythm" calls `setPreset()` and closes panel
- Use existing `PRESETS` from design-tokens for consistency

### Data Structure
```typescript
interface RhythmContent {
  id: 'classic' | 'deepWork' | 'ultradian';
  presetId: string;           // Maps to PRESETS key
  title: string;              // "Classic", "Deep Work", "90-Min"
  duration: string;           // "25 minutes", "52 minutes", "90 minutes"
  paragraphs: string[];       // The poetic content
}

const RHYTHM_CONTENT: RhythmContent[] = [
  {
    id: 'classic',
    presetId: 'classic',
    title: 'Classic',
    duration: '25 minutes',
    paragraphs: [
      'The origin. Francesco Cirillo called it "Pomodoro"—after his kitchen timer.',
      'Short sprints. Frequent breaks. Perfect when you\'re just starting—or when the inner resistance feels strongest.'
    ]
  },
  // ... etc
];
```

---

## UI/UX

### Layout

```
┌─────────────────────────────────────────┐
│  ← Back                             ✕   │
├─────────────────────────────────────────┤
│                                         │
│  The Three Rhythms                      │
│                                         │
│  Every particle has its own rhythm.     │
│  Here are three that have helped        │
│  people do their best work.             │
│                                         │
│  ───────────────────────────────────    │
│                                         │
│  ○ Classic · 25 minutes                 │
│                                         │
│    The origin. Francesco Cirillo        │
│    called it "Pomodoro"—after his       │
│    kitchen timer.                       │
│                                         │
│    Short sprints. Frequent breaks...    │
│                                         │
│                   [ Try this rhythm ]   │
│                                         │
│  ───────────────────────────────────    │
│                                         │
│  ● Deep Work · 52 minutes      Active   │
│                                         │
│    A DeskTime study found that the      │
│    most productive 10% work for 52...   │
│                                         │
│                          [ Active ]     │  ← Disabled, muted
│                                         │
│  ───────────────────────────────────    │
│                                         │
│  ○ 90-Min · 90 minutes                  │
│                                         │
│    Your body follows a 90-minute        │
│    rhythm. Nathaniel Kleitman...        │
│                                         │
│                   [ Try this rhythm ]   │
│                                         │
│  ───────────────────────────────────    │
│                                         │
│  There is no "right" or "wrong."        │
│  Only what works for you.               │
│                                         │
└─────────────────────────────────────────┘
```

### Behavior
- Click "Try this rhythm" → Switch preset, close panel
- "Active" button is disabled (muted styling)
- Radio indicator (○/●) shows current preset
- Back button returns to Learn Menu

### Back Navigation
```typescript
// In LearnPanel, track current view
const [view, setView] = useState<'menu' | 'rhythms' | 'breaks' | 'science'>('menu');

// Back button
<button onClick={() => setView('menu')}>
  <ArrowLeft className="w-4 h-4" />
  Back
</button>

// Keyboard handler (in RhythmContent)
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
      e.preventDefault();
      onBack();
    }
  }
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [onBack]);
```

---

## Styling

### Rhythm Card

```typescript
<div className={cn(
  "p-4 rounded-xl",
  "border border-tertiary/10 light:border-tertiary-dark/10",
  isActive && "bg-tertiary/5 light:bg-tertiary-dark/5"
)}>
  {/* Header with radio indicator */}
  <div className="flex items-center gap-3 mb-3">
    <div className={cn(
      "w-3 h-3 rounded-full border-2",
      isActive
        ? "border-primary light:border-primary-dark bg-primary light:bg-primary-dark"
        : "border-tertiary light:border-tertiary-dark"
    )} />
    <span className="font-medium text-primary light:text-primary-dark">
      {title}
    </span>
    <span className="text-tertiary light:text-tertiary-dark">
      · {duration}
    </span>
    {isActive && (
      <span className="ml-auto text-xs text-tertiary light:text-tertiary-dark">
        Active
      </span>
    )}
  </div>

  {/* Content */}
  <div className="text-sm text-secondary light:text-secondary-dark space-y-2 ml-6">
    {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
  </div>

  {/* Button */}
  <div className="mt-4 ml-6">
    <button
      onClick={onTry}
      disabled={isActive}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium",
        isActive
          ? "bg-tertiary/10 text-tertiary cursor-not-allowed"
          : "bg-primary text-background hover:bg-primary/90"
      )}
    >
      {isActive ? 'Active' : 'Try this rhythm'}
    </button>
  </div>
</div>
```

---

## Testing

### Manual Tests
- [ ] All three rhythms are displayed
- [ ] Active rhythm is visually marked
- [ ] "Try this rhythm" switches preset
- [ ] Panel closes after preset switch
- [ ] Back navigation works (button + keyboard)
- [ ] Content is readable and well-formatted
- [ ] Scrolling works on mobile

### Automated Tests
- [ ] Unit Test: RhythmCard shows correct active state
- [ ] Unit Test: Preset switch callback is called with correct preset
- [ ] Unit Test: Back navigation callback is called

---

## Definition of Done

- [ ] RhythmContent.tsx implemented
- [ ] RhythmCard.tsx implemented
- [ ] LearnPanel.tsx updated with view switching
- [ ] LearnMenu.tsx updated with navigation
- [ ] learn-content.ts with all rhythm content
- [ ] Content is final (Particle voice, English)
- [ ] Back navigation works (button + Backspace/←)
- [ ] Preset switch closes panel
- [ ] Tests written & passing
- [ ] Manually tested
- [ ] Mobile responsive

---

## Notes

### Content Philosophy
- **Short**: No walls of text—each rhythm is ~2-3 sentences
- **Story-driven**: Each rhythm has an origin story (Cirillo, DeskTime, Kleitman)
- **Non-judgmental**: No "better" or "worse"—just different approaches
- **Actionable**: Clear CTA to try the rhythm immediately

### Voice Guidelines (from BRAND.md)
- Speak like a wise, calm mentor
- Use short, clear sentences
- No buzzwords ("Boost", "Hack", "Supercharge")
- No gamification language
- Poetic but not kitsch

### Preset Mapping
| Content ID | Preset Key | Display Name |
|------------|------------|--------------|
| classic | classic | Classic |
| deepWork | deepWork | Deep Work |
| ultradian | ultradian | 90-Min |

---

## Work Log

### Started:
<!-- Claude: Note what you're doing here -->

### Completed:
<!-- Filled automatically when story moves to done/ -->
