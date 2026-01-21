---
type: story
status: backlog
priority: p0
effort: 2
feature: "[[features/keyboard-ux]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [keyboard, accessibility, modal, p0]
---

# POMO-076: Focus Trap für Modals

## User Story

> Als **Screen Reader User**
> möchte ich **dass der Fokus in offenen Modals gefangen bleibt**,
> damit **ich nicht aus Versehen dahinterliegende Elemente aktiviere**.

## Kontext

Link zum Feature: [[features/keyboard-ux]]

Wichtige Accessibility-Verbesserung. Sollte als erstes implementiert werden.

## Akzeptanzkriterien

- [ ] **Given** Modal offen, **When** Tab gedrückt, **Then** Fokus bleibt im Modal
- [ ] **Given** Modal offen, **When** Shift+Tab gedrückt, **Then** navigiert rückwärts im Modal
- [ ] **Given** Modal öffnet, **When** geladen, **Then** erster fokussierbarer Element erhält Fokus
- [ ] **Given** Modal offen, **When** Escape gedrückt, **Then** Modal schließt
- [ ] **Given** Modal schließt, **When** geschlossen, **Then** Fokus kehrt zum auslösenden Element zurück

## Technische Details

### Library Option
```bash
pnpm add focus-trap-react
```

### Mit focus-trap-react
```tsx
import FocusTrap from 'focus-trap-react';

const Modal = ({ isOpen, onClose, children }) => {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    triggerRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <FocusTrap>
      <div
        role="dialog"
        aria-modal="true"
        onKeyDown={(e) => e.key === 'Escape' && handleClose()}
      >
        {children}
      </div>
    </FocusTrap>
  );
};
```

### Custom Implementation (Alternative)
```typescript
const useFocusTrap = (ref: RefObject<HTMLElement>, isActive: boolean) => {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableElements[0] as HTMLElement;
    const lastEl = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl?.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl?.focus();
      }
    };

    ref.current.addEventListener('keydown', handleKeyDown);
    firstEl?.focus();

    return () => {
      ref.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);
};
```

## Testing

### Manuell zu testen
- [ ] Tab bleibt im Modal
- [ ] Shift+Tab navigiert rückwärts
- [ ] Erster Element fokussiert bei Open
- [ ] Fokus kehrt zurück bei Close

## Definition of Done

- [ ] Focus Trap implementiert
- [ ] Alle Modals nutzen es
- [ ] Return-Focus funktioniert
