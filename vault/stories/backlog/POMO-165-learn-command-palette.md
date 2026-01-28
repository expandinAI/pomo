---
type: story
status: backlog
priority: p2
effort: 2
feature: "[[features/learn-section]]"
created: 2026-01-27
updated: 2026-01-28
done_date: null
tags: [command-palette, learn, keyboard]
---

# POMO-165: Learn Command Palette Integration

## User Story

> As a **keyboard-first user**,
> I want to **access Learn content through the Command Palette**,
> so that **I can quickly find rhythm explanations without reaching for the mouse**.

## Context

The Command Palette (`⌘K`) is the central access point for everything in Particle. Learn content must be discoverable there – both for opening the Learn Panel and for quick rhythm info.

**Dependency:** Requires POMO-161 (Learn Panel UI) to be implemented first.

---

## Acceptance Criteria

- [ ] **Given** I open Command Palette, **When** I type "learn", **Then** I see Learn commands
- [ ] **Given** I search for "52/17" or "deep work", **When** I select the result, **Then** the Learn Panel opens with rhythm explanation
- [ ] **Given** I search for "rhythm" or "preset", **Then** I see both "Switch to..." (presets) and "Learn about..." (learn) commands grouped separately

---

## New Commands

| ID | Label | Keywords | Action |
|----|-------|----------|--------|
| `learn-open` | Open Learn | learn, understand, help, guide, why | Open Learn Panel |
| `learn-rhythms` | Learn: The Three Rhythms | rhythms, modes, presets, 25, 52, 90 | Learn Panel → Rhythms section |
| `learn-classic` | Learn: Classic (25/5) | classic, pomodoro, 25, traditional | Learn Panel → Classic explanation |
| `learn-deepwork` | Learn: Deep Work (52/17) | deep, work, 52, 17, desktime | Learn Panel → Deep Work explanation |
| `learn-ultradian` | Learn: 90-Min Block | ultradian, 90, kleitman, long | Learn Panel → Ultradian explanation |

**Note:** The "Switch to..." preset commands already exist. Learn commands are **additional**, not replacements.

---

## Technical Implementation

### 1. Extend CommandCategory Type

```typescript
// src/lib/commandRegistry.ts
export type CommandCategory =
  | 'timer'
  | 'navigation'
  | 'settings'
  | 'presets'
  | 'projects'
  | 'learn';  // NEW
```

### 2. Update Category Labels & Order

```typescript
// src/components/command/CommandList.tsx
const CATEGORY_LABELS: Record<CommandCategory, string> = {
  timer: 'Timer',
  presets: 'Presets',
  navigation: 'Navigation',
  settings: 'Settings',
  projects: 'Projects',
  learn: 'Learn',  // NEW
};

const CATEGORY_ORDER: CommandCategory[] = [
  'timer',
  'presets',
  'projects',
  'navigation',
  'learn',    // NEW - before settings
  'settings',
];
```

### 3. Register Learn Commands

```typescript
// src/components/command/CommandRegistration.tsx
import { BookOpen } from 'lucide-react';

// Add to commands array:
{
  id: 'learn-open',
  label: 'Open Learn',
  shortcut: 'L',
  category: 'learn',
  action: () => {
    window.dispatchEvent(new CustomEvent('particle:open-learn'));
  },
  icon: <BookOpen className="w-4 h-4" />,
  keywords: ['learn', 'understand', 'help', 'guide', 'why', 'explain'],
},
{
  id: 'learn-rhythms',
  label: 'Learn: The Three Rhythms',
  category: 'learn',
  action: () => {
    window.dispatchEvent(new CustomEvent('particle:open-learn', {
      detail: { section: 'rhythms' }
    }));
  },
  icon: <BookOpen className="w-4 h-4" />,
  keywords: ['rhythms', 'modes', 'presets', '25', '52', '90', 'three'],
},
{
  id: 'learn-classic',
  label: 'Learn: Classic (25/5)',
  category: 'learn',
  action: () => {
    window.dispatchEvent(new CustomEvent('particle:open-learn', {
      detail: { section: 'classic' }
    }));
  },
  icon: <BookOpen className="w-4 h-4" />,
  keywords: ['classic', 'pomodoro', '25', 'traditional', 'cirillo'],
},
{
  id: 'learn-deepwork',
  label: 'Learn: Deep Work (52/17)',
  category: 'learn',
  action: () => {
    window.dispatchEvent(new CustomEvent('particle:open-learn', {
      detail: { section: 'deepwork' }
    }));
  },
  icon: <BookOpen className="w-4 h-4" />,
  keywords: ['deep', 'work', '52', '17', 'desktime', 'productive'],
},
{
  id: 'learn-ultradian',
  label: 'Learn: 90-Min Block',
  category: 'learn',
  action: () => {
    window.dispatchEvent(new CustomEvent('particle:open-learn', {
      detail: { section: 'ultradian' }
    }));
  },
  icon: <BookOpen className="w-4 h-4" />,
  keywords: ['ultradian', '90', 'kleitman', 'long', 'block', 'natural'],
},
```

---

## Files to Change

| File | Change |
|------|--------|
| `src/lib/commandRegistry.ts` | Add `'learn'` to `CommandCategory` type |
| `src/components/command/CommandList.tsx` | Add to `CATEGORY_LABELS` and `CATEGORY_ORDER` |
| `src/components/command/CommandRegistration.tsx` | Add Learn commands with `BookOpen` icon |

---

## UI Behavior

### Search Results Grouping

When searching "rhythm":

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 "rhythm"                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PRESETS                                                    │
│  ├─ Switch to Classic (25/5)                            1  │
│  ├─ Switch to Deep Work (52/17)                         2  │
│  └─ Switch to 90-Min Block                              3  │
│                                                             │
│  LEARN                                                      │
│  ├─ Learn: The Three Rhythms                            L  │
│  ├─ Learn: Classic (25/5)                                  │
│  ├─ Learn: Deep Work (52/17)                               │
│  └─ Learn: 90-Min Block                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key distinction:**
- "Switch to..." = Changes the active preset immediately
- "Learn:..." = Opens Learn Panel with explanation

---

## Event Contract

The Learn Panel (POMO-161) must listen for:

```typescript
window.addEventListener('particle:open-learn', (e: CustomEvent) => {
  const section = e.detail?.section; // undefined | 'rhythms' | 'classic' | 'deepwork' | 'ultradian'
  openLearnPanel(section);
});
```

---

## Testing

### Manual Tests

- [ ] Type "learn" → Shows all Learn commands
- [ ] Type "52" → Shows "Switch to Deep Work" AND "Learn: Deep Work"
- [ ] Select "Learn: Deep Work" → Learn Panel opens with Deep Work section
- [ ] Press `L` directly → Learn Panel opens (shortcut)
- [ ] Learn category appears after Navigation, before Settings

### Edge Cases

- [ ] Search with no results still shows "No commands found"
- [ ] Learn commands work when timer is running (no disable logic)

---

## Definition of Done

- [ ] CommandCategory type extended
- [ ] CATEGORY_LABELS and CATEGORY_ORDER updated
- [ ] 5 Learn commands registered
- [ ] Fuzzy search finds rhythm keywords
- [ ] Commands dispatch correct events
- [ ] TypeScript passes
- [ ] Tested manually with mock event listener

---

## Notes

- Icon: `BookOpen` from Lucide (consistent, simple)
- Shortcut `L` only on "Open Learn" (not on sub-commands)
- Learn commands never disabled (always available)
- Event listener for `particle:open-learn` will be implemented in POMO-161

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
