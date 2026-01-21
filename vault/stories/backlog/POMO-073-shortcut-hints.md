---
type: story
status: backlog
priority: p0
effort: 2
feature: "[[features/keyboard-ux]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [keyboard, hints, ui, p0]
---

# POMO-073: Shortcut Hints im UI

## User Story

> Als **neuer User**
> möchte ich **Shortcuts direkt im UI neben den Buttons sehen**,
> damit **ich sie schnell lernen kann ohne ein Help-Modal öffnen zu müssen**.

## Kontext

Link zum Feature: [[features/keyboard-ux]]

Dezente Shortcut-Anzeige neben Buttons für bessere Discoverability.

## Akzeptanzkriterien

- [ ] **Given** Button mit Shortcut, **When** gerendert, **Then** Shortcut neben/unter Button
- [ ] **Given** Darstellung, **When** angezeigt, **Then** dezent, kleinere graue Schrift
- [ ] **Given** Mac User, **When** angezeigt, **Then** Format: ⌘K
- [ ] **Given** Windows User, **When** angezeigt, **Then** Format: Ctrl+K
- [ ] **Given** Setting, **When** "Show keyboard hints" off, **Then** keine Hints
- [ ] **Given** Tooltip, **When** angezeigt, **Then** enthält auch Shortcut

## Technische Details

### Button Komponente erweitern
```tsx
interface ButtonProps {
  shortcut?: string;
  showShortcutHint?: boolean;
}

const Button = ({ shortcut, showShortcutHint = true, children, ...props }) => (
  <button {...props}>
    {children}
    {shortcut && showShortcutHint && settings.showKeyboardHints && (
      <kbd className="ml-2 text-xs text-muted opacity-60">
        {formatShortcut(shortcut)}
      </kbd>
    )}
  </button>
);
```

### Platform Detection
```typescript
const isMac = typeof navigator !== 'undefined' &&
  navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const formatShortcut = (shortcut: string) => {
  if (isMac) {
    return shortcut
      .replace('Cmd', '⌘')
      .replace('Alt', '⌥')
      .replace('Shift', '⇧')
      .replace('Ctrl', '⌃');
  }
  return shortcut.replace('Cmd', 'Ctrl');
};
```

### Settings Option
```typescript
interface Settings {
  showKeyboardHints: boolean; // default: true
}
```

## Testing

### Manuell zu testen
- [ ] Hints neben Buttons
- [ ] Mac-Format korrekt
- [ ] Windows-Format korrekt
- [ ] Setting zum Deaktivieren

## Definition of Done

- [ ] Button erweitert
- [ ] Platform Detection
- [ ] Settings Option
- [ ] Tooltips updated
