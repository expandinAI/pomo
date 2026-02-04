---
type: story
status: backlog
priority: p1
effort: 1
feature: daily-intentions
created: 2026-02-04
updated: 2026-02-04
done_date: null
tags: [intentions, keyboard, shortcuts, command-palette]
---

# POMO-353: Keyboard Shortcut `I` for Intention

## User Story

> As a **keyboard-first Particle user**,
> I want **to press `I` to set or edit my intention**,
> so that **I can manage my daily focus without touching the mouse**.

## Context

Link: [[features/daily-intentions]]

Keyboard-first is a core Particle principle. `I` for Intention — simple, memorable.

## Acceptance Criteria

### Shortcut: `I`

- [ ] `I` opens intention ritual/editor
- [ ] If no intention today → Opens morning ritual (Phase 2: Question)
- [ ] If intention exists → Opens edit mode (simple input overlay)
- [ ] Works when timer is idle or running
- [ ] Does NOT work when modal is open or input is focused

### Shortcut: `Shift+I`

- [ ] Clears today's intention
- [ ] Shows brief confirmation toast: "Intention cleared"
- [ ] Only works if intention exists

### Command Palette

- [ ] "Set Intention" command added
- [ ] Shortcut shown: `I`
- [ ] Keywords: intention, focus, today, goal, direction

### Event System

- [ ] `particle:open-intention` event opens ritual/editor
- [ ] `particle:clear-intention` event clears intention

## Technical Details

### Files to Modify

```
src/components/command/CommandRegistration.tsx  # Add intention commands
src/app/page.tsx                                 # Add event listeners
src/hooks/useKeyboardShortcuts.ts               # Add I shortcut (if not in CommandRegistration)
```

### Command Registration

```typescript
// In CommandRegistration.tsx

// Add to commands array:
{
  id: 'set-intention',
  label: 'Set Intention',
  shortcut: 'I',
  category: 'navigation',
  action: () => {
    window.dispatchEvent(new CustomEvent('particle:open-intention'));
  },
  icon: <Target className="w-4 h-4" />,  // or Compass icon
  keywords: ['intention', 'focus', 'today', 'goal', 'direction', 'morning'],
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
  disabled: () => !todayIntention,  // Only enabled if intention exists
},
```

### Event Listeners in page.tsx

```typescript
// In page.tsx

// Listen for intention events
useEffect(() => {
  function handleOpenIntention() {
    if (todayIntention) {
      // Edit mode - show simple overlay
      setShowIntentionEdit(true);
    } else {
      // No intention - show full ritual (starting at Phase 2)
      setShowIntentionRitual(true);
    }
  }

  function handleClearIntention() {
    clearIntention();
    // Show toast
    window.dispatchEvent(new CustomEvent('particle:show-toast', {
      detail: { message: 'Intention cleared' }
    }));
  }

  window.addEventListener('particle:open-intention', handleOpenIntention);
  window.addEventListener('particle:clear-intention', handleClearIntention);

  return () => {
    window.removeEventListener('particle:open-intention', handleOpenIntention);
    window.removeEventListener('particle:clear-intention', handleClearIntention);
  };
}, [todayIntention, clearIntention]);
```

### Simple Edit Overlay

When intention exists and user presses `I`, show a minimal edit overlay:

```typescript
// IntentionEditOverlay.tsx (simplified version of ritual)

interface IntentionEditOverlayProps {
  currentIntention: string;
  onSave: (text: string) => void;
  onClose: () => void;
}

export function IntentionEditOverlay({ currentIntention, onSave, onClose }: IntentionEditOverlayProps) {
  const [text, setText] = useState(currentIntention);

  const handleSubmit = () => {
    if (text.trim()) {
      onSave(text.trim());
    }
    onClose();
  };

  return (
    <motion.div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50">
      <div className="text-center">
        <p className="text-secondary mb-4">What matters today?</p>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') onClose();
          }}
          className="bg-transparent border-b border-tertiary/30 text-primary text-xl text-center w-80 py-2 focus:outline-none focus:border-primary"
          autoFocus
        />
        <p className="text-tertiary text-xs mt-4">↵ Save · Esc Cancel</p>
      </div>
    </motion.div>
  );
}
```

## Testing

- [ ] `I` opens ritual when no intention
- [ ] `I` opens edit when intention exists
- [ ] `Shift+I` clears intention
- [ ] `Shift+I` shows toast
- [ ] `Shift+I` disabled when no intention
- [ ] Command palette shows "Set Intention"
- [ ] Shortcut doesn't fire when input focused
- [ ] Shortcut doesn't fire when modal open

## Definition of Done

- [ ] `I` shortcut working
- [ ] `Shift+I` shortcut working
- [ ] Command palette integration
- [ ] Edit overlay for existing intentions
- [ ] Toast feedback for clear
- [ ] No conflicts with other shortcuts

## Dependencies

- POMO-350 (Intention data model)
- POMO-351 (Morning ritual) — for opening ritual
