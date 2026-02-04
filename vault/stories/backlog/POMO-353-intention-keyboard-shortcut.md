---
type: story
status: backlog
priority: p1
effort: 2
feature: daily-intentions
created: 2026-02-04
updated: 2026-02-04
done_date: null
tags: [intentions, keyboard, shortcuts, command-palette, breaking-change]
---

# POMO-353: Keyboard Shortcut `G I` for Intention

## User Story

> As a **keyboard-first Particle user**,
> I want **to press `G I` to set or edit my intention**,
> so that **I can manage my daily focus without touching the mouse**.

## Context

Link: [[features/daily-intentions]]

**Breaking Change:** This replaces `G O` (Daily Goal) with `G I` (Intention). The unified IntentionOverlay handles both intention text and particle count.

## Acceptance Criteria

### Shortcut: `G I`

- [ ] `G I` opens IntentionOverlay
- [ ] Works when timer is idle or running
- [ ] Does NOT work when modal is open or input is focused
- [ ] Replaces `G O` behavior

### Shortcut: `Shift+I`

- [ ] Clears today's intention
- [ ] Shows brief confirmation toast: "Intention cleared"
- [ ] Only works if intention exists

### Backwards Compatibility: `G O`

- [ ] `G O` still works but triggers `G I` behavior
- [ ] Shows deprecation hint in Help Modal: "G O → G I"
- [ ] Eventually remove in future version

### Command Palette

- [ ] "Set Intention" command added
- [ ] Shortcut shown: `G I`
- [ ] Keywords: intention, focus, today, goal, direction, planning
- [ ] "Clear Intention" command added (Shift+I)

### Help Modal

- [ ] Update shortcut from "G O · Daily Goal" to "G I · Intention"
- [ ] Add under Navigation category
- [ ] Remove or deprecate "Daily Goal" entry

### Event System

- [ ] `particle:open-intention` event opens IntentionOverlay
- [ ] `particle:clear-intention` event clears intention
- [ ] `particle:open-goal` redirects to `particle:open-intention` (backwards compat)

## Technical Details

### Files to Modify

```
src/hooks/useGPrefixNavigation.ts      # Add G I, redirect G O
src/components/command/CommandRegistration.tsx  # Update commands
src/components/help/HelpModal.tsx      # Update shortcut docs
src/app/page.tsx                       # Event listeners
```

### G-Prefix Navigation Update

```typescript
// In useGPrefixNavigation.ts

const G_PREFIX_SHORTCUTS: Record<string, () => void> = {
  // ... existing shortcuts ...

  // NEW: Intention
  'i': () => window.dispatchEvent(new CustomEvent('particle:open-intention')),

  // DEPRECATED: Goal → redirects to Intention
  'o': () => window.dispatchEvent(new CustomEvent('particle:open-intention')),
};
```

### Command Registration

```typescript
// In CommandRegistration.tsx

{
  id: 'set-intention',
  label: 'Set Intention',
  shortcut: 'G I',
  category: 'navigation',
  action: () => {
    window.dispatchEvent(new CustomEvent('particle:open-intention'));
  },
  icon: <Target className="w-4 h-4" />,
  keywords: ['intention', 'focus', 'today', 'goal', 'direction', 'planning', 'morning'],
},
{
  id: 'clear-intention',
  label: 'Clear Intention',
  shortcut: '⇧I',
  category: 'navigation',
  action: () => {
    window.dispatchEvent(new CustomEvent('particle:clear-intention'));
  },
  icon: <X className="w-4 h-4" />,
  keywords: ['intention', 'clear', 'remove', 'reset'],
},

// Remove or mark as deprecated:
// {
//   id: 'set-daily-goal',
//   label: 'Set Daily Goal',  // → DEPRECATED
//   ...
// },
```

### Event Listeners in page.tsx

```typescript
// In page.tsx

useEffect(() => {
  function handleOpenIntention() {
    setShowIntentionOverlay(true);
  }

  function handleClearIntention() {
    clearIntention();
    window.dispatchEvent(new CustomEvent('particle:status-message', {
      detail: { message: 'Intention cleared' }
    }));
  }

  window.addEventListener('particle:open-intention', handleOpenIntention);
  window.addEventListener('particle:clear-intention', handleClearIntention);

  // Backwards compat: G O → G I
  window.addEventListener('particle:open-goal', handleOpenIntention);

  return () => {
    window.removeEventListener('particle:open-intention', handleOpenIntention);
    window.removeEventListener('particle:clear-intention', handleClearIntention);
    window.removeEventListener('particle:open-goal', handleOpenIntention);
  };
}, [clearIntention]);
```

### Help Modal Update

```typescript
// In shortcut definitions

// Before:
{ key: 'G O', description: 'Daily Goal' }

// After:
{ key: 'G I', description: 'Set Intention' }
{ key: 'G O', description: 'Set Intention (legacy)', deprecated: true }  // Optional
```

## Testing

- [ ] `G I` opens IntentionOverlay
- [ ] `G O` still works (backwards compat)
- [ ] `Shift+I` clears intention
- [ ] `Shift+I` shows toast
- [ ] `Shift+I` disabled when no intention
- [ ] Command palette shows "Set Intention" with `G I`
- [ ] Help modal updated
- [ ] Shortcuts don't fire when input focused
- [ ] Shortcuts don't fire when modal open

## Definition of Done

- [ ] `G I` shortcut working
- [ ] `G O` redirects to `G I` (backwards compat)
- [ ] `Shift+I` shortcut working
- [ ] Command palette updated
- [ ] Help modal updated
- [ ] Toast feedback for clear
- [ ] No conflicts with other shortcuts
- [ ] Breaking change documented

## Dependencies

- POMO-350 (Intention data model) ✓ Complete
- POMO-351 (IntentionOverlay) — Target for G I

## Breaking Changes

| Before | After | Notes |
|--------|-------|-------|
| `G O` | `G I` | `G O` still works but deprecated |
| "Daily Goal" | "Intention" | Terminology change |
| Separate commands | Unified command | One command for planning |

Document in CHANGELOG under "Changed" section.
