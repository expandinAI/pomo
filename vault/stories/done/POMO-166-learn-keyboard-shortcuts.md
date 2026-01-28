---
type: story
status: active
priority: p1
effort: 1
feature: "[[features/learn-section]]"
created: 2026-01-27
updated: 2026-01-28
done_date: null
tags: [keyboard, learn, shortcuts]
---

# POMO-166: Learn Keyboard Shortcuts

## User Story

> Als **Keyboard-Power-User**
> möchte ich **das Learn Panel und seine Inhalte komplett per Tastatur bedienen können**,
> damit **ich nicht zur Maus greifen muss**.

## Kontext

Particle ist keyboard-first. Das Learn Panel muss vollständig per Tastatur navigierbar sein.

## Status-Check

### Bereits implementiert ✅
- `L` öffnet/schließt Panel (page.tsx)
- `Esc` schließt Panel (LearnPanel.tsx)
- `←`/`Backspace` zurück in Rhythms-View (RhythmContent.tsx)
- Focus Trap (LearnPanel.tsx)

### Noch zu implementieren ❌
1. **LearnMenu.tsx**: `↑`/`↓`/`J`/`K` Navigation + `Enter` zum Öffnen
2. **RhythmContent.tsx**: `1`/`2`/`3` zum Rhythmus-Wechsel
3. **LearnPanel.tsx**: `←`/`Backspace` auch für breaks/science Views
4. **LearnPanel.tsx**: Kontextuelle Footer-Hints

---

## Implementation Plan

### 1. LearnMenu.tsx - Keyboard Navigation

```typescript
interface LearnMenuProps {
  onNavigate: (view: LearnView) => void;
}

// Add state for focused index
const [focusedIndex, setFocusedIndex] = useState(0);

// Keyboard handler
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
      case 'j':
        e.preventDefault();
        setFocusedIndex(i => Math.min(i + 1, MENU_ITEMS.length - 1));
        break;
      case 'ArrowUp':
      case 'k':
        e.preventDefault();
        setFocusedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        onNavigate(MENU_ITEMS[focusedIndex].id);
        break;
    }
  }
  window.addEventListener('keydown', handleKeyDown, true);
  return () => window.removeEventListener('keydown', handleKeyDown, true);
}, [focusedIndex, onNavigate]);
```

Visual: Fokussierter Menüpunkt mit Ring/Border hervorheben.

### 2. RhythmContent.tsx - Number Keys

```typescript
// Add to existing keyboard handler
case '1':
  e.preventDefault();
  onPresetChange('classic');
  break;
case '2':
  e.preventDefault();
  onPresetChange('deepWork');
  break;
case '3':
  e.preventDefault();
  onPresetChange('ultradian');
  break;
```

### 3. LearnPanel.tsx - Back Navigation für alle Views

```typescript
// Add Backspace/ArrowLeft handler for non-menu views
useEffect(() => {
  if (view === 'menu') return;

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopImmediatePropagation();
      setView('menu');
    }
  }
  window.addEventListener('keydown', handleKeyDown, true);
  return () => window.removeEventListener('keydown', handleKeyDown, true);
}, [view]);
```

### 4. Footer Hints

```typescript
const FOOTER_HINTS: Record<LearnView, string> = {
  menu: '↑↓ navigate · Enter select · L close',
  rhythms: '1/2/3 select · ← back · L close',
  breaks: '← back · L close',
  science: '← back · L close',
};
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/learn/LearnMenu.tsx` | Add keyboard navigation with focusedIndex state |
| `src/components/learn/RhythmContent.tsx` | Add 1/2/3 key handlers |
| `src/components/learn/LearnPanel.tsx` | Add back navigation + footer hints |

---

## Verification

1. Open Learn Panel with `L`
2. Press `↓` or `J` → Focus moves to next menu item
3. Press `↑` or `K` → Focus moves to previous menu item
4. Press `Enter` → Opens focused menu item
5. In Rhythms view, press `1` → Classic rhythm activates
6. Press `2` → Deep Work activates
7. Press `3` → Ultradian activates
8. Press `←` or `Backspace` → Back to menu
9. Footer hints update per view

---

## Definition of Done

- [ ] LearnMenu keyboard navigation works
- [ ] Number keys switch rhythms
- [ ] Back navigation works in all views
- [ ] Footer hints are contextual
- [ ] TypeScript check passes
- [ ] Build succeeds
